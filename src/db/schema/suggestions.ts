import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { analyses } from "./analyses";

export const suggestions = pgTable("suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  analysisId: uuid("analysis_id")
    .notNull()
    .references(() => analyses.id),
  originalCode: text("original_code").notNull(),
  fixedCode: text("fixed_code").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;
