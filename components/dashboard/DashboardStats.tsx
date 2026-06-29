import { AnalysisResult } from "@/types/commitment";
import {
  getAverageRisk,
  getOverallRiskLevel,
  getRequiredHours,
} from "@/lib/engine/dashboardMetrics";

interface Props {
  analysis: AnalysisResult;
}

export default function DashboardStats({ analysis }: Props) {
  const requiredHours =
    analysis.capacity?.requiredHoursTotal ?? getRequiredHours(analysis);

  const availableHours = analysis.capacity?.availableHoursRemaining ?? 0;

  const workloadGap =
    analysis.capacity?.workloadGapHours ?? requiredHours - availableHours;

  const avgRisk = getAverageRisk(analysis);
  const riskLevel = getOverallRiskLevel(analysis);

  const stats = [
    { label: "Risk Level", value: riskLevel },
    { label: "Avg Risk", value: `${avgRisk}%` },
    { label: "Tasks", value: analysis.commitments.length },
    { label: "Collisions", value: analysis.collisions.length },
    { label: "Ideal Required Hours", value: requiredHours },
    { label: "Available Hours", value: availableHours },
    {
      label: "Workload Gap",
      value: workloadGap > 0 ? `+${workloadGap}` : workloadGap,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`border border-slate-800 bg-slate-900 p-4 ${index === stats.length - 1 ? "col-span-2" : ""}`}
        >
          <p className="text-xs uppercase text-slate-500 font-semibold">
            {stat.label}
          </p>
          <p className="text-2xl font-bold mt-2">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
