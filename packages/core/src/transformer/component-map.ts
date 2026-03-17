import type { ComponentMapEntry, SkelixConfig } from '../ir/types.js'

export const DEFAULT_COMPONENT_MAP: Record<string, ComponentMapEntry> = {
  Avatar: { type: 'circle', defaultSize: 'h-10 w-10' },
  Badge: { type: 'rectangle', defaultSize: 'h-5 w-16 rounded-full' },
  Button: { type: 'rectangle', defaultSize: 'h-10 w-24 rounded-md' },
  Card: { type: 'container' },
  CardHeader: { type: 'container' },
  CardContent: { type: 'container' },
  CardFooter: { type: 'container' },
  Image: { type: 'image', defaultSize: 'h-48 w-full' },
  Icon: { type: 'rectangle', defaultSize: 'h-5 w-5' },
  Chip: { type: 'rectangle', defaultSize: 'h-6 w-20 rounded-full' },
  Typography: { type: 'text' },
  TextField: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Select: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
}

export function buildComponentMap(
  config?: Partial<SkelixConfig>
): Record<string, ComponentMapEntry> {
  const userMap = config?.componentMap ?? {}
  return { ...DEFAULT_COMPONENT_MAP, ...userMap }
}

export function lookupComponent(
  tag: string,
  componentMap: Record<string, ComponentMapEntry>
): ComponentMapEntry | undefined {
  // Try exact match first, then strip namespace (e.g. "ui.Avatar" -> "Avatar")
  return componentMap[tag] ?? componentMap[tag.split('.').pop() ?? tag]
}
