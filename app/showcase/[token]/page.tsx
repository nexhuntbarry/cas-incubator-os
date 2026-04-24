import { notFound } from "next/navigation";
import { getAnonClient } from "@/lib/supabase";
import type { Metadata } from "next";
import { ExternalLink, GitBranch, Play, Monitor } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = getAnonClient();

  const { data } = await supabase
    .from("showcase_records")
    .select("title, description")
    .eq("public_share_token", token)
    .eq("public_share_enabled", true)
    .maybeSingle();

  if (!data) return { title: "Showcase Not Found" };

  return {
    title: `${data.title} | CAS Incubator OS Showcase`,
    description: data.description?.slice(0, 160) ?? "A student project from CAS Incubator OS",
    openGraph: {
      title: data.title,
      description: data.description?.slice(0, 160) ?? "",
      type: "website",
      siteName: "CAS Incubator OS",
    },
    twitter: {
      card: "summary",
      title: data.title,
      description: data.description?.slice(0, 160) ?? "",
    },
  };
}

function getVideoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id =
        u.searchParams.get("v") ??
        (u.hostname === "youtu.be" ? u.pathname.slice(1) : null);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // ignore
  }
  return null;
}

export default async function PublicShowcasePage({ params }: Props) {
  const { token } = await params;
  const supabase = getAnonClient();

  const { data: showcase } = await supabase
    .from("showcase_records")
    .select(
      "*, project:projects!showcase_records_project_id_fkey(title, tagline)"
    )
    .eq("public_share_token", token)
    .eq("public_share_enabled", true)
    .maybeSingle();

  if (!showcase) notFound();

  const screenshots = Array.isArray(showcase.screenshots_json)
    ? (showcase.screenshots_json as string[])
    : [];

  const videoEmbed = showcase.video_url ? getVideoEmbed(showcase.video_url) : null;

  const links = [
    { href: showcase.demo_url, label: "Live Demo", icon: Monitor },
    { href: showcase.presentation_link, label: "Slides", icon: ExternalLink },
    { href: showcase.repo_link, label: "Repository", icon: GitBranch },
    { href: showcase.video_url && !videoEmbed ? showcase.video_url : null, label: "Video", icon: Play },
  ].filter((l) => l.href);

  return (
    <div className="min-h-screen bg-[#080D1A] text-[#E2E8F0]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/10 via-transparent to-[#00C9B1]/8 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#4D9EFF] font-semibold mb-6">
            CAS Incubator OS &mdash; Student Showcase
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            {showcase.title}
          </h1>
          {(showcase.project as { tagline?: string } | null)?.tagline && (
            <p className="text-lg text-[#CBD5E0]/70 mt-2">
              {(showcase.project as { tagline: string }).tagline}
            </p>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {links.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/8 border border-white/10 text-sm font-medium text-[#E2E8F0] hover:bg-white/12 hover:border-white/20 transition-all"
                >
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        {/* Description */}
        {showcase.description && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#4D9EFF] font-semibold mb-5">
              The Story
            </h2>
            <div className="text-[#CBD5E0] leading-relaxed text-[16px] whitespace-pre-wrap">
              {showcase.description}
            </div>
          </section>
        )}

        {/* Video embed */}
        {videoEmbed && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#4D9EFF] font-semibold mb-5">
              Demo Video
            </h2>
            <div className="relative rounded-2xl overflow-hidden border border-white/8 aspect-video">
              <iframe
                src={videoEmbed}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${showcase.title} demo video`}
              />
            </div>
          </section>
        )}

        {/* Screenshots */}
        {screenshots.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#4D9EFF] font-semibold mb-5">
              Screenshots
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {screenshots.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1}`}
                    className="w-full rounded-xl border border-white/8 hover:border-white/20 transition-colors object-cover"
                  />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/6 py-10 text-center">
        <p className="text-xs text-[#E2E8F0]/20">
          Made with{" "}
          <a
            href="https://incubator.nexhunt.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4D9EFF]/50 hover:text-[#4D9EFF] transition-colors"
          >
            CAS Incubator OS
          </a>{" "}
          &mdash; Build Ideas. Shape Projects. Launch Impact.
        </p>
      </footer>
    </div>
  );
}
