'use client';

interface AssignmentProgressBarProps {
  submitted: number;
  total: number;
  showLabel?: boolean;
}

export default function AssignmentProgressBar({ submitted, total, showLabel = true }: AssignmentProgressBarProps) {
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/8">
        <div
          className="h-1.5 rounded-full bg-electric-blue transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-soft-gray/50 tabular-nums whitespace-nowrap">
          {submitted}/{total}
        </span>
      )}
    </div>
  );
}
