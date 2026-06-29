export type Importance = "low" | "medium" | "high";

export type HealthStatus =
  | "healthy"
  | "at_risk"
  | "critical"
  | "collapsing";

export type TriageCategory =
  | "critical"
  | "urgent"
  | "stable"
  | "deferred";

export interface Commitment {
  id: string;
  title: string;
  deadline: string;
  estimatedEffortHours: number;
  importance: Importance;
  notes?: string;
  dependencies: string[];
  confidence: number;
}

export interface RiskAssessment {
  commitmentId: string;
  riskScore: number;
  healthStatus: HealthStatus;
  reason: string;
  expectedFailurePoint?: string;
}

export interface Collision {
  id: string;
  commitments: string[];
  severity: "low" | "medium" | "high";
  explanation: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: "today" | "deadline" | "collision" | "failure" | "recovery";
  description: string;
}

export interface RescuePlan {
  summary: string;
  orderedActions: string[];
  cuts: string[];
  fallbackStrategy: string;
  expectedRiskReduction: number;
}

export interface AnalysisResult {
  commitments: Commitment[];
  triage: Record<TriageCategory, string[]>;
  risks: RiskAssessment[];
  collisions: Collision[];
  timeline: TimelineEvent[];
  rescuePlan: RescuePlan;
  reasoningSteps: string[];
  capacity: CapacityAnalysis;
  workloadAnalysis?: import("./workload").CommitmentAnalysis[];
}

export interface CapacityAnalysis {
  availableHoursRemaining: number;
  requiredHoursTotal: number;
  remainingDays: number;
  workloadGapHours: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
