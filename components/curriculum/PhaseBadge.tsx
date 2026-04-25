'use client';

const PHASE_COLORS: Record<number, string> = {
  1: "bg-electric-blue/20 text-electric-blue border-electric-blue/30",
  2: "bg-vivid-teal/20 text-vivid-teal border-vivid-teal/30",
  3: "bg-violet/20 text-violet border-violet/30",
  4: "bg-incubator-gold/20 text-incubator-gold border-incubator-gold/30",
  5: "bg-status-success/20 text-status-success border-status-success/30",
};

interface PhaseBadgeProps {
  phase: number;
  label: string;
}

export default function PhaseBadge({ phase, label }: PhaseBadgeProps) {
  const colors = PHASE_COLORS[phase] ?? "bg-white/10 text-soft-gray/60 border-white/10";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors}`}>
      <span className="font-mono">P{phase}</span>
      <span>{label}</span>
    </span>
  );
}
