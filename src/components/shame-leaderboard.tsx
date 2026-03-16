"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { codeToHtml } from "shiki";
import { getShikiLanguage, type LanguageId } from "@/lib/detect-language";
import { trpc } from "@/lib/trpc/client-singleton";

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

async function HighlightedCode({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const shikiLang = getShikiLanguage(language as LanguageId);
  const html = await codeToHtml(code, {
    lang: shikiLang,
    theme: "vesper",
  });

  const lines = code.split("\n");

  return (
    <div className="flex bg-bg-input">
      <div className="flex flex-col items-end gap-1.5 py-2 px-2.5 w-10 border-r border-border-primary bg-bg-surface shrink-0">
        {lines.map((line, i) => (
          <span
            key={`ln-${i}`}
            className="font-mono text-[11px] leading-tight text-text-tertiary"
          >
            {i + 1}
          </span>
        ))}
      </div>
      <div
        className="flex-1 p-2 overflow-x-auto font-mono text-[11px] leading-tight [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent [&_.line]:leading-[1.65]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates trusted HTML from code strings server-side
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
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

      <CollapsibleCode code={code} language={entry.language} />
    </div>
  );
}

function CollapsibleCode({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const lines = code.split("\n");
  const isLongCode = lines.length > 3;
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCode = isExpanded ? code : lines.slice(0, 3).join("\n");

  return (
    <div className="flex flex-col">
      <HighlightedCode code={visibleCode} language={language} />

      {isLongCode && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center h-8 border-t border-border-primary bg-bg-surface text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {isExpanded
            ? "[ - ] collapse"
            : `[ + ] expand ${lines.length - 3} more lines`}
        </button>
      )}
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
      <div className="flex bg-bg-input h-20">
        <div className="w-10 border-r border-border-primary bg-bg-surface" />
        <div className="flex-1 p-2">
          <div className="h-3 w-full bg-bg-elevated animate-pulse rounded mb-1" />
          <div className="h-3 w-3/4 bg-bg-elevated animate-pulse rounded mb-1" />
          <div className="h-3 w-1/2 bg-bg-elevated animate-pulse rounded" />
        </div>
      </div>
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

      <div className="border border-border-primary w-full">
        {entries.map((entry, index) => (
          <LeaderboardRow
            key={entry.rank}
            entry={entry}
            isLast={index === entries.length - 1}
          />
        ))}
      </div>

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
