import type { SkeletonNode, ComponentMapEntry } from '@skelix/core'
import type { AdapterOutput, SkeletonAdapter } from './types.js'

export const SHADCN_COMPONENT_MAP: Record<string, ComponentMapEntry> = {
  // Card — override core with ShadCN-specific chrome
  Card: { type: 'container', containerClasses: 'rounded-xl border shadow-sm' },
  CardHeader: { type: 'container', containerClasses: 'p-6' },
  CardContent: { type: 'container', containerClasses: 'p-6 pt-0' },
  CardFooter: { type: 'container', containerClasses: 'p-6 pt-0' },
  CardTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  CardDescription: { type: 'text', defaultSize: 'h-4 w-64' },

  // Tabs
  Tabs: { type: 'container' },
  TabsList: { type: 'container' },
  TabsTrigger: { type: 'rectangle', defaultSize: 'h-9 w-full rounded-md' },
  TabsContent: { type: 'container' },

  // Dialog / Sheet
  Dialog: { type: 'container' },
  DialogContent: { type: 'container', containerClasses: 'rounded-lg border shadow-lg p-6' },
  DialogHeader: { type: 'container' },
  DialogTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  DialogDescription: { type: 'text', defaultSize: 'h-4 w-64' },
  DialogFooter: { type: 'container' },
  Sheet: { type: 'container' },
  SheetContent: { type: 'container', containerClasses: 'border-l p-6' },
  SheetHeader: { type: 'container' },
  SheetTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  SheetFooter: { type: 'container' },

  // Form
  Form: { type: 'container' },
  FormField: { type: 'container' },
  FormItem: { type: 'container' },
  FormLabel: { type: 'text', defaultSize: 'h-4 w-24' },
  FormControl: { type: 'container' },
  FormMessage: { type: 'text', defaultSize: 'h-4 w-48' },
  FormDescription: { type: 'text', defaultSize: 'h-4 w-64' },
  Label: { type: 'text', defaultSize: 'h-4 w-24' },

  // Sidebar
  Sidebar: { type: 'container', containerClasses: 'flex flex-col' },
  SidebarContent: { type: 'container' },
  SidebarFooter: { type: 'container' },
  SidebarGroup: { type: 'container' },
  SidebarGroupContent: { type: 'container' },
  SidebarGroupLabel: { type: 'text', defaultSize: 'h-4 w-32' },
  SidebarHeader: { type: 'container' },
  SidebarMenu: { type: 'container' },
  SidebarMenuButton: { type: 'rectangle', defaultSize: 'h-9 w-full rounded-md' },
  SidebarMenuItem: { type: 'container' },
  SidebarTrigger: { type: 'rectangle', defaultSize: 'h-9 w-9 rounded-md' },

  // Navigation
  NavigationMenu: { type: 'container' },
  NavigationMenuList: { type: 'container' },
  NavigationMenuItem: { type: 'container' },
  NavigationMenuTrigger: { type: 'rectangle', defaultSize: 'h-9 w-24 rounded-md' },
  NavigationMenuContent: { type: 'container' },
  NavigationMenuLink: { type: 'text', defaultSize: 'h-4 w-24' },

  // Table
  Table: { type: 'container' },
  TableHeader: { type: 'container' },
  TableBody: { type: 'container' },
  TableFooter: { type: 'container' },
  TableRow: { type: 'container' },
  TableHead: { type: 'text', defaultSize: 'h-4 w-24' },
  TableCell: { type: 'text', defaultSize: 'h-4 w-32' },
  TableCaption: { type: 'text', defaultSize: 'h-4 w-48' },

  // Dropdown / Select / Popover
  DropdownMenu: { type: 'container' },
  DropdownMenuTrigger: { type: 'rectangle', defaultSize: 'h-9 w-24 rounded-md' },
  DropdownMenuContent: { type: 'container' },
  DropdownMenuItem: { type: 'rectangle', defaultSize: 'h-9 w-full rounded-md' },
  DropdownMenuLabel: { type: 'text', defaultSize: 'h-4 w-24' },
  DropdownMenuSeparator: { type: 'rectangle', defaultSize: 'h-px w-full' },
  SelectTrigger: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  SelectContent: { type: 'container' },
  SelectItem: { type: 'rectangle', defaultSize: 'h-9 w-full rounded-md' },
  Popover: { type: 'container' },
  PopoverTrigger: { type: 'rectangle', defaultSize: 'h-9 w-24 rounded-md' },
  PopoverContent: { type: 'container' },

  // OTP Input
  InputOTP: { type: 'container', containerClasses: 'flex gap-2' },
  InputOTPGroup: { type: 'container', containerClasses: 'flex gap-1' },
  InputOTPSlot: { type: 'rectangle', defaultSize: 'h-10 w-10 rounded-md' },
  InputOTPSeparator: { type: 'rectangle', defaultSize: 'h-4 w-2' },

  // Misc
  ScrollArea: { type: 'container' },
  Command: { type: 'container' },
  CommandInput: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  CommandList: { type: 'container' },
  CommandItem: { type: 'rectangle', defaultSize: 'h-9 w-full rounded-md' },
  Accordion: { type: 'container' },
  AccordionItem: { type: 'container' },
  AccordionTrigger: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  AccordionContent: { type: 'container' },
  Tooltip: { type: 'container' },
  TooltipTrigger: { type: 'container' },
  TooltipContent: { type: 'container' },
  HoverCard: { type: 'container' },
  HoverCardTrigger: { type: 'container' },
  HoverCardContent: { type: 'container' },
  Alert: { type: 'container' },
  AlertTitle: { type: 'text', defaultSize: 'h-5 w-40' },
  AlertDescription: { type: 'text', defaultSize: 'h-4 w-64' },

  // Layout providers — transparent pass-through
  SidebarProvider: { type: 'container' },
  ThemeProvider: { type: 'container' },
  QueryClientProvider: { type: 'container' },
  SessionProvider: { type: 'container' },
}

function renderNode(node: SkeletonNode): string {
  if (node.type === 'repeat') {
    const count = node.repeatCount ?? 3
    const inner = node.children.map(renderNode).join('\n')
    return Array.from({ length: count }, () => inner).join('\n')
  }

  if (node.type === 'container') {
    const classes = [...node.layoutClasses, ...node.sizeClasses, ...node.shapeClasses].join(' ')
    const children = node.children.map(renderNode).join('\n')
    return `<div${classes ? ` className="${classes}"` : ''}>\n${children}\n</div>`
  }

  const classes = [...node.layoutClasses, ...node.sizeClasses, ...node.shapeClasses]
  if (node.type === 'circle' && !classes.includes('rounded-full')) classes.push('rounded-full')
  return `<Skeleton className="${classes.join(' ')}" />`
}

export class ShadcnAdapter implements SkeletonAdapter {
  name = 'shadcn'
  componentMap = SHADCN_COMPONENT_MAP

  render(node: SkeletonNode): AdapterOutput {
    return {
      jsx: renderNode(node),
      imports: ["import { Skeleton } from '@/components/ui/skeleton'"],
    }
  }
}
