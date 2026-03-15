import Link from "next/link";
import { ScoreRing } from "@/components/ui/score-ring";

const STATIC_ROAST_DATA = {
  score: 3.5,
  verdict: "needs_serious_help",
  title:
    '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript",
  lines: 7,
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }
  // TODO: handle tax calculation
  // TODO: handle currency conversion
  return total;
}`,
};

function Navbar() {
  return (
    <nav className="flex items-center justify-between h-14 px-10 border-b border-border-primary">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-mono text-xl font-bold text-accent-green">$</span>
        <span className="font-mono text-lg font-medium text-text-primary">
          devroast
        </span>
      </Link>
      <Link
        href="/leaderboard"
        className="font-mono text-[13px] text-text-secondary hover:text-text-primary transition-colors"
      >
        leaderboard
      </Link>
    </nav>
  );
}

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

export default function RoastResultPage() {
  const { score, verdict, title, language, lines, code } = STATIC_ROAST_DATA;

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-col gap-10 px-20 py-10">
        {/* Score Hero */}
        <div className="flex items-center gap-12">
          <ScoreRing score={score} />

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent-red" />
              <span className="font-mono text-[13px] font-medium text-accent-red">
                verdict: {verdict}
              </span>
            </div>

            <p className="font-mono text-xl leading-relaxed text-text-primary">
              {title}
            </p>

            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-text-tertiary">
                lang: {language}
              </span>
              <span className="font-mono text-xs text-text-tertiary">·</span>
              <span className="font-mono text-xs text-text-tertiary">
                {lines} lines
              </span>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 w-fit px-4 py-2 font-mono text-xs text-text-primary border border-border-primary hover:bg-bg-elevated transition-colors"
            >
              $ share_roast
            </button>
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

          <CodePreview code={code} />
        </div>
      </div>
    </main>
  );
}
