import { readFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import * as t from '@babel/types'
import type { ParseResult } from '@babel/parser'
import type { File } from '@babel/types'

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.js']

function findFile(basePath: string): string | null {
  if (existsSync(basePath) && !basePath.endsWith('/')) return basePath
  for (const ext of EXTENSIONS) {
    const p = basePath + ext
    if (existsSync(p)) return p
  }
  return null
}

/** Walk up from dir until tsconfig.json is found or filesystem root */
function findTsConfig(startDir: string): string | null {
  let dir = startDir
  while (true) {
    const candidate = join(dir, 'tsconfig.json')
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/** Read path aliases from the nearest tsconfig.json */
export function readTsConfigPaths(sourceFilePath: string): Record<string, string[]> {
  const tsconfig = findTsConfig(dirname(sourceFilePath))
  if (!tsconfig) return {}
  try {
    const raw = readFileSync(tsconfig, 'utf-8')
    // Strip single-line and multi-line comments (tsconfig is JSONC)
    const stripped = raw
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
    const parsed = JSON.parse(stripped)
    const paths: Record<string, string[]> = parsed?.compilerOptions?.paths ?? {}
    const baseUrl: string = parsed?.compilerOptions?.baseUrl ?? '.'
    const tsconfigDir = dirname(tsconfig)
    // Resolve replacement paths relative to tsconfig location
    const resolved: Record<string, string[]> = {}
    for (const [alias, replacements] of Object.entries(paths)) {
      resolved[alias] = (replacements as string[]).map(r =>
        resolve(tsconfigDir, baseUrl, r.replace(/\/\*$/, ''))
      )
    }
    return resolved
  } catch {
    return {}
  }
}

function resolveAlias(
  importPath: string,
  aliases: Record<string, string[]>
): string | null {
  for (const [alias, basePaths] of Object.entries(aliases)) {
    const prefix = alias.replace(/\/?\*$/, '')
    if (!importPath.startsWith(prefix)) continue
    const rest = importPath.slice(prefix.length).replace(/^\//, '')
    for (const base of basePaths) {
      const candidate = rest ? join(base, rest) : base
      const found = findFile(candidate)
      if (found) return found
    }
  }
  return null
}

/**
 * Build a map of { ComponentName → absolute file path } from
 * all local + aliased imports in the given AST.
 * Skips node_modules imports.
 */
export function resolveImports(
  ast: ParseResult<File>,
  sourceFilePath: string
): Map<string, string> {
  const sourceDir = dirname(sourceFilePath)
  const aliases = readTsConfigPaths(sourceFilePath)
  const result = new Map<string, string>()

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue
    const raw = node.source.value

    let filePath: string | null = null

    if (raw.startsWith('.')) {
      // Relative import
      filePath = findFile(resolve(sourceDir, raw))
    } else {
      // Try tsconfig alias resolution
      filePath = resolveAlias(raw, aliases)
      // If still null it's a node_modules import — skip
    }

    if (!filePath) continue

    for (const spec of node.specifiers) {
      if (t.isImportDefaultSpecifier(spec) || t.isImportSpecifier(spec)) {
        result.set(spec.local.name, filePath)
      }
    }
  }

  return result
}
