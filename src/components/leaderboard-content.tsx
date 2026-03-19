import NumberFlow from "@number-flow/react";
import { cacheLife } from "next/cache";
import { createCaller } from "@/lib/trpc/server";

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
          {entry.code.map((_line, _idx) => {
            const lineNumber = _idx + 1;
            return (
              <span
                key={`ln-${lineNumber}`}
                className="font-mono text-xs text-text-tertiary"
              >
                {lineNumber}
              </span>
            );
          })}
        </div>
        <div className="flex flex-col gap-1.5 px-4 py-3 bg-bg-input">
          {entry.code.map((line, idx) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: static code lines won't reorder
              key={`code-${idx}`}
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

export async function LeaderboardContent() {
  "use cache";
  cacheLife({ revalidate: 3600 }); // 1 hour

  const caller = await createCaller();

  const [entries, stats] = await Promise.all([
    caller.getLeaderboard(),
    caller.getLeaderboardStats(),
  ]);

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
            <NumberFlow
              value={totalSubmissions}
              format={{ maximumFractionDigits: 0 }}
            />
            submissions
          </span>
          <span className="font-mono text-xs text-text-tertiary">·</span>
          <span className="font-mono text-xs text-text-tertiary">
            avg score:{" "}
            <NumberFlow
              value={avgScore}
              format={{ maximumFractionDigits: 0 }}
            />
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

export function LeaderboardContentSkeleton() {
  return (
    <section className="flex flex-col gap-10 px-20 py-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-bg-elevated animate-pulse rounded" />
          <div className="h-7 w-52 bg-bg-elevated animate-pulse rounded" />
        </div>
        <div className="h-4 w-64 bg-bg-elevated animate-pulse rounded" />
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-bg-elevated animate-pulse rounded" />
          <div className="h-3 w-3 bg-bg-elevated animate-pulse rounded" />
          <div className="h-3 w-20 bg-bg-elevated animate-pulse rounded" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col border border-border-primary">
            <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary bg-bg-surface">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 bg-bg-elevated animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-10 bg-bg-elevated animate-pulse rounded" />
                  <div className="h-4 w-8 bg-bg-elevated animate-pulse rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-16 bg-bg-elevated animate-pulse rounded" />
                <div className="h-3 w-12 bg-bg-elevated animate-pulse rounded" />
              </div>
            </div>

            <div className="flex">
              <div className="flex flex-col items-end gap-1.5 px-3 py-3 bg-bg-surface border-r border-border-primary min-w-10">
                {[1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="h-3 w-4 bg-bg-elevated animate-pulse rounded"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1.5 px-4 py-3 bg-bg-input">
                {[1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="h-3 w-full max-w-md bg-bg-elevated animate-pulse rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
