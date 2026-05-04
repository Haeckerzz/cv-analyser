import { Router, type Request, type Response } from "express";
import multer from "multer";
import { extractText } from "../services/fileParser";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents (.pdf, .doc, .docx) are accepted"));
    }
  },
});

const router = Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const text = await extractText(req.file.buffer, req.file.mimetype);
    if (text.length < 20) {
      res.status(422).json({ error: "Could not extract readable text from the file" });
      return;
    }
    res.json({ text, filename: req.file.originalname, chars: text.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse file";
    res.status(400).json({ error: message });
  }
});

export { router as parseFileRouter };
