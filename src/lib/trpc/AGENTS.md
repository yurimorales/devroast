# lib/trpc — tRPC Client Setup

Guide for using tRPC in client and server components.

## Patterns

### 1. Client Singleton (Preferred for Client Components)

Use this pattern for client components that don't need React context:

`lib/trpc/client-singleton.ts`

```ts
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers/_app";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export { queryClient };
```

**Usage in component:**

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client-singleton";

export function MyComponent() {
  const { data } = useQuery(trpc.myProcedure.queryOptions());
  
  return <div>{data?.result}</div>;
}
```

### 2. TRPCProvider (For Complex Use Cases)

Use when you need React context for dynamic configuration:

`lib/trpc/client.tsx`

```ts
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "@/server/query-client";
import type { AppRouter } from "@/server/routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// ... getQueryClient and getUrl helpers ...

export function TRPCReactProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: getUrl(),
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

### 3. Server Helpers (For Server Components)

`lib/trpc/server.ts`

```ts
import "server-only";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "@/server/init";
import { makeQueryClient } from "@/server/query-client";
import { appRouter } from "@/server/routers/_app";
import type { AppRouter } from "@/server/routers/_app";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export async function createCaller() {
  return appRouter.createCaller(await createTRPCContext());
}
```

## When to Use Each Pattern

| Scenario | Pattern |
|----------|---------|
| Client component with simple queries | Client Singleton |
| Need dynamic auth/headers | TRPCProvider |
| Server Component with prefetch | Server helpers |
| Direct backend call in Server Component | createCaller |

## Animated Values Pattern

For loading states with animations, use NumberFlow:

```ts
"use client";

import { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client-singleton";

export function AnimatedMetric() {
  const { data } = useQuery(trpc.getMetrics.queryOptions());
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (data) {
      setDisplayValue(data.value);
    }
  }, [data]);

  return <NumberFlow value={displayValue} />;
}
```

This animates from 0 to the loaded value without skeleton/Suspense.

## Rules

- Always use `superjson` transformer in HTTP links
- Use client singleton as default for new components
- Prefer `queryOptions()` over `useQuery()` for better type inference
- Keep API URL as `/api/trpc` for Next.js App Router
