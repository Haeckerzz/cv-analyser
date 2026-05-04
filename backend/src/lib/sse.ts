import type { Response } from "express";
import type { SSEEvent } from "../types/shared";

export function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}
