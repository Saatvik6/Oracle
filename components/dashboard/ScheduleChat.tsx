"use client";

import { useState } from "react";
import { AnalysisResult, ChatMessage } from "@/types/commitment";

interface Props {
  analysis: AnalysisResult;
}

const suggestedQuestions = [
  "What should I do first?",
  "Can I finish everything on time?",
  "What happens if I miss tomorrow?",
  "Which task is the biggest bottleneck?",
];

export default function ScheduleChat({ analysis }: Props) {
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

        <span className="text-xs text-cyan-400 font-bold border border-cyan-400/40 rounded-full px-3 py-1">
          LIVE
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {suggestedQuestions.map((item) => (
          <button
            key={item}
            onClick={() => askQuestion(item)}
            className="text-xs bg-slate-950 border border-slate-700 hover:border-cyan-400 rounded-full px-3 py-2 text-slate-300 transition"
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
                ? "bg-cyan-400 text-slate-950 ml-8"
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
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400"
        />

        <button
          onClick={() => askQuestion()}
          disabled={loading || !question.trim()}
          className="bg-cyan-400 text-slate-950 font-semibold px-5 py-3 rounded-xl disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </section>
  );
}