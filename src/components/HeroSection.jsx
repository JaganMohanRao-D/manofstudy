import React from 'react';
import {
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { FeaturesHub, WORKSPACES } from './FeaturesHub';

export const HeroSection = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
}) => {
  return (
    <section
      id="hero-banner"
      className="relative overflow-hidden bg-slate-950 text-white py-10 sm:py-16 lg:py-20 px-4 sm:px-8 border-b border-slate-800 rounded-3xl shadow-2xl space-y-8 sm:space-y-10 min-h-fit break-words"
    >
      {/* Background Ambience:
          Heavy radial-blur layers are disabled on mobile (<640px) to prevent
          render-blocking composite stalls and GPU memory exhaustion */}
      <div className="hidden sm:block absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[110px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      
      {/* Lightweight subtle gradient overlay for mobile */}
      <div className="block sm:hidden absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="hidden sm:block absolute inset-0 bg-[radial-gradient(#38bdf812_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Hero Header & Value Proposition */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            🔥 AP &amp; TG FINAL PHASE ALLOTMENTS NAME WISE
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-900/90 text-emerald-300 border border-emerald-500/30 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Client-Side Private
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-slate-900/90 text-amber-300 border border-amber-500/30 shadow-md">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            EAPCET Seat Radar
          </span>
        </div>

        {/* Clean Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight text-center px-2 break-words">
          OF THE STUDENT, BY THE STUDENT,<br />
          <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            FOR THE STUDENT
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal px-2">
          From Tier-3 hostel rooms to high-growth tech careers: Phase-2 Seat Radar, Attendance Defender, 24+ Multi-Discipline Roadmaps, and In-Browser Instant PDF/Photo Power Tools.
        </p>

        {/* Metrics Strip: High-performance mobile tags */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>28+ Verified Scholarships</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>24+ Degree &amp; B.Tech Roadmaps</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>9+ Survival Guides</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>100% Free Forever</span>
          </div>
        </div>
      </div>

      {/* Quick-Action Compact Features Hub */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <FeaturesHub
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={onSelectWorkspace}
        />
      </div>
    </section>
  );
};

export default HeroSection;
