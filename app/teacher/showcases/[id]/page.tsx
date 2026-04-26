import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import ShowcaseFeedbackForm from "@/components/shared/ShowcaseFeedbackForm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageIntro from "@/components/shared/PageIntro";

export default async function TeacherShowcaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: showcase } = await supabase
    .from("showcase_records")
    .select("*, student:users!showcase_records_student_user_id_fkey(display_name)")
    .eq("id", id)
    .single();

  if (!showcase) redirect("/teacher/showcases");

  const student = showcase.student as { display_name: string } | null;
  const feedback = Array.isArray(showcase.feedback_received_json) ? showcase.feedback_received_json : [];

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
        <PageIntro tKey="teacher.showcaseDetail" />
        <Link
          href="/teacher/showcases"
          className="flex items-center gap-2 text-sm text-soft-gray/50 hover:text-soft-gray mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Showcases
        </Link>

        <h1 className="text-2xl font-bold mb-1">{showcase.title}</h1>
        <p className="text-soft-gray/50 text-sm mb-6">
          By {student?.display_name ?? "Unknown"} &middot;{" "}
          {new Date(showcase.created_at).toLocaleDateString()}
        </p>

        {showcase.description && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 mb-5">
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-soft-gray/80 leading-relaxed whitespace-pre-wrap">
              {showcase.description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { href: showcase.demo_url, label: "Demo" },
            { href: showcase.presentation_link, label: "Slides" },
            { href: showcase.repo_link, label: "Repo" },
            { href: showcase.video_url, label: "Video" },
          ]
            .filter((l) => l.href)
            .map(({ href, label }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-soft-gray/60 text-xs hover:text-soft-gray hover:border-white/20 transition-colors"
              >
                <ExternalLink size={11} />
                {label}
              </a>
            ))}
        </div>

        {feedback.length > 0 && (
          <div className="mb-6 space-y-3">
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider">Feedback Given</p>
            {(feedback as Array<{ reviewer_name: string; feedback: string; created_at: string }>).map(
              (f, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="text-xs text-soft-gray/50 mb-1">
                    {f.reviewer_name} &middot; {new Date(f.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-soft-gray/80">{f.feedback}</p>
                </div>
              )
            )}
          </div>
        )}

        <ShowcaseFeedbackForm showcaseId={id} backHref="/teacher/showcases" />
      </div>
    </div>
  );
}
