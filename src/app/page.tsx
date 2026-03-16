import { Suspense } from "react";
import { Metrics } from "@/components/metrics";
import { ShameLeaderboard } from "@/components/shame-leaderboard";
import { HomeEditor } from "./home-editor";

export default function HomePage() {
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
      <Suspense
        fallback={
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
          </section>
        }
      >
        <ShameLeaderboard />
      </Suspense>
    </main>
  );
}
