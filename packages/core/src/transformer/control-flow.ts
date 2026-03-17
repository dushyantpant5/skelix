import type { SkeletonNode } from '../ir/types.js'

/**
 * Flattens conditional nodes by including all branches.
 * This gives the "maximum possible layout" for the skeleton.
 * Already handled at the JSX extraction level; this is a post-processing pass
 * that can further normalize the IR if needed.
 */
export function flattenConditionals(node: SkeletonNode): SkeletonNode {
  return {
    ...node,
    children: node.children.map(flattenConditionals),
  }
}

/**
 * Ensures all repeat nodes have a valid repeatCount.
 */
export function normalizeRepeat(node: SkeletonNode, defaultCount: number): SkeletonNode {
  if (node.type === 'repeat') {
    return {
      ...node,
      repeatCount: node.repeatCount ?? defaultCount,
      children: node.children.map(c => normalizeRepeat(c, defaultCount)),
    }
  }
  return {
    ...node,
    children: node.children.map(c => normalizeRepeat(c, defaultCount)),
  }
}
