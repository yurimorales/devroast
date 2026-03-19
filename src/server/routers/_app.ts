import { getLeaderboard } from "@/db/submissions";
import { baseProcedure, createTRPCRouter } from "../init";

const SHAME_LEADERBOARD_DATA = [
  {
    rank: 1,
    score: 1.2,
    code: [
      'eval(prompt("enter code"))',
      "document.write(response)",
      "// trust the user lol",
    ],
    language: "javascript",
  },
  {
    rank: 2,
    score: 1.8,
    code: [
      "if (x == true) { return true; }",
      "else if (x == false) { return false; }",
      "else { return !false; }",
      "// this is getting ridiculous",
      "// why not just use a boolean?",
    ],
    language: "typescript",
  },
  {
    rank: 3,
    score: 2.1,
    code: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"],
    language: "sql",
  },
];

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

export type AppRouter = typeof appRouter;
