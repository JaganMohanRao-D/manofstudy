import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Flame,
  Users,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
} from 'lucide-react';
import {
  CategoryRankInsight,
  AllottedCategoryInsight,
} from '../../services/apAllotmentUnifiedService';

interface BranchAnalyticsResult {
  totalStudents: number;
  bestOverallRank: number;
  lastOverallRank: number;
  categoryInsights: CategoryRankInsight[];
  allottedCategoryBreakdown: AllottedCategoryInsight[];
}

interface APCategoryInsightsProps {
  analytics: BranchAnalyticsResult;
  collegeName: string;
  collegeCode: string;
  branchName: string;
  branchCode: string;
  selectedCategoryFilter: string;
  onSelectCategoryFilter: (category: string) => void;
}

export const APCategoryInsights: React.FC<APCategoryInsightsProps> = ({
  analytics,
  collegeName,
  collegeCode,
  branchName,
  branchCode,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}) => {
  const [isAllottedCatExpanded, setIsAllottedCatExpanded] = useState(false);
  const [animateGenderGraph, setAnimateGenderGraph] = useState(false);

  const getCategoryColor = (cat: string) => {
    const c = (cat || '').toUpperCase();
    if (c.startsWith('OC')) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (c.startsWith('BC_A')) return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    if (c.startsWith('BC_B')) return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    if (c.startsWith('BC_C')) return { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
    if (c.startsWith('BC_D')) return { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' };
    if (c.startsWith('BC_E')) return { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' };
    if (c.startsWith('SC')) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (c.startsWith('ST')) return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    if (c.startsWith('EWS')) return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  };

  const totalStudents = (analytics?.totalStudents ?? 0).toLocaleString();
  const maleCount = (analytics as any)?.genderDistribution?.male ?? 0;
  const malePct = (analytics as any)?.genderDistribution?.malePct ?? 0;
  const femaleCount = (analytics as any)?.genderDistribution?.female ?? 0;
  const femalePct = (analytics as any)?.genderDistribution?.femalePct ?? 0;
  const otherCount = (analytics as any)?.genderDistribution?.other ?? 0;

  // Recalculate the displayed gender ratio from the actual M/F counts so the
  // graph always matches the currently selected year, phase, college and branch.
  // Percentages are calculated only across records with a known M/F gender.
  const genderKnownTotal = maleCount + femaleCount;
  const maleRatioPct = genderKnownTotal > 0 ? Number(((maleCount / genderKnownTotal) * 100).toFixed(1)) : 0;
  const femaleRatioPct = genderKnownTotal > 0 ? Number(((femaleCount / genderKnownTotal) * 100).toFixed(1)) : 0;

  useEffect(() => {
    setAnimateGenderGraph(false);
    const frame = window.requestAnimationFrame(() => setAnimateGenderGraph(true));
    return () => window.cancelAnimationFrame(frame);
  }, [maleCount, femaleCount]);

  const medianRank = analytics?.medianRank ?? (analytics as any)?.medianAllotmentRank ?? 0;
  const bestRank = analytics?.bestOverallRank ?? 0;
  const lastRank = analytics?.lastOverallRank ?? 0;
  const categoryInsights = analytics?.categoryInsights ?? [];
  const allottedQuotas = (analytics as any)?.allottedCategoryInsights || analytics?.allottedCategoryBreakdown || [];

  return (
    <div className="space-y-4">
      {/* 4 Summary Metric Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Total Allotted */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-500" />
            Total Seats Allotted
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStudents}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Boys: {maleCount} ({malePct}%) | Girls: {femaleCount} ({femalePct}%)
          </div>
        </div>

        {/* Metric 2: Median Rank */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            Median Allotment Rank
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {medianRank > 0 ? `#${medianRank.toLocaleString()}` : '—'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            50th percentile rank admitted
          </div>
        </div>

        {/* Metric 3: Opening Rank (Best) */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            Opening Rank (Best)
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {bestRank > 0 ? `#${bestRank.toLocaleString()}` : '—'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            First admitted student in this pool
          </div>
        </div>

        {/* Metric 4: Closing Cutoff Rank */}
        <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Closing Cutoff Rank
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {lastRank > 0 ? `#${lastRank.toLocaleString()}` : '—'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Last admitted student in this pool
          </div>
        </div>
      </div>

      {/* Animated Gender Ratio */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gender Ratio of Allotted Students</h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Boys vs girls among gender-labelled allotment records for this selected dataset and filters.
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {genderKnownTotal.toLocaleString()} gender-labelled allotments
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">Boys</span>
              <span className="text-base sm:text-lg font-black text-sky-700 dark:text-sky-300">{maleRatioPct}%</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {maleCount.toLocaleString()} students
            </div>
          </div>
          <div className="rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/70 dark:bg-pink-950/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-pink-700 dark:text-pink-300">Girls</span>
              <span className="text-base sm:text-lg font-black text-pink-700 dark:text-pink-300">{femaleRatioPct}%</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {femaleCount.toLocaleString()} students
            </div>
          </div>
        </div>

        <div className="mt-4 h-5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner" aria-label={`Gender ratio: boys ${maleRatioPct} percent, girls ${femaleRatioPct} percent`}>
          <div
            className="h-full bg-sky-500 origin-left"
            style={{
              width: `${maleRatioPct}%`,
              transform: animateGenderGraph ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            title={`Boys: ${maleRatioPct}%`}
          />
          <div
            className="h-full bg-pink-500 origin-left"
            style={{
              width: `${femaleRatioPct}%`,
              transform: animateGenderGraph ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 100ms',
            }}
            title={`Girls: ${femaleRatioPct}%`}
          />
        </div>

        {otherCount > 0 && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
            {otherCount.toLocaleString()} records have an unclassified/other gender value and are excluded from the M/F ratio.
          </p>
        )}
      </div>

      {/* Category-Wise Rank Insights (Observed Best & Last Ranks) */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Category-Wise Observed Rank Insights [{branchCode}]
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Observed allotment ranks in this dataset (Minimum &amp; Maximum numerical rank per student category)
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium self-start sm:self-auto">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            <span>Click category card to filter students</span>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
          {categoryInsights.map((item) => {
            const colors = getCategoryColor(item.category);
            const isSelected = selectedCategoryFilter === item.category;

            return (
              <div
                key={item.category}
                onClick={() => onSelectCategoryFilter(isSelected ? 'ALL' : item.category)}
                className={`rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                    {item.studentCount} {item.studentCount === 1 ? 'seat' : 'seats'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-200 dark:border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                      Best Rank
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.bestRank > 0 ? `#${item.bestRank.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                      Last Rank
                    </span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {item.lastRank > 0 ? `#${item.lastRank.toLocaleString()}` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 mt-1 border-t border-dashed border-slate-200 dark:border-slate-800/40">
                  <span>Boys: {item.maleCount ?? 0}</span>
                  <span>Girls: {item.femaleCount ?? 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distinction Note: Allotted Category vs Candidate Category */}
      <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-3 sm:p-3.5 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block">Candidate Category vs. Allotted Category:</span>
          <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300/90">
            Candidate Category indicates the student&apos;s social community (e.g. BC_D, SC, OC), while Allotted Category indicates the specific seat pool or quota rule assigned during counseling (e.g. OC_GIRLS_UR, BC_A_GEN_AU). Both are preserved exactly as reported in the official allotment records.
          </p>
        </div>
      </div>

      {/* Collapsible Allotted Quotas Breakdown */}
      {allottedQuotas.length > 0 && (
        <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Allotted Quota Distribution ({allottedQuotas.length} Quota Codes)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAllottedCatExpanded(!isAllottedCatExpanded)}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isAllottedCatExpanded ? 'Collapse Quotas' : 'Expand Quotas'}</span>
              {isAllottedCatExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5' />}
            </button>
          </div>

          {isAllottedCatExpanded && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 animate-in fade-in duration-150">
              {allottedQuotas.map((q: any) => (
                <div
                  key={q.allottedCategory}
                  className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-purple-600 dark:text-purple-300 truncate max-w-[130px]">
                      {q.allottedCategory}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{q.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>#{q.bestRank != null ? q.bestRank.toLocaleString() : '—'}</span>
                    <span>→</span>
                    <span>#{q.lastRank != null ? q.lastRank.toLocaleString() : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default APCategoryInsights;
