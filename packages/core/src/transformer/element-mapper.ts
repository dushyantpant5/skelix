import type { JsxNode, SkeletonNode, SkeletonNodeType } from '../ir/types.js'
import { detectLayoutClasses, extractWidth, extractHeight } from './layout-detector.js'
import { lookupComponent } from './component-map.js'

const NATIVE_HTML_MAP: Record<string, SkeletonNodeType> = {
  img: 'image',
  picture: 'image',
  p: 'text',
  span: 'text',
  label: 'text',
  h1: 'text',
  h2: 'text',
  h3: 'text',
  h4: 'text',
  h5: 'text',
  h6: 'text',
  a: 'text',
  button: 'rectangle',
  input: 'rectangle',
  textarea: 'rectangle',
  select: 'rectangle',
  svg: 'rectangle',
  icon: 'rectangle',
  div: 'container',
  section: 'container',
  article: 'container',
  main: 'container',
  header: 'container',
  footer: 'container',
  nav: 'container',
  aside: 'container',
  ul: 'container',
  ol: 'container',
  li: 'container',
  form: 'container',
}

/** Default widths for text elements when no class is present */
const TEXT_DEFAULT_WIDTHS: Record<string, string> = {
  h1: 'w-[280px]',
  h2: 'w-[240px]',
  h3: 'w-[200px]',
  h4: 'w-[180px]',
  h5: 'w-[160px]',
  h6: 'w-[160px]',
  p: 'w-[150px]',
  span: 'w-[120px]',
  label: 'w-[100px]',
  a: 'w-[120px]',
  __text__: 'w-[100px]',
}

const TEXT_DEFAULT_HEIGHTS: Record<string, string> = {
  h1: 'h-8',
  h2: 'h-7',
  h3: 'h-6',
  h4: 'h-5',
  h5: 'h-5',
  h6: 'h-4',
  p: 'h-4',
  span: 'h-3',
  label: 'h-3',
  a: 'h-4',
  __text__: 'h-3',
}

function hasRoundedFull(classes: string[]): boolean {
  return classes.includes('rounded-full')
}

function hasEqualDimensions(sizeClasses: string[]): boolean {
  const w = sizeClasses.find(c => c.startsWith('w-'))
  const h = sizeClasses.find(c => c.startsWith('h-'))
  if (!w || !h) return false
  return w.replace('w-', '') === h.replace('h-', '')
}

export function mapJsxNodeToSkeleton(
  node: JsxNode,
  componentMap: Record<string, ReturnType<typeof lookupComponent> extends infer T ? Exclude<T, undefined> : never>,
  repeatCount: number
): SkeletonNode {
  const className = node.attributes.className ?? ''
  const classified = detectLayoutClasses(className)
  const allClasses = [...classified.layoutClasses, ...classified.sizeClasses, ...classified.shapeClasses]

  // Handle text nodes
  if (node.tag === '__text__') {
    return {
      type: 'text',
      children: [],
      layoutClasses: [],
      sizeClasses: [TEXT_DEFAULT_WIDTHS['__text__']],
      shapeClasses: ['rounded'],
      width: TEXT_DEFAULT_WIDTHS['__text__'],
      height: TEXT_DEFAULT_HEIGHTS['__text__'],
      sourceTag: '__text__',
    }
  }

  // Handle loop (.map) children
  if (node.isLoopChild) {
    const inner = mapJsxNodeToSkeleton({ ...node, isLoopChild: false }, componentMap, repeatCount)
    return {
      type: 'repeat',
      children: [inner],
      layoutClasses: [],
      sizeClasses: [],
      shapeClasses: [],
      repeatCount,
      sourceTag: node.tag,
    }
  }

  // Check component map (known/custom components)
  const knownEntry = componentMap[node.tag] ?? componentMap[node.tag.split('.').pop() ?? '']
  if (knownEntry) {
    const defaultSizeClasses = knownEntry.defaultSize?.split(/\s+/).filter(Boolean) ?? []
    const mergedSize = classified.sizeClasses.length > 0 ? classified.sizeClasses : defaultSizeClasses.filter(c => c.match(/^[hw]-/))
    const mergedShape = classified.shapeClasses.length > 0 ? classified.shapeClasses : defaultSizeClasses.filter(c => c.startsWith('rounded'))

    return {
      type: knownEntry.type,
      children: node.children.map(c => mapJsxNodeToSkeleton(c, componentMap, repeatCount)),
      layoutClasses: classified.layoutClasses,
      sizeClasses: mergedSize,
      shapeClasses: mergedShape,
      width: extractWidth(mergedSize),
      height: extractHeight(mergedSize),
      sourceTag: node.tag,
    }
  }

  // Native HTML element
  const nativeType = NATIVE_HTML_MAP[node.tag.toLowerCase()]

  if (!nativeType) {
    // Unknown component fallback
    console.warn(
      `⚠ Unknown component <${node.tag}> — mapped to rectangle. Add it to skelix.config.json to customize.`
    )
    return {
      type: 'rectangle',
      children: node.children.map(c => mapJsxNodeToSkeleton(c, componentMap, repeatCount)),
      layoutClasses: classified.layoutClasses,
      sizeClasses: classified.sizeClasses,
      shapeClasses: classified.shapeClasses,
      width: extractWidth(classified.sizeClasses),
      height: extractHeight(classified.sizeClasses),
      sourceTag: node.tag,
    }
  }

  // Apply special rules
  let resolvedType = nativeType

  if ((nativeType === 'image' || nativeType === 'rectangle') &&
      hasRoundedFull(allClasses) &&
      hasEqualDimensions(classified.sizeClasses)) {
    resolvedType = 'circle'
  }

  // For text nodes, provide default dimensions
  if (nativeType === 'text') {
    const width = extractWidth(classified.sizeClasses) ?? TEXT_DEFAULT_WIDTHS[node.tag] ?? 'w-[150px]'
    const height = extractHeight(classified.sizeClasses) ?? TEXT_DEFAULT_HEIGHTS[node.tag] ?? 'h-4'
    const sizeClasses = [
      ...classified.sizeClasses.filter(c => !c.startsWith('w-') && !c.startsWith('h-')),
      width,
      height,
    ]
    return {
      type: 'text',
      children: [],
      layoutClasses: classified.layoutClasses,
      sizeClasses,
      shapeClasses: classified.shapeClasses.length > 0 ? classified.shapeClasses : ['rounded'],
      width,
      height,
      sourceTag: node.tag,
    }
  }

  return {
    type: resolvedType,
    children: nativeType === 'container'
      ? node.children.map(c => mapJsxNodeToSkeleton(c, componentMap, repeatCount))
      : [],
    layoutClasses: classified.layoutClasses,
    sizeClasses: classified.sizeClasses,
    shapeClasses: classified.shapeClasses,
    width: extractWidth(classified.sizeClasses),
    height: extractHeight(classified.sizeClasses),
    sourceTag: node.tag,
  }
}
