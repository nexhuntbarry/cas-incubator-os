import Shell from "@/components/admin/Shell";

export default function AnalyticsLoading() {
  return (
    <Shell title="Analytics">
      <div className="space-y-6 animate-pulse">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-white/5" />
      </div>
    </Shell>
  );
}
