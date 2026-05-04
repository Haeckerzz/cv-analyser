import { z } from "zod";

// ─── Stage 1: CV Skills ───────────────────────────────────────────────────────

export const SkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  proficiency: z.preprocess(
    (v) => String(v || "beginner").toLowerCase().trim(),
    z.enum(["beginner", "intermediate", "advanced", "expert"])
  ),
  years_experience: z.coerce.number().nullable().catch(null),
  context: z.string(),
});
export type Skill = z.infer<typeof SkillSchema>;

export const CVSkillsDataSchema = z.object({
  skills: z.array(SkillSchema),
  experience_years: z.coerce.number().catch(0),
  education: z.string(),
});
export type CVSkillsData = z.infer<typeof CVSkillsDataSchema>;

// ─── Stage 2: JD Skills ──────────────────────────────────────────────────────

export const JDSkillsDataSchema = z.object({
  required_skills: z.array(z.string()),
  nice_to_have_skills: z.array(z.string()),
  experience_required_years: z.coerce.number().catch(0),
  education_required: z.string(),
});
export type JDSkillsData = z.infer<typeof JDSkillsDataSchema>;

// ─── Stage 3: Skill Graph ─────────────────────────────────────────────────────

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.string(),
  proficiency: z.preprocess(
    (v) => (v ? String(v).toLowerCase().trim() : null),
    z.enum(["beginner", "intermediate", "advanced", "expert"]).nullable()
  ),
  status: z.enum(["matched", "gap", "candidate_only"]),
});
export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(["family", "prerequisite", "transferable"]),
  strength: z.number().min(0).max(1),
});
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export type GraphData = z.infer<typeof GraphDataSchema>;

// ─── Stage 4: Score + Recommendations ────────────────────────────────────────

export const ScoreBreakdownItemSchema = z.object({
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(100),
  weighted: z.number().min(0).max(100),
});

export const RecommendationSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  action: z.string(),
  reasoning: z.string(),
  estimated_time: z.string(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const ScoreDataSchema = z.object({
  total_score: z.number().min(0).max(100),
  breakdown: z.object({
    skills: ScoreBreakdownItemSchema,
    experience: ScoreBreakdownItemSchema,
    education: ScoreBreakdownItemSchema,
  }),
  matched_skills: z.array(z.string()),
  gap_skills: z.array(z.string()),
  transferable_gaps: z.array(z.string()),
  recommendations: z.array(RecommendationSchema),
});
export type ScoreData = z.infer<typeof ScoreDataSchema>;

// ─── SSE Event Protocol ───────────────────────────────────────────────────────

export type SSEEvent =
  | { type: "status"; message: string }
  | { type: "cv_skills"; data: CVSkillsData }
  | { type: "jd_skills"; data: JDSkillsData }
  | { type: "graph"; data: GraphData }
  | { type: "score"; data: ScoreData }
  | { type: "done" }
  | { type: "error"; message: string };

// ─── API Request ──────────────────────────────────────────────────────────────

export const WeightsSchema = z.object({
  skills: z.number().min(0).max(100),
  experience: z.number().min(0).max(100),
  education: z.number().min(0).max(100),
});
export type Weights = z.infer<typeof WeightsSchema>;

export const AnalyzeRequestSchema = z.object({
  cv_text: z.string().min(50, "CV text must be at least 50 characters"),
  jd_text: z.string().min(20, "Job description must be at least 20 characters"),
  weights: WeightsSchema.refine(
    (w) => Math.abs(w.skills + w.experience + w.education - 100) < 0.5,
    { message: "Weights must sum to 100" },
  ),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// ─── Full Report (JSON download) ──────────────────────────────────────────────

export interface FullReport {
  cv_skills: CVSkillsData;
  jd_skills: JDSkillsData;
  graph: GraphData;
  score: ScoreData;
  generated_at: string;
  weights: Weights;
}
