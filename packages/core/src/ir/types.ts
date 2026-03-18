export type SkeletonNodeType =
  | 'container'
  | 'text'
  | 'circle'
  | 'rectangle'
  | 'image'
  | 'repeat'

export interface SkeletonNode {
  type: SkeletonNodeType
  children: SkeletonNode[]

  // Layout & sizing from Tailwind classes
  layoutClasses: string[]
  sizeClasses: string[]
  shapeClasses: string[]

  // Dimensions (extracted from Tailwind or inferred)
  width?: string
  height?: string

  // Repeat config (only for type: "repeat")
  repeatCount?: number

  // Original tag for debugging/context
  sourceTag: string
}

export interface JsxNode {
  tag: string
  attributes: Record<string, string>
  children: JsxNode[]
  isLoopChild: boolean
  isConditional: boolean
  textContent?: string
  /** Actual item count when .map() over a static array is detected */
  staticLoopCount?: number
}

export interface ComponentMapEntry {
  type: SkeletonNodeType
  defaultSize?: string
  /** Structural Tailwind classes injected into layoutClasses for containers (e.g. Card border/shadow) */
  containerClasses?: string
}

export interface SkelixConfig {
  adapter: string
  outputDir: string | null
  naming: 'suffix' | 'dot'
  repeatCount: number
  componentMap: Record<string, ComponentMapEntry>
  skeleton: {
    baseColor: string
    animation: string
  }
}
