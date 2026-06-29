import { AnalysisResult } from "@/types/commitment";

const STORAGE_KEY = "deadline-oracle-analysis";

export function saveAnalysis(analysis: AnalysisResult) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
}

export function loadAnalysis(): AnalysisResult | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function clearAnalysis() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}