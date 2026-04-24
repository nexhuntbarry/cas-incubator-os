"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StageDataPoint {
  stage: string;
  count: number;
}

interface Props {
  stageData: StageDataPoint[];
}

const BAR_COLOR = "#0057FF";

export default function AnalyticsCharts({ stageData }: Props) {
  if (!stageData || stageData.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <p className="text-xs text-soft-gray/50 uppercase tracking-wider mb-2">
          Projects by Method Stage
        </p>
        <p className="text-sm text-soft-gray/40">No project data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5">
      <p className="text-xs text-soft-gray/50 uppercase tracking-wider mb-4">
        Projects by Method Stage
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={stageData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <XAxis
            dataKey="stage"
            tick={{ fill: "rgba(226,232,240,0.4)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(226,232,240,0.4)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0D1326",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#E2E8F0",
              fontSize: 12,
            }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Projects">
            {stageData.map((_, index) => (
              <Cell key={index} fill={BAR_COLOR} opacity={0.7 + (index / stageData.length) * 0.3} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
