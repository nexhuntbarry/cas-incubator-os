import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import RiskFlagActions from "@/components/admin/RiskFlagActions";
import { ArrowLeft } from "lucide-react";

export default async function AdminRiskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: flag } = await supabase
    .from("risk_flags")
    .select(
      "*, student:users!risk_flags_student_user_id_fkey(display_name, email), raised_by:users!risk_flags_raised_by_user_id_fkey(display_name), assigned_to:users!risk_flags_assigned_to_user_id_fkey(display_name)"
    )
    .eq("id", id)
    .single();

  if (!flag) redirect("/admin/risks");

  const { data: staff } = await supabase
    .from("users")
    .select("id, display_name, role")
    .in("role", ["teacher", "mentor", "super_admin"]);

  const student = flag.student as { display_name: string; email: string } | null;
  const raisedBy = flag.raised_by as { display_name: string } | null;
  const assignedTo = flag.assigned_to as { display_name: string } | null;

  return (
    <Shell title="Risk Flag Detail" introKey="admin.riskDetail">
      <div className="max-w-2xl">
        <Link
          href="/admin/risks"
          className="flex items-center gap-2 text-sm text-soft-gray/50 hover:text-soft-gray mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Risks
        </Link>

        <div className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-5 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Student</p>
              <p className="text-soft-gray font-medium">{student?.display_name ?? "—"}</p>
              <p className="text-xs text-soft-gray/50">{student?.email}</p>
            </div>
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Flag Type</p>
              <p className="text-soft-gray font-medium">
                {flag.flag_type?.replace(/_/g, " ") ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Severity</p>
              <p className="font-semibold capitalize">{flag.severity ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Status</p>
              <p className="capitalize">{flag.status?.replace(/_/g, " ") ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Raised By</p>
              <p>{raisedBy?.display_name ?? "System"}</p>
            </div>
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-1">Assigned To</p>
              <p>{assignedTo?.display_name ?? "Unassigned"}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-2">Description</p>
            <div className="bg-white/3 rounded-lg p-4 text-sm text-soft-gray/80 leading-relaxed">
              {flag.description ?? flag.reason ?? "No description."}
            </div>
          </div>

          {flag.resolution_notes && (
            <div>
              <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-2">
                Resolution Notes
              </p>
              <div className="bg-vivid-teal/5 border border-vivid-teal/20 rounded-lg p-4 text-sm text-soft-gray/80">
                {flag.resolution_notes}
              </div>
            </div>
          )}
        </div>

        <RiskFlagActions
          flagId={flag.id}
          currentStatus={flag.status ?? "open"}
          staffList={(staff ?? []).map((s) => ({
            id: s.id,
            display_name: s.display_name,
            role: s.role,
          }))}
        />
      </div>
    </Shell>
  );
}
