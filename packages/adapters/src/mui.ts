import type { SkeletonNode, ComponentMapEntry } from '@skelix/core'
import type { AdapterOutput, SkeletonAdapter } from './types.js'
import { tailwindSizeToPx } from '@skelix/core'

export const MUI_COMPONENT_MAP: Record<string, ComponentMapEntry> = {
  // Layout
  Container: { type: 'container' },
  Grid: { type: 'container' },
  Grid2: { type: 'container' },
  Stack: { type: 'container' },
  Box: { type: 'container' },
  Paper: { type: 'container', containerClasses: 'p-4' },

  // Navigation
  AppBar: { type: 'container' },
  Toolbar: { type: 'container' },
  Drawer: { type: 'container' },
  Tabs: { type: 'container' },
  Tab: { type: 'rectangle', defaultSize: 'h-9 w-24' },

  // Inputs
  TextField: { type: 'rectangle', defaultSize: 'h-14 w-full rounded' },
  Select: { type: 'rectangle', defaultSize: 'h-14 w-full rounded' },
  Checkbox: { type: 'rectangle', defaultSize: 'h-5 w-5 rounded' },
  Radio: { type: 'circle', defaultSize: 'h-5 w-5' },
  Switch: { type: 'rectangle', defaultSize: 'h-6 w-11 rounded-full' },
  Slider: { type: 'rectangle', defaultSize: 'h-2 w-full rounded-full' },
  Autocomplete: { type: 'rectangle', defaultSize: 'h-14 w-full rounded' },
  FormControl: { type: 'container' },
  FormLabel: { type: 'text', defaultSize: 'h-4 w-24' },
  FormHelperText: { type: 'text', defaultSize: 'h-3 w-48' },
  InputLabel: { type: 'text', defaultSize: 'h-4 w-24' },

  // Display
  Typography: { type: 'text' },
  Avatar: { type: 'circle', defaultSize: 'h-10 w-10' },
  Chip: { type: 'rectangle', defaultSize: 'h-6 w-20 rounded-full' },
  Badge: { type: 'container' },
  Divider: { type: 'rectangle', defaultSize: 'h-px w-full' },
  List: { type: 'container' },
  ListItem: { type: 'container' },
  ListItemText: { type: 'container' },
  ListItemAvatar: { type: 'container' },
  Table: { type: 'container' },
  TableHead: { type: 'container' },
  TableBody: { type: 'container' },
  TableRow: { type: 'container' },
  TableCell: { type: 'text', defaultSize: 'h-4 w-32' },

  // Feedback
  Alert: { type: 'container' },
  CircularProgress: { type: 'circle', defaultSize: 'h-10 w-10' },
  LinearProgress: { type: 'rectangle', defaultSize: 'h-1 w-full' },

  // Surfaces
  Card: { type: 'container' },
  CardContent: { type: 'container', containerClasses: 'p-4' },
  CardHeader: { type: 'container', containerClasses: 'p-4' },
  CardActions: { type: 'container', containerClasses: 'p-4' },
  CardMedia: { type: 'image', defaultSize: 'h-48 w-full' },
  Accordion: { type: 'container' },
  AccordionSummary: { type: 'rectangle', defaultSize: 'h-12 w-full' },
  AccordionDetails: { type: 'container' },
  Modal: { type: 'container' },
  Dialog: { type: 'container' },
  DialogTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  DialogContent: { type: 'container', containerClasses: 'p-6' },
  DialogActions: { type: 'container', containerClasses: 'p-4' },
  Popover: { type: 'container' },
  Menu: { type: 'container' },
  MenuItem: { type: 'rectangle', defaultSize: 'h-9 w-full' },
  Tooltip: { type: 'container' },
}

function renderNode(node: SkeletonNode): string {
  if (node.type === 'repeat') {
    const count = node.repeatCount ?? 3
    const inner = node.children.map(renderNode).join('\n')
    return Array.from({ length: count }, () => inner).join('\n')
  }

  if (node.type === 'container') {
    const children = node.children.map(renderNode).join('\n')
    // Build sx prop from layout classes (simplified)
    const layoutClasses = node.layoutClasses
    const sxParts: string[] = []
    if (layoutClasses.includes('flex')) sxParts.push('display: "flex"')
    if (layoutClasses.includes('flex-col')) sxParts.push('flexDirection: "column"')
    if (layoutClasses.includes('grid')) sxParts.push('display: "grid"')
    const gapClass = layoutClasses.find(c => c.startsWith('gap-'))
    if (gapClass) {
      const gapVal = tailwindSizeToPx(gapClass.replace('gap-', 'w-'))
      sxParts.push(`gap: "${gapVal}"`)
    }
    const spaceYClass = layoutClasses.find(c => c.startsWith('space-y-'))
    if (spaceYClass) {
      const val = tailwindSizeToPx(spaceYClass.replace('space-y-', 'h-'))
      sxParts.push(`'& > * + *': { marginTop: "${val}" }`)
    }
    const sx = sxParts.length > 0 ? ` sx={{ ${sxParts.join(', ')} }}` : ''
    return `<Box${sx}>\n${children}\n</Box>`
  }

  const width = node.width ? tailwindSizeToPx(node.width) : undefined
  const height = node.height ? tailwindSizeToPx(node.height) : undefined

  if (node.type === 'circle') {
    const size = width ?? height ?? '40px'
    return `<Skeleton variant="circular" width="${size}" height="${size}" />`
  }

  if (node.type === 'text') {
    const w = width ? ` width="${width}"` : ''
    return `<Skeleton variant="text"${w} />`
  }

  // rectangle or image
  const w = width ? ` width="${width}"` : ''
  const h = height ? ` height="${height}"` : ''
  return `<Skeleton variant="rectangular"${w}${h} />`
}

export class MuiAdapter implements SkeletonAdapter {
  name = 'mui'
  componentMap = MUI_COMPONENT_MAP

  render(node: SkeletonNode): AdapterOutput {
    const jsx = renderNode(node)
    return {
      jsx,
      imports: [
        "import { Skeleton } from '@mui/material'",
        "import { Box } from '@mui/material'",
      ],
    }
  }
}
