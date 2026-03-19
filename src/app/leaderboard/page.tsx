import { Suspense } from "react";
import {
  LeaderboardContent,
  LeaderboardContentSkeleton,
} from "@/components/leaderboard-content";
import { getQueryClient, trpc } from "@/lib/trpc/server";

export default async function LeaderboardPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(trpc.getLeaderboard.queryOptions()),
    queryClient.prefetchQuery(trpc.getLeaderboardStats.queryOptions()),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      <Suspense fallback={<LeaderboardContentSkeleton />}>
        <LeaderboardContent />
      </Suspense>
    </main>
  );
}
