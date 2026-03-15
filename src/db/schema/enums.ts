import { pgEnum } from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language_enum", [
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
]);

export const severityEnum = pgEnum("severity_enum", [
  "critical",
  "warning",
  "good",
]);

export const submissionStatusEnum = pgEnum("submission_status_enum", [
  "pending",
  "analyzed",
  "error",
]);
