import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { logAiUsage } from "./usage-log";

export interface ShowcaseSummaryInput {
  studentName: string;
  projectTitle: string;
  projectDescription?: string | null;
  problemStatement?: string | null;
  targetUser?: string | null;
  valueProposition?: string | null;
  currentMethodStage?: number | null;
  showcaseDescription?: string | null;
  demoLink?: string | null;
  repoLink?: string | null;
  videoLink?: string | null;
  presentationLink?: string | null;
  requestedByUserId?: string;
}

export interface ShowcaseReadinessAssessment {
  readinessScore: number; // 1-10
  readinessLevel: "not_ready" | "developing" | "almost_ready" | "showcase_ready";
  strengths: string[];
  improvements: string[];
  suggestedDescription: string;
  presentationTips: string[];
}

/**
 * §11.10 — AI assesses showcase readiness + suggests improvements
 */
export async function generateShowcaseSummary(
  input: ShowcaseSummaryInput
): Promise<ShowcaseReadinessAssessment | null> {
  try {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const hasDemo = Boolean(input.demoLink);
    const hasRepo = Boolean(input.repoLink);
    const hasVideo = Boolean(input.videoLink);
    const hasSlides = Boolean(input.presentationLink);
    const hasDescription = Boolean(input.showcaseDescription);

    const prompt = `You are an expert startup pitch coach and educational program advisor reviewing a student's showcase submission for CAS Incubator OS.

Student: ${input.studentName}
Project Title: ${input.projectTitle}
Problem Statement: ${input.problemStatement ?? "Not provided"}
Target User: ${input.targetUser ?? "Not provided"}
Value Proposition: ${input.valueProposition ?? "Not provided"}
Project Description: ${input.projectDescription ?? "Not provided"}
Current Method Stage: ${input.currentMethodStage ?? "Unknown"} of 10
Showcase Description: ${input.showcaseDescription ?? "Not written yet"}

Showcase Materials Available:
- Demo/Product Link: ${hasDemo ? "YES" : "NO"}
- Repository: ${hasRepo ? "YES" : "NO"}
- Demo Video: ${hasVideo ? "YES" : "NO"}
- Presentation Slides: ${hasSlides ? "YES" : "NO"}
- Written Description: ${hasDescription ? "YES" : "NO"}

Evaluate this student's showcase readiness and provide:
1. A readiness score from 1-10 (10 = ready to present publicly)
2. A readiness level category
3. 2-4 specific strengths to celebrate
4. 2-4 concrete improvements needed before showcasing
5. A polished 3-4 sentence showcase description they could use (based on their project info)
6. 2-3 presentation tips tailored to their project

Readiness levels:
- not_ready (1-3): Missing core project elements, not ready to present
- developing (4-5): Project exists but showcase materials are incomplete
- almost_ready (6-7): Good foundation, minor improvements needed
- showcase_ready (8-10): Ready to present to public/investors

Respond in JSON:
{
  "readinessScore": 7,
  "readinessLevel": "almost_ready",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "suggestedDescription": "...",
  "presentationTips": ["...", "..."]
}`;

    const { text, usage } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      prompt,
      maxOutputTokens: 1000,
    });

    if (input.requestedByUserId) {
      await logAiUsage({
        userId: input.requestedByUserId,
        route: "/api/ai/showcase-summary",
        model: "claude-sonnet-4-6",
        tokensInput: usage?.inputTokens ?? 0,
        tokensOutput: usage?.outputTokens ?? 0,
      });
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as ShowcaseReadinessAssessment;
  } catch (err) {
    console.error("[showcase-summary] AI generation failed:", err);
    return null;
  }
}
