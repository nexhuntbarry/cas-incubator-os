import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  not_started: "bg-white/10 text-soft-gray/50",
  in_progress: "bg-electric-blue/15 text-electric-blue",
  submitted: "bg-gold/15 text-gold",
  reviewed: "bg-vivid-teal/15 text-vivid-teal",
};

export default async function AdminProjectsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id, title, current_stage, stage_status, status, created_at,
      users!projects_student_user_id_fkey(display_name, email),
      project_type_definitions(name),
      enrollment_records!projects_enrollment_id_fkey(cohorts(name))
    `)
    .order("updated_at", { ascending: false });

  return (
    <Shell title="All Projects">
      <div className="space-y-4">
        <p className="text-sm text-soft-gray/50">{projects?.length ?? 0} projects total</p>

        {(!projects || projects.length === 0) ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/50">No projects yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-soft-gray/50 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Project</th>
                  <th className="text-left px-5 py-3">Cohort</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Stage</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const student = p.users as unknown as { display_name: string; email: string } | null;
                  const cohort = (p.enrollment_records as unknown as { cohorts: { name: string } } | null)?.cohorts;
                  const type = p.project_type_definitions as unknown as { name: string } | null;
                  const stageStatus = p.stage_status ?? "not_started";
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium">{student?.display_name ?? "—"}</p>
                        <p className="text-xs text-soft-gray/40">{student?.email}</p>
                      </td>
                      <td className="px-5 py-3 max-w-[180px]">
                        <p className="truncate">{p.title}</p>
                      </td>
                      <td className="px-5 py-3 text-soft-gray/60 text-xs">{cohort?.name ?? "—"}</td>
                      <td className="px-5 py-3 text-soft-gray/60 text-xs">{type?.name ?? "—"}</td>
                      <td className="px-5 py-3 text-soft-gray/70">Stage {p.current_stage}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[stageStatus] ?? "bg-white/10 text-soft-gray/50"}`}>
                          {stageStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/teacher/projects/${p.id}`}
                          className="flex items-center gap-1 text-electric-blue text-xs hover:underline"
                        >
                          View <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
