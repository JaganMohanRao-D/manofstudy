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
  UserCheck,
} from 'lucide-react';
import { WorkspaceView } from '../types';
import {
  CandidateOnboardingModal,
  CandidateProfile,
  ExamType,
} from './CandidateOnboardingModal';
import { useAuth } from '../context/AuthContext';

export interface MockTestSeriesHubProps {
  onSelectWorkspace?: (ws: WorkspaceView, subTab?: string) => void;
  isEmbedded?: boolean;
}

export const MockTestSeriesHub: React.FC<MockTestSeriesHubProps> = ({
  onSelectWorkspace,
  isEmbedded = false,
}) => {
  // Test Mode: 'full' (160 Qs | 180 Mins) or 'express' (80 Qs | 90 Mins)
  const [selectedEapcetMode, setSelectedEapcetMode] = useState<'full' | 'express'>('full');

  // Candidate Setup Modal State
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [targetExamType, setTargetExamType] = useState<ExamType>('ap-eapcet');
  const { user, openAuthModal } = useAuth();

  const handleOpenOnboarding = (examType: ExamType) => {
    if (!user) {
      openAuthModal({ type: 'mock-test' });
      return;
    }
    setTargetExamType(examType);
    setOnboardingOpen(true);
  };

  const handleConfirmCandidate = (profile: CandidateProfile) => {
    setOnboardingOpen(false);
    try {
      sessionStorage.setItem('mos_cbt_candidate_profile', JSON.stringify(profile));
    } catch (err) {
      console.warn('Unable to store candidate profile to sessionStorage', err);
    }

    if (profile.examType === 'ap-eapcet') {
      onSelectWorkspace?.('eapcet-cbt', `ap-${selectedEapcetMode}`);
    } else if (profile.examType === 'tg-eapcet') {
      onSelectWorkspace?.('eapcet-cbt', `tg-${selectedEapcetMode}`);
    } else if (profile.examType === 'reliance') {
      onSelectWorkspace?.('cbt-mock-test');
    }
  };

  return (
    <section
      id="mock-test-series"
      className={`w-full max-w-7xl mx-auto space-y-6 ${
        isEmbedded ? 'pt-2' : 'animate-in fade-in duration-300'
      }`}
    >
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                🎯 Mock Test Series Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 animate-pulse">
                NEW LIVE
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                TCS iON CBT &amp; NTA Format
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Real-Time CBT Simulation Environments
            </h2>
            {user && (
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Signed in</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px]">{user.displayName || 'Google User'}</div>
                </div>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Standard-aligned computer-based test engines featuring 160-question grand tests, official 75:25 IPE weightage calculations, countdown timers, TCS iON question palettes, dynamic rank range prediction, and step-by-step solutions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[110px]">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">160</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Full EAPCET Qs
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[110px]">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Free &amp; Ad-Free
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global EAPCET Practice Mode Switcher (Full 160 vs Express 80) */}
      <div className="bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              EAPCET Test Length Selector
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Choose between the official 160-question 3-hour grand test or a focused 80-question express mock.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedEapcetMode('full')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedEapcetMode === 'full'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
            }`}
          >
            Full Grand Test (160 Qs • 180 Mins)
          </button>

          <button
            type="button"
            onClick={() => setSelectedEapcetMode('express')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedEapcetMode === 'express'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
            }`}
          >
            Express Mock (80 Qs • 90 Mins)
          </button>
        </div>
      </div>

      {/* 2. Three Distinct First-Class Exam Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Module 1: AP EAPCET Full Grand Test */}
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                AP EAPCET 2026
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                75:25 IPE Weightage
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                AP EAPCET Full Grand Test
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Official Andhra Pradesh pattern with 80 Maths, 40 Physics, and 40 Chemistry MCQs. Incorporates candidate Class 12 / IPE weightage for authentic state rank prediction.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">Duration</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedEapcetMode === 'full' ? '180 Mins' : '90 Mins'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <div className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">Questions</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedEapcetMode === 'full' ? '160 MCQs' : '80 MCQs'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Negative</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">None (+1/0)</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>80 Mathematics + 40 Physics + 40 Chemistry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Inter Marks (out of 1000 or 600) 25% weightage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Official PDF Scorecard &amp; Verified Certificate</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenOnboarding('ap-eapcet')}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <UserCheck className="w-4 h-4" />
            <span>Setup &amp; Launch AP Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: TG EAPCET Full Grand Test */}
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                TG EAPCET 2026
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                100% CBT Pure Marks
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                TG EAPCET Full Grand Test
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Official Telangana pattern with 80 Maths, 40 Physics, and 40 Chemistry MCQs. Strictly evaluated on 100% CBT marks (no Inter marks weightage) per TGCHE guidelines.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Duration</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedEapcetMode === 'full' ? '180 Mins' : '90 Mins'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <div className="text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400">Questions</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedEapcetMode === 'full' ? '160 MCQs' : '80 MCQs'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">Negative</div>
                <div className="text-sm font-black text-blue-600 dark:text-blue-400">None (+1/0)</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>80 Mathematics + 40 Physics + 40 Chemistry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Pure CBT merit calculation (100% exam score)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Dynamic TG Rank Range &amp; College Tier Estimation</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenOnboarding('tg-eapcet')}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <UserCheck className="w-4 h-4" />
            <span>Setup &amp; Launch TG Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 3: Reliance Foundation UG Scholarship Test */}
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Scholarship
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ₹2,00,000 Grant
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Reliance UG Scholarship CBT
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                60-minute aptitude test simulating the mandatory online screening assessment for the ₹2,00,000 undergraduate merit-cum-means scholarship grant.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <div className="text-[9px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Duration</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">60 Mins</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">Questions</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">60 MCQs</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <div className="text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">Negative</div>
                <div className="text-sm font-black text-amber-600 dark:text-amber-400">None (+1/0)</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>20 Verbal Ability + 20 Logical Reasoning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>20 Numerical Ability (Quantitative Aptitude)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Realistic NTA/Reliance CBT online test environment</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenOnboarding('reliance')}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <UserCheck className="w-4 h-4" />
            <span>Setup &amp; Launch Scholarship Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Candidate Onboarding & Setup Modal */}
      <CandidateOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        examType={targetExamType}
        examMode={selectedEapcetMode}
        onConfirm={handleConfirmCandidate}
      />
    </section>
  );
};

export default MockTestSeriesHub;
