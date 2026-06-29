"use client";

import { useMemo, useState } from "react";
import { AnalysisResult } from "@/types/commitment";
import { simulateRisk } from "@/lib/engine/simulateRisk";

interface Props {
  analysis: AnalysisResult;
}

export default function RiskSimulator({ analysis }: Props) {
  const defaultHours = analysis.capacity.availableHoursRemaining;
  const [hours, setHours] = useState(defaultHours);

  const simulation = useMemo(
    () => simulateRisk(analysis, hours),
    [analysis, hours]
  );

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Risk Simulator</h2>
          <p className="text-sm text-slate-400 mt-1">
            Test how changing available work hours affects schedule survival.
          </p>
        </div>

        <span className="text-xs text-cyan-400 font-bold border border-cyan-400/40 rounded-full px-3 py-1">
          WHAT-IF
        </span>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Available Hours</span>
          <span className="text-cyan-400 font-bold">{hours} hrs</span>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(40, analysis.capacity.requiredHoursTotal + 10)}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="w-full mt-3"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Simulated Health
          </p>
          <p className="text-3xl font-bold mt-2 text-cyan-400">
            {simulation.healthScore}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Risk Level
          </p>
          <p className="text-3xl font-bold mt-2">{simulation.riskLevel}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Workload Gap
          </p>
          <p className="text-3xl font-bold mt-2">
            {simulation.gap > 0 ? `+${simulation.gap}` : simulation.gap}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Required Hours
          </p>
          <p className="text-3xl font-bold mt-2">
            {simulation.requiredHours}
          </p>
        </div>
      </div>

      <div className="mt-6 h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all"
          style={{ width: `${simulation.healthScore}%` }}
        />
      </div>

      <p className="text-sm text-slate-400 mt-4">
        {simulation.gap > 0
          ? `You are short by ${simulation.gap} hours. Reduce scope, defer lower-priority tasks, or add focused work blocks.`
          : "Your available time is enough for the current workload if execution stays consistent."}
      </p>
    </section>
  );
}