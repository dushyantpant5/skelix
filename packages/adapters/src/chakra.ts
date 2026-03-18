import type { SkeletonNode, ComponentMapEntry } from '@skelix/core'
import type { AdapterOutput, SkeletonAdapter } from './types.js'
import { tailwindSizeToPx } from '@skelix/core'

export const CHAKRA_COMPONENT_MAP: Record<string, ComponentMapEntry> = {
  // Layout
  Box: { type: 'container' },
  Flex: { type: 'container' },
  Grid: { type: 'container' },
  GridItem: { type: 'container' },
  Stack: { type: 'container' },
  HStack: { type: 'container' },
  VStack: { type: 'container' },
  Center: { type: 'container' },
  Container: { type: 'container' },
  SimpleGrid: { type: 'container' },
  Wrap: { type: 'container' },
  WrapItem: { type: 'container' },

  // Typography
  Text: { type: 'text' },
  Heading: { type: 'text', defaultSize: 'h-7 w-48' },
  Divider: { type: 'rectangle', defaultSize: 'h-px w-full' },

  // Forms
  FormControl: { type: 'container' },
  FormLabel: { type: 'text', defaultSize: 'h-4 w-24' },
  FormHelperText: { type: 'text', defaultSize: 'h-3 w-48' },
  FormErrorMessage: { type: 'text', defaultSize: 'h-3 w-48' },
  Input: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Textarea: { type: 'rectangle', defaultSize: 'h-24 w-full rounded-md' },
  Select: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Checkbox: { type: 'rectangle', defaultSize: 'h-4 w-4 rounded' },
  Radio: { type: 'circle', defaultSize: 'h-4 w-4' },
  Switch: { type: 'rectangle', defaultSize: 'h-6 w-11 rounded-full' },
  Slider: { type: 'container' },
  SliderTrack: { type: 'rectangle', defaultSize: 'h-2 w-full rounded-full' },
  SliderThumb: { type: 'circle', defaultSize: 'h-4 w-4' },
  NumberInput: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  PinInput: { type: 'container' },
  PinInputField: { type: 'rectangle', defaultSize: 'h-10 w-10 rounded-md' },

  // Navigation
  Breadcrumb: { type: 'container' },
  BreadcrumbItem: { type: 'container' },
  BreadcrumbLink: { type: 'text', defaultSize: 'h-4 w-20' },
  Tabs: { type: 'container' },
  TabList: { type: 'container' },
  Tab: { type: 'rectangle', defaultSize: 'h-9 w-24 rounded-md' },
  TabPanels: { type: 'container' },
  TabPanel: { type: 'container' },

  // Data display
  Avatar: { type: 'circle', defaultSize: 'h-10 w-10' },
  AvatarGroup: { type: 'container' },
  Badge: { type: 'rectangle', defaultSize: 'h-5 w-16 rounded-full' },
  Tag: { type: 'rectangle', defaultSize: 'h-6 w-16 rounded-full' },
  TagLabel: { type: 'text', defaultSize: 'h-4 w-12' },
  Table: { type: 'container' },
  Thead: { type: 'container' },
  Tbody: { type: 'container' },
  Tr: { type: 'container' },
  Th: { type: 'text', defaultSize: 'h-4 w-24' },
  Td: { type: 'text', defaultSize: 'h-4 w-32' },
  List: { type: 'container' },
  ListItem: { type: 'container' },
  ListIcon: { type: 'rectangle', defaultSize: 'h-4 w-4' },
  Stat: { type: 'container' },
  StatLabel: { type: 'text', defaultSize: 'h-4 w-24' },
  StatNumber: { type: 'text', defaultSize: 'h-8 w-32' },
  StatHelpText: { type: 'text', defaultSize: 'h-4 w-40' },

  // Overlay
  Modal: { type: 'container' },
  ModalOverlay: { type: 'container' },
  ModalContent: { type: 'container', containerClasses: 'p-6' },
  ModalHeader: { type: 'text', defaultSize: 'h-6 w-48' },
  ModalBody: { type: 'container' },
  ModalFooter: { type: 'container' },
  Drawer: { type: 'container' },
  DrawerContent: { type: 'container' },
  DrawerHeader: { type: 'text', defaultSize: 'h-6 w-48' },
  DrawerBody: { type: 'container' },
  DrawerFooter: { type: 'container' },
  Popover: { type: 'container' },
  PopoverContent: { type: 'container' },
  PopoverHeader: { type: 'text', defaultSize: 'h-5 w-32' },
  PopoverBody: { type: 'container' },
  Tooltip: { type: 'container' },
  Menu: { type: 'container' },
  MenuList: { type: 'container' },
  MenuItem: { type: 'rectangle', defaultSize: 'h-9 w-full' },
  MenuButton: { type: 'rectangle', defaultSize: 'h-9 w-24 rounded-md' },

  // Feedback
  Alert: { type: 'container' },
  AlertIcon: { type: 'rectangle', defaultSize: 'h-5 w-5 rounded' },
  AlertTitle: { type: 'text', defaultSize: 'h-5 w-40' },
  AlertDescription: { type: 'text', defaultSize: 'h-4 w-64' },
  Progress: { type: 'rectangle', defaultSize: 'h-2 w-full rounded-full' },
  CircularProgress: { type: 'circle', defaultSize: 'h-10 w-10' },
  Spinner: { type: 'circle', defaultSize: 'h-8 w-8' },
  Toast: { type: 'container' },

  // Disclosure
  Accordion: { type: 'container' },
  AccordionItem: { type: 'container' },
  AccordionButton: { type: 'rectangle', defaultSize: 'h-10 w-full' },
  AccordionPanel: { type: 'container' },

  // Cards
  Card: { type: 'container' },
  CardHeader: { type: 'container', containerClasses: 'p-4' },
  CardBody: { type: 'container', containerClasses: 'p-4' },
  CardFooter: { type: 'container', containerClasses: 'p-4' },
}

function renderNode(node: SkeletonNode): string {
  if (node.type === 'repeat') {
    const count = node.repeatCount ?? 3
    const inner = node.children.map(renderNode).join('\n')
    return Array.from({ length: count }, () => inner).join('\n')
  }

  if (node.type === 'container') {
    const children = node.children.map(renderNode).join('\n')
    const layoutClasses = node.layoutClasses
    const isFlex = layoutClasses.includes('flex') || layoutClasses.includes('inline-flex')
    const tag = isFlex ? 'Flex' : 'Box'
    const dirProp = layoutClasses.includes('flex-col') ? ' direction="column"' : ''
    const gapClass = layoutClasses.find(c => c.startsWith('gap-'))
    const gapProp = gapClass
      ? ` gap="${tailwindSizeToPx(gapClass.replace('gap-', 'w-'))}"`
      : ''
    const spaceYClass = layoutClasses.find(c => c.startsWith('space-y-'))
    const spaceProp = spaceYClass
      ? ` spacing="${tailwindSizeToPx(spaceYClass.replace('space-y-', 'h-'))}"`
      : ''
    return `<${tag}${dirProp}${gapProp}${spaceProp}>\n${children}\n</${tag}>`
  }

  if (node.type === 'circle') {
    const size = node.width ? tailwindSizeToPx(node.width) : '40px'
    return `<SkeletonCircle size="${size}" />`
  }

  if (node.type === 'text') {
    return `<SkeletonText noOfLines={1} />`
  }

  // rectangle or image
  const h = node.height ? ` height="${tailwindSizeToPx(node.height)}"` : ''
  const w = node.width ? ` width="${tailwindSizeToPx(node.width)}"` : ''
  return `<Skeleton${h}${w} />`
}

export class ChakraAdapter implements SkeletonAdapter {
  name = 'chakra'
  componentMap = CHAKRA_COMPONENT_MAP

  render(node: SkeletonNode): AdapterOutput {
    const jsx = renderNode(node)
    return {
      jsx,
      imports: [
        "import { Skeleton, SkeletonCircle, SkeletonText, Box, Flex } from '@chakra-ui/react'",
      ],
    }
  }
}
