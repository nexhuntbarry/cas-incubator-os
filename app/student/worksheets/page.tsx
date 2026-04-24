import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  if (status === "submitted" || status === "reviewed") {
    return <CheckCircle size={14} className="text-status-success" />;
  }
  if (status === "revision_requested") {
    return <AlertCircle size={14} className="text-status-warning" />;
  }
  if (status === "in_progress") {
    return <Clock size={14} className="text-electric-blue" />;
  }
  return <FileText size={14} className="text-soft-gray/40" />;
}

export default async function StudentWorksheetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  // Get all active worksheet templates
  const { data: templates } = await supabase
    .from("worksheet_templates")
    .select("id, title, description, required_status, template_type")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  // Get student's submissions
  const { data: submissions } = await supabase
    .from("worksheet_submissions")
    .select("id, template_id, status, submitted_at, version_number, feedback")
    .eq("student_user_id", user.userId);

  const submissionMap = new Map(
    (submissions ?? []).map((s) => [s.template_id, s])
  );

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Worksheets</h1>
          <p className="text-sm text-soft-gray/50 mt-1">Complete your assigned worksheets below.</p>
        </div>

        {!templates || templates.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center text-soft-gray/40 text-sm">
            No worksheets assigned yet.
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => {
              const submission = submissionMap.get(template.id);
              const status = submission?.status ?? "not_started";

              return (
                <Link
                  key={template.id}
                  href={`/student/worksheets/${template.id}`}
                  className="block rounded-xl border border-white/8 bg-white/3 p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={status} />
                        <p className="font-semibold text-soft-gray truncate">{template.title}</p>
                        {template.required_status === "required" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-status-error/15 text-status-error font-medium uppercase">
                            Required
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-soft-gray/50 mt-1 truncate">{template.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === "submitted" || status === "reviewed"
                            ? "bg-status-success/15 text-status-success"
                            : status === "revision_requested"
                            ? "bg-status-warning/15 text-status-warning"
                            : status === "in_progress"
                            ? "bg-electric-blue/15 text-electric-blue"
                            : "bg-white/5 text-soft-gray/40"
                        }`}
                      >
                        {status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  {submission?.feedback && (
                    <div className="mt-3 p-2 rounded-lg bg-vivid-teal/10 border border-vivid-teal/20">
                      <p className="text-xs text-vivid-teal font-medium">Feedback available</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
