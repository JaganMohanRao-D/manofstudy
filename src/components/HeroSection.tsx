import React from 'react';
import {
  Sparkles,
  FileText,
  FileSearch,
  Radar,
  GraduationCap,
  Image as ImageIcon,
  ArrowRight,
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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 sm:p-6 transition-all">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-sky-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-2 sm:space-y-3">
        {/* Compact Hero Title & 1-Line Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            All-in-One Student &amp; Career Utility Hub
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Fast, private PDF tools, image compressors, scholarship alerts &amp; AP EAPCET vacancy insights.
          </p>
        </div>

        {/* Clean Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] hidden sm:inline">Popular:</span>

          <button
            onClick={() => onSelectTool('pdf-tools')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              activeTab === 'pdf-tools'
                ? 'bg-sky-500 text-white border-sky-500 font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50 font-medium'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>30+ PDF Tools</span>
          </button>

          <button
            onClick={() => onSelectTool('eapcet-radar')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              activeTab === 'eapcet-radar'
                ? 'bg-rose-500 text-white border-rose-500 font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50 font-medium'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-rose-500" />
            <span>AP EAPCET Radar</span>
          </button>

          <button
            onClick={() => onSelectTool('resume-checker')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              activeTab === 'resume-checker'
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 font-medium'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
            <span>ATS Resume Matcher</span>
          </button>

          <button
            onClick={() => onSelectTool('resizer')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              activeTab === 'resizer'
                ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50 font-medium'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>20KB–50KB Resizer</span>
          </button>

          <button
            onClick={() => onSelectTool('attendance')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50 font-medium'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
            <span>Attendance Defender</span>
          </button>
        </div>
      </div>
    </div>
  );
};

