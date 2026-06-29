import { NextResponse } from "next/server";
import {
  ChatMessage,
  ClarificationQuestion,
  IntakeAttachment,
  IntakeConfidence,
  IntakeResult,
} from "@/types/intake";
import {
  addGeminiModelHeaders,
  generateWithModelFallback,
} from "@/lib/gemini/modelPool";

const CONFIDENCE_THRESHOLD = 0.85;
const MAX_CLARIFICATION_MESSAGES = 2;

function isConversation(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (message) =>
        typeof message === "object" &&
        message !== null &&
        ((message as ChatMessage).role === "user" ||
          (message as ChatMessage).role === "oracle") &&
        typeof (message as ChatMessage).content === "string"
    )
  );
}

function isIntakeResult(value: unknown): value is IntakeResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<IntakeResult>;
  return (
    (result.status === "needs_clarification" || result.status === "ready") &&
    typeof result.oracleMessage === "string" &&
    Array.isArray(result.commitmentsDraft) &&
    Array.isArray(result.clarificationQuestions) &&
    !!result.availability
  );
}

function clamp(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : fallback;
}

function average(values: number[], fallback: number) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : fallback;
}

function normalizeConfidence(result: IntakeResult): IntakeConfidence {
  const supplied = result.confidence as Partial<IntakeConfidence> | undefined;
  const deadlineFallback = average(
    result.commitmentsDraft.map((item) =>
      item.deadline && !Number.isNaN(new Date(item.deadline).getTime())
        ? Math.max(0.75, item.confidence.deadline)
        : item.confidence.deadline
    ),
    0.2
  );
  const effortFallback = average(
    result.commitmentsDraft.map((item) => item.confidence.effort),
    0.35
  );
  const priorityFallback = average(
    result.commitmentsDraft.map((item) => item.confidence.scope),
    0.6
  );
  const capacityFallback =
    result.availability.hoursPerDay > 0 || result.availability.hoursToday > 0
      ? 0.95
      : 0.25;
  const dependenciesFallback = average(
    result.commitmentsDraft.map((item) =>
      item.confidence.scope >= 0.7 ? 0.8 : 0.55
    ),
    0.5
  );

  const confidence = {
    deadline: clamp(supplied?.deadline, deadlineFallback),
    effort: clamp(supplied?.effort, effortFallback),
    capacity: clamp(supplied?.capacity, capacityFallback),
    priority: clamp(supplied?.priority, priorityFallback),
    dependencies: clamp(supplied?.dependencies, dependenciesFallback),
    overall: 0,
  };
  const calculatedOverall =
    confidence.deadline * 0.28 +
    confidence.effort * 0.26 +
    confidence.capacity * 0.22 +
    confidence.priority * 0.14 +
    confidence.dependencies * 0.1;
  confidence.overall = clamp(supplied?.overall, calculatedOverall);
  return confidence;
}

function fallbackQuestions(result: IntakeResult): ClarificationQuestion[] {
  const questions: ClarificationQuestion[] = [];
  const missingDeadline = result.commitmentsDraft.find(
    (item) => !item.deadline || Number.isNaN(new Date(item.deadline).getTime())
  );
  const uncertainEffort = [...result.commitmentsDraft]
    .sort((a, b) => a.confidence.effort - b.confidence.effort)[0];

  if (result.confidence.capacity < 0.6) {
    questions.push({
      id: "capacity",
      question: "How many focused hours can you realistically work each day?",
      options: ["<1 hour", "1-2 hours", "3-4 hours", "5-6 hours", "7+ hours"],
      reason: "Capacity changes schedule feasibility.",
      impact: "high",
    });
  }
  if (missingDeadline) {
    questions.push({
      id: `deadline-${missingDeadline.id}`,
      commitmentId: missingDeadline.id,
      question: `Which deadline is closest for ${missingDeadline.title}?`,
      options: ["Tomorrow", "Within 3 days", "This week", "Later", "Flexible / unknown"],
      reason: "Its deadline changes priority and risk.",
      impact: "high",
    });
  }
  if (uncertainEffort && result.confidence.effort < 0.65) {
    questions.push({
      id: `effort-${uncertainEffort.id}`,
      commitmentId: uncertainEffort.id,
      question: `What size is ${uncertainEffort.title} closest to?`,
      options: ["<30 min", "30-60 min", "1-2 hours", "2-4 hours", "Half day", "Full day", "Multiple days"],
      reason: "This is the least certain effort estimate.",
      impact: "high",
    });
  }
  if (questions.length < 2 && result.commitmentsDraft.length > 1) {
    questions.push({
      id: "largest-task",
      question: "Which commitment feels most likely to take longer than expected?",
      options: result.commitmentsDraft.slice(0, 6).map((item) => item.title),
      reason: "This identifies the estimate that needs the largest safety margin.",
      impact: "high",
    });
  }
  if (questions.length < 2) {
    questions.push({
      id: "deadline-flexibility",
      question: "Can any of the stated deadlines move?",
      options: ["None can move", "One or two can move", "Most are flexible", "Not sure"],
      reason: "Flexibility changes the rescue plan.",
      impact: "high",
    });
  }
  return questions.slice(0, 3);
}

function assumptionMessage(result: IntakeResult) {
  const assumptions = result.commitmentsDraft.flatMap((item) =>
    item.assumptions.map((assumption) => `${item.title}: ${assumption}`)
  );
  const summary = assumptions.slice(0, 3).join("; ");
  return summary
    ? `I have enough to start. I am proceeding with these visible assumptions: ${summary}.`
    : "I have enough to start. Where exact effort was unavailable, I am using conservative estimates that can be adjusted from the report.";
}

function enforceReadiness(
  rawResult: IntakeResult,
  clarificationRound: number
): IntakeResult {
  const result = {
    ...rawResult,
    confidence: normalizeConfidence(rawResult),
  };

  if (!result.commitmentsDraft.length) {
    return {
      ...result,
      status: "needs_clarification",
      oracleMessage: "I can build the draft as soon as I know what is competing for your time.",
      clarificationQuestions: [{
        id: "commitments",
        question: "What needs to get done? A rough list is enough.",
        reason: "At least one commitment is required.",
        impact: "high",
      }],
    };
  }

  const mustProceed = clarificationRound >= MAX_CLARIFICATION_MESSAGES;
  const confidentEnough = result.confidence.overall >= CONFIDENCE_THRESHOLD;
  if (mustProceed || confidentEnough) {
    return {
      ...result,
      status: "ready",
      oracleMessage: assumptionMessage(result),
      clarificationQuestions: [],
    };
  }

  const highImpactQuestions = result.clarificationQuestions
    .filter((question) => question.impact === "high")
    .slice(0, 3);
  const questions = [...highImpactQuestions, ...fallbackQuestions(result)]
    .filter(
      (question, index, all) =>
        all.findIndex((candidate) => candidate.id === question.id) === index
    )
    .slice(0, 3);

  if (!questions.length) {
    return {
      ...result,
      status: "ready",
      oracleMessage: assumptionMessage(result),
      clarificationQuestions: [],
    };
  }

  return {
    ...result,
    status: "needs_clarification",
    oracleMessage: `I already have a workable draft at ${Math.round(result.confidence.overall * 100)}% confidence. These are the only answers likely to change the plan.`,
    clarificationQuestions: questions,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!isConversation(body.messages)) {
      return NextResponse.json(
        { error: "A conversation with at least one message is required." },
        { status: 400 }
      );
    }

    const clarificationRound = Math.max(
      0,
      Math.min(MAX_CLARIFICATION_MESSAGES, Number(body.clarificationRound || 0))
    );
    const previousResult = body.previousResult as IntakeResult | undefined;
    const latestMessage = body.messages[body.messages.length - 1] as ChatMessage;
    const attachments = (latestMessage.attachments || []).slice(0, 4);
    const conversationForPrompt = body.messages.map((message: ChatMessage) => ({
      role: message.role,
      content: message.content,
      attachments: message.attachments?.map((attachment) => ({
        name: attachment.name,
        mimeType: attachment.mimeType,
      })),
    }));

    const prompt = `
You are Oracle, a decisive senior Chief of Staff conducting intake.
Current time: ${new Date().toISOString()}
Clarification messages already asked: ${clarificationRound} of ${MAX_CLARIFICATION_MESSAGES} maximum.

Your objective is to reach planning confidence with the fewest user interactions,
not to collect every possible detail. Extract and infer aggressively. Ask only when
an answer is likely to materially change the schedule, risk score, or rescue plan.

Operating rules:
- Build a complete draft task model before asking anything.
- Overall confidence >= ${CONFIDENCE_THRESHOLD} means ready. Stop asking.
- Never ask more than ${MAX_CLARIFICATION_MESSAGES} clarification messages total.
- Bundle up to 3 high-impact questions in one response.
- Prefer fast choices: <30 min, 30-60 min, 1-2 h, 2-4 h, half day, full day, multiple days.
- Infer ordinary school/work task scope from context. Record the inference as an assumption.
- Do not ask for page count, format, materials, or dependencies unless the answer changes the plan.
- Unknown low-impact details reduce confidence but do not block readiness.
- Never say "we still need" or repeat a question already answered.
- If an audio/file attachment is unclear, preserve the previous draft and continue from known facts.
- Use stable commitment IDs. Remove commitments the user says are complete.
- Use ISO deadlines. When a user gives an approximate deadline, preserve it as an explicit assumption.
- Confidence values are 0 to 1.

Return only JSON:
{
  "status": "needs_clarification" | "ready",
  "oracleMessage": "decisive, brief response",
  "commitmentsDraft": [{
    "id": "string", "title": "string", "taskType": "string", "deadline": "ISO date or empty string",
    "knownFacts": ["string"], "unknowns": ["string"], "assumptions": ["string"],
    "ambiguityLevel": "low" | "medium" | "high",
    "effortRangeHours": { "min": 0, "likely": 0, "max": 0 },
    "dependencies": ["string"], "requiredMaterials": ["string"], "blockers": ["string"],
    "confidence": { "scope": 0, "effort": 0, "deadline": 0, "overall": 0 }
  }],
  "availability": {
    "hoursToday": 0, "hoursPerDay": 0, "workingDays": ["string"], "constraints": ["string"]
  },
  "confidence": {
    "deadline": 0, "effort": 0, "capacity": 0, "priority": 0,
    "dependencies": 0, "overall": 0
  },
  "clarificationQuestions": [{
    "id": "string", "commitmentId": "string", "question": "string",
    "options": ["short choice"], "reason": "why this changes the plan", "impact": "high"
  }]
}

Recent conversation:
${JSON.stringify(conversationForPrompt, null, 2)}

Previous structured draft (source of truth; update it, never restart):
${previousResult ? JSON.stringify(previousResult, null, 2) : "None"}
`;

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: prompt }];
    for (const attachment of attachments as IntakeAttachment[]) {
      const match = attachment.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }

    const generation = await generateWithModelFallback({
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json" },
    });
    const parsed: unknown = JSON.parse(generation.response.text || "");
    if (!isIntakeResult(parsed)) {
      throw new Error("Gemini returned an invalid intake response.");
    }

    const result = enforceReadiness(parsed, clarificationRound);
    return addGeminiModelHeaders(
      NextResponse.json(result),
      generation.model,
      generation.attempts.length
    );
  } catch (error) {
    console.error("Intake API error:", error);
    return NextResponse.json(
      {
        error: "Oracle could not process that message, but the existing draft is safe.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
