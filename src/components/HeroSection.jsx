import React from 'react';
import {
  ShieldCheck,
  Database,
  Lock,
  ArrowDown,
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
      className="relative overflow-hidden bg-slate-950 text-white py-10 sm:py-14 lg:py-16 px-4 sm:px-8 border border-slate-800/80 rounded-3xl shadow-2xl space-y-10 sm:space-y-12 min-h-fit break-words"
    >
      {/* Background Ambience: Subtle and non-distracting */}
      <div className="hidden sm:block absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      {/* Subtle tech grid pattern */}
      <div className="hidden sm:block absolute inset-0 bg-[radial-gradient(#38bdf80a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Hero Header & Value Proposition */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
        
        {/* Ethos Kicker: Calm, conceptual motto */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-slate-900/90 text-slate-300 border border-slate-800 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>Of the student, by the student, for the student</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-center px-2">
          Built for students.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Built by a student.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal px-2">
          One platform for admissions, academics, skills and career planning.
        </p>

        {/* ONE Clear Primary Action CTA */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            id="hero-explore-tools-btn"
            onClick={handleScrollToTools}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Explore Student Tools</span>
            <ArrowDown className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* Trust & Transparency Indicators */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Free &amp; accessible without paywalls</span>
          </div>
          <div className="hidden sm:inline text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-400" />
            <span>Official state counseling &amp; allotment data</span>
          </div>
          <div className="hidden sm:inline text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Private, in-browser utilities</span>
          </div>
        </div>
      </div>

      {/* Student Tools & Workspaces Section */}
      <div id="features-hub" className="relative z-10 max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-slate-800/80">
        <FeaturesHub
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={onSelectWorkspace}
        />
      </div>
    </section>
  );
};

export default HeroSection;
