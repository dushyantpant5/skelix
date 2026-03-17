import { parse, type ParseResult } from '@babel/parser'
import type { File } from '@babel/types'

export function parseComponent(source: string): ParseResult<File> {
  return parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })
}
