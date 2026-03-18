import type { ComponentMapEntry, SkelixConfig } from '../ir/types.js'

export const DEFAULT_COMPONENT_MAP: Record<string, ComponentMapEntry> = {
  // Routing / generic wrappers
  Link: { type: 'text', defaultSize: 'h-4 w-[120px]' },
  NextLink: { type: 'text', defaultSize: 'h-4 w-[120px]' },
  RouterLink: { type: 'text', defaultSize: 'h-4 w-[120px]' },

  // Generic primitives
  Avatar: { type: 'circle', defaultSize: 'h-10 w-10' },
  Badge: { type: 'rectangle', defaultSize: 'h-5 w-16 rounded-full' },
  Button: { type: 'rectangle', defaultSize: 'h-10 w-24 rounded-md' },
  Image: { type: 'image', defaultSize: 'h-48 w-full' },
  Icon: { type: 'rectangle', defaultSize: 'h-5 w-5' },
  Chip: { type: 'rectangle', defaultSize: 'h-6 w-20 rounded-full' },
  Typography: { type: 'text' },
  TextField: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Select: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },

  // ShadCN — Card
  Card: { type: 'container' },
  CardHeader: { type: 'container' },
  CardContent: { type: 'container' },
  CardFooter: { type: 'container' },
  CardTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  CardDescription: { type: 'text', defaultSize: 'h-4 w-64' },

  // ShadCN — Tabs
  Tabs: { type: 'container' },
  TabsList: { type: 'container' },
  TabsTrigger: { type: 'rectangle', defaultSize: 'h-9 w-full rounded-md' },
  TabsContent: { type: 'container' },

  // ShadCN — Dialog / Sheet
  Dialog: { type: 'container' },
  DialogContent: { type: 'container' },
  DialogHeader: { type: 'container' },
  DialogTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  DialogDescription: { type: 'text', defaultSize: 'h-4 w-64' },
  DialogFooter: { type: 'container' },
  Sheet: { type: 'container' },
  SheetContent: { type: 'container' },
  SheetHeader: { type: 'container' },
  SheetTitle: { type: 'text', defaultSize: 'h-6 w-48' },
  SheetFooter: { type: 'container' },

  // ShadCN — Form / Input
  Form: { type: 'container' },
  FormField: { type: 'container' },
  FormItem: { type: 'container' },
  FormLabel: { type: 'text', defaultSize: 'h-4 w-24' },
  FormControl: { type: 'container' },
  FormMessage: { type: 'text', defaultSize: 'h-4 w-48' },
  FormDescription: { type: 'text', defaultSize: 'h-4 w-64' },
  Input: { type: 'rectangle', defaultSize: 'h-10 w-full rounded-md' },
  Textarea: { type: 'rectangle', defaultSize: 'h-24 w-full rounded-md' },
  Label: { type: 'text', defaultSize: 'h-4 w-24' },

  // ShadCN — Navigation / Sidebar
  Sidebar: { type: 'container' },
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
  NavigationMenu: { type: 'container' },
  NavigationMenuList: { type: 'container' },
  NavigationMenuItem: { type: 'container' },
  NavigationMenuTrigger: { type: 'rectangle', defaultSize: 'h-9 w-24 rounded-md' },
  NavigationMenuContent: { type: 'container' },
  NavigationMenuLink: { type: 'text', defaultSize: 'h-4 w-24' },

  // ShadCN — Table
  Table: { type: 'container' },
  TableHeader: { type: 'container' },
  TableBody: { type: 'container' },
  TableFooter: { type: 'container' },
  TableRow: { type: 'container' },
  TableHead: { type: 'text', defaultSize: 'h-4 w-24' },
  TableCell: { type: 'text', defaultSize: 'h-4 w-32' },
  TableCaption: { type: 'text', defaultSize: 'h-4 w-48' },

  // ShadCN — Dropdown / Select / Popover
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

  // ShadCN — Misc
  Separator: { type: 'rectangle', defaultSize: 'h-px w-full' },
  Skeleton: { type: 'rectangle' },
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
