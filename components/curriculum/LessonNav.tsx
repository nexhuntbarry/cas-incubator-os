'use client';

import Link from "next/link";

interface LessonNavProps {
  lessons: { id: string; lesson_number: number; title: string }[];
  currentId: string;
  baseHref: string; // e.g. "/admin/curriculum" or "/teacher/resources" or "/student/resources"
}

export default function LessonNav({ lessons, currentId, baseHref }: LessonNavProps) {
  return (
    <nav className="w-52 flex-shrink-0 no-print">
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-soft-gray/40">
        Lessons
      </p>
      <ul className="space-y-0.5">
        {lessons.map((lesson) => {
          const active = lesson.id === currentId;
          return (
            <li key={lesson.id}>
              <Link
                href={`${baseHref}/${lesson.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-electric-blue/15 text-electric-blue font-medium"
                    : "text-soft-gray/60 hover:text-soft-gray hover:bg-white/5"
                }`}
              >
                <span className="font-mono text-xs w-6 flex-shrink-0 text-right">
                  {lesson.lesson_number}
                </span>
                <span className="truncate text-xs leading-snug">
                  {lesson.title.replace(/^Lesson \d+:\s*/, "")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
