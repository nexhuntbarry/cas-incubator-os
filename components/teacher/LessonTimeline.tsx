"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, ListOrdered, ChevronDown } from "lucide-react";
import { lessonNumberToStage } from "@/lib/curriculum/lesson-to-stage";
import { CHECKPOINT_DUE_LESSONS, allCheckpointsMeta, stageColors } from "@/lib/curriculum/checkpoint-helpers";

interface LessonTimelineProps {
  currentLesson: number;
  /** Optional title lookup so dot tooltips show meaningful labels. */
  lessonTitles?: Record<number, string>;
}

const TOTAL_LESSONS = 20;
const CHECKPOINTS = allCheckpointsMeta();

/**
 * Vertical timeline that visually unifies the 20 lessons, the 7 checkpoints,
 * and the 10 method stages. Sticky on desktop, collapsible on mobile.
 */
export default function LessonTimeline({ currentLesson, lessonTitles = {} }: LessonTimelineProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const cpByLesson = new Map<number, { number: number; name: string }>();
  for (const cp of CHECKPOINTS) {
    cpByLesson.set(cp.dueAfterLesson, { number: cp.number, name: cp.name });
  }

  const lessons = Array.from({ length: TOTAL_LESSONS }, (_, i) => i + 1);

  const TimelineCore = (
    <ol className="relative space-y-1">
      {lessons.map((n) => {
        const stage = lessonNumberToStage(n);
        const sc = stageColors(stage);
        const isCurrent = n === currentLesson;
        const cp = cpByLesson.get(n);
        const title = lessonTitles[n]?.replace(/^Lesson\s+\d+:\s*/i, "") ?? `Lesson ${n}`;

        return (
          <li key={n} className="relative">
            <Link
              href={`/teacher/teaching-mode/${n}`}
              className={`group flex items-center gap-2 rounded-md pl-2 pr-2 py-1.5 transition ${
                isCurrent ? `${sc.bg} ${sc.text}` : "hover:bg-white/5 text-soft-gray/70"
              }`}
            >
              {/* stage colored zone bar (3px) */}
              <span
                aria-hidden
                className={`flex-shrink-0 w-[3px] h-5 rounded-sm ${sc.dot}`}
              />
              {/* dot */}
              <span
                aria-hidden
                className={`flex-shrink-0 w-2 h-2 rounded-full ${
                  isCurrent ? `${sc.dot} ring-2 ring-offset-1 ring-offset-deep-navy ring-current` : "bg-white/20 group-hover:bg-white/40"
                }`}
              />
              <span className={`text-[11px] font-mono w-7 ${isCurrent ? "font-bold" : "text-soft-gray/50"}`}>
                L{n}
              </span>
              <span className="text-[11px] flex-1 truncate" title={title}>
                {title}
              </span>
              {cp && (
                <span
                  className="flex-shrink-0 text-status-warning"
                  title={`Checkpoint ${cp.number}: ${cp.name}`}
                  aria-label={`Checkpoint ${cp.number}: ${cp.name}`}
                >
                  <Flag size={11} />
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* Desktop: sticky right rail */}
      <aside className="hidden xl:block sticky top-20 self-start w-60 flex-shrink-0">
        <div className="rounded-xl border border-white/8 bg-white/3 p-3">
          <div className="flex items-center gap-2 px-2 mb-2">
            <ListOrdered size={12} className="text-soft-gray/50" />
            <p className="text-[10px] uppercase tracking-widest font-semibold text-soft-gray/50">
              Course timeline
            </p>
          </div>
          {TimelineCore}
          <div className="mt-3 pt-3 border-t border-white/5 px-2">
            <p className="text-[10px] text-soft-gray/40 leading-relaxed flex items-center gap-1.5">
              <Flag size={9} className="text-status-warning" />
              <span>{CHECKPOINT_DUE_LESSONS.length} checkpoints across {TOTAL_LESSONS} lessons</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile: collapsible */}
      <div className="xl:hidden rounded-xl border border-white/8 bg-white/3">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-soft-gray/70"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <ListOrdered size={14} className="text-soft-gray/50" />
            Course timeline · Lesson {currentLesson} of {TOTAL_LESSONS}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileOpen && <div className="px-3 pb-3">{TimelineCore}</div>}
      </div>
    </>
  );
}
