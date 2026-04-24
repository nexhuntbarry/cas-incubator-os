import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import { Plus } from "lucide-react";

export default async function TeacherWorksheetsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();
  const { data: templates } = await supabase
    .from("worksheet_templates")
    .select("id, title, template_type, scoring_type, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Count pending submissions
  const { count: pendingCount } = await supabase
    .from("worksheet_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  return (
    <Shell title="Worksheets">
      <div className="space-y-6">
        {/* Review queue callout */}
        {(pendingCount ?? 0) > 0 && (
          <div className="rounded-xl border border-electric-blue/30 bg-electric-blue/10 p-4 flex items-center justify-between">
            <p className="text-sm text-soft-gray">
              <span className="font-bold text-electric-blue">{pendingCount}</span> submission{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
            <Link
              href="/teacher/worksheets/review"
              className="px-4 py-1.5 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
            >
              Review Queue
            </Link>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-soft-gray/60 uppercase tracking-wider">Templates</h2>
          <Link
            href="/admin/worksheets/new"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-blue/10 text-electric-blue text-xs font-medium hover:bg-electric-blue/20 transition-colors"
          >
            <Plus size={12} />
            New
          </Link>
        </div>

        <div className="space-y-2">
          {(!templates || templates.length === 0) ? (
            <p className="text-soft-gray/40 text-sm">No worksheet templates yet.</p>
          ) : (
            templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-soft-gray">{t.title}</p>
                  <p className="text-xs text-soft-gray/40 mt-0.5">{t.template_type} · {t.scoring_type}</p>
                </div>
                <Link
                  href={`/admin/worksheets/${t.id}`}
                  className="text-xs text-electric-blue hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
