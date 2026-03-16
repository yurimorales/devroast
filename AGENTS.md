# DevRoast — Project Guidelines

## Stack

- **Framework:** Next.js 16 (App Router, React Compiler, Turbopack)
- **Styling:** Tailwind CSS v4 with `@theme` variables, `tailwind-variants` for component variants
- **Linting:** Biome 2.4 (formatter + linter, `tailwindDirectives: true`)
- **Package manager:** pnpm
- **Language:** TypeScript (strict)

## Conventions

- **Language:** Portuguese for communication, English for code
- **Exports:** Always named exports. Never `export default` (except Next.js pages).
- **Components:** Extend native HTML props via `ComponentProps<"element">`. Use `tv()` for variants. Use composition pattern (sub-components) for complex components with 2+ content areas.
- **Class merging:** Use `tv({ className })` for components with variants. Use `twMerge()` for components without variants. Never string interpolation.
- **Colors:** Defined in `@theme` block (`--color-*`), used as canonical Tailwind classes (`bg-accent-green`, not `bg-(--color-accent-green)`). Exception: SVG attributes use `var(--color-*)`.
- **Fonts:** `font-sans` (system) and `font-mono` (JetBrains Mono) only. No custom font classes.
- **Buttons:** `enabled:hover:` and `enabled:active:` prefixes to prevent hover styles when disabled.

## Project Structure

```
src/
  app/              # Next.js App Router pages and layouts (see app/AGENTS.md)
    api/            # API routes
  components/       # Feature-level components
    ui/             # Reusable UI primitives (see components/ui/AGENTS.md)
  db/                 # Drizzle ORM schema, client, and seed
  server/           # tRPC backend (see server/AGENTS.md)
  lib/
    trpc/           # tRPC client setup (see lib/trpc/AGENTS.md)
```

## Data Fetching

- **Server Components:** Use `prefetch()` + `<HydrateClient>` to prefetch tRPC queries on the server and hydrate to client components. Import from `@/trpc/server`.
- **Client Components:** Use `useQuery()` / `useSuspenseQuery()` with `trpc.router.procedure.queryOptions()`. Import `useTRPC` from `@/trpc/client`.
- **Server-only data:** Use `caller` from `@/trpc/server` for data consumed exclusively in RSC (e.g. dynamic metadata).
- **Animated numbers:** Use `@number-flow/react` (`<NumberFlow>`) for numeric values that transition from 0 to the loaded value. Prefer `useQuery` with `?? 0` fallback over Suspense/skeleton for these cases.
- **Loading states:** Prefer `useQuery` + `NumberFlow` (0 → value animation) for numeric stats. Use `Suspense` + skeleton components for content-heavy sections (lists, cards, etc.).

## Key Decisions

- `CodeBlock` is an async React Server Component using shiki with vesper theme
- `Toggle` uses `@base-ui/react` Switch primitive for accessibility
- `ScoreRing` has a single fixed size (180px)
- Biome config has `noUnknownAtRules` ignore list for Tailwind directives (`@theme`, `@apply`, `@utility`)
- tRPC context exposes `db` (Drizzle client) — no superjson needed (Drizzle returns plain serializable objects)
- Feature specs must be written in `specs/` before implementing new features
