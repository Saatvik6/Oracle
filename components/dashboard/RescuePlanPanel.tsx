"use client";

import { useState } from "react";
import { AnalysisResult, RescuePlan } from "@/types/commitment";
import { ArrowRight, Check, CheckCircle2, ShieldCheck } from "lucide-react";

interface Props {
  rescuePlan: RescuePlan;
  analysis: AnalysisResult;
}

export default function RescuePlanPanel({ rescuePlan, analysis }: Props) {
  const [approved, setApproved] = useState(false);
  const currentRisk = Math.max(...analysis.risks.map((risk) => risk.riskScore), 0);
  const projectedRisk = Math.max(5, currentRisk - rescuePlan.expectedRiskReduction);
  const estimatedSuccess = Math.min(95, 100 - projectedRisk);

  return (
    <section className="overflow-hidden border border-violet-400/30 bg-gradient-to-br from-violet-500/15 via-[#11131a] to-[#17142a]">
      <div className="grid lg:grid-cols-[1.45fr_0.55fr]">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 text-violet-300">
            <ShieldCheck size={19} />
            <p className="text-xs font-semibold uppercase tracking-[0.22em]">AI Rescue Plan</p>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            The shortest credible path through the workload.
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">{rescuePlan.summary}</p>

          <div className="mt-7 space-y-2">
            {rescuePlan.orderedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-4 border-b border-white/[0.07] py-3 last:border-0">
                <span className="grid h-7 w-7 shrink-0 place-items-center border border-violet-400/30 text-xs font-semibold text-violet-300">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-slate-200">{action.replace(/^\d+\.\s*/, "")}</p>
              </div>
            ))}
          </div>

          {!!rescuePlan.cuts.length && (
            <div className="mt-6 border-l-2 border-amber-400/60 bg-amber-400/[0.05] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Scope to protect</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{rescuePlan.cuts.join(" · ")}</p>
            </div>
          )}
        </div>

        <aside className="border-t border-violet-400/20 bg-black/20 p-6 lg:border-l lg:border-t-0 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Projected outcome</p>
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-1">
            <div>
              <p className="text-4xl font-semibold text-emerald-300">{estimatedSuccess}%</p>
              <p className="mt-1 text-xs text-slate-500">Estimated success</p>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-slate-500 line-through">{currentRisk}%</span>
                <ArrowRight size={16} className="text-slate-600" />
                <span className="text-4xl font-semibold text-violet-200">{projectedRisk}%</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Projected peak risk</p>
            </div>
          </div>

          <div className="mt-7 border-t border-white/[0.08] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fallback</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{rescuePlan.fallbackStrategy}</p>
          </div>

          <button
            type="button"
            onClick={() => setApproved(true)}
            disabled={approved}
            className={`mt-7 flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-[0.98] ${
              approved
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-[#6b63c7] text-white hover:bg-[#7f77dd]"
            }`}
          >
            {approved ? <CheckCircle2 size={17} /> : <Check size={17} />}
            {approved ? "Rescue plan approved" : "Approve rescue plan"}
          </button>
        </aside>
      </div>
    </section>
  );
}
