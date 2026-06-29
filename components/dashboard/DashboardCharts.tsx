"use client";

import { AnalysisResult } from "@/types/commitment";
import { buildChartData } from "@/lib/engine/chartData";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  analysis: AnalysisResult;
}

interface Segment {
  name: string;
  value: number;
  color: string;
}

const tooltipStyle = {
  background: "#11131a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 0,
  color: "#f4f1ff",
  boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
};

function riskColor(score: number) {
  if (score >= 80) return "#f87171";
  if (score >= 60) return "#fb923c";
  if (score >= 40) return "#fbbf24";
  return "#4ade80";
}

function DistributionBand({ title, segments }: { title: string; segments: Segment[] }) {
  const total = Math.max(
    1,
    segments.reduce((sum, segment) => sum + segment.value, 0)
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="text-xs text-slate-600">{total} commitments</p>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden bg-white/[0.05]">
        {segments.map((segment) =>
          segment.value ? (
            <div
              key={segment.name}
              title={`${segment.name}: ${segment.value}`}
              style={{ width: `${(segment.value / total) * 100}%`, backgroundColor: segment.color }}
            />
          ) : null
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((segment) => (
          <div key={segment.name} className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2" style={{ backgroundColor: segment.color }} />
            <span>{segment.name}</span>
            <span className="font-semibold text-slate-300">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardCharts({ analysis }: Props) {
  const data = buildChartData(analysis);
  const totalHours = data.effortData.reduce((sum, item) => sum + item.hours, 0);
  const highestRisk = data.riskScoreData[0]?.risk || 0;
  const chartHeight = Math.max(250, analysis.commitments.length * 48);

  const prioritySegments: Segment[] = data.priorityData.map((item) => ({
    ...item,
    color:
      item.name === "High" ? "#9b94e3" : item.name === "Medium" ? "#6d66bd" : "#3f3b68",
  }));
  const riskSegments: Segment[] = data.riskData.map((item) => ({
    ...item,
    color:
      item.name === "Healthy"
        ? "#4ade80"
        : item.name === "At Risk"
          ? "#fbbf24"
          : item.name === "Critical"
            ? "#fb923c"
            : "#f87171",
  }));

  return (
    <section className="border border-white/[0.08] bg-[#101218] p-6 md:p-7">
      <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b94e3]">Portfolio analytics</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Where the plan is carrying weight</h2>
          <p className="mt-2 text-sm text-slate-500">Compare effort and deadline exposure commitment by commitment.</p>
        </div>
        <div className="flex gap-6 text-right">
          <div><p className="text-2xl font-semibold text-white">{totalHours}h</p><p className="text-[10px] uppercase tracking-wider text-slate-600">Total effort</p></div>
          <div><p className="text-2xl font-semibold text-rose-300">{highestRisk}%</p><p className="text-[10px] uppercase tracking-wider text-slate-600">Peak risk</p></div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="border border-white/[0.07] bg-[#0d0f15] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h3 className="font-semibold text-slate-100">Effort allocation</h3><p className="mt-1 text-xs text-slate-600">Estimated focused hours</p></div>
            <span className="text-xs font-semibold text-[#9b94e3]">HOURS</span>
          </div>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.effortData} layout="vertical" margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.055)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} unit="h" />
                <YAxis type="category" dataKey="task" width={128} axisLine={false} tickLine={false} tick={{ fill: "#a8a8b3", fontSize: 11 }} />
                <Tooltip cursor={{ fill: "rgba(127,119,221,0.05)" }} contentStyle={tooltipStyle} itemStyle={{ color: "#c4bfff" }} labelStyle={{ color: "#f4f1ff", marginBottom: 6 }} />
                <Bar dataKey="hours" name="Estimated effort" fill="#7f77dd" radius={[0, 3, 3, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="border border-white/[0.07] bg-[#0d0f15] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h3 className="font-semibold text-slate-100">Deadline exposure</h3><p className="mt-1 text-xs text-slate-600">Failure probability by commitment</p></div>
            <span className="text-xs font-semibold text-rose-300">RISK %</span>
          </div>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.riskScoreData} layout="vertical" margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.055)" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="task" width={128} axisLine={false} tickLine={false} tick={{ fill: "#a8a8b3", fontSize: 11 }} />
                <Tooltip cursor={{ fill: "rgba(248,113,113,0.04)" }} contentStyle={tooltipStyle} itemStyle={{ color: "#fecaca" }} labelStyle={{ color: "#f4f1ff", marginBottom: 6 }} />
                <Bar dataKey="risk" name="Risk score" radius={[0, 3, 3, 0]} barSize={16}>
                  {data.riskScoreData.map((item) => <Cell key={item.fullTitle} fill={riskColor(item.risk)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-8 border-t border-white/[0.07] pt-6 lg:grid-cols-2">
        <DistributionBand title="Priority mix" segments={prioritySegments} />
        <DistributionBand title="Risk state" segments={riskSegments} />
      </div>
    </section>
  );
}
