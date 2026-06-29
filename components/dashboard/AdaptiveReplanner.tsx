import { AnalysisResult } from "@/types/commitment";

interface Props {
  analysis: AnalysisResult;
  onReplan: (eventType: string) => void;
  loading: boolean;
  demoMode?: boolean;
}

const events = [
  {
    type: "completed",
    label: "I completed a key task",
  },
  {
    type: "delayed",
    label: "I am delayed",
  },
  {
    type: "missed",
    label: "I missed today’s work",
  },
  {
    type: "blocked",
    label: "I am blocked",
  },
];

export default function AdaptiveReplanner({
  onReplan,
  loading,
  demoMode = false,
}: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Adaptive Replanning</h2>
        {demoMode && (
          <span className="border border-violet-400/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
            Simulated
          </span>
        )}
      </div>

      <p className="text-sm text-slate-400 mb-4">
        Tell the agent what changed. It will recalculate risk, triage, timeline,
        and rescue plan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((event) => (
          <button
            key={event.type}
            onClick={() => onReplan(event.type)}
            disabled={loading}
            className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-left hover:border-violet-400 transition disabled:opacity-50"
          >
            <p className="font-semibold">{event.label}</p>
            <p className="text-xs text-slate-500 mt-1">
              Recalculate commitment health
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
