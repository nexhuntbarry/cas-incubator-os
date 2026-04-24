import Shell from "@/components/admin/Shell";

export default function AiUsageLoading() {
  return (
    <Shell title="AI Usage">
      <div className="space-y-6 animate-pulse">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="h-56 rounded-xl bg-white/5" />
        <div className="h-40 rounded-xl bg-white/5" />
      </div>
    </Shell>
  );
}
