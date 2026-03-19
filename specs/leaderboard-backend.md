# Leaderboard Backend Implementation

## Overview

Implement back-end tRPC integration for the full leaderboard page, fetching 20 worst-scoring submissions from database.

## Data Flow

```
Database (submissions table)
    │
    ▼
tRPC Router (getLeaderboard, getLeaderboardMetrics)
    │
    ▼
Server Component (leaderboard/page.tsx)
    │
    ▼
HydrateClient → Client
```

## Implementation

### 1. tRPC Router (`src/server/routers/_app.ts`)

Add two procedures:

- `getLeaderboard`: Returns top 20 worst scores using existing `getLeaderboard()` from `src/db/submissions.ts`
- `getLeaderboardMetrics`: Returns global stats using existing `getMetrics()` logic or new query

### 2. Page Integration (`src/app/leaderboard/page.tsx`)

- Replace hardcoded `leaderboardData` with server-side data fetch
- Use `prefetch()` + `<HydrateClient>` pattern (same as homepage)
- Reuse existing UI structure and styling

### 3. Data Shape

```ts
// getLeaderboard response
interface LeaderboardEntry {
  rank: number;
  score: number;
  code: string[];
  language: string;
}

// getLeaderboardMetrics response
interface LeaderboardMetrics {
  totalSubmissions: number;
  avgScore: number;
}
```

## Dependencies

- Reuse existing `getLeaderboard()` from `src/db/submissions.ts:70`
- Reuse `CollapsibleCode` component for syntax highlighting
- Reuse `scoreColor` utility from `shame-leaderboard.tsx`

## Acceptance Criteria

- [ ] tRPC endpoint returns 20 entries ordered by score (worst first)
- [ ] Page displays dynamic data from database
- [ ] Loading state shows skeleton
- [ ] Metrics (total submissions, avg score) displayed at top