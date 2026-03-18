import type { SkeletonNode, ComponentMapEntry } from '@skelix/core'

export interface AdapterOutput {
  jsx: string
  imports: string[]
}

export interface SkeletonAdapter {
  name: string
  /** Library-specific component mappings merged on top of core defaults */
  componentMap?: Record<string, ComponentMapEntry>
  render(node: SkeletonNode): AdapterOutput
}

export type { SkeletonNode }
