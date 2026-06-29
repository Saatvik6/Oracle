"use client";

import { motion } from "framer-motion";

interface Props {
  steps: string[];
}

export default function AIActivityFeed({ steps }: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Live AI Activity</h2>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12 }}
            className="flex items-start gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3"
          >
            <div className="mt-1 h-2 w-2 rounded-full bg-violet-400" />
            <p className="text-sm text-slate-300">{step}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}