"use client";

import { useState } from "react";
import { AnalysisResult, ChatMessage } from "@/types/commitment";

interface Props {
  analysis: AnalysisResult;
  demoMode?: boolean;
}

const suggestedQuestions = [
  "What should I do first?",
  "Can I finish everything on time?",
  "What happens if I miss tomorrow?",
  "Which task is the biggest bottleneck?",
];

function buildDemoAnswer(analysis: AnalysisResult, question: string) {
  const highestRisk = [...analysis.risks].sort((a, b) => b.riskScore - a.riskScore)[0];
  const highestCommitment = analysis.commitments.find(
    (item) => item.id === highestRisk?.commitmentId
  );
  const normalized = question.toLowerCase();

  if (normalized.includes("first")) {
    return `Start with ${analysis.rescuePlan.orderedActions[0] || highestCommitment?.title}. It protects the nearest failure point before lower-impact work consumes the available window.`;
  }
  if (normalized.includes("finish") || normalized.includes("on time")) {
    return analysis.capacity.workloadGapHours > 0
      ? `Not without intervention. The current plan is short by ${analysis.capacity.workloadGapHours} hours. Approving the rescue plan and deferring flexible work makes the schedule viable.`
      : "Yes, the work fits the available capacity, provided the protected focus blocks remain intact.";
  }
  if (normalized.includes("miss")) {
    return `Missing tomorrow would put ${highestCommitment?.title || "the highest-risk commitment"} under immediate pressure. I would defer stable work, preserve the final review buffer, and recalculate the remaining blocks.`;
  }
  if (normalized.includes("bottleneck")) {
    return `${highestCommitment?.title || "The highest-risk commitment"} is the main bottleneck at ${highestRisk?.riskScore || 0}% risk because it combines urgency with concentrated effort.`;
  }
  return `The safest answer is to protect ${highestCommitment?.title || "the critical path"} first, then use the approval queue to move flexible work. This demo response is calculated locally from the seeded analysis.`;
}

export default function ScheduleChat({ analysis, demoMode = false }: Props) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me anything about your schedule, deadline risk, or rescue plan.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function askQuestion(input?: string) {
    const finalQuestion = input || question;

    if (!finalQuestion.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: finalQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      if (demoMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: buildDemoAnswer(analysis, finalQuestion) },
        ]);
        return;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis,
          question: finalQuestion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to answer question");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong while answering.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Chat with Your Schedule</h2>
          <p className="text-sm text-slate-400 mt-1">
            Ask what-if questions and get schedule-aware answers.
          </p>
        </div>

        <span className="text-xs text-violet-400 font-bold border border-violet-400/40 rounded-full px-3 py-1">
          {demoMode ? "SIMULATED" : "LIVE"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {suggestedQuestions.map((item) => (
          <button
            key={item}
            onClick={() => askQuestion(item)}
            className="text-xs bg-slate-950 border border-slate-700 hover:border-violet-400 rounded-full px-3 py-2 text-slate-300 transition"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 text-sm ${
              message.role === "user"
                ? "bg-violet-400 text-slate-950 ml-8"
                : "bg-slate-950 border border-slate-800 text-slate-300 mr-8"
            }`}
          >
            {message.content}
          </div>
        ))}

        {loading && (
          <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-xl p-4 text-sm mr-8">
            Thinking through your schedule...
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") askQuestion();
          }}
          placeholder="Ask: Can I go out tomorrow evening?"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
        />

        <button
          onClick={() => askQuestion()}
          disabled={loading || !question.trim()}
          className="bg-violet-400 text-slate-950 font-semibold px-5 py-3 rounded-xl disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </section>
  );
}
