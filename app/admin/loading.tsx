export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-deep-navy text-soft-gray">
      {/* Sidebar skeleton */}
      <div className="w-56 flex-shrink-0 border-r border-white/8 bg-white/2 animate-pulse" />
      {/* Main skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-white/8 bg-white/2 animate-pulse" />
        <div className="flex-1 px-8 py-6 space-y-4">
          <div className="h-6 w-48 rounded-lg bg-white/5 animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
