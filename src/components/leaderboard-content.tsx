"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client-singleton";

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

function LeaderboardEntry({
  entry,
}: {
  entry: {
    rank: number;
    score: number;
    code: string[];
    language: string;
    lines: number;
  };
}) {
  return (
    <div className="flex flex-col border border-border-primary">
      <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[13px] text-text-tertiary">#</span>
            <span
              className={`font-mono text-[13px] font-bold ${
                entry.rank <= 3 ? "text-accent-amber" : "text-text-secondary"
              }`}
            >
              {entry.rank}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-text-tertiary">score:</span>
            <span
              className={`font-mono text-[13px] font-bold ${scoreColor(
                entry.score,
              )}`}
            >
              {entry.score.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-secondary">
            {entry.language}
          </span>
          <span className="font-mono text-xs text-text-tertiary">
            {entry.lines} lines
          </span>
        </div>
      </div>

      <div className="flex">
        <div className="flex flex-col items-end gap-1.5 px-3 py-3 bg-bg-surface border-r border-border-primary min-w-10">
          {entry.code.map((_, idx) => (
            <span key={idx} className="font-mono text-xs text-text-tertiary">
              {idx + 1}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 px-4 py-3 bg-bg-input">
          {entry.code.map((line, idx) => (
            <span
              key={idx}
              className={`font-mono text-xs ${
                line.startsWith("//") || line.startsWith("--")
                  ? "text-text-tertiary"
                  : "text-text-primary"
              }`}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeaderboardContent() {
  const { data: entries } = useQuery(trpc.getLeaderboard.queryOptions());
  const { data: stats } = useQuery(trpc.getLeaderboardStats.queryOptions());

  if (!entries || entries.length === 0) {
    return (
      <div className="text-text-tertiary font-mono text-sm">
        No entries found
      </div>
    );
  }

  const totalSubmissions = stats?.totalSubmissions ?? 0;
  const avgScore = stats?.avgScore ?? 0;

  return (
    <section className="flex flex-col gap-10 px-20 py-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[32px] font-bold text-accent-green">
            &gt;
          </span>
          <h1 className="font-mono text-[28px] font-bold text-text-primary">
            shame_leaderboard
          </h1>
        </div>
        <p className="font-mono text-sm text-text-secondary">
          {"// the most roasted code on the internet"}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-tertiary">
            <NumberFlow value={totalSubmissions} />
            submissions
          </span>
          <span className="font-mono text-xs text-text-tertiary">·</span>
          <span className="font-mono text-xs text-text-tertiary">
            avg score: <NumberFlow value={avgScore} />
            /10
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {entries.map((entry) => (
          <LeaderboardEntry key={entry.rank} entry={entry} />
        ))}
      </div>
    </section>
  );
}
