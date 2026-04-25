import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { Clock } from "lucide-react";
import Shell from "@/components/parent/Shell";

export default async function ParentUpdatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "parent" && user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  // Get student IDs linked to this parent
  const { data: links } = await supabase
    .from("parent_student_links")
    .select("student_user_id")
    .eq("parent_user_id", user.userId);

  const studentIds = (links ?? []).map((l) => l.student_user_id);

  const { data: updates } = studentIds.length
    ? await supabase
        .from("parent_updates")
        .select(
          "*, student:users!parent_updates_student_user_id_fkey(display_name)"
        )
        .in("student_user_id", studentIds)
        .eq("sent_status", "sent")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <Shell title="Your Updates Inbox">
      <div className="max-w-3xl">
        {!updates || updates.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center">
            <p className="text-soft-gray/50">No updates received yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((u) => {
              const student = u.student as { display_name: string } | null;
              return (
                <Link
                  key={u.id}
                  href={`/parent/updates/${u.id}`}
                  className="block rounded-xl border border-white/8 bg-white/3 p-5 hover:border-electric-blue/30 hover:bg-white/4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-soft-gray">{u.subject}</p>
                      <p className="text-xs text-soft-gray/50 mt-1 flex items-center gap-2">
                        <Clock size={10} />
                        {new Date(u.created_at).toLocaleDateString()}
                        {student && (
                          <span className="ml-1">
                            &middot; Re: {student.display_name}
                          </span>
                        )}
                      </p>
                    </div>
                    {u.update_type && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-electric-blue/10 text-electric-blue flex-shrink-0">
                        {u.update_type.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-soft-gray/60 mt-2 line-clamp-2">{u.body}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
