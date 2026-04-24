import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { logAiUsage } from "./usage-log";

export interface ParentUpdateDraftInput {
  updateType: string;
  studentName: string;
  gradeLevel?: string | null;
  school?: string | null;
  currentMethodStage?: number | null;
  recentActivity?: string | null;
  mentorNotes?: string | null;
  projectTitle?: string | null;
  projectDescription?: string | null;
  teacherName?: string | null;
  requestedByUserId?: string;
}

export interface ParentUpdateDraft {
  subject: string;
  body: string;
}

/**
 * §11.8 — AI-drafted parent update
 */
export async function generateParentUpdateDraft(
  input: ParentUpdateDraftInput
): Promise<ParentUpdateDraft | null> {
  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const updateTypeLabel: Record<string, string> = {
      intake_summary: "Intake Summary",
      mid_program: "Mid-Program Progress Update",
      milestone: "Milestone Achievement",
      concern: "Progress Concern",
      showcase: "Showcase Invitation",
      final_summary: "Final Program Summary",
      general: "General Update",
    };

    const typeLabel = updateTypeLabel[input.updateType] ?? input.updateType;

    const prompt = `You are a professional educational coordinator at CAS Incubator OS, a project-based learning incubator program for high school students. Write a warm, professional parent update email.

Update Type: ${typeLabel}
Student Name: ${input.studentName}
Grade Level: ${input.gradeLevel ?? "Not specified"}
School: ${input.school ?? "Not specified"}
Current Method Stage: ${input.currentMethodStage ?? "Not specified"} of 10
Project Title: ${input.projectTitle ?? "Not started"}
Project Description: ${input.projectDescription ?? "Not provided"}
Recent Activity: ${input.recentActivity ?? "No recent activity logged"}
Mentor/Teacher Notes: ${input.mentorNotes ?? "None"}
Sent By: ${input.teacherName ?? "Program Staff"}

Write a parent update with:
1. A compelling subject line (start with "Re:" if it's a follow-up, otherwise just the topic)
2. A professional email body that:
   - Addresses parents warmly but professionally
   - Summarizes the student's current progress clearly
   - Mentions specific accomplishments or concerns relevant to the update type
   - Provides actionable information or next steps
   - Ends with an invitation to reach out with questions
   - Uses encouraging, supportive language
   - Is 150-300 words

Respond in JSON format exactly like this:
{"subject": "...", "body": "..."}

The body should be plain text with paragraph breaks using \\n\\n.`;

    const { text, usage } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt,
      maxOutputTokens: 800,
    });

    // Log usage
    if (input.requestedByUserId) {
      await logAiUsage({
        userId: input.requestedByUserId,
        route: "/api/ai/parent-update",
        model: "claude-haiku-4-5",
        tokensInput: usage?.inputTokens ?? 0,
        tokensOutput: usage?.outputTokens ?? 0,
      });
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[parent-update] No JSON found in AI response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParentUpdateDraft;
    return parsed;
  } catch (err) {
    console.error("[parent-update] AI generation failed:", err);
    return null;
  }
}
