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
    const layoutClasses = node.layoutClasses
    const isFlex = layoutClasses.includes('flex') || layoutClasses.includes('inline-flex')
    const tag = isFlex ? 'Flex' : 'Box'
    const dirProp = layoutClasses.includes('flex-col') ? ' direction="column"' : ''
    const gapClass = layoutClasses.find(c => c.startsWith('gap-'))
    const gapProp = gapClass
      ? ` gap="${tailwindSizeToPx(gapClass.replace('gap-', 'w-'))}"`
      : ''
    const spaceYClass = layoutClasses.find(c => c.startsWith('space-y-'))
    const spaceProp = spaceYClass
      ? ` spacing="${tailwindSizeToPx(spaceYClass.replace('space-y-', 'h-'))}"`
      : ''
    return `<${tag}${dirProp}${gapProp}${spaceProp}>\n${children}\n</${tag}>`
  }

  if (node.type === 'circle') {
    const size = node.width ? tailwindSizeToPx(node.width) : '40px'
    return `<SkeletonCircle size="${size}" />`
  }

  if (node.type === 'text') {
    return `<SkeletonText noOfLines={1} />`
  }

  // rectangle or image
  const h = node.height ? ` height="${tailwindSizeToPx(node.height)}"` : ''
  const w = node.width ? ` width="${tailwindSizeToPx(node.width)}"` : ''
  return `<Skeleton${h}${w} />`
}

export class ChakraAdapter implements SkeletonAdapter {
  name = 'chakra'

  render(node: SkeletonNode): AdapterOutput {
    const jsx = renderNode(node)
    return {
      jsx,
      imports: [
        "import { Skeleton, SkeletonCircle, SkeletonText, Box, Flex } from '@chakra-ui/react'",
      ],
    }
  }
}
