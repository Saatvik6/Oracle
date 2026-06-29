import { AnalysisResult } from "@/types/commitment";

interface Props {
  analysis: AnalysisResult;
}

function getHealthColor(status: string) {
  switch (status) {
    case "healthy":
      return "bg-emerald-400";
    case "at_risk":
      return "bg-yellow-400";
    case "critical":
      return "bg-orange-400";
    case "collapsing":
      return "bg-red-400";
    default:
      return "bg-violet-400";
  }
}

export default function RiskDashboard({ analysis }: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Deadline Risk Predictor</h2>

      <div className="space-y-3">
        {analysis.risks.map((risk) => {
          const commitment = analysis.commitments.find(
            (c) => c.id === risk.commitmentId
          );

          return (
            <div
              key={risk.commitmentId}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {commitment?.title || risk.commitmentId}
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">{risk.reason}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-violet-400">
                    {risk.riskScore}%
                  </p>
                  <p className="text-xs text-slate-500 uppercase">
                    {risk.healthStatus.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                className={`h-full ${getHealthColor(risk.healthStatus)}`}
                style={{ width: `${risk.riskScore}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}