import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_user_id");
  const noteType = searchParams.get("note_type");
  const escalationOnly = searchParams.get("escalation") === "true";
  const all = searchParams.get("all") === "true"; // admin: all notes

  const supabase = getServiceClient();
  let query = supabase
    .from("mentor_notes")
    .select("id, content, note_body, note_type, recommended_next_step, escalation_flag, session_date, created_at, student_user_id, mentor_user_id, project_id, projects(title), users!student_user_id(display_name)")
    .order("created_at", { ascending: false });

  // Non-admins only see their own notes unless fetching all as admin
  if (user.role !== "super_admin" || !all) {
    query = query.eq("mentor_user_id", user.userId);
  }

  if (studentId) query = query.eq("student_user_id", studentId);
  if (noteType) query = query.eq("note_type", noteType);
  if (escalationOnly) query = query.eq("escalation_flag", true);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await req.json();
  const {
    student_user_id,
    project_id,
    note_type,
    note_body,
    recommended_next_step,
    escalation_flag,
  } = body;

  if (!student_user_id || !note_body) {
    return NextResponse.json(
      { error: "student_user_id and note_body required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("mentor_notes")
    .insert({
      student_user_id,
      project_id: project_id ?? null,
      mentor_user_id: user.userId,
      content: note_body, // keep legacy column populated
      note_type: note_type ?? "check_in",
      note_body,
      recommended_next_step: recommended_next_step ?? null,
      escalation_flag: escalation_flag ?? false,
      session_date: new Date().toISOString().split("T")[0],
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notification stub for escalation
  if (escalation_flag) {
    await supabase.from("notifications").insert({
      user_id: student_user_id,
      type: "mentor_note_escalation",
      payload: {
        note_id: data?.id,
        mentor_user_id: user.userId,
        student_user_id,
      },
    });
  }

  return NextResponse.json(data, { status: 201 });
}
