import { useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import type { GraphData } from "../types/shared";

interface Props {
  graphData: GraphData;
}

const NODE_COLORS = {
  matched: { background: "#166534", border: "#4ade80", highlight: { background: "#14532d", border: "#86efac" } },
  gap: { background: "#7f1d1d", border: "#f87171", highlight: { background: "#991b1b", border: "#fca5a5" } },
  candidate_only: { background: "#78350f", border: "#fb923c", highlight: { background: "#92400e", border: "#fdba74" } },
};

const NODE_SIZES: Record<string, number> = {
  beginner: 12,
  intermediate: 18,
  advanced: 24,
  expert: 32,
};

const EDGE_STYLES = {
  family: { dashes: [6, 4] as number[], color: { color: "#3b82f6", highlight: "#60a5fa" }, width: 1.5 },
  prerequisite: { dashes: false as false, arrows: { to: { enabled: true, scaleFactor: 0.7 } }, color: { color: "#a855f7", highlight: "#c084fc" }, width: 1.5 },
  transferable: { dashes: [4, 4] as number[], color: { color: "#22c55e", highlight: "#4ade80" }, width: 1.5 },
};

export function SkillGraph({ graphData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current || graphData.nodes.length === 0) return;

    networkRef.current?.destroy();

    const nodes = new DataSet(
      graphData.nodes.map((n) => ({
        id: n.id,
        label: n.label,
        title: `${n.label}\n${n.category}${n.proficiency ? `\n${n.proficiency}` : ""}`,
        color: NODE_COLORS[n.status],
        size: n.proficiency ? NODE_SIZES[n.proficiency] : 16,
        font: { color: "#e2e8f0", size: 12 },
        borderWidth: 2,
      }))
    );

    const edges = new DataSet(
      graphData.edges.map((e, i) => ({
        id: i,
        from: e.from,
        to: e.to,
        ...EDGE_STYLES[e.type],
        title: `${e.type} (strength: ${e.strength.toFixed(1)})`,
        smooth: { enabled: true, type: "curvedCW", roundness: 0.2 },
      }))
    );

    networkRef.current = new Network(
      containerRef.current,
      { nodes, edges },
      {
        physics: {
          stabilization: { iterations: 150 },
          barnesHut: { gravitationalConstant: -3000, springLength: 120 },
        },
        interaction: { hover: true, tooltipDelay: 200, zoomView: true },
        nodes: { shape: "dot" },
        edges: { smooth: { enabled: true, type: "dynamic", roundness: 0.2 } },
      }
    );

    return () => {
      networkRef.current?.destroy();
      networkRef.current = null;
    };
  }, [graphData]);

  const stats = {
    matched: graphData.nodes.filter((n) => n.status === "matched").length,
    gap: graphData.nodes.filter((n) => n.status === "gap").length,
    candidate_only: graphData.nodes.filter((n) => n.status === "candidate_only").length,
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-slate-200">Skill Relationship Graph</h2>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /><span className="text-slate-400">Matched ({stats.matched})</span></span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /><span className="text-slate-400">Gap ({stats.gap})</span></span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /><span className="text-slate-400">Candidate only ({stats.candidate_only})</span></span>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-slate-400">
        <span><span className="inline-block w-4 border-t-2 border-dashed border-blue-400 mr-1 align-middle" />Family</span>
        <span><span className="inline-block w-4 border-t-2 border-purple-400 mr-1 align-middle" />→ Prerequisite</span>
        <span><span className="inline-block w-4 border-t-2 border-dashed border-green-400 mr-1 align-middle" />Transferable</span>
      </div>

      <div
        ref={containerRef}
        className="w-full rounded-lg bg-slate-900"
        style={{ height: 420 }}
      />

      <p className="text-xs text-slate-500 text-center">Drag nodes to rearrange • Scroll to zoom • Hover for details</p>
    </div>
  );
}
