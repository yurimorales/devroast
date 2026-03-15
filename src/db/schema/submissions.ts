import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { languageEnum, submissionStatusEnum } from "./enums";

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  language: languageEnum("language").notNull(),
  score: decimal("score", { precision: 3, scale: 1 }).notNull(),
  roastMode: boolean("roast_mode").notNull().default(true),
  status: submissionStatusEnum("status").notNull().default("pending"),
  ipHash: varchar("ip_hash", { length: 64 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
