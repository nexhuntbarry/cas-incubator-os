import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";

export default async function TeacherRubricsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();
  const { data: rubrics } = await supabase
    .from("rubric_templates")
    .select("id, name, stage_number, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <Shell title="Rubrics">
      <div className="space-y-4">
        <p className="text-xs text-soft-gray/40">
          Rubric templates are managed by admins. Contact your admin to create or edit rubrics.
        </p>

        {!rubrics || rubrics.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/40 text-sm">No rubric templates yet.</p>
          </div>
        ) : (
          rubrics.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-soft-gray">{r.name}</p>
                {r.stage_number && (
                  <p className="text-xs text-soft-gray/40 mt-0.5">Stage {r.stage_number}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Shell>
  );
}
