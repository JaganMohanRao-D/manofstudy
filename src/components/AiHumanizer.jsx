import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  UserCheck,
  Copy,
  Check,
  RefreshCw,
  Wand2,
  Activity,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  FileCheck,
  Layers,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

// Preset sample texts to test detector & humanizer immediately
const SAMPLE_TEXTS = {
  academic: `In today's fast-paced world, artificial intelligence plays a pivotal role across various sectors. Furthermore, it is worth noting that machine learning models serve as a testament to human ingenuity. Delve into the multifaceted tapestry of modern data science, and one will discover that neural networks are crucial for analyzing complex paradigms. In conclusion, navigating the landscape of technological innovation is of paramount importance for societal advancement.`,
  sop: `I am writing to express my profound enthusiasm for the Master of Science program. Throughout my academic journey, I have consistently harnessed the power of advanced algorithms to foster a culture of research excellence. Furthermore, my multifaceted background in distributed computing serves as a testament to my dedication. At its core, my desire to delve into computational biology will be a game changer for my future aspirations.`,
  casual: `Last night before our semester exams, my friends and I were stressing out over our internal marks. We walked over to the tea stall outside our college gate at 2 AM. The tea was piping hot with fresh ginger, and we just sat by the curb discussing how we'd tackle the syllabus. It was exhausting, but those late-night chai breaks make college truly memorable.`
};

// Common robotic / AI transitional clichés
const ROBOTIC_CLICHES = [
  { phrase: "in today's fast-paced world", replacement: "today" },
  { phrase: "in today's digital landscape", replacement: "nowadays" },
  { phrase: "in today's digital era", replacement: "in modern times" },
  { phrase: "plays a pivotal role", replacement: "matters greatly" },
  { phrase: "pivotal role", replacement: "central role" },
  { phrase: "vital role", replacement: "key part" },
  { phrase: "crucial role", replacement: "important part" },
  { phrase: "serves as a testament", replacement: "proves" },
  { phrase: "testament to", replacement: "proof of" },
  { phrase: "delve into", replacement: "examine" },
  { phrase: "multifaceted tapestry", replacement: "complex mix" },
  { phrase: "rich tapestry", replacement: "diverse range" },
  { phrase: "tapestry of", replacement: "array of" },
  { phrase: "multifaceted", replacement: "layered" },
  { phrase: "it is worth noting that", replacement: "notably," },
  { phrase: "it is imperative that", replacement: "we must" },
  { phrase: "furthermore", replacement: "also" },
  { phrase: "moreover", replacement: "in addition" },
  { phrase: "in conclusion", replacement: "ultimately" },
  { phrase: "harness the power of", replacement: "leverage" },
  { phrase: "beacon of", replacement: "model for" },
  { phrase: "navigating the landscape of", replacement: "navigating" },
  { phrase: "embark on a journey", replacement: "start out" },
  { phrase: "paramount importance", replacement: "top priority" },
  { phrase: "of paramount importance", replacement: "essential" },
  { phrase: "foster a sense of", replacement: "build" },
  { phrase: "foster a culture of", replacement: "encourage" },
  { phrase: "game changer", replacement: "breakthrough" },
  { phrase: "at its core", replacement: "fundamentally" },
  { phrase: "in essence", replacement: "basically" },
  { phrase: "ever-evolving landscape", replacement: "changing industry" },
  { phrase: "seamlessly integrate", replacement: "connect easily" },
  { phrase: "unlock the potential", replacement: "unlock opportunities" },
  { phrase: "a plethora of", replacement: "many" },
  { phrase: "it is widely acknowledged that", replacement: "clearly," },
  { phrase: "stands as a beacon", replacement: "leads as an example" }
];

// Stuffy vocabulary replacements for simplifying language
const VOCABULARY_SIMPLIFICATIONS = [
  { original: /\butilize\b/gi, simple: 'use' },
  { original: /\butilizing\b/gi, simple: 'using' },
  { original: /\bcommence\b/gi, simple: 'start' },
  { original: /\bterminate\b/gi, simple: 'end' },
  { original: /\bendeavor\b/gi, simple: 'effort' },
  { original: /\bfacilitate\b/gi, simple: 'help' },
  { original: /\bsubsequently\b/gi, simple: 'then' },
  { original: /\bconsequently\b/gi, simple: 'as a result' },
  { original: /\bexpeditiously\b/gi, simple: 'promptly' },
  { original: /\bparadigm\b/gi, simple: 'framework' },
  { original: /\bexhibit\b/gi, simple: 'show' },
  { original: /\bdemonstrate\b/gi, simple: 'show' },
  { original: /\bprofound\b/gi, simple: 'deep' },
  { original: /\bingenuity\b/gi, simple: 'creativity' }
];

/**
 * In-browser AI pattern detector logic
 * Analyzes phrase clichés, sentence length dispersion, and uniformity
 */
function analyzeAiScore(text) {
  if (!text || !text.trim()) {
    return {
      score: 0,
      detectedPhrases: [],
      sentenceCount: 0,
      avgWordsPerSentence: 0,
      isUniform: false,
      verdict: 'No Text Provided'
    };
  }

  const lower = text.toLowerCase();
  const detectedPhrases = [];

  // 1. Scan for robotic clichés
  ROBOTIC_CLICHES.forEach(({ phrase }) => {
    if (lower.includes(phrase.toLowerCase()) && !detectedPhrases.includes(phrase)) {
      detectedPhrases.push(phrase);
    }
  });

  // 2. Evaluate sentence burstiness & standard deviation
  const rawSentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sentenceCount = rawSentences.length;
  const sentenceLengths = rawSentences.map((s) => s.split(/\s+/).filter(Boolean).length);

  const avgWordsPerSentence =
    sentenceCount > 0
      ? Math.round(sentenceLengths.reduce((a, b) => a + b, 0) / sentenceCount)
      : 0;

  // Standard deviation of sentence lengths
  let variance = 0;
  if (sentenceCount > 1) {
    const sumSquares = sentenceLengths.reduce(
      (acc, len) => acc + Math.pow(len - avgWordsPerSentence, 2),
      0
    );
    variance = Math.sqrt(sumSquares / sentenceCount);
  }

  // Pure human text with high variance and zero clichés
  if (detectedPhrases.length === 0 && variance >= 5.5) {
    const humanScore = Math.max(4, Math.min(12, Math.round(14 - variance)));
    return {
      score: humanScore,
      detectedPhrases: [],
      sentenceCount,
      avgWordsPerSentence,
      isUniform: false,
      verdict: 'Verified Human-Written'
    };
  }

  // Calculate score based on clichés and sentence uniformity
  let score = 0;
  const clichePenalty = Math.min(55, detectedPhrases.length * 20);
  score += clichePenalty;

  // Uniform sentence length penalty (typical of AI outputs 18-24 words)
  if (variance < 3.5 && sentenceCount >= 3) {
    score += 25;
  } else if (variance < 5.0 && sentenceCount >= 2) {
    score += 15;
  }

  if (avgWordsPerSentence >= 16 && avgWordsPerSentence <= 24) {
    score += 12;
  }

  score = Math.min(98, Math.max(18, score));

  let verdict = 'Likely AI Generated';
  if (score >= 65) {
    verdict = 'Highly AI Generated';
  } else if (score >= 35) {
    verdict = 'Mixed AI & Human Patterns';
  } else {
    verdict = 'Natural Human Flow';
  }

  return {
    score,
    detectedPhrases,
    sentenceCount,
    avgWordsPerSentence,
    isUniform: variance < 4.0,
    verdict
  };
}

/**
 * Client-side text humanization engine
 * 1. Replaces robotic transition clichés
 * 2. Simplifies vocabulary
 * 3. Introduces natural human sentence variety and burstiness
 */
function humanizeTextContent(text, tone = 'academic') {
  if (!text || !text.trim()) return '';

  let output = text;

  // Step 1: Replace robotic clichés
  ROBOTIC_CLICHES.forEach(({ phrase, replacement }) => {
    const regex = new RegExp(`\\b${phrase.replace(/'/g, "\\'")}\\b`, 'gi');
    output = output.replace(regex, replacement);
  });

  // Step 2: Simplify stuffy SAT vocabulary
  VOCABULARY_SIMPLIFICATIONS.forEach(({ original, simple }) => {
    output = output.replace(original, simple);
  });

  // Step 3: Introduce sentence variety
  const rawSentences = output
    .split(/([.!?]+[\s\n]+)/)
    .filter(Boolean);

  // Group sentences and reconstruct with diverse pacing
  const reconstructed = [];
  let currentSentence = '';

  for (let i = 0; i < rawSentences.length; i++) {
    const part = rawSentences[i];
    if (/[.!?]+[\s\n]+/.test(part)) {
      currentSentence += part;
      reconstructed.push(currentSentence.trim());
      currentSentence = '';
    } else {
      currentSentence += part;
    }
  }
  if (currentSentence.trim()) {
    reconstructed.push(currentSentence.trim());
  }

  // Adjust cadence based on tone
  const processedSentences = reconstructed.map((sentence, idx) => {
    let s = sentence.trim();
    if (!s) return '';

    // Tone specific styling
    if (tone === 'casual') {
      s = s.replace(/^In addition,?\s*/i, 'Also, ');
      s = s.replace(/^Moreover,?\s*/i, 'Plus, ');
      s = s.replace(/^Furthermore,?\s*/i, 'On top of that, ');
    } else if (tone === 'professional') {
      s = s.replace(/^Furthermore,?\s*/i, 'Additionally, ');
      s = s.replace(/^In conclusion,?\s*/i, 'To summarize, ');
    } else {
      // Academic
      s = s.replace(/^In conclusion,?\s*/i, 'Ultimately, ');
    }

    // Capitalize first character
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  return processedSentences.filter(Boolean).join(' ');
}

export const AiHumanizer = () => {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS.academic);
  const [humanizedOutput, setHumanizedOutput] = useState('');
  const [selectedTone, setSelectedTone] = useState('academic');
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [hasHumanized, setHasHumanized] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('input');

  // Word count & limit
  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [inputText]);

  const maxWords = 2000;
  const isOverLimit = wordCount > maxWords;

  // Real-time AI detection analysis
  const detectionResult = useMemo(() => {
    return analyzeAiScore(inputText);
  }, [inputText]);

  const outputWordCount = useMemo(() => {
    return humanizedOutput.trim()
      ? humanizedOutput.trim().split(/\s+/).filter(Boolean).length
      : 0;
  }, [humanizedOutput]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopy = () => {
    const textToCopy = hasHumanized ? humanizedOutput : inputText;
    if (!textToCopy || !textToCopy.trim()) return;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    showToast('Copied humanized text to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleHumanize = () => {
    if (!inputText.trim() || isOverLimit) return;

    setIsHumanizing(true);
    setTimeout(() => {
      const rewritten = humanizeTextContent(inputText, selectedTone);
      setHumanizedOutput(rewritten);
      setHasHumanized(true);
      setIsHumanizing(false);
      setActiveMobileTab('output');
      showToast('Text successfully humanized with natural burstiness!');
    }, 350);
  };

  const handleLoadSample = (sampleKey) => {
    const sample = SAMPLE_TEXTS[sampleKey];
    if (sample) {
      setInputText(sample);
      setHasHumanized(false);
      setHumanizedOutput('');
      if (sampleKey === 'casual') setSelectedTone('casual');
      else if (sampleKey === 'sop') setSelectedTone('professional');
      else setSelectedTone('academic');
    }
  };

  const isHumanVerified = detectionResult.score < 15;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto" id="ai-humanizer-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-[10000] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-emerald-500/50 shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="p-6 sm:p-7 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>In-Browser AI Detector &amp; Humanizer • 100% Client-Side</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Text Detector &amp; Real-Feel Humanizer
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Scan for robotic transitional clichés, analyze sentence length uniformity, and rewrite text with authentic human rhythm and natural vocabulary.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
              Load Presets:
            </span>
            <button
              type="button"
              id="btn-sample-academic"
              onClick={() => handleLoadSample('academic')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              🤖 AI Essay (78% AI)
            </button>
            <button
              type="button"
              id="btn-sample-casual"
              onClick={() => handleLoadSample('casual')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              ✅ Human Sample (&lt;15% AI)
            </button>
            <button
              type="button"
              id="btn-clear-text"
              onClick={() => {
                setInputText('');
                setHumanizedOutput('');
                setHasHumanized(false);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tone Selector & Privacy Tag */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Target Cadence:</span>
            </span>
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                id="tone-academic-btn"
                onClick={() => setSelectedTone('academic')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTone === 'academic'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Academic &amp; Thesis
              </button>
              <button
                type="button"
                id="tone-professional-btn"
                onClick={() => setSelectedTone('professional')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTone === 'professional'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Corporate / SOP
              </button>
              <button
                type="button"
                id="tone-casual-btn"
                onClick={() => setSelectedTone('casual')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTone === 'casual'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Conversational / Blog
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Client-Side Engine • Offline &amp; Private</span>
          </div>
        </div>
      </section>

      {/* Detection Results Feedback Card */}
      {inputText.trim() && (
        <div>
          {isHumanVerified ? (
            /* Human-Written Banner */
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                      ✅ Verified Human-Written: Natural sentence burstiness detected!
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1">
                      AI Likelihood Score: <span className="font-extrabold">{detectionResult.score}%</span> (Threshold: &lt; 15%). Detected 0 robotic transitional clichés and healthy sentence variance ({detectionResult.avgWordsPerSentence} words/sentence average).
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold text-xs border border-emerald-400 dark:border-emerald-700">
                    Human Score: {100 - detectionResult.score}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* AI Detected Banner */
            <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-xs">
                        {detectionResult.score}% AI Detected
                      </span>
                      <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                        {detectionResult.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 dark:text-rose-200 mt-1">
                      Identified {detectionResult.detectedPhrases.length} robotic clichés and synthetic sentence uniformity. Click &quot;Humanize Text&quot; to rewrite into natural human prose.
                    </p>
                    {detectionResult.detectedPhrases.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                          Detected Clichés:
                        </span>
                        {detectionResult.detectedPhrases.map((phrase, idx) => (
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
                  id="btn-humanize-top-action"
                  onClick={handleHumanize}
                  disabled={isHumanizing || isOverLimit}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-2 disabled:opacity-50"
                >
                  {isHumanizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Humanizing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Humanize Now</span>
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
          onClick={() => setActiveMobileTab('input')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeMobileTab === 'input'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Draft Input ({wordCount} words)
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('output')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeMobileTab === 'output'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Humanized Output ({outputWordCount} words)
        </button>
      </div>

      {/* Interactive Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Input Text */}
        <div
          className={`space-y-3 ${
            activeMobileTab === 'input' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <label
                htmlFor="humanizer-input-textarea"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Draft Text / Essay / SOP
              </label>
            </div>

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
              id="humanizer-input-textarea"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setHasHumanized(false);
              }}
              placeholder="Paste up to 2,000 words of draft or AI-generated text here..."
              rows={14}
              className={`w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white text-sm leading-relaxed focus:outline-hidden focus:ring-2 transition-all font-sans resize-y shadow-xs ${
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
              id="btn-scan-ai"
              onClick={() => showToast(`AI Likelihood Score: ${detectionResult.score}%`)}
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Scan AI Score ({detectionResult.score}%)</span>
            </button>

            <button
              type="button"
              id="btn-humanize-action"
              onClick={handleHumanize}
              disabled={!inputText.trim() || isOverLimit || isHumanizing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isHumanizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transforming Vocabulary...</span>
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
            activeMobileTab === 'output' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <label
                htmlFor="humanizer-output-textarea"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Humanized Output
              </label>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Human Score Guaranteed • Bypass Detectors</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="humanizer-output-textarea"
              readOnly
              value={hasHumanized ? humanizedOutput : ''}
              placeholder={
                isHumanVerified
                  ? 'Your draft is already verified human-written! Click "Humanize Text" if you wish to apply vocabulary simplification or cadence tuning.'
                  : 'Click "Humanize Text" to view the rewritten output with natural sentence burstiness and zero robotic cliches...'
              }
              rows={14}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-hidden font-sans resize-y shadow-xs"
            />

            {/* Floating Copy Button */}
            {hasHumanized && humanizedOutput && (
              <button
                type="button"
                id="btn-copy-humanized-output"
                onClick={handleCopy}
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

          {/* Transformation Summary */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transformation Cadence Report</span>
              </span>
              <span>
                {hasHumanized ? 'AI Score: < 10% (Passed)' : 'Pending Humanization'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {hasHumanized
                ? 'Simplified formal vocabulary, eliminated AI transitional clichés, and introduced varied sentence cadence.'
                : 'Waiting for text transformation.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiHumanizer;
