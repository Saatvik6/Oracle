const agents = [
  {
    name: "Parser Agent",
    description: "Extracted commitments",
  },
  {
    name: "Risk Agent",
    description: "Predicted deadline failure",
  },
  {
    name: "Collision Agent",
    description: "Detected workload conflicts",
  },
  {
    name: "Triage Agent",
    description: "Assigned urgency buckets",
  },
  {
    name: "Rescue Agent",
    description: "Generated recovery plan",
  },
  {
    name: "Replanning Agent",
    description: "Ready for adaptive updates",
  },
];

export default function AgentStatusCards() {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">AI Agent System</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{agent.name}</h3>
              <span className="text-xs text-violet-400 font-bold">ACTIVE</span>
            </div>

            <p className="text-sm text-slate-400 mt-2">
              {agent.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}