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
          analysis.collisions.map((collision) => (
            <div
              key={collision.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex justify-between gap-4">
                <p className="text-sm text-slate-300">
                  {collision.explanation}
                </p>

                <span className="text-xs uppercase text-cyan-400 font-bold">
                  {collision.severity}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No major deadline collisions detected.
          </p>
        )}
      </div>
    </section>
  );
}