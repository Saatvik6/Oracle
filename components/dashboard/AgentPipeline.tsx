"use client";

import { motion } from "framer-motion";

const agents = [
  {
    name: "Parser Agent",
    role: "Extracts commitments",
  },
  {
    name: "Risk Agent",
    role: "Predicts failure probability",
  },
  {
    name: "Collision Agent",
    role: "Finds workload conflicts",
  },
  {
    name: "Rescue Agent",
    role: "Builds recovery strategy",
  },
  {
    name: "Replanner Agent",
    role: "Adapts when plans change",
  },
  {
    name: "Explainer Agent",
    role: "Explains AI decisions",
  },
];

export default function AgentPipeline() {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold">Agentic Workflow</h2>
          <p className="text-sm text-slate-400 mt-1">
            Specialized AI agents collaborate to diagnose and rescue your schedule.
          </p>
        </div>

        <span className="text-xs text-violet-400 font-bold border border-violet-400/40 rounded-full px-3 py-1">
          ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-slate-950 border border-slate-800 rounded-xl p-4"
          >
            <div className="h-8 w-8 rounded-full bg-violet-400/10 border border-violet-400/40 flex items-center justify-center text-violet-400 text-sm font-bold">
              {index + 1}
            </div>

            <h3 className="font-semibold mt-4">{agent.name}</h3>
            <p className="text-xs text-slate-400 mt-2">{agent.role}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs text-violet-400 font-semibold">
                Complete
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}