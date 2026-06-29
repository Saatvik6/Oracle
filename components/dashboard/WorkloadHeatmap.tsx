import { AnalysisResult } from "@/types/commitment";
import { buildWorkloadHeatmap, HeatmapDay } from "@/lib/engine/workloadHeatmap";

function pressureColor(intensity: HeatmapDay["intensity"]) {
  if (intensity === "overload") return "#f87171";
  if (intensity === "high") return "#fb923c";
  if (intensity === "medium") return "#fbbf24";
  return "#7f77dd";
}

export default function WorkloadHeatmap({ analysis }: { analysis: AnalysisResult }) {
  const days = buildWorkloadHeatmap(analysis);
  const maxHours = Math.max(8, ...days.map((day) => day.hours));
  const totalHours = days.reduce((sum, day) => sum + day.hours, 0);
  const overloadedDays = days.filter((day) => day.intensity === "overload").length;

  return (
    <section className="border border-white/[0.08] bg-[#101218] p-6 md:p-7">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b94e3]">Seven-day capacity</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Workload pressure</h2>
          <p className="mt-2 text-sm text-slate-500">Daily effort implied by the current deadlines.</p>
        </div>
        <div className="flex gap-6 text-right">
          <div><p className="text-2xl font-semibold text-white">{Math.round(totalHours * 10) / 10}h</p><p className="text-[10px] uppercase tracking-wider text-slate-600">Scheduled</p></div>
          <div><p className={`text-2xl font-semibold ${overloadedDays ? "text-rose-300" : "text-emerald-300"}`}>{overloadedDays}</p><p className="text-[10px] uppercase tracking-wider text-slate-600">Overload days</p></div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="grid min-w-[680px] grid-cols-7 gap-3">
          {days.map((day) => {
            const fill = Math.max(3, (day.hours / maxHours) * 100);
            const color = pressureColor(day.intensity);
            const date = new Date(day.date);
            return (
              <div key={day.date}>
                <div className="relative h-44 overflow-hidden border border-white/[0.07] bg-[#0d0f15]">
                  <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-rose-400/20" />
                  <span className="absolute right-2 top-[12%] text-[9px] uppercase tracking-wider text-slate-700">8h limit</span>
                  <div
                    className="absolute inset-x-0 bottom-0 opacity-80 transition-[height,background-color] duration-500 ease-out"
                    style={{
                      height: `${fill}%`,
                      background: `linear-gradient(to top, ${color}, ${color}33)`,
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-3 text-center">
                    <p className="text-xl font-semibold text-white">{day.hours}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/50">hours</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between px-1">
                  <div><p className="text-sm font-semibold text-slate-200">{day.label}</p><p className="text-[10px] text-slate-600">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p></div>
                  <span className="h-2 w-2" style={{ backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-5 border-t border-white/[0.07] pt-4 text-xs text-slate-500">
        {[
          ["Manageable", "#7f77dd"],
          ["Concentrated", "#fbbf24"],
          ["High pressure", "#fb923c"],
          ["Over capacity", "#f87171"],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-2"><span className="h-2 w-2" style={{ backgroundColor: color }} />{label}</span>
        ))}
      </div>
    </section>
  );
}
