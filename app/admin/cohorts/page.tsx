import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import { Plus } from "lucide-react";
import { formatDateShort } from "@/lib/dates";

export default async function AdminCohortsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const supabase = getServiceClient();

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, name, start_date, end_date, max_students, is_active, programs(name)")
    .order("created_at", { ascending: false });

  return (
    <Shell title="Cohorts">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link
            href="/admin/cohorts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue/90 transition-colors"
          >
            <Plus size={14} />
            New Cohort
          </Link>
        </div>

        {!cohorts || cohorts.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center space-y-3">
            <p className="text-soft-gray/50 text-sm">No cohorts yet.</p>
            <Link
              href="/admin/cohorts/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-blue/10 text-electric-blue text-sm font-medium hover:bg-electric-blue/20 transition-colors"
            >
              <Plus size={14} />
              Create your first cohort
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-soft-gray/50 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Program</th>
                  <th className="text-left px-5 py-3">Start</th>
                  <th className="text-left px-5 py-3">End</th>
                  <th className="text-left px-5 py-3">Max Students</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => {
                  const program = c.programs as unknown as { name: string } | null;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium">{c.name}</td>
                      <td className="px-5 py-3 text-soft-gray/60 text-xs">
                        {program?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-soft-gray/60 text-xs">
                        {c.start_date ? formatDateShort(c.start_date) : "—"}
                      </td>
                      <td className="px-5 py-3 text-soft-gray/60 text-xs">
                        {c.end_date ? formatDateShort(c.end_date) : "—"}
                      </td>
                      <td className="px-5 py-3 text-soft-gray/60 text-xs">
                        {c.max_students ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.is_active
                              ? "bg-status-success/15 text-status-success"
                              : "bg-white/5 text-soft-gray/40"
                          }`}
                        >
                          {c.is_active ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/cohorts/${c.id}`}
                          className="text-electric-blue hover:underline text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
