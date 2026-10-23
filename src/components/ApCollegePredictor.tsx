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
  Zap,
  Target,
  Flame,
  ShieldCheck,
  ChevronUp,
} from 'lucide-react';
import {
  runApPredictorAnalysis,
  getApCollegeDropdownList,
  AP_SOCIAL_CATEGORIES,
  AP_REGION_OPTIONS,
  AP_SPECIAL_CATEGORIES,
  AP_BRANCH_OPTIONS,
  ApCollegeBranchMatch,
  ApPredictorResponse,
  CollegeOption,
  VerdictClassification,
} from '../services/apCollegePredictorService';
import { getPredictorVerdict } from '../utils/predictorLocalization';

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

  // Input states - Candidate inputs
  const [rankInput, setRankInput] = useState<string>('18500');
  const [rankError, setRankError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('OC');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedRegion, setSelectedRegion] = useState<string>('AU');
  const [selectedSpecialCategory, setSelectedSpecialCategory] = useState<string>('NONE');
  const [selectedTargetCollege, setSelectedTargetCollege] = useState<string>(
    initialCollegeCode && initialCollegeCode !== 'ALL' && initialCollegeCode !== 'CBIT' && initialCollegeCode !== 'AUCE'
      ? initialCollegeCode
      : 'ALL'
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranchCode && initialBranchCode !== 'ALL' ? initialBranchCode : 'ALL'
  );
  const [collegeSearchFilter, setCollegeSearchFilter] = useState<string>('');

  // Dropdown college list from 2026 manifest
  const [collegeOptions, setCollegeOptions] = useState<CollegeOption[]>([]);
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState<boolean>(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<ApPredictorResponse | null>(null);
  const [activeVerdictFilter, setActiveVerdictFilter] = useState<'ALL' | 'SAFE' | 'TARGET' | 'DREAM' | 'STEEP'>('ALL');
  const [sortBy, setSortBy] = useState<'SELECTIVE' | 'CLOSING_DESC' | 'CLOSEST_TO_RANK' | 'NAME_ASC'>('SELECTIVE');

  // Web Options Priority Order List
  const [webOptionsList, setWebOptionsList] = useState<ApCollegeBranchMatch[]>([]);
  const [hasCopiedList, setHasCopiedList] = useState<boolean>(false);

  // Load college dropdown list on mount
  useEffect(() => {
    async function loadColleges() {
      const list = await getApCollegeDropdownList();
      setCollegeOptions(list);
    }
    loadColleges();
  }, []);

  // Filtered colleges for searchable dropdown
  const filteredDropdownColleges = useMemo(() => {
    if (!collegeSearchFilter.trim()) return collegeOptions;
    const q = collegeSearchFilter.toLowerCase();
    return collegeOptions.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.district && c.district.toLowerCase().includes(q))
    );
  }, [collegeOptions, collegeSearchFilter]);

  // Run predictor analysis
  const handleRunPrediction = async (
    rankVal = rankInput,
    catVal = selectedCategory,
    genVal = selectedGender,
    regVal = selectedRegion,
    specVal = selectedSpecialCategory,
    colVal = selectedTargetCollege,
    branchVal = selectedBranch,
    searchVal = collegeSearchFilter
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
        region: regVal,
        specialCategory: specVal,
        collegeCode: colVal,
        branch: branchVal,
        collegeQuery: colVal === 'ALL' ? searchVal : '',
        sortBy,
      });
      setAnalysisResults(response);
    } catch (err) {
      console.warn('AP Predictor analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial calculation on mount
  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (isMounted) {
        handleRunPrediction(
          '18500',
          'OC',
          'M',
          'AU',
          'NONE',
          initialCollegeCode && initialCollegeCode !== 'ALL' ? initialCollegeCode : 'ALL',
          initialBranchCode || 'ALL',
          ''
        );
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & sort matches
  const displayedMatches = useMemo(() => {
    if (!analysisResults || !analysisResults.matches) return [];
    let list = [...analysisResults.matches];

    // Verdict filter tab
    if (activeVerdictFilter === 'SAFE') {
      list = list.filter((m) => m.verdict === 'HIGH_CHANCE');
    } else if (activeVerdictFilter === 'TARGET') {
      list = list.filter((m) => m.verdict === 'COMPETITIVE');
    } else if (activeVerdictFilter === 'DREAM') {
      list = list.filter((m) => m.verdict === 'DREAM');
    } else if (activeVerdictFilter === 'STEEP') {
      list = list.filter((m) => m.verdict === 'STEEP_REACH');
    }

    const sRank = analysisResults.appliedFilter.rank;
    if (sortBy === 'SELECTIVE') {
      const p: Record<VerdictClassification, number> = {
        HIGH_CHANCE: 1,
        COMPETITIVE: 2,
        DREAM: 3,
        STEEP_REACH: 4,
        INSUFFICIENT_DATA: 5,
      };
      list.sort((a, b) => {
        if (p[a.verdict] !== p[b.verdict]) {
          return p[a.verdict] - p[b.verdict];
        }
        return b.closingRank - a.closingRank;
      });
    } else if (sortBy === 'CLOSING_DESC') {
      list.sort((a, b) => b.closingRank - a.closingRank);
    } else if (sortBy === 'CLOSEST_TO_RANK') {
      list.sort((a, b) => Math.abs(a.closingRank - sRank) - Math.abs(b.closingRank - sRank));
    } else if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.collegeName.localeCompare(b.collegeName));
    }

    return list;
  }, [analysisResults, activeVerdictFilter, sortBy]);

  // Toggle Web Option
  const toggleWebOption = (item: ApCollegeBranchMatch) => {
    if (webOptionsList.some((w) => w.id === item.id)) {
      setWebOptionsList(webOptionsList.filter((w) => w.id !== item.id));
    } else {
      setWebOptionsList([...webOptionsList, item]);
    }
  };

  // Move web option up or down
  const moveWebOption = (index: number, direction: 'UP' | 'DOWN') => {
    const newList = [...webOptionsList];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newList.length) return;
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;
    setWebOptionsList(newList);
  };

  // Copy web options list
  const handleCopyWebOptions = () => {
    if (webOptionsList.length === 0) return;
    const text = webOptionsList
      .map(
        (w, i) =>
          `Option #${i + 1}: [${w.collegeCode}] ${w.collegeName} | ${w.branchCode} (${w.branchName}) | 2026 Closing: ${w.closingRank.toLocaleString('en-IN')} | Quota: ${w.matchedQuotaCode || 'General'}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setHasCopiedList(true);
    setTimeout(() => setHasCopiedList(false), 2000);
  };

  return (
    <div className="mos-ap-explorer space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner with Youthful Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-6 sm:p-8 md:p-10 border border-blue-800/30 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AP EAPCET · Historical 2026 Data</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            AP College Predictor
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Explore category- and branch-matched college records using available 2026 historical allotments. Future cutoffs may differ; this is not an official admission result.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quota matching: gender-specific and special-category records are filtered</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Available 2026 allotment records • historical reference</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation: Predictor vs Web Options */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('predictor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'predictor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>College Predictor Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('web-options')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'web-options'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Web Options Strategy List ({webOptionsList.length})</span>
        </button>
      </div>

      {activeTab === 'predictor' ? (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* CANDIDATE INTAKE & TARGET FILTER PANEL                                    */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                <span>Candidate Profile &amp; Preferences</span>
              </h2>
              <span className="text-[11px] font-mono font-bold text-slate-400">APSCHE 2026 Standards</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. AP EAPCET Rank */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>AP EAPCET Rank</span>
                </label>
                <input
                  type="number"
                  value={rankInput}
                  onChange={(e) => {
                    setRankInput(e.target.value);
                    if (rankError) setRankError('');
                  }}
                  placeholder="e.g. 18500"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                {rankError && <p className="text-[11px] font-bold text-rose-500">{rankError}</p>}
              </div>

              {/* 2. Reservation Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                  Caste Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-9 cursor-pointer"
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
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGender('M')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedGender === 'M'
                        ? 'bg-blue-600 text-white shadow-xs'
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

              {/* 4. Region */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                  Local Status / Region
                </label>
                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-9 cursor-pointer"
                  >
                    {AP_REGION_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Explicit Special Category Reservation Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-500" />
                  <span>Special Category Reservation</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedSpecialCategory === 'NONE'
                    ? 'Comparing pure general merit & caste quotas'
                    : `Evaluating sub-quota: ${selectedSpecialCategory}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AP_SPECIAL_CATEGORIES.map((s) => {
                  const isSelected = selectedSpecialCategory === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSpecialCategory(s.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                          isSelected
                            ? 'border-white bg-white text-blue-600 font-black'
                            : 'border-slate-400 bg-transparent text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Target College & Preferred Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Target College (Searchable Dropdown with "🏛️ All Colleges (Combined AP)" as Default) */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Target College</span>
                  {selectedTargetCollege !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetCollege('ALL');
                        setCollegeSearchFilter('');
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Reset to All Colleges
                    </button>
                  )}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCollegeDropdownOpen(!isCollegeDropdownOpen)}
                    className="w-full text-left px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="truncate">
                      {selectedTargetCollege === 'ALL'
                        ? '🏛️ All Colleges (Combined AP)'
                        : `${selectedTargetCollege} - ${collegeOptions.find((c) => c.code === selectedTargetCollege)?.name || selectedTargetCollege}`}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isCollegeDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 max-h-72 overflow-y-auto space-y-1">
                      <div className="sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={collegeSearchFilter}
                            onChange={(e) => setCollegeSearchFilter(e.target.value)}
                            placeholder="Search code or college name..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-none focus:outline-hidden"
                            autoFocus
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTargetCollege('ALL');
                          setIsCollegeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          selectedTargetCollege === 'ALL'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        🏛️ All Colleges (Combined AP State Wide)
                      </button>

                      {filteredDropdownColleges.map((col) => (
                        <button
                          key={col.code}
                          type="button"
                          onClick={() => {
                            setSelectedTargetCollege(col.code);
                            setIsCollegeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            selectedTargetCollege === col.code
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{col.code}</span>
                            <span className="text-[10px] text-slate-400">{col.district}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{col.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Branch */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                  Preferred Branch / Discipline
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-9 cursor-pointer"
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

            {/* Run Button Action */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Filter: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCategory}</span> | <span className="font-bold text-slate-800 dark:text-slate-200">{selectedGender === 'M' ? 'Male' : 'Female'}</span> | <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRegion}</span> | <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBranch}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleRunPrediction(
                    rankInput,
                    selectedCategory,
                    selectedGender,
                    selectedRegion,
                    selectedSpecialCategory,
                    selectedTargetCollege,
                    selectedBranch,
                    collegeSearchFilter
                  )
                }
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing 100K+ Allotments...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Next-Gen Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VERDICT SUMMARY CARDS & FILTERS                                           */}
          {/* ========================================================================= */}
          {analysisResults && (
            <div className="space-y-4">
              {/* Verdict Summary Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Safe Bets */}
                <button
                  type="button"
                  onClick={() => setActiveVerdictFilter(activeVerdictFilter === 'SAFE' ? 'ALL' : 'SAFE')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeVerdictFilter === 'SAFE'
                      ? 'bg-emerald-500/15 border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {analysisResults.summary.highChanceCount}
                    </span>
                    <span className="text-lg">🔥</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Within Observed Range</div>
                  <div className="text-[10px] text-slate-500">Your rank is at or better than the observed 2026 closing rank</div>
                </button>

                {/* Near Observed Range */}
                <button
                  type="button"
                  onClick={() => setActiveVerdictFilter(activeVerdictFilter === 'TARGET' ? 'ALL' : 'TARGET')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeVerdictFilter === 'TARGET'
                      ? 'bg-amber-500/15 border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {analysisResults.summary.competitiveCount}
                    </span>
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Target Reachable</div>
                  <div className="text-[10px] text-slate-500">Close to the observed 2026 closing rank</div>
                </button>

                {/* Outside Observed Range */}
                <button
                  type="button"
                  onClick={() => setActiveVerdictFilter(activeVerdictFilter === 'DREAM' ? 'ALL' : 'DREAM')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeVerdictFilter === 'DREAM'
                      ? 'bg-violet-500/15 border-violet-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
                      {analysisResults.summary.dreamCount}
                    </span>
                    <span className="text-lg">🚀</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Dream Shots</div>
                  <div className="text-[10px] text-slate-500">Historical stretch option; not an admission prediction</div>
                </button>

                {/* Far Outside Observed Range */}
                <button
                  type="button"
                  onClick={() => setActiveVerdictFilter(activeVerdictFilter === 'STEEP' ? 'ALL' : 'STEEP')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeVerdictFilter === 'STEEP'
                      ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                      {analysisResults.summary.steepReachCount}
                    </span>
                    <span className="text-lg">🏔️</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Steep Reach</div>
                  <div className="text-[10px] text-slate-500">Rank is materially beyond the observed 2026 range</div>
                </button>
              </div>

              {/* Sort Bar & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Showing {displayedMatches.length} observed college/branch options matching your selected profile
                  </span>
                  {activeVerdictFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setActiveVerdictFilter('ALL')}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      (Clear filter)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="SELECTIVE">Selectivity</option>
                    <option value="CLOSING_DESC">Closing Rank (Highest First)</option>
                    <option value="CLOSEST_TO_RANK">Closest to My Rank</option>
                    <option value="NAME_ASC">College Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Results Grid / List */}
              {displayedMatches.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Info className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-black text-slate-800 dark:text-slate-200">No matching branches found</div>
                  <p className="text-xs text-slate-500">
                    Try adjusting the local region, branch filter, or selecting &quot;All Colleges&quot; to expand the prediction scope.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedMatches.map((m) => {
                    const isAddedToWebOptions = webOptionsList.some((w) => w.id === m.id);
                    const currentRank = parseInt(String(rankInput).replace(/,/g, ''), 10) || 18500;
                    const isEligible = currentRank <= m.closingRank;
                    const isBorderline = !isEligible && currentRank <= Math.round(m.closingRank * 1.10);
                    const verdictInfo = getPredictorVerdict(isEligible, isBorderline, selectedGender);

                    return (
                      <div
                        key={m.id}
                        className={`rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 border ${verdictInfo.cardStyle.border} ${verdictInfo.cardStyle.bg} bg-white dark:bg-slate-900`}
                      >
                        {/* Top: College & Branch Details */}
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                  {m.collegeCode}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400">
                                  {m.district || 'Andhra Pradesh'}
                                </span>
                              </div>
                              <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1 leading-snug">
                                {m.collegeName}
                              </h3>
                            </div>

                            {/* Dynamic Verdict Status Badge */}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black shrink-0 border shadow-2xs ${verdictInfo.badgeStyle.bg} ${verdictInfo.badgeStyle.text} ${verdictInfo.badgeStyle.border}`}
                            >
                              {verdictInfo.badgeText}
                            </span>
                          </div>

                          {/* Branch */}
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                            <div className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                              <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                              <span>{m.branchName}</span>
                              <span className="font-mono text-slate-400">({m.branchCode})</span>
                            </div>
                            <span className="font-mono font-bold text-slate-500 text-[11px]">
                              {m.matchingRecordCount} Allotted
                            </span>
                          </div>

                          {/* Closing Rank & Cushion Grid */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">2026 Closing</div>
                              <div className="font-mono font-black text-slate-900 dark:text-white mt-0.5">
                                {m.closingRank.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">Rank Buffer</div>
                              <div
                                className={`font-mono font-bold mt-0.5 ${
                                  m.rankBuffer >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {m.rankBuffer >= 0 ? `+${m.rankBuffer.toLocaleString('en-IN')}` : m.rankBuffer.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">Observed Position</div>
                              <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                {m.closingRank > 0 ? (currentRank <= m.closingRank ? 'Within range' : currentRank <= Math.round(m.closingRank * 1.10) ? 'Near range' : 'Outside range') : 'No data'}
                              </div>
                            </div>
                          </div>

                          {/* DYNAMIC BILINGUAL GENDER-AWARE FEEDBACK (Strict Native Telugu Script) */}
                          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
                            {/* English Message */}
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-start gap-2">
                              <span className="text-sm shrink-0">
                                {verdictInfo.level === 'HIGH' ? '😎' : verdictInfo.level === 'MODERATE' ? '⚡' : '🥺'}
                              </span>
                              <span className="leading-snug">{verdictInfo.englishText}</span>
                            </div>

                            {/* Strict Native Telugu Script Message */}
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed font-sans pl-6 border-t border-slate-200/60 dark:border-slate-800/60 pt-2">
                              {verdictInfo.teluguText}
                            </div>
                          </div>

                          {/* Why Explanation */}
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                            {m.whyExplanation}
                          </p>

                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {m.quotaDescription}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => toggleWebOption(m)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isAddedToWebOptions
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {isAddedToWebOptions ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added to Web Options</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Web Options</span>
                              </>
                            )}
                          </button>

                          {onNavigateToAllotment && (
                            <button
                              type="button"
                              onClick={() => onNavigateToAllotment(m.collegeCode, m.branchCode)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              <span>View Allotments</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* WEB OPTIONS STRATEGY LIST BUILDER                                         */
        /* ========================================================================= */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>My Tailored Web Options Priority List ({webOptionsList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ordered preferences formatted for immediate entry into the APSCHE online counseling web options portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWebOptions}
                disabled={webOptionsList.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
              >
                {hasCopiedList ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopiedList ? 'Copied to Clipboard!' : 'Copy Web Options List'}</span>
              </button>

              {webOptionsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWebOptionsList([])}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-600 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {webOptionsList.length === 0 ? (
            <div className="p-10 text-center space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-black text-slate-800 dark:text-slate-200">No Web Options Added Yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Navigate to the &quot;College Predictor Engine&quot; tab and click &quot;+ Add to Web Options&quot; on safe bets, targets, and dream colleges to construct your optimal priority ladder.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('predictor')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Go to Predictor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {webOptionsList.map((w, index) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">
                        [{w.collegeCode}] {w.collegeName}
                      </div>
                      <div className="text-slate-500 font-medium">
                        {w.branchName} ({w.branchCode}) | 2026 Closing: {w.closingRank.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveWebOption(index, 'UP')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWebOption(index, 'DOWN')}
                      disabled={index === webOptionsList.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebOptionsList(webOptionsList.filter((x) => x.id !== w.id))}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

export default ApCollegePredictor;
