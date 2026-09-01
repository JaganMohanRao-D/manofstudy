import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { scanAiPatterns, deepHumanizeText, SAMPLE_AI_TEXTS } from '../utils/aiHumanizerEngine';
import { HumanizeMode } from '../types';

export const AiHumanizer: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_AI_TEXTS.academicEssay);
  const [humanizeMode, setHumanizeMode] = useState<HumanizeMode>('academic');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'both' | 'scanner' | 'humanizer'>('both');

  // Compute live AI pattern analysis
  const scanResult = useMemo(() => {
    return scanAiPatterns(inputText);
  }, [inputText]);

  // Compute live humanized version
  const humanizedResult = useMemo(() => {
    return deepHumanizeText(inputText, humanizeMode);
  }, [inputText, humanizeMode]);

  const handleCopyHumanized = () => {
    navigator.clipboard.writeText(humanizedResult.humanizedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadPreset = (key: 'academic' | 'cover' | 'blog') => {
    if (key === 'academic') {
      setInputText(SAMPLE_AI_TEXTS.academicEssay);
      setHumanizeMode('academic');
    } else if (key === 'cover') {
      setInputText(SAMPLE_AI_TEXTS.coverLetter);
      setHumanizeMode('professional');
    } else {
      setInputText(SAMPLE_AI_TEXTS.blogPost);
      setHumanizeMode('casual');
    }
  };

  // Score styling logic
  const score = scanResult.aiLikelihoodScore;
  const scoreTheme =
    score >= 68
      ? {
          stroke: '#EF4444',
          text: 'text-rose-700',
          bg: 'bg-rose-50 border-rose-200',
          badge: 'High AI Probability (Synthetic Cadence)',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        }
      : score >= 40
      ? {
          stroke: '#F59E0B',
          text: 'text-amber-700',
          bg: 'bg-amber-50 border-amber-200',
          badge: 'Moderate AI Traces (Repetitive Cadence)',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        }
      : {
          stroke: '#10B981',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200',
          badge: 'Natural Human Flow & Dynamic Burstiness',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };

  // SVG Radial Gauge Calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Tool Header Banner */}
      <section className="p-5 sm:p-6 rounded-2xl border bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4" />
              <span>Real-Feel AI Text Humanizer & Pattern Scanner</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              AI Pattern Scanner & Natural Text Humanizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              Detect synthetic LLM hallmarks (robotic transitions, uniform sentence lengths, low burstiness) and convert rigid AI output into natural human cadence with academic, casual, or executive polish.
            </p>
          </div>

          {/* Quick Sample Presets */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 px-2">Samples:</span>
            <button
              onClick={() => handleLoadPreset('academic')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Academic Essay
            </button>
            <button
              onClick={() => handleLoadPreset('cover')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Cover Letter
            </button>
            <button
              onClick={() => handleLoadPreset('blog')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Blog Post
            </button>
            <button
              onClick={() => setInputText('')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-200 pt-4">
          <button
            onClick={() => setActiveSubTab('both')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              activeSubTab === 'both'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
            }`}
          >
            Dual Comparison View
          </button>
          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              activeSubTab === 'scanner'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
            }`}
          >
            AI Diagnostics & Scanner
          </button>
          <button
            onClick={() => setActiveSubTab('humanizer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              activeSubTab === 'humanizer'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
            }`}
          >
            Humanizer Studio
          </button>
        </div>
      </section>

      {/* Diagnostics Radar Section (Scanner Mode or Dual View) */}
      {(activeSubTab === 'both' || activeSubTab === 'scanner') && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radial Likelihood Meter */}
          <div className="lg:col-span-4 rounded-2xl border bg-white border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>AI Likelihood Probability</span>
            </span>

            <div className="relative flex items-center justify-center my-2">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={scoreTheme.stroke}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {score}%
                </span>
                <span className="text-[10px] font-medium uppercase text-slate-400">
                  AI Index
                </span>
              </div>
            </div>

            <div className={`mt-2 px-3 py-1 rounded-full border text-xs font-semibold ${scoreTheme.badgeColor}`}>
              {scoreTheme.badge}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-slate-200 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Sentences</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{scanResult.sentenceCount}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Avg Length</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{scanResult.averageSentenceLength} w</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Burstiness</div>
                <div className="text-sm font-bold text-sky-600 mt-0.5">{scanResult.burstinessScore}%</div>
              </div>
            </div>
          </div>

          {/* Detailed Metric Signals Breakdown */}
          <div className="lg:col-span-8 rounded-2xl border bg-white border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                Linguistic & Perplexity Signal Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates rhythmic burstiness, vocabulary predictability, and artificial transitional patterns.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scanResult.metrics.map((metric) => (
                <div key={metric.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{metric.name}</span>
                    <span className={metric.status === 'high' ? 'text-rose-600' : metric.status === 'moderate' ? 'text-amber-600' : 'text-emerald-600'}>
                      {metric.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metric.status === 'high' ? 'bg-rose-500' : metric.status === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Detected AI Cliches Pill tags */}
            {scanResult.roboticPhrasesDetected.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Detected Robotic Cliches / Transitions ({scanResult.roboticPhrasesDetected.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scanResult.roboticPhrasesDetected.map((phrase) => (
                    <span
                      key={phrase}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-rose-100 text-rose-900 border border-rose-300"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Humanizer Control Bar */}
      <section className="p-4 rounded-2xl border bg-white border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Target Humanization Tone:
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setHumanizeMode('academic')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              humanizeMode === 'academic'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic / Formal</span>
          </button>

          <button
            onClick={() => setHumanizeMode('casual')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              humanizeMode === 'casual'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Casual / Conversational</span>
          </button>

          <button
            onClick={() => setHumanizeMode('professional')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              humanizeMode === 'professional'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Professional / Corporate</span>
          </button>
        </div>
      </section>

      {/* Dual Side-by-Side Comparison Screens */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input (Original AI Text) */}
        <div className="rounded-2xl border bg-white border-slate-200 p-5 flex flex-col justify-between space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <label htmlFor="ai-input" className="text-xs font-bold uppercase tracking-wider text-slate-800">
                1. Original Text (AI Output)
              </label>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{humanizedResult.statsOriginal.words} words</span>
              <span>•</span>
              <span>{humanizedResult.statsOriginal.chars} chars</span>
            </div>
          </div>

          <textarea
            id="ai-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your ChatGPT, Claude, or Gemini output here to analyze and humanize..."
            rows={12}
            className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl p-3.5 text-xs sm:text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all resize-y placeholder:text-slate-400 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
            <span>Estimated Reading Time: ~{humanizedResult.statsOriginal.readingTimeSec}s</span>
            <button
              onClick={() => setInputText('')}
              className="text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear Text
            </button>
          </div>
        </div>

        {/* Right Column: Output (Humanized Version) */}
        <div className="rounded-2xl border bg-white border-slate-200 p-5 flex flex-col justify-between space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>2. 100% Natural Humanized Output</span>
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-700 font-medium">
              <span>{humanizedResult.statsHumanized.words} words</span>
              <span>•</span>
              <span>{humanizedResult.statsHumanized.chars} chars</span>
            </div>
          </div>

          <div className="w-full bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 text-xs sm:text-sm font-sans text-slate-900 min-h-[240px] max-h-[360px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {humanizedResult.humanizedText || (
              <span className="text-slate-400 italic">
                Enter text on the left to generate the natural humanized stream...
              </span>
            )}
          </div>

          {/* Action Bar & Improvements Summary */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {humanizedResult.improvementsApplied.map((imp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-700 border border-slate-200"
                >
                  <Zap className="w-2.5 h-2.5 text-sky-600" />
                  <span>{imp}</span>
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Tone: <strong className="capitalize text-slate-800">{humanizeMode}</strong>
              </span>

              <button
                onClick={handleCopyHumanized}
                disabled={!humanizedResult.humanizedText}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Humanized Text'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
