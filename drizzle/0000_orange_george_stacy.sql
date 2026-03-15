CREATE TYPE "public"."language_enum" AS ENUM('javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'plaintext');--> statement-breakpoint
CREATE TYPE "public"."severity_enum" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."submission_status_enum" AS ENUM('pending', 'analyzed', 'error');--> statement-breakpoint
CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"severity" "severity_enum" NOT NULL,
	"message" text NOT NULL,
	"line_start" integer,
	"line_end" integer,
	"column_start" integer,
	"column_end" integer,
	"rule_code" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "language_enum" NOT NULL,
	"score" numeric(2, 1) NOT NULL,
	"roast_mode" boolean DEFAULT true NOT NULL,
	"status" "submission_status_enum" DEFAULT 'pending' NOT NULL,
	"ip_hash" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid NOT NULL,
	"original_code" text NOT NULL,
	"fixed_code" text NOT NULL,
	"explanation" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."analyses"("id") ON DELETE no action ON UPDATE no action;