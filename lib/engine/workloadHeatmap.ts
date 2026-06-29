import { AnalysisResult } from "@/types/commitment";

export interface HeatmapDay {
  label: string;
  date: string;
  hours: number;
  intensity: "low" | "medium" | "high" | "overload";
}

function getIntensity(hours: number): HeatmapDay["intensity"] {
  if (hours >= 8) return "overload";
  if (hours >= 5) return "high";
  if (hours >= 2) return "medium";
  return "low";
}

export function buildWorkloadHeatmap(analysis: AnalysisResult): HeatmapDay[] {
  const today = new Date();

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toISOString(),
      hours: 0,
      intensity: "low" as HeatmapDay["intensity"],
    };
  });

  analysis.commitments.forEach((commitment) => {
    const deadline = new Date(commitment.deadline);
    const daysUntil = Math.max(
      0,
      Math.min(
        6,
        Math.floor(
          (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    );

    const spreadDays = Math.max(1, daysUntil + 1);
    const dailyHours = commitment.estimatedEffortHours / spreadDays;

    for (let i = 0; i <= daysUntil; i++) {
      days[i].hours += dailyHours;
    }
  });

  return days.map((day) => ({
    ...day,
    hours: Math.round(day.hours * 10) / 10,
    intensity: getIntensity(day.hours),
  }));
}