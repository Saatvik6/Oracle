import { CommitmentAnalysis } from "@/types/workload";

export default function WorkBreakdownPanel({
  commitments,
}: {
  commitments: CommitmentAnalysis[];
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">Execution model</p>
        <h2 className="mt-2 text-xl font-bold text-white">Work Breakdown</h2>
      </div>

      <div className="mt-5 space-y-5">
        {commitments.map((commitment) => (
          <article key={commitment.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{commitment.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{commitment.taskType}</p>
              </div>
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {commitment.effortEstimate.likelyHours}h likely
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {commitment.workUnits.map((unit, index) => (
                <div
                  key={`${commitment.id}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 px-3 py-3 text-sm"
                >
                  <div>
                    <p className="text-slate-200">{unit.title}</p>
                    {unit.description && <p className="mt-1 text-xs text-slate-500">{unit.description}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{unit.estimatedMinutes} min</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
