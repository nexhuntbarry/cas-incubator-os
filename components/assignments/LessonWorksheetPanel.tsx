'use client';

import { useState } from "react";
import { BookOpen, Plus, Clock } from "lucide-react";
import AssignWorksheetModal from "./AssignWorksheetModal";

interface WorksheetTemplate {
  id: string;
  title: string;
  template_type: string;
}

interface RecentAssignment {
  id: string;
  due_date: string;
  status: string;
  cohorts: { name: string } | null;
}

interface LessonWorksheetPanelProps {
  lessonNumber: number | null;
  templates: WorksheetTemplate[];
  recentByTemplate: Record<string, RecentAssignment[]>;
}

export default function LessonWorksheetPanel({
  lessonNumber,
  templates,
  recentByTemplate,
}: LessonWorksheetPanelProps) {
  const [activeModal, setActiveModal] = useState<{ id: string; title: string } | null>(null);
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});

  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/2 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-electric-blue" />
          <h3 className="text-sm font-semibold text-soft-gray">Worksheets</h3>
        </div>
        <p className="text-xs text-soft-gray/40">No worksheets linked to this lesson.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen size={14} className="text-electric-blue" />
        <h3 className="text-sm font-semibold text-soft-gray">
          Worksheets{lessonNumber ? ` for Lesson ${lessonNumber}` : ""}
        </h3>
      </div>

      <div className="space-y-2">
        {templates.map((template) => {
          const recent = recentByTemplate[template.id] ?? [];
          const assigned = successMap[template.id];

          return (
            <div key={template.id} className="rounded-lg border border-white/8 bg-white/2 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-soft-gray truncate">{template.title}</p>
                  <p className="text-[11px] text-soft-gray/40 capitalize">{template.template_type}</p>
                </div>
                <button
                  onClick={() => setActiveModal({ id: template.id, title: template.title })}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-electric-blue/15 text-electric-blue text-xs font-medium hover:bg-electric-blue/25 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <Plus size={11} />
                  {assigned ? "Assign again" : "Assign"}
                </button>
              </div>

              {recent.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-white/5">
                  <p className="text-[10px] text-soft-gray/30 uppercase tracking-wider">Recent assignments</p>
                  {recent.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-soft-gray/50 truncate">
                        {a.cohorts?.name ?? "Specific students"}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Clock size={10} className="text-soft-gray/30" />
                        <span className="text-soft-gray/40 tabular-nums">
                          {new Date(a.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            a.status === "open"
                              ? "bg-status-success/15 text-status-success"
                              : a.status === "closed"
                              ? "bg-white/8 text-soft-gray/40"
                              : "bg-white/5 text-soft-gray/30"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeModal && (
        <AssignWorksheetModal
          templateId={activeModal.id}
          templateTitle={activeModal.title}
          lessonNumber={lessonNumber}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setSuccessMap((prev) => ({ ...prev, [activeModal.id]: true }));
            setActiveModal(null);
          }}
        />
      )}
    </div>
  );
}
