import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import { Plus } from "lucide-react";

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
        <div className="flex justify-end">
          <Link
            href="/admin/rubrics/new"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-blue/10 text-electric-blue text-xs font-medium hover:bg-electric-blue/20 transition-colors"
          >
            <Plus size={12} />
            New Rubric
          </Link>
        </div>

        {!rubrics || rubrics.length === 0 ? (
          <p className="text-soft-gray/40 text-sm">No rubric templates yet.</p>
        ) : (
          rubrics.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-soft-gray">{r.name}</p>
                {r.stage_number && (
                  <p className="text-xs text-soft-gray/40 mt-0.5">Stage {r.stage_number}</p>
                )}
              </div>
              <Link
                href={`/admin/rubrics/${r.id}`}
                className="text-xs text-electric-blue hover:underline"
              >
                Edit
              </Link>
            </div>
          ))
        )}
      </div>
    </Shell>
  );
}
