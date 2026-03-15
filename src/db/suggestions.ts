import { eq } from "drizzle-orm";
import { db } from "./index";
import { suggestions } from "./schema";
import type { NewSuggestion, Suggestion } from "./schema/suggestions";

export async function createSuggestion(
  data: NewSuggestion,
): Promise<Suggestion> {
  const [result] = await db.insert(suggestions).values(data).returning();
  return result;
}

export async function createSuggestions(
  data: NewSuggestion[],
): Promise<Suggestion[]> {
  return db.insert(suggestions).values(data).returning();
}

export async function getSuggestionById(
  id: string,
): Promise<Suggestion | undefined> {
  const [result] = await db
    .select()
    .from(suggestions)
    .where(eq(suggestions.id, id));
  return result;
}

export async function getSuggestionsByAnalysisId(
  analysisId: string,
): Promise<Suggestion[]> {
  return db
    .select()
    .from(suggestions)
    .where(eq(suggestions.analysisId, analysisId));
}

export async function deleteSuggestionsByAnalysisId(
  analysisId: string,
): Promise<void> {
  await db.delete(suggestions).where(eq(suggestions.analysisId, analysisId));
}
