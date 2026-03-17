import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseComponent } from '../packages/core/src/parser/babel-parser'
import { extractJsxTree } from '../packages/core/src/parser/jsx-extractor'
import { mapJsxNodeToSkeleton } from '../packages/core/src/transformer/element-mapper'
import { normalizeRepeat } from '../packages/core/src/transformer/control-flow'
import { buildComponentMap } from '../packages/core/src/transformer/component-map'
import { TailwindAdapter } from '../packages/adapters/src/tailwind'
import { ShadcnAdapter } from '../packages/adapters/src/shadcn'
import { MuiAdapter } from '../packages/adapters/src/mui'
import { ChakraAdapter } from '../packages/adapters/src/chakra'
import { formatCode } from '../packages/core/src/generator/prettier-format'

function fixture(name: string) {
  return readFileSync(resolve(__dirname, `fixtures/${name}`), 'utf-8')
}

async function generateSkeletonString(fixtureName: string, adapter: any): Promise<string> {
  const src = fixture(fixtureName)
  const ast = parseComponent(src)
  const tree = extractJsxTree(ast)!
  const componentMap = buildComponentMap()
  let ir = mapJsxNodeToSkeleton(tree, componentMap as any, 3)
  ir = normalizeRepeat(ir, 3)

  const { jsx, imports } = adapter.render(ir)
  const baseName = fixtureName.replace('.tsx', '')
  const componentName = `${baseName}Skeleton`
  const importBlock = imports.join('\n')
  const rawCode = `${importBlock}${importBlock ? '\n\n' : ''}export function ${componentName}() {
  return (
    ${jsx}
  )
}
`
  return formatCode(rawCode)
}

const adapters = [
  { name: 'tailwind', instance: new TailwindAdapter() },
  { name: 'shadcn', instance: new ShadcnAdapter() },
  { name: 'mui', instance: new MuiAdapter() },
  { name: 'chakra', instance: new ChakraAdapter() },
]

const fixtures = ['UserCard.tsx', 'ProductTile.tsx', 'CommentThread.tsx', 'ProfileHeader.tsx']

for (const fixture of fixtures) {
  describe(`E2E: ${fixture}`, () => {
    for (const { name, instance } of adapters) {
      it(`generates skeleton with ${name} adapter`, async () => {
        const result = await generateSkeletonString(fixture, instance)
        expect(result).toMatchSnapshot()
      })
    }
  })
}

describe('formatter', () => {
  it('formats code with prettier defaults', async () => {
    const raw = `export function Foo(){return(<div className="flex">  </div>)}`
    const formatted = await formatCode(raw)
    expect(formatted).toContain('export function Foo')
    expect(formatted).not.toBe(raw)
  })
})
