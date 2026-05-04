import { Router, type Request, type Response } from "express";
import { AnalyzeRequestSchema } from "../types/shared";
import { runAnalysis } from "../services/groq";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const parsed = AnalyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const controller = new AbortController();
  res.on("close", () => controller.abort());

  try {
    await runAnalysis(parsed.data, res, controller.signal);
  } catch (err: unknown) {
    const errName = (err as { name?: string }).name ?? "";
    if (errName === "AbortError" || errName === "APIUserAbortError") return;
    const message = err instanceof Error ? err.message : "Analysis failed";
    try {
      res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
    } catch {
      // client already disconnected
    }
  } finally {
    res.end();
  }
});

export { router as analyzeRouter };
