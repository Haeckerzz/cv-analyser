import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeRouter } from "./routes/analyze";
import { parseFileRouter } from "./routes/parseFile";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Enable CORS for all origins in production, or use an environment variable
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/analyze", analyzeRouter);
app.use("/api/parse-file", parseFileRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
