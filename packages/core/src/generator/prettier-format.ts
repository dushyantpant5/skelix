import * as prettier from 'prettier'
import { existsSync } from 'fs'
import { resolve } from 'path'

export async function formatCode(code: string, cwd?: string): Promise<string> {
  // Try to resolve user's prettier config
  let config: prettier.Options | null = null
  if (cwd) {
    try {
      config = await prettier.resolveConfig(resolve(cwd, '.prettierrc'))
    } catch {
      // ignore
    }
  }

  return prettier.format(code, {
    ...(config ?? {}),
    parser: 'typescript',
    semi: config?.semi ?? false,
    singleQuote: config?.singleQuote ?? true,
  })
}
