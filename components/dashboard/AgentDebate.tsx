import { AnalysisResult } from "@/types/commitment";
import { Bot, CalendarRange, ShieldAlert, Wrench } from "lucide-react";

export default function AgentDebate({ analysis }: { analysis: AnalysisResult }) {
  const highestRisk = [...analysis.risks].sort((a, b) => b.riskScore - a.riskScore)[0];
  const critical = analysis.commitments.find((item) => item.id === highestRisk?.commitmentId);
  const stableId = analysis.triage.stable[0] || analysis.triage.deferred[0];
  const stable = analysis.commitments.find((item) => item.id === stableId);

  const messages = [
    {
      agent: "Planner Agent",
      icon: Bot,
      tone: "text-violet-300",
      status: "PROPOSAL",
      text: `Defer ${stable?.title || "the lowest-priority work"} and protect the critical path.`,
    },
    {
      agent: "Risk Agent",
      icon: ShieldAlert,
      tone: "text-rose-300",
      status: "OBJECTION",
      text: `${critical?.title || "The critical deadline"} is at ${highestRisk?.riskScore || 0}% risk. No new work enters its focus window.`,
    },
    {
      agent: "Scheduler Agent",
      icon: CalendarRange,
      tone: "text-amber-300",
      status: "ALTERNATIVE",
      text: "Alternative found: move flexible work and reserve a two-hour recovery buffer before submission.",
    },
    {
      agent: "Recovery Agent",
      icon: Wrench,
      tone: "text-emerald-300",
      status: "APPROVED",
      text: "Conflict resolved. New schedule generated and sent to the approval queue.",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Agent Council</p>
          <h2 className="mt-2 text-2xl font-bold">The agents disagreed. Then negotiated.</h2>
          <p className="mt-2 text-sm text-slate-400">Decision summaries from specialized agents—not hidden chain-of-thought.</p>
        </div>
        <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">CONSENSUS</span>
      </div>
      <div className="mt-6 space-y-3">
        {messages.map((message, index) => {
          const Icon = message.icon;
          return (
            <div key={message.agent} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-[150px_1fr]">
              <div className={`flex items-center gap-2 text-sm font-bold ${message.tone}`}>
                <Icon size={17} /> {message.agent}
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-600">{index + 1}. {message.status}</span>
                <p className="mt-1 text-sm leading-6 text-slate-300">{message.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
