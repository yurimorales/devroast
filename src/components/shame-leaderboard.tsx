import { cacheLife } from "next/cache";
import Link from "next/link";
import type { BundledLanguage } from "shiki";
import { CollapsibleCode } from "@/components/ui/collapsible-code";
import { getShikiLanguage, type LanguageId } from "@/lib/detect-language";
import { createCaller } from "@/lib/trpc/server";

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

function LeaderboardRow({
  entry,
  isLast,
}: {
  entry: {
    rank: number;
    score: number;
    code: string[];
    language: string;
  };
  isLast: boolean;
}) {
  const code = entry.code.join("\n");
  const shikiLang = getShikiLanguage(entry.language as LanguageId);

  return (
    <div
      className={`flex flex-col ${isLast ? "" : "border-b border-border-primary"}`}
    >
      <div className="flex items-center h-10 px-4 border-b border-border-primary bg-bg-surface">
        <span
          className={`w-10 font-mono text-xs ${entry.rank === 1 ? "text-accent-amber" : "text-text-secondary"}`}
        >
          #{entry.rank}
        </span>
        <span
          className={`w-16 font-mono text-xs font-bold ${scoreColor(entry.score)}`}
        >
          {entry.score.toFixed(1)}
        </span>
        <span className="flex-1" />
        <span className="font-mono text-xs text-text-secondary">
          {entry.language}
        </span>
      </div>

      <CollapsibleCode
        code={code}
        lang={shikiLang as BundledLanguage}
        maxLines={5}
      />
    </div>
  );
}

function LeaderboardRowSkeleton() {
  return (
    <div className="flex flex-col border-b border-border-primary">
      <div className="flex items-center h-10 px-4 border-b border-border-primary bg-bg-surface">
        <div className="w-10">
          <div className="h-4 w-4 bg-bg-elevated animate-pulse rounded" />
        </div>
        <div className="w-16">
          <div className="h-4 w-8 bg-bg-elevated animate-pulse rounded" />
        </div>
        <div className="flex-1" />
        <div className="h-4 w-16 bg-bg-elevated animate-pulse rounded" />
      </div>
      <div className="h-32 bg-bg-input" />
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="border border-border-primary w-full">
      <div className="flex items-center h-10 px-4 bg-bg-surface border-b border-border-primary">
        <span className="w-10 font-mono text-xs font-medium text-text-tertiary">
          #
        </span>
        <span className="w-16 font-mono text-xs font-medium text-text-tertiary">
          score
        </span>
        <span className="flex-1 font-mono text-xs font-medium text-text-tertiary">
          code
        </span>
        <span className="font-mono text-xs font-medium text-text-tertiary">
          lang
        </span>
      </div>
      <LeaderboardRowSkeleton />
      <LeaderboardRowSkeleton />
      <LeaderboardRowSkeleton />
    </div>
  );
}

export function ShameLeaderboardSkeleton() {
  return (
    <section className="flex flex-col gap-6 w-full max-w-5xl px-10 pb-15">
      <div className="flex items-center gap-2">
        <div className="h-5 w-28 bg-bg-elevated animate-pulse rounded" />
      </div>
      <div className="h-4 w-64 bg-bg-elevated animate-pulse rounded" />
      <div className="border border-border-primary w-full">
        <LeaderboardRowSkeleton />
        <LeaderboardRowSkeleton />
        <LeaderboardRowSkeleton />
      </div>
      <div className="flex justify-center gap-2">
        <div className="h-3 w-20 bg-bg-elevated animate-pulse rounded" />
        <div className="h-3 w-24 bg-bg-elevated animate-pulse rounded" />
      </div>
    </section>
  );
}

export async function ShameLeaderboard() {
  "use cache";
  cacheLife({ revalidate: 3600 }); // 1 hour

  const caller = await createCaller();

  const [entries, metrics] = await Promise.all([
    caller.getShameLeaderboard(),
    caller.getMetrics(),
  ]);

  const hasEntries = entries && entries.length > 0;

  return (
    <section className="flex flex-col gap-6 w-full max-w-5xl px-10 pb-15">
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

      <p className="font-mono text-[13px] text-text-tertiary -mt-2">
        {"// the worst code on the internet, ranked by shame"}
      </p>

      {!hasEntries && <LeaderboardSkeleton />}

      {hasEntries && (
        <div className="border border-border-primary w-full">
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={entry.rank}
              entry={entry}
              isLast={index === entries.length - 1}
            />
          ))}
        </div>
      )}

      {hasEntries && (
        <p className="font-mono text-xs text-text-tertiary text-center">
          showing top 3 of {metrics.totalSubmissions.toLocaleString()} · avg
          score: {metrics.avgScore.toFixed(1)}/10 ·{" "}
          <Link
            href="/leaderboard"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            view full leaderboard {">>"}
          </Link>
        </p>
      )}
    </section>
  );
}
