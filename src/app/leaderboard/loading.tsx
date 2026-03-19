export default function LeaderboardLoading() {
  return (
    <main className="flex flex-col min-h-screen">
      <section className="flex flex-col gap-10 px-20 py-10">
        {/* Header skeleton */}
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

        {/* Entries skeleton - 3 entries like homepage */}
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col border border-border-primary">
              {/* Header row */}
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

              {/* Code area */}
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
    </main>
  );
}
