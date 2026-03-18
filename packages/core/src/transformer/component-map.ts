import type { ComponentMapEntry, SkelixConfig } from '../ir/types.js'

/**
 * Universal primitives that exist across all major UI ecosystems.
 * Library-specific components (ShadCN, MUI, Chakra) live in @skelix/adapters.
 * Project-specific components go in skelix.config.json componentMap.
 */
export const DEFAULT_COMPONENT_MAP: Record<string, ComponentMapEntry> = {
  // Navigation / routing
  Link: { type: 'text', defaultSize: 'h-4 w-[120px]' },
  NextLink: { type: 'text', defaultSize: 'h-4 w-[120px]' },
  RouterLink: { type: 'text', defaultSize: 'h-4 w-[120px]' },

  // Generic UI primitives (framework-agnostic)
  Avatar: { type: 'circle', defaultSize: 'h-10 w-10' },
  Badge: { type: 'rectangle', defaultSize: 'h-5 w-16 rounded-full' },
  Button: { type: 'rectangle', defaultSize: 'h-10 w-24 rounded-md' },
  Image: { type: 'image', defaultSize: 'h-48 w-full' },
  Icon: { type: 'rectangle', defaultSize: 'h-5 w-5' },
  Chip: { type: 'rectangle', defaultSize: 'h-6 w-20 rounded-full' },
  Typography: { type: 'text' },
  TextField: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Input: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Select: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Textarea: { type: 'rectangle', defaultSize: 'h-24 w-full rounded-md' },
  Separator: { type: 'rectangle', defaultSize: 'h-px w-full' },
  Skeleton: { type: 'rectangle' },

  // Generic card concept (no chrome — adapters add containerClasses)
  Card: { type: 'container' },
  CardHeader: { type: 'container' },
  CardContent: { type: 'container' },
  CardFooter: { type: 'container' },
  CardTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  CardDescription: { type: 'text', defaultSize: 'h-4 w-64' },
}

/**
 * Merge order: DEFAULT_COMPONENT_MAP ← adapterMap ← config.componentMap
 * adapterMap comes from the active adapter (e.g. ShadcnAdapter.componentMap).
 */
export function buildComponentMap(
  config?: Partial<SkelixConfig>,
  adapterMap?: Record<string, ComponentMapEntry>
): Record<string, ComponentMapEntry> {
  return {
    ...DEFAULT_COMPONENT_MAP,
    ...(adapterMap ?? {}),
    ...(config?.componentMap ?? {}),
  }
}

export function lookupComponent(
  tag: string,
  componentMap: Record<string, ComponentMapEntry>
): ComponentMapEntry | undefined {
  return componentMap[tag] ?? componentMap[tag.split('.').pop() ?? tag]
}
