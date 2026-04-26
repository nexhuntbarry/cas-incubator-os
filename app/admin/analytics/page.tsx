import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import StatCard from "@/components/admin/StatCard";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import { Activity } from "lucide-react";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const sp = await searchParams;
  const range = sp.range ?? "30d";

  const supabase = getServiceClient();

  const since = range === "7d"
    ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    : range === "30d"
    ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalMentors },
    { count: activeCohorts },
    { data: projects },
    { count: openRisks },
    { count: showcasesReady },
    { data: recentActivity },
    { data: aiStats },
    { data: risksBySeverity },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "mentor"),
    supabase.from("cohorts").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("projects").select("current_stage, project_type_id, project_type_definitions(slug)"),
    supabase.from("risk_flags").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("showcase_records").select("*", { count: "exact", head: true }).eq("public_share_enabled", true),
    supabase
      .from("notifications")
      .select("type, created_at, payload")
      .order("created_at", { ascending: false })
      .limit(20),
    since
      ? supabase
          .from("ai_usage_log")
          .select("model, tokens_input, tokens_output")
          .gte("created_at", since)
      : supabase.from("ai_usage_log").select("model, tokens_input, tokens_output"),
    supabase
      .from("risk_flags")
      .select("severity")
      .eq("status", "open"),
  ]);

  // Aggregate stage distribution
  const stageDistribution: Record<number, number> = {};
  for (const p of projects ?? []) {
    const stage = p.current_stage ?? 1;
    stageDistribution[stage] = (stageDistribution[stage] ?? 0) + 1;
  }
  const stageData = Object.entries(stageDistribution)
    .map(([stage, count]) => ({ stage: `Stage ${stage}`, count }))
    .sort((a, b) => parseInt(a.stage.replace("Stage ", "")) - parseInt(b.stage.replace("Stage ", "")));

  // AI usage totals
  const aiTotals = (aiStats ?? []).reduce(
    (acc, row) => ({
      calls: acc.calls + 1,
      tokensIn: acc.tokensIn + (row.tokens_input ?? 0),
      tokensOut: acc.tokensOut + (row.tokens_output ?? 0),
    }),
    { calls: 0, tokensIn: 0, tokensOut: 0 }
  );

  // Risk by severity
  const riskCounts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const r of risksBySeverity ?? []) {
    const sev = r.severity ?? "medium";
    riskCounts[sev] = (riskCounts[sev] ?? 0) + 1;
  }

  const ranges = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "all", label: "All Time" },
  ];

  return (
    <Shell title="Analytics" introKey="admin.analytics">
      {/* Date range filter */}
      <div className="flex gap-2 mb-6">
        {ranges.map((r) => (
          <a
            key={r.value}
            href={`/admin/analytics?range=${r.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              range === r.value
                ? "bg-electric-blue/15 text-electric-blue"
                : "border border-white/10 text-soft-gray/60 hover:text-soft-gray hover:border-white/20"
            }`}
          >
            {r.label}
          </a>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Students" value={totalStudents ?? 0} color="blue" />
        <StatCard label="Teachers" value={totalTeachers ?? 0} color="teal" />
        <StatCard label="Mentors" value={totalMentors ?? 0} color="violet" />
        <StatCard label="Active Cohorts" value={activeCohorts ?? 0} color="gold" />
        <StatCard label="Open Risk Flags" value={openRisks ?? 0} color="blue" />
        <StatCard label="Public Showcases" value={showcasesReady ?? 0} color="teal" />
        <StatCard label="AI Calls" value={aiTotals.calls} color="violet" />
        <StatCard
          label="AI Tokens Used"
          value={`${((aiTotals.tokensIn + aiTotals.tokensOut) / 1000).toFixed(1)}k`}
          color="gold"
        />
      </div>

      {/* Risk counts by severity */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5 mb-6">
        <p className="text-xs text-soft-gray/50 uppercase tracking-wider mb-4">Open Risk Flags by Severity</p>
        <div className="flex gap-4">
          {[
            { key: "critical", label: "Critical", color: "text-red-400 bg-red-500/15" },
            { key: "high", label: "High", color: "text-orange-400 bg-orange-500/15" },
            { key: "medium", label: "Medium", color: "text-yellow-400 bg-yellow-500/15" },
            { key: "low", label: "Low", color: "text-green-400 bg-green-500/15" },
          ].map(({ key, label, color }) => (
            <div key={key} className={`flex-1 rounded-lg p-3 text-center ${color}`}>
              <p className="text-2xl font-bold">{riskCounts[key] ?? 0}</p>
              <p className="text-xs font-medium opacity-80 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts stageData={stageData} />

      {/* Recent activity feed */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={14} className="text-electric-blue" />
          <p className="text-xs text-soft-gray/50 uppercase tracking-wider">Recent Activity</p>
        </div>
        {!recentActivity || recentActivity.length === 0 ? (
          <p className="text-sm text-soft-gray/40">No recent notifications.</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((n, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-electric-blue/60 flex-shrink-0" />
                <p className="text-sm text-soft-gray/70 flex-1">
                  {n.type?.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-soft-gray/30 flex-shrink-0">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
