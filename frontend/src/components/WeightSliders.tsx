import type { Weights } from "../types/shared";

interface Props {
  weights: Weights;
  onWeightChange: (key: keyof Weights, value: number) => void;
}

const SLIDERS: { key: keyof Weights; label: string; color: string }[] = [
  { key: "skills", label: "Skills Match", color: "accent-violet-500" },
  { key: "experience", label: "Experience", color: "accent-blue-500" },
  { key: "education", label: "Education", color: "accent-emerald-500" },
];

export function WeightSliders({ weights, onWeightChange }: Props) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Scoring Weights
        </h3>
        <span className="text-xs text-emerald-400 font-mono">
          Total: {weights.skills + weights.experience + weights.education}%
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SLIDERS.map(({ key, label, color }) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{label}</span>
              <span className="font-mono text-slate-200">{weights[key]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => onWeightChange(key, Number(e.target.value))}
              className={`w-full h-2 rounded-full bg-slate-700 ${color} cursor-pointer`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
