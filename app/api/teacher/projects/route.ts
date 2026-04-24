import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const result = await requireAnyRole(["teacher", "super_admin"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const supabase = getServiceClient();

  // Get cohorts this teacher is assigned to
  const { data: assignments } = await supabase
    .from("cohort_staff_assignments")
    .select("cohort_id")
    .eq("user_id", user.userId)
    .in("role", ["teacher", "super_admin"]);

  const cohortIds = assignments?.map((a) => a.cohort_id) ?? [];

  if (cohortIds.length === 0 && user.role !== "super_admin") {
    return NextResponse.json([]);
  }

  let query = supabase
    .from("projects")
    .select(`
      id, title, status, current_stage, stage_status, problem_statement,
      created_at, updated_at,
      project_type_definitions(name, slug),
      users!projects_student_user_id_fkey(display_name, email),
      enrollment_records!projects_enrollment_id_fkey(cohort_id, cohorts(name))
    `)
    .order("updated_at", { ascending: false });

  if (user.role !== "super_admin" && cohortIds.length > 0) {
    query = query.in("enrollment_records.cohort_id", cohortIds);
  }

  const { data: projects, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(projects ?? []);
}
