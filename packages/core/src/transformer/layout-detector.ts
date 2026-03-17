const LAYOUT_PATTERNS = [
  /^flex$/,
  /^inline-flex$/,
  /^grid$/,
  /^inline-grid$/,
  /^block$/,
  /^inline-block$/,
  /^hidden$/,
  /^flex-row$/,
  /^flex-col$/,
  /^flex-wrap$/,
  /^items-/,
  /^justify-/,
  /^grid-cols-/,
  /^grid-rows-/,
  /^gap-/,
  /^space-x-/,
  /^space-y-/,
  /^p-/,
  /^px-/,
  /^py-/,
  /^pt-/,
  /^pb-/,
  /^pl-/,
  /^pr-/,
  /^m-/,
  /^mx-/,
  /^my-/,
  /^mt-/,
  /^mb-/,
  /^ml-/,
  /^mr-/,
  /^overflow-hidden$/,
  /^overflow-auto$/,
  /^relative$/,
  /^absolute$/,
  /^fixed$/,
  /^sticky$/,
]

const SIZE_PATTERNS = [
  /^h-/,
  /^w-/,
  /^min-h-/,
  /^min-w-/,
  /^max-h-/,
  /^max-w-/,
  /^aspect-/,
]

const SHAPE_PATTERNS = [/^rounded/]

const STRIP_PATTERNS = [
  /^bg-/,
  /^text-(?!center|left|right|justify)/,  // strip text-color but not text-align
  /^border(?!-[0-9])/,
  /^font-/,
  /^text-sm$/,
  /^text-xs$/,
  /^text-lg$/,
  /^text-xl$/,
  /^text-2xl$/,
  /^text-3xl$/,
  /^text-base$/,
  /^leading-/,
  /^tracking-/,
  /^shadow/,
  /^opacity-/,
  /^ring/,
  /^transition/,
  /^duration-/,
  /^ease-/,
  /^hover:/,
  /^focus:/,
  /^active:/,
  /^dark:/,
  /^object-/,
  /^cursor-/,
  /^select-/,
  /^pointer-/,
]

export interface ClassifiedClasses {
  layoutClasses: string[]
  sizeClasses: string[]
  shapeClasses: string[]
}

function matchesAny(cls: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(cls))
}

export function detectLayoutClasses(className: string): ClassifiedClasses {
  const classes = className.split(/\s+/).filter(Boolean)
  const layoutClasses: string[] = []
  const sizeClasses: string[] = []
  const shapeClasses: string[] = []

  for (const cls of classes) {
    if (matchesAny(cls, STRIP_PATTERNS)) continue

    if (matchesAny(cls, SHAPE_PATTERNS)) {
      shapeClasses.push(cls)
    } else if (matchesAny(cls, SIZE_PATTERNS)) {
      sizeClasses.push(cls)
    } else if (matchesAny(cls, LAYOUT_PATTERNS)) {
      layoutClasses.push(cls)
    }
    // Everything else is silently dropped
  }

  return { layoutClasses, sizeClasses, shapeClasses }
}

/** Extract width class from size classes, e.g. "w-10" or "w-[150px]" */
export function extractWidth(sizeClasses: string[]): string | undefined {
  return sizeClasses.find(c => c.startsWith('w-'))
}

/** Extract height class from size classes */
export function extractHeight(sizeClasses: string[]): string | undefined {
  return sizeClasses.find(c => c.startsWith('h-'))
}

/** Convert a Tailwind size class to approximate pixels for MUI */
const TAILWIND_PX_MAP: Record<string, number> = {
  '0': 0, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10, '3': 12, '3.5': 14,
  '4': 16, '5': 20, '6': 24, '7': 28, '8': 32, '9': 36, '10': 40, '11': 44,
  '12': 48, '14': 56, '16': 64, '20': 80, '24': 96, '28': 112, '32': 128,
  '36': 144, '40': 160, '44': 176, '48': 192, '52': 208, '56': 224,
  '60': 240, '64': 256, '72': 288, '80': 320, '96': 384, 'full': -1,
}

export function tailwindSizeToPx(cls: string): string {
  // e.g. "h-10" → "40px", "w-[150px]" → "150px", "w-full" → "100%"
  const match = cls.match(/^[hw]-\[(.+)\]$/)
  if (match) return match[1]

  const scale = cls.replace(/^[hw]-/, '')
  if (scale === 'full') return '100%'
  if (scale === 'screen') return '100vw'
  if (scale === 'auto') return 'auto'

  const px = TAILWIND_PX_MAP[scale]
  if (px !== undefined) return px === -1 ? '100%' : `${px}px`

  // Try fraction (e.g. "1/2" → 50%)
  const fracMatch = scale.match(/^(\d+)\/(\d+)$/)
  if (fracMatch) {
    const pct = (parseInt(fracMatch[1]) / parseInt(fracMatch[2])) * 100
    return `${pct}%`
  }

  return scale // return as-is if unknown
}
