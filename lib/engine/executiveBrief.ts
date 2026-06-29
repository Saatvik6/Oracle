import { AnalysisResult } from "@/types/commitment";

export function buildExecutiveBrief(analysis: AnalysisResult) {
  const requiredHours = analysis.capacity?.requiredHoursTotal ?? 0;
  const availableHours = analysis.capacity?.availableHoursRemaining ?? 0;
  const workloadGap = analysis.capacity?.workloadGapHours ?? 0;

  const highestRisk = [...analysis.risks].sort(
    (a, b) => b.riskScore - a.riskScore
  )[0];

  const bottleneck = analysis.commitments.find(
    (item) => item.id === highestRisk?.commitmentId
  );

  const criticalCount = analysis.risks.filter(
    (risk) => risk.healthStatus === "critical" || risk.healthStatus === "collapsing"
  ).length;

  const riskLabel =
    criticalCount > 0 || workloadGap > 0
      ? "high pressure"
      : "manageable pressure";

  const nextAction =
    analysis.rescuePlan?.orderedActions?.[0]?.replace(/^\d+\.\s*/, "") ||
    "Start with the highest-risk commitment.";

  return {
    title:
      workloadGap > 0
        ? "Schedule pressure detected"
        : "Schedule currently manageable",
    summary:
      workloadGap > 0
        ? `Your schedule is under ${riskLabel}. You need ${requiredHours} hours, but only ${availableHours} hours remain, creating a ${workloadGap}-hour workload gap.`
        : `Your schedule is under ${riskLabel}. You need ${requiredHours} hours and have ${availableHours} hours available.`,
    bottleneck: bottleneck?.title || "No clear bottleneck detected",
    nextAction,
    criticalCount,
  };
}