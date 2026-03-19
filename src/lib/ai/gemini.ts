import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash-exp";

const RoastResponseSchema = z.object({
  score: z.number().min(0).max(10),
  title: z.string(),
  analyses: z.array(
    z.object({
      severity: z.enum(["critical", "warning", "good"]),
      message: z.string(),
      line: z.number().optional(),
    }),
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
  roastMode: boolean,
): Promise<RoastAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = roastMode ? ROAST_PROMPT : NORMAL_PROMPT;
  const fullPrompt = `${prompt}\n\nCode to analyze:\n\`\`\`\n${code}\n\`\`\``;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!jsonText) {
    throw new Error("Invalid response from Gemini");
  }

  const cleanedJson = jsonText
    .replace(/^```json/, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedJson);
    return RoastResponseSchema.parse(parsed);
  } catch (e) {
    throw new Error(`Failed to parse Gemini response: ${cleanedJson}`);
  }
}
