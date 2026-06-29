import { AnalysisResult, HealthStatus, Importance } from "@/types/commitment";

type NormalizeOptions = {
  availableHoursPerDay: number;
  previousAnalysis?: AnalysisResult | null;
  eventType?: string;
};

function getImportanceScore(importance: Importance) {
  if (importance === "high") return 20;
  if (importance === "medium") return 10;
  return 4;
}

function getDaysUntilDeadline(deadline: string) {
  const deadlineTime = new Date(deadline).getTime();
  const now = new Date().getTime();

  if (Number.isNaN(deadlineTime)) return 7;

  const diffMs = deadlineTime - now;
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

function getUrgencyScore(daysLeft: number) {
  if (daysLeft <= 1) return 30;
  if (daysLeft <= 3) return 22;
  if (daysLeft <= 7) return 14;
  if (daysLeft <= 14) return 7;
  return 2;
}

function getEffortScore(hours: number) {
  if (hours >= 12) return 25;
  if (hours >= 8) return 18;
  if (hours >= 5) return 12;
  if (hours >= 2) return 6;
  return 2;
}

function getHealthStatus(score: number): HealthStatus {
  if (score >= 85) return "collapsing";
  if (score >= 70) return "critical";
  if (score >= 40) return "at_risk";
  return "healthy";
}

export function normalizeAnalysis(
  analysis: AnalysisResult,
  options: NormalizeOptions
): AnalysisResult {
  const requiredHoursTotal = analysis.commitments.reduce(
    (sum, item) => sum + Number(item.estimatedEffortHours || 0),
    0
  );

  let availableHoursRemaining =
    options.previousAnalysis?.capacity?.availableHoursRemaining ??
    options.availableHoursPerDay * 3;

  if (options.eventType === "missed") {
    availableHoursRemaining -= options.availableHoursPerDay;
  }

  if (options.eventType === "delayed") {
    availableHoursRemaining -= options.availableHoursPerDay * 0.5;
  }

  availableHoursRemaining = Math.max(0, Math.round(availableHoursRemaining));

  const workloadGapHours =
    Math.round((requiredHoursTotal - availableHoursRemaining) * 100) / 100;

  const pressureRatio =
    availableHoursRemaining > 0
      ? requiredHoursTotal / availableHoursRemaining
      : 3;

  const workloadPressureScore =
    pressureRatio >= 2
      ? 22
      : pressureRatio >= 1.5
      ? 16
      : pressureRatio >= 1.1
      ? 10
      : 2;

  const normalizedRisks = analysis.risks.map((risk) => {
    const commitment = analysis.commitments.find(
      (item) => item.id === risk.commitmentId
    );

    if (!commitment) return risk;

    const daysLeft = getDaysUntilDeadline(commitment.deadline);
    const effortHours = Number(commitment.estimatedEffortHours || 0);

    const importanceScore = getImportanceScore(commitment.importance);
    const urgencyScore = getUrgencyScore(daysLeft);
    const effortScore = getEffortScore(effortHours);

    let missedPenalty = 0;

    if (options.eventType === "missed") {
      missedPenalty = daysLeft <= 3 ? 15 : 8;
    }

    if (options.eventType === "delayed") {
      missedPenalty = daysLeft <= 3 ? 9 : 4;
    }

    let score =
      importanceScore +
      urgencyScore +
      effortScore +
      workloadPressureScore +
      missedPenalty;

    score = Math.max(5, Math.min(100, Math.round(score)));

    return {
      ...risk,
      riskScore: score,
      healthStatus: getHealthStatus(score),
    };
  });

  return {
    ...analysis,
    risks: normalizedRisks,
    capacity: {
      availableHoursRemaining,
      requiredHoursTotal,
      remainingDays:
        options.availableHoursPerDay > 0
          ? Math.round((availableHoursRemaining / options.availableHoursPerDay) * 10) / 10
          : 0,
      workloadGapHours,
    },
  };
}