import type { SkeletonNode } from '@skelix/core'
import type { AdapterOutput, SkeletonAdapter } from './types.js'

function renderNode(node: SkeletonNode): string {
  if (node.type === 'repeat') {
    const count = node.repeatCount ?? 3
    const inner = node.children.map(renderNode).join('\n')
    return Array.from({ length: count }, () => inner).join('\n')
  }

  if (node.type === 'container') {
    const classes = [...node.layoutClasses, ...node.sizeClasses, ...node.shapeClasses].join(' ')
    const children = node.children.map(renderNode).join('\n')
    return `<div${classes ? ` className="${classes}"` : ''}>\n${children}\n</div>`
  }

  // Skeleton primitives use the <Skeleton> component
  const classes = [...node.sizeClasses, ...node.shapeClasses]

  if (node.type === 'circle') {
    if (!classes.includes('rounded-full')) classes.push('rounded-full')
  }

  return `<Skeleton className="${classes.join(' ')}" />`
}

export class ShadcnAdapter implements SkeletonAdapter {
  name = 'shadcn'

  render(node: SkeletonNode): AdapterOutput {
    const jsx = renderNode(node)
    return {
      jsx,
      imports: ["import { Skeleton } from '@/components/ui/skeleton'"],
    }
  }
}
