import { TailwindAdapter } from './tailwind.js'
import { ShadcnAdapter } from './shadcn.js'
import { MuiAdapter } from './mui.js'
import { ChakraAdapter } from './chakra.js'
import type { SkeletonAdapter } from './types.js'

export type { SkeletonAdapter, AdapterOutput } from './types.js'
export { TailwindAdapter } from './tailwind.js'
export { ShadcnAdapter, SHADCN_COMPONENT_MAP } from './shadcn.js'
export { MuiAdapter, MUI_COMPONENT_MAP } from './mui.js'
export { ChakraAdapter, CHAKRA_COMPONENT_MAP } from './chakra.js'

const adapters: Record<string, SkeletonAdapter> = {
  tailwind: new TailwindAdapter(),
  shadcn: new ShadcnAdapter(),
  mui: new MuiAdapter(),
  chakra: new ChakraAdapter(),
}

export function getAdapter(name: string): SkeletonAdapter {
  const adapter = adapters[name]
  if (!adapter) {
    throw new Error(
      `Unknown adapter "${name}". Available: ${Object.keys(adapters).join(', ')}`
    )
  }
  return adapter
}
