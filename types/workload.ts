export interface WorkUnit {
  title: string;
  description: string;
  estimatedMinutes: number;
  canBeCompressed: boolean;
  isRequired: boolean;
}

export interface CommitmentAnalysis {
  id: string;
  title: string;
  taskType: string;
  deadline: string;
  scopeUnderstanding: {
    knownFacts: string[];
    unknowns: string[];
    assumptions: string[];
    ambiguityLevel: "low" | "medium" | "high";
  };
  workUnits: WorkUnit[];
  dependencies: string[];
  requiredMaterials: string[];
  blockers: string[];
  effortEstimate: { minHours: number; likelyHours: number; maxHours: number };
  confidence: { scope: number; effort: number; deadline: number; overall: number };
}
