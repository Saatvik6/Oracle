"use client";

import { useEffect, useState } from "react";
import { AnalysisResult } from "@/types/commitment";
import { CalendarCheck, ExternalLink, Link2, Unlink } from "lucide-react";

interface CalendarStatus {
  configured: boolean;
  connected: boolean;
}

export default function CalendarPlanner({ analysis }: { analysis: AnalysisResult }) {
  const [status, setStatus] = useState<CalendarStatus>({ configured: false, connected: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/google-calendar/status")
      .then((response) => response.json())
      .then((data) => setStatus(data as CalendarStatus))
      .finally(() => setLoaded(true));
  }, []);

  async function disconnect() {
    await fetch("/api/google-calendar/disconnect", { method: "POST" });
    setStatus((current) => ({ ...current, connected: false }));
  }

  const blocks = (analysis.workloadAnalysis || [])
    .flatMap((commitment) =>
      commitment.workUnits.slice(0, 2).map((unit) => ({
        id: `${commitment.id}-${unit.title}`,
        title: unit.title,
        commitment: commitment.title,
        minutes: unit.estimatedMinutes,
      }))
    )
    .slice(0, 5);

  return (
    <section className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900 p-6 md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-300">
            <CalendarCheck size={18} />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Google Calendar Planner</p>
          </div>
          <h2 className="mt-2 text-2xl font-bold">Turn approved decisions into time blocks.</h2>
          <p className="mt-2 text-sm text-slate-400">Oracle prepares the events. You approve before anything is written.</p>
        </div>
        {loaded && status.configured && !status.connected && (
          <a
            href="/api/google-calendar/auth"
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            <Link2 size={16} /> Connect Calendar
          </a>
        )}
        {status.connected && (
          <button
            type="button"
            onClick={disconnect}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-500/40 px-4 py-2.5 text-sm font-semibold text-emerald-300"
          >
            <Unlink size={15} /> Connected
          </button>
        )}
      </div>

      {!status.configured && loaded && (
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Calendar preview is active. Add Google OAuth credentials to enable real event creation.
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {blocks.map((block, index) => (
          <div key={block.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-blue-300">BLOCK {index + 1}</span>
              <span className="text-xs text-slate-500">{block.minutes} min</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-100">{block.title}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{block.commitment}</p>
          </div>
        ))}
      </div>

      {status.connected && (
        <p className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
          <ExternalLink size={13} /> Approved calendar actions will be created in your primary Google Calendar.
        </p>
      )}
    </section>
  );
}
