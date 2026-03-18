# Skelix — User Guide

Skelix reads a React `.tsx` component, analyses its layout through AST parsing, and writes a matching skeleton/shimmer loading component next to it — automatically. No manual skeleton writing, no copy-pasting, no guessing widths.

---

## Table of Contents

1. [Installation](#1-installation)
2. [Your First Skeleton](#2-your-first-skeleton)
3. [CLI Reference](#3-cli-reference)
4. [Choosing a UI Adapter](#4-choosing-a-ui-adapter)
5. [Configuration File](#5-configuration-file)
6. [Custom Components](#6-custom-components)
7. [Deep Traversal of Local Components](#7-deep-traversal-of-local-components)
8. [Output Naming](#8-output-naming)
9. [How Skelix Reads Your Component](#9-how-skelix-reads-your-component)
10. [What Gets Kept vs Stripped](#10-what-gets-kept-vs-stripped)
11. [Loops and Conditionals](#11-loops-and-conditionals)
12. [Complete Examples](#12-complete-examples)
13. [Troubleshooting](#13-troubleshooting)
14. [FAQ](#14-faq)

---

## 1. Installation

**Run without installing (recommended):**

```bash
npx skelix generate components/UserCard.tsx
```

**Install globally:**

```bash
npm install -g @skelix/cli
skelix generate components/UserCard.tsx
```

**Install locally in a project:**

```bash
npm install --save-dev @skelix/cli
npx skelix generate components/UserCard.tsx
```

> **Requirements:** Node.js 18+. Your component must be a `.tsx` file.

---

## 2. Your First Skeleton

Given this component at `components/UserCard.tsx`:

```tsx
export function UserCard({ user }: { user: User }) {
  return (
    <div className="flex gap-3 p-4">
      <img className="h-12 w-12 rounded-full" src={user.avatar} alt="" />
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">{user.name}</h3>
        <p className="text-gray-500 text-xs">{user.email}</p>
      </div>
    </div>
  )
}
```

Run:

```bash
npx skelix generate components/UserCard.tsx
```

Skelix creates `components/UserCardSkeleton.tsx`:

```tsx
export function UserCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-gray-200" />
      <div className="space-y-1">
        <div className="h-6 w-[200px] rounded bg-gray-200" />
        <div className="h-4 w-[150px] rounded bg-gray-200" />
      </div>
    </div>
  )
}
```

Use it in your app:

```tsx
import { UserCardSkeleton } from './UserCardSkeleton'

function UserCardList() {
  if (isLoading) return <UserCardSkeleton />
  return <UserCard user={user} />
}
```

---

## 3. CLI Reference

```
skelix generate <file> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `<file>` | Path to the React `.tsx` component. Required. |

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--ui <adapter>` | `tailwind` | UI library to generate for. Choices: `tailwind`, `shadcn`, `mui`, `chakra` |
| `--out <dir>` | Same dir as source file | Where to write the generated file |
| `--name <pattern>` | `suffix` | File naming style: `suffix` or `dot` (see [Output Naming](#8-output-naming)) |
| `--config <path>` | `skelix.config.json` | Path to your Skelix config file |

### Examples

```bash
# Basic — Tailwind, output next to source
skelix generate src/components/UserCard.tsx

# ShadCN adapter
skelix generate src/components/UserCard.tsx --ui shadcn

# Output to a separate skeletons directory
skelix generate src/components/UserCard.tsx --out src/skeletons

# Use dot notation for file name (UserCard.skeleton.tsx)
skelix generate src/components/UserCard.tsx --name dot

# Point to a custom config
skelix generate src/components/UserCard.tsx --config config/skelix.json

# Combine options
skelix generate src/components/ProductTile.tsx --ui shadcn --out src/skeletons --name dot
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | File not found, parse error, unknown adapter, or write failure |

---

## 4. Choosing a UI Adapter

Skelix supports four adapters. Each generates skeleton markup for a different UI library and includes a built-in component map with all of that library's components pre-configured.

### `tailwind` (default)

No external dependencies. Uses plain `<div>` elements with Tailwind utility classes.

```tsx
export function UserCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-gray-200" />
      <div className="space-y-1">
        <div className="h-6 w-[200px] rounded bg-gray-200" />
        <div className="h-4 w-[150px] rounded bg-gray-200" />
      </div>
    </div>
  )
}
```

Use this if you're using Tailwind CSS without a component library, or if you want maximum control over styling.

---

### `shadcn`

Uses the `<Skeleton>` component from [shadcn/ui](https://ui.shadcn.com/docs/components/skeleton). Requires `@/components/ui/skeleton` to be set up in your project.

All shadcn/ui components (Card, Dialog, Sheet, Form, Sidebar, Tabs, Table, Accordion, etc.) are recognised automatically.

```bash
skelix generate components/UserCard.tsx --ui shadcn
```

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function UserCardSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}
```

---

### `mui`

Uses `<Skeleton>` from [MUI](https://mui.com/material-ui/react-skeleton/). Requires `@mui/material` to be installed.

All MUI components (Box, Grid, Stack, TextField, Card, Dialog, Table, etc.) are recognised automatically.

```bash
skelix generate components/UserCard.tsx --ui mui
```

```tsx
import { Skeleton } from '@mui/material'
import { Box } from '@mui/material'

export function UserCardSkeleton() {
  return (
    <Box sx={{ display: 'flex', gap: '12px' }}>
      <Skeleton variant="circular" width="48px" height="48px" />
      <Box>
        <Skeleton variant="text" width="200px" />
        <Skeleton variant="text" width="150px" />
      </Box>
    </Box>
  )
}
```

MUI uses pixel values. Skelix automatically converts Tailwind size classes (e.g. `h-12` → `48px`).

---

### `chakra`

Uses `<Skeleton>`, `<SkeletonCircle>`, and `<SkeletonText>` from [Chakra UI](https://chakra-ui.com/docs/components/skeleton). Requires `@chakra-ui/react` to be installed.

All Chakra UI components (Box, Flex, Stack, Input, Modal, Drawer, Table, Accordion, etc.) are recognised automatically.

```bash
skelix generate components/UserCard.tsx --ui chakra
```

```tsx
import { Skeleton, SkeletonCircle, SkeletonText, Box, Flex } from '@chakra-ui/react'

export function UserCardSkeleton() {
  return (
    <Flex gap="12px">
      <SkeletonCircle size="48px" />
      <Box>
        <SkeletonText noOfLines={1} />
        <SkeletonText noOfLines={1} />
      </Box>
    </Flex>
  )
}
```

---

## 5. Configuration File

Create a `skelix.config.json` in your project root to set defaults for every run. CLI flags always override config file values.

```json
{
  "adapter": "shadcn",
  "outputDir": "src/skeletons",
  "naming": "suffix",
  "repeatCount": 3,
  "componentMap": {},
  "skeleton": {
    "baseColor": "bg-gray-200",
    "animation": "animate-pulse"
  }
}
```

### All Config Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `adapter` | `string` | `"tailwind"` | Default UI adapter |
| `outputDir` | `string \| null` | `null` | Output directory. `null` = same dir as source |
| `naming` | `"suffix" \| "dot"` | `"suffix"` | File naming style |
| `repeatCount` | `number` | `3` | How many items to repeat for `.map()` loops |
| `componentMap` | `object` | `{}` | Project-specific component type overrides (see below) |
| `skeleton.baseColor` | `string` | `"bg-gray-200"` | Tailwind class for skeleton background (Tailwind adapter) |
| `skeleton.animation` | `string` | `"animate-pulse"` | Tailwind class for skeleton animation (Tailwind adapter) |

### Resolution Order

Later values win:

```
Built-in defaults  ←  Adapter component map  ←  skelix.config.json  ←  CLI flags
```

---

## 6. Custom Components

### Built-in known components

These universal primitives are recognised out of the box across all adapters:

| Component | Type | Default Size |
|-----------|------|-------------|
| `Avatar` | `circle` | `h-10 w-10` |
| `Badge` | `rectangle` | `h-5 w-16 rounded-full` |
| `Button` | `rectangle` | `h-10 w-24 rounded-md` |
| `Card` | `container` | — |
| `CardHeader` | `container` | — |
| `CardContent` | `container` | — |
| `CardFooter` | `container` | — |
| `Image` | `image` | `h-48 w-full` |
| `Icon` | `rectangle` | `h-5 w-5` |
| `Chip` | `rectangle` | `h-6 w-20 rounded-full` |
| `Input` | `rectangle` | `h-10 w-full rounded-md` |
| `Select` | `rectangle` | `h-10 w-full rounded-md` |
| `Textarea` | `rectangle` | `h-24 w-full rounded-md` |
| `Typography` | `text` | — |
| `Link` / `NextLink` | `text` | `h-4 w-[120px]` |

In addition, the selected adapter adds its own complete library map. For example, `--ui shadcn` also recognises `Dialog`, `Sheet`, `Tabs`, `Sidebar`, `Accordion`, and every other shadcn/ui component without any config.

### Adding project-specific components

When Skelix encounters a component it doesn't recognise and can't resolve via import traversal, it falls back to a `rectangle` and prints a warning:

```
⚠ Unknown component <PricingBadge> — rendered as placeholder. Add it to skelix.config.json to customize.
```

Add it to `componentMap` in your config:

```json
{
  "componentMap": {
    "PricingBadge":  { "type": "rectangle", "defaultSize": "h-6 w-24" },
    "CustomAvatar":  { "type": "circle",    "defaultSize": "h-12 w-12" },
    "HeroImage":     { "type": "image",     "defaultSize": "h-64 w-full" },
    "ProductCard":   { "type": "container" },
    "UserName":      { "type": "text" }
  }
}
```

### Component types

| Type | What it renders | Use for |
|------|----------------|---------|
| `circle` | Round skeleton blob | Avatars, profile pictures, icons |
| `rectangle` | Rectangular block | Buttons, badges, chips, inputs |
| `image` | Wide rectangular block | Hero images, thumbnails |
| `text` | Thin line | Labels, names, descriptions |
| `container` | Layout wrapper (no fill) | Cards, panels, sections |

### `defaultSize`

The `defaultSize` field is a space-separated list of Tailwind classes applied when the component has no `className` prop. If the component has a `className`, those classes take priority.

```json
"Avatar": { "type": "circle", "defaultSize": "h-10 w-10" }
```

```tsx
// Component has no className → uses defaultSize
<Avatar />
// → <div className="h-10 w-10 rounded-full bg-gray-200" />

// Component has className → uses className classes
<Avatar className="h-16 w-16" />
// → <div className="h-16 w-16 rounded-full bg-gray-200" />
```

---

## 7. Deep Traversal of Local Components

When your component uses another locally-defined component that isn't in the built-in maps, Skelix automatically reads its source file and inlines the result — no config needed.

**How it works:**

1. Skelix parses the import statements in your file
2. For each local import (relative paths like `./components/Foo` or tsconfig aliases like `@/components/Foo`), it resolves the file path
3. When an unknown component tag is encountered in the JSX, Skelix reads and parses that file, extracts its JSX, and inlines the resulting skeleton structure
4. This works recursively — nested local components are traversed too
5. Circular imports are detected and skipped automatically

**Example:** Your page imports `<AppSidebar>` from `./app-sidebar`. Skelix will open `app-sidebar.tsx`, parse it, and inline that component's full skeleton structure rather than rendering a generic placeholder.

**When traversal doesn't apply:**

- Components imported from `node_modules` are not traversed (they should be covered by the adapter's built-in map)
- If a local file can't be parsed, Skelix falls back to the rectangle placeholder and logs a warning
- You can still override any component via `componentMap` in your config regardless of traversal

---

## 8. Output Naming

Two naming styles are available.

### `suffix` (default)

Appends `Skeleton` to the component name:

```
UserCard.tsx       →  UserCardSkeleton.tsx
ProductTile.tsx    →  ProductTileSkeleton.tsx
ProfileHeader.tsx  →  ProfileHeaderSkeleton.tsx
```

The generated function name comes from the actual exported function in the source file, not the filename. So `app-sidebar.tsx` exporting `AppSidebar` generates `AppSidebarSkeleton`, not `AppSidebarSkeleton` from the hyphenated filename.

### `dot`

Inserts `.skeleton` before the extension:

```
UserCard.tsx       →  UserCard.skeleton.tsx
ProductTile.tsx    →  ProductTile.skeleton.tsx
ProfileHeader.tsx  →  ProfileHeader.skeleton.tsx
```

Set via config:

```json
{ "naming": "dot" }
```

Or per run:

```bash
skelix generate components/UserCard.tsx --name dot
```

---

## 9. How Skelix Reads Your Component

Understanding what Skelix does helps you write components that generate better skeletons.

### What Skelix looks for

Skelix uses Babel to parse your file into an AST, then walks the JSX tree of the **first exported component it finds** (function declaration, arrow function, or default export).

For each JSX element it encounters, Skelix:

1. Identifies the element type (native HTML tag or component name)
2. Reads the `className` attribute
3. Keeps layout/sizing Tailwind classes, strips visual ones
4. Maps the element to a skeleton primitive (`circle`, `text`, `rectangle`, `image`, or `container`)
5. Recursively processes children
6. For unknown local components — reads their source file and inlines the skeleton (see [Deep Traversal](#7-deep-traversal-of-local-components))

### Element → Skeleton mapping

| JSX | Skeleton type | Condition |
|-----|--------------|-----------|
| `<img>` with `rounded-full` + equal h/w | `circle` | |
| `<img>` otherwise | `image` | |
| `<p>`, `<span>`, `<label>`, `<a>` | `text` | |
| `<h1>` – `<h6>` | `text` | Taller by default |
| `<button>`, `<input>`, `<textarea>` | `rectangle` | |
| `<svg>`, `<icon>` | `rectangle` | Small square |
| `<div>`, `<section>`, `<article>`, etc. | `container` | Layout preserved |
| `<ul>`, `<ol>`, `<li>` | `container` | |
| Known component (built-in or adapter) | per map entry | |
| Unknown local component | inlined via traversal | |
| Unknown component with no source | `rectangle` + warning | |

### Text width defaults

When a text element has no width class, Skelix infers a reasonable default:

| Element | Default width |
|---------|--------------|
| `h1` | `w-[280px]` |
| `h2` | `w-[240px]` |
| `h3` | `w-[200px]` |
| `p` | `w-[150px]` |
| `span`, `label` | `w-[120px]` |

Add explicit width classes to your component if you want precise control over the skeleton width.

---

## 10. What Gets Kept vs Stripped

Skelix preserves classes that affect **layout and structure**, and strips classes that affect **appearance**.

### Kept

| Category | Examples |
|----------|---------|
| Display / layout | `flex`, `grid`, `block`, `hidden`, `inline-flex` |
| Flex/grid config | `flex-col`, `items-center`, `justify-between`, `grid-cols-3` |
| Spacing | `gap-4`, `space-y-2`, `p-4`, `px-6`, `m-auto` |
| Sizing | `h-12`, `w-full`, `max-w-lg`, `aspect-square` |
| Shape | `rounded`, `rounded-full`, `rounded-md` |
| Overflow | `overflow-hidden`, `overflow-auto` |
| Position | `relative`, `absolute`, `sticky` |

### Stripped

| Category | Examples |
|----------|---------|
| Colors | `bg-blue-500`, `text-gray-600`, `border-red-300` |
| Typography | `font-bold`, `text-sm`, `leading-relaxed`, `tracking-wide` |
| Effects | `shadow-lg`, `opacity-50`, `ring-2` |
| Transitions | `transition`, `duration-200`, `ease-in-out` |
| Interactive states | `hover:bg-blue-600`, `focus:ring`, `active:scale-95` |

**Tip:** If your skeleton is missing structure, check that your layout classes (`flex`, `grid`, `h-*`, `w-*`) are directly on the element, not only on responsive variants like `md:flex`. Responsive prefixes are currently stripped.

---

## 11. Loops and Conditionals

### Loops (`.map()`)

When Skelix finds a `.map()` call, it generates **one skeleton iteration** and repeats it `repeatCount` times (default: 3).

If the array being mapped is a static literal (`const items = [a, b, c]`), Skelix uses the actual array length instead of `repeatCount`.

**Source:**
```tsx
<div className="space-y-4">
  {comments.map((comment) => (
    <div key={comment.id} className="flex gap-3">
      <img className="h-8 w-8 rounded-full" src={comment.avatar} />
      <p className="text-sm">{comment.body}</p>
    </div>
  ))}
</div>
```

**Generated (Tailwind):**
```tsx
export function CommentThreadSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-4 w-[150px] rounded bg-gray-200" />
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-4 w-[150px] rounded bg-gray-200" />
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-4 w-[150px] rounded bg-gray-200" />
      </div>
    </div>
  )
}
```

Change the repeat count in your config:

```json
{ "repeatCount": 5 }
```

### Conditionals (`&&` and ternary)

For `&&` expressions, the guarded element is always included — the skeleton represents the loaded layout.

```tsx
{user.isVerified && <Badge>Verified</Badge>}
```
→ The `<Badge>` skeleton is **always included**.

For ternary expressions, only the primary (truthy) branch is included:

```tsx
{isPremium ? <GoldBadge /> : <FreeTag />}
```
→ Only `<GoldBadge>` is included. The skeleton represents the default/expected state.

### Tabs

When a `<Tabs>` component has a `defaultValue` attribute, only the matching `<TabsContent>` panel is included in the skeleton — avoiding a stacked layout of all panels.

---

## 12. Complete Examples

### ProductTile with conditional badge

**Source:**
```tsx
export function ProductTile({ product }: { product: Product }) {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <img className="h-48 w-full" src={product.image} />
      <div className="p-4 space-y-2">
        <h3 className="font-bold">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
        {product.onSale && <span className="font-bold">SALE</span>}
        <button className="w-full h-10 rounded-md">Add to Cart</button>
      </div>
    </div>
  )
}
```

```bash
skelix generate components/ProductTile.tsx --ui shadcn
```

**Generated:**
```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ProductTileSkeleton() {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-3 w-[120px]" />
        <Skeleton className="w-full h-10 rounded-md" />
      </div>
    </div>
  )
}
```

---

### ProfileHeader with known components

**Source:**
```tsx
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 p-6">
      <Avatar className="h-16 w-16" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-500">{user.bio}</p>
        {user.isVerified && <Badge>Verified</Badge>}
      </div>
    </div>
  )
}
```

```bash
skelix generate components/ProfileHeader.tsx
```

**Generated:**
```tsx
export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 animate-pulse">
      <div className="h-16 w-16 rounded-full bg-gray-200" />
      <div className="flex flex-col gap-1">
        <div className="h-7 w-[240px] rounded bg-gray-200" />
        <div className="h-4 w-[150px] rounded bg-gray-200" />
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </div>
    </div>
  )
}
```

`Avatar` → `circle` and `Badge` → `rectangle` are resolved automatically from the built-in component map.

---

### Page with local custom components

**Source:**
```tsx
import { AppSidebar } from './app-sidebar'
import { StatsCard } from './stats-card'

export function DashboardPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6 space-y-4">
        <StatsCard />
      </main>
    </div>
  )
}
```

```bash
skelix generate app/dashboard/page.tsx --ui shadcn
```

Skelix reads `app-sidebar.tsx` and `stats-card.tsx`, inlines their skeleton structures, and generates a full-page skeleton without any manual config.

---

### Sending output to a dedicated skeletons folder

```json
// skelix.config.json
{
  "adapter": "shadcn",
  "outputDir": "src/skeletons",
  "naming": "suffix"
}
```

```bash
skelix generate src/components/UserCard.tsx
# → writes to src/skeletons/UserCardSkeleton.tsx

skelix generate src/components/ProductTile.tsx
# → writes to src/skeletons/ProductTileSkeleton.tsx
```

---

## 13. Troubleshooting

### `✖ File not found: components/Foo.tsx`

The path you passed doesn't exist. Use a path relative to where you're running the command, or an absolute path.

```bash
# If you're in the project root:
skelix generate src/components/Foo.tsx

# Not:
skelix generate Foo.tsx  # unless you're inside components/
```

### `✖ File must be a .tsx file`

Skelix only processes `.tsx` files. Rename your file or ensure you're pointing to the right one.

### `✖ Failed to parse JSX in ...`

Your file has a syntax error. Check the Babel error message included in the output. Common causes: unclosed JSX tags, invalid TypeScript generics, or non-standard syntax.

### `✖ Unknown adapter "..."`

The value passed to `--ui` is not one of `tailwind`, `shadcn`, `mui`, `chakra`. Check your spelling.

### `⚠ Unknown component <Foo> — rendered as placeholder`

Skelix doesn't recognise `<Foo>` and couldn't find its source file via import traversal. It will render it as a rectangle placeholder.

To fix this, either:
- Make sure `Foo` is imported from a local file (relative import or tsconfig alias) so Skelix can traverse it
- Or add it to `componentMap` in your `skelix.config.json` (see [Custom Components](#6-custom-components))

### `⚠ ... appears to be a layout wrapper`

Your component contains only container elements with no visual content (text, images, inputs). The skeleton will be empty. This usually means the component is a pure layout wrapper — generate skeletons for its children instead.

### The skeleton has the wrong structure

- Make sure your component has a clear JSX `return` statement (not just a bare expression)
- Ensure layout classes (`flex`, `grid`, `h-*`, `w-*`) are on the elements directly, not only on responsive variants like `md:flex`. Responsive prefixes are currently stripped.
- If you're using CSS Modules or inline styles for layout, Skelix won't detect them — Tailwind classes only

### The generated file isn't formatted the way I like

Skelix uses Prettier and automatically picks up your `.prettierrc` if one exists in the project root. If your formatting still looks off, check that your `.prettierrc` is valid JSON/YAML and is in the directory where you run `skelix`.

---

## 14. FAQ

**Does Skelix modify my original component?**
No. It only reads your source file and writes a new file alongside it (or in your `outputDir`).

**Does Skelix work with JavaScript (`.jsx`) files?**
Not currently. Only `.tsx` files are supported.

**Will it work if my component uses CSS Modules or inline styles instead of Tailwind?**
Skelix only reads Tailwind `className` attributes for layout hints. CSS Modules and inline styles are ignored. The component will still generate a skeleton, but layout structure may be less accurate.

**My component returns `null` conditionally. What happens?**
Skelix finds the first JSX return it encounters. If your component only conditionally returns JSX and the first return path returns `null`, the generation will fail with "Could not find a JSX return". Move your main JSX return to be the primary path.

**Can I run Skelix on multiple files at once?**
Not currently. Run it once per file. Glob support (`components/**/*.tsx`) is planned for a future release.

**The skeleton shows 3 repeated items for my list. Can I change that?**
Yes — set `repeatCount` in `skelix.config.json`:
```json
{ "repeatCount": 5 }
```
If your array is defined as a static literal in the component, Skelix uses the actual array length automatically.

**Does Skelix support Server Components (Next.js RSC)?**
Yes. Generated skeleton components are plain client-side React. You can use them in client components or in loading states (`loading.tsx`).

**My `Avatar` component is being mapped to `rectangle` instead of `circle`.**
Make sure the tag is exactly `Avatar` (capitalised). If you're importing it under a different alias (e.g. `UserAvatar`), add it to your `componentMap`:
```json
{ "componentMap": { "UserAvatar": { "type": "circle", "defaultSize": "h-10 w-10" } } }
```

**Does Skelix traverse into `node_modules` components?**
No. Only local components (relative imports and tsconfig aliases resolving to your project files) are traversed. Library components are covered by the adapter's built-in component map.
