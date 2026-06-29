import { AnalysisResult } from "@/types/commitment";

export function buildChartData(analysis: AnalysisResult) {
  const priority = {
    High: 0,
    Medium: 0,
    Low: 0,
  };

  const risk = {
    Healthy: 0,
    "At Risk": 0,
    Critical: 0,
    Collapsing: 0,
  };

  const effort = analysis.commitments.map((c) => ({
    task: c.title.length > 18 ? c.title.slice(0, 18) + "..." : c.title,
    hours: c.estimatedEffortHours,
  }));

  analysis.commitments.forEach((c) => {
    if (c.importance === "high") priority.High++;
    else if (c.importance === "medium") priority.Medium++;
    else priority.Low++;
  });

  analysis.risks.forEach((r) => {
    switch (r.healthStatus) {
      case "healthy":
        risk.Healthy++;
        break;

      case "at_risk":
        risk["At Risk"]++;
        break;

      case "critical":
        risk.Critical++;
        break;

      case "collapsing":
        risk.Collapsing++;
        break;
    }
  });

  return {
    priorityData: Object.entries(priority).map(([name, value]) => ({
      name,
      value,
    })),

    riskData: Object.entries(risk).map(([name, value]) => ({
      name,
      value,
    })),

    effortData: effort,
  };
}