import React, { useState } from 'react';
import {
  Building2,
  GitBranch,
  Award,
  Users,
  Layers,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  CollegeDashboardAnalytics,
  CollegeDetailData,
} from '../../services/apAllotmentUnifiedService';

interface APCollegeInsightViewProps {
  analytics: CollegeDashboardAnalytics;
  collegeData: CollegeDetailData;
  year?: string;
  onSelectBranch?: (branchCode: string) => void;
  selectedBranchCode?: string;
}

export const APCollegeInsightView: React.FC<APCollegeInsightViewProps> = ({
  analytics,
  collegeData,
  year = '2026',
  onSelectBranch,
  selectedBranchCode = 'ALL',
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'categories' | 'demographics'>('branches');

  const {
    collegeName,
    collegeCode,
    totalAllotments,
    branchCount,
    bestOverallRank,
    lastOverallRank,
    medianRank,
    branches,
    categoryInsights,
    allottedCategoryInsights,
    genderDistribution,
    phaseDistribution,
    regionDistribution,
  } = analytics;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-all">
      {/* College Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-400/30">
              {collegeCode}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-2xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Observed {year} Allotment Data</span>
            </span>
            {collegeData.district && (
              <span className="px-2.5 py-0.5 rounded-lg text-2xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{collegeData.district}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {collegeName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Comprehensive college dashboard calculated from official {year} counseling registers • Not guaranteed cutoffs
            </span>
          </p>
        </div>

        {/* Action button to reset branch filter */}
        {selectedBranchCode !== 'ALL' && onSelectBranch && (
          <button
            type="button"
            onClick={() => onSelectBranch('ALL')}
            className="self-start md:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/40 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Viewing branch [{selectedBranchCode}] • Reset to All</span>
          </button>
        )}
      </div>

      {/* Top 4 Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/5 to-sky-500/10 border border-sky-200/70 dark:border-sky-800/50">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Total Allotments</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {(totalAllotments ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Admitted students across all phases
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border border-indigo-200/70 dark:border-indigo-800/50">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Available Branches</span>
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {branchCount}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Distinct engineering disciplines
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-200/70 dark:border-emerald-800/50">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Best Observed Rank</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
            {bestOverallRank > 0 ? bestOverallRank.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Top candidate admitted to college
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-200/70 dark:border-amber-800/50">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Last Observed Rank</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 tracking-tight">
            {lastOverallRank > 0 ? lastOverallRank.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
            Median admitted rank: {medianRank > 0 ? medianRank.toLocaleString('en-IN') : '—'}
          </span>
        </div>
      </div>

      {/* Tabs navigation for details */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Branch-Wise Allotments ({branches.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Category Rank Ranges ({categoryInsights.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('demographics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'demographics'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Gender, Phase &amp; Region
        </button>
      </div>

      {/* TAB 1: Branch-Wise Allotments */}
      {activeTab === 'branches' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Click any branch to quickly filter students below</span>
            <span className="text-3xs text-amber-600 dark:text-amber-400 font-semibold">
              Observed {year} allotment data • Not guaranteed cutoffs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {branches.map((b) => {
              const isSelected = selectedBranchCode === b.branchCode;
              return (
                <div
                  key={b.branchCode}
                  onClick={() => onSelectBranch && onSelectBranch(isSelected ? 'ALL' : b.branchCode)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-2xs font-black rounded-md bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                        {b.branchCode}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {b.allotmentCount} Allotments
                      </span>
                    </div>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 text-3xs font-extrabold uppercase rounded bg-sky-600 text-white">
                        Filtered
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {b.branchName}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 text-2xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-3xs uppercase">
                        Best Rank
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {b.bestRank > 0 ? b.bestRank.toLocaleString('en-IN') : '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 dark:text-slate-400 block text-3xs uppercase">
                        Last Rank
                      </span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">
                        {b.lastRank > 0 ? b.lastRank.toLocaleString('en-IN') : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Category Observed Rank Ranges */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-2xs text-sky-800 dark:text-sky-200 leading-relaxed">
            <strong>Observed {year} Allotment Ranges:</strong> These represent the actual minimum and maximum ranks observed in our verified dataset across all branches for each category. These are historical observations, not guaranteed future admission cutoffs.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryInsights.map((cat) => (
              <div
                key={cat.category}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {cat.category}
                  </span>
                  <span className="text-2xs font-semibold text-slate-500 dark:text-slate-400">
                    {cat.studentCount} students
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-3xs text-slate-500 uppercase block">Best Observed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {cat.bestRank > 0 ? cat.bestRank.toLocaleString('en-IN') : '—'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xs text-slate-500 uppercase block">Last Observed</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {cat.lastRank > 0 ? cat.lastRank.toLocaleString('en-IN') : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-3xs text-slate-500 pt-1">
                  <span>M: {cat.maleCount}</span>
                  <span>F: {cat.femaleCount}</span>
                </div>
              </div>
            ))}
          </div>

          {allottedCategoryInsights.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Allotted Quota Breakdown (Top 12 Quotas)
              </h4>
              <div className="flex flex-wrap gap-2">
                {allottedCategoryInsights.slice(0, 12).map((a) => (
                  <span
                    key={a.allottedCategory}
                    className="px-2.5 py-1 rounded-xl text-2xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {a.allottedCategory} ({a.count} seats, Last: {a.lastRank != null ? a.lastRank.toLocaleString('en-IN') : '—'})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Demographics & Distribution */}
      {activeTab === 'demographics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gender Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gender Distribution
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-sky-600 dark:text-sky-400">
                  Male: {genderDistribution.male} ({genderDistribution.malePct}%)
                </span>
                <span className="text-pink-600 dark:text-pink-400">
                  Female: {genderDistribution.female} ({genderDistribution.femalePct}%)
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-sky-500 h-full transition-all"
                  style={{ width: `${genderDistribution.malePct}%` }}
                />
                <div
                  className="bg-pink-500 h-full transition-all"
                  style={{ width: `${genderDistribution.femalePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Phase Distribution */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phase-Wise Allotments
            </h4>
            <div className="space-y-2">
              {Object.entries(phaseDistribution).map(([phase, cnt]) => (
                <div key={phase} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Phase {phase}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-2xs">
                    {cnt} seats ({totalAllotments > 0 ? Math.round((Number(cnt) / totalAllotments) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Region Distribution */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Region Quota Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(regionDistribution).map(([reg, cnt]) => (
                <div key={reg} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {reg === 'AU' ? 'AU (Andhra Univ)' : reg === 'SVU' ? 'SVU (Sri Venkateswara)' : reg}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-2xs">
                    {cnt} candidates
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APCollegeInsightView;
