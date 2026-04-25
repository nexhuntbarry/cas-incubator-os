import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/mentor/Shell";
import { formatDateShort } from "@/lib/dates";

export default async function MentorNotesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "mentor" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();
  const { data: notes } = await supabase
    .from("mentor_notes")
    .select("id, note_type, note_body, content, escalation_flag, session_date, created_at, student_user_id, users!student_user_id(display_name), projects(title)")
    .eq("mentor_user_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <Shell title="My Notes">
      <div className="space-y-3">
        {!notes || notes.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center text-soft-gray/40 text-sm">
            No notes yet. Leave notes during worksheet and checkpoint reviews.
          </div>
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
                      {(note.note_type ?? "check_in").replace(/_/g, " ")}
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
                  {studentName}{projectTitle !== "—" && ` · `}
                  {projectTitle !== "—" && <span className="text-soft-gray/50">{projectTitle}</span>}
                </p>
                <p className="text-sm text-soft-gray/70">
                  {typeof body === "string" ? body.slice(0, 300) : ""}
                  {typeof body === "string" && body.length > 300 ? "…" : ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    </Shell>
  );
}
