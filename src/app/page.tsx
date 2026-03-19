import { Suspense } from "react";
import { Metrics } from "@/components/metrics";
import {
  ShameLeaderboard,
  ShameLeaderboardSkeleton,
} from "@/components/shame-leaderboard";
import { getQueryClient, trpc } from "@/lib/trpc/server";
import { HomeEditor } from "./home-editor";

export const revalidate = 3600;

export default async function HomePage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(trpc.getMetrics.queryOptions()),
    queryClient.prefetchQuery(trpc.getShameLeaderboard.queryOptions()),
  ]);

  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center gap-3 pt-20 px-10">
        <h1 className="flex items-center gap-3 font-mono text-4xl font-bold">
          <span className="text-accent-green">$</span>
          <span className="text-text-primary">
            paste your code. get roasted.
          </span>
        </h1>
        <p className="font-mono text-sm text-text-secondary">
          {
            "// drop your code below and we'll rate it — brutally honest or full roast mode"
          }
        </p>
      </section>

      {/* Editor + Actions */}
      <section className="w-full max-w-5xl px-10 pt-8">
        <HomeEditor />
      </section>

      {/* Footer Stats */}
      <Metrics />

      {/* Spacer */}
      <div className="h-15" />

      {/* Leaderboard Preview */}
      <Suspense fallback={<ShameLeaderboardSkeleton />}>
        <ShameLeaderboard />
      </Suspense>
    </main>
  );
}
