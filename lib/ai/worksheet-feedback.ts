import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const FeedbackSchema = z.object({
  positive_observation: z.string().describe("What the student did well"),
  improvement_points: z.array(z.string()).describe("Specific areas to improve"),
  next_action: z.string().describe("The most important next step for the student"),
  scope_reduction_suggestion: z
    .string()
    .optional()
    .describe("If scope is too large, a suggestion to reduce it"),
});

export type WorksheetFeedback = z.infer<typeof FeedbackSchema>;

interface FeedbackInput {
  stage?: string;
  projectSummary?: string;
  submissionData: Record<string, unknown>;
  worksheetTitle: string;
  fieldsSchema: Array<{ label: string; key: string }>;
  rubricData?: string;
}

export async function generateWorksheetFeedback(
  input: FeedbackInput
): Promise<WorksheetFeedback> {
  const fallback: WorksheetFeedback = {
    positive_observation: "AI feedback unavailable — please write feedback manually.",
    improvement_points: [],
    next_action: "Please review the submission and provide manual feedback.",
  };

  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const fieldSummary = input.fieldsSchema
      .map((f) => {
        const val = input.submissionData[f.key];
        const valStr =
          val === undefined || val === null || val === ""
            ? "(not answered)"
            : typeof val === "object"
            ? JSON.stringify(val)
            : String(val);
        return `- ${f.label}: ${valStr}`;
      })
      .join("\n");

    const prompt = `You are a mentor coach at a high school startup incubator program. Draft feedback for a student's worksheet submission.

Worksheet: "${input.worksheetTitle}"
${input.stage ? `Stage: ${input.stage}` : ""}
${input.projectSummary ? `Project Summary: ${input.projectSummary}` : ""}
${input.rubricData ? `Rubric Reference:\n${input.rubricData}` : ""}

Student's Submission:
${fieldSummary}

Write mentor feedback that:
1. Identifies what the student did well (positive_observation)
2. Lists 2-4 specific improvement points
3. Gives ONE clear next action for the student
4. Optionally suggests scope reduction if the project seems too ambitious

Keep the tone warm, direct, and encouraging. Suitable for high school students. Be specific, not generic.`;

    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      output: Output.object({ schema: FeedbackSchema }),
      prompt,
      maxOutputTokens: 1000,
    });

    return output;
  } catch (err) {
    console.error("[worksheet-feedback] AI generation failed:", err);
    return fallback;
  }
}
