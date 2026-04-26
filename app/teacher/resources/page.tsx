import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import { ExternalLink } from "lucide-react";

export default async function TeacherResourcesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) redirect("/");

  const supabase = getServiceClient();
  const { data: assets } = await supabase
    .from("curriculum_assets")
    .select("id, title, asset_type, url, lesson_number, sort_order")
    .contains("visibility_scope", ["teacher"])
    .order("lesson_number", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true });

  return (
    <Shell title="Resources" introKey="teacher.resources">
      <div className="space-y-3">
        {!assets || assets.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center text-soft-gray/40 text-sm">
            No resources available yet.
          </div>
        ) : (
          assets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4">
              <div className="flex items-center gap-3">
                {asset.lesson_number && (
                  <span className="text-xs font-mono text-soft-gray/40 w-8">L{asset.lesson_number}</span>
                )}
                <div>
                  <Link
                    href={`/teacher/resources/${asset.id}`}
                    className="text-sm font-medium text-soft-gray hover:text-electric-blue transition-colors"
                  >
                    {asset.title}
                  </Link>
                  <p className="text-xs text-soft-gray/40 mt-0.5">{asset.asset_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href={`/teacher/resources/${asset.id}`}
                  className="text-xs text-electric-blue hover:underline"
                >
                  View
                </Link>
                {asset.url && (
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-soft-gray/40 hover:text-soft-gray/70 transition-colors"
                    title="Open original document"
                  >
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Shell>
  );
}
