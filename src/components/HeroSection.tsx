import React from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  FileText,
  FileSearch,
  Radar,
  GraduationCap,
  Image as ImageIcon,
  CheckCircle2,
  Globe,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { ToolTab } from '../types';

interface HeroSectionProps {
  onSelectTool: (tab: ToolTab) => void;
  activeTab: ToolTab;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectTool,
  activeTab,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-10 transition-all">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-sky-50 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>GLOBAL PRODUCTIVITY PLATFORM</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% In-Memory Client Processing • Zero Server Uploads</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>AP EAPCET Phase 2 Live</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            High-Performance Utility Suite for{' '}
            <span className="text-sky-600 underline decoration-sky-300 decoration-wavy decoration-1 underline-offset-4">
              Students &amp; Professionals
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            From <strong>30+ WebAssembly PDF utilities</strong> and an{' '}
            <strong>ATS resume keyword matcher</strong> to <strong>exam photo KB compressors</strong> and the live{' '}
            <strong>AP EAPCET Vacancy Radar</strong>. Every calculation and document transformation runs completely inside your browser RAM with zero server latency, uncompromised privacy, and no data collection.
          </p>
        </div>

        {/* Key Feature Highlights Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>30+ PDF Utilities</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Merge, split, compress, watermark, redact &amp; convert.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <FileSearch className="w-4 h-4 text-emerald-600" />
              <span>ATS Resume Builder</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Client-side JD keyword matcher &amp; 1-click clean builder.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span>Exact KB Resizer</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Precise 20KB–500KB photo &amp; sign compression for portals.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Radar className="w-4 h-4 text-rose-600" />
              <span>AP EAPCET Radar</span>
            </div>
            <p className="text-[11px] text-slate-500">
              College-wise vacancies, branch intakes &amp; fee structures.
            </p>
          </div>
        </div>

        {/* Quick Jump Action Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Launch:</span>

          <button
            onClick={() => onSelectTool('pdf-tools')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              activeTab === 'pdf-tools'
                ? 'bg-sky-500 text-white border-sky-500 font-semibold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            PDF Power Suite
          </button>

          <button
            onClick={() => onSelectTool('eapcet-radar')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              activeTab === 'eapcet-radar'
                ? 'bg-rose-500 text-white border-rose-500 font-semibold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-rose-500" />
            AP EAPCET Vacancies
          </button>

          <button
            onClick={() => onSelectTool('resume-checker')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              activeTab === 'resume-checker'
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
            ATS Resume Matcher
          </button>

          <button
            onClick={() => onSelectTool('attendance')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
            Attendance Defender
          </button>
        </div>
      </div>
    </div>
  );
};
