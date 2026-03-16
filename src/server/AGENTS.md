# Server — tRPC Backend

Guide for creating and maintaining tRPC backend in the project.

## Structure

```
src/server/
├── init.ts              # tRPC initialization with context
├── query-client.ts      # QueryClient factory for SSR
└── routers/
    └── _app.ts          # Main AppRouter definition
```

## init.ts

Setup tRPC with superjson transformer:

```ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
  return {
    userId: "anonymous",
  };
});

const t = initTRPC.create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
```

## query-client.ts

Factory for QueryClient with SSR support:

```ts
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
```

## Creating Routers

Define routers in `_app.ts`:

```ts
import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  getMetrics: baseProcedure.query(async () => {
    return {
      totalSubmissions: 2847,
      avgScore: 4.2,
    };
  }),
});

export type AppRouter = typeof appRouter;
```

## Rules

- Always use `superjson` as transformer for data serialization
- Use `baseProcedure` as base for all procedures
- Export `AppRouter` type for client consumption
- Cache context creation with `cache` from React
- Keep business logic in routers, not in init.ts
