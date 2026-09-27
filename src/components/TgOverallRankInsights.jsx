import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Info, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  HelpCircle,
  Building2,
  GitBranch,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { TG_EAPCET_CATEGORY_INSIGHTS } from '../data/tgEapcetCollegeManifest';

// Distinctive color palettes for reservation categories
const CATEGORY_BADGE_STYLES = {
  OC: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  EWS: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'BC-A': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'BC-B': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'BC-C': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  'BC-D': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'BC-E': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'SC-I': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'SC-II': 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  'SC-III': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  ST: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
};

export default function TgOverallRankInsights({ className = '' }) {
  // Mode selection: 'quota' (Allotted Seat Quota) vs 'caste' (Candidate Social Category)
  const [activeMode, setActiveMode] = useState('quota');
  // Expanded category key for detailed inspection
  const [expandedCategory, setExpandedCategory] = useState(null);
  // Search / filter within categories
  const [categoryQuery, setCategoryQuery] = useState('');
  // Copied feedback state
  const [copiedKey, setCopiedKey] = useState(null);

  const insightsData = TG_EAPCET_CATEGORY_INSIGHTS;
  const datasetStats = insightsData?.datasetStats || {
    totalRecords: 71646,
    totalColleges: 151,
    totalBranches: 37,
    generatedAt: '2026-09-20'
  };

  // Select list based on active mode
  const currentCategoryList = useMemo(() => {
    const list = activeMode === 'quota' 
      ? (insightsData?.byAllottedQuota || [])
      : (insightsData?.byCandidateCaste || []);

    if (!categoryQuery.trim()) return list;
    const q = categoryQuery.toLowerCase().trim();
    return list.filter(item => 
      item.displayLabel.toLowerCase().includes(q) ||
      item.categoryName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [activeMode, categoryQuery, insightsData]);

  // Handle copying a category summary
  const handleCopyCategory = (item, e) => {
    e.stopPropagation();
    const boysText = item.boys.topRank !== null 
      ? `Boys Top: #${item.boys.topRank?.toLocaleString()} | Last: #${item.boys.lastRank?.toLocaleString()} (${item.boys.recordCount.toLocaleString()} candidates)`
      : 'Boys: N/A';
    const girlsText = item.girls.topRank !== null 
      ? `Girls Top: #${item.girls.topRank?.toLocaleString()} | Last: #${item.girls.lastRank?.toLocaleString()} (${item.girls.recordCount.toLocaleString()} candidates)`
      : 'Girls: N/A';
    const text = `TG EAPCET 2026 Observed Rank Range [${item.displayLabel} - ${item.categoryName}]\n${boysText}\n${girlsText}\nTotal: ${item.totalRecords.toLocaleString()} across ${item.collegesRepresented} colleges (Source: Man of Study)`;

    navigator.clipboard.writeText(text);
    setCopiedKey(item.category);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <section 
      id="tg-overall-rank-insights" 
      aria-label="TG EAPCET 2026 Overall Rank Insights"
      className={`bg-white/95 dark:bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-200 dark:border-slate-800/90 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* 1. SECTION HEADER */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-white dark:bg-slate-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Statewide Verified 2026 Final Phase Allotment Dataset</span>
            </div>
            
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
              TG EAPCET 2026 — Overall Rank Insights
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Lowest and highest observed ranks across all available colleges and branches.
            </p>
          </div>

          {/* Dataset Transparency Badge */}
          <div className="shrink-0 bg-slate-100 dark:bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-left md:text-right shadow-inner">
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center md:justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Data Transparency Indicator</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Analysed: <span className="text-emerald-400">{datasetStats.totalRecords.toLocaleString()}</span> records
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              across <strong className="text-slate-700 dark:text-slate-300">{datasetStats.totalColleges}</strong> colleges &amp; <strong className="text-slate-700 dark:text-slate-300">{datasetStats.totalBranches}</strong> branches
            </div>
          </div>
        </div>

        {/* 2. MODE SWITCHER & CATEGORY VS ALLOTTED CATEGORY EXPLANATION */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              Classification View:
            </span>

            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                id="view-by-allotted-quota"
                onClick={() => setActiveMode('quota')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMode === 'quota'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
                }`}
              >
                Allotted Seat Quota (Includes EWS)
              </button>
              
              <button
                type="button"
                id="view-by-candidate-caste"
                onClick={() => setActiveMode('caste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMode === 'caste'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
                }`}
              >
                Candidate Registered Caste
              </button>
            </div>
          </div>

          {/* Quick filter by category name */}
          <div className="relative">
            <input
              type="text"
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
              placeholder="Filter categories (e.g. BC, SC, EWS)..."
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 w-full sm:w-60"
            />
            {categoryQuery && (
              <button
                type="button"
                onClick={() => setCategoryQuery('')}
                className="absolute right-2.5 top-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Informative Guidance on Quota vs Caste */}
        <div className="mt-3 bg-slate-100 dark:bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            {activeMode === 'quota' ? (
              <span>
                <strong className="text-slate-800 dark:text-slate-200">Allotted Seat Quota:</strong> Reflects the exact reservation category under which seats were allocated in the official allotment orders (e.g., <strong className="text-emerald-400">EWS</strong> 10% quota, <strong className="text-emerald-400">BC-A to BC-E</strong>, <strong className="text-emerald-400">SC-I/II/III</strong>, <strong className="text-emerald-400">ST</strong>, and Open Merit <strong className="text-emerald-400">OC</strong>).
              </span>
            ) : (
              <span>
                <strong className="text-slate-800 dark:text-slate-200">Candidate Registered Caste:</strong> Reflects the applicant's community declared at registration. 
                <span className="text-amber-300 ml-1">
                  Note: In the official state database, EWS applicants are registered under community 'OC' with an EWS quota allotment.
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. MAIN DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/90 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <th scope="col" className="py-3 px-3 sm:px-4 text-left">
                Category
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-center">
                <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Boys — Top Rank
                </div>
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-center">
                <div className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Boys — Last Rank
                </div>
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-center">
                <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Girls — Top Rank
                </div>
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-center">
                <div className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Girls — Last Rank
                </div>
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs sm:text-sm">
            {currentCategoryList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-600 dark:text-slate-400 text-xs">
                  No matching category found for "{categoryQuery}".
                </td>
              </tr>
            ) : (
              currentCategoryList.map((item) => {
                const isExpanded = expandedCategory === item.category;
                const badgeStyle = CATEGORY_BADGE_STYLES[item.displayLabel] || 'bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-700';
                const isCopied = copiedKey === item.category;

                // Handle null/empty data for categories that do not exist under caste (e.g. EWS under caste)
                const boysTop = item.boys.topRank !== null ? item.boys.topRank.toLocaleString() : '—';
                const boysLast = item.boys.lastRank !== null ? item.boys.lastRank.toLocaleString() : '—';
                const girlsTop = item.girls.topRank !== null ? item.girls.topRank.toLocaleString() : '—';
                const girlsLast = item.girls.lastRank !== null ? item.girls.lastRank.toLocaleString() : '—';

                return (
                  <React.Fragment key={item.category}>
                    <tr 
                      onClick={() => setExpandedCategory(isExpanded ? null : item.category)}
                      className={`group hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      {/* Category Label & Subtitle */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-extrabold border ${badgeStyle}`}>
                            {item.displayLabel}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium hidden sm:inline text-xs truncate max-w-[200px]" title={item.categoryName}>
                            {item.categoryName}
                          </span>
                        </div>
                      </td>

                      {/* Boys — Top Rank */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">
                        {item.boys.topRank !== null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                            #{boysTop}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 italic">N/A</span>
                        )}
                      </td>

                      {/* Boys — Last Rank */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">
                        {item.boys.lastRank !== null ? (
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            #{boysLast}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 italic">N/A</span>
                        )}
                      </td>

                      {/* Girls — Top Rank */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">
                        {item.girls.topRank !== null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                            #{girlsTop}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 italic">N/A</span>
                        )}
                      </td>

                      {/* Girls — Last Rank */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">
                        {item.girls.lastRank !== null ? (
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            #{girlsLast}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 italic">N/A</span>
                        )}
                      </td>

                      {/* Actions & Expansion */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleCopyCategory(item, e)}
                            title="Copy category stats"
                            className="p-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-800 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:text-slate-200 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED DETAIL VIEW FOR THIS CATEGORY */}
                    {isExpanded && (
                      <tr className="bg-slate-100 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={6} className="p-4 sm:p-5">
                          <div className="space-y-3.5 animate-in fade-in duration-150">
                            {/* Detailed Title */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-200 dark:border-slate-800/80 pb-2.5">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${badgeStyle}`}>
                                    {item.displayLabel}
                                  </span>
                                  <span>{item.categoryName}</span>
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                  Observed across {item.collegesRepresented} engineering institutions in {item.branchesRepresented} academic branches.
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold">
                                  Total Allotted: <strong className="text-slate-900 dark:text-white">{item.totalRecords.toLocaleString()}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Two-column Gender Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Boys Breakdown */}
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span className="text-emerald-400 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    Boys (Male) Candidate Insights
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                    {item.boys.recordCount.toLocaleString()} candidates
                                  </span>
                                </div>

                                {item.boys.recordCount > 0 ? (
                                  <div className="space-y-1.5 pt-1 text-xs">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-600 dark:text-slate-400">Top Rank (Smallest):</span>
                                      <span className="font-mono font-bold text-emerald-400">
                                        #{item.boys.topRank?.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-600 dark:text-slate-400">Last Rank (Largest):</span>
                                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                        #{item.boys.lastRank?.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                                      <span>Colleges Represented:</span>
                                      <span className="font-mono text-slate-700 dark:text-slate-300">{item.boys.collegesCount} colleges</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                                      <span>Branches Represented:</span>
                                      <span className="font-mono text-slate-700 dark:text-slate-300">{item.boys.branchesCount} branches</span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
                                    No direct male candidate records under this specific grouping.
                                  </p>
                                )}
                              </div>

                              {/* Girls Breakdown */}
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span className="text-pink-400 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    Girls (Female) Candidate Insights
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                    {item.girls.recordCount.toLocaleString()} candidates
                                  </span>
                                </div>

                                {item.girls.recordCount > 0 ? (
                                  <div className="space-y-1.5 pt-1 text-xs">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-600 dark:text-slate-400">Top Rank (Smallest):</span>
                                      <span className="font-mono font-bold text-emerald-400">
                                        #{item.girls.topRank?.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-600 dark:text-slate-400">Last Rank (Largest):</span>
                                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                        #{item.girls.lastRank?.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                                      <span>Colleges Represented:</span>
                                      <span className="font-mono text-slate-700 dark:text-slate-300">{item.girls.collegesCount} colleges</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                                      <span>Branches Represented:</span>
                                      <span className="font-mono text-slate-700 dark:text-slate-300">{item.girls.branchesCount} branches</span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
                                    No direct female candidate records under this specific grouping.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. FOOTER EXPLANATORY DEFINITIONS (STRICT COMPLIANCE REQUIREMENT) */}
      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-100 dark:bg-slate-950/80 space-y-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          Important Definitions &amp; Methodology:
        </h4>
        
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-slate-800 dark:text-slate-200">Top Rank:</strong> Lowest numerical rank observed in the allotment records (indicates the highest scoring candidate allotted in this pool).
            </span>
          </li>
          
          <li className="flex items-start gap-1.5">
            <span className="text-slate-600 dark:text-slate-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-slate-800 dark:text-slate-200">Last Rank:</strong> Highest numerical rank observed in the allotment records (indicates the closing candidate allotted in this pool).
            </span>
          </li>

          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-slate-800 dark:text-slate-200">Based on Real Data:</strong> Calculated directly from all {datasetStats.totalColleges} Telangana colleges and {datasetStats.totalBranches} branches published by TGCHE.
            </span>
          </li>

          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-slate-800 dark:text-slate-200">Advisory Note:</strong> These are observed 2026 Final Phase allotment ranks, not guaranteed future cutoffs for next year's counseling.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
