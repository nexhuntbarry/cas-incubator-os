import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import ShowcaseFeedbackForm from "@/components/shared/ShowcaseFeedbackForm";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function AdminShowcaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: showcase } = await supabase
    .from("showcase_records")
    .select("*, student:users!showcase_records_student_user_id_fkey(display_name, email)")
    .eq("id", id)
    .single();

  if (!showcase) redirect("/admin/showcases");

  const student = showcase.student as { display_name: string; email: string } | null;
  const feedback = Array.isArray(showcase.feedback_received_json) ? showcase.feedback_received_json : [];

  return (
    <Shell title="Showcase Detail" introKey="admin.showcaseDetail">
      <div className="max-w-2xl">
        <Link
          href="/admin/showcases"
          className="flex items-center gap-2 text-sm text-soft-gray/50 hover:text-soft-gray mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Showcases
        </Link>

        <div className="rounded-xl border border-white/8 bg-white/3 p-6 mb-5 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-soft-gray">{showcase.title}</h2>
            <p className="text-xs text-soft-gray/50 mt-1">
              {student?.display_name} &middot; {student?.email} &middot;{" "}
              {new Date(showcase.created_at).toLocaleDateString()}
            </p>
          </div>

          {showcase.description && (
            <p className="text-sm text-soft-gray/80 leading-relaxed whitespace-pre-wrap">
              {showcase.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { href: showcase.demo_url, label: "Demo" },
              { href: showcase.presentation_link, label: "Slides" },
              { href: showcase.repo_link, label: "Repo" },
              { href: showcase.video_url, label: "Video" },
              {
                href: showcase.public_share_enabled && showcase.public_share_token
                  ? `/showcase/${showcase.public_share_token}`
                  : null,
                label: "Public Page",
              },
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
        </div>

        {feedback.length > 0 && (
          <div className="mb-6 space-y-3">
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider">Feedback Received</p>
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

        <ShowcaseFeedbackForm showcaseId={id} backHref="/admin/showcases" />
      </div>
    </Shell>
  );
}
