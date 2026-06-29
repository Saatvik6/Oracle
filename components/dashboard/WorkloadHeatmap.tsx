import { AnalysisResult } from "@/types/commitment";
import { buildWorkloadHeatmap } from "@/lib/engine/workloadHeatmap";

interface Props {
  analysis: AnalysisResult;
}

function getBarClass(intensity: string) {
  switch (intensity) {
    case "overload":
      return "h-32 bg-red-400";
    case "high":
      return "h-24 bg-orange-400";
    case "medium":
      return "h-16 bg-yellow-400";
    default:
      return "h-8 bg-violet-400";
  }
}

export default function WorkloadHeatmap({ analysis }: Props) {
  const days = buildWorkloadHeatmap(analysis);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Workload Heatmap</h2>
          <p className="text-sm text-slate-400 mt-1">
            Visualizes how much work pressure is concentrated across the next 7
            days.
          </p>
        </div>

        <span className="text-xs text-violet-400 font-bold border border-violet-400/40 rounded-full px-3 py-1">
          7 DAYS
        </span>
      </div>

      <div className="grid grid-cols-7 gap-3 mt-8 items-end">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-3">
            <div className="h-32 flex items-end">
              <div
                className={`w-8 rounded-t-lg transition-all ${getBarClass(
                  day.intensity
                )}`}
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold">{day.label}</p>
              <p className="text-xs text-slate-500">{day.hours}h</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-6 text-xs text-slate-400">
        <span>Low</span>
        <span className="text-yellow-400">Medium</span>
        <span className="text-orange-400">High</span>
        <span className="text-red-400">Overload</span>
      </div>
    </section>
  );
}