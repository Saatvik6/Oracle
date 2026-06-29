"use client";

import { motion } from "framer-motion";
import { AnalysisResult } from "@/types/commitment";
import {
  formatHealthStatus,
  getCommitmentHealthScore,
  getWorstHealthStatus,
} from "@/lib/engine/dashboardMetrics";

interface Props {
  analysis: AnalysisResult;
}

export default function HealthScoreGauge({ analysis }: Props) {
  const score = getCommitmentHealthScore(analysis);
  const status = getWorstHealthStatus(analysis);

  return (
    <section className="bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6">
      <p className="text-sm text-cyan-400 font-semibold">
        Commitment Health
      </p>

      <div className="flex items-end justify-between mt-4">
        <div>
          <h2 className="text-5xl font-bold">{score}</h2>
          <p className="text-slate-500 text-sm mt-1">out of 100</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400">Status</p>
          <p className="text-xl font-bold text-cyan-400">
            {formatHealthStatus(status)}
          </p>
        </div>
      </div>

      <div className="mt-6 h-3 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8 }}
        className="h-full bg-cyan-400"
        />
      </div>

      <p className="text-sm text-slate-400 mt-4">
        Lower health means your current commitments are more likely to collapse
        without intervention.
      </p>
    </section>
  );
}