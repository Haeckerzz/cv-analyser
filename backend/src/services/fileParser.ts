import mammoth from "mammoth";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse") as {
  PDFParse: new (opts: { data: Buffer }) => { getText(): Promise<{ text: string }> };
};

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (!SUPPORTED_TYPES.has(mimetype)) {
    throw new Error(`Unsupported file type: ${mimetype}. Please upload a PDF or Word document.`);
  }

  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text.trim();
  }

  // .docx and .doc both handled by mammoth
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
