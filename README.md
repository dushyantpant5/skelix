# Skelix

Automatically generate skeleton/shimmer loading components from React components.

```bash
npx skelix generate components/UserCard.tsx
```

**[→ Read the full user guide in GUIDE.md](./GUIDE.md)**

---

## What it does

Skelix reads a `.tsx` component, analyses its JSX layout via AST parsing, and writes a matching skeleton component next to it — automatically.

```
UserCard.tsx  →  UserCardSkeleton.tsx
```

Supports **Tailwind** (default), **ShadCN**, **MUI**, and **Chakra UI**.

---

## Quick start

```bash
# Tailwind (no dependencies)
npx skelix generate components/UserCard.tsx

# ShadCN
npx skelix generate components/UserCard.tsx --ui shadcn

# MUI
npx skelix generate components/UserCard.tsx --ui mui

# Chakra
npx skelix generate components/UserCard.tsx --ui chakra
```

For all options, configuration, custom components, and examples — **see [GUIDE.md](./GUIDE.md)**.

---

## Contributing / Development

```bash
npm install
npm test        # 51 tests
npm run build   # build all packages
npm run lint    # type check
```

### Packages

| Package | Description |
|---------|-------------|
| `@skelix/core` | Parser, transformer, generator |
| `@skelix/adapters` | UI library adapters |
| `@skelix/cli` | CLI entrypoint |
