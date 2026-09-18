import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Layers,
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  Wand2,
  AlertTriangle,
  FileCheck,
  Activity,
  X,
  FileCode,
} from 'lucide-react';
import {
  analyzeAtsMatch,
  generateAtsOptimizedResume,
  formatResumeAsPlainText,
  downloadAtsResumeAsPdf,
  SAMPLE_RESUMES,
  SAMPLE_JDS,
} from '../utils/atsAnalyzer';
import { extractTextFromDocument } from '../utils/documentParser';
import { AtsResumeStructured } from '../types';

export const AtsResumeMatcher: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>(SAMPLE_RESUMES.softwareEngineer);
  const [jdText, setJdText] = useState<string>(SAMPLE_JDS.fullStack);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedResumeText, setCopiedResumeText] = useState<boolean>(false);
  const [keywordFilter, setKeywordFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'tools' | 'soft_skills'>('all');
  
  // File upload state
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1-Click ATS Builder State
  const [structuredResume, setStructuredResume] = useState<AtsResumeStructured | null>(null);
  const [showBuilderModal, setShowBuilderModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matcher' | 'diagnostics' | 'builder'>('matcher');

  // Compute live match score & diagnostics
  const analysis = useMemo(() => {
    return analyzeAtsMatch(resumeText, jdText);
  }, [resumeText, jdText]);

  // Handle file drop & extraction
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsParsingFile(true);
    setUploadError(null);
    try {
      const { text, fileType } = await extractTextFromDocument(file);
      if (!text || text.length < 10) {
        throw new Error('Extracted text is empty or could not be read.');
      }
      setResumeText(text);
      setUploadedFileName(`${file.name} (${fileType})`);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setUploadError(err.message || 'Failed to extract text from document.');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleCopySingle = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedKey(word);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCopyAllMissing = () => {
    const list = analysis.missingKeywords.map(k => k.word).join(', ');
    navigator.clipboard.writeText(list);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleGenerateOptimizedResume = () => {
    const generated = generateAtsOptimizedResume(resumeText, jdText, analysis);
    setStructuredResume(generated);
    setShowBuilderModal(true);
  };

  const handleDownloadPdf = () => {
    if (structuredResume) {
      const filename = `${structuredResume.fullName.replace(/\s+/g, '_')}_ATS_Resume.pdf`;
      downloadAtsResumeAsPdf(structuredResume, filename);
    }
  };

  const handleDownloadPlainText = () => {
    if (structuredResume) {
      const plainText = formatResumeAsPlainText(structuredResume);
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${structuredResume.fullName.replace(/\s+/g, '_')}_ATS_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyGeneratedText = () => {
    if (structuredResume) {
      const plainText = formatResumeAsPlainText(structuredResume);
      navigator.clipboard.writeText(plainText);
      setCopiedResumeText(true);
      setTimeout(() => setCopiedResumeText(false), 2000);
    }
  };

  const handleLoadSample = (sample: 'swe' | 'data') => {
    if (sample === 'swe') {
      setResumeText(SAMPLE_RESUMES.softwareEngineer);
      setJdText(SAMPLE_JDS.fullStack);
    } else {
      setResumeText(SAMPLE_RESUMES.dataAnalyst);
      setJdText(SAMPLE_JDS.frontendReact);
    }
    setUploadedFileName(null);
  };

  const filteredMatched = useMemo(() => {
    return analysis.matchedKeywords.filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(keywordFilter.toLowerCase());
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [analysis.matchedKeywords, keywordFilter, selectedCategory]);

  const filteredMissing = useMemo(() => {
    return analysis.missingKeywords.filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(keywordFilter.toLowerCase());
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [analysis.missingKeywords, keywordFilter, selectedCategory]);

  // Score color logic
  const score = analysis.matchPercentage;
  const scoreTheme =
    score >= 75
      ? {
          stroke: '#10B981',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200',
          badge: 'High ATS Compatibility',
          desc: 'Your resume contains most of the high-frequency technical skills and competencies mentioned in this job description.',
        }
      : score >= 50
      ? {
          stroke: '#F59E0B',
          text: 'text-amber-800',
          bg: 'bg-amber-50 border-amber-200',
          badge: 'Moderate Match • Optimization Recommended',
          desc: 'Several core technical keywords are missing. Incorporate the highlighted terms into your experience and skills sections.',
        }
      : {
          stroke: '#EF4444',
          text: 'text-rose-800',
          bg: 'bg-rose-50 border-rose-200',
          badge: 'Low Keyword Match • High Rejection Risk',
          desc: 'Critical mismatch detected between resume content and job description requirements. Tailor your resume before applying.',
        };

  // SVG Radial Circle Calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Tool Header Banner */}
      <section className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileSearch className="w-4 h-4" />
              <span>ATS Resume Matcher & 1-Click Builder</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ATS Diagnostics & 1-Click Optimized Resume Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Extract resume text, analyze missing keywords, and generate ATS-optimized resumes for campus placement.
            </p>
          </div>

          {/* Quick Presets and Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateOptimizedResume}
              disabled={!resumeText.trim() || !jdText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>1-Click ATS Resume Builder</span>
            </button>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 px-2">Presets:</span>
              <button
                onClick={() => handleLoadSample('swe')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-150 active:scale-95 cursor-pointer"
              >
                Full-Stack SWE
              </button>
              <button
                onClick={() => handleLoadSample('data')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-150 active:scale-95 cursor-pointer"
              >
                Data Analyst
              </button>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-200 pt-4">
          <button
            onClick={() => setActiveTab('matcher')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              activeTab === 'matcher'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
            }`}
          >
            Keyword Matcher & Editor
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
            }`}
          >
            ATS Diagnostics & Red Flags ({analysis.findings.length})
          </button>
        </div>
      </section>

      {/* Feature A: Document Upload Drag-and-Drop Area */}
      <section className="rounded-2xl border bg-white border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-600" />
            Upload Document (.pdf, .docx, .txt) for Instant Client-Side Extraction
          </span>
          {uploadedFileName && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              {uploadedFileName}
            </span>
          )}
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/40 rounded-xl p-6 text-center transition-all cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.rtf,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-900">
            {isParsingFile ? 'Extracting text locally in browser memory...' : 'Click or Drag & Drop Resume (.PDF, .DOCX, .TXT) here'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            100% Client-side parser with pdfjs-dist & mammoth. Zero files uploaded to any server.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}
      </section>

      {/* Main Workspace (Matcher or Diagnostics View) */}
      {activeTab === 'matcher' ? (
        <>
          {/* Dual Textarea Inputs */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Text Input */}
            <div className="rounded-2xl border bg-white border-slate-200 p-5 flex flex-col space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label htmlFor="resume-input" className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  1. Resume Raw Text / Skills Dump
                </label>
                <span className="text-xs text-slate-400">
                  {analysis.resumeWordCount} words
                </span>
              </div>
              <textarea
                id="resume-input"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your plain text resume, skills section, or portfolio summary here..."
                rows={10}
                className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl p-3 text-xs sm:text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all resize-y placeholder:text-slate-400 leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Tip: Include your full bullet points and skills list</span>
                <button
                  onClick={() => { setResumeText(''); setUploadedFileName(null); }}
                  className="text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear Text
                </button>
              </div>
            </div>

            {/* Job Description Input */}
            <div className="rounded-2xl border bg-white border-slate-200 p-5 flex flex-col space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label htmlFor="jd-input" className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  2. Target Job Description (JD)
                </label>
                <span className="text-xs text-slate-400">
                  {analysis.jdWordCount} words
                </span>
              </div>
              <textarea
                id="jd-input"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job posting, required qualifications, and technical responsibilities here..."
                rows={10}
                className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl p-3 text-xs sm:text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all resize-y placeholder:text-slate-400 leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Extracts 1-grams, 2-grams & technical stacks</span>
                <button
                  onClick={() => setJdText('')}
                  className="text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear Text
                </button>
              </div>
            </div>
          </section>

          {/* Analysis Score Card & Category Breakdown */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Animated Radial Score Meter */}
            <div className="lg:col-span-5 rounded-2xl border bg-white border-slate-200 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>ATS Match Compatibility Score</span>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-slate-100"
                    strokeWidth="9"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke={scoreTheme.stroke}
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    {score}%
                  </span>
                  <span className="text-[10px] font-medium uppercase text-slate-400 mt-0.5">
                    Match Index
                  </span>
                </div>
              </div>

              <div className={`mt-3 px-3 py-1 rounded-full border text-xs font-semibold ${scoreTheme.bg} ${scoreTheme.text}`}>
                {scoreTheme.badge}
              </div>

              <p className="text-xs text-slate-500 mt-2.5 px-2 leading-relaxed">
                {scoreTheme.desc}
              </p>

              <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-slate-200 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Total In JD</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{analysis.totalJdKeywords}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-emerald-700 font-medium">Matched</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{analysis.matchedCount}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-rose-700 font-medium">Missing</div>
                  <div className="text-sm font-bold text-rose-700 mt-0.5">{analysis.missingCount}</div>
                </div>
              </div>
            </div>

            {/* Category Breakdown & Skills Coverage */}
            <div className="lg:col-span-7 rounded-2xl border bg-white border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Category-Wise Competency Coverage
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluated across technical stacks, development tools, and soft skill signals.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Technical Skills */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Core Technical Skills & Languages</span>
                    <span className="text-sky-600 font-semibold">
                      {analysis.categoryScores.technical.matched} / {analysis.categoryScores.technical.total} ({analysis.categoryScores.technical.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-500 rounded-full"
                      style={{ width: `${analysis.categoryScores.technical.percent}%` }}
                    />
                  </div>
                </div>

                {/* Tools & Frameworks */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Platforms, Cloud & Developer Tools</span>
                    <span className="text-sky-600 font-semibold">
                      {analysis.categoryScores.tools.matched} / {analysis.categoryScores.tools.total} ({analysis.categoryScores.tools.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 transition-all duration-500 rounded-full"
                      style={{ width: `${analysis.categoryScores.tools.percent}%` }}
                    />
                  </div>
                </div>

                {/* Soft Skills */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Soft Skills & Methodologies</span>
                    <span className="text-sky-600 font-semibold">
                      {analysis.categoryScores.soft_skills.matched} / {analysis.categoryScores.soft_skills.total} ({analysis.categoryScores.soft_skills.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-500 rounded-full"
                      style={{ width: `${analysis.categoryScores.soft_skills.percent}%` }}
                    />
                  </div>
                </div>

                {/* General Industry Terms */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">General Domain Terms</span>
                    <span className="text-sky-600 font-semibold">
                      {analysis.categoryScores.general.matched} / {analysis.categoryScores.general.total} ({analysis.categoryScores.general.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-300 transition-all duration-500 rounded-full"
                      style={{ width: `${analysis.categoryScores.general.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Critical Keywords Missing: <strong className="text-rose-600 font-semibold">{analysis.criticalMissingCount}</strong>
                </span>
                <button
                  onClick={handleCopyAllMissing}
                  disabled={analysis.missingCount === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer font-medium"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied to Clipboard!' : 'Copy All Missing Keywords'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Filter and Search Bar for Keywords */}
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border bg-white border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                placeholder="Search keywords..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Filter:</span>
              {(['all', 'technical', 'tools', 'soft_skills'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs capitalize transition-all duration-150 active:scale-95 whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-white font-medium shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </section>

          {/* Side-by-Side Keyword Breakdown Tags */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Keywords Found (Green) */}
            <div className="rounded-2xl border bg-white border-slate-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      KEYWORDS FOUND ({filteredMatched.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Detected in your resume text with frequency count
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  {analysis.matchedCount} / {analysis.totalJdKeywords}
                </span>
              </div>

              {filteredMatched.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching keywords found. Try adding key technologies or paste a full resume.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
                  {filteredMatched.map((item) => (
                    <span
                      key={item.word}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <span>{item.word}</span>
                      <span className="text-[10px] px-1 rounded-md bg-emerald-200/60 text-emerald-900">
                        {item.frequencyInResume}x
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Critical Keywords (Red) */}
            <div className="rounded-2xl border bg-white border-slate-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      MISSING CRITICAL KEYWORDS ({filteredMissing.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Present in JD but absent from your resume (Click to copy)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-700 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200">
                  {analysis.missingCount} Missing
                </span>
              </div>

              {filteredMissing.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-600">
                  Outstanding! No critical keywords are missing from this Job Description.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
                  {filteredMissing.map((item) => (
                    <button
                      key={item.word}
                      onClick={() => handleCopySingle(item.word)}
                      title="Click to copy single keyword"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all duration-150 active:scale-95 cursor-pointer group"
                    >
                      <span>{item.word}</span>
                      <span className="text-[10px] px-1 rounded-md bg-rose-200/60 text-rose-900">
                        JD:{item.frequencyInJd}x
                      </span>
                      {copiedKey === item.word ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-rose-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* Feature B: Intelligent ATS Diagnostics & Actionable Findings */
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Weak / Passive Action Verbs</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">{analysis.weakVerbsCount} detected</div>
              <p className="text-[11px] text-slate-400 mt-1">Phrases like "worked on", "assisted", "responsible for"</p>
            </div>
            <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Quantifiable Impact Metrics</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{analysis.quantifiableMetricsCount} found</div>
              <p className="text-[11px] text-slate-400 mt-1">Percentages, latency drops, user counts, multipliers</p>
            </div>
            <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Formatting & Section Flags</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{analysis.formattingFlags.length} issues</div>
              <p className="text-[11px] text-slate-400 mt-1">Header detection, word count limits, contact info</p>
            </div>
          </div>

          {/* Categorized Findings List */}
          <div className="rounded-2xl border bg-white border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Categorized Actionable Recommendations
            </h3>

            {analysis.findings.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                Excellent! No critical structural or phrasing red flags were detected in your resume text.
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.findings.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs ${
                      item.severity === 'critical'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : item.severity === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.severity === 'critical' ? 'bg-rose-200 text-rose-900' : item.severity === 'warning' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {item.type}
                        </span>
                        <h4 className="font-bold">{item.title}</h4>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.message}</p>
                      <div className="mt-1 pt-1 border-t border-slate-200/60 text-slate-600 font-medium">
                        <strong>Remedy:</strong> {item.suggestion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feature C: 1-Click ATS Resume Builder Modal / Preview */}
      <AnimatePresence>
        {showBuilderModal && structuredResume && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      ATS-Optimized Single-Column Resume
                    </h3>
                    <p className="text-xs text-slate-500">
                      Auto-generated industry standard format with missing target keywords integrated.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBuilderModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Preview Paper */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 bg-white font-sans text-xs sm:text-sm text-slate-800 border-b border-slate-200">
                {/* Header */}
                <div className="text-center space-y-1 pb-3 border-b border-slate-200">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {structuredResume.fullName}
                  </h1>
                  <p className="text-xs font-medium text-slate-600">{structuredResume.title}</p>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-2 pt-0.5">
                    <span>{structuredResume.contact.email}</span>
                    <span>•</span>
                    <span>{structuredResume.contact.phone}</span>
                    <span>•</span>
                    <span>{structuredResume.contact.location}</span>
                  </div>
                  <div className="text-[11px] text-sky-600 flex flex-wrap items-center justify-center gap-3">
                    <span>{structuredResume.contact.linkedin}</span>
                    <span>{structuredResume.contact.github}</span>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Professional Summary
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {structuredResume.summary}
                  </p>
                </div>

                {/* Technical Skills */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Technical Skills
                  </h2>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p><strong>• Languages:</strong> {structuredResume.skills.languages.join(', ')}</p>
                    <p><strong>• Frameworks & Libraries:</strong> {structuredResume.skills.frameworks.join(', ')}</p>
                    <p><strong>• Cloud & Tools:</strong> {structuredResume.skills.tools.join(', ')}</p>
                    <p><strong>• Core Concepts:</strong> {structuredResume.skills.concepts.join(', ')}</p>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Work Experience
                  </h2>
                  {structuredResume.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{exp.role}</span>
                        <span className="text-slate-500 font-normal">{exp.duration} | {exp.location}</span>
                      </div>
                      <div className="text-slate-600 font-medium italic">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Technical Projects */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Technical Projects
                  </h2>
                  {structuredResume.projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{proj.name}</span>
                        <span className="text-slate-500 font-normal">[{proj.technologies.join(', ')}]</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {proj.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Education
                  </h2>
                  {structuredResume.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <div>
                        <strong className="text-slate-900">{edu.degree}</strong>
                        <div className="text-slate-600">{edu.institution} • {edu.scoreOrGpa}</div>
                      </div>
                      <span className="text-slate-500">{edu.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Ready for instant ATS-friendly application submission.
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyGeneratedText}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    {copiedResumeText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedResumeText ? 'Copied Text' : 'Copy Plain Text'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPlainText}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Download .TXT</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Clean PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
