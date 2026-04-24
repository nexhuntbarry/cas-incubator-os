import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const SummarySchema = z.object({
  summary: z.string().describe("2-3 sentence overall summary of the student's submission"),
  clear_parts: z.array(z.string()).describe("Parts that are well-articulated"),
  unclear_parts: z.array(z.string()).describe("Parts that need more detail or clarification"),
  reviewer_focus: z.array(z.string()).describe("Specific things the reviewer should pay attention to"),
});

export type WorksheetSummary = z.infer<typeof SummarySchema>;

export async function generateWorksheetSummary(
  templateTitle: string,
  fieldsSchema: Array<{ label: string; key: string; type: string }>,
  submissionData: Record<string, unknown>
): Promise<WorksheetSummary> {
  const fallback: WorksheetSummary = {
    summary: "AI summary unavailable — please review manually.",
    clear_parts: [],
    unclear_parts: [],
    reviewer_focus: ["Review all fields manually."],
  };

  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const fieldSummary = fieldsSchema
      .map((f) => {
        const val = submissionData[f.key];
        const valStr =
          val === undefined || val === null || val === ""
            ? "(not answered)"
            : typeof val === "object"
            ? JSON.stringify(val)
            : String(val);
        return `- ${f.label}: ${valStr}`;
      })
      .join("\n");

    const prompt = `You are an educational reviewer assistant for a high school incubator program.

Worksheet: "${templateTitle}"

Student's submission:
${fieldSummary}

Analyze the submission and provide:
1. A 2-3 sentence summary of what the student submitted
2. Which parts are clearly articulated (list specific fields/responses)
3. Which parts are unclear, vague, or incomplete
4. What the human reviewer should focus on

Be concise and constructive. Write in a supportive tone suitable for high school students.`;

    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      output: Output.object({ schema: SummarySchema }),
      prompt,
      maxOutputTokens: 800,
    });

    return output;
  } catch (err) {
    console.error("[worksheet-summary] AI generation failed:", err);
    return fallback;
  }
}
