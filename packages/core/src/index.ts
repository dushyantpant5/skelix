// IR types
export type {
  SkeletonNode,
  SkeletonNodeType,
  JsxNode,
  ComponentMapEntry,
  SkelixConfig,
} from './ir/types.js'

// Parser
export { parseComponent } from './parser/babel-parser.js'
export { extractJsxTree } from './parser/jsx-extractor.js'

// Transformer
export { mapJsxNodeToSkeleton } from './transformer/element-mapper.js'
export { detectLayoutClasses, tailwindSizeToPx } from './transformer/layout-detector.js'
export { buildComponentMap, DEFAULT_COMPONENT_MAP } from './transformer/component-map.js'
export { flattenConditionals, normalizeRepeat } from './transformer/control-flow.js'

// Generator
export { generateSkeleton, generateAndWrite } from './generator/skeleton-generator.js'
export { formatCode } from './generator/prettier-format.js'
