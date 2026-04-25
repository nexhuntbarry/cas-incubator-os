'use client';

import { useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight, Printer, ExternalLink } from "lucide-react";
import PhaseBadge from "./PhaseBadge";
import LessonNav from "./LessonNav";

interface LessonViewerProps {
  asset: {
    id: string;
    title: string;
    lesson_number: number | null;
    url: string | null;
    content_md: string | null;
  };
  allLessons: { id: string; lesson_number: number; title: string }[];
  baseHref: string;
}

const PHASE_NAMES: Record<number, { num: number; label: string }> = {
  1: { num: 1, label: "Discover and Define" },
  2: { num: 1, label: "Discover and Define" },
  3: { num: 1, label: "Discover and Define" },
  4: { num: 1, label: "Discover and Define" },
  5: { num: 2, label: "Research and Scope" },
  6: { num: 2, label: "Research and Scope" },
  7: { num: 2, label: "Research and Scope" },
  8: { num: 2, label: "Research and Scope" },
  9: { num: 3, label: "Plan and Prototype" },
  10: { num: 3, label: "Plan and Prototype" },
  11: { num: 3, label: "Plan and Prototype" },
  12: { num: 3, label: "Plan and Prototype" },
  13: { num: 4, label: "Improve and Strengthen" },
  14: { num: 4, label: "Improve and Strengthen" },
  15: { num: 4, label: "Improve and Strengthen" },
  16: { num: 4, label: "Improve and Strengthen" },
  17: { num: 5, label: "Finalize and Present" },
  18: { num: 5, label: "Finalize and Present" },
  19: { num: 5, label: "Finalize and Present" },
  20: { num: 5, label: "Finalize and Present" },
};

export default function LessonViewer({ asset, allLessons, baseHref }: LessonViewerProps) {
  const lessonNum = asset.lesson_number ?? 0;
  const sortedLessons = [...allLessons].sort((a, b) => a.lesson_number - b.lesson_number);
  const currentIndex = sortedLessons.findIndex((l) => l.id === asset.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;
  const phase = PHASE_NAMES[lessonNum];

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex gap-6 min-h-0">
      {/* Sidebar lesson nav */}
      <LessonNav lessons={sortedLessons} currentId={asset.id} baseHref={baseHref} />

      {/* Main content */}
      <div className="flex-1 min-w-0 print-area">
        {/* Header */}
        <div className="mb-6 no-print">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs text-soft-gray/40 bg-white/5 px-2 py-1 rounded">
                Lesson {lessonNum} of {sortedLessons.length}
              </span>
              {phase && <PhaseBadge phase={phase.num} label={phase.label} />}
            </div>
            <div className="flex items-center gap-2">
              {asset.url && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-soft-gray/50 hover:text-soft-gray border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={12} />
                  Open original
                </a>
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 text-xs text-soft-gray/70 hover:text-soft-gray border border-white/10 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              >
                <Printer size={12} />
                Print / Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Markdown content */}
        <div className="prose-lesson rounded-xl border border-white/8 bg-white/2 px-6 py-8 md:px-10">
          {asset.content_md ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-electric-blue mb-2 mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-status-success mt-8 mb-3 pb-1 border-b border-white/8">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium text-violet-300 mt-5 mb-2">{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-electric-blue pl-4 italic text-soft-gray/60 my-4">{children}</blockquote>
                ),
                p: ({ children }) => (
                  <p className="text-soft-gray/80 leading-relaxed mb-3">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-4 text-soft-gray/80">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-4 text-soft-gray/80">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed pl-1">{children}</li>
                ),
                code: ({ children }) => (
                  <code className="bg-deep-navy/50 px-1.5 py-0.5 rounded text-xs font-mono text-vivid-teal">{children}</code>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-electric-blue underline hover:text-electric-blue/80" target="_blank" rel="noopener noreferrer">{children}</a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border-collapse border border-white/10">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-white/10 px-3 py-2 text-left text-xs font-semibold text-soft-gray/60 bg-white/5">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-white/10 px-3 py-2 text-soft-gray/80">{children}</td>
                ),
              }}
            >
              {asset.content_md}
            </ReactMarkdown>
          ) : (
            <div className="text-soft-gray/40 text-sm text-center py-12">
              <p className="mb-3">No lesson content available yet.</p>
              {asset.url && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-electric-blue hover:underline text-xs"
                >
                  Open original document
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sticky bottom nav */}
        <div className="mt-6 flex items-center justify-between no-print">
          <div>
            {prevLesson ? (
              <Link
                href={`${baseHref}/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm text-soft-gray/60 hover:text-soft-gray transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">
                  Lesson {prevLesson.lesson_number}
                </span>
                <span className="sm:hidden">Prev</span>
              </Link>
            ) : (
              <span className="text-soft-gray/20 text-sm flex items-center gap-1">
                <ChevronLeft size={16} />
              </span>
            )}
          </div>
          <span className="text-xs text-soft-gray/30 font-mono">
            {currentIndex + 1} / {sortedLessons.length}
          </span>
          <div>
            {nextLesson ? (
              <Link
                href={`${baseHref}/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm text-soft-gray/60 hover:text-soft-gray transition-colors"
              >
                <span className="hidden sm:inline">
                  Lesson {nextLesson.lesson_number}
                </span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <span className="text-soft-gray/20 text-sm flex items-center gap-1">
                <ChevronRight size={16} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
