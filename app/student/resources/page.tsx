import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import { ExternalLink } from "lucide-react";

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
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">Resources</h1>

        {!assets || assets.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center text-soft-gray/40 text-sm">
            No resources available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  {asset.lesson_number && (
                    <span className="text-xs font-mono text-soft-gray/40 w-8 flex-shrink-0">
                      L{asset.lesson_number}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-soft-gray">{asset.title}</p>
                    <p className="text-xs text-soft-gray/40 mt-0.5 capitalize">{asset.asset_type}</p>
                  </div>
                </div>
                {asset.url && (
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-electric-blue hover:underline flex-shrink-0"
                  >
                    Open <ExternalLink size={11} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
