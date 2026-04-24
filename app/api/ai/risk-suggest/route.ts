import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { generateRiskSuggestion } from "@/lib/ai/risk-suggest";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const check = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (check instanceof NextResponse) return check;

  const user = await getCurrentUser();

  const body = await req.json();
  const {
    studentName,
    currentMethodStage,
    projectTitle,
    lastSubmissionDate,
    lastLoginDate,
    openRiskFlags,
    mentorNotes,
    rawDescription,
  } = body;

  if (!studentName || !rawDescription) {
    return NextResponse.json(
      { error: "studentName and rawDescription are required" },
      { status: 400 }
    );
  }

  const suggestion = await generateRiskSuggestion({
    studentName,
    currentMethodStage,
    projectTitle,
    lastSubmissionDate,
    lastLoginDate,
    openRiskFlags,
    mentorNotes,
    rawDescription,
    requestedByUserId: user?.userId,
  });

  if (!suggestion) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  return NextResponse.json(suggestion);
}
