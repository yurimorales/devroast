# Leaderboard Backend Implementation

## Overview

Implement back-end tRPC integration for the full leaderboard page (`/leaderboard`), fetching 20 worst-scoring submissions from database to replace hardcoded data.

## Data Flow

```
Database (submissions table)
    │
    ▼
tRPC Router (getLeaderboard, getLeaderboardStats)
    │
    ▼
Server Component (leaderboard/page.tsx)
    │
    ▼
queryClient.prefetchQuery (parallel with Promise.all)
```

## Implementation Details

### 1. tRPC Router (`src/server/routers/_app.ts`)

Add two procedures that **replace** the hardcoded data in existing procedures:

**getLeaderboard**: Uses existing `getLeaderboard()` from `src/db/submissions.ts:70`
- Returns 20 entries ordered by score ASC (worst first)
- Transforms DB response:
  - `score`: parse to number
  - `code`: split by `\n` into string array
  - `rank`: computed by position (1-20)
  - `language`: as-is from DB
  - `lines`: code.length

```ts
getLeaderboard: baseProcedure.query(async () => {
  const rows = await getLeaderboard(20);
  return rows.map((row, idx) => ({
    rank: idx + 1,
    score: parseFloat(row.score),
    code: row.code.split("\n"),
    language: row.language,
    lines: row.code.split("\n").length,
  }));
})
```

**getLeaderboardStats**: Query DB for global metrics
- Uses `db` from `@/db` + `sql` from drizzle-orm for aggregation

```ts
getLeaderboardStats: baseProcedure.query(async () => {
  const result = await db.select({
    count: sql<number>`count(*)`,
    avg: sql<number>`avg(score)`,
  }).from(submissions).where(eq(submissions.status, 'analyzed'));
  return {
    totalSubmissions: result[0].count,
    avgScore: parseFloat(result[0].avg) || 0,
  };
})
```

### 2. Page Integration (`src/app/leaderboard/page.tsx`)

- Replace hardcoded `leaderboardData` with server-side fetch
- Use `getQueryClient` + `trpc.*.queryOptions()` for prefetch (NOT createCaller)
- Use `Promise.all` for parallel queries (per AGENTS.md)

```tsx
import { getQueryClient, trpc } from "@/lib/trpc/server";

export default async function LeaderboardPage() {
  const queryClient = getQueryClient();
  
  await Promise.all([
    queryClient.prefetchQuery(trpc.getLeaderboard.queryOptions()),
    queryClient.prefetchQuery(trpc.getLeaderboardStats.queryOptions()),
  ]);

  // Return component (data will be hydrated via queryClient)
  return <LeaderboardContent />;
}
```

### 3. UI Updates

- Keep existing UI structure and styling
- Keep `scoreColor` utility from current page
- Update to use dynamic data instead of hardcoded leaderboardData

## Data Shape

```ts
// getLeaderboard response
interface LeaderboardEntry {
  rank: number;
  score: number;
  code: string[];
  language: string;
  lines: number;
}

// getLeaderboardStats response
interface LeaderboardStats {
  totalSubmissions: number;
  avgScore: number;
}
```

## Dependencies

- Reuse existing `getLeaderboard(limit)` from `src/db/submissions.ts:70`
- Use `db` from `@/db` for stats aggregation
- Use `eq` from drizzle-orm for the where clause
- Use `sql` for aggregation functions

## Acceptance Criteria

- [ ] `getLeaderboard` tRPC procedure returns 20 entries from DB
- [ ] Entries ordered by score ASC (worst first)
- [ ] Each entry includes: rank, score (number), code (array), language, lines
- [ ] `getLeaderboardStats` returns totalSubmissions and avgScore from DB
- [ ] Page uses queryClient.prefetchQuery + Promise.all pattern
- [ ] Page displays dynamic data replacing hardcoded leaderboardData
- [ ] Existing UI styling preserved