import { useState } from "react";
import { InputPanel } from "../components/InputPanel";
import { WeightSliders } from "../components/WeightSliders";
import { StatusFeed } from "../components/StatusFeed";
import { SkillGraph } from "../components/SkillGraph";
import { ScorePanel } from "../components/ScorePanel";
import { RecommendationList } from "../components/RecommendationList";
import { DownloadButton } from "../components/DownloadButton";
import { useAnalysis } from "../hooks/useAnalysis";
import { useWeights } from "../hooks/useWeights";

export function AnalyzerPage() {
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");
  const { weights, setWeight } = useWeights();
  const { statuses, cvSkills, jdSkills, graphData, scoreData, report, isLoading, error, analyze, reset } =
    useAnalysis();

  const hasResults = !!(cvSkills || jdSkills || graphData || scoreData);

  function handleSubmit() {
    analyze({ cv_text: cvText, jd_text: jdText, weights });
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            CV ↔ JD Analyzer
          </h1>
          <p className="text-slate-400 text-sm">
            AI-powered skill relationship analysis — powered by Claude
          </p>
        </div>

        {/* Input section */}
        <div className="space-y-4">
          <InputPanel
            cvText={cvText}
            jdText={jdText}
            onCvChange={setCvText}
            onJdChange={setJdText}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          <WeightSliders weights={weights} onWeightChange={setWeight} />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-red-300 text-sm flex items-start gap-2">
            <span>⚠</span>
            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Progress */}
        {(isLoading || statuses.length > 0) && (
          <StatusFeed statuses={statuses} isLoading={isLoading} />
        )}

        {/* Results */}
        {hasResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">Analysis Results</h2>
              <div className="flex gap-2">
                <DownloadButton report={report} />
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {scoreData && <ScorePanel scoreData={scoreData} weights={weights} />}
            {graphData && <SkillGraph graphData={graphData} />}
            {scoreData && <RecommendationList recommendations={scoreData.recommendations} />}

            {/* CV Skills summary */}
            {cvSkills && jdSkills && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Candidate Profile
                  </h3>
                  <p className="text-xs text-slate-400">Experience: <span className="text-slate-200">{cvSkills.experience_years} years</span></p>
                  <p className="text-xs text-slate-400">Education: <span className="text-slate-200">{cvSkills.education}</span></p>
                  <p className="text-xs text-slate-400">Skills extracted: <span className="text-slate-200">{cvSkills.skills.length}</span></p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Job Requirements
                  </h3>
                  <p className="text-xs text-slate-400">Experience required: <span className="text-slate-200">{jdSkills.experience_required_years} years</span></p>
                  <p className="text-xs text-slate-400">Education required: <span className="text-slate-200">{jdSkills.education_required}</span></p>
                  <p className="text-xs text-slate-400">Required skills: <span className="text-slate-200">{jdSkills.required_skills.length}</span></p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
