"use client";

import { Globe, Code2, Play, Presentation, Brush, Image, ExternalLink } from "lucide-react";

export interface WorkLinks {
  live_product_url?: string | null;
  demo_video_url?: string | null;
  presentation_slide_url?: string | null;
  github_repo_url?: string | null;
  figma_or_design_url?: string | null;
  screenshot_gallery_urls?: string[] | null;
  // Legacy Phase 2 field names (used as fallback)
  github_url?: string | null;
  figma_url?: string | null;
  presentation_url?: string | null;
}

interface WorkLinksGridProps {
  links: WorkLinks;
  lastUpdatedAt?: string | null;
  lastUpdatedBy?: string | null;
}

interface CardDef {
  key: keyof WorkLinks | "screenshots";
  label: string;
  helperText: string;
  icon: React.ReactNode;
  resolveUrl: (links: WorkLinks) => string | null | undefined;
}

const CARDS: CardDef[] = [
  {
    key: "live_product_url",
    label: "Live Product",
    helperText: "Where can people use it?",
    icon: <Globe size={18} />,
    resolveUrl: (l) => l.live_product_url,
  },
  {
    key: "demo_video_url",
    label: "Demo Video",
    helperText: "YouTube, Loom, or any video link",
    icon: <Play size={18} />,
    resolveUrl: (l) => l.demo_video_url,
  },
  {
    key: "presentation_slide_url",
    label: "Presentation Slides",
    helperText: "Google Slides, Canva, etc.",
    icon: <Presentation size={18} />,
    resolveUrl: (l) => l.presentation_slide_url ?? l.presentation_url,
  },
  {
    key: "github_repo_url",
    label: "GitHub Repo",
    helperText: "Source code repository",
    icon: <Code2 size={18} />,
    resolveUrl: (l) => l.github_repo_url ?? l.github_url,
  },
  {
    key: "figma_or_design_url",
    label: "Design Mockup",
    helperText: "Figma or other design tool",
    icon: <Brush size={18} />,
    resolveUrl: (l) => l.figma_or_design_url ?? l.figma_url,
  },
  {
    key: "screenshots",
    label: "Screenshots",
    helperText: "Gallery of uploaded screenshots",
    icon: <Image size={18} />,
    resolveUrl: () => null, // handled specially
  },
];

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

export default function WorkLinksGrid({ links, lastUpdatedAt, lastUpdatedBy }: WorkLinksGridProps) {
  const screenshots = Array.isArray(links.screenshot_gallery_urls) ? links.screenshot_gallery_urls : [];

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Student&apos;s Submitted Work</h2>
        {lastUpdatedAt && (
          <p className="text-xs text-soft-gray/40">
            Last work update: {formatRelativeTime(lastUpdatedAt)}
            {lastUpdatedBy ? ` by ${lastUpdatedBy}` : ""}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CARDS.map((card) => {
          if (card.key === "screenshots") {
            const hasScreenshots = screenshots.length > 0;
            return (
              <div
                key="screenshots"
                className={`rounded-lg border p-3 space-y-2 transition-colors ${
                  hasScreenshots
                    ? "border-white/12 bg-white/4"
                    : "border-white/5 bg-white/2 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 text-soft-gray/60">
                  {card.icon}
                  <span className="text-xs font-medium">{card.label}</span>
                </div>
                {hasScreenshots ? (
                  <div className="flex flex-wrap gap-1">
                    {screenshots.slice(0, 3).map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                        {url.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
                            alt="screenshot"
                            className="w-10 h-10 object-cover rounded border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center rounded border border-white/10 bg-white/5">
                            <ExternalLink size={12} className="text-soft-gray/40" />
                          </div>
                        )}
                      </a>
                    ))}
                    {screenshots.length > 3 && (
                      <div className="w-10 h-10 flex items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] text-soft-gray/50">
                        +{screenshots.length - 3}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-soft-gray/30">Not submitted yet</p>
                )}
              </div>
            );
          }

          const url = card.resolveUrl(links);
          const hasUrl = Boolean(url);

          return (
            <div
              key={card.key}
              className={`rounded-lg border p-3 space-y-2 transition-colors ${
                hasUrl
                  ? "border-white/12 bg-white/4 hover:bg-white/6 cursor-pointer"
                  : "border-white/5 bg-white/2 opacity-50"
              }`}
            >
              {hasUrl ? (
                <a
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-soft-gray/70">
                    {card.icon}
                    <span className="text-xs font-medium">{card.label}</span>
                  </div>
                  <ExternalLink size={12} className="text-electric-blue flex-shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-2 text-soft-gray/40">
                  {card.icon}
                  <span className="text-xs font-medium">{card.label}</span>
                </div>
              )}
              <p className="text-[11px] text-soft-gray/30 leading-tight">
                {hasUrl ? (
                  <a
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-electric-blue/60 hover:text-electric-blue truncate block max-w-full"
                  >
                    Open link
                  </a>
                ) : (
                  "Not submitted yet"
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
