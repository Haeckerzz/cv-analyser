import { useState, useCallback } from "react";
import type { Weights } from "../types/shared";

const DEFAULT_WEIGHTS: Weights = { skills: 60, experience: 25, education: 15 };

export function useWeights() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);

  const setWeight = useCallback((key: keyof Weights, value: number) => {
    setWeights((prev) => {
      const clamped = Math.max(0, Math.min(100, value));
      const remaining = 100 - clamped;
      const others = (["skills", "experience", "education"] as const).filter(
        (k) => k !== key
      );
      const otherSum = prev[others[0]] + prev[others[1]];

      let a: number, b: number;
      if (otherSum === 0) {
        a = Math.round(remaining / 2);
        b = remaining - a;
      } else {
        a = Math.round((prev[others[0]] / otherSum) * remaining);
        b = remaining - a;
      }

      return { ...prev, [key]: clamped, [others[0]]: a, [others[1]]: b };
    });
  }, []);

  return { weights, setWeight };
}
