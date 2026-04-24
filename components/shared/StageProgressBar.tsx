'use client';

interface Stage {
  stageNumber: number;
  name: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed' | string;
}

interface StageProgressBarProps {
  stages: Stage[];
  currentStage: number;
}

const statusColor: Record<string, string> = {
  not_started: 'bg-white/20',
  in_progress: 'bg-electric-blue',
  submitted: 'bg-vivid-teal',
  reviewed: 'bg-violet-500',
};

export default function StageProgressBar({ stages, currentStage }: StageProgressBarProps) {
  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center gap-0 min-w-max mx-auto px-2">
        {stages.map((stage, idx) => {
          const isCurrent = stage.stageNumber === currentStage;
          const color = statusColor[stage.status] ?? 'bg-white/20';
          return (
            <div key={stage.stageNumber} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${color} ${
                    isCurrent ? 'ring-2 ring-electric-blue ring-offset-2 ring-offset-deep-navy scale-110' : ''
                  }`}
                >
                  {stage.stageNumber}
                </div>
                <span className={`text-[10px] max-w-[56px] text-center leading-tight ${isCurrent ? 'text-soft-gray' : 'text-soft-gray/40'}`}>
                  {stage.name}
                </span>
              </div>
              {idx < stages.length - 1 && (
                <div className="w-8 h-px bg-white/15 mx-1 -mt-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
