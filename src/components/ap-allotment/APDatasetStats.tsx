import React from 'react';
import { Building2, GitBranch, Users, Layers, Award, Calendar } from 'lucide-react';
import { ApAllotmentGlobalStats } from '../../data/apEapcetCollegeManifest';

interface APDatasetStatsProps {
  stats: ApAllotmentGlobalStats;
}

export const APDatasetStats: React.FC<APDatasetStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {/* Total Colleges */}
      <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm backdrop-blur-xl transition-all hover:border-cyan-500/40">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-500" />
            Engineering Colleges
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {stats.totalColleges}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          All 255 AP Institutions
        </div>
      </div>

      {/* Total Allotted Students */}
      <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            Allotment Records
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
          {stats.totalRecords.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Verified Student Seats
        </div>
      </div>

      {/* Total Branches */}
      <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-500/40">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
            Branch Streams
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
          {stats.totalBranches.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          CSE, ECE, EEE, MEC, etc.
        </div>
      </div>

      {/* Categories & Quotas */}
      <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm backdrop-blur-xl transition-all hover:border-purple-500/40">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            Categories &amp; Quotas
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
          {stats.categories.length} Pools
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          OC, BC_A-E, SC, ST, EWS
        </div>
      </div>

      {/* Counseling Phases */}
      <div className="col-span-2 sm:col-span-1 bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm backdrop-blur-xl transition-all hover:border-amber-500/40">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Counseling Phases
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
          Phase 1 &amp; 2
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Complete Official Rounds
        </div>
      </div>
    </div>
  );
};
export default APDatasetStats;
