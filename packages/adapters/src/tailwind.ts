import type { SkeletonNode } from '@skelix/core'
import type { AdapterOutput, SkeletonAdapter } from './types.js'

function renderNode(node: SkeletonNode, isRoot: boolean, baseColor: string): string {
  const allClasses = [
    ...node.layoutClasses,
    ...node.sizeClasses,
    ...node.shapeClasses,
  ]

  if (node.type === 'repeat') {
    const count = node.repeatCount ?? 3
    const inner = node.children.map(c => renderNode(c, false, baseColor)).join('\n')
    const items = Array.from({ length: count }, () => inner).join('\n')
    return items
  }

  if (node.type === 'container') {
    const pulseClass = isRoot ? ' animate-pulse' : ''
    const classes = [...allClasses].join(' ')
    const className = classes + pulseClass
    const children = node.children.map(c => renderNode(c, false, baseColor)).join('\n')
    return `<div className="${className}">\n${children}\n</div>`
  }

  // Skeleton primitive: circle, text, rectangle, image
  const primitiveClasses = [...allClasses]

  if (node.type === 'circle' && !primitiveClasses.includes('rounded-full')) {
    primitiveClasses.push('rounded-full')
  }

  if (node.type === 'text' || node.type === 'rectangle') {
    if (!primitiveClasses.some(c => c.startsWith('rounded'))) {
      primitiveClasses.push('rounded')
    }
  }

  primitiveClasses.push(baseColor)
  return `<div className="${primitiveClasses.join(' ')}" />`
}

export class TailwindAdapter implements SkeletonAdapter {
  name = 'tailwind'
  private baseColor: string
  private animation: string

  constructor(options?: { baseColor?: string; animation?: string }) {
    this.baseColor = options?.baseColor ?? 'bg-gray-200'
    this.animation = options?.animation ?? 'animate-pulse'
  }

  render(node: SkeletonNode): AdapterOutput {
    // If root is a container, inject animate-pulse into it
    if (node.type === 'container') {
      const pulseAdded = {
        ...node,
        layoutClasses: [...node.layoutClasses, this.animation],
      }
      const jsx = renderNode(pulseAdded, true, this.baseColor)
      return { jsx, imports: [] }
    }

    // Non-container root: wrap in animate-pulse div
    const inner = renderNode(node, false, this.baseColor)
    const jsx = `<div className="${this.animation}">\n${inner}\n</div>`
    return { jsx, imports: [] }
  }
}
