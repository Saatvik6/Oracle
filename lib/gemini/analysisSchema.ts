export const analysisJsonSchema = {
  type: "object",
  properties: {
    commitments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          deadline: { type: "string" },
          estimatedEffortHours: { type: "number" },
          importance: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          notes: { type: "string" },
          dependencies: {
            type: "array",
            items: { type: "string" },
          },
          confidence: { type: "number" },
        },
        required: [
          "id",
          "title",
          "deadline",
          "estimatedEffortHours",
          "importance",
          "notes",
          "dependencies",
          "confidence",
        ],
      },
    },

    triage: {
      type: "object",
      properties: {
        critical: {
          type: "array",
          items: { type: "string" },
        },
        urgent: {
          type: "array",
          items: { type: "string" },
        },
        stable: {
          type: "array",
          items: { type: "string" },
        },
        deferred: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["critical", "urgent", "stable", "deferred"],
    },

    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          commitmentId: { type: "string" },
          riskScore: { type: "number" },
          healthStatus: {
            type: "string",
            enum: ["healthy", "at_risk", "critical", "collapsing"],
          },
          reason: { type: "string" },
          expectedFailurePoint: { type: "string" },
        },
        required: [
          "commitmentId",
          "riskScore",
          "healthStatus",
          "reason",
          "expectedFailurePoint",
        ],
      },
    },

    collisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          commitments: {
            type: "array",
            items: { type: "string" },
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          explanation: { type: "string" },
        },
        required: ["id", "commitments", "severity", "explanation"],
      },
    },

    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          date: { type: "string" },
          type: {
            type: "string",
            enum: ["today", "deadline", "collision", "failure", "recovery"],
          },
          description: { type: "string" },
        },
        required: ["id", "title", "date", "type", "description"],
      },
    },

    rescuePlan: {
      type: "object",
      properties: {
        summary: { type: "string" },
        orderedActions: {
          type: "array",
          items: { type: "string" },
        },
        cuts: {
          type: "array",
          items: { type: "string" },
        },
        fallbackStrategy: { type: "string" },
        expectedRiskReduction: { type: "number" },
      },
      required: [
        "summary",
        "orderedActions",
        "cuts",
        "fallbackStrategy",
        "expectedRiskReduction",
      ],
    },

    capacity: {
      type: "object",
      properties: {
        availableHoursRemaining: { type: "number" },
        requiredHoursTotal: { type: "number" },
        remainingDays: { type: "number" },
        workloadGapHours: { type: "number" },
      },
      required: [
        "availableHoursRemaining",
        "requiredHoursTotal",
        "remainingDays",
        "workloadGapHours",
      ],
    },

    workloadAnalysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          taskType: { type: "string" },
          deadline: { type: "string" },
          scopeUnderstanding: {
            type: "object",
            properties: {
              knownFacts: { type: "array", items: { type: "string" } },
              unknowns: { type: "array", items: { type: "string" } },
              assumptions: { type: "array", items: { type: "string" } },
              ambiguityLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
              },
            },
            required: ["knownFacts", "unknowns", "assumptions", "ambiguityLevel"],
          },
          workUnits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                estimatedMinutes: { type: "number" },
                canBeCompressed: { type: "boolean" },
                isRequired: { type: "boolean" },
              },
              required: [
                "title",
                "description",
                "estimatedMinutes",
                "canBeCompressed",
                "isRequired",
              ],
            },
          },
          dependencies: { type: "array", items: { type: "string" } },
          requiredMaterials: { type: "array", items: { type: "string" } },
          blockers: { type: "array", items: { type: "string" } },
          effortEstimate: {
            type: "object",
            properties: {
              minHours: { type: "number" },
              likelyHours: { type: "number" },
              maxHours: { type: "number" },
            },
            required: ["minHours", "likelyHours", "maxHours"],
          },
          confidence: {
            type: "object",
            properties: {
              scope: { type: "number" },
              effort: { type: "number" },
              deadline: { type: "number" },
              overall: { type: "number" },
            },
            required: ["scope", "effort", "deadline", "overall"],
          },
        },
        required: [
          "id",
          "title",
          "taskType",
          "deadline",
          "scopeUnderstanding",
          "workUnits",
          "dependencies",
          "requiredMaterials",
          "blockers",
          "effortEstimate",
          "confidence",
        ],
      },
    },

    reasoningSteps: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "commitments",
    "triage",
    "risks",
    "collisions",
    "timeline",
    "rescuePlan",
    "reasoningSteps",
    "capacity",
    "workloadAnalysis",
  ],
};
