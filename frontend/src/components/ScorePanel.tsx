import type { ScoreData, Weights } from "../types/shared";

interface Props {
  scoreData: ScoreData;
  weights: Weights;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function ringColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#fbbf24";
  return "#f87171";
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg viewBox="0 0 128 128" className="w-36 h-36">
      <circle cx="64" cy="64" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke={ringColor(score)}
        strokeWidth="12"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x="64"
        y="64"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-bold"
        style={{ fill: ringColor(score), fontSize: 28, fontWeight: 700 }}
      >
        {score}
      </text>
    </svg>
  );
}

export function ScorePanel({ scoreData, weights }: Props) {
  const { total_score, breakdown, matched_skills, gap_skills, transferable_gaps } = scoreData;

  const rows = [
    { label: "Skills Match", key: "skills" as const, weight: weights.skills },
    { label: "Experience", key: "experience" as const, weight: weights.experience },
    { label: "Education", key: "education" as const, weight: weights.education },
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-slate-200">Match Score</h2>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={total_score} />
          <span className={`text-sm font-semibold ${scoreColor(total_score)}`}>
            {total_score >= 80 ? "Strong Match" : total_score >= 60 ? "Good Match" : "Partial Match"}
          </span>
        </div>

        <div className="flex-1 w-full space-y-3">
          {rows.map(({ label, key }) => {
            const item = breakdown[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{label} ({item.weight}%)</span>
                  <span className={scoreColor(item.score)}>{item.score}/100</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.score}%`,
                      backgroundColor: ringColor(item.score),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Matched Skills</p>
          <div className="flex flex-wrap gap-1">
            {matched_skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Skill Gaps</p>
          <div className="flex flex-wrap gap-1">
            {gap_skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded bg-red-900/50 text-red-300 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Bridgeable Gaps</p>
          <div className="flex flex-wrap gap-1">
            {transferable_gaps.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
