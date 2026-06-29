interface Props {
  steps: string[];
}

export default function AIReasoningPanel({ steps }: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">AI Reasoning Panel</h2>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300"
          >
            <span className="text-cyan-400">✓</span> {step}
          </div>
        ))}
      </div>
    </section>
  );
}