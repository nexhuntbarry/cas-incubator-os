import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { generateParentUpdateDraft } from "@/lib/ai/parent-update";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const check = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (check instanceof NextResponse) return check;

  const user = await getCurrentUser();

  const body = await req.json();
  const {
    updateType,
    studentName,
    gradeLevel,
    school,
    currentMethodStage,
    recentActivity,
    mentorNotes,
    projectTitle,
    projectDescription,
    teacherName,
  } = body;

  if (!updateType || !studentName) {
    return NextResponse.json({ error: "updateType and studentName are required" }, { status: 400 });
  }

  const draft = await generateParentUpdateDraft({
    updateType,
    studentName,
    gradeLevel,
    school,
    currentMethodStage,
    recentActivity,
    mentorNotes,
    projectTitle,
    projectDescription,
    teacherName,
    requestedByUserId: user?.userId,
  });

  if (!draft) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  return NextResponse.json(draft);
}
