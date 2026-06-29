import { AnalysisResult } from "@/types/commitment";
import { buildExecutiveBrief } from "@/lib/engine/executiveBrief";

interface Props {
  analysis: AnalysisResult;
}

export default function ExecutiveBrief({ analysis }: Props) {
  const brief = buildExecutiveBrief(analysis);

  return (
    <section className="bg-gradient-to-br from-cyan-400/10 via-slate-900 to-slate-950 border border-cyan-400/30 rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <p className="text-sm text-cyan-400 font-semibold">
            AI Executive Brief
          </p>

          <h2 className="text-2xl font-bold mt-2">{brief.title}</h2>

          <p className="text-slate-300 mt-4 max-w-4xl leading-relaxed">
            {brief.summary}
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 min-w-64">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Critical Commitments
          </p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">
            {brief.criticalCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Biggest Bottleneck
          </p>
          <p className="text-slate-200 font-semibold mt-2">
            {brief.bottleneck}
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Recommended Next Action
          </p>
          <p className="text-slate-200 font-semibold mt-2">
            {brief.nextAction}
          </p>
        </div>
      </div>
    </section>
  );
}