import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div
      id="hero-banner"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs"
    >
      <div>
        <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          All-in-One Student &amp; Career Utility Hub
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast, private PDF tools, image compressors, scholarship alerts &amp; AP EAPCET vacancy insights.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          100% In-Browser Privacy
        </span>
      </div>
    </div>
  );
};


