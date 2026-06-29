"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Send, Sparkles } from "lucide-react";
import {
  ChatMessage,
  ClarificationQuestion,
  IntakeResult,
  IntakeState,
} from "@/types/intake";

interface Props {
  onReady: (data: IntakeResult) => void | Promise<void>;
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "oracle",
  content:
    "Tell me everything competing for your attention—assignments, projects, deadlines, available time, blockers. A messy brain-dump is perfect.",
  timestamp: new Date().toISOString(),
};

export default function OracleIntakeChat({ onReady }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [state, setState] = useState<IntakeState>("collecting_commitments");
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [latestResult, setLatestResult] = useState<IntakeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const progress = useMemo(() => {
    if (state === "ready_to_generate" || state === "report_generated") return 100;
    if (state === "asking_clarifications") return 68;
    if (state === "analyzing_scope") return 45;
    return messages.length > 1 ? 28 : 12;
  }, [messages.length, state]);

  async function submitContent(content: string) {
    const cleanContent = content.trim();
    if (!cleanContent || loading || generating) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanContent,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setQuestions([]);
    setError("");
    setLoading(true);
    setState("analyzing_scope");

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Intake analysis failed.");

      const result = data as IntakeResult;
      setLatestResult(result);
      setQuestions(result.clarificationQuestions || []);
      setState(
        result.status === "ready" ? "ready_to_generate" : "asking_clarifications"
      );
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "oracle",
          content: result.oracleMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (caught) {
      setState("collecting_commitments");
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submitContent(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitContent(input);
    }
  }

  function answerQuestion(question: ClarificationQuestion, answer: string) {
    void submitContent(`${question.question}\nAnswer: ${answer}`);
  }

  async function generateReport() {
    if (!latestResult || latestResult.status !== "ready") return;
    setGenerating(true);
    setError("");
    try {
      await onReady(latestResult);
      setState("report_generated");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Report generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="border-b border-slate-800 px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Oracle Intake</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">Let’s untangle the workload.</h2>
            <p className="mt-1 text-sm text-slate-400">
              I’ll investigate the details that materially change your plan.
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
            {state === "ready_to_generate" ? "Ready" : "Intake in progress"}
          </span>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-h-[52vh] min-h-[340px] space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                message.role === "oracle"
                  ? "rounded-tl-sm border border-cyan-900/70 bg-cyan-950/40 text-cyan-50"
                  : "rounded-tr-sm bg-violet-600 text-white"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {questions.map((question) => (
          <div key={question.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {question.impact} impact
              </span>
              <span className="text-xs text-slate-500">{question.reason}</span>
            </div>
            <p className="mt-3 text-sm font-medium leading-6 text-white">{question.question}</p>
            {!!question.options?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={loading}
                    onClick={() => answerQuestion(question, option)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Loader2 className="animate-spin text-cyan-400" size={18} />
            Checking scope, effort, deadlines, and hidden blockers…
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950/60 p-5 sm:p-7">
        {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

        {state === "ready_to_generate" ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <div>
                <p className="text-sm font-semibold text-white">The workload is clear enough to model.</p>
                <p className="mt-1 text-xs text-slate-400">
                  {latestResult?.commitmentsDraft.length || 0} commitments extracted and checked.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={generateReport}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {generating ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />}
              {generating ? "Building report…" : "Generate intelligence report"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || generating}
              rows={3}
              placeholder={
                questions.length
                  ? "Answer in your own words, or choose an option above…"
                  : "Example: Hackathon Sunday, chemistry assignment tomorrow, 4 hours free tonight…"
              }
              className="min-h-24 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || generating}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 sm:self-end"
            >
              <Send size={16} /> Send
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
