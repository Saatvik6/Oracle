import { CommitmentAnalysis } from "@/types/workload";

export default function ScopePanel({
  commitments,
}: {
  commitments: CommitmentAnalysis[];
}) {
  const assumptions = commitments.flatMap((item) =>
    item.scopeUnderstanding.assumptions.map((text) => ({ id: item.id, title: item.title, text }))
  );
  const blockers = commitments.flatMap((item) =>
    item.blockers.map((text) => ({ id: item.id, title: item.title, text }))
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Planning guardrails</p>
      <h2 className="mt-2 text-xl font-bold text-white">Assumptions & Blockers</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Explicit assumptions</h3>
          <div className="mt-3 space-y-2">
            {assumptions.length ? assumptions.map((item, index) => (
              <div key={`${item.id}-assumption-${index}`} className="rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-400">
                <span className="font-semibold text-slate-200">{item.title}:</span> {item.text}
              </div>
            )) : <p className="text-xs text-slate-500">No material assumptions.</p>}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Known blockers</h3>
          <div className="mt-3 space-y-2">
            {blockers.length ? blockers.map((item, index) => (
              <div key={`${item.id}-blocker-${index}`} className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3 text-xs leading-5 text-rose-200">
                <span className="font-semibold">{item.title}:</span> {item.text}
              </div>
            )) : <p className="text-xs text-slate-500">No active blockers identified.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
