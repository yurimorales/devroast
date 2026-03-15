import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { submissions } from "./schema";
import type { NewSubmission, Submission } from "./schema/submissions";

export async function createSubmission(
  data: NewSubmission,
): Promise<Submission> {
  const [result] = await db.insert(submissions).values(data).returning();
  return result;
}

export async function getSubmissionById(
  id: string,
): Promise<Submission | undefined> {
  const [result] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id));
  return result;
}

export async function getSubmissionsWithAnalyses(limit = 50) {
  const query = sql`
    SELECT 
      s.id,
      s.code,
      s.language,
      s.score,
      s.roast_mode,
      s.status,
      s.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', a.id,
            'severity', a.severity,
            'message', a.message,
            'line_start', a.line_start,
            'line_end', a.line_end,
            'column_start', a.column_start,
            'column_end', a.column_end,
            'rule_code', a.rule_code,
            'suggestions', (
              SELECT json_agg(
                json_build_object(
                  'id', s2.id,
                  'original_code', s2.original_code,
                  'fixed_code', s2.fixed_code,
                  'explanation', s2.explanation
                )
              )
              FROM suggestions s2
              WHERE s2.analysis_id = a.id
            )
          )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) as analyses
    FROM submissions s
    LEFT JOIN analyses a ON a.submission_id = s.id
    WHERE s.status = 'analyzed'
    GROUP BY s.id
    ORDER BY s.created_at DESC
    LIMIT ${limit}
  `;
  return query;
}

export async function getLeaderboard(limit = 20) {
  const query = sql`
    SELECT 
      s.id,
      s.code,
      s.language,
      s.score,
      s.created_at
    FROM submissions s
    WHERE s.status = 'analyzed'
    ORDER BY s.score ASC, s.created_at DESC
    LIMIT ${limit}
  `;
  return query;
}

export async function updateSubmissionStatus(
  id: string,
  status: "pending" | "analyzed" | "error",
): Promise<void> {
  await db.update(submissions).set({ status }).where(eq(submissions.id, id));
}

export async function updateSubmissionScore(
  id: string,
  score: string,
): Promise<void> {
  await db
    .update(submissions)
    .set({ score, status: "analyzed" })
    .where(eq(submissions.id, id));
}

export async function getRecentSubmissions(limit = 10) {
  return db
    .select()
    .from(submissions)
    .orderBy(desc(submissions.createdAt))
    .limit(limit);
}
