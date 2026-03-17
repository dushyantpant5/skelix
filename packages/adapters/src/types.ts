import type { SkeletonNode } from '@skelix/core'

export interface AdapterOutput {
  jsx: string
  imports: string[]
}

export interface SkeletonAdapter {
  name: string
  render(node: SkeletonNode): AdapterOutput
}

export type { SkeletonNode }
