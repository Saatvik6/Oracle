export default function EmptyState() {
  const items = [
    "Paste messy commitments",
    "Gemini extracts deadlines and effort",
    "Oracle predicts failure risk",
    "AI generates a rescue plan",
  ];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold">How Deadline Oracle works</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {items.map((item, index) => (
          <div
            key={item}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4"
          >
            <p className="text-violet-400 font-bold">0{index + 1}</p>
            <p className="text-sm text-slate-300 mt-3">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}