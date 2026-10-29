import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronUp,
  ShieldCheck,
  Filter,
  CheckCheck,
  HelpCircle,
  Layers,
  Info,
  ExternalLink,
  MapPin,
  Users,
  Sparkles
} from 'lucide-react';
import {
  runApPredictorAnalysis,
  getApPredictorIndex,
  AP_SOCIAL_CATEGORIES,
  AP_BRANCH_OPTIONS,
  AP_REGION_OPTIONS,
  AP_SPECIAL_CATEGORIES
} from '../services/apCollegePredictorService';
import { getPredictorVerdict } from '../utils/predictorLocalization';
import SearchableBranchSelect from './SearchableBranchSelect';

export default function ApCollegePredictor({
  initialCollegeCode = 'ALL',
  initialBranchCode = 'ALL',
  onNavigateToAllotment,
}) {
  const [userRankInput, setUserRankInput] = useState('18500');
  const [selectedCategory, setSelectedCategory] = useState('OC');
  const [selectedGender, setSelectedGender] = useState('M');
  const [selectedRegion, setSelectedRegion] = useState('AU');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedSpecialCategory, setSelectedSpecialCategory] = useState('NONE');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // 'ALL' | 'WITHIN_RANGE' | 'NEAR_RANGE' | 'OUTSIDE_RANGE'
  const [sortBy, setSortBy] = useState('SELECTIVE'); // 'SELECTIVE' | 'CLOSING_DESC' | 'CLOSEST_TO_RANK' | 'NAME_ASC'

  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rankError, setRankError] = useState('');

  // Run analysis when inputs change
  useEffect(() => {
    let isSubscribed = true;
    const cleanRank = parseInt(String(userRankInput).replace(/[^0-9]/g, ''), 10);

    if (isNaN(cleanRank) || cleanRank <= 0 || cleanRank > 400000) {
      setRankError('Please enter a valid AP EAPCET rank (1 - 400,000)');
      return;
    }

    setRankError('');
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await runApPredictorAnalysis({
          rank: cleanRank,
          category: selectedCategory,
          gender: selectedGender,
          region: selectedRegion,
          branch: selectedBranch,
          collegeQuery: collegeSearchQuery,
          specialCategory: selectedSpecialCategory,
          sortBy: sortBy,
        });

        if (isSubscribed) {
          setAnalysisResult(response);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Prediction calculation error:', err);
        if (isSubscribed) setIsLoading(false);
      }
    }, 150);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [userRankInput, selectedCategory, selectedGender, selectedRegion, selectedBranch, collegeSearchQuery, selectedSpecialCategory, sortBy]);

  const filteredMatches = useMemo(() => {
    if (!analysisResult?.matches) return [];
    if (activeTabFilter === 'ALL') return analysisResult.matches;
    return analysisResult.matches.filter(m => m.classification === activeTabFilter);
  }, [analysisResult, activeTabFilter]);

  const summary = analysisResult?.summary || {
    totalMatches: 0,
    withinRangeCount: 0,
    nearRangeCount: 0,
    outsideRangeCount: 0,
    insufficientDataCount: 0,
    analyzedCollegesCount: 0,
  };

  return (
    <div className="min-h-screen mos-ap-explorer bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans pb-24">
      {/* Top Breadcrumb & Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  AP College Predictor
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Data Grounded
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rank-based comparison using available AP EAPCET 2026 historical allotment records. Actual cutoffs may differ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Category-Specific Comparison</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* INPUT FORM PANEL */}
        <section className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-visible z-20">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
                <span>Candidate Profile &amp; Admission Preferences</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Lower rank indicates stronger merit position
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* STEP 1: AP Rank */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  AP EAPCET Rank
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="400000"
                    value={userRankInput}
                    onChange={(e) => setUserRankInput(e.target.value)}
                    placeholder="Enter rank e.g. 18500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm sm:text-base outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {rankError ? (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {rankError}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Valid range: 1 to 400,000</p>
                )}
              </div>

              {/* STEP 2: Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold outline-none focus:border-cyan-500"
                >
                  {AP_SOCIAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Select the reservation category used for comparison</p>
              </div>

              {/* STEP 3: Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold">
                    3
                  </span>
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGender('M')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedGender === 'M'
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    Male (General Pool)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGender('F')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedGender === 'F'
                        ? 'bg-pink-600 text-white border-pink-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    Female (+Girls Quota)
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Used to apply gender-specific quota matching</p>
              </div>

              {/* STEP 4: Local Status / Region */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold">4</span>
                  Local Region
                </label>
                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:border-cyan-500 pr-9 cursor-pointer"
                  >
                    {AP_REGION_OPTIONS.map((region) => (
                      <option key={region.id} value={region.id}>{region.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Select AU, SVU or Non-Local based on your AP local-status eligibility</p>
              </div>

              {/* STEP 5: Preferred Branch */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold">
                    5
                  </span>
                  Preferred Branch
                </label>
                <SearchableBranchSelect
                  options={AP_BRANCH_OPTIONS}
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  placeholder="Search AP branch name or code..."
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Optional — choose a branch or keep All Branches</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explicit Special Category Reservation — same evaluation model as TG */}
        <section className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
              <Award className="w-3.5 h-3.5 text-cyan-500" />
              Special Category Reservation
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedSpecialCategory === 'NONE' ? 'General category + gender + region pools' : 'Selected special-reservation pool only'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AP_SPECIAL_CATEGORIES.map((option) => {
              const active = selectedSpecialCategory === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedSpecialCategory(option.id)}
                  aria-pressed={active}
                  className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold border transition-all ${
                    active
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-cyan-400'
                  }`}
                >
                  {active ? '✓ ' : '○ '}{option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            None excludes PWD/PH, NCC, CAP and Sports quota records. A selected special category is evaluated only against matching 2026 AP allotment quota records.
          </p>
        </section>

        {/* SUMMARY STATS & CLASSIFICATION TABS */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setActiveTabFilter('WITHIN_RANGE')}
              className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTabFilter === 'WITHIN_RANGE'
                  ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Within Observed Range</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {summary.withinRangeCount.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Rank ≤ observed closing cutoff</p>
            </div>

            <div
              onClick={() => setActiveTabFilter('NEAR_RANGE')}
              className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTabFilter === 'NEAR_RANGE'
                  ? 'bg-blue-500/15 border-blue-500/40 shadow-lg shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold">
                <span>Near Range (Borderline)</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {summary.nearRangeCount.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Within 15% of observed closing</p>
            </div>

            <div
              onClick={() => setActiveTabFilter('OUTSIDE_RANGE')}
              className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTabFilter === 'OUTSIDE_RANGE'
                  ? 'bg-rose-500/15 border-rose-500/40 shadow-lg shadow-rose-500/10'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-bold">
                <span>Outside Observed Range</span>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {summary.outsideRangeCount.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Rank beyond observed range</p>
            </div>

            <div
              onClick={() => setActiveTabFilter('ALL')}
              className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTabFilter === 'ALL'
                  ? 'bg-cyan-500/15 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                <span>All Analyzed Options</span>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {summary.totalMatches.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Across 260+ AP institutions</p>
            </div>
          </div>

          {/* Secondary filter bar: Search & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={collegeSearchQuery}
                onChange={(e) => setCollegeSearchQuery(e.target.value)}
                placeholder="Search college name or branch..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0">Sort results:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="SELECTIVE">Selective Rank (Best Colleges First)</option>
                <option value="CLOSING_DESC">Highest Closing Rank First</option>
                <option value="CLOSEST_TO_RANK">Closest to My Rank</option>
                <option value="NAME_ASC">College Name (A to Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* MATCH RESULTS LIST */}
        <section className="space-y-3">
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Evaluating AP EAPCET 2026 allotment records for your rank...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No matching college records found</p>
              <p className="text-xs max-w-md mx-auto">
                Try selecting "All Branches", adjusting your rank, or clearing the search filter.
              </p>
            </div>
          ) : (
            filteredMatches.slice(0, 100).map((match) => (
              <div
                key={match.id}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                        {match.collegeCode}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {match.collegeName}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{match.branchCode}</span>
                      <span>·</span>
                      <span>{match.branchName}</span>
                      <span>·</span>
                      <span className="text-[11px] text-slate-400">{match.quotaDescription}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${match.badgeStyle.bg} ${match.badgeStyle.text} ${match.badgeStyle.border}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${match.badgeStyle.indicator}`} />
                      <span>{match.classificationLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Rank numbers comparison grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Your Rank</div>
                    <div className="mt-0.5 font-mono font-black text-slate-900 dark:text-white text-sm">#{match.studentRank.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Observed Opening</div>
                    <div className="mt-0.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">#{match.minObservedRank ? match.minObservedRank.toLocaleString('en-IN') : '—'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Observed Median</div>
                    <div className="mt-0.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">#{match.medianObservedRank ? match.medianObservedRank.toLocaleString('en-IN') : '—'}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Observed Closing</div>
                    <div className="mt-0.5 font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">#{match.maxObservedRank ? match.maxObservedRank.toLocaleString('en-IN') : '—'}</div>
                  </div>
                </div>

                {/* TG-matched bilingual verdict: always show English + native Telugu */}
                {(() => {
                  const currentRank = Number(match.studentRank || userRankInput) || 0;
                  const closing = Number(match.maxObservedRank || 0);
                  const isEligible = closing > 0 && currentRank <= closing;
                  const isBorderline = closing > 0 && !isEligible && currentRank <= Math.round(closing * 1.10);
                  const verdictInfo = getPredictorVerdict(isEligible, isBorderline, selectedGender);
                  return (
                    <div className={`p-3.5 rounded-2xl border space-y-2 ${verdictInfo.cardStyle.border} ${verdictInfo.cardStyle.bg}`}>
                      <div className={`text-xs font-bold flex items-start gap-2 ${verdictInfo.badgeStyle.text}`}>
                        <span className="text-sm shrink-0">
                          {verdictInfo.level === 'HIGH' ? '😎' : verdictInfo.level === 'MODERATE' ? '⚡' : '🥺'}
                        </span>
                        <span className="leading-snug">{verdictInfo.englishText}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800">
                        {verdictInfo.teluguText}
                      </div>
                    </div>
                  );
                })()}

                {/* Explanation text & navigation action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                    {match.whyExplanation}
                  </p>

                  {onNavigateToAllotment && (
                    <button
                      type="button"
                      onClick={() => onNavigateToAllotment(match.collegeCode, match.branchCode)}
                      className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold hover:underline shrink-0 cursor-pointer"
                    >
                      <span>Explore College &amp; Cutoffs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Methodology notice */}
        <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 sm:p-5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
          <div className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            About AP College Predictor Analysis
          </div>
          <p>
            This deterministic predictor compares your entered rank against the observed 2026 AP EAPCET allotment cutoffs for your selected reservation category and preferred branch. It provides descriptive historical context and does not guarantee admission or predict future cutoffs.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Data source: AP EAPCET 2026 official allotment records in the Naa College dataset.
          </p>
        </section>
      </div>
    </div>
  );
}
