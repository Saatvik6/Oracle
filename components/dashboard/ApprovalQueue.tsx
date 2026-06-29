"use client";

import { useMemo, useState } from "react";
import { AnalysisResult } from "@/types/commitment";
import { Check, CheckCheck, ChevronDown, Loader2, ShieldCheck } from "lucide-react";

type ActionStatus = "pending" | "executing" | "approved";

interface ApprovalAction {
  id: string;
  title: string;
  detail: string;
  calendar: boolean;
  start?: string;
  end?: string;
}

export default function ApprovalQueue({
  analysis,
  simulationOnly = false,
}: {
  analysis: AnalysisResult;
  simulationOnly?: boolean;
}) {
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>({});
  const [executing, setExecuting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  const riskBefore = Math.max(...analysis.risks.map((risk) => risk.riskScore), 0);
  const riskAfter = Math.max(12, riskBefore - 60);

  const actions = useMemo<ApprovalAction[]>(() => {
    const highestRisk = [...analysis.risks].sort((a, b) => b.riskScore - a.riskScore)[0];
    const primary = analysis.commitments.find((item) => item.id === highestRisk?.commitmentId)
      || analysis.commitments[0];
    const deferrableId = analysis.triage.deferred[0] || analysis.triage.stable[0];
    const deferrable = analysis.commitments.find((item) => item.id === deferrableId);
    const deadline = primary?.deadline ? new Date(primary.deadline) : new Date("2026-07-01T18:00:00");
    const focusStart = new Date(deadline.getTime() - 6 * 60 * 60 * 1000);
    const focusEnd = new Date(focusStart.getTime() + 2 * 60 * 60 * 1000);
    const bufferStart = new Date(deadline.getTime() - 2 * 60 * 60 * 1000);

    return [
      {
        id: "split-primary",
        title: `Split ${primary?.title || "critical work"} into execution sprints`,
        detail: `${analysis.workloadAnalysis?.find((item) => item.id === primary?.id)?.workUnits.length || 4} focused work units prepared.`,
        calendar: false,
      },
      {
        id: "focus-block",
        title: `Block a protected focus session for ${primary?.title || "the critical deadline"}`,
        detail: "Two hours protected from lower-priority commitments.",
        calendar: true,
        start: focusStart.toISOString(),
        end: focusEnd.toISOString(),
      },
      {
        id: "defer-work",
        title: deferrable ? `Defer ${deferrable.title}` : "Defer the lowest-impact commitment",
        detail: "Releases capacity without putting the nearest deadline at risk.",
        calendar: false,
      },
      {
        id: "deadline-buffer",
        title: "Reserve a final submission buffer",
        detail: "Protect the last two hours for verification, recovery, and submission.",
        calendar: true,
        start: bufferStart.toISOString(),
        end: deadline.toISOString(),
      },
    ];
  }, [analysis]);

  async function executeAction(action: ApprovalAction, canUseCalendar: boolean) {
    setStatuses((current) => ({ ...current, [action.id]: "executing" }));

    if (action.calendar && canUseCalendar && !simulationOnly && action.start && action.end) {
      const response = await fetch("/api/google-calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Oracle: ${action.title}`,
          description: action.detail,
          start: action.start,
          end: action.end,
        }),
      });
      if (!response.ok) setCalendarConnected(false);
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    }

    setStatuses((current) => ({ ...current, [action.id]: "approved" }));
  }

  async function approveAll() {
    setExecuting(true);
    try {
      let canUseCalendar = false;
      const statusResponse = await fetch("/api/google-calendar/status");
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        canUseCalendar = Boolean(status.connected);
        setCalendarConnected(canUseCalendar);
      }
      for (const action of actions) await executeAction(action, canUseCalendar);
      setCompleted(true);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-violet-500/30 bg-slate-900 p-6 shadow-xl shadow-violet-950/20 md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">AI Approval Queue</p>
          <h2 className="mt-2 text-2xl font-bold">Oracle is ready to act.</h2>
          <p className="mt-2 text-sm text-slate-400">Review the interventions your Chief of Staff prepared.</p>
        </div>
        {!completed && (
          <button
            type="button"
            onClick={approveAll}
            disabled={executing}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-400 disabled:opacity-60"
          >
            {executing ? <Loader2 className="animate-spin" size={17} /> : <CheckCheck size={17} />}
            {executing ? "Executing…" : "Approve all"}
          </button>
        )}
      </div>

      <div className="mt-6 divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        {actions.map((action) => {
          const status = statuses[action.id] || "pending";
          return (
            <div key={action.id} className="flex items-start gap-4 p-4">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${status === "approved" ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-slate-700 text-slate-500"}`}>
                {status === "executing" ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">{action.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{action.detail}</p>
              </div>
              <ChevronDown className="mt-1 shrink-0 text-slate-700" size={16} />
            </div>
          );
        })}
      </div>

      {completed && (
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck size={19} />
            <p className="font-bold">Plan executed</p>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div><p className="text-xs text-slate-500">Risk before</p><p className="text-3xl font-bold text-rose-300">{riskBefore}%</p></div>
            <div className="text-2xl text-slate-600">→</div>
            <div><p className="text-xs text-slate-500">Projected risk</p><p className="text-3xl font-bold text-emerald-300">{riskAfter}%</p></div>
          </div>
          <p className="mt-4 text-xs text-emerald-200/80">
            ✓ Sprint created &nbsp; ✓ Timeline recalculated &nbsp; ✓ Focus blocks {calendarConnected && !simulationOnly ? "added to Google Calendar" : "simulated"}
          </p>
        </div>
      )}
    </section>
  );
}
