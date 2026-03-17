import type { SkeletonNode } from '@skelix/core'
import type { AdapterOutput, SkeletonAdapter } from './types.js'
import { tailwindSizeToPx } from '@skelix/core'

function renderNode(node: SkeletonNode): string {
  if (node.type === 'repeat') {
    const count = node.repeatCount ?? 3
    const inner = node.children.map(renderNode).join('\n')
    return Array.from({ length: count }, () => inner).join('\n')
  }

  if (node.type === 'container') {
    const children = node.children.map(renderNode).join('\n')
    // Build sx prop from layout classes (simplified)
    const layoutClasses = node.layoutClasses
    const sxParts: string[] = []
    if (layoutClasses.includes('flex')) sxParts.push('display: "flex"')
    if (layoutClasses.includes('flex-col')) sxParts.push('flexDirection: "column"')
    if (layoutClasses.includes('grid')) sxParts.push('display: "grid"')
    const gapClass = layoutClasses.find(c => c.startsWith('gap-'))
    if (gapClass) {
      const gapVal = tailwindSizeToPx(gapClass.replace('gap-', 'w-'))
      sxParts.push(`gap: "${gapVal}"`)
    }
    const spaceYClass = layoutClasses.find(c => c.startsWith('space-y-'))
    if (spaceYClass) {
      const val = tailwindSizeToPx(spaceYClass.replace('space-y-', 'h-'))
      sxParts.push(`'& > * + *': { marginTop: "${val}" }`)
    }
    const sx = sxParts.length > 0 ? ` sx={{ ${sxParts.join(', ')} }}` : ''
    return `<Box${sx}>\n${children}\n</Box>`
  }

  const width = node.width ? tailwindSizeToPx(node.width) : undefined
  const height = node.height ? tailwindSizeToPx(node.height) : undefined

  if (node.type === 'circle') {
    const size = width ?? height ?? '40px'
    return `<Skeleton variant="circular" width="${size}" height="${size}" />`
  }

  if (node.type === 'text') {
    const w = width ? ` width="${width}"` : ''
    return `<Skeleton variant="text"${w} />`
  }

  // rectangle or image
  const w = width ? ` width="${width}"` : ''
  const h = height ? ` height="${height}"` : ''
  return `<Skeleton variant="rectangular"${w}${h} />`
}

export class MuiAdapter implements SkeletonAdapter {
  name = 'mui'

  render(node: SkeletonNode): AdapterOutput {
    const jsx = renderNode(node)
    return {
      jsx,
      imports: [
        "import { Skeleton } from '@mui/material'",
        "import { Box } from '@mui/material'",
      ],
    }
  }
}
