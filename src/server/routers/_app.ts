import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { analyses } from "@/db/schema/analyses";
import { submissions } from "@/db/schema/submissions";
import { getLeaderboard } from "@/db/submissions";
import { analyzeCode } from "@/lib/ai/gemini";
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
      avgScore: result[0]?.avg ? parseFloat(String(result[0].avg)) : 0,
    };
  }),

  createRoast: baseProcedure
    .input(
      z.object({
        code: z.string().min(1).max(2000),
        language: z.enum([
          "javascript",
          "typescript",
          "python",
          "java",
          "csharp",
          "go",
          "rust",
          "ruby",
          "php",
          "swift",
          "kotlin",
          "sql",
          "html",
          "css",
          "json",
          "yaml",
          "markdown",
          "bash",
          "plaintext",
        ]),
        roastMode: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const [submission] = await db
        .insert(submissions)
        .values({
          code: input.code,
          language: input.language,
          score: "0",
          roastMode: input.roastMode,
          status: "pending",
        })
        .returning();

      const submissionId = submission.id;

      try {
        const result = await analyzeCode(input.code, input.roastMode);

        await db
          .update(submissions)
          .set({ score: result.score.toString(), status: "analyzed" })
          .where(eq(submissions.id, submissionId));

        for (const analysis of result.analyses) {
          await db.insert(analyses).values({
            submissionId: submissionId,
            severity: analysis.severity,
            message: analysis.message,
            lineStart: analysis.line ?? null,
            lineEnd: analysis.line ?? null,
            ruleCode: null,
          });
        }

        return { id: submissionId };
      } catch (error) {
        await db
          .update(submissions)
          .set({ status: "error" })
          .where(eq(submissions.id, submissionId));
        throw error;
      }
    }),

  getRoast: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const submission = await db.query.submissions.findFirst({
        where: eq(submissions.id, input.id),
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      const analysesResult = await db.query.analyses.findMany({
        where: eq(analyses.submissionId, input.id),
      });

      return {
        submission: {
          id: submission.id,
          code: submission.code,
          language: submission.language,
          score: parseFloat(submission.score),
          roastMode: submission.roastMode,
          createdAt: submission.createdAt,
        },
        analyses: analysesResult.map((a) => ({
          id: a.id,
          severity: a.severity,
          message: a.message,
          lineStart: a.lineStart,
          lineEnd: a.lineEnd,
        })),
      };
    }),
});

export type AppRouter = typeof appRouter;
