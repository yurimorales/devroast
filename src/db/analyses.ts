import { eq } from "drizzle-orm";
import { db } from "./index";
import { analyses } from "./schema";
import type { Analysis, NewAnalysis } from "./schema/analyses";

export async function createAnalysis(data: NewAnalysis): Promise<Analysis> {
  const [result] = await db.insert(analyses).values(data).returning();
  return result;
}

export async function createAnalyses(data: NewAnalysis[]): Promise<Analysis[]> {
  return db.insert(analyses).values(data).returning();
}

export async function getAnalysisById(
  id: string,
): Promise<Analysis | undefined> {
  const [result] = await db.select().from(analyses).where(eq(analyses.id, id));
  return result;
}

export async function getAnalysesBySubmissionId(
  submissionId: string,
): Promise<Analysis[]> {
  return db
    .select()
    .from(analyses)
    .where(eq(analyses.submissionId, submissionId));
}

export async function deleteAnalysesBySubmissionId(
  submissionId: string,
): Promise<void> {
  await db.delete(analyses).where(eq(analyses.submissionId, submissionId));
}
