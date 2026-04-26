import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/mentor/Shell";

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-green-500/15 text-green-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  high: "bg-orange-500/15 text-orange-400",
  critical: "bg-red-500/15 text-red-400",
};

export default async function MentorRisksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "mentor" && user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: flags } = await supabase
    .from("risk_flags")
    .select(
      "*, student:users!risk_flags_student_user_id_fkey(display_name)"
    )
    .eq("assigned_to_user_id", user.userId)
    .neq("status", "resolved")
    .neq("status", "dismissed")
    .order("created_at", { ascending: false });

  return (
    <Shell title="Risk Flags" introKey="mentor.risks">
      {!flags || flags.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-soft-gray/50">No open risk flags assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => {
            const student = flag.student as { display_name: string } | null;
            return (
              <div key={flag.id} className="rounded-xl border border-white/8 bg-white/3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-soft-gray">
                      {student?.display_name ?? "Unknown"} &mdash;{" "}
                      {flag.flag_type?.replace(/_/g, " ") ?? "Risk"}
                    </p>
                    <p className="text-sm text-soft-gray/60 mt-1 line-clamp-2">
                      {flag.description ?? flag.reason}
                    </p>
                    <p className="text-xs text-soft-gray/40 mt-2">
                      {new Date(flag.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                      SEVERITY_STYLES[flag.severity ?? flag.risk_level] ?? SEVERITY_STYLES.medium
                    }`}
                  >
                    {flag.severity ?? flag.risk_level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
