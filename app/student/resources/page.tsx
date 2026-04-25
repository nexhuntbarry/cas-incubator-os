import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { ExternalLink } from "lucide-react";
import Shell from "@/components/student/Shell";

export default async function StudentResourcesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();
  const { data: assets } = await supabase
    .from("curriculum_assets")
    .select("id, title, asset_type, url, lesson_number, sort_order")
    .contains("visibility_scope", ["student"])
    .order("lesson_number", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true });

  return (
    <Shell title="Resources">
      <div className="max-w-3xl space-y-6">

        {!assets || assets.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center text-soft-gray/40 text-sm">
            No resources available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {asset.lesson_number && (
                    <span className="text-xs font-mono text-soft-gray/40 w-8 flex-shrink-0">
                      L{asset.lesson_number}
                    </span>
                  )}
                  <div className="min-w-0">
                    <Link
                      href={`/student/resources/${asset.id}`}
                      className="text-sm font-medium text-soft-gray hover:text-electric-blue transition-colors block truncate"
                    >
                      {asset.title}
                    </Link>
                    <p className="text-xs text-soft-gray/40 mt-0.5 capitalize">{asset.asset_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <Link
                    href={`/student/resources/${asset.id}`}
                    className="text-xs text-electric-blue hover:underline"
                  >
                    View
                  </Link>
                  {asset.url && (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-soft-gray/30 hover:text-soft-gray/60 transition-colors"
                      title="Open original document"
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
