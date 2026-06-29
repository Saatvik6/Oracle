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

    if (demoMode) {
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      const riskDelta: Record<string, number> = {
        completed: -14,
        delayed: 8,
        missed: 15,
        blocked: 11,
      };
      const delta = riskDelta[eventType] || 0;
      const risks = analysis.risks.map((risk) => {
        const riskScore = Math.max(5, Math.min(100, risk.riskScore + delta));
        return {
          ...risk,
          riskScore,
          healthStatus: (
            riskScore >= 85
              ? "collapsing"
              : riskScore >= 70
                ? "critical"
                : riskScore >= 40
                  ? "at_risk"
                  : "healthy"
          ) as typeof risk.healthStatus,
        };
      });
      const requiredReduction = eventType === "completed" ? 2 : 0;
      const availableReduction =
        eventType === "missed"
          ? availableHoursPerDay
          : eventType === "delayed"
            ? availableHoursPerDay * 0.5
            : 0;
      const capacity = {
        ...analysis.capacity,
        requiredHoursTotal: Math.max(0, analysis.capacity.requiredHoursTotal - requiredReduction),
        availableHoursRemaining: Math.max(0, analysis.capacity.availableHoursRemaining - availableReduction),
        workloadGapHours: 0,
      };
      capacity.workloadGapHours =
        Math.round((capacity.requiredHoursTotal - capacity.availableHoursRemaining) * 10) / 10;
      setAnalysis({
        ...analysis,
        risks,
        capacity,
        reasoningSteps: [
          `Demo update received: ${eventType}.`,
          "Risk, capacity, and the rescue timeline were recalculated locally.",
          ...analysis.reasoningSteps,
        ],
      });
      setLoading(false);
      return;
    }

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
    <main className="oracle-backdrop min-h-screen bg-[#0c0e13] text-[#f4f1ff]">
      {loading && <OracleLoading />}
      <div className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <nav className="flex h-20 items-center justify-between border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center bg-[#7f77dd] text-sm font-black text-white">O</div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">ORACLE</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9a94d9]">AI Chief of Staff</p>
            </div>
          </div>
          {analysis ? (
            <button
              type="button"
              onClick={startNewIntake}
              className="border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-[border-color,color,transform] duration-200 hover:border-[#7f77dd] hover:text-white active:scale-95"
            >
              New intake
            </button>
          ) : (
            <button
              type="button"
              onClick={loadDemoScenario}
              disabled={loading}
              className="px-1 py-2 text-sm font-medium text-slate-400 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-200 hover:text-white active:scale-95 disabled:opacity-50"
            >
              Open the offline demo
            </button>
          )}
        </nav>

        {!analysis ? (
          <section className="pb-10 pt-14 md:pt-20">
            <div className="grid items-end gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b94e3]">Before your day starts</p>
                <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white md:text-7xl">
                  Hand over the mess.<br />Keep the decisions.
                </h1>
              </div>
              <div className="border-l border-[#7f77dd]/40 pl-5 lg:mb-2">
                <p className="text-lg leading-8 text-slate-300">
                  Oracle investigates vague commitments before they become broken promises.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Talk, type, or drop in the files. Your Chief of Staff will ask what matters and prepare the plan.
                </p>
              </div>
            </div>

            <div className="mt-12 md:mt-16">
              <OracleIntakeChat key={intakeKey} onReady={generateReport} />
            </div>

            <div className="grid border-b border-white/[0.07] py-7 text-xs text-slate-500 sm:grid-cols-3">
              <p><span className="mr-2 text-[#8f87df]">01</span>Scope challenged before scheduling</p>
              <p><span className="mr-2 text-[#8f87df]">02</span>Risk calculated against real capacity</p>
              <p><span className="mr-2 text-[#8f87df]">03</span>Actions wait for your approval</p>
            </div>
          </section>
        ) : (
          <section className="space-y-6 pt-10">
            <AnimatedSection><ExecutiveBrief analysis={analysis} /></AnimatedSection>
            {demoMode && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-emerald-800/50 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
                <span><strong>Offline demo.</strong> Static scenario, zero Gemini calls.</span>
                <span className="text-xs font-semibold uppercase tracking-wider">Presentation safe</span>
              </div>
            )}

            <AnimatedSection delay={0.02}><RescuePlanPanel rescuePlan={analysis.rescuePlan} analysis={analysis} /></AnimatedSection>
            <AnimatedSection delay={0.04}><ApprovalQueue analysis={analysis} simulationOnly={demoMode} /></AnimatedSection>
            <AnimatedSection delay={0.06}><CalendarPlanner analysis={analysis} /></AnimatedSection>
            <AnimatedSection delay={0.08}><ScheduleChat analysis={analysis} demoMode={demoMode} /></AnimatedSection>
            <AnimatedSection delay={0.1}><AdaptiveReplanner analysis={analysis} onReplan={replanCommitments} loading={loading} demoMode={demoMode} /></AnimatedSection>

            <AnimatedSection delay={0.12}><WorkloadHeatmap analysis={analysis} /></AnimatedSection>
            <DashboardCharts analysis={analysis} />
            <AnimatedSection delay={0.14}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <CollisionMap analysis={analysis} />
                <RiskDashboard analysis={analysis} />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.16}><RiskSimulator analysis={analysis} /></AnimatedSection>

            <AnimatedSection delay={0.18}><AgentDebate analysis={analysis} /></AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <TriageBoard analysis={analysis} />
                <FutureTimeline analysis={analysis} />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.22}>
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2"><WorkBreakdownPanel commitments={analysis.workloadAnalysis ?? []} /></div>
                <div className="space-y-6">
                  <ConfidencePanel commitments={analysis.workloadAnalysis ?? []} />
                  <DashboardStats analysis={analysis} />
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.24}><ScopePanel commitments={analysis.workloadAnalysis ?? []} /></AnimatedSection>

            <AnimatedSection delay={0.26}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <AIActivityFeed steps={analysis.reasoningSteps} />
                <AgentStatusCards />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.28}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <AIReasoningPanel steps={analysis.reasoningSteps} />
                <AgentPipeline />
              </div>
            </AnimatedSection>
          </section>
        )}
      </div>
    </main>
  );
}
