import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini/client";
import { ChatMessage, IntakeAttachment, IntakeResult } from "@/types/intake";

function isConversation(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (message) =>
        typeof message === "object" &&
        message !== null &&
        (message as ChatMessage).role !== undefined &&
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

function enforceReadiness(result: IntakeResult): IntakeResult {
  if (result.status !== "ready") return result;

  const missingDeadline = result.commitmentsDraft.find(
    (item) => !item.deadline || Number.isNaN(new Date(item.deadline).getTime())
  );
  const uncertainEffort = result.commitmentsDraft.find(
    (item) => item.confidence.effort < 0.7 || item.effortRangeHours.likely <= 0
  );
  const ambiguousScope = result.commitmentsDraft.find(
    (item) => item.ambiguityLevel === "high"
  );
  const availabilityUnknown =
    !result.availability || result.availability.hoursPerDay <= 0;

  let fallbackQuestion = null;

  if (!result.commitmentsDraft.length) {
    fallbackQuestion = {
      id: "missing-commitments",
      question: "What commitments need to be included in this plan?",
      reason: "There is nothing to schedule yet.",
      impact: "high" as const,
    };
  } else if (missingDeadline) {
    fallbackQuestion = {
      id: `deadline-${missingDeadline.id}`,
      commitmentId: missingDeadline.id,
      question: `What is the exact deadline for “${missingDeadline.title}”? Include the date, time, and timezone if relevant.`,
      reason: "A usable deadline is required for risk and schedule calculations.",
      impact: "high" as const,
    };
  } else if (uncertainEffort) {
    fallbackQuestion = {
      id: `effort-${uncertainEffort.id}`,
      commitmentId: uncertainEffort.id,
      question: `For “${uncertainEffort.title}”, what exactly must be delivered, and roughly how much is already complete?`,
      reason: "The current effort range is too uncertain to schedule safely.",
      impact: "high" as const,
    };
  } else if (ambiguousScope) {
    fallbackQuestion = {
      id: `scope-${ambiguousScope.id}`,
      commitmentId: ambiguousScope.id,
      question: `What does “done” look like for “${ambiguousScope.title}”?`,
      reason: "The deliverable still has major scope ambiguity.",
      impact: "high" as const,
    };
  } else if (availabilityUnknown) {
    fallbackQuestion = {
      id: "available-time",
      question: "How many focused hours are realistically available today and on a typical day before these deadlines?",
      reason: "Capacity is required to test whether the workload is feasible.",
      impact: "high" as const,
    };
  }

  if (!fallbackQuestion) return result;

  return {
    ...result,
    status: "needs_clarification",
    oracleMessage: "I’m close, but one planning-critical detail still needs a firm answer.",
    clarificationQuestions: [fallbackQuestion],
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

    const client = getGeminiClient();
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
You are Oracle, the user's autonomous AI Chief of Staff, conducting a rigorous project intake.
Current time: ${new Date().toISOString()}

Do not create a schedule, risk report, or rescue plan yet. Extract commitments,
evaluate planning confidence, and ask only the highest-impact missing questions.

You may return status "ready" only when all of these are true:
1. Every critical commitment has a usable, unambiguous deadline.
2. Effort confidence is at least 0.7 for every critical commitment.
3. Major scope ambiguity is resolved or captured as an explicit assumption.
4. Realistic available time is known (today and typical hours/day).
5. Important dependencies, materials, and blockers are identified.

Ask at most 3 questions per turn. Prefer concrete multiple-choice options when
they reduce uncertainty. Never say only "provide more details". A useful question
names the task, explains the ambiguity, and asks for a decision that changes the plan.
Confidence values are numbers from 0 to 1. Use stable commitment IDs across turns.
Use an empty string for an unresolved deadline and never invent a deadline.

Return only JSON with this exact shape:
{
  "status": "needs_clarification" | "ready",
  "oracleMessage": "brief conversational response",
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
  "clarificationQuestions": [{
    "id": "string", "commitmentId": "string", "question": "string",
    "options": ["string"], "reason": "string", "impact": "low" | "medium" | "high"
  }]
}

Conversation:
${JSON.stringify(conversationForPrompt, null, 2)}

Previous structured intake (reuse stable facts and IDs when present):
${previousResult ? JSON.stringify(previousResult, null, 2) : "None"}
`;

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: prompt }];
    for (const attachment of attachments as IntakeAttachment[]) {
      const match = attachment.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json" },
    });

    if (!response.text) throw new Error("Gemini returned an empty response.");
    const result: unknown = JSON.parse(response.text);

    if (!isIntakeResult(result)) {
      throw new Error("Gemini returned an invalid intake response.");
    }

    if (result.status === "ready" && result.clarificationQuestions.length > 0) {
      result.status = "needs_clarification";
    }

    return NextResponse.json(enforceReadiness(result));
  } catch (error) {
    console.error("Intake API error:", error);
    return NextResponse.json(
      {
        error: "The Oracle could not analyze this intake.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
