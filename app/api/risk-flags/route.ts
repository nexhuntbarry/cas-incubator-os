import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { notify } from "@/lib/notifications/notify";
import { sendRiskAlert } from "@/lib/email/send";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "teacher", "mentor"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    student_user_id,
    project_id,
    flag_type,
    severity,
    description,
    assigned_to_user_id,
  } = body;

  if (!student_user_id || !flag_type || !severity || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Check for duplicate open flag of same type
  const { data: existing } = await supabase
    .from("risk_flags")
    .select("id")
    .eq("student_user_id", student_user_id)
    .eq("flag_type", flag_type)
    .eq("status", "open")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An open flag of this type already exists for this student", existing_id: existing.id },
      { status: 409 }
    );
  }

  const { data: student } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", student_user_id)
    .single();

  const { data: flag, error } = await supabase
    .from("risk_flags")
    .insert({
      student_user_id,
      project_id: project_id ?? null,
      flag_type,
      severity,
      description,
      raised_by_user_id: user.userId,
      assigned_to_user_id: assigned_to_user_id ?? null,
      status: "open",
      // legacy columns
      risk_level: severity,
      reason: description,
      flagged_by: user.userId,
    })
    .select()
    .single();

  if (error || !flag) {
    console.error("[risk-flags] insert error:", error);
    return NextResponse.json({ error: "Failed to create risk flag" }, { status: 500 });
  }

  const studentName = student?.display_name ?? "Unknown Student";

  // Notify assigned user
  if (assigned_to_user_id) {
    await notify({
      user_id: assigned_to_user_id,
      type: "risk_flag_assigned",
      payload: {
        flag_id: flag.id,
        student_name: studentName,
        flag_type,
        severity,
      },
    });

    // Send email for high/critical severity
    if (["high", "critical"].includes(severity)) {
      const { data: assignee } = await supabase
        .from("users")
        .select("email, display_name")
        .eq("id", assigned_to_user_id)
        .single();

      if (assignee) {
        await sendRiskAlert(assignee.email, {
          recipientName: assignee.display_name,
          studentName,
          flagType: flag_type,
          severity,
          description,
          raisedBy: user.displayName,
          flagId: flag.id,
        });
      }
    }
  }

  return NextResponse.json({ flag });
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const flagType = searchParams.get("flag_type");

  const supabase = getServiceClient();
  let query = supabase
    .from("risk_flags")
    .select(
      "*, student:users!risk_flags_student_user_id_fkey(display_name, email), assigned_to:users!risk_flags_assigned_to_user_id_fkey(display_name)"
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (severity) query = query.eq("severity", severity);
  if (flagType) query = query.eq("flag_type", flagType);

  // Scope by role
  if (user.role === "teacher" || user.role === "mentor") {
    query = query.eq("assigned_to_user_id", user.userId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ flags: data });
}
