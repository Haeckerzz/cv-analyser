import type { Recommendation } from "../types/shared";

interface Props {
  recommendations: Recommendation[];
}

const PRIORITY_STYLE = {
  high: { badge: "bg-red-900/60 text-red-300", border: "border-red-800/50" },
  medium: { badge: "bg-amber-900/60 text-amber-300", border: "border-amber-800/50" },
  low: { badge: "bg-slate-700 text-slate-300", border: "border-slate-700" },
};

export function RecommendationList({ recommendations }: Props) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-200">Recommendations</h2>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const style = PRIORITY_STYLE[rec.priority];
          return (
            <div key={i} className={`rounded-lg border p-4 space-y-2 ${style.border} bg-slate-900/40`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-200">{rec.action}</p>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium uppercase ${style.badge}`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400">{rec.reasoning}</p>
              <p className="text-xs text-slate-500">⏱ {rec.estimated_time}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
