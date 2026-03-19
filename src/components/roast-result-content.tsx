"use client";

import { useQuery } from "@tanstack/react-query";
import { ScoreRing } from "@/components/ui/score-ring";
import { useTRPC } from "@/lib/trpc/client";

function CodePreview({ code }: { code: string }) {
  const lines = code.split("\n");

  return (
    <div className="flex border border-border-primary overflow-hidden">
      <div className="flex flex-col items-end gap-0 py-4 px-3 w-12 bg-bg-surface border-r border-border-primary shrink-0">
        {lines.map((_, i) => (
          <span
            key={i}
            className="font-mono text-xs leading-[1.625] text-text-tertiary"
          >
            {i + 1}
          </span>
        ))}
      </div>
      <pre className="flex-1 p-4 overflow-auto font-mono text-xs leading-[1.625] text-text-primary whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    error: {
      bg: "bg-accent-red/10",
      text: "text-accent-red",
      label: "error",
    },
    warning: {
      bg: "bg-accent-yellow/10",
      text: "text-accent-yellow",
      label: "warning",
    },
    info: {
      bg: "bg-accent-blue/10",
      text: "text-accent-blue",
      label: "info",
    },
  };

  const style = config[severity as keyof typeof config] ?? config.info;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

function DetailedAnalysisSection({
  analyses,
}: {
  analyses: Array<{
    id: string;
    severity: string;
    message: string;
    lineStart: number | null;
    lineEnd: number | null;
  }>;
}) {
  if (analyses.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4 border border-border-primary">
        <span className="font-mono text-sm text-text-tertiary">
          No issues found. Your code looks clean!
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {analyses.map((analysis) => (
        <div
          key={analysis.id}
          className="flex flex-col gap-2 p-4 border border-border-primary"
        >
          <div className="flex items-center gap-3">
            <SeverityBadge severity={analysis.severity} />
            {analysis.lineStart && (
              <span className="font-mono text-xs text-text-tertiary">
                line {analysis.lineStart}
                {analysis.lineEnd && analysis.lineEnd !== analysis.lineStart
                  ? `-${analysis.lineEnd}`
                  : ""}
              </span>
            )}
          </div>
          <p className="font-mono text-sm text-text-primary leading-relaxed">
            {analysis.message}
          </p>
        </div>
      ))}
    </div>
  );
}

export function RoastResultContent({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.getRoast.queryOptions({ id }),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="font-mono text-text-tertiary animate-pulse">
          $ analyzing your code...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="font-mono text-accent-red">
          Error:{" "}
          {(error as unknown as Error)?.message ?? "Failed to load roast"}
        </span>
      </div>
    );
  }

  const { submission, analyses } = data;

  const getVerdict = (score: number) => {
    if (score <= 3) return "needs_serious_help";
    if (score <= 6) return "could_be_better";
    return "not_bad";
  };

  const verdict = getVerdict(submission.score);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex flex-col gap-10 px-20 py-10">
        <div className="flex items-center gap-12">
          <ScoreRing score={submission.score} />

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent-red" />
              <span className="font-mono text-[13px] font-medium text-accent-red">
                verdict: {verdict}
              </span>
            </div>

            <p className="font-mono text-xl leading-relaxed text-text-primary">
              {analyses[0]?.message ?? "Code analyzed successfully"}
            </p>

            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-text-tertiary">
                lang: {submission.language}
              </span>
              <span className="font-mono text-xs text-text-tertiary">·</span>
              <span className="font-mono text-xs text-text-tertiary">
                {submission.code.split("\n").length} lines
              </span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-border-primary" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-sm font-bold text-text-primary">
              your_submission
            </span>
          </div>

          <CodePreview code={submission.code} />
        </div>

        <div className="h-px w-full bg-border-primary" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-accent-yellow">
              {"/*"}
            </span>
            <span className="font-mono text-sm font-bold text-text-primary">
              detailed_analysis
            </span>
            <span className="font-mono text-sm font-bold text-accent-yellow">
              {" */"}
            </span>
          </div>

          <DetailedAnalysisSection analyses={analyses} />
        </div>
      </div>
    </main>
  );
}

export function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="font-mono text-text-tertiary animate-pulse">
        $ loading...
      </div>
    </div>
  );
}
