import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { logAiUsage } from "./usage-log";

export interface RiskSuggestionInput {
  studentName: string;
  currentMethodStage?: number | null;
  projectTitle?: string | null;
  lastSubmissionDate?: string | null;
  lastLoginDate?: string | null;
  openRiskFlags?: number;
  mentorNotes?: string | null;
  rawDescription: string;
  requestedByUserId?: string;
}

export interface RiskSuggestion {
  suggestedSeverity: "low" | "medium" | "high" | "critical";
  suggestedFlagType: string;
  suggestedOwner: "mentor" | "teacher" | "super_admin";
  reasoning: string;
  recommendedActions: string[];
}

/**
 * §11.9 — AI suggests severity + recommended owner for a risk flag
 */
export async function generateRiskSuggestion(
  input: RiskSuggestionInput
): Promise<RiskSuggestion | null> {
  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are an experienced education program manager reviewing a risk flag for a student in CAS Incubator OS, a project-based learning incubator.

Student: ${input.studentName}
Current Method Stage: ${input.currentMethodStage ?? "Unknown"} of 10
Project: ${input.projectTitle ?? "Not specified"}
Last Worksheet Submission: ${input.lastSubmissionDate ?? "Unknown"}
Last Platform Login: ${input.lastLoginDate ?? "Unknown"}
Currently Open Risk Flags: ${input.openRiskFlags ?? 0}
Recent Mentor Notes: ${input.mentorNotes ?? "None"}

Risk Description Written by Staff:
"${input.rawDescription}"

Based on this information, suggest:
1. The appropriate severity level (low/medium/high/critical)
2. The best flag type category (no_progress/scope_too_broad/quality_concern/attendance/conflict/other)
3. Who should own this flag (mentor/teacher/super_admin)
4. Brief reasoning
5. 2-3 concrete recommended actions

Criteria:
- low: minor issue, student is generally progressing
- medium: noticeable problem, may affect progress if unaddressed
- high: significant risk, needs prompt attention within days
- critical: immediate action required, potential program failure or welfare concern
- super_admin: systemic issues, parent communication needed, or welfare concerns
- mentor: academic/project quality issues
- teacher: attendance, cohort-wide issues, or escalations

Respond in JSON format:
{
  "suggestedSeverity": "medium",
  "suggestedFlagType": "no_progress",
  "suggestedOwner": "mentor",
  "reasoning": "...",
  "recommendedActions": ["...", "...", "..."]
}`;

    const { text, usage } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt,
      maxOutputTokens: 600,
    });

    if (input.requestedByUserId) {
      await logAiUsage({
        userId: input.requestedByUserId,
        route: "/api/ai/risk-suggest",
        model: "claude-haiku-4-5",
        tokensInput: usage?.inputTokens ?? 0,
        tokensOutput: usage?.outputTokens ?? 0,
      });
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as RiskSuggestion;
  } catch (err) {
    console.error("[risk-suggest] AI generation failed:", err);
    return null;
  }
}
