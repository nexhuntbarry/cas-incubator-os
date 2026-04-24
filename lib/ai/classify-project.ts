import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const ClassificationSchema = z.object({
  projectTypeSlug: z.string().describe("The project type slug from the predefined list"),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0 and 1"),
  manualReviewNeeded: z.boolean().describe("Whether human review is recommended"),
  reason: z.string().describe("Brief explanation of the classification"),
});

export type ProjectClassification = z.infer<typeof ClassificationSchema>;

const PROJECT_TYPES = [
  "productivity_tool",
  "research_support_tool",
  "education_platform",
  "health_wellness_app",
  "social_impact_solution",
  "creative_media_tool",
  "environment_sustainability",
  "fintech_economic_tool",
  "community_platform",
  "other",
];

export async function classifyProject(
  projectDescription: string
): Promise<ProjectClassification> {
  const fallback: ProjectClassification = {
    projectTypeSlug: "other",
    confidence: 0,
    manualReviewNeeded: true,
    reason: "AI classification unavailable — manual review required.",
  };

  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are a project classifier for a student incubator program. Classify the following student project description into one of the predefined project types.

Available project types:
${PROJECT_TYPES.join(", ")}

Project Description:
"${projectDescription}"

Choose the most fitting type. If the confidence is below 0.6, set manualReviewNeeded to true.`;

    const { output } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      output: Output.object({ schema: ClassificationSchema }),
      prompt,
      maxOutputTokens: 512,
    });

    // Validate the slug is in our list
    if (!PROJECT_TYPES.includes(output.projectTypeSlug)) {
      output.projectTypeSlug = "other";
      output.manualReviewNeeded = true;
    }

    return output;
  } catch (err) {
    console.error("[classify-project] AI classification failed:", err);
    return fallback;
  }
}
