# app/ — Next.js App Router

Guide for pages and layouts in the Next.js App Router.

## Structure

```
src/app/
├── page.tsx              # Homepage
├── layout.tsx            # Root layout with providers
├── home-editor.tsx       # Home page component
├── leaderboard/
│   └── page.tsx          # Leaderboard page
├── roast/
│   └── [id]/
│       └── page.tsx      # Dynamic route for roast results
└── api/
    └── trpc/
        └── [trpc]/
            └── route.ts  # tRPC API handler
```

## Providers Setup

Root layout should include TRPCProvider:

```tsx
import { TRPCReactProvider } from "@/lib/trpc/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <TRPCReactProvider>
          <Navbar />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

## Dynamic Routes

For routes with parameters, use bracket notation:

```
roast/[id]/page.tsx
```

Access params in page component:

```ts
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoastPage({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

## Static vs Dynamic Data

### Static Data (Development)

For development, use hardcoded data:

```ts
const STATIC_ROAST_DATA = {
  score: 3.5,
  verdict: "needs_serious_help",
  // ...
};

export default function RoastPage() {
  const data = STATIC_ROAST_DATA;
  // ...
}
```

### Dynamic Data (Production)

Fetch from database in Server Components:

```ts
import { db } from "@/db";
import { analyses } from "@/db/schema";

export default async function RoastPage({ params }: PageProps) {
  const { id } = await params;
  const analysis = await db.query.analyses.findFirst({
    where: eq(analyses.id, id),
  });
  // ...
}
```

## Suspense Usage

Use Suspense for data that loads separately from the page:

```tsx
import { Suspense } from "react";
import { Metrics } from "@/components/metrics";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Editor />
      <Suspense fallback={null}>
        <Metrics />
      </Suspense>
    </main>
  );
}
```

**Note:** For animated number transitions (like metrics), prefer using NumberFlow with initial value 0 instead of Suspense/Skeleton. See `lib/trpc/AGENTS.md`.

## API Routes

### tRPC Handler

`src/app/api/trpc/[trpc]/route.ts`

```ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/server/init";
import { appRouter } from "@/server/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

## Rules

- Use Server Components by default
- Only add `"use client"` when needed (hooks, event handlers)
- Keep pages as simple as possible, extract logic to components
- Dynamic routes for resource pages (e.g., `/roast/[id]`)
- Static data for development, database queries for production
- Avoid Suspense/Skeleton for animated value transitions
