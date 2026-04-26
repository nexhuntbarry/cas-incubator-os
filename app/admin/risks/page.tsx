import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import { Flag, AlertTriangle } from "lucide-react";

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-green-500/15 text-green-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  high: "bg-orange-500/15 text-orange-400",
  critical: "bg-red-500/15 text-red-400",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-red-500/10 text-red-400",
  in_progress: "bg-yellow-500/10 text-yellow-400",
  resolved: "bg-vivid-teal/10 text-vivid-teal",
  dismissed: "bg-white/10 text-soft-gray/50",
};

export default async function AdminRisksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; severity?: string; flag_type?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const sp = await searchParams;
  const supabase = getServiceClient();

  let query = supabase
    .from("risk_flags")
    .select(
      "*, student:users!risk_flags_student_user_id_fkey(display_name), assigned_to:users!risk_flags_assigned_to_user_id_fkey(display_name)"
    )
    .order("created_at", { ascending: false });

  if (sp.status) query = query.eq("status", sp.status);
  if (sp.severity) query = query.eq("severity", sp.severity);
  if (sp.flag_type) query = query.eq("flag_type", sp.flag_type);

  const { data: flags } = await query;

  const severities = ["low", "medium", "high", "critical"];
  const statuses = ["open", "in_progress", "resolved", "dismissed"];

  return (
    <Shell title="Risk Flags" introKey="admin.risks">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/risks"
          className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-soft-gray/60 hover:text-soft-gray transition-colors"
        >
          All
        </Link>
        {severities.map((s) => (
          <Link
            key={s}
            href={`/admin/risks?severity=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sp.severity === s
                ? SEVERITY_STYLES[s]
                : "border border-white/10 text-soft-gray/60 hover:text-soft-gray"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/risks?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sp.status === s
                ? STATUS_STYLES[s]
                : "border border-white/10 text-soft-gray/60 hover:text-soft-gray"
            }`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {!flags || flags.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-soft-gray/50">No risk flags found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => {
            const student = flag.student as { display_name: string } | null;
            const assignee = flag.assigned_to as { display_name: string } | null;
            return (
              <Link
                key={flag.id}
                href={`/admin/risks/${flag.id}`}
                className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 p-5 hover:border-electric-blue/30 hover:bg-white/4 transition-all"
              >
                <AlertTriangle
                  size={16}
                  className={
                    flag.severity === "critical"
                      ? "text-red-400"
                      : flag.severity === "high"
                      ? "text-orange-400"
                      : flag.severity === "medium"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-soft-gray truncate">
                    {student?.display_name ?? "Unknown"} &mdash;{" "}
                    {flag.flag_type?.replace(/_/g, " ") ?? flag.reason}
                  </p>
                  <p className="text-xs text-soft-gray/50 mt-0.5">
                    {new Date(flag.created_at).toLocaleDateString()}
                    {assignee && <span> &middot; Assigned: {assignee.display_name}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      SEVERITY_STYLES[flag.severity] ?? SEVERITY_STYLES.medium
                    }`}
                  >
                    {flag.severity}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      STATUS_STYLES[flag.status] ?? STATUS_STYLES.open
                    }`}
                  >
                    {flag.status?.replace(/_/g, " ") ?? "open"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
