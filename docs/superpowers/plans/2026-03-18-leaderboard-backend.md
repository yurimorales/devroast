# Leaderboard Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement back-end tRPC integration for the full leaderboard page, fetching 20 worst-scoring submissions from database to replace hardcoded data.

**Architecture:** Two tRPC procedures (getLeaderboard, getLeaderboardStats) query the database and transform results. Server Component uses queryClient.prefetchQuery + Promise.all pattern to fetch data in parallel.

**Tech Stack:** Next.js 16 (App Router), tRPC, Drizzle ORM, PostgreSQL

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/server/routers/_app.ts` | Modify | Add getLeaderboard and getLeaderboardStats procedures |
| `src/app/leaderboard/page.tsx` | Modify | Replace hardcoded data with server-side fetch |
| `src/components/leaderboard-content.tsx` | Create | Extract UI component for data consumption |

---

## Tasks

### Task 1: Add getLeaderboard tRPC procedure

**Files:**
- Modify: `src/server/routers/_app.ts:34-47`

- [ ] **Step 1: Add imports for db functions**

Add to top of `_app.ts`:
```ts
import { getLeaderboard } from "@/db/submissions";
```

- [ ] **Step 2: Add getLeaderboard procedure**

Replace the router definition (lines 34-45) with:

```ts
export const appRouter = createTRPCRouter({
  getMetrics: baseProcedure.query(async () => {
    return {
      totalSubmissions: 2847,
      avgScore: 4.2,
    };
  }),

  getShameLeaderboard: baseProcedure.query(async () => {
    return SHAME_LEADERBOARD_DATA;
  }),

  getLeaderboard: baseProcedure.query(async () => {
    const rows = await getLeaderboard(20);
    return rows.map((row, idx) => ({
      rank: idx + 1,
      score: parseFloat(row.score),
      code: row.code.split("\n"),
      language: row.language,
      lines: row.code.split("\n").length,
    }));
  }),
});
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/server/routers/_app.ts
git commit -m "feat: add getLeaderboard tRPC procedure"
```

---

### Task 2: Add getLeaderboardStats tRPC procedure

**Files:**
- Modify: `src/server/routers/_app.ts`

- [ ] **Step 1: Add imports for db and drizzle**

Add to top of `_app.ts`:
```ts
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
```

- [ ] **Step 2: Add getLeaderboardStats procedure**

Add to the router (after getLeaderboard):

```ts
getLeaderboardStats: baseProcedure.query(async () => {
  const result = await db
    .select({
      count: sql<number>`count(*)`,
      avg: sql<number>`avg(${submissions.score})`,
    })
    .from(submissions)
    .where(eq(submissions.status, "analyzed"));

  return {
    totalSubmissions: result[0]?.count ?? 0,
    avgScore: result[0]?.avg ? parseFloat(result[0].avg) : 0,
  };
}),
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/server/routers/_app.ts
git commit -m "feat: add getLeaderboardStats tRPC procedure"
```

---

### Task 3: Update leaderboard page to fetch data

**Files:**
- Modify: `src/app/leaderboard/page.tsx:1-65`

- [ ] **Step 1: Add imports**

Replace imports at top of file:
```ts
import { getQueryClient, trpc } from "@/lib/trpc/server";
import { LeaderboardContent } from "@/components/leaderboard-content";
```

- [ ] **Step 2: Replace page component**

Replace lines 62-156 with:

```ts
export default async function LeaderboardPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(trpc.getLeaderboard.queryOptions()),
    queryClient.prefetchQuery(trpc.getLeaderboardStats.queryOptions()),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      <LeaderboardContent />
    </main>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "feat: update leaderboard page with server-side data fetch"
```

---

### Task 4: Create LeaderboardContent component

**Files:**
- Create: `src/components/leaderboard-content.tsx`
- Delete: Remove hardcoded leaderboardData from `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Create LeaderboardContent component**

Create `src/components/leaderboard-content.tsx`:

```ts
"use client";

import { trpc } from "@/lib/trpc/client";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

function LeaderboardEntry({ entry }: { entry: { rank: number; score: number; code: string[]; language: string; lines: number } }) {
  return (
    <div className="flex flex-col border border-border-primary">
      <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[13px] text-text-tertiary">#</span>
            <span className={`font-mono text-[13px] font-bold ${entry.rank <= 3 ? "text-accent-amber" : "text-text-secondary"}`}>
              {entry.rank}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-text-tertiary">score:</span>
            <span className={`font-mono text-[13px] font-bold ${scoreColor(entry.score)}`}>
              {entry.score.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-secondary">{entry.language}</span>
          <span className="font-mono text-xs text-text-tertiary">{entry.lines} lines</span>
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
              className={`font-mono text-xs ${line.startsWith("//") || line.startsWith("--") ? "text-text-tertiary" : "text-text-primary"}`}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardContentInner() {
  const trpc = useTRPC();
  const { data: entries } = useQuery(trpc.getLeaderboard.queryOptions());
  const { data: stats } = useQuery(trpc.getLeaderboardStats.queryOptions());

  if (!entries || entries.length === 0) {
    return <div className="text-text-tertiary font-mono text-sm">No entries found</div>;
  }

  const totalSubmissions = stats?.totalSubmissions ?? 0;
  const avgScore = stats?.avgScore ?? 0;

  return (
    <section className="flex flex-col gap-10 px-20 py-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[32px] font-bold text-accent-green">&gt;</span>
          <h1 className="font-mono text-[28px] font-bold text-text-primary">shame_leaderboard</h1>
        </div>
        <p className="font-mono text-sm text-text-secondary">{"// the most roasted code on the internet"}</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-tertiary">{totalSubmissions.toLocaleString()} submissions</span>
          <span className="font-mono text-xs text-text-tertiary">·</span>
          <span className="font-mono text-xs text-text-tertiary">avg score: {avgScore.toFixed(1)}/10</span>
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

export function LeaderboardContent() {
  return <LeaderboardContentInner />;
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/leaderboard-content.tsx
git commit -m "feat: create LeaderboardContent client component"
```

---

## Verification

After completing all tasks:

- [ ] Run `pnpm build` to verify full build passes
- [ ] Run `pnpm biome check --write` to fix any linting issues
- [ ] Verify page loads without errors at `/leaderboard`