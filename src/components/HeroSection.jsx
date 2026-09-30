import React from 'react';
import {
  ShieldCheck,
  Database,
  Lock,
  Home,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
} from 'lucide-react';
import { FeaturesHub } from './FeaturesHub';

export const HeroSection = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
}) => {
  const handleHeroNavigation = (workspace) => {
    if (workspace === 'scholarships') {
      window.location.hash = 'scholarships';
    }
    onSelectWorkspace?.(workspace);
  };

  return (
    <section
      id="hero-banner"
      className="relative overflow-hidden mos-hero-premium bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-8 sm:py-12 lg:py-14 px-3 sm:px-6 lg:px-8 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-lg dark:shadow-2xl space-y-8 sm:space-y-10 min-h-fit break-words transition-colors duration-200"
    >
      {/* Premium ambient motion — decorative only, content remains fully static/readable. */}
      <div className="mos-hero-ambient" aria-hidden="true">
        <span className="mos-hero-grid" />
        <span className="mos-hero-orb mos-hero-orb-a" />
        <span className="mos-hero-orb mos-hero-orb-b" />
        <span className="mos-hero-orb mos-hero-orb-c" />
        <span className="mos-hero-dot mos-hero-dot-1" />
        <span className="mos-hero-dot mos-hero-dot-2" />
        <span className="mos-hero-dot mos-hero-dot-3" />
        <span className="mos-hero-dot mos-hero-dot-4" />
        <span className="mos-hero-dot mos-hero-dot-5" />
        <span className="mos-hero-dot mos-hero-dot-6" />
        <span className="mos-hero-book mos-hero-book-1"><BookOpen /></span>
        <span className="mos-hero-book mos-hero-book-2"><GraduationCap /></span>
        <span className="mos-hero-book mos-hero-book-3"><FileText /></span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6 mos-hero-content">
        <div className="mos-hero-kicker inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
          <span>Of the student, by the student, for the student</span>
        </div>

        <h1 className="mos-hero-title text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] text-center px-2">
          <span>One platform.</span>{' '}
          <span className="mos-hero-accent-blue">Everything</span>{' '}
          <span className="mos-hero-accent-green">students need.</span>
        </h1>

        <p className="mos-hero-subtitle text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal px-2">
          Admissions, academics, career roadmaps, AI guidance, PDF tools and everyday student utilities — all in one place.
        </p>

        {/* Primary navigation moved here from the desktop header to reduce header density. */}
        <nav
          aria-label="Primary student workspaces"
          className="pt-1 grid grid-cols-2 sm:flex sm:flex-wrap items-stretch justify-center gap-2.5 sm:gap-3 max-w-3xl mx-auto"
        >
          <button
            type="button"
            id="hero-feature-hub-btn"
            onClick={() => handleHeroNavigation('hub')}
            className={`group min-h-[58px] sm:min-h-[52px] flex items-center justify-center gap-2 px-3 sm:px-5 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeWorkspace === 'hub'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Feature Hub</span>
          </button>

          <button
            type="button"
            id="hero-scholarships-btn"
            onClick={() => handleHeroNavigation('scholarships')}
            className={`group min-h-[58px] sm:min-h-[52px] flex items-center justify-center gap-2 px-3 sm:px-5 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeWorkspace === 'scholarships'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Scholarships</span>
            <span className="hidden sm:inline-flex text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">2026</span>
          </button>

          <button
            type="button"
            id="hero-mock-test-btn"
            onClick={() => handleHeroNavigation('mock-tests')}
            className={`group min-h-[58px] sm:min-h-[52px] flex items-center justify-center gap-2 px-3 sm:px-5 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeWorkspace === 'mock-tests' || activeWorkspace === 'eapcet-cbt' || activeWorkspace === 'cbt-mock-test'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Mock Test Series</span>
            <span className="hidden sm:inline-flex text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">160 Qs CBT</span>
          </button>

          <button
            type="button"
            id="hero-ap-allotments-btn"
            onClick={() => handleHeroNavigation('ap-allotments')}
            className={`group min-h-[58px] sm:min-h-[52px] flex items-center justify-center gap-2 px-3 sm:px-5 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              activeWorkspace === 'ap-allotments'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>AP Allotments</span>
            <span className="hidden sm:inline-flex text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">Namewise</span>
          </button>
        </nav>

        <div className="pt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Free &amp; accessible without paywalls</span>
          </div>
          <div className="hidden sm:inline text-slate-300 dark:text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Official state counseling &amp; allotment data</span>
          </div>
          <div className="hidden sm:inline text-slate-300 dark:text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            <span>Private, in-browser utilities</span>
          </div>
        </div>
      </div>

      <div id="features-hub" className="relative z-10 max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800/80">
        <FeaturesHub
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={onSelectWorkspace}
        />
      </div>
    </section>
  );
};

export default HeroSection;
