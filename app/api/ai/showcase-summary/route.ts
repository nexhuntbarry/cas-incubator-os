import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { generateShowcaseSummary } from "@/lib/ai/showcase-summary";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const check = await requireAnyRole(["super_admin", "teacher", "mentor", "student"]);
  if (check instanceof NextResponse) return check;

  const user = await getCurrentUser();

  const body = await req.json();
  const {
    studentName,
    projectTitle,
    projectDescription,
    problemStatement,
    targetUser,
    valueProposition,
    currentMethodStage,
    showcaseDescription,
    demoLink,
    repoLink,
    videoLink,
    presentationLink,
  } = body;

  if (!studentName || !projectTitle) {
    return NextResponse.json(
      { error: "studentName and projectTitle are required" },
      { status: 400 }
    );
  }

  const assessment = await generateShowcaseSummary({
    studentName,
    projectTitle,
    projectDescription,
    problemStatement,
    targetUser,
    valueProposition,
    currentMethodStage,
    showcaseDescription,
    demoLink,
    repoLink,
    videoLink,
    presentationLink,
    requestedByUserId: user?.userId,
  });

  if (!assessment) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  return NextResponse.json(assessment);
}
