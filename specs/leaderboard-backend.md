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
HydrateClient → Client
```

## Implementation Details

### 1. tRPC Router (`src/server/routers/_app.ts`)

Add two new procedures:

**getLeaderboard**: Uses existing `getLeaderboard()` from `src/db/submissions.ts:70`
- Returns 20 entries ordered by score ASC (worst first)
- Transforms DB response:
  - `score`: parse to number
  - `code`: split by `\n` into string array
  - `rank`: computed by position (1-20)
  - `language`: as-is from DB

```ts
getLeaderboard: baseProcedure.query(async () => {
  const rows = await getLeaderboard(20);
  return rows.map((row, idx) => ({
    rank: idx + 1,
    score: parseFloat(row.score),
    code: row.code.split("\n"),
    language: row.language,
  }));
})
```

**getLeaderboardStats**: Query DB for global metrics
- `totalSubmissions`: COUNT of submissions with status='analyzed'
- `avgScore`: AVG of score column

```ts
getLeaderboardStats: baseProcedure.query(async () => {
  // Query using db + sql for aggregation
})
```

### 2. Page Integration (`src/app/leaderboard/page.tsx`)

- Replace hardcoded `leaderboardData` with server-side fetch
- Use `createCaller` from `@/trpc/server` for RSC data fetching
- Use `prefetch()` + `<HydrateClient>` pattern (per AGENTS.md)

```tsx
export default async function LeaderboardPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(trpc.getLeaderboard.queryOptions()),
    queryClient.prefetchQuery(trpc.getLeaderboardStats.queryOptions()),
  ]);
  // ...
}
```

### 3. UI Updates

- Keep existing UI structure and styling
- Reuse `CollapsibleCode` for syntax highlighting (optional enhancement)
- Keep `scoreColor` utility from current page

## Data Shape

```ts
// getLeaderboard response
interface LeaderboardEntry {
  rank: number;
  score: number;
  code: string[];
  language: string;
}

// getLeaderboardStats response
interface LeaderboardStats {
  totalSubmissions: number;
  avgScore: number;
}
```

## Dependencies

- Reuse existing `getLeaderboard(limit)` from `src/db/submissions.ts:70`
- Use `db` from `@/db` + `sql` for stats aggregation query
- Use `createCaller` from `@/trpc/server` for RSC

## Acceptance Criteria

- [ ] `getLeaderboard` tRPC procedure returns 20 entries from DB
- [ ] Entries ordered by score ASC (worst first)
- [ ] Each entry includes: rank, score (number), code (array), language
- [ ] `getLeaderboardStats` returns totalSubmissions and avgScore from DB
- [ ] Page fetches data server-side with prefetch() + HydrateClient
- [ ] Page displays dynamic data replacing hardcoded leaderboardData
- [ ] Existing UI styling preserved