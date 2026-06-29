"use client";

import { motion } from "framer-motion";

const loadingAgents = [
  "Parser Agent",
  "Risk Agent",
  "Collision Agent",
  "Rescue Agent",
  "Replanner Agent",
  "Explainer Agent",
];

export default function OracleLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />

          <div>
            <h2 className="text-2xl font-bold">
              Oracle is running agentic analysis...
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Parsing commitments, predicting failures, detecting collisions,
              and generating a rescue plan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-7">
          {loadingAgents.map((agent, index) => (
            <motion.div
              key={agent}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: [0.25, 1, 0.45] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: index * 0.18,
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{agent}</p>
                <span className="text-xs text-cyan-400 font-bold">
                  RUNNING
                </span>
              </div>

              <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.18,
                  }}
                  className="h-full w-1/2 bg-cyan-400"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}