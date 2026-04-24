'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  range: string;
  periodTotals: { calls: number; tokensIn: number; tokensOut: number };
  allTimeTotals: { calls: number; tokensIn: number; tokensOut: number };
  periodCost: number;
  allTimeCost: number;
  routeData: { route: string; calls: number; tokensIn: number; tokensOut: number }[];
  topUsers: { userId: string; calls: number }[];
  dailyData: { date: string; calls: number; tokensIn: number; tokensOut: number }[];
}

const RANGES = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
];

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function fmtCost(n: number): string {
  return `$${n.toFixed(4)}`;
}

export default function AiUsageDashboard({
  range,
  periodTotals,
  allTimeTotals,
  periodCost,
  allTimeCost,
  routeData,
  topUsers,
  dailyData,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <a
            key={r.value}
            href={`/admin/ai-usage?range=${r.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
              range === r.value
                ? "bg-violet/20 text-violet border border-violet/40"
                : "border border-white/10 text-soft-gray/60 hover:text-soft-gray hover:border-white/20"
            }`}
          >
            {r.label}
          </a>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Calls (period)", value: periodTotals.calls.toLocaleString() },
          { label: "Tokens In (period)", value: fmtTokens(periodTotals.tokensIn) },
          { label: "Tokens Out (period)", value: fmtTokens(periodTotals.tokensOut) },
          { label: "Est. Cost (period)", value: fmtCost(periodCost) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-white/3 p-5">
            <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-2xl font-bold text-violet">{value}</p>
          </div>
        ))}
      </div>

      {/* All-time row */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-4">All Time</p>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-sm text-soft-gray/50">Total Calls</p>
            <p className="text-xl font-bold">{allTimeTotals.calls.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-soft-gray/50">Tokens In</p>
            <p className="text-xl font-bold">{fmtTokens(allTimeTotals.tokensIn)}</p>
          </div>
          <div>
            <p className="text-sm text-soft-gray/50">Tokens Out</p>
            <p className="text-xl font-bold">{fmtTokens(allTimeTotals.tokensOut)}</p>
          </div>
          <div>
            <p className="text-sm text-soft-gray/50">Est. Cost</p>
            <p className="text-xl font-bold text-gold">{fmtCost(allTimeCost)}</p>
          </div>
        </div>
      </div>

      {/* Daily trend chart */}
      {dailyData.length > 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-4">Daily Calls</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(226,232,240,0.4)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(226,232,240,0.4)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0D1326",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center text-soft-gray/40 text-sm">
          No AI calls recorded in this period.
        </div>
      )}

      {/* Calls per route */}
      {routeData.length > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-4">Calls by Route</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-2 text-left text-xs text-soft-gray/40 uppercase tracking-wider">Route</th>
                  <th className="pb-2 text-right text-xs text-soft-gray/40 uppercase tracking-wider">Calls</th>
                  <th className="pb-2 text-right text-xs text-soft-gray/40 uppercase tracking-wider">Tokens In</th>
                  <th className="pb-2 text-right text-xs text-soft-gray/40 uppercase tracking-wider">Tokens Out</th>
                </tr>
              </thead>
              <tbody>
                {routeData.map(({ route, calls, tokensIn, tokensOut }) => (
                  <tr key={route} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 text-soft-gray/80 font-mono text-xs">{route}</td>
                    <td className="py-2.5 text-right text-soft-gray">{calls}</td>
                    <td className="py-2.5 text-right text-soft-gray/60">{fmtTokens(tokensIn)}</td>
                    <td className="py-2.5 text-right text-soft-gray/60">{fmtTokens(tokensOut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top users */}
      {topUsers.length > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs text-soft-gray/40 uppercase tracking-wider mb-4">Top Users by Calls</p>
          <div className="space-y-2">
            {topUsers.map(({ userId, calls }, i) => (
              <div key={userId} className="flex items-center gap-3">
                <span className="text-xs text-soft-gray/30 w-5 text-right">{i + 1}</span>
                <span className="flex-1 text-xs text-soft-gray/70 font-mono truncate">{userId}</span>
                <span className="text-sm font-semibold text-soft-gray">{calls}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
