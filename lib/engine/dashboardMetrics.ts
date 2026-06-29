import { AnalysisResult, HealthStatus } from "@/types/commitment";

export function getAverageRisk(analysis: AnalysisResult) {
  if (!analysis.risks.length) return 0;

  const total = analysis.risks.reduce((sum, risk) => sum + risk.riskScore, 0);
  return Math.round(total / analysis.risks.length);
}

export function getCommitmentHealthScore(analysis: AnalysisResult) {
  return Math.max(0, 100 - getAverageRisk(analysis));
}

export function getOverallRiskLevel(analysis: AnalysisResult) {
  const avgRisk = getAverageRisk(analysis);

  if (avgRisk >= 80) return "Critical";
  if (avgRisk >= 60) return "High";
  if (avgRisk >= 35) return "Moderate";
  return "Low";
}

export function getRequiredHours(analysis: AnalysisResult) {
  return analysis.commitments.reduce(
    (sum, item) => sum + item.estimatedEffortHours,
    0
  );
}

export function getWorstHealthStatus(analysis: AnalysisResult): HealthStatus {
  const order: HealthStatus[] = [
    "healthy",
    "at_risk",
    "critical",
    "collapsing",
  ];

  return analysis.risks.reduce<HealthStatus>((worst, risk) => {
    return order.indexOf(risk.healthStatus) > order.indexOf(worst)
      ? risk.healthStatus
      : worst;
  }, "healthy");
}

export function formatHealthStatus(status: HealthStatus) {
  return status.replace("_", " ").toUpperCase();
}