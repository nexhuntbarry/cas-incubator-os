interface CheckpointStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  not_started: { label: "Not Started", classes: "bg-white/5 text-soft-gray/40" },
  partial: { label: "Partial", classes: "bg-gold/15 text-gold" },
  submitted: { label: "Submitted", classes: "bg-electric-blue/15 text-electric-blue" },
  under_review: { label: "Under Review", classes: "bg-violet/15 text-violet" },
  revision_requested: { label: "Revision Needed", classes: "bg-status-warning/15 text-status-warning" },
  approved: { label: "Approved", classes: "bg-status-success/15 text-status-success" },
  locked: { label: "Locked", classes: "bg-white/5 text-soft-gray/30" },
  unlocked: { label: "Unlocked", classes: "bg-white/8 text-soft-gray/60" },
  rejected: { label: "Rejected", classes: "bg-status-error/15 text-status-error" },
};

export default function CheckpointStatusBadge({
  status,
  className = "",
}: CheckpointStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: "bg-white/5 text-soft-gray/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
