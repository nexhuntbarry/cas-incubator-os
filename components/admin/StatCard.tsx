interface StatCardProps {
  label: string;
  value: number | string;
  color?: "blue" | "teal" | "violet" | "gold";
}

const COLOR_MAP = {
  blue: "text-electric-blue",
  teal: "text-vivid-teal",
  violet: "text-violet",
  gold: "text-incubator-gold",
};

export default function StatCard({ label, value, color = "blue" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5">
      <p className="text-xs text-soft-gray/50 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${COLOR_MAP[color]}`}>{value}</p>
    </div>
  );
}
