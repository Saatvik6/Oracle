export type IntakeState =
  | "collecting_commitments"
  | "analyzing_scope"
  | "asking_clarifications"
  | "ready_to_generate"
  | "report_generated";

export interface ChatMessage {
  id: string;
  role: "user" | "oracle";
  content: string;
  timestamp: string;
  attachments?: IntakeAttachment[];
}

export interface IntakeAttachment {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  size: number;
}

export interface ClarificationQuestion {
  id: string;
  commitmentId?: string;
  question: string;
  options?: string[];
  reason: string;
  impact: "low" | "medium" | "high";
}

export interface CommitmentDraft {
  id: string;
  title: string;
  taskType: string;
  deadline: string;
  knownFacts: string[];
  unknowns: string[];
  assumptions: string[];
  ambiguityLevel: "low" | "medium" | "high";
  effortRangeHours: { min: number; likely: number; max: number };
  dependencies: string[];
  requiredMaterials: string[];
  blockers: string[];
  confidence: { scope: number; effort: number; deadline: number; overall: number };
}

export interface IntakeAvailability {
  hoursToday: number;
  hoursPerDay: number;
  workingDays: string[];
  constraints: string[];
}

export interface IntakeConfidence {
  deadline: number;
  effort: number;
  capacity: number;
  priority: number;
  dependencies: number;
  overall: number;
}

export interface IntakeResult {
  status: "needs_clarification" | "ready";
  oracleMessage: string;
  commitmentsDraft: CommitmentDraft[];
  availability: IntakeAvailability;
  confidence: IntakeConfidence;
  clarificationQuestions: ClarificationQuestion[];
}
