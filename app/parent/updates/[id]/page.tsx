import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { ArrowLeft, Clock } from "lucide-react";
import Shell from "@/components/parent/Shell";

export default async function ParentUpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "parent" && user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: update } = await supabase
    .from("parent_updates")
    .select(
      "*, student:users!parent_updates_student_user_id_fkey(display_name)"
    )
    .eq("id", id)
    .eq("sent_status", "sent")
    .single();

  if (!update) redirect("/parent/updates");

  const student = update.student as { display_name: string } | null;

  return (
    <Shell title={update.subject} introKey="parent.updateDetail">
      <div className="max-w-2xl">
        <Link
          href="/parent/updates"
          className="flex items-center gap-2 text-sm text-soft-gray/50 hover:text-soft-gray mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Inbox
        </Link>

        <div className="rounded-xl border border-white/8 bg-white/3 p-8">
          {update.update_type && (
            <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-electric-blue/10 text-electric-blue">
              {update.update_type.replace(/_/g, " ")}
            </span>
          )}
          <h1 className="text-2xl font-bold text-soft-gray mt-4 mb-2">{update.subject}</h1>
          <p className="text-xs text-soft-gray/40 flex items-center gap-2 mb-8">
            <Clock size={10} />
            {new Date(update.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {student && <span>&middot; Regarding {student.display_name}</span>}
          </p>

          <div className="text-soft-gray/80 leading-relaxed whitespace-pre-wrap text-[15px]">
            {update.body}
          </div>

          <div className="mt-10 pt-6 border-t border-white/8">
            <p className="text-xs text-soft-gray/30 text-center">
              Sent via CAS Incubator OS &mdash; incubator.nexhunt.xyz
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
