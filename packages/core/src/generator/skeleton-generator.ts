import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname, basename, extname, join } from 'path'
import { parseComponent } from '../parser/babel-parser.js'
import { extractJsxTree } from '../parser/jsx-extractor.js'
import { mapJsxNodeToSkeleton } from '../transformer/element-mapper.js'
import { normalizeRepeat } from '../transformer/control-flow.js'
import { buildComponentMap } from '../transformer/component-map.js'
import { formatCode } from './prettier-format.js'
import type { SkelixConfig } from '../ir/types.js'

export interface GenerateOptions {
  adapter: string
  outputDir?: string | null
  naming?: 'suffix' | 'dot'
  repeatCount?: number
  config?: Partial<SkelixConfig>
  cwd?: string
}

function deriveSkeletonName(
  sourceFile: string,
  naming: 'suffix' | 'dot'
): string {
  const base = basename(sourceFile, extname(sourceFile)) // "UserCard"
  return naming === 'dot' ? `${base}.skeleton.tsx` : `${base}Skeleton.tsx`
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

  // Parse
  const ast = parseComponent(source)

  // Extract JSX tree
  const jsxTree = extractJsxTree(ast)
  if (!jsxTree) {
    throw new Error(`Could not find a JSX return in ${sourceFilePath}`)
  }

  // Build component map from config
  const componentMap = buildComponentMap(options.config)
  const repeatCount = options.repeatCount ?? options.config?.repeatCount ?? 3

  // Transform to IR
  let irNode = mapJsxNodeToSkeleton(jsxTree, componentMap as any, repeatCount)
  irNode = normalizeRepeat(irNode, repeatCount)

  return irNode as any // Return IR node for testing; actual file writing done in writeSkeletonFile
}

export async function generateAndWrite(
  sourceFilePath: string,
  options: GenerateOptions,
  adapterRender: (node: any) => { jsx: string; imports: string[] }
): Promise<{ outputPath: string; content: string }> {
  const absSource = resolve(sourceFilePath)
  const source = readFileSync(absSource, 'utf-8')

  const ast = parseComponent(source)
  const jsxTree = extractJsxTree(ast)
  if (!jsxTree) {
    throw new Error(`Could not find a JSX return in ${sourceFilePath}`)
  }

  const componentMap = buildComponentMap(options.config)
  const repeatCount = options.repeatCount ?? options.config?.repeatCount ?? 3

  let irNode = mapJsxNodeToSkeleton(jsxTree, componentMap as any, repeatCount)
  irNode = normalizeRepeat(irNode, repeatCount)

  const adapterOutput = adapterRender(irNode)

  const naming = options.naming ?? options.config?.naming ?? 'suffix'
  const skeletonFileName = deriveSkeletonName(sourceFilePath, naming)
  const sourceDir = dirname(absSource)
  const outputDir = options.outputDir
    ? resolve(options.outputDir)
    : options.config?.outputDir
    ? resolve(options.config.outputDir)
    : sourceDir

  mkdirSync(outputDir, { recursive: true })
  const outputPath = join(outputDir, skeletonFileName)

  // Derive component name from file name, converting kebab-case to PascalCase
  const base = basename(sourceFilePath, extname(sourceFilePath))
  const pascalBase = base.replace(/(^|[-_])(.)/g, (_, __, c) => c.toUpperCase())
  const componentName = `${pascalBase}Skeleton`

  const rawCode = assembleComponent(componentName, adapterOutput.imports, adapterOutput.jsx)
  const formatted = await formatCode(rawCode, options.cwd ?? dirname(absSource))

  writeFileSync(outputPath, formatted, 'utf-8')
  return { outputPath, content: formatted }
}
