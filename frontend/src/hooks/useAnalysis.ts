import { useState, useCallback, useRef } from "react";
import type {
  AnalyzeRequest,
  CVSkillsData,
  JDSkillsData,
  GraphData,
  ScoreData,
  FullReport,
} from "../types/shared";
import { streamAnalysis } from "../lib/sseClient";

export interface AnalysisState {
  statuses: string[];
  cvSkills: CVSkillsData | null;
  jdSkills: JDSkillsData | null;
  graphData: GraphData | null;
  scoreData: ScoreData | null;
  report: FullReport | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL: AnalysisState = {
  statuses: [],
  cvSkills: null,
  jdSkills: null,
  graphData: null,
  scoreData: null,
  report: null,
  isLoading: false,
  error: null,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (req: AnalyzeRequest) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ ...INITIAL, isLoading: true });

    let cvSkills: CVSkillsData | null = null;
    let jdSkills: JDSkillsData | null = null;
    let graphData: GraphData | null = null;
    let scoreData: ScoreData | null = null;

    try {
      for await (const event of streamAnalysis(req, controller.signal)) {
        if (event.type === "status") {
          setState((s) => ({ ...s, statuses: [...s.statuses, event.message] }));
        } else if (event.type === "cv_skills") {
          cvSkills = event.data;
          setState((s) => ({ ...s, cvSkills: event.data }));
        } else if (event.type === "jd_skills") {
          jdSkills = event.data;
          setState((s) => ({ ...s, jdSkills: event.data }));
        } else if (event.type === "graph") {
          graphData = event.data;
          setState((s) => ({ ...s, graphData: event.data }));
        } else if (event.type === "score") {
          scoreData = event.data;
          setState((s) => ({ ...s, scoreData: event.data }));
        } else if (event.type === "done") {
          const report: FullReport = {
            cv_skills: cvSkills!,
            jd_skills: jdSkills!,
            graph: graphData!,
            score: scoreData!,
            generated_at: new Date().toISOString(),
            weights: req.weights,
          };
          setState((s) => ({ ...s, isLoading: false, report }));
        } else if (event.type === "error") {
          setState((s) => ({ ...s, isLoading: false, error: event.message }));
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL);
  }, []);

  return { ...state, analyze, reset };
}
