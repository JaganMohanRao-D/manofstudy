import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Search,
  Building2,
  GitBranch,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Info,
  X,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import {
  runApPredictorAnalysis,
  getApPredictorIndex,
  AP_SOCIAL_CATEGORIES,
  AP_BRANCH_OPTIONS,
  ApCollegeBranchMatch,
  ApPredictorResponse,
} from '../services/apCollegePredictorService';

export interface ApCollegePredictorProps {
  initialCollegeCode?: string;
  initialBranchCode?: string;
  onNavigateToAllotment?: (collegeCode: string, branchCode?: string) => void;
}

export const ApCollegePredictor: React.FC<ApCollegePredictorProps> = ({
  initialCollegeCode = '',
  initialBranchCode = 'ALL',
  onNavigateToAllotment,
}) => {
  // Navigation tabs: 'predictor' vs 'web-options'
  const [activeTab, setActiveTab] = useState<'predictor' | 'web-options'>('predictor');

  // Input states - NEVER default to AUCE or CBIT!
  const [rankInput, setRankInput] = useState<string>('22500');
  const [rankError, setRankError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('OC');
  const [selectedGender, setSelectedGender] = useState<string>('M');
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranchCode && initialBranchCode !== 'ALL' ? initialBranchCode : 'ALL'
  );
  const [selectedRegion, setSelectedRegion] = useState<string>('AU');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState<string>(
    initialCollegeCode && initialCollegeCode !== 'ALL' && initialCollegeCode !== 'CBIT' && initialCollegeCode !== 'AUCE'
      ? initialCollegeCode
      : ''
  );
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<ApPredictorResponse | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'WITHIN' | 'NEAR' | 'OUTSIDE' | 'INSUFFICIENT'>('ALL');
  const [sortBy, setSortBy] = useState<'SELECTIVE' | 'CLOSING_DESC' | 'CLOSEST_TO_RANK' | 'NAME_ASC'>('SELECTIVE');

  // Comparison State
  const [comparedColleges, setComparedColleges] = useState<ApCollegeBranchMatch[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Web Options Priority Order List
  const [webOptionsList, setWebOptionsList] = useState<ApCollegeBranchMatch[]>([]);
  const [hasCopiedList, setHasCopiedList] = useState<boolean>(false);

  // Run predictor analysis
  const handleRunPrediction = async (
    rankVal = rankInput,
    catVal = selectedCategory,
    genVal = selectedGender,
    branchVal = selectedBranch,
    regVal = selectedRegion,
    colVal = collegeSearchQuery
  ) => {
    const numRank = parseInt(String(rankVal).replace(/,/g, ''), 10);
    if (isNaN(numRank) || numRank < 1 || numRank > 350000) {
      setRankError('Please enter a valid rank between 1 and 350,000');
      return;
    }
    setRankError('');
    setIsAnalyzing(true);

    try {
      const response = await runApPredictorAnalysis({
        rank: numRank,
        category: catVal,
        gender: genVal,
        branch: branchVal,
        region: regVal,
        collegeQuery: colVal,
        sortBy,
      });
      setAnalysisResults(response);
    } catch (err) {
      console.warn('AP Predictor analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run first analysis on mount using 2026 predictor index
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsAnalyzing(true);
      try {
        await getApPredictorIndex();
        if (isMounted) {
          const colQuery =
            initialCollegeCode && initialCollegeCode !== 'ALL' && initialCollegeCode !== 'CBIT' && initialCollegeCode !== 'AUCE'
              ? initialCollegeCode
              : '';
          const branchQuery = initialBranchCode || 'ALL';
          handleRunPrediction('22500', 'OC', 'M', branchQuery, 'AU', colQuery);
        }
      } catch (err) {
        console.warn('Failed to initialize AP predictor:', err);
      } finally {
        if (isMounted) setIsAnalyzing(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & sort matches
  const sortedMatches = useMemo(() => {
    if (!analysisResults || !analysisResults.matches) return [];
    let list = [...analysisResults.matches];

    // Filter tab
    if (activeFilterTab === 'WITHIN') {
      list = list.filter((m) => m.classification === 'WITHIN_RANGE');
    } else if (activeFilterTab === 'NEAR') {
      list = list.filter((m) => m.classification === 'NEAR_RANGE');
    } else if (activeFilterTab === 'OUTSIDE') {
      list = list.filter((m) => m.classification === 'OUTSIDE_RANGE');
    } else if (activeFilterTab === 'INSUFFICIENT') {
      list = list.filter((m) => m.classification === 'INSUFFICIENT_DATA');
    }

    const sRank = analysisResults.appliedFilter.rank;
    if (sortBy === 'SELECTIVE') {
      list.sort((a, b) => {
        const p = { WITHIN_RANGE: 1, NEAR_RANGE: 2, OUTSIDE_RANGE: 3, INSUFFICIENT_DATA: 4 };
        if (p[a.classification] !== p[b.classification]) {
          return p[a.classification] - p[b.classification];
        }
        return a.minObservedRank - b.minObservedRank;
      });
    } else if (sortBy === 'CLOSING_DESC') {
      list.sort((a, b) => b.maxObservedRank - a.maxObservedRank);
    } else if (sortBy === 'CLOSEST_TO_RANK') {
      list.sort(
        (a, b) =>
          Math.abs(a.maxObservedRank - sRank) - Math.abs(b.maxObservedRank - sRank)
      );
    } else if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.collegeName.localeCompare(b.collegeName));
    }

    return list;
  }, [analysisResults, activeFilterTab, sortBy]);

  // Toggle compare
  const toggleCompare = (item: ApCollegeBranchMatch) => {
    if (comparedColleges.some((c) => c.id === item.id)) {
      setComparedColleges(comparedColleges.filter((c) => c.id !== item.id));
    } else {
      if (comparedColleges.length >= 4) {
        alert('You can compare a maximum of 4 colleges simultaneously.');
        return;
      }
      setComparedColleges([...comparedColleges, item]);
    }
  };

  // Toggle Web Option
  const toggleWebOption = (item: ApCollegeBranchMatch) => {
    if (webOptionsList.some((w) => w.id === item.id)) {
      setWebOptionsList(webOptionsList.filter((w) => w.id !== item.id));
    } else {
      setWebOptionsList([...webOptionsList, item]);
    }
  };

  // Copy web options
  const handleCopyWebOptions = () => {
    if (webOptionsList.length === 0) return;
    const text = webOptionsList
      .map(
        (w, i) =>
          `${i + 1}. [${w.collegeCode}] ${w.collegeName} - ${w.branchName} (${w.branchCode}) | Observed Closing: ${w.maxObservedRank != null ? w.maxObservedRank.toLocaleString('en-IN') : '—'}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setHasCopiedList(true);
    setTimeout(() => setHasCopiedList(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 md:p-10 border border-indigo-800/30 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AP EAPCET 2026 Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            AP College Predictor 2026
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Data-based admission estimates grounded in actual AP EAPCET 2026 allotment registers across all participating Andhra Pradesh colleges.
          </p>

          {/* Mandatory Disclaimer Label */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Based on AP EAPCET 2026 allotment records (Not a guaranteed seat assurance)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('predictor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'predictor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>College Predictor Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('web-options')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'web-options'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Web Options Strategy List ({webOptionsList.length})</span>
        </button>
      </div>

      {activeTab === 'predictor' ? (
        <div className="space-y-6">
          {/* INPUT FORM CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              <span>Enter Your Counseling Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Rank */}
              <div className="space-y-1.5">
                <label className="text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  AP EAPCET Rank
                </label>
                <input
                  type="number"
                  value={rankInput}
                  onChange={(e) => {
                    setRankInput(e.target.value);
                    if (rankError) setRankError('');
                  }}
                  placeholder="e.g. 15000"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {rankError && <p className="text-3xs font-bold text-rose-500">{rankError}</p>}
              </div>

              {/* 2. Category */}
              <div className="space-y-1.5">
                <label className="text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Community Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 pr-9 cursor-pointer"
                  >
                    {AP_SOCIAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 3. Gender */}
              <div className="space-y-1.5">
                <label className="text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGender('M')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedGender === 'M'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Male (M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGender('F')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedGender === 'F'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Female (F)
                  </button>
                </div>
              </div>

              {/* 4. Preferred Branch */}
              <div className="space-y-1.5">
                <label className="text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Target Course / Branch
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 pr-9 cursor-pointer"
                  >
                    {AP_BRANCH_OPTIONS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Optional Filter Toggle */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showMoreFilters ? '− Hide filters' : '+ College & region filters'}</span>
              </button>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() =>
                  handleRunPrediction(
                    rankInput,
                    selectedCategory,
                    selectedGender,
                    selectedBranch,
                    selectedRegion,
                    collegeSearchQuery
                  )
                }
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
                <span>Run 2026 Prediction</span>
              </button>
            </div>

            {showMoreFilters && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <label className="text-2xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Candidate Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="AU">AU (Andhra University Region)</option>
                    <option value="SVU">SVU (Sri Venkateswara Region)</option>
                    <option value="UR">UR / Non-Local (Statewide)</option>
                    <option value="ALL">All Regions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Filter by College Name / Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={collegeSearchQuery}
                    onChange={(e) => setCollegeSearchQuery(e.target.value)}
                    placeholder="Search college code or name..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SUMMARY CARDS */}
          {analysisResults && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button
                type="button"
                onClick={() => setActiveFilterTab('WITHIN')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeFilterTab === 'WITHIN'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                  <span className="text-2xs font-bold uppercase tracking-wider">Within Range</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {analysisResults.summary.withinRangeCount}
                </div>
                <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Admitted in 2026 within your rank
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilterTab('NEAR')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeFilterTab === 'NEAR'
                    ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
                  <span className="text-2xs font-bold uppercase tracking-wider">Near Range (±15%)</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                  {analysisResults.summary.nearRangeCount}
                </div>
                <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Borderline closing cutoff range
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilterTab('OUTSIDE')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeFilterTab === 'OUTSIDE'
                    ? 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
                  <span className="text-2xs font-bold uppercase tracking-wider">Outside Range</span>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-rose-700 dark:text-rose-300">
                  {analysisResults.summary.outsideRangeCount}
                </div>
                <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Above observed closing cutoff
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilterTab('ALL')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeFilterTab === 'ALL'
                    ? 'bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                  <span className="text-2xs font-bold uppercase tracking-wider">All Matches</span>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                  {analysisResults.summary.totalMatches}
                </div>
                <span className="text-3xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Across {analysisResults.summary.analyzedCollegesCount} AP colleges
                </span>
              </button>
            </div>
          )}

          {/* RESULTS LIST & CARDS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span>Predicted College Matches (2026 Dataset)</span>
                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    {sortedMatches.length} Options
                  </span>
                </h3>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Data-based estimate using official 2026 AP EAPCET allotment registers
                </p>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-2xs font-extrabold text-slate-400 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="SELECTIVE">Selective First (Top Cutoffs)</option>
                  <option value="CLOSING_DESC">Highest Closing Rank First</option>
                  <option value="CLOSEST_TO_RANK">Closest to My Rank</option>
                  <option value="NAME_ASC">College Name (A → Z)</option>
                </select>
              </div>
            </div>

            {/* List */}
            {isAnalyzing ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  Calculating deterministic matches from official 2026 AP allotment records...
                </p>
              </div>
            ) : sortedMatches.length === 0 ? (
              <div className="py-16 text-center space-y-2 max-w-sm mx-auto">
                <Info className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Insufficient 2026 allotment data for this combination
                </h4>
                <p className="text-xs text-slate-500">
                  No verified 2026 allotment records were recorded matching your selected rank, branch, and category. Try switching the branch filter to "All Branches" or relaxing your search query.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedMatches.map((m) => {
                  const isCompared = comparedColleges.some((c) => c.id === m.id);
                  const isWebOption = webOptionsList.some((w) => w.id === m.id);

                  return (
                    <div
                      key={m.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md font-mono text-2xs font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                              {m.collegeCode}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-2xs font-extrabold border flex items-center gap-1.5 ${m.badgeStyle.bg} ${m.badgeStyle.text} ${m.badgeStyle.border}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${m.badgeStyle.indicator}`}
                              />
                              <span>{m.classificationLabel}</span>
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {m.collegeName}
                          </h4>

                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                            <span>
                              {m.branchName} ({m.branchCode})
                            </span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start">
                          <button
                            type="button"
                            onClick={() => toggleWebOption(m)}
                            className={`px-3 py-1.5 rounded-xl text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isWebOption
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {isWebOption ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            <span>{isWebOption ? 'Saved Option' : 'Save Option'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleCompare(m)}
                            className={`px-3 py-1.5 rounded-xl text-2xs font-bold transition-all cursor-pointer ${
                              isCompared
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                          </button>

                          {onNavigateToAllotment && (
                            <button
                              type="button"
                              onClick={() => onNavigateToAllotment(m.collegeCode, m.branchCode)}
                              className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                              title="Inspect this college in AP Allotments (Namewise)"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Rank Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                          <span className="text-3xs text-slate-500 uppercase block">Best Observed</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {m.minObservedRank > 0 ? m.minObservedRank.toLocaleString('en-IN') : '—'}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                          <span className="text-3xs text-slate-500 uppercase block">Last Observed</span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">
                            {m.maxObservedRank > 0 ? m.maxObservedRank.toLocaleString('en-IN') : '—'}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                          <span className="text-3xs text-slate-500 uppercase block">Your Rank</span>
                          <span className="font-extrabold text-sky-600 dark:text-sky-400">
                            {m.studentRank != null ? m.studentRank.toLocaleString('en-IN') : '—'}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                          <span className="text-3xs text-slate-500 uppercase block">Rank Difference</span>
                          <span
                            className={`font-extrabold ${
                              (m.rankBuffer ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {(m.rankBuffer ?? 0) >= 0 ? `+${(m.rankBuffer ?? 0).toLocaleString('en-IN')} Safe` : `${(m.rankBuffer ?? 0).toLocaleString('en-IN')} Above`}
                          </span>
                        </div>
                      </div>

                      {/* Explanation & Data Basis */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs text-slate-500 dark:text-slate-400 pt-1">
                        <p className="italic">{m.whyExplanation}</p>
                        <span className="text-3xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 font-semibold">
                          {m.dataBasis}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: Web Options Strategy List */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                <span>Web Options Strategy List</span>
                <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {webOptionsList.length} Selected
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize your counseling priority options before submitting on the official portal
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={webOptionsList.length === 0}
                onClick={handleCopyWebOptions}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {hasCopiedList ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopiedList ? 'Copied!' : 'Copy List'}</span>
              </button>
            </div>
          </div>

          {webOptionsList.length === 0 ? (
            <div className="py-16 text-center space-y-2 max-w-sm mx-auto">
              <Plus className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No colleges in your web options list
              </h4>
              <p className="text-xs text-slate-500">
                Click "+ Save Option" on any predicted college match to save it to your priority order.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {webOptionsList.map((item, idx) => (
                <div
                  key={`web_opt_${item.id}`}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="font-mono text-sky-600 dark:text-sky-400">[{item.collegeCode}]</span>
                        <span>{item.collegeName}</span>
                      </div>
                      <div className="text-slate-500 text-2xs">
                        {item.branchName} ({item.branchCode}) • Observed Closing: {item.maxObservedRank != null ? item.maxObservedRank.toLocaleString('en-IN') : '—'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWebOption(item)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApCollegePredictor;
