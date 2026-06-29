import { AnalysisResult } from "@/types/commitment";

interface Props {
  analysis: AnalysisResult;
}

export default function CollisionMap({ analysis }: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Deadline Collision Detector</h2>

      <div className="space-y-3">
        {analysis.collisions.length ? (
          analysis.collisions.map((collision) => {
            const commitments = collision.commitments
              .map((id) => analysis.commitments.find((item) => item.id === id))
              .filter(Boolean);
            const earliestDeadline = commitments
              .map((item) => new Date(item!.deadline))
              .filter((date) => !Number.isNaN(date.getTime()))
              .sort((a, b) => a.getTime() - b.getTime())[0];

            return (
              <div
                key={collision.id}
                className="border border-amber-400/20 bg-slate-950 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      ⚠ {earliestDeadline ? earliestDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Collision"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{collision.explanation}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {commitments.map((item) => (
                        <span key={item!.id} className="border border-white/10 px-2 py-1 text-[10px] text-slate-500">
                          {item!.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs uppercase text-amber-300 font-bold">
                    {collision.severity}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">
            No major deadline collisions detected.
          </p>
        )}
      </div>
    </section>
  );
}
