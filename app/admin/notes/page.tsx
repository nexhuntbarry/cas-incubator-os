import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import { formatDateShort } from "@/lib/dates";

export default async function AdminNotesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();
  const { data: notes } = await supabase
    .from("mentor_notes")
    .select("id, note_type, note_body, content, escalation_flag, created_at, session_date, student_user_id, mentor_user_id, users!student_user_id(display_name), projects(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <Shell title="Mentor Notes — All Cohorts">
      <div className="space-y-3">
        {!notes || notes.length === 0 ? (
          <p className="text-soft-gray/40 text-sm">No notes yet.</p>
        ) : (
          notes.map((note) => {
            const body = note.note_body ?? note.content ?? "";
            const studentName =
              Array.isArray(note.users)
                ? (note.users[0] as { display_name: string } | undefined)?.display_name ?? "—"
                : (note.users as { display_name: string } | null)?.display_name ?? "—";
            const projectTitle =
              Array.isArray(note.projects)
                ? (note.projects[0] as { title: string } | undefined)?.title ?? "—"
                : (note.projects as { title: string } | null)?.title ?? "—";

            return (
              <div
                key={note.id}
                className={`rounded-xl border p-4 space-y-1 ${
                  note.escalation_flag
                    ? "border-status-error/30 bg-status-error/5"
                    : "border-white/8 bg-white/3"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-soft-gray/50 uppercase tracking-wider">
                      {note.note_type ?? "check_in"}
                    </span>
                    {note.escalation_flag && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-status-error/20 text-status-error uppercase tracking-wider">
                        Escalated
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-soft-gray/30">
                    {note.session_date ?? formatDateShort(note.created_at)}
                  </span>
                </div>
                <p className="text-sm text-soft-gray font-medium">
                  {studentName} · <span className="text-soft-gray/50">{projectTitle}</span>
                </p>
                <p className="text-sm text-soft-gray/70">{body.slice(0, 200)}{body.length > 200 ? "…" : ""}</p>
              </div>
            );
          })
        )}
      </div>
    </Shell>
  );
}
