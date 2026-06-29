import { AnalysisResult } from "@/types/commitment";

export const demoScenario: AnalysisResult = {
  commitments: [
    {
      id: "hackathon",
      title: "Vibe2Ship Hackathon Submission",
      deadline: "2026-06-29T14:00:00",
      estimatedEffortHours: 9.5,
      importance: "high",
      notes: "Build, deploy, demo video, README, Google Doc",
      dependencies: ["MVP build", "Cloud Run deployment", "Demo recording"],
      confidence: 0.92,
    },
    {
      id: "internship",
      title: "Internship Batch Processing Feature",
      deadline: "2026-06-28T18:00:00",
      estimatedEffortHours: 4,
      importance: "high",
      notes: "CSV preview and batch report table",
      dependencies: ["Backend update", "Streamlit UI update"],
      confidence: 0.88,
    },
    {
      id: "basketball",
      title: "Basketball CV Court Keypoint Notebook",
      deadline: "2026-07-01T23:59:00",
      estimatedEffortHours: 6,
      importance: "medium",
      notes: "Continue court keypoint notebook",
      dependencies: ["Training notebook", "Dataset setup"],
      confidence: 0.76,
    },
  ],
  triage: {
    critical: ["hackathon"],
    urgent: ["internship"],
    stable: ["basketball"],
    deferred: [],
  },
  risks: [
    {
      commitmentId: "hackathon",
      riskScore: 84,
      healthStatus: "critical",
      reason:
        "Submission requires build, deployment, documentation, and demo recording within a compressed time window.",
      expectedFailurePoint: "2026-06-28T22:00:00",
    },
    {
      commitmentId: "internship",
      riskScore: 68,
      healthStatus: "at_risk",
      reason:
        "This overlaps with the hackathon build window and competes for the same focused coding hours.",
      expectedFailurePoint: "2026-06-28T15:00:00",
    },
    {
      commitmentId: "basketball",
      riskScore: 34,
      healthStatus: "healthy",
      reason:
        "Lower urgency and can be safely deferred until after the hackathon submission.",
      expectedFailurePoint: "",
    },
  ],
  collisions: [
    {
      id: "collision-1",
      commitments: ["hackathon", "internship"],
      severity: "high",
      explanation:
        "Hackathon and internship work both need deep coding time before June 29. Available hours are lower than required effort.",
    },
  ],
  timeline: [
    {
      id: "today",
      title: "Today",
      date: "2026-06-27T09:00:00",
      type: "today",
      description: "Start of rescue window.",
    },
    {
      id: "collision",
      title: "Workload Collision",
      date: "2026-06-28T12:00:00",
      type: "collision",
      description:
        "Internship work and hackathon MVP compete for the same available hours.",
    },
    {
      id: "failure",
      title: "Likely Failure Point",
      date: "2026-06-28T22:00:00",
      type: "failure",
      description:
        "If deployment is not complete by this point, demo and submission quality will collapse.",
    },
    {
      id: "deadline",
      title: "Hackathon Submission Deadline",
      date: "2026-06-29T14:00:00",
      type: "deadline",
      description: "Final submission deadline.",
    },
  ],
  rescuePlan: {
    summary:
      "Prioritize the hackathon MVP immediately, freeze non-essential features, finish deployment before polishing, and defer basketball work.",
    orderedActions: [
      "Finish adaptive replanning and demo seed first.",
      "Freeze all non-MVP features.",
      "Deploy to Cloud Run before UI polish.",
      "Record demo only after one successful deployed run.",
      "Move basketball CV work after submission.",
    ],
    cuts: [
      "Do not build authentication.",
      "Do not add Calendar OAuth.",
      "Do not add Supabase unless all MVP flows are complete.",
    ],
    fallbackStrategy:
      "If Gemini latency or deployment fails, use the seeded demo scenario to record a reliable product walkthrough.",
    expectedRiskReduction: 38,
  },
  reasoningSteps: [
    "Detected 3 active commitments.",
    "Calculated overlapping coding windows.",
    "Identified hackathon as the highest failure-risk commitment.",
    "Detected high-severity collision between internship and hackathon.",
    "Generated rescue plan by cutting non-MVP scope.",
  ],
  capacity: {
    availableHoursRemaining: 18,
    requiredHoursTotal: 19.5,
    remainingDays: 3,
    workloadGapHours: 1.5,
  },
  workloadAnalysis: [
    {
      id: "hackathon",
      title: "Vibe2Ship Hackathon Submission",
      taskType: "software project",
      deadline: "2026-06-29T14:00:00",
      scopeUnderstanding: {
        knownFacts: ["MVP, deployment, README, demo video, and submission document are required."],
        unknowns: [],
        assumptions: ["Authentication and calendar integrations are outside MVP scope."],
        ambiguityLevel: "low",
      },
      workUnits: [
        { title: "Finish MVP flows", description: "Complete and verify the core user journey.", estimatedMinutes: 180, canBeCompressed: false, isRequired: true },
        { title: "Stabilize intake and reports", description: "Handle failures and validate report rendering.", estimatedMinutes: 90, canBeCompressed: true, isRequired: true },
        { title: "Deploy application", description: "Deploy and run a production smoke test.", estimatedMinutes: 180, canBeCompressed: false, isRequired: true },
        { title: "Write submission material", description: "Prepare README and judging document.", estimatedMinutes: 60, canBeCompressed: true, isRequired: true },
        { title: "Record and submit demo", description: "Capture the walkthrough and complete submission.", estimatedMinutes: 60, canBeCompressed: true, isRequired: true },
      ],
      dependencies: ["Working MVP", "Deployment credentials", "Stable demo data"],
      requiredMaterials: ["Submission rubric", "Cloud Run project", "Screen recorder"],
      blockers: ["Deployment must succeed before the final demo can be recorded."],
      effortEstimate: { minHours: 8, likelyHours: 9.5, maxHours: 12 },
      confidence: { scope: 0.92, effort: 0.84, deadline: 1, overall: 0.9 },
    },
    {
      id: "internship",
      title: "Internship Batch Processing Feature",
      taskType: "software feature",
      deadline: "2026-06-28T18:00:00",
      scopeUnderstanding: {
        knownFacts: ["CSV preview and a batch report table are required."],
        unknowns: [],
        assumptions: ["Existing backend contracts remain unchanged."],
        ambiguityLevel: "low",
      },
      workUnits: [
        { title: "Update batch backend", description: "Add batch parsing and result generation.", estimatedMinutes: 120, canBeCompressed: false, isRequired: true },
        { title: "Build CSV preview", description: "Render validation and preview states.", estimatedMinutes: 60, canBeCompressed: true, isRequired: true },
        { title: "Add report table", description: "Display and verify processed batch results.", estimatedMinutes: 60, canBeCompressed: true, isRequired: true },
      ],
      dependencies: ["Backend update", "Streamlit UI"],
      requiredMaterials: ["Representative CSV fixture", "Feature requirements"],
      blockers: ["Competes with the hackathon for the same coding window."],
      effortEstimate: { minHours: 3, likelyHours: 4, maxHours: 6 },
      confidence: { scope: 0.9, effort: 0.82, deadline: 1, overall: 0.88 },
    },
    {
      id: "basketball",
      title: "Basketball CV Court Keypoint Notebook",
      taskType: "machine learning experiment",
      deadline: "2026-07-01T23:59:00",
      scopeUnderstanding: {
        knownFacts: ["Continue the existing court keypoint notebook and dataset setup."],
        unknowns: ["Final training stability is not yet known."],
        assumptions: ["A reproducible notebook is sufficient; production deployment is not required."],
        ambiguityLevel: "medium",
      },
      workUnits: [
        { title: "Validate dataset setup", description: "Check annotations, paths, and sample rendering.", estimatedMinutes: 90, canBeCompressed: false, isRequired: true },
        { title: "Run keypoint experiments", description: "Train and compare the next experiment set.", estimatedMinutes: 180, canBeCompressed: true, isRequired: true },
        { title: "Document findings", description: "Record metrics, failures, and next steps.", estimatedMinutes: 90, canBeCompressed: true, isRequired: true },
      ],
      dependencies: ["Training notebook", "Dataset setup"],
      requiredMaterials: ["Court dataset", "GPU runtime"],
      blockers: [],
      effortEstimate: { minHours: 4, likelyHours: 6, maxHours: 9 },
      confidence: { scope: 0.78, effort: 0.72, deadline: 1, overall: 0.76 },
    },
  ],
};
