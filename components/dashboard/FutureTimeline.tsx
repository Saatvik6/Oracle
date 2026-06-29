import { AnalysisResult } from "@/types/commitment";

interface Props {
  analysis: AnalysisResult;
}

export default function FutureTimeline({ analysis }: Props) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Future Failure Timeline</h2>

      <div className="space-y-4">
        {analysis.timeline.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-cyan-400" />
              {index !== analysis.timeline.length - 1 && (
                <div className="w-px flex-1 bg-slate-700 mt-2" />
              )}
            </div>

            <div className="pb-5">
              <p className="text-xs uppercase text-cyan-400 font-bold">
                {event.type}
              </p>
              <h3 className="font-semibold mt-1">{event.title}</h3>
              <p className="text-sm text-slate-400 mt-1">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-sm text-slate-300 mt-2">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}