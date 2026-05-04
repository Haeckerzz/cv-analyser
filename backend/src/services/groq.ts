import Groq from "groq-sdk";
import type { Response } from "express";
import { sendSSE } from "../lib/sse";
import {
  CVSkillsDataSchema,
  JDSkillsDataSchema,
  GraphDataSchema,
  ScoreDataSchema,
  type AnalyzeRequest,
  type CVSkillsData,
  type JDSkillsData,
  type GraphData,
} from "../types/shared";
import { buildStage1Prompt } from "../prompts/stage1-cv-skills";
import { buildStage2Prompt } from "../prompts/stage2-jd-skills";
import { buildStage3Prompt } from "../prompts/stage3-graph";
import { buildStage4Prompt } from "../prompts/stage4-score";

const client = new Groq();
const MODEL = "llama-3.3-70b-versatile";

type Prompt = { system: string; messages: Array<{ role: "user"; content: string }> };

async function runStage<T>(
  prompt: Prompt,
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: unknown } },
  signal: AbortSignal
): Promise<T> {
  const completion = await client.chat.completions.create(
    {
      model: MODEL,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt.system },
        ...prompt.messages,
      ],
    },
    { signal }
  );

  const raw = completion.choices[0]?.message?.content ?? "";
  const cleaned = raw
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();

  const result = schema.safeParse(JSON.parse(cleaned));
  if (!result.success) {
    throw new Error(`Schema validation failed: ${JSON.stringify(result.error)}`);
  }
  return result.data;
}

export async function runAnalysis(
  req: AnalyzeRequest,
  res: Response,
  signal: AbortSignal
): Promise<void> {
  sendSSE(res, { type: "status", message: "Extracting CV skills..." });
  const cvSkills: CVSkillsData = await runStage(buildStage1Prompt(req.cv_text), CVSkillsDataSchema, signal);
  sendSSE(res, { type: "cv_skills", data: cvSkills });

  sendSSE(res, { type: "status", message: "Analyzing job requirements..." });
  const jdSkills: JDSkillsData = await runStage(buildStage2Prompt(req.jd_text), JDSkillsDataSchema, signal);
  sendSSE(res, { type: "jd_skills", data: jdSkills });

  sendSSE(res, { type: "status", message: "Building skill relationship graph..." });
  const graphData: GraphData = await runStage(buildStage3Prompt(cvSkills, jdSkills), GraphDataSchema, signal);
  sendSSE(res, { type: "graph", data: graphData });

  sendSSE(res, { type: "status", message: "Calculating match score..." });
  const scoreData = await runStage(buildStage4Prompt(cvSkills, jdSkills, graphData, req.weights), ScoreDataSchema, signal);
  sendSSE(res, { type: "score", data: scoreData });

  sendSSE(res, { type: "done" });
}
