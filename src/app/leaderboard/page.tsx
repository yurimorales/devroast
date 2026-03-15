const leaderboardData = {
  totalSubmissions: 2847,
  avgScore: 4.2,
  entries: [
    {
      rank: 1,
      score: 1.2,
      language: "javascript",
      lines: 3,
      code: [
        'eval(prompt("enter code"))',
        "document.write(response)",
        "// trust the user lol",
      ],
    },
    {
      rank: 2,
      score: 1.8,
      language: "typescript",
      lines: 3,
      code: [
        "if (x == true) { return true; }",
        "else if (x == false) { return false; }",
        "else { return !false; }",
      ],
    },
    {
      rank: 3,
      score: 2.1,
      language: "sql",
      lines: 2,
      code: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"],
    },
    {
      rank: 4,
      score: 2.5,
      language: "python",
      lines: 4,
      code: [
        "def authenticate():",
        "    return True  # TODO: actually check password",
        "",
        "admin = authenticate()",
      ],
    },
    {
      rank: 5,
      score: 2.8,
      language: "javascript",
      lines: 2,
      code: ["function hack() {}", "// no more bugs!"],
    },
  ],
};

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

export default function LeaderboardPage() {
  return (
    <main className="flex flex-col min-h-screen">
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
              {leaderboardData.totalSubmissions.toLocaleString()} submissions
            </span>
            <span className="font-mono text-xs text-text-tertiary">·</span>
            <span className="font-mono text-xs text-text-tertiary">
              avg score: {leaderboardData.avgScore}/10
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {leaderboardData.entries.map((entry) => (
            <div
              key={entry.rank}
              className="flex flex-col border border-border-primary"
            >
              <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[13px] text-text-tertiary">
                      #
                    </span>
                    <span
                      className={`font-mono text-[13px] font-bold ${entry.rank <= 3 ? "text-accent-amber" : "text-text-secondary"}`}
                    >
                      {entry.rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-text-tertiary">
                      score:
                    </span>
                    <span
                      className={`font-mono text-[13px] font-bold ${scoreColor(entry.score)}`}
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
                    <span
                      key={idx}
                      className="font-mono text-xs text-text-tertiary"
                    >
                      {idx + 1}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5 px-4 py-3 bg-bg-input">
                  {entry.code.map((line, idx) => (
                    <span
                      key={idx}
                      className={`font-mono text-xs ${line.startsWith("//") || line.startsWith("--") ? "text-text-tertiary" : "text-text-primary"}`}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
