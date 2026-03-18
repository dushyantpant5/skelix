# Skelix

**Turn any React component into a skeleton loader — automatically.**

Skelix reads your `.tsx` file, parses the JSX with Babel, and writes a pixel-accurate skeleton component right next to it. No copy-pasting, no guessing widths, no manual shimmer divs.

```bash
npx skelix generate components/UserCard.tsx
```

```
UserCard.tsx  →  UserCardSkeleton.tsx  ✔ done in ~200ms
```

---

## What it actually does

Most skeleton tools make you build skeletons by hand. Skelix generates them from source.

It walks your component's JSX tree and maps every element to a skeleton primitive — preserving layout, spacing, sizing, and shape. The result looks like your component, just grey and shimmering.

```tsx
// Your component
export function UserCard({ user }: { user: User }) {
  return (
    <div className="flex gap-3 p-4">
      <img className="h-12 w-12 rounded-full" src={user.avatar} />
      <div className="space-y-1">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  )
}
```

```tsx
// Generated skeleton — zero config
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

---

## Supports every major UI library

Pick your stack — Skelix has a built-in component map for each one.

```bash
npx skelix generate components/UserCard.tsx              # Tailwind (default)
npx skelix generate components/UserCard.tsx --ui shadcn  # shadcn/ui → <Skeleton />
npx skelix generate components/UserCard.tsx --ui mui     # MUI → <Skeleton variant="..." />
npx skelix generate components/UserCard.tsx --ui chakra  # Chakra UI → <SkeletonCircle /> etc.
```

Every adapter ships with its full component library pre-mapped. `--ui shadcn` recognises `Card`, `Dialog`, `Sheet`, `Tabs`, `Sidebar`, `Accordion`, `Form` and every other shadcn/ui component out of the box — no config.

---

## Understands your component structure

Skelix doesn't just flatten everything into grey boxes. It handles real-world patterns:

**Loops** — finds `.map()` calls and repeats the skeleton `n` times. If your array is a static literal, it uses the actual array length.

```tsx
{items.map(item => <ProductCard key={item.id} {...item} />)}
// → skeleton repeated 3× (or the actual array length if items = [...])
```

**Conditionals** — `&&` guards are included (skeleton shows the loaded state). Ternary expressions only follow the primary branch.

```tsx
{user.isVerified && <Badge>Verified</Badge>}  // → always shown in skeleton
{isPremium ? <GoldBadge /> : <FreeTag />}     // → only GoldBadge
```

**Tabs** — reads the `defaultValue` attribute and only renders the matching panel. No stacked layout of all tab content.

```tsx
<Tabs defaultValue="login">
  <TabsContent value="login">...</TabsContent>   // → included
  <TabsContent value="signup">...</TabsContent>  // → skipped
</Tabs>
```

**Render props** — extracts JSX from function attributes like `<FormField render={() => <Input />} />`.

---

## Traverses local imports automatically

If your component uses a custom local component, Skelix reads its source file and inlines the skeleton — recursively.

```tsx
import { AppSidebar } from './app-sidebar'
import { StatsCard } from './stats-card'

export function DashboardPage() {
  return (
    <div className="flex">
      <AppSidebar />         {/* ← Skelix reads app-sidebar.tsx and inlines it */}
      <main>
        <StatsCard />        {/* ← reads stats-card.tsx and inlines it */}
      </main>
    </div>
  )
}
```

Works with relative imports (`./components/Foo`) and tsconfig path aliases (`@/components/Foo`). Circular imports are detected and skipped.

---

## Smart enough to know when to stop

**Layout wrappers** — if a component has no visual content (pure layout shell), Skelix warns you and skips writing the file entirely. No empty skeleton files cluttering your project.

**Function names from source** — the generated component is named from the actual exported function, not the filename. `app-sidebar.tsx` exporting `AppSidebar` generates `AppSidebarSkeleton`, not a mangled version of the filename.

**Components used as wrappers** — if a button-like component wraps real content (`<SidebarMenuButton><Avatar /><span>Name</span></SidebarMenuButton>`), Skelix sees through it and traverses the children instead of rendering a single flat bar.

---

## Config file

Drop a `skelix.config.json` in your project root:

```json
{
  "adapter": "shadcn",
  "outputDir": "src/skeletons",
  "naming": "suffix",
  "repeatCount": 3,
  "componentMap": {
    "PricingBadge": { "type": "rectangle", "defaultSize": "h-6 w-24" },
    "HeroImage":    { "type": "image",     "defaultSize": "h-64 w-full" }
  }
}
```

CLI flags always override config. Skelix automatically picks up your `.prettierrc` and formats the output.

---

## Quick reference

| Flag | Description |
|------|-------------|
| `--ui tailwind` | Plain Tailwind divs (default) |
| `--ui shadcn` | shadcn/ui `<Skeleton>` |
| `--ui mui` | MUI `<Skeleton variant="...">` |
| `--ui chakra` | Chakra UI skeleton components |
| `--out <dir>` | Output directory |
| `--name dot` | `UserCard.skeleton.tsx` instead of `UserCardSkeleton.tsx` |
| `--config <path>` | Custom config file path |

**[→ Full documentation in GUIDE.md](./GUIDE.md)**

---

## Installation

```bash
# No install needed
npx skelix generate components/UserCard.tsx

# Or install globally
npm install -g @skelix/cli
```

> Requires Node.js 18+. Only `.tsx` files are supported.

---

Issues and feedback → [github.com/dushyantpant5/skelix](https://github.com/dushyantpant5/skelix/issues)
