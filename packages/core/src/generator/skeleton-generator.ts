import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname, basename, extname, join } from 'path'
import { parseComponent } from '../parser/babel-parser.js'
import { extractJsxTree } from '../parser/jsx-extractor.js'
import { resolveImports } from '../parser/import-resolver.js'
import { mapJsxNodeToSkeleton, type ComponentResolver } from '../transformer/element-mapper.js'
import { normalizeRepeat } from '../transformer/control-flow.js'
import { buildComponentMap } from '../transformer/component-map.js'
import { formatCode } from './prettier-format.js'
import type { SkeletonNode, SkelixConfig, ComponentMapEntry } from '../ir/types.js'

export interface GenerateOptions {
  adapter: string
  outputDir?: string | null
  naming?: 'suffix' | 'dot'
  repeatCount?: number
  config?: Partial<SkelixConfig>
  cwd?: string
  adapterComponentMap?: Record<string, ComponentMapEntry>
}

/**
 * Build a ComponentResolver that recursively parses local component files
 * and inlines their skeleton structure.
 * visited guards against circular import cycles.
 */
function buildComponentResolver(
  importMap: Map<string, string>,
  componentMap: Record<string, ComponentMapEntry>,
  repeatCount: number,
  visited: Set<string>
): ComponentResolver {
  return (tag: string): SkeletonNode | null => {
    const filePath = importMap.get(tag)
    if (!filePath || visited.has(filePath)) return null
    try {
      const source = readFileSync(filePath, 'utf-8')
      const ast = parseComponent(source)
      const { tree } = extractJsxTree(ast)
      if (!tree) return null
      const childImportMap = resolveImports(ast, filePath)
      const nextVisited = new Set(visited).add(filePath)
      const childResolver = buildComponentResolver(childImportMap, componentMap, repeatCount, nextVisited)
      return mapJsxNodeToSkeleton(tree, componentMap, repeatCount, childResolver)
    } catch {
      return null
    }
  }
}

function deriveSkeletonFileName(
  sourceFile: string,
  naming: 'suffix' | 'dot'
): string {
  const base = basename(sourceFile, extname(sourceFile))
  return naming === 'dot' ? `${base}.skeleton.tsx` : `${base}Skeleton.tsx`
}

/** Prefer the AST component name; fall back to PascalCase of filename */
function deriveComponentName(
  componentName: string | null,
  sourceFilePath: string
): string {
  if (componentName) return `${componentName}Skeleton`
  const base = basename(sourceFilePath, extname(sourceFilePath))
  const pascalBase = base.replace(/(^|[-_])(.)/g, (_, __, c: string) => c.toUpperCase())
  return `${pascalBase}Skeleton`
}

/** Detect if the IR is an empty/wrapper-only skeleton with no visual content */
function isEmptySkeleton(node: SkeletonNode): boolean {
  if (node.type !== 'container') return false
  if (node.children.length === 0) return true
  return node.children.every(c => isEmptySkeleton(c))
}

function assembleComponent(
  componentName: string,
  imports: string[],
  jsxBody: string
): string {
  const importBlock = imports.join('\n')
  return `${importBlock}${importBlock ? '\n\n' : ''}export function ${componentName}() {
  return (
    ${jsxBody}
  )
}
`
}

export async function generateSkeleton(
  sourceFilePath: string,
  options: GenerateOptions
): Promise<string> {
  const absSource = resolve(sourceFilePath)
  const source = readFileSync(absSource, 'utf-8')

  const ast = parseComponent(source)
  const { tree: jsxTree } = extractJsxTree(ast)
  if (!jsxTree) {
    throw new Error(`Could not find a JSX return in ${sourceFilePath}`)
  }

  const componentMap = buildComponentMap(options.config, options.adapterComponentMap)
  const repeatCount = options.repeatCount ?? options.config?.repeatCount ?? 3
  const importMap = resolveImports(ast, absSource)
  const resolver = buildComponentResolver(importMap, componentMap, repeatCount, new Set([absSource]))

  let irNode = mapJsxNodeToSkeleton(jsxTree, componentMap as any, repeatCount, resolver)
  irNode = normalizeRepeat(irNode, repeatCount)

  return irNode as any
}

export async function generateAndWrite(
  sourceFilePath: string,
  options: GenerateOptions,
  adapterRender: (node: any) => { jsx: string; imports: string[] }
): Promise<{ outputPath: string; content: string; skipped: false } | { skipped: true; reason: string }> {
  const absSource = resolve(sourceFilePath)
  const source = readFileSync(absSource, 'utf-8')

  const ast = parseComponent(source)
  const { tree: jsxTree, componentName: astComponentName } = extractJsxTree(ast)
  if (!jsxTree) {
    throw new Error(`Could not find a JSX return in ${sourceFilePath}`)
  }

  const componentMap = buildComponentMap(options.config, options.adapterComponentMap)
  const repeatCount = options.repeatCount ?? options.config?.repeatCount ?? 3
  const importMap = resolveImports(ast, absSource)
  const resolver = buildComponentResolver(importMap, componentMap, repeatCount, new Set([absSource]))

  let irNode = mapJsxNodeToSkeleton(jsxTree, componentMap as any, repeatCount, resolver)
  irNode = normalizeRepeat(irNode, repeatCount)

  // Skip file emit for layout-only wrappers — they produce empty skeletons
  if (isEmptySkeleton(irNode)) {
    const msg = `⚠ ${basename(sourceFilePath)} is a layout wrapper with no visual content — skeleton file not written.`
    console.warn(msg)
    return { skipped: true, reason: msg }
  }

  const adapterOutput = adapterRender(irNode)

  const naming = options.naming ?? options.config?.naming ?? 'suffix'
  const skeletonFileName = deriveSkeletonFileName(sourceFilePath, naming)
  const sourceDir = dirname(absSource)
  const outputDir = options.outputDir
    ? resolve(options.outputDir)
    : options.config?.outputDir
    ? resolve(options.config.outputDir)
    : sourceDir

  mkdirSync(outputDir, { recursive: true })
  const outputPath = join(outputDir, skeletonFileName)

  // Use actual component function name from AST, not filename
  const componentName = deriveComponentName(astComponentName, sourceFilePath)

  const rawCode = assembleComponent(componentName, adapterOutput.imports, adapterOutput.jsx)
  const formatted = await formatCode(rawCode, options.cwd ?? dirname(absSource))

  writeFileSync(outputPath, formatted, 'utf-8')
  return { outputPath, content: formatted, skipped: false }
}
