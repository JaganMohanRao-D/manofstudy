import React from 'react';
import {
  ShieldCheck,
  Database,
  Lock,
  ArrowDown,
  BookOpen,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { FeaturesHub } from './FeaturesHub';

export const HeroSection = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
}) => {
  const handleScrollToTools = () => {
    const el = document.getElementById('features-hub');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="hero-banner"
      className="relative overflow-hidden mos-hero-premium bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-10 sm:py-14 lg:py-16 px-4 sm:px-8 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-lg dark:shadow-2xl space-y-10 sm:space-y-12 min-h-fit break-words transition-colors duration-200"
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

      {/* Hero Header & Value Proposition */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6 mos-hero-content">
        
        {/* Ethos Kicker: Calm, conceptual motto */}
        <div className="mos-hero-kicker inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
          <span>Of the student, by the student, for the student</span>
        </div>

        {/* Primary Headline — product-first, concise, and feature-led */}
        <h1 className="mos-hero-title text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] text-center px-2">
          <span>One platform.</span>{' '}
          <span className="mos-hero-accent-blue">Everything</span>{' '}
          <span className="mos-hero-accent-green">students need.</span>
        </h1>

        {/* Supporting Text */}
        <p className="mos-hero-subtitle text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal px-2">
          Admissions, academics, career roadmaps, AI guidance, PDF tools and everyday student utilities — all in one place.
        </p>

        {/* Primary Call to Actions: Mock Test Series & Explore Tools */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            id="hero-mock-test-btn"
            onClick={() => onSelectWorkspace?.('mock-tests')}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>🎯 Launch Mock Test Series</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-400/30 text-white border border-blue-300/30">
              160 Qs CBT
            </span>
          </button>

          <button
            type="button"
            id="hero-explore-tools-btn"
            onClick={handleScrollToTools}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm sm:text-base border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Explore All Workspaces</span>
            <ArrowDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Trust & Transparency Indicators */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
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

      {/* Student Tools & Workspaces Section */}
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
