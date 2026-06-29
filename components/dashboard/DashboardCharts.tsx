"use client";

import { AnalysisResult } from "@/types/commitment";
import { buildChartData } from "@/lib/engine/chartData";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  analysis: AnalysisResult;
}

const COLORS = [
  "#22d3ee",
  "#38bdf8",
  "#facc15",
  "#fb923c",
  "#ef4444",
];

export default function DashboardCharts({ analysis }: Props) {
  const data = buildChartData(analysis);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            AI Analytics
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Distribution of workload, priority and commitment risk.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 mt-8">

        {/* Priority */}

        <div className="h-[300px]">

          <h3 className="font-semibold mb-3">
            Priority Mix
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <PieChart>

              <Pie
                data={data.priorityData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                >
                    

                {data.priorityData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}

              </Pie>

              <Tooltip/>

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Risk */}

        <div className="h-[300px]">

          <h3 className="font-semibold mb-3">
            Risk Distribution
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <PieChart>

              <Pie
                data={data.riskData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
              >

                {data.riskData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}

              </Pie>

              <Tooltip/>

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Effort */}

        <div className="h-[300px]">

          <h3 className="font-semibold mb-3">
            Estimated Effort
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <BarChart
              data={data.effortData}
            >

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis
                dataKey="task"
              />

              <YAxis/>

              <Tooltip/>

              <Bar
                dataKey="hours"
                fill="#22d3ee"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </section>
  );
}