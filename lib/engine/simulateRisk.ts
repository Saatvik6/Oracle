import { AnalysisResult } from "@/types/commitment";

export function simulateRisk(analysis: AnalysisResult, simulatedHours: number) {
  const requiredHours = analysis.capacity.requiredHoursTotal;
  const gap = requiredHours - simulatedHours;

  const pressureRatio =
    simulatedHours > 0 ? requiredHours / simulatedHours : 3;

  let simulatedAvgRisk = 20;

  if (pressureRatio >= 2) simulatedAvgRisk = 85;
  else if (pressureRatio >= 1.5) simulatedAvgRisk = 70;
  else if (pressureRatio >= 1.1) simulatedAvgRisk = 50;
  else simulatedAvgRisk = 25;

  const healthScore = Math.max(0, 100 - simulatedAvgRisk);

  const riskLevel =
    simulatedAvgRisk >= 80
      ? "Critical"
      : simulatedAvgRisk >= 60
      ? "High"
      : simulatedAvgRisk >= 35
      ? "Moderate"
      : "Low";

  return {
    requiredHours,
    simulatedHours,
    gap,
    pressureRatio,
    simulatedAvgRisk,
    healthScore,
    riskLevel,
  };
}