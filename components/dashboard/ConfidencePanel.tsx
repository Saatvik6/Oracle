import { CommitmentAnalysis } from "@/types/workload";

function percentage(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

export default function ConfidencePanel({
  commitments,
}: {
  commitments: CommitmentAnalysis[];
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">Model certainty</p>
      <h2 className="mt-2 text-xl font-bold text-white">Confidence</h2>

      <div className="mt-5 space-y-5">
        {commitments.map((commitment) => {
          const score = percentage(commitment.confidence.overall);
          return (
            <div key={commitment.id}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-200">{commitment.title}</span>
                <span className="font-semibold text-white">{score}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${score >= 80 ? "bg-emerald-400" : score >= 65 ? "bg-amber-400" : "bg-rose-400"}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="mt-2 flex gap-3 text-[11px] text-slate-500">
                <span>Scope {percentage(commitment.confidence.scope)}%</span>
                <span>Effort {percentage(commitment.confidence.effort)}%</span>
                <span>Deadline {percentage(commitment.confidence.deadline)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
