import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import { ExternalLink, Globe } from "lucide-react";

export default async function AdminShowcasesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: showcases } = await supabase
    .from("showcase_records")
    .select(
      "*, student:users!showcase_records_student_user_id_fkey(display_name)"
    )
    .order("created_at", { ascending: false });

  const publicCount = (showcases ?? []).filter((s) => s.public_share_enabled).length;

  return (
    <Shell title="Showcases" introKey="admin.showcases">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-soft-gray/50">
          {showcases?.length ?? 0} total &middot; {publicCount} public
        </p>
      </div>

      {!showcases || showcases.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-soft-gray/50">No showcases yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {showcases.map((s) => {
            const student = s.student as { display_name: string } | null;
            const feedback = Array.isArray(s.feedback_received_json) ? s.feedback_received_json : [];
            return (
              <div
                key={s.id}
                className="rounded-xl border border-white/8 bg-white/3 p-5 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-soft-gray truncate">{s.title}</p>
                  <p className="text-xs text-soft-gray/50 mt-1">
                    {student?.display_name ?? "Unknown"} &middot;{" "}
                    {new Date(s.created_at).toLocaleDateString()}
                    {feedback.length > 0 && (
                      <span> &middot; {feedback.length} feedback</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.public_share_enabled && s.public_share_token && (
                    <a
                      href={`/showcase/${s.public_share_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vivid-teal/10 text-vivid-teal text-xs hover:bg-vivid-teal/20 transition-colors"
                    >
                      <Globe size={12} />
                      Public
                    </a>
                  )}
                  <Link
                    href={`/admin/showcases/${s.id}`}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-soft-gray/60 text-xs hover:text-soft-gray hover:border-white/20 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
