import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import Link from "next/link";
import { ChevronRight, CheckCircle, Circle } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  not_started: "bg-white/10 text-soft-gray/50",
  in_progress: "bg-electric-blue/15 text-electric-blue",
  submitted: "bg-gold/15 text-gold",
  reviewed: "bg-vivid-teal/15 text-vivid-teal",
};

type WorkFilter = "all" | "has_live" | "has_demo" | "has_none";

function hasLiveProduct(p: { live_product_url?: string | null }): boolean {
  return Boolean(p.live_product_url);
}

function hasDemo(p: { demo_video_url?: string | null }): boolean {
  return Boolean(p.demo_video_url);
}

function hasAnyWork(p: {
  live_product_url?: string | null;
  demo_video_url?: string | null;
  github_repo_url?: string | null;
  figma_or_design_url?: string | null;
  presentation_slide_url?: string | null;
  github_url?: string | null;
  figma_url?: string | null;
  presentation_url?: string | null;
  screenshot_gallery_urls?: unknown;
}): boolean {
  if (p.live_product_url) return true;
  if (p.demo_video_url) return true;
  if (p.github_repo_url || p.github_url) return true;
  if (p.figma_or_design_url || p.figma_url) return true;
  if (p.presentation_slide_url || p.presentation_url) return true;
  const gallery = p.screenshot_gallery_urls;
  if (Array.isArray(gallery) && gallery.length > 0) return true;
  return false;
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const { filter: filterParam } = await searchParams;
  const activeFilter: WorkFilter =
    filterParam === "has_live" || filterParam === "has_demo" || filterParam === "has_none"
      ? filterParam
      : "all";

  const supabase = getServiceClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id, title, current_stage, stage_status, status, created_at,
      live_product_url, demo_video_url, github_repo_url, figma_or_design_url,
      presentation_slide_url, screenshot_gallery_urls,
      github_url, figma_url, presentation_url,
      users!projects_student_user_id_fkey(display_name, email),
      project_type_definitions(name),
      enrollment_records!projects_enrollment_id_fkey(cohorts(name))
    `)
    .order("updated_at", { ascending: false });

  // Client-side filter since data volume is small for admin
  const filtered = (projects ?? []).filter((p) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "has_live") return hasLiveProduct(p);
    if (activeFilter === "has_demo") return hasDemo(p);
    if (activeFilter === "has_none") return !hasAnyWork(p);
    return true;
  });

  const filterButtons: { key: WorkFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "has_live", label: "Has Live Product" },
    { key: "has_demo", label: "Has Demo" },
    { key: "has_none", label: "No Work Yet" },
  ];

  return (
    <Shell title="All Projects">
      <div className="space-y-4">
        {/* Filter toggles */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <Link
              key={btn.key}
              href={btn.key === "all" ? "/admin/projects" : `/admin/projects?filter=${btn.key}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeFilter === btn.key
                  ? "bg-electric-blue/20 border-electric-blue/40 text-electric-blue"
                  : "bg-white/5 border-white/10 text-soft-gray/50 hover:text-soft-gray"
              }`}
            >
              {btn.label}
            </Link>
          ))}
        </div>

        <p className="text-sm text-soft-gray/50">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</p>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/50">No projects match this filter.</p>
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
                  <th className="text-left px-5 py-3">Has Work?</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const student = p.users as unknown as { display_name: string; email: string } | null;
                  const cohort = (p.enrollment_records as unknown as { cohorts: { name: string } } | null)?.cohorts;
                  const type = p.project_type_definitions as unknown as { name: string } | null;
                  const stageStatus = p.stage_status ?? "not_started";
                  const hasWork = hasAnyWork(p);
                  const hasLive = hasLiveProduct(p);
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
                        {hasWork ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-vivid-teal" />
                            {hasLive && (
                              <span className="text-[10px] text-vivid-teal font-medium">Live</span>
                            )}
                          </div>
                        ) : (
                          <Circle size={14} className="text-soft-gray/20" />
                        )}
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
