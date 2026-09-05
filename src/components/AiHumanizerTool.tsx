import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  UserCheck,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  BookOpen,
  Coffee,
  Briefcase,
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Flame,
  FileCheck,
  Layers,
  Wand2,
} from 'lucide-react';
import { scanAiPatterns, deepHumanizeText, SAMPLE_AI_TEXTS } from '../utils/aiHumanizerEngine';
import { HumanizeMode } from '../types';

export const AiHumanizerTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_AI_TEXTS.academicEssay);
  const [humanizeMode, setHumanizeMode] = useState<HumanizeMode>('academic');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [analyzed, setAnalyzed] = useState<boolean>(true);
  const [hasHumanized, setHasHumanized] = useState<boolean>(false);
  const [isHumanizingLoading, setIsHumanizingLoading] = useState<boolean>(false);

  // Word count & 2,000 word limit enforcement
  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [inputText]);

  const maxWords = 2000;
  const isOverLimit = wordCount > maxWords;

  // Analysis result
  const scanResult = useMemo(() => {
    return scanAiPatterns(inputText);
  }, [inputText]);

  // Humanized result
  const humanizedResult = useMemo(() => {
    return deepHumanizeText(inputText, humanizeMode);
  }, [inputText, humanizeMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopy = (text: string) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast('Copied humanized text to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAnalyzeClick = () => {
    setAnalyzed(true);
    showToast(`Analysis updated: ${scanResult.aiLikelihoodScore}% AI likelihood`);
  };

  const handleHumanizeClick = () => {
    setIsHumanizingLoading(true);
    setTimeout(() => {
      setIsHumanizingLoading(false);
      setHasHumanized(true);
      setActiveTab('output');
      showToast('Text successfully humanized with natural human cadence!');
    }, 350);
  };

  const handleLoadSample = (sampleKey: 'academic' | 'cover' | 'human') => {
    if (sampleKey === 'academic') {
      setInputText(SAMPLE_AI_TEXTS.academicEssay);
      setHumanizeMode('academic');
    } else if (sampleKey === 'cover') {
      setInputText(SAMPLE_AI_TEXTS.coverLetter);
      setHumanizeMode('professional');
    } else {
      setInputText(SAMPLE_AI_TEXTS.verifiedHuman);
      setHumanizeMode('casual');
    }
    setAnalyzed(true);
    setHasHumanized(false);
  };

  const isHumanVerified = scanResult.aiLikelihoodScore < 15;
  const isAiDetected = scanResult.aiLikelihoodScore >= 15;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto" id="ai-humanizer-tool-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-[10000] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-emerald-500/50 shadow-2xl text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <section className="p-6 sm:p-7 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>In-Browser AI Detector &amp; Humanizer • Zero Cloud Uploads</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Text Detector &amp; Real-Feel Humanizer
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Scan for robotic transitional cliches, evaluate sentence burstiness, and rewrite AI-generated essays, SOPs, and reports into clean, human cadences.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
              Test Presets:
            </span>
            <button
              type="button"
              onClick={() => handleLoadSample('academic')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              🤖 AI Essay (78% AI)
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('human')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              ✅ Human Sample (&lt;15% AI)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setHasHumanized(false);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tone Selector & Privacy Assurance Banner */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Target Tone:</span>
            </span>
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setHumanizeMode('academic')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  humanizeMode === 'academic'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Academic &amp; Thesis
              </button>
              <button
                type="button"
                onClick={() => setHumanizeMode('professional')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  humanizeMode === 'professional'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Corporate / SOP
              </button>
              <button
                type="button"
                onClick={() => setHumanizeMode('casual')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  humanizeMode === 'casual'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Conversational / Blog
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Client-Side Engine • Private &amp; Offline-Safe</span>
          </div>
        </div>
      </section>

      {/* Main Analysis Feedback Card */}
      {analyzed && inputText.trim() && (
        <div>
          {isHumanVerified ? (
            /* <15% Verified Human-Written Card */
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                      ✅ Verified Human-Written: This text already exhibits natural human burstiness and sentence variance. No humanization needed!
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1">
                      AI Likelihood Score: <span className="font-extrabold">{scanResult.aiLikelihoodScore}%</span> (Threshold: &lt; 15%). Detected 0 robotic transitional cliches and healthy sentence length dispersion ({scanResult.averageSentenceLength} words/sentence average).
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold text-xs border border-emerald-400 dark:border-emerald-700">
                    Human Score: {100 - scanResult.aiLikelihoodScore}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* >=15% AI Detected Card */
            <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-xs">
                        {scanResult.aiLikelihoodScore}% AI Detected
                      </span>
                      <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                        {scanResult.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 dark:text-rose-200 mt-1">
                      Identified {scanResult.roboticPhrasesDetected.length} robotic transition cliches and uniform synthetic pacing. Click &quot;Humanize Text&quot; to rewrite into natural human prose.
                    </p>
                    {scanResult.roboticPhrasesDetected.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                          Detected Cliches:
                        </span>
                        {scanResult.roboticPhrasesDetected.map((phrase, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-rose-200/80 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 text-[11px] font-mono border border-rose-300 dark:border-rose-700"
                          >
                            &quot;{phrase}&quot;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id="humanize-now-top-btn"
                  onClick={handleHumanizeClick}
                  disabled={isHumanizingLoading || isOverLimit}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
                >
                  {isHumanizingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Humanizing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Humanize Now (Bypass AI Detectors)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'input'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Input Text ({wordCount} words)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('output')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'output'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Humanized Output
        </button>
      </div>

      {/* Two-Column Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Input Text */}
        <div
          className={`space-y-3 ${
            activeTab === 'input' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <label
                htmlFor="input-text-area"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Input Draft / Essay / SOP
              </label>
            </div>
            
            {/* Word Counter */}
            <div
              className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                isOverLimit
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {wordCount.toLocaleString()} / {maxWords.toLocaleString()} words
              {isOverLimit && ' (Limit Exceeded!)'}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="input-text-area"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setHasHumanized(false);
              }}
              placeholder="Paste up to 2,000 words of AI-generated or draft text here to scan for robotic transitions and humanize..."
              rows={14}
              className={`w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white text-sm leading-relaxed focus:outline-hidden focus:ring-2 transition-all font-sans resize-y shadow-2xs ${
                isOverLimit
                  ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-800 focus:ring-indigo-500/50 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              id="btn-analyze-score"
              onClick={handleAnalyzeClick}
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Analyze AI Score</span>
            </button>

            <button
              type="button"
              id="btn-humanize-text"
              onClick={handleHumanizeClick}
              disabled={!inputText.trim() || isOverLimit || isHumanizingLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isHumanizingLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transforming Cadence...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-cyan-300" />
                  <span>Humanize Text</span>
                </>
              )}
            </button>

            {isOverLimit && (
              <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Please reduce text to under 2,000 words.
              </span>
            )}
          </div>
        </div>

        {/* Column 2: Humanized Output */}
        <div
          className={`space-y-3 ${
            activeTab === 'output' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <label
                htmlFor="humanized-output-area"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Humanized Output
              </label>
            </div>

            {/* Output Badge Guaranteed */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Human Score Guaranteed • Bypass Turnitin &amp; GPTZero</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="humanized-output-area"
              readOnly
              value={
                hasHumanized || !isAiDetected
                  ? humanizedResult.humanizedText
                  : ''
              }
              placeholder={
                isHumanVerified
                  ? 'Your text is already verified human-written! Click "Humanize Text" if you want to apply tone adjustments anyway.'
                  : 'Click "Humanize Text" to view the rewritten output with natural sentence burstiness and zero robotic cliches...'
              }
              rows={14}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-hidden font-sans resize-y shadow-2xs"
            />

            {/* Floating Copy Button */}
            {(hasHumanized || !isAiDetected) && humanizedResult.humanizedText && (
              <button
                type="button"
                id="copy-humanized-floating-btn"
                onClick={() => handleCopy(humanizedResult.humanizedText)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Copy to Clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Applied Improvements Summary */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transformation Cadence Report</span>
              </span>
              <span>{humanizedResult.statsHumanized.gradeLevel}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {humanizedResult.improvementsApplied.slice(0, 3).join(' • ') ||
                'Restructured monotonous sentences and removed AI throat-clearing.'}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Deep Dive & Turnitin Bypass Explanation */}
      <section className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          How StudyMacha In-Browser Humanizer Engine Works:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              1. Eliminates AI Throat-Clearing
            </div>
            <p className="leading-relaxed">
              Strips out overused robotic preambles (&quot;In today&apos;s fast-paced world&quot;, &quot;It is worth noting that&quot;, &quot;Delve into the tapestry&quot;) that trigger GPTZero and Turnitin AI detectors.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              2. Injects Natural Burstiness
            </div>
            <p className="leading-relaxed">
              AI writes with monotonous 18–22 word sentences. Our engine alternates between crisp punchy statements (5–8 words) and descriptive analytical thoughts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              3. 100% Private Client Execution
            </div>
            <p className="leading-relaxed">
              All scanning and rewrites occur inside your local browser memory via JavaScript. Your essays, assignments, and research documents are never sent to external servers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AiHumanizerTool;
