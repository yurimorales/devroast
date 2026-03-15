import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { severityEnum } from "./enums";
import { submissions } from "./submissions";

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id),
  severity: severityEnum("severity").notNull(),
  message: text("message").notNull(),
  lineStart: integer("line_start"),
  lineEnd: integer("line_end"),
  columnStart: integer("column_start"),
  columnEnd: integer("column_end"),
  ruleCode: varchar("rule_code", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
