"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/commitment";
import { IntakeResult } from "@/types/intake";
import OracleIntakeChat from "@/components/intake/OracleIntakeChat";
import TriageBoard from "@/components/dashboard/TriageBoard";
import RiskDashboard from "@/components/dashboard/RiskDashboard";
import CollisionMap from "@/components/dashboard/CollisionMap";
import RescuePlanPanel from "@/components/dashboard/RescuePlanPanel";
import AIReasoningPanel from "@/components/dashboard/AIReasoningPanel";
import FutureTimeline from "@/components/dashboard/FutureTimeline";
import AdaptiveReplanner from "@/components/dashboard/AdaptiveReplanner";
import HealthScoreGauge from "@/components/dashboard/HealthScoreGauge";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AgentStatusCards from "@/components/dashboard/AgentStatusCards";
import AIActivityFeed from "@/components/dashboard/AIActivityFeed";
import ScheduleChat from "@/components/dashboard/ScheduleChat";
import ExecutiveBrief from "@/components/dashboard/ExecutiveBrief";
import RiskSimulator from "@/components/dashboard/RiskSimulator";
import WorkloadHeatmap from "@/components/dashboard/WorkloadHeatmap";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import WorkBreakdownPanel from "@/components/dashboard/WorkBreakdownPanel";
import ConfidencePanel from "@/components/dashboard/ConfidencePanel";
import ScopePanel from "@/components/dashboard/ScopePanel";
import ApprovalQueue from "@/components/dashboard/ApprovalQueue";
import AgentDebate from "@/components/dashboard/AgentDebate";
import CalendarPlanner from "@/components/dashboard/CalendarPlanner";
import AgentPipeline from "@/components/dashboard/AgentPipeline";
import AnimatedSection from "@/components/ui/AnimatedSection";
import OracleLoading from "@/components/ui/OracleLoading";
import { normalizeAnalysis } from "@/lib/engine/normalizeAnalysis";

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(5);
  const [intakeKey, setIntakeKey] = useState(0);
  const [demoMode, setDemoMode] = useState(false);

  async function generateReport(intake: IntakeResult) {
    setLoading(true);
    const dailyHours = Math.max(1, Number(intake.availability.hoursPerDay || 5));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to generate the report.");

      setAvailableHoursPerDay(dailyHours);
      setAnalysis(normalizeAnalysis(data as AnalysisResult, { availableHoursPerDay: dailyHours }));
    } finally {
      setLoading(false);
    }
  }

  async function replanCommitments(eventType: string) {
    if (!analysis) return;
    setLoading(true);

    try {
      const response = await fetch("/api/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousAnalysis: analysis, eventType }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to replan commitments.");

      setAnalysis(
        normalizeAnalysis(data as AnalysisResult, {
          availableHoursPerDay,
          previousAnalysis: analysis,
          eventType,
        })
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDemoScenario() {
    setLoading(true);
    try {
      const response = await fetch("/api/demo-seed");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load the demo scenario.");

      setAvailableHoursPerDay(6);
      setDemoMode(true);
      setAnalysis(data as AnalysisResult);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to load the demo.");
    } finally {
      setLoading(false);
    }
  }

  function startNewIntake() {
    setAnalysis(null);
    setDemoMode(false);
    setIntakeKey((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white md:p-8">
      {loading && <OracleLoading />}
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-400">Oracle · AI Chief of Staff</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-bold md:text-5xl">
              {analysis ? "Your Chief of Staff has a plan." : "Your AI Chief of Staff."}
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              {analysis
                ? "Scope, capacity, risk, and rescue actions—built from a clarified understanding of your commitments."
                : "I investigate your commitments, negotiate conflicts, and prepare the decisions that protect your day."}
            </p>
          </div>
          {analysis ? (
            <button
              type="button"
              onClick={startNewIntake}
              className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Start new intake
            </button>
          ) : (
            <button
              type="button"
              onClick={loadDemoScenario}
              disabled={loading}
              className="shrink-0 rounded-lg border border-cyan-500/60 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
            >
              Load offline demo
            </button>
          )}
        </header>

        {!analysis ? (
          <div className="mx-auto max-w-4xl">
            <OracleIntakeChat key={intakeKey} onReady={generateReport} />
          </div>
        ) : (
          <section className="space-y-6">
            {demoMode && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-800/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
                <span><strong>Offline demo:</strong> static scenario loaded with zero Gemini calls.</span>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold">Presentation safe</span>
              </div>
            )}
            <AnimatedSection>
              <ExecutiveBrief analysis={analysis} />
            </AnimatedSection>

            <AnimatedSection delay={0.03}>
              <ApprovalQueue analysis={analysis} simulationOnly={demoMode} />
            </AnimatedSection>

            <AnimatedSection delay={0.04}>
              <AgentDebate analysis={analysis} />
            </AnimatedSection>

            <AnimatedSection delay={0.045}>
              <CalendarPlanner analysis={analysis} />
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <ScopePanel commitments={analysis.workloadAnalysis ?? []} />
            </AnimatedSection>

            <AnimatedSection delay={0.07}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <WorkBreakdownPanel commitments={analysis.workloadAnalysis ?? []} />
                </div>
                <ConfidencePanel commitments={analysis.workloadAnalysis ?? []} />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.09}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <HealthScoreGauge analysis={analysis} />
                <div className="xl:col-span-2">
                  <DashboardStats analysis={analysis} />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.11}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <AgentStatusCards />
                <AIActivityFeed steps={analysis.reasoningSteps} />
              </div>
            </AnimatedSection>

            {!demoMode && <AnimatedSection delay={0.13}><ScheduleChat analysis={analysis} /></AnimatedSection>}
            <AnimatedSection delay={0.15}><RiskSimulator analysis={analysis} /></AnimatedSection>
            <AnimatedSection delay={0.17}><WorkloadHeatmap analysis={analysis} /></AnimatedSection>
            <DashboardCharts analysis={analysis} />

            <AnimatedSection delay={0.19}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <TriageBoard analysis={analysis} />
                <RiskDashboard analysis={analysis} />
                <FutureTimeline analysis={analysis} />
                {!demoMode && <AdaptiveReplanner analysis={analysis} onReplan={replanCommitments} loading={loading} />}
                <CollisionMap analysis={analysis} />
                <RescuePlanPanel rescuePlan={analysis.rescuePlan} />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.21}><AIReasoningPanel steps={analysis.reasoningSteps} /></AnimatedSection>
            <AnimatedSection delay={0.23}><AgentPipeline /></AnimatedSection>
          </section>
        )}
      </section>
    </main>
  );
}
