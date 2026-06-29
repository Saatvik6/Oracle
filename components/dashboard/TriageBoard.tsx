import { AnalysisResult, TriageCategory } from "@/types/commitment";

interface Props {
  analysis: AnalysisResult;
}

const categoryLabels: Record<TriageCategory, string> = {
  critical: "Critical",
  urgent: "Urgent",
  stable: "Stable",
  deferred: "Deferred",
};

export default function TriageBoard({ analysis }: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">AI Triage Board</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(categoryLabels) as TriageCategory[]).map((category) => (
          <div
            key={category}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4"
          >
            <h3 className="text-sm uppercase text-cyan-400 font-bold mb-3">
              {categoryLabels[category]}
            </h3>

            <div className="space-y-2">
              {analysis.triage[category]?.length ? (
                analysis.triage[category].map((id) => {
                  const item = analysis.commitments.find((c) => c.id === id);

                  return (
                    <div
                      key={id}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm"
                    >
                      {item?.title || id}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No items</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}