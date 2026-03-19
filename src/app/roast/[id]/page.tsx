"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
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

function RoastResultContent({ id }: { id: string }) {
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

  // Determine verdict based on score
  const getVerdict = (score: number) => {
    if (score <= 3) return "needs_serious_help";
    if (score <= 6) return "could_be_better";
    return "not_bad";
  };

  const verdict = getVerdict(submission.score);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex flex-col gap-10 px-20 py-10">
        {/* Score Hero */}
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

        {/* Divider */}
        <div className="h-px w-full bg-border-primary" />

        {/* Submitted Code Section */}
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
      </div>
    </main>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoastResultPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="font-mono text-text-tertiary animate-pulse">
            $ loading...
          </div>
        </div>
      }
    >
      <RoastResultWrapper params={params} />
    </Suspense>
  );
}

async function RoastResultWrapper({ params }: PageProps) {
  const { id } = await params;
  return <RoastResultContent id={id} />;
}
