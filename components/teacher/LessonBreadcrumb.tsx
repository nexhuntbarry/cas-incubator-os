"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, Layers, Info, X } from "lucide-react";
import { stageColors } from "@/lib/curriculum/checkpoint-helpers";

interface StageLessonRef {
  lesson_number: number;
  title: string;
}

interface LessonBreadcrumbProps {
  lessonNumber: number;
  stageNumber: number | null;
  stageName: string | null;
  stageDescription: string | null;
  /** Lesson numbers belonging to this stage. */
  stageLessons: StageLessonRef[];
  nextCheckpoint: {
    number: number;
    name: string;
    dueAfterLesson: number;
  } | null;
}

/**
 * Sticky breadcrumb shown above the 4 lesson sections. Surfaces:
 *   • lesson position (4 of 20)
 *   • clickable stage badge (opens popover with stage description + sibling lessons)
 *   • next-checkpoint summary with relative due-timing
 */
export default function LessonBreadcrumb({
  lessonNumber,
  stageNumber,
  stageName,
  stageDescription,
  stageLessons,
  nextCheckpoint,
}: LessonBreadcrumbProps) {
  const [stageOpen, setStageOpen] = useState(false);
  const sc = stageColors(stageNumber);

  const offset = nextCheckpoint ? nextCheckpoint.dueAfterLesson - lessonNumber : null;
  let cpTimingLabel = "";
  if (nextCheckpoint && offset !== null) {
    if (offset < 0) cpTimingLabel = `was due after Lesson ${nextCheckpoint.dueAfterLesson}`;
    else if (offset === 0) cpTimingLabel = "due after this lesson";
    else cpTimingLabel = `due after Lesson ${nextCheckpoint.dueAfterLesson} (in ${offset} lesson${offset === 1 ? "" : "s"})`;
  }
  const cpUrgent = offset !== null && offset >= 0 && offset <= 1;

  return (
    <div className="sticky top-0 z-20 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-deep-navy/85 backdrop-blur-md border-b border-white/8">
      <div className="flex items-center gap-2 md:gap-3 flex-wrap text-xs">
        {/* lesson position */}
        <span className="font-mono text-soft-gray/70">
          Lesson <span className="text-soft-gray font-semibold">{lessonNumber}</span>
          <span className="text-soft-gray/40"> of 20</span>
        </span>

        <span className="text-soft-gray/30">·</span>

        {/* stage badge — clickable */}
        {stageNumber ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setStageOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded font-semibold uppercase tracking-wider border ${sc.bg} ${sc.border} ${sc.text} hover:brightness-125 transition`}
              aria-expanded={stageOpen}
            >
              <Layers size={11} />
              Stage {stageNumber}{stageName ? ` · ${stageName}` : ""}
              <Info size={10} className="opacity-60" />
            </button>

            {stageOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setStageOpen(false)}
                  aria-hidden
                />
                <div className="absolute left-0 top-full mt-2 z-40 w-[min(92vw,360px)] rounded-xl border border-white/10 bg-deep-navy/95 backdrop-blur-md shadow-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className={`text-[10px] uppercase tracking-widest font-semibold ${sc.text}`}>Stage {stageNumber}</p>
                      <p className="text-sm font-bold text-soft-gray">{stageName ?? `Stage ${stageNumber}`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStageOpen(false)}
                      className="text-soft-gray/40 hover:text-soft-gray"
                      aria-label="Close"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {stageDescription && (
                    <p className="text-xs text-soft-gray/70 leading-relaxed mb-3">{stageDescription}</p>
                  )}
                  {stageLessons.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-soft-gray/40 mb-1.5">
                        Lessons in this stage
                      </p>
                      <ul className="space-y-1">
                        {stageLessons.map((l) => {
                          const isCurrent = l.lesson_number === lessonNumber;
                          const cleanTitle = l.title.replace(/^Lesson\s+\d+:\s*/i, "");
                          return (
                            <li key={l.lesson_number}>
                              <Link
                                href={`/teacher/teaching-mode/${l.lesson_number}`}
                                onClick={() => setStageOpen(false)}
                                className={`block rounded px-2 py-1.5 text-xs ${
                                  isCurrent
                                    ? `${sc.bg} ${sc.text} font-semibold`
                                    : "text-soft-gray/70 hover:bg-white/5 hover:text-soft-gray"
                                }`}
                              >
                                <span className="font-mono mr-2 opacity-70">L{l.lesson_number}</span>
                                {cleanTitle}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <span className="text-soft-gray/40">No stage</span>
        )}

        <span className="text-soft-gray/30">·</span>

        {/* next checkpoint */}
        {nextCheckpoint ? (
          <span
            className={`inline-flex items-center gap-1.5 ${cpUrgent ? "text-status-warning font-semibold" : "text-soft-gray/70"}`}
          >
            <Flag size={11} />
            Next checkpoint:&nbsp;
            <span className={cpUrgent ? "text-status-warning" : "text-soft-gray"}>
              {nextCheckpoint.name}
            </span>
            <span className="text-soft-gray/50 font-normal">({cpTimingLabel})</span>
          </span>
        ) : (
          <span className="text-soft-gray/40 inline-flex items-center gap-1.5">
            <Flag size={11} /> No upcoming checkpoint
          </span>
        )}
      </div>
    </div>
  );
}
