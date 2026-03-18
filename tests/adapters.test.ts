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

function fixture(name: string) {
  return readFileSync(resolve(__dirname, `fixtures/${name}`), 'utf-8')
}

function buildIR(name: string) {
  const src = fixture(name)
  const ast = parseComponent(src)
  const { tree } = extractJsxTree(ast)
  const componentMap = buildComponentMap()
  const ir = mapJsxNodeToSkeleton(tree!, componentMap as any, 3)
  return normalizeRepeat(ir, 3)
}

describe('TailwindAdapter', () => {
  const adapter = new TailwindAdapter()

  it('renders UserCard with animate-pulse and bg-gray-200', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx, imports } = adapter.render(ir)
    expect(jsx).toContain('animate-pulse')
    expect(jsx).toContain('bg-gray-200')
    expect(imports).toHaveLength(0)
  })

  it('renders circle with rounded-full', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx } = adapter.render(ir)
    expect(jsx).toContain('rounded-full')
  })

  it('renders repeat nodes (CommentThread)', () => {
    const ir = buildIR('CommentThread.tsx')
    const { jsx } = adapter.render(ir)
    // 3 repetitions of the comment item
    const matches = (jsx.match(/rounded-full/g) || []).length
    expect(matches).toBeGreaterThanOrEqual(3)
  })

  it('UserCard tailwind output matches snapshot', () => {
    const ir = buildIR('UserCard.tsx')
    expect(adapter.render(ir).jsx).toMatchSnapshot()
  })
})

describe('ShadcnAdapter', () => {
  const adapter = new ShadcnAdapter()

  it('uses <Skeleton> component for primitives', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx, imports } = adapter.render(ir)
    expect(jsx).toContain('<Skeleton')
    expect(imports[0]).toContain('@/components/ui/skeleton')
  })

  it('does not add animate-pulse (handled by Skeleton component)', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx } = adapter.render(ir)
    expect(jsx).not.toContain('animate-pulse')
  })

  it('UserCard shadcn output matches snapshot', () => {
    const ir = buildIR('UserCard.tsx')
    expect(adapter.render(ir).jsx).toMatchSnapshot()
  })
})

describe('MuiAdapter', () => {
  const adapter = new MuiAdapter()

  it('uses variant="circular" for circles', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx, imports } = adapter.render(ir)
    expect(jsx).toContain('variant="circular"')
    expect(imports.some(i => i.includes('@mui/material'))).toBe(true)
  })

  it('uses variant="text" for text nodes', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx } = adapter.render(ir)
    expect(jsx).toContain('variant="text"')
  })

  it('UserCard mui output matches snapshot', () => {
    const ir = buildIR('UserCard.tsx')
    expect(adapter.render(ir).jsx).toMatchSnapshot()
  })
})

describe('ChakraAdapter', () => {
  const adapter = new ChakraAdapter()

  it('uses SkeletonCircle for circles', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx, imports } = adapter.render(ir)
    expect(jsx).toContain('<SkeletonCircle')
    expect(imports[0]).toContain('@chakra-ui/react')
  })

  it('uses SkeletonText for text nodes', () => {
    const ir = buildIR('UserCard.tsx')
    const { jsx } = adapter.render(ir)
    expect(jsx).toContain('<SkeletonText')
  })

  it('UserCard chakra output matches snapshot', () => {
    const ir = buildIR('UserCard.tsx')
    expect(adapter.render(ir).jsx).toMatchSnapshot()
  })
})
