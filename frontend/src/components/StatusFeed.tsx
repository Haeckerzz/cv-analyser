import { useEffect, useRef } from "react";

interface Props {
  statuses: string[];
  isLoading: boolean;
}

const STAGE_ICONS: Record<string, string> = {
  "Extracting CV skills": "📄",
  "Analyzing job requirements": "🔍",
  "Building skill relationship graph": "🕸",
  "Calculating match score": "📊",
};

function getIcon(msg: string): string {
  for (const [key, icon] of Object.entries(STAGE_ICONS)) {
    if (msg.includes(key)) return icon;
  }
  return "⚡";
}

export function StatusFeed({ statuses, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [statuses]);

  if (statuses.length === 0 && !isLoading) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
        Analysis Progress
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {statuses.map((msg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
            <span>{getIcon(msg)}</span>
            <span
              className={
                i === statuses.length - 1 && isLoading
                  ? "text-violet-300 animate-pulse"
                  : "text-slate-400"
              }
            >
              {msg}
            </span>
            {i !== statuses.length - 1 || !isLoading ? (
              <span className="text-emerald-400 ml-auto">✓</span>
            ) : (
              <span className="ml-auto text-slate-500 text-xs animate-pulse">running…</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
