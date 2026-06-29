import { RescuePlan } from "@/types/commitment";

interface Props {
  rescuePlan: RescuePlan;
}

export default function RescuePlanPanel({ rescuePlan }: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">AI Rescue Plan</h2>

      <p className="text-slate-300 mb-5">{rescuePlan.summary}</p>

      <div className="space-y-5">
        <div>
          <h3 className="text-sm uppercase text-violet-400 font-bold mb-2">
            Ordered Actions
          </h3>

          <div className="space-y-2 text-sm text-slate-300">
            {rescuePlan.orderedActions.map((action, index) => (
                <p key={index}>
                {action.replace(/^\d+\.\s*/, "")}
                </p>
            ))}
            </div>
        </div>

        <div>
          <h3 className="text-sm uppercase text-violet-400 font-bold mb-2">
            Recommended Cuts
          </h3>

          {rescuePlan.cuts.length ? (
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
              {rescuePlan.cuts.map((cut, index) => (
                <li key={index}>{cut}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No cuts required.</p>
          )}
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm uppercase text-violet-400 font-bold mb-2">
            Fallback Strategy
          </h3>
          <p className="text-sm text-slate-300">
            {rescuePlan.fallbackStrategy}
          </p>
        </div>
      </div>
    </section>
  );
}