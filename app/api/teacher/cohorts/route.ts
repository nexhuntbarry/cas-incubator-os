import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

// GET /api/teacher/cohorts — returns cohorts this teacher is assigned to
export async function GET() {
  const result = await requireAnyRole(["teacher", "super_admin"]);
  if (result instanceof NextResponse) return result;
  const user = result;

  const supabase = getServiceClient();

  if (user.role === "super_admin") {
    const { data, error } = await supabase
      .from("cohorts")
      .select("id, name")
      .order("name", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  // For regular teachers, scope to their assigned cohorts
  const { data: assignments } = await supabase
    .from("cohort_staff_assignments")
    .select("cohort_id, cohorts(id, name)")
    .eq("user_id", user.userId);

  const cohorts = (assignments ?? [])
    .map((a) => {
      const raw = a.cohorts;
      return (Array.isArray(raw) ? raw[0] : raw) as { id: string; name: string } | null;
    })
    .filter((c): c is { id: string; name: string } => c !== null);

  return NextResponse.json(cohorts);
}
