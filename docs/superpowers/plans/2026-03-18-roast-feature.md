# Roast Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the roast feature - allow users to submit code for AI analysis, store results in DB, and display on result page.

**Architecture:** tRPC mutation calls Gemini API → saves to PostgreSQL via Drizzle → client redirects to result page → page fetches from DB.

**Tech Stack:** Next.js 16, tRPC, Google Gemini API, Drizzle ORM, PostgreSQL

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `.env` | Create | GEMINI_API_KEY configuration |
| `.env.example` | Create | Example env file for git |
| `src/lib/ai/gemini.ts` | Create | Gemini API client service |
| `src/server/routers/_app.ts` | Modify | Add createRoast mutation, getRoast query |
| `src/app/home-editor.tsx` | Modify | Connect button to mutation with router.push |
| `src/app/roast/[id]/page.tsx` | Modify | Fetch data from DB instead of static |

---

## Tasks

### Task 1: Environment Configuration

**Files:**
- Create: `.env`
- Create: `.env.example`

- [ ] **Step 1: Create .env.example**

```bash
# Create .env.example
GEMINI_API_KEY=your_api_key_here
```

- [ ] **Step 2: Create .env with API key**

```bash
# Create .env
GEMINI_API_KEY=SUA_API_KEY_AQUI
```

- [ ] **Step 3: Add .env to .gitignore**

Check if `.env` is already in `.gitignore`. If not, add it.

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "feat: add env configuration for Gemini API"
```

---

### Task 2: Create Gemini Service

**Files:**
- Create: `src/lib/ai/gemini.ts`

- [ ] **Step 1: Create gemini.ts service**

```ts
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

const RoastResponseSchema = z.object({
  score: z.number().min(0).max(10),
  title: z.string(),
  analyses: z.array(
    z.object({
      severity: z.enum(["critical", "warning", "good"]),
      message: z.string(),
      line: z.number().optional(),
    })
  ),
});

export type RoastAnalysis = z.infer<typeof RoastResponseSchema>;

const ROAST_PROMPT = `Analyze this code and provide a humorous, sarcastic roast.
Respond with ONLY valid JSON (no markdown, no explanation):
{
  "score": 0-10 (lower = worse),
  "title": "short sarcastic title",
  "analyses": [
    {
      "severity": "critical|warning|good",
      "message": "sarcastic comment",
      "line": line number (optional)
    }
  ]
}`;

const NORMAL_PROMPT = `Analyze this code constructively.
Respond with ONLY valid JSON (no markdown, no explanation):
{
  "score": 0-10 (higher = better),
  "title": "constructive feedback title",
  "analyses": [
    {
      "severity": "critical|warning|good",
      "message": "helpful suggestion",
      "line": line number (optional)
    }
  ]
}`;

export async function analyzeCode(
  code: string,
  roastMode: boolean
): Promise<RoastAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = roastMode ? ROAST_PROMPT : NORMAL_PROMPT;
  const fullPrompt = \`\${prompt}\n\nCode to analyze:\n\`\`\`\n\${code}\n\`\`\`;

  const response = await fetch(
    \`https://generativelanguage.googleapis.com/v1beta/models/\${GEMINI_MODEL}:generateContent?key=\${GEMINI_API_KEY}\`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(\`Gemini API error: \${error}\`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!jsonText) {
    throw new Error("Invalid response from Gemini");
  }

  // Clean up potential markdown code blocks
  const cleanedJson = jsonText.replace(/^```json/, "").replace(/```$/, "").trim();

  try {
    const parsed = JSON.parse(cleanedJson);
    return RoastResponseSchema.parse(parsed);
  } catch (e) {
    throw new Error(\`Failed to parse Gemini response: \${cleanedJson}\`);
  }
}
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/gemini.ts
git commit -m "feat: add Gemini API service"
```

---

### Task 3: Add tRPC Procedures

**Files:**
- Modify: `src/server/routers/_app.ts:1-77`

- [ ] **Step 1: Add imports**

Add to top of `_app.ts`:
```ts
import { analyses } from "@/db/schema/analyses";
import { submissions } from "@/db/schema/submissions";
import { analyzeCode } from "@/lib/ai/gemini";
import { z } from "zod";
```

- [ ] **Step 2: Add createRoast mutation**

Add to the router (after getLeaderboardStats):

```ts
createRoast: baseProcedure
  .input(
    z.object({
      code: z.string().min(1).max(2000),
      language: z.string(),
      roastMode: z.boolean().default(true),
    })
  )
  .mutation(async ({ input }) => {
    // Create submission with pending status - let DB generate ID
    const [submission] = await db.insert(submissions).values({
      code: input.code,
      language: input.language,
      score: "0",
      roastMode: input.roastMode,
      status: "pending",
    }).returning();

    const submissionId = submission.id;

    try {
      // Call Gemini API
      const result = await analyzeCode(input.code, input.roastMode);

      // Update submission with score
      await db.update(submissions).set({ score: result.score.toString(), status: "analyzed" }).where(eq(submissions.id, submissionId));

      // Create analyses
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
      await db.update(submissions).set({ status: "error" }).where(eq(submissions.id, submissionId));
      throw error;
    }
  }),
```

- [ ] **Step 4: Add getRoast query**

Add to the router:

```ts
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
```

- [ ] **Step 5: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/server/routers/_app.ts
git commit -m "feat: add createRoast mutation and getRoast query"
```

---

### Task 4: Connect HomeEditor to Mutation

**Files:**
- Modify: `src/app/home-editor.tsx:1-46`

- [ ] **Step 1: Add imports and router**

```ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useTRPC } from "@/lib/trpc/client";
```

- [ ] **Step 2: Add mutation logic**

Update HomeEditor function:

```ts
function HomeEditor() {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();

  const createRoast = trpc.createRoast.useMutation({
    onSuccess: (result) => {
      router.push(\`/roast/\${result.id}\`);
    },
    onError: (error) => {
      setIsLoading(false);
      alert(\`Error: \${error.message}\`);
    },
  });

  const handleSubmit = () => {
    if (isEmpty || isOverLimit) return;
    setIsLoading(true);
    createRoast.mutate({
      code,
      language: "javascript", // TODO: get from editor
      roastMode,
    });
  };

  const MAX_CHARS = 2000;
  const isOverLimit = code.length > MAX_CHARS;
  const isEmpty = code.trim().length === 0;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <CodeEditor
        value={code}
        onChange={setCode}
        maxLength={MAX_CHARS}
        className="w-full max-w-3xl max-h-[360px]"
      />

      {/* Actions Bar */}
      <div className="flex items-center justify-between w-full max-w-3xl">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            onCheckedChange={setRoastMode}
            label="roast mode"
          />
          <span className="font-mono text-xs text-text-tertiary">
            {roastMode ? "// maximum sarcasm enabled" : "// constructive feedback"}
          </span>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          disabled={isEmpty || isOverLimit || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "$ processing..." : "$ roast_my_code"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/home-editor.tsx
git commit -m "feat: connect HomeEditor to createRoast mutation"
```

---

### Task 5: Update Roast Result Page

**Files:**
- Modify: `src/app/roast/[id]/page.tsx:1-107`

- [ ] **Step 1: Add imports**

```ts
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing } from "@/components/ui/score-ring";
import { useTRPC } from "@/lib/trpc/client";
```

- [ ] **Step 2: Create client component for data fetching**

```ts
"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

function RoastResultContent({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.getRoast.queryOptions({ id })
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="font-mono text-text-tertiary">Loading...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="font-mono text-accent-red">Error loading roast</span>
      </div>
    );
  }

  const { submission, analyses } = data;

  // Determine verdict based on score
  const getVerdict = (score: number) => {
    if (score <= 3) return "needs_serious_help";
    if (score <= 6) return "could_be_better";
    return "not_bad";
  };

  const verdict = getVerdict(submission.score);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex flex-col gap-10 px-20 py-10">
        {/* Score Hero */}
        <div className="flex items-center gap-12">
          <ScoreRing score={submission.score} />

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent-red" />
              <span className="font-mono text-[13px] font-medium text-accent-red">
                verdict: {verdict}
              </span>
            </div>

            <p className="font-mono text-xl leading-relaxed text-text-primary">
              {/* Title from first analysis or default */}
              {analyses[0]?.message ?? "Code analyzed successfully"}
            </p>

            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-text-tertiary">
                lang: {submission.language}
              </span>
              <span className="font-mono text-xs text-text-tertiary">·</span>
              <span className="font-mono text-xs text-text-tertiary">
                {submission.code.split("\\n").length} lines
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border-primary" />

        {/* Submitted Code Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-sm font-bold text-text-primary">
              your_submission
            </span>
          </div>

          <CodePreview code={submission.code} />
        </div>
      </div>
    </main>
  );
}

function CodePreview({ code }: { code: string }) {
  const lines = code.split("\\n");

  return (
    <div className="flex border border-border-primary overflow-hidden">
      <div className="flex flex-col items-end gap-0 py-4 px-3 w-12 bg-bg-surface border-r border-border-primary shrink-0">
        {lines.map((_, i) => (
          <span
            key={i}
            className="font-mono text-xs leading-[1.625] text-text-tertiary"
          >
            {i + 1}
          </span>
        ))}
      </div>
      <pre className="flex-1 p-4 overflow-auto font-mono text-xs leading-[1.625] text-text-primary whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}
```

- [ ] **Step 3: Update page to use client component**

```ts
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoastResultPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoastResultContent id={id} />
    </Suspense>
  );
}
```

- [ ] **Step 4: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/app/roast/[id]/page.tsx
git commit -m "feat: update roast page to fetch from database"
```

---

## Verification

After completing all tasks:

- [ ] Run `npx next build` to verify full build passes
- [ ] Test the flow: submit code → wait for redirect → see result