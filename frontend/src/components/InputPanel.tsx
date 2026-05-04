import { useState, useRef } from "react";
import { uploadFile } from "../lib/fileClient";

type Tab = "paste" | "upload";

interface UploadState {
  uploading: boolean;
  filename: string | null;
  error: string | null;
}

const INIT_UPLOAD: UploadState = { uploading: false, filename: null, error: null };

interface Props {
  cvText: string;
  jdText: string;
  onCvChange: (v: string) => void;
  onJdChange: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

function TabHeader({
  label,
  tab,
  active,
  onClick,
}: {
  label: string;
  tab: Tab;
  active: Tab;
  onClick: (t: Tab) => void;
}) {
  return (
    <button
      onClick={() => onClick(tab)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        active === tab
          ? "bg-violet-600 text-white"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function FileDropZone({
  onFile,
  uploading,
  filename,
  error,
  text,
}: {
  onFile: (f: File) => void;
  uploading: boolean;
  filename: string | null;
  error: string | null;
  text: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2 h-72">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />

      {/* Drop zone / upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex-1 rounded-lg border-2 border-dashed border-slate-600 hover:border-violet-500 bg-slate-900/50 hover:bg-slate-800/50 transition-colors flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <span className="text-2xl animate-spin">⟳</span>
            <span className="text-sm">Parsing file…</span>
          </>
        ) : filename ? (
          <>
            <span className="text-2xl">✓</span>
            <span className="text-sm text-emerald-400">{filename}</span>
            <span className="text-xs text-slate-500">Click to replace</span>
          </>
        ) : (
          <>
            <span className="text-3xl">📄</span>
            <span className="text-sm font-medium">Click to upload</span>
            <span className="text-xs text-slate-500">PDF, DOC, DOCX — max 10 MB</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {/* Extracted text preview */}
      {text.length > 0 && (
        <textarea
          readOnly
          value={text}
          className="h-24 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-xs resize-none focus:outline-none"
          placeholder="Extracted text will appear here"
        />
      )}
    </div>
  );
}

export function InputPanel({
  cvText,
  jdText,
  onCvChange,
  onJdChange,
  onSubmit,
  isLoading,
}: Props) {
  const [cvTab, setCvTab] = useState<Tab>("paste");
  const [jdTab, setJdTab] = useState<Tab>("paste");
  const [cvUpload, setCvUpload] = useState<UploadState>(INIT_UPLOAD);
  const [jdUpload, setJdUpload] = useState<UploadState>(INIT_UPLOAD);

  async function handleCvFile(file: File) {
    setCvUpload({ uploading: true, filename: null, error: null });
    try {
      const text = await uploadFile(file);
      onCvChange(text);
      setCvUpload({ uploading: false, filename: file.name, error: null });
    } catch (e) {
      setCvUpload({ uploading: false, filename: null, error: (e as Error).message });
    }
  }

  async function handleJdFile(file: File) {
    setJdUpload({ uploading: true, filename: null, error: null });
    try {
      const text = await uploadFile(file);
      onJdChange(text);
      setJdUpload({ uploading: false, filename: file.name, error: null });
    } catch (e) {
      setJdUpload({ uploading: false, filename: null, error: (e as Error).message });
    }
  }

  const canSubmit =
    !isLoading &&
    !cvUpload.uploading &&
    !jdUpload.uploading &&
    cvText.length >= 50 &&
    jdText.length >= 20;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* CV panel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Resume / CV
          </label>
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            <TabHeader label="Paste Text" tab="paste" active={cvTab} onClick={setCvTab} />
            <TabHeader label="Upload File" tab="upload" active={cvTab} onClick={setCvTab} />
          </div>
        </div>

        {cvTab === "paste" ? (
          <textarea
            className="h-72 p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm resize-none focus:outline-none focus:border-violet-500 placeholder-slate-500"
            placeholder="Paste your resume or CV here..."
            value={cvText}
            onChange={(e) => onCvChange(e.target.value)}
            disabled={isLoading}
          />
        ) : (
          <FileDropZone
            onFile={handleCvFile}
            uploading={cvUpload.uploading}
            filename={cvUpload.filename}
            error={cvUpload.error}
            text={cvText}
          />
        )}
        <span className="text-xs text-slate-500 text-right">{cvText.length} chars</span>
      </div>

      {/* JD panel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Job Description
          </label>
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            <TabHeader label="Paste Text" tab="paste" active={jdTab} onClick={setJdTab} />
            <TabHeader label="Upload File" tab="upload" active={jdTab} onClick={setJdTab} />
          </div>
        </div>

        {jdTab === "paste" ? (
          <textarea
            className="h-72 p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm resize-none focus:outline-none focus:border-violet-500 placeholder-slate-500"
            placeholder="Paste the job description here..."
            value={jdText}
            onChange={(e) => onJdChange(e.target.value)}
            disabled={isLoading}
          />
        ) : (
          <FileDropZone
            onFile={handleJdFile}
            uploading={jdUpload.uploading}
            filename={jdUpload.filename}
            error={jdUpload.error}
            text={jdText}
          />
        )}
        <span className="text-xs text-slate-500 text-right">{jdText.length} chars</span>
      </div>

      {/* Submit */}
      <div className="lg:col-span-2 flex justify-center">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="px-8 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors text-sm"
        >
          {isLoading ? "Analyzing..." : cvUpload.uploading || jdUpload.uploading ? "Uploading file..." : "Analyze Match"}
        </button>
      </div>
    </div>
  );
}
