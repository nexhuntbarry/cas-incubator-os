import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const IntakeSummarySchema = z.object({
  studentOverview: z.string().describe("2-3 sentence summary of the student"),
  interestsAndDirection: z.string().describe("Key interests and project direction"),
  projectReadiness: z.enum(["low", "medium", "high"]).describe("Readiness to start a project"),
  aiExperienceLevel: z.enum(["none", "light", "moderate", "heavy"]).describe("AI experience"),
  potentialStrengths: z.array(z.string()).describe("3-5 potential strengths"),
  supportNeeds: z.array(z.string()).describe("Areas where student may need support"),
  suggestedMentorFocus: z.string().describe("What a mentor should focus on first"),
});

export type IntakeSummary = z.infer<typeof IntakeSummarySchema>;

export interface StudentIntakeData {
  gradeLevel?: string | null;
  school?: string | null;
  location?: string | null;
  interests?: string[];
  academicDirection?: string | null;
  competitionGoals?: string | null;
  portfolioGoals?: string | null;
  aiExperienceLevel?: string | null;
  aiToolsUsed?: string | null;
  problemStatement?: string | null;
}

export async function generateIntakeSummary(
  studentIntake: StudentIntakeData
): Promise<IntakeSummary | null> {
  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are an expert education counselor reviewing a student's intake form for a project-based incubator program. Based on the information provided, generate a structured intake summary.

Student Information:
- Grade Level: ${studentIntake.gradeLevel ?? "Not provided"}
- School: ${studentIntake.school ?? "Not provided"}
- Location: ${studentIntake.location ?? "Not provided"}
- Interests: ${studentIntake.interests?.join(", ") ?? "Not provided"}
- Academic/College Direction: ${studentIntake.academicDirection ?? "Not provided"}
- Competition Goals: ${studentIntake.competitionGoals ?? "Not provided"}
- Portfolio Goals: ${studentIntake.portfolioGoals ?? "Not provided"}
- AI Experience Level: ${studentIntake.aiExperienceLevel ?? "Not provided"}
- AI Tools Used: ${studentIntake.aiToolsUsed ?? "Not provided"}
- Problem They Want to Solve: ${studentIntake.problemStatement ?? "Not provided"}

Generate a structured summary to help mentors and teachers understand this student quickly. Be specific, constructive, and actionable.`;

    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      output: Output.object({ schema: IntakeSummarySchema }),
      prompt,
      maxOutputTokens: 1024,
    });

    return output;
  } catch (err) {
    console.error("[intake] AI generation failed:", err);
    // Graceful fallback
    return null;
  }
}
