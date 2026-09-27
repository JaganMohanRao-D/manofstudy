import React, { useState } from 'react';
import {
  Award,
  Clock,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Flame,
  Sparkles,
  Zap,
  Target,
  GraduationCap,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { WorkspaceView } from '../types';

export interface MockTestSeriesHubProps {
  onSelectWorkspace?: (ws: WorkspaceView, subTab?: string) => void;
  isEmbedded?: boolean;
}

export const MockTestSeriesHub: React.FC<MockTestSeriesHubProps> = ({
  onSelectWorkspace,
  isEmbedded = false,
}) => {
  const [selectedEapcetMode, setSelectedEapcetMode] = useState<'full' | 'express'>('full');

  const handleLaunchEapcet = (examState: 'ap' | 'tg' = 'ap') => {
    if (onSelectWorkspace) {
      onSelectWorkspace('eapcet-cbt', `${examState}-${selectedEapcetMode}`);
    }
  };

  const handleLaunchReliance = () => {
    if (onSelectWorkspace) {
      onSelectWorkspace('cbt-mock-test');
    }
  };

  return (
    <section
      id="mock-test-series-hub"
      className={`w-full max-w-6xl mx-auto space-y-6 ${
        isEmbedded ? 'pt-4' : 'animate-in fade-in duration-300'
      }`}
    >
      {/* Section Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                🎯 Mock Test Series
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 animate-pulse">
                NEW LIVE
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                TCS iON &amp; NTA Format
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Real-Time CBT Simulation Environments
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Experience authentic computer-based exams with countdown timers, TCS iON question palettes, instant rank predictions, and verified step-by-step solutions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[120px]">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">220+</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Total Questions
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[120px]">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Free &amp; Ad-Free
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Test Modules Grid (Side-by-side or stacked on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: AP & TG EAPCET Full-Length Grand Test */}
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800/80 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  EAPCET 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                  160 Questions
                </span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                TCS iON CBT Standard
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>AP &amp; TG EAPCET Engineering Grand Test</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Complete mock test covering the official syllabus with verified questions across analytical Mathematics, core Physics, and Chemistry.
              </p>
            </div>

            {/* Exam Metrics & Syllabus Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Duration</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">180 Mins</div>
                <div className="text-[10px] text-slate-500">3 Hours Real Exam</div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <div className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Pattern</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">160 MCQs</div>
                <div className="text-[10px] text-slate-500">80 M + 40 P + 40 C</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Marking</span>
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+1 / 0</div>
                <div className="text-[10px] text-slate-500">NO Negative Mark</div>
              </div>
            </div>

            {/* Test Length Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Choose Practice Format:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedEapcetMode('full')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer border text-left ${
                    selectedEapcetMode === 'full'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Full Grand Test</span>
                    {selectedEapcetMode === 'full' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`text-[10px] font-normal ${selectedEapcetMode === 'full' ? 'text-blue-100' : 'text-slate-400'}`}>
                    160 Qs • 180 Mins (Standard)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEapcetMode('express')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer border text-left ${
                    selectedEapcetMode === 'express'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Express Mock</span>
                    {selectedEapcetMode === 'express' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`text-[10px] font-normal ${selectedEapcetMode === 'express' ? 'text-blue-100' : 'text-slate-400'}`}>
                    80 Qs • 90 Mins (Quick)
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Launch Buttons for AP and TG */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => handleLaunchEapcet('ap')}
              className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <span>Launch AP EAPCET Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleLaunchEapcet('tg')}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <span>Launch TG EAPCET Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Module 2: Reliance Foundation UG Scholarship Test */}
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  Scholarship
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                  ₹2 Lakh Grant
                </span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                Official NTA Aptitude Pattern
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Reliance Foundation UG Scholarship Test</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                60-minute aptitude test simulating the mandatory online screening assessment for the ₹2,00,000 undergraduate merit-cum-means scholarship grant.
              </p>
            </div>

            {/* Exam Metrics & Syllabus Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Duration</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">60 Mins</div>
                <div className="text-[10px] text-slate-500">Live Timer</div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Questions</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">60 MCQs</div>
                <div className="text-[10px] text-slate-500">Verbal, Logic, Num</div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <div className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Marking</span>
                </div>
                <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">+1 / 0</div>
                <div className="text-[10px] text-slate-500">NO Negative Mark</div>
              </div>
            </div>

            {/* Section Breakdown Info Card */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>1. Verbal Ability (Grammar &amp; Comprehension):</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">20 Qs</span>
              </div>
              <div className="flex items-center justify-between">
                <span>2. Analytical &amp; Logical Reasoning:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">20 Qs</span>
              </div>
              <div className="flex items-center justify-between">
                <span>3. Numerical Ability (Quantitative Aptitude):</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">20 Qs</span>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLaunchReliance}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <span>Launch Reliance Scholarship CBT Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockTestSeriesHub;
