import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { ArrowLeft, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageIntro from "@/components/shared/PageIntro";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-white/10 text-soft-gray/60",
  pending_approval: "bg-yellow-500/15 text-yellow-400",
  sent: "bg-vivid-teal/15 text-vivid-teal",
  approved_not_sent: "bg-violet/15 text-violet",
  rejected: "bg-red-500/15 text-red-400",
  failed: "bg-red-500/15 text-red-400",
};

export default async function TeacherUpdateHistoryPage({
  params,
}: {
  params: Promise<{ student_id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const { student_id } = await params;
  const supabase = getServiceClient();

  const { data: student } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", student_id)
    .single();

  const { data: updates } = await supabase
    .from("parent_updates")
    .select("*")
    .eq("student_user_id", student_id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <PageIntro tKey="teacher.parentsHistory" />
        <Link
          href="/teacher/parents"
          className="flex items-center gap-2 text-sm text-soft-gray/50 hover:text-soft-gray mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Parents
        </Link>
        <h1 className="text-xl font-bold mb-6">
          Update History &mdash;{" "}
          <span className="text-electric-blue">{student?.display_name ?? "Student"}</span>
        </h1>

        {!updates || updates.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-soft-gray/50">No updates sent yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-white/8 bg-white/3 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-soft-gray">{u.subject}</p>
                    <p className="text-xs text-soft-gray/40 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(u.created_at).toLocaleDateString()}
                      {u.update_type && (
                        <span className="ml-2 uppercase tracking-wider text-[10px]">
                          {u.update_type.replace(/_/g, " ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      STATUS_STYLES[u.sent_status] ?? STATUS_STYLES.draft
                    }`}
                  >
                    {u.sent_status?.replace(/_/g, " ") ?? "draft"}
                  </span>
                </div>
                {u.body && (
                  <p className="text-sm text-soft-gray/60 mt-3 line-clamp-2">{u.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
