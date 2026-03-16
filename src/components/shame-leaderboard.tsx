"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client-singleton";

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

function LeaderboardRowSkeleton() {
  return (
    <div className="flex px-5 py-4 border-b border-border-primary">
      <div className="w-12">
        <div className="h-4 w-4 bg-bg-elevated animate-pulse rounded" />
      </div>
      <div className="w-18">
        <div className="h-4 w-8 bg-bg-elevated animate-pulse rounded" />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-4 w-3/4 bg-bg-elevated animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-bg-elevated animate-pulse rounded" />
      </div>
      <div className="w-24">
        <div className="h-4 w-16 ml-auto bg-bg-elevated animate-pulse rounded" />
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="border border-border-primary w-full">
      <div className="flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary">
        <span className="w-12 font-mono text-xs font-medium text-text-tertiary">
          #
        </span>
        <span className="w-18 font-mono text-xs font-medium text-text-tertiary">
          score
        </span>
        <span className="flex-1 font-mono text-xs font-medium text-text-tertiary">
          code
        </span>
        <span className="w-24 font-mono text-xs font-medium text-text-tertiary text-right">
          lang
        </span>
      </div>
      <LeaderboardRowSkeleton />
      <LeaderboardRowSkeleton />
      <LeaderboardRowSkeleton />
    </div>
  );
}

export function ShameLeaderboard() {
  const {
    data: entries,
    isLoading,
    isError,
  } = useQuery(trpc.getShameLeaderboard.queryOptions());

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6 w-full max-w-5xl px-10 pb-15">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            shame_leaderboard
          </span>
        </div>
        <p className="font-mono text-[13px] text-text-tertiary -mt-2">
          {"// the worst code on the internet, ranked by shame"}
        </p>
        <LeaderboardSkeleton />
      </section>
    );
  }

  if (isError || !entries) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6 w-full max-w-5xl px-10 pb-15">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            shame_leaderboard
          </span>
        </div>

        <Link
          href="/leaderboard"
          className="font-mono text-xs text-text-secondary border border-border-primary px-3 py-1.5 hover:bg-bg-elevated transition-colors"
        >
          $ view_all {">>"}
        </Link>
      </div>

      {/* Subtitle */}
      <p className="font-mono text-[13px] text-text-tertiary -mt-2">
        {"// the worst code on the internet, ranked by shame"}
      </p>

      {/* Leaderboard Table */}
      <div className="border border-border-primary w-full">
        {/* Table Header */}
        <div className="flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary">
          <span className="w-12 font-mono text-xs font-medium text-text-tertiary">
            #
          </span>
          <span className="w-18 font-mono text-xs font-medium text-text-tertiary">
            score
          </span>
          <span className="flex-1 font-mono text-xs font-medium text-text-tertiary">
            code
          </span>
          <span className="w-24 font-mono text-xs font-medium text-text-tertiary text-right">
            lang
          </span>
        </div>

        {/* Table Rows */}
        {entries.map((entry, index) => (
          <div
            key={entry.rank}
            className={`flex px-5 py-4 ${index < entries.length - 1 ? "border-b border-border-primary" : ""}`}
          >
            <span
              className={`w-12 font-mono text-xs ${entry.rank === 1 ? "text-accent-amber" : "text-text-secondary"}`}
            >
              {entry.rank}
            </span>
            <span
              className={`w-18 font-mono text-xs font-bold ${scoreColor(entry.score)}`}
            >
              {entry.score.toFixed(1)}
            </span>
            <div className="flex-1 flex flex-col gap-0.5">
              {entry.code.map((line) => (
                <span
                  key={line}
                  className={`font-mono text-xs ${line.startsWith("//") || line.startsWith("--") ? "text-text-tertiary" : "text-text-primary"}`}
                >
                  {line}
                </span>
              ))}
            </div>
            <span className="w-24 font-mono text-xs text-text-secondary text-right">
              {entry.language}
            </span>
          </div>
        ))}
      </div>

      {/* Fade Hint */}
      <p className="font-mono text-xs text-text-tertiary text-center">
        showing top 3 of 2,847 ·{" "}
        <Link
          href="/leaderboard"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          view full leaderboard {">>"}
        </Link>
      </p>
    </section>
  );
}
