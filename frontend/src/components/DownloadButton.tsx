import type { FullReport } from "../types/shared";

interface Props {
  report: FullReport | null;
}

export function DownloadButton({ report }: Props) {
  if (!report) return null;

  const handleDownload = () => {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
    >
      <span>⬇</span> Download Report (JSON)
    </button>
  );
}
