import "server-only";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "@/server/init";
import { makeQueryClient } from "@/server/query-client";
import type { AppRouter } from "@/server/routers/_app";
import { appRouter } from "@/server/routers/_app";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export async function prefetchQueries(
  queries: (() => ReturnType<typeof trpc.getMetrics.queryOptions>)[],
) {
  const queryClient = getQueryClient();
  await Promise.all(queries.map((q) => queryClient.prefetchQuery(q())));
}

export async function createCaller() {
  return appRouter.createCaller(await createTRPCContext());
}
