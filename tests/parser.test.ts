import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseComponent } from '../packages/core/src/parser/babel-parser'
import { extractJsxTree } from '../packages/core/src/parser/jsx-extractor'

function fixture(name: string) {
  return readFileSync(resolve(__dirname, `fixtures/${name}`), 'utf-8')
}

describe('parser + extractor', () => {
  it('parses UserCard and extracts JSX tree', () => {
    const ast = parseComponent(fixture('UserCard.tsx'))
    const tree = extractJsxTree(ast)
    expect(tree).not.toBeNull()
    expect(tree!.tag).toBe('div')
    expect(tree!.attributes.className).toContain('flex')
    expect(tree!.children).toHaveLength(2)
  })

  it('extracts circle image from UserCard (rounded-full + equal h/w)', () => {
    const ast = parseComponent(fixture('UserCard.tsx'))
    const tree = extractJsxTree(ast)
    const img = tree!.children[0]
    expect(img.tag).toBe('img')
    expect(img.attributes.className).toContain('rounded-full')
  })

  it('detects loop in CommentThread', () => {
    const ast = parseComponent(fixture('CommentThread.tsx'))
    const tree = extractJsxTree(ast)
    expect(tree).not.toBeNull()
    // The map child should be marked as isLoopChild
    const loopChild = tree!.children.find(c => c.isLoopChild)
    expect(loopChild).toBeDefined()
  })

  it('detects conditional in ProductTile (&&)', () => {
    const ast = parseComponent(fixture('ProductTile.tsx'))
    const tree = extractJsxTree(ast)
    // Recursively find a conditional node
    function hasConditional(node: any): boolean {
      if (node.isConditional) return true
      return node.children?.some(hasConditional) ?? false
    }
    expect(hasConditional(tree)).toBe(true)
  })

  it('handles ProfileHeader with known component imports', () => {
    const ast = parseComponent(fixture('ProfileHeader.tsx'))
    const tree = extractJsxTree(ast)
    expect(tree).not.toBeNull()
    // Should find Avatar and Badge tags
    function findTag(node: any, tag: string): boolean {
      if (node.tag === tag) return true
      return node.children?.some((c: any) => findTag(c, tag)) ?? false
    }
    expect(findTag(tree, 'Avatar')).toBe(true)
    expect(findTag(tree, 'Badge')).toBe(true)
  })

  it('parses arrow function components', () => {
    const src = `export const Foo = () => <div className="flex"><span>text</span></div>`
    const ast = parseComponent(src)
    const tree = extractJsxTree(ast)
    expect(tree).not.toBeNull()
    expect(tree!.tag).toBe('div')
  })

  it('parses default export components', () => {
    const src = `export default function Bar() { return <div className="p-4" /> }`
    const ast = parseComponent(src)
    const tree = extractJsxTree(ast)
    expect(tree).not.toBeNull()
    expect(tree!.tag).toBe('div')
  })
})
