import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import AiUsageDashboard from "./AiUsageDashboard";
import { formatDateShort } from "@/lib/dates";

export default async function AiUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/");

  const sp = await searchParams;
  const range = sp.range ?? "30d";

  const since =
    range === "7d"
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      : range === "30d"
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      : range === "90d"
      ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const supabase = getServiceClient();

  const [{ data: periodRows }, { data: allTimeRows }] = await Promise.all([
    since
      ? supabase
          .from("ai_usage_log")
          .select("model, tokens_input, tokens_output, route, user_id, created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: true })
      : supabase
          .from("ai_usage_log")
          .select("model, tokens_input, tokens_output, route, user_id, created_at")
          .order("created_at", { ascending: true }),
    supabase
      .from("ai_usage_log")
      .select("model, tokens_input, tokens_output"),
  ]);

  // All-time totals
  const allTimeTotals = (allTimeRows ?? []).reduce(
    (acc, row) => ({
      calls: acc.calls + 1,
      tokensIn: acc.tokensIn + (row.tokens_input ?? 0),
      tokensOut: acc.tokensOut + (row.tokens_output ?? 0),
    }),
    { calls: 0, tokensIn: 0, tokensOut: 0 }
  );

  // Period totals
  const periodTotals = (periodRows ?? []).reduce(
    (acc, row) => ({
      calls: acc.calls + 1,
      tokensIn: acc.tokensIn + (row.tokens_input ?? 0),
      tokensOut: acc.tokensOut + (row.tokens_output ?? 0),
    }),
    { calls: 0, tokensIn: 0, tokensOut: 0 }
  );

  type AiRow = { model: string | null; tokens_input: number | null; tokens_output: number | null };

  // Cost estimate (Sonnet 4.6: $3/M in, $15/M out; Haiku 4.5: $0.8/M in, $4/M out)
  function estimateCost(rows: AiRow[] | null) {
    return (rows ?? []).reduce((acc, row) => {
      const isHaiku = (row.model ?? "").includes("haiku");
      const inRate = isHaiku ? 0.8 : 3;
      const outRate = isHaiku ? 4 : 15;
      return (
        acc +
        ((row.tokens_input ?? 0) / 1_000_000) * inRate +
        ((row.tokens_output ?? 0) / 1_000_000) * outRate
      );
    }, 0);
  }

  const periodCost = estimateCost(periodRows);
  const allTimeCost = estimateCost(allTimeRows);

  // Calls per route
  const routeCounts: Record<string, { calls: number; tokensIn: number; tokensOut: number }> = {};
  for (const row of periodRows ?? []) {
    const r = row.route ?? "unknown";
    if (!routeCounts[r]) routeCounts[r] = { calls: 0, tokensIn: 0, tokensOut: 0 };
    routeCounts[r].calls++;
    routeCounts[r].tokensIn += row.tokens_input ?? 0;
    routeCounts[r].tokensOut += row.tokens_output ?? 0;
  }
  const routeData = Object.entries(routeCounts)
    .map(([route, stats]) => ({ route, ...stats }))
    .sort((a, b) => b.calls - a.calls);

  // Top users by calls
  const userCounts: Record<string, number> = {};
  for (const row of periodRows ?? []) {
    const uid = row.user_id ?? "anonymous";
    userCounts[uid] = (userCounts[uid] ?? 0) + 1;
  }
  const topUsers = Object.entries(userCounts)
    .map(([userId, calls]) => ({ userId, calls }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10);

  // Daily trend — group by date
  const dailyCounts: Record<string, { calls: number; tokensIn: number; tokensOut: number }> = {};
  for (const row of periodRows ?? []) {
    const day = formatDateShort(row.created_at);
    if (!dailyCounts[day]) dailyCounts[day] = { calls: 0, tokensIn: 0, tokensOut: 0 };
    dailyCounts[day].calls++;
    dailyCounts[day].tokensIn += row.tokens_input ?? 0;
    dailyCounts[day].tokensOut += row.tokens_output ?? 0;
  }
  const dailyData = Object.entries(dailyCounts)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Shell title="AI Usage" introKey="admin.aiUsage">
      <AiUsageDashboard
        range={range}
        periodTotals={periodTotals}
        allTimeTotals={allTimeTotals}
        periodCost={periodCost}
        allTimeCost={allTimeCost}
        routeData={routeData}
        topUsers={topUsers}
        dailyData={dailyData}
      />
    </Shell>
  );
}
