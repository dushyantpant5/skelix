import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseComponent } from '../packages/core/src/parser/babel-parser'
import { extractJsxTree } from '../packages/core/src/parser/jsx-extractor'
import { mapJsxNodeToSkeleton } from '../packages/core/src/transformer/element-mapper'
import { normalizeRepeat } from '../packages/core/src/transformer/control-flow'
import { buildComponentMap } from '../packages/core/src/transformer/component-map'
import { detectLayoutClasses } from '../packages/core/src/transformer/layout-detector'

function fixture(name: string) {
  return readFileSync(resolve(__dirname, `fixtures/${name}`), 'utf-8')
}

function parseAndTransform(name: string) {
  const src = fixture(name)
  const ast = parseComponent(src)
  const tree = extractJsxTree(ast)!
  const componentMap = buildComponentMap()
  const ir = mapJsxNodeToSkeleton(tree, componentMap as any, 3)
  return normalizeRepeat(ir, 3)
}

describe('layout-detector', () => {
  it('preserves flex and gap classes', () => {
    const result = detectLayoutClasses('flex gap-3 p-4 bg-white text-gray-500')
    expect(result.layoutClasses).toContain('flex')
    expect(result.layoutClasses).toContain('gap-3')
    expect(result.layoutClasses).toContain('p-4')
    expect(result.sizeClasses).toHaveLength(0)
  })

  it('strips color and typography classes', () => {
    const result = detectLayoutClasses('bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600')
    expect(result.layoutClasses).toHaveLength(0)
    expect(result.sizeClasses).toHaveLength(0)
    expect(result.shapeClasses).toHaveLength(0)
  })

  it('categorizes size classes', () => {
    const result = detectLayoutClasses('h-12 w-12 max-w-lg')
    expect(result.sizeClasses).toContain('h-12')
    expect(result.sizeClasses).toContain('w-12')
    expect(result.sizeClasses).toContain('max-w-lg')
  })

  it('categorizes shape classes', () => {
    const result = detectLayoutClasses('rounded-full rounded-md')
    expect(result.shapeClasses).toContain('rounded-full')
    expect(result.shapeClasses).toContain('rounded-md')
  })
})

describe('element-mapper', () => {
  it('maps UserCard root to container', () => {
    const ir = parseAndTransform('UserCard.tsx')
    expect(ir.type).toBe('container')
    expect(ir.sourceTag).toBe('div')
  })

  it('maps img with rounded-full + equal dimensions to circle', () => {
    const ir = parseAndTransform('UserCard.tsx')
    const img = ir.children[0]
    expect(img.type).toBe('circle')
  })

  it('maps h3 to text with default dimensions', () => {
    const ir = parseAndTransform('UserCard.tsx')
    const textContainer = ir.children[1]
    const h3 = textContainer.children[0]
    expect(h3.type).toBe('text')
    expect(h3.height).toBeTruthy()
    expect(h3.width).toBeTruthy()
  })

  it('maps CommentThread loop child to repeat node', () => {
    const ir = parseAndTransform('CommentThread.tsx')
    const repeat = ir.children.find(c => c.type === 'repeat')
    expect(repeat).toBeDefined()
    expect(repeat!.repeatCount).toBe(3)
  })

  it('maps ProductTile conditional span to text (included unconditionally)', () => {
    const ir = parseAndTransform('ProductTile.tsx')
    function findType(node: any, type: string): boolean {
      if (node.type === type) return true
      return node.children?.some((c: any) => findType(c, type)) ?? false
    }
    expect(findType(ir, 'text')).toBe(true)
  })

  it('maps Avatar to circle via component map', () => {
    const ir = parseAndTransform('ProfileHeader.tsx')
    function findCircle(node: any): boolean {
      if (node.type === 'circle') return true
      return node.children?.some(findCircle) ?? false
    }
    expect(findCircle(ir)).toBe(true)
  })

  it('maps Badge to rectangle via component map', () => {
    const ir = parseAndTransform('ProfileHeader.tsx')
    function findRect(node: any): boolean {
      if (node.type === 'rectangle' && node.sourceTag === 'Badge') return true
      return node.children?.some(findRect) ?? false
    }
    expect(findRect(ir)).toBe(true)
  })
})

describe('IR snapshot tests', () => {
  it('UserCard IR matches snapshot', () => {
    const ir = parseAndTransform('UserCard.tsx')
    expect(ir).toMatchSnapshot()
  })

  it('CommentThread IR matches snapshot', () => {
    const ir = parseAndTransform('CommentThread.tsx')
    expect(ir).toMatchSnapshot()
  })

  it('ProductTile IR matches snapshot', () => {
    const ir = parseAndTransform('ProductTile.tsx')
    expect(ir).toMatchSnapshot()
  })
})
