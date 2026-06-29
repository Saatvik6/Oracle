import { AnalysisResult } from "@/types/commitment";
import { buildExecutiveBrief } from "@/lib/engine/executiveBrief";
import { BriefcaseBusiness, CalendarClock, ShieldAlert, Sparkles } from "lucide-react";

export default function ExecutiveBrief({ analysis }: { analysis: AnalysisResult }) {
  const brief = buildExecutiveBrief(analysis);
  const highestRisk = [...analysis.risks].sort((a, b) => b.riskScore - a.riskScore)[0];
  const highestCommitment = analysis.commitments.find(
    (item) => item.id === highestRisk?.commitmentId
  );
  const gap = Math.max(0, analysis.capacity.workloadGapHours);

  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 via-slate-900 to-violet-950/30">
      <div className="grid gap-0 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 text-cyan-300">
            <BriefcaseBusiness size={18} />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Morning Executive Brief</p>
          </div>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">
            Good morning. I&apos;ve already reviewed today.
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">{brief.summary}</p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
              <ShieldAlert className="mt-0.5 shrink-0 text-rose-400" size={18} />
              <p className="text-sm text-slate-200">
                <strong>{highestCommitment?.title || "Your highest-risk commitment"}</strong> is the first intervention point
                {highestRisk ? ` at ${highestRisk.riskScore}% risk.` : "."}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
              <CalendarClock className="mt-0.5 shrink-0 text-amber-300" size={18} />
              <p className="text-sm text-slate-200">
                {gap > 0
                  ? `Capacity is short by ${gap} hours. I prepared schedule changes for approval.`
                  : "The workload fits current capacity. I prepared protective focus blocks."}
              </p>
            </div>
          </div>
        </div>

        <aside className="border-t border-cyan-400/20 bg-slate-950/45 p-6 lg:border-l lg:border-t-0 md:p-8">
          <div className="flex items-center gap-2 text-violet-300">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Already handled</span>
          </div>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-3xl font-bold text-white">{analysis.commitments.length}</p>
              <p className="mt-1 text-xs text-slate-400">commitments reviewed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-300">{brief.criticalCount}</p>
              <p className="mt-1 text-xs text-slate-400">critical interventions</p>
            </div>
            <div className="border-t border-slate-800 pt-5">
              <p className="text-xs font-bold uppercase text-slate-500">My recommendation</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{brief.nextAction}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
