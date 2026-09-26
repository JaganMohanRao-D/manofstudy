import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Award,
  Building2,
  GitBranch,
  MapPin,
  TrendingUp,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  Info,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
  BarChart3,
  Filter,
  CheckCircle2,
  Eye,
  Scale,
  X,
  RefreshCw,
  LayoutGrid,
  ListOrdered
} from 'lucide-react';
import {
  getTopCollegesIndex,
  getAvailableBranchesList,
  getAvailableDistrictsList,
  calculateTopColleges
} from '../services/tgTopCollegesService';

// Popular branches for quick 1-click chip filtering
const QUICK_BRANCH_PILLS = [
  { code: 'CSE', label: 'CSE', desc: 'Computer Science' },
  { code: 'CSM', label: 'CSM', desc: 'AI & Machine Learning' },
  { code: 'ECE', label: 'ECE', desc: 'Electronics & Comm.' },
  { code: 'CSD', label: 'CSD', desc: 'Data Science' },
  { code: 'INF', label: 'INF', desc: 'Information Tech' },
  { code: 'EEE', label: 'EEE', desc: 'Electrical & Electronics' },
  { code: 'CIV', label: 'CIV', desc: 'Civil Engineering' },
  { code: 'MEC', label: 'MEC', desc: 'Mechanical' },
];

export default function TgTopColleges({
  onSelectCollegeBranch,
  className = ''
}) {
  // Query States
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [categoryMode, setCategoryMode] = useState('caste'); // 'caste' (Strict OC Social Category) | 'quota' (Open Merit Quota)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('median_asc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Service Data States
  const [dataIndex, setDataIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);

  // Dropdown UI States
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [copiedCollegeCode, setCopiedCollegeCode] = useState(null);

  // Comparison Drawer State (up to 3 colleges)
  const [comparisonList, setComparisonList] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Unranked colleges accordion
  const [isUnrankedExpanded, setIsUnrankedExpanded] = useState(false);

  // Methodology info popup toggle
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  // Refs for click outside
  const branchDropdownRef = useRef(null);
  const districtDropdownRef = useRef(null);

  // Load index data on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getTopCollegesIndex()
      .then(idx => {
        if (isMounted) {
          setDataIndex(idx);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load allotment dataset');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) {
        setIsBranchOpen(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target)) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute available branches dynamically from dataset
  const availableBranches = useMemo(() => {
    return getAvailableBranchesList();
  }, []);

  // Compute available districts dynamically from dataset
  const availableDistricts = useMemo(() => {
    if (!dataIndex || !dataIndex.colleges) return ['All Districts'];
    return getAvailableDistrictsList(dataIndex.colleges);
  }, [dataIndex]);

  // Filtered branches inside dropdown search
  const filteredDropdownBranches = useMemo(() => {
    if (!branchSearch.trim()) return availableBranches;
    const q = branchSearch.toLowerCase().trim();
    return availableBranches.filter(b => 
      b.branchCode.toLowerCase().includes(q) ||
      b.branchName.toLowerCase().includes(q)
    );
  }, [availableBranches, branchSearch]);

  // Recalculate ranking whenever query parameters change
  useEffect(() => {
    if (!dataIndex) return;

    let isMounted = true;
    calculateTopColleges({
      branch: selectedBranch,
      district: selectedDistrict,
      categoryMode,
      searchQuery,
      sortBy
    }).then(res => {
      if (isMounted) {
        setCalculationResult(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dataIndex, selectedBranch, selectedDistrict, categoryMode, searchQuery, sortBy]);

  // Current selected branch details
  const currentBranchItem = useMemo(() => {
    if (selectedBranch === 'ALL') {
      return { branchCode: 'ALL', branchName: 'All Engineering Branches', collegeCount: dataIndex?.totalColleges || 151 };
    }
    return availableBranches.find(b => b.branchCode === selectedBranch) || {
      branchCode: selectedBranch,
      branchName: selectedBranch,
      collegeCount: 0
    };
  }, [selectedBranch, availableBranches, dataIndex]);

  // Formatting helpers
  const formatRank = (rank) => {
    if (rank === null || rank === undefined || rank <= 0) return 'N/A';
    if (Number.isInteger(rank)) {
      return rank.toLocaleString();
    }
    return rank.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Copy college details
  const handleCopyCollege = (item, e) => {
    e.stopPropagation();
    const text = `TG EAPCET 2026 Observed OC Rank [${item.collegeCode} - ${item.branchCode}]\nMedian OC Rank: ${formatRank(item.stats.medianRank)}\nHighest Observed OC: #${formatRank(item.stats.highestRank)}\nLowest Observed OC: #${formatRank(item.stats.lowestRank)}\nValid OC Allotments: ${item.stats.validAllotments} students\nDistrict: ${item.district}\nSource: Man of Study (Official 2026 Allotment Dataset)`;
    navigator.clipboard?.writeText(text);
    setCopiedCollegeCode(item.collegeCode);
    setTimeout(() => setCopiedCollegeCode(null), 2000);
  };

  // Comparison toggle
  const toggleComparison = (item, e) => {
    e.stopPropagation();
    setComparisonList(prev => {
      const exists = prev.some(c => c.collegeCode === item.collegeCode);
      if (exists) {
        return prev.filter(c => c.collegeCode !== item.collegeCode);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), item];
      }
      return [...prev, item];
    });
  };

  // Jump to candidate allotments in explorer
  const handleNavigateToExplorer = (collegeCode, branchCode) => {
    if (onSelectCollegeBranch) {
      onSelectCollegeBranch(collegeCode, branchCode === 'ALL' ? 'CSE' : branchCode);
    } else {
      window.location.hash = 'tg-allotments';
    }
  };

  // Color helper for rank badge
  const getRankBadgeStyle = (pos) => {
    if (pos === 1) {
      return {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10',
        text: 'text-amber-400',
        label: 'Top 1'
      };
    }
    if (pos === 2) {
      return {
        badge: 'bg-slate-300/20 text-slate-200 border-slate-300/50 shadow-slate-300/10',
        text: 'text-slate-300',
        label: 'Top 2'
      };
    }
    if (pos === 3) {
      return {
        badge: 'bg-amber-700/20 text-amber-300 border-amber-700/50 shadow-amber-700/10',
        text: 'text-amber-500',
        label: 'Top 3'
      };
    }
    if (pos <= 10) {
      return {
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        text: 'text-emerald-400',
        label: `Top ${pos}`
      };
    }
    return {
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      text: 'text-slate-400',
      label: `#${pos}`
    };
  };

  return (
    <div className={`space-y-6 ${className}`} id="top-btech-colleges-telangana">
      {/* 1. HERO & BRANDING SECTION */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded in Official TG EAPCET 2026 Final Phase Allotment Dataset</span>
            </div>

            <button
              type="button"
              onClick={() => setShowMethodologyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Ranking Methodology &amp; OC Criteria</span>
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Top B.Tech Colleges in Telangana
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Branch-specific institutional ranking calculated exclusively from <span className="text-emerald-400 font-bold">valid OC-category allotment ranks</span>. Demand is evaluated per branch to ensure fair, statistically sound institutional comparison.
            </p>
          </div>

          {/* Quick Disclaimer / Methodology Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-slate-200">Statutory Criteria:</strong> College comparisons are calculated using valid OC-category allotment ranks only. Reserved categories (BC, SC, ST, EWS) are strictly excluded from these medians.
              </span>
            </div>
            <span className="text-slate-400 font-mono text-[11px] shrink-0">
              Lower Rank = Stronger Merit Position
            </span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC DROPDOWNS & FILTER TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BRANCH DROPDOWN (DYNAMIC - NOT HARDCODED) */}
          <div className="space-y-1.5" ref={branchDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>1. Choose your Engineering Branch</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {availableBranches.length} branches available
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                id="select-top-colleges-branch"
                onClick={() => {
                  setIsBranchOpen(!isBranchOpen);
                  setIsDistrictOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-left text-sm font-semibold text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold shrink-0">
                    {selectedBranch === 'ALL' ? 'ALL' : selectedBranch}
                  </span>
                  <span className="truncate text-slate-200">
                    {currentBranchItem.branchName}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isBranchOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBranchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-2 max-h-80 overflow-y-auto">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search branch name or code..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    {/* All Branches Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBranch('ALL');
                        setIsBranchOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedBranch === 'ALL'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-[11px] font-bold">ALL</span>
                        <span>All Branches (Aggregated)</span>
                      </div>
                      <span className="text-[10px] text-slate-400">All Colleges</span>
                    </button>

                    {filteredDropdownBranches.map((b) => (
                      <button
                        key={b.branchCode}
                        type="button"
                        onClick={() => {
                          setSelectedBranch(b.branchCode);
                          setIsBranchOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedBranch === b.branchCode
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300 shrink-0">
                            {b.branchCode}
                          </span>
                          <span className="truncate">{b.branchName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {b.collegeCount} colleges
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MANDATORY HELPER TEXT */}
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Colleges are evaluated separately for each branch because admission demand varies significantly by branch.</span>
            </p>
          </div>

          {/* DISTRICT DROPDOWN (DYNAMIC - EXTRACTED FROM DATASET) */}
          <div className="space-y-1.5" ref={districtDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>2. Filter by District / Location</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {availableDistricts.length - 1} Telangana Regions
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                id="select-top-colleges-district"
                onClick={() => {
                  setIsDistrictOpen(!isDistrictOpen);
                  setIsBranchOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-left text-sm font-semibold text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="truncate text-slate-200">
                    {selectedDistrict}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDistrictOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1 max-h-80 overflow-y-auto">
                  {availableDistricts.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setSelectedDistrict(d);
                        setIsDistrictOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedDistrict === d
                          ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{d}</span>
                      {selectedDistrict === d && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Select "All Districts" to rank statewide across Telangana, or isolate specific hubs like Hyderabad or Warangal.</span>
            </p>
          </div>
        </div>

        {/* QUICK BRANCH SELECTOR PILLS */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Branch Switcher:
            </span>
            {selectedBranch === 'ALL' && (
              <span className="text-[11px] text-amber-400 font-medium">
                Tip: Selecting a specific branch provides the most accurate college evaluation
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_BRANCH_PILLS.map((chip) => (
              <button
                key={chip.code}
                type="button"
                onClick={() => setSelectedBranch(chip.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedBranch === chip.code
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{chip.label}</span>
                <span className={`text-[10px] hidden sm:inline ${selectedBranch === chip.code ? 'text-slate-900/80 font-normal' : 'text-slate-400'}`}>
                  ({chip.desc})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH, SORT & CATEGORY MODE TOOLBAR */}
        <div className="pt-3 border-t border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search by College Name or Code */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search college by name or code (e.g., CBIT, OUCE, KMIT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* OC Criteria Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setCategoryMode('caste')}
                title="Only students whose social category is strictly OC"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  categoryMode === 'caste'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                OC Social Caste
              </button>
              <button
                type="button"
                onClick={() => setCategoryMode('quota')}
                title="All students admitted under Open Competition general merit quota"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  categoryMode === 'quota'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                OC Merit Quota
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                aria-label="Sort colleges"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="median_asc">Sort: Median OC Rank (Best First)</option>
                <option value="median_desc">Sort: Median OC Rank (Highest Number)</option>
                <option value="highest_asc">Sort: Highest Observed Rank</option>
                <option value="lowest_asc">Sort: Lowest Observed Rank</option>
                <option value="allotments_desc">Sort: Total OC Allotments</option>
                <option value="name_asc">Sort: College Name (A-Z)</option>
              </select>
            </div>

            {/* Cards vs Table view toggle */}
            <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. "ALL BRANCHES" GUIDANCE BANNER (IF ALL SELECTED) */}
      {selectedBranch === 'ALL' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300">Evaluating Across All Branches</h4>
            <p className="text-amber-200/90 leading-relaxed text-xs">
              Because admission demand varies heavily across disciplines (Computer Science ranks are considerably tighter than Mechanical or Civil), statewide comparisons are most reliable when evaluated on a specific branch. Below is the aggregate OC performance across all offered engineering branches.
            </p>
          </div>
        </div>
      )}

      {/* 4. SUMMARY STATISTICS METRICS BANNER */}
      {calculationResult && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Colleges Offering</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {calculationResult.rankedColleges.length}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                of {calculationResult.totalEligibleColleges}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {selectedDistrict}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Median OC Rank</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
              {calculationResult.summary.statewideMedianOcRank !== null
                ? formatRank(calculationResult.summary.statewideMedianOcRank)
                : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Branch Benchmark Median
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Highest Observed Rank</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              #{calculationResult.summary.statewideHighestOcRank !== null
                ? formatRank(calculationResult.summary.statewideHighestOcRank)
                : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Strongest candidate admitted
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid OC Allotments</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {calculationResult.summary.totalValidOcAllotments.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Candidate records analyzed
            </p>
          </div>
        </div>
      )}

      {/* 5. LOADING / ERROR / RESULTS LIST */}
      {isLoading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center space-y-3 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">
            Calculating Telangana B.Tech College Rankings from Allotment Records...
          </span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
          <h3 className="font-bold text-rose-300">Unable to calculate ranking</h3>
          <p className="text-xs text-rose-200">{error}</p>
        </div>
      ) : calculationResult && calculationResult.rankedColleges.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No colleges found matching criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No engineering colleges in <strong className="text-slate-300">{selectedDistrict}</strong> currently have recorded OC allotments for <strong className="text-slate-300">{currentBranchItem.branchName}</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDistrict('All Districts');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Reset Filters to Statewide All Districts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header row for list */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-200">{calculationResult?.rankedColleges.length}</strong> colleges for{' '}
              <strong className="text-emerald-400">{currentBranchItem.branchName}</strong> in{' '}
              <strong className="text-sky-400">{selectedDistrict}</strong>
            </span>
            <span className="hidden sm:inline text-[11px] font-mono">
              Primary Sorting: Lowest Median OC Rank First
            </span>
          </div>

          {/* VIEW: CARDS MODE */}
          {viewMode === 'cards' ? (
            <div className="space-y-3">
              {calculationResult?.rankedColleges.map((item) => {
                const badgeStyle = getRankBadgeStyle(item.rankPosition);
                const isCompared = comparisonList.some(c => c.collegeCode === item.collegeCode);

                return (
                  <div
                    key={item.collegeCode}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-200 space-y-4 relative overflow-hidden group"
                  >
                    {/* Top Row: Rank Badge, College Name, District */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Numerical Rank Badge */}
                        <div className={`px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-black font-mono shrink-0 shadow-sm flex flex-col items-center justify-center min-w-[52px] ${badgeStyle.badge}`}>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">RANK</span>
                          <span className="text-sm sm:text-base font-extrabold leading-none mt-0.5">#{item.rankPosition}</span>
                        </div>

                        {/* College Identification */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded-md">
                              {item.collegeCode}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {item.district}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                            {item.collegeName}
                          </h3>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleComparison(item, e)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                            isCompared
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
                          }`}
                          title="Add to side-by-side comparison"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isCompared ? 'Added' : 'Compare'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleCopyCollege(item, e)}
                          className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                          title="Copy summary"
                        >
                          {copiedCollegeCode === item.collegeCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavigateToExplorer(item.collegeCode, item.branchCode)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title="View all individual candidate allotments for this college in explorer"
                        >
                          <span>View Allotments</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: The Three Key Mandated Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      {/* Metric 1: MEDIAN OC RANK (Prominently Highlighted) */}
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Median OC Rank</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                          {formatRank(item.stats.medianRank)}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Statistical median of valid OC ranks
                        </p>
                      </div>

                      {/* Metric 2: HIGHEST OBSERVED RANK */}
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-sky-400" />
                          <span>Highest Observed Rank</span>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold text-sky-300 font-mono">
                          #{formatRank(item.stats.highestRank)}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Strongest admitted OC rank (lower = better)
                        </p>
                      </div>

                      {/* Metric 3: LOWEST OBSERVED RANK */}
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Lowest Observed Rank</span>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold text-purple-300 font-mono">
                          #{formatRank(item.stats.lowestRank)}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Last admitted OC allotment rank
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Visual Range Bar & Total OC Allotments */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-300">
                            Valid OC Allotments:
                          </span>
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {item.stats.validAllotments} students
                          </span>
                          <span className="text-slate-400 hidden sm:inline">
                            (out of {item.totalBranchAllotted} total admitted)
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">
                          Spread: #{formatRank(item.stats.highestRank)} — #{formatRank(item.stats.lowestRank)}
                        </span>
                      </div>

                      {/* Visual Range Indicator Bar */}
                      <div className="relative w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-linear-to-r from-emerald-500 via-sky-500 to-purple-500 rounded-full opacity-80"
                          style={{
                            width: '100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW: COMPACT LEADERBOARD TABLE MODE */
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 text-center w-16">Rank</th>
                    <th className="py-3 px-4">College Name &amp; Code</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4 text-right">Median OC Rank</th>
                    <th className="py-3 px-4 text-right">Highest Observed</th>
                    <th className="py-3 px-4 text-right">Lowest Observed</th>
                    <th className="py-3 px-4 text-right">Valid OC Seats</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {calculationResult?.rankedColleges.map((item) => {
                    const badgeStyle = getRankBadgeStyle(item.rankPosition);
                    return (
                      <tr key={item.collegeCode} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-xs ${badgeStyle.badge}`}>
                            #{item.rankPosition}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="font-mono text-sky-400 text-xs font-extrabold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/25">
                              {item.collegeCode}
                            </span>
                            <span className="truncate max-w-xs">{item.collegeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.district}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                          {formatRank(item.stats.medianRank)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-sky-300">
                          #{formatRank(item.stats.highestRank)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-purple-300">
                          #{formatRank(item.stats.lowestRank)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {item.stats.validAllotments}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleNavigateToExplorer(item.collegeCode, item.branchCode)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Explore
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. COLLEGES OFFERING THIS BRANCH BUT WITH 0 VALID OC ALLOTMENTS */}
          {calculationResult && calculationResult.unrankedColleges.length > 0 && (
            <div className="pt-4">
              <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsUnrankedExpanded(!isUnrankedExpanded)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Colleges offering this branch with no valid OC allotment records ({calculationResult.unrankedColleges.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Institutions where seats for this branch were filled entirely through reserved categories, minority quotas, or had zero general OC admissions.
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isUnrankedExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isUnrankedExpanded && (
                  <div className="p-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {calculationResult.unrankedColleges.map((u) => (
                      <div key={u.collegeCode} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {u.collegeCode}
                          </span>
                          <span className="text-[10px] text-slate-400">{u.district}</span>
                        </div>
                        <p className="font-semibold text-slate-300 truncate" title={u.collegeName}>
                          {u.collegeName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          0 OC Records (Total Allotted: {u.totalBranchAllotted})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. METHODOLOGY MODAL / POPUP */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Ranking Methodology &amp; Mathematical Criteria</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMethodologyModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                <strong className="block text-emerald-300 font-bold mb-1">Official Benchmark Statement:</strong>
                "College comparisons in this section are calculated using valid OC-category allotment ranks from the available Telangana EAPCET 2026 dataset."
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">1. Strict OC Isolation</h4>
                <p>
                  To eliminate cutoff distortion caused by sub-categorized reservations, candidate allotments are restricted strictly to the <strong>OC (Open Competition)</strong> pool.
                  No ranks from <strong>BC-A, BC-B, BC-C, BC-D, BC-E, SC-I, SC-II, SC-III, ST, or EWS</strong> are mixed into this calculation.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">2. Why Branch-First Evaluation?</h4>
                <p>
                  Colleges are evaluated separately for each branch because admission demand varies significantly by branch. For instance, Computer Science cutoffs operate on entirely different competitive baselines compared to Mechanical, Civil, or Metallurgy.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">3. Exact Statistical Median Calculation</h4>
                <p>
                  All valid OC allotment ranks are sorted numerically in ascending order.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>If the count of ranks is <strong>odd</strong>: Median is the exact middle rank.</li>
                  <li>If the count of ranks is <strong>even</strong>: Median is the average of the two middle ranks.</li>
                  <li>Decimal values (e.g. <code>1,370.5</code>) are preserved without rounding errors.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">4. Rank Direction Interpretation</h4>
                <p>
                  In competitive examinations, a <strong>lower numerical rank indicates a stronger rank</strong> (Rank #1 is stronger than Rank #10,000). Consequently, colleges with a <strong>lower median OC rank</strong> are positioned higher in the ranking table.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMethodologyModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. COMPARISON DRAWER (IF 2 OR 3 COLLEGES SELECTED) */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  College Comparison Drawer ({comparisonList.length}/3)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Comparing observed OC allotment metrics for {currentBranchItem.branchCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsComparisonOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                View Side-by-Side
              </button>

              <button
                type="button"
                onClick={() => setComparisonList([])}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Clear comparison"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800">
            {comparisonList.map((c) => (
              <div key={c.collegeCode} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="font-mono font-bold text-sky-400 mr-1.5">{c.collegeCode}</span>
                  <span className="text-slate-300 font-medium">{c.collegeName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setComparisonList(prev => prev.filter(x => x.collegeCode !== c.collegeCode))}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. SIDE-BY-SIDE COMPARISON MODAL */}
      {isComparisonOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Side-by-Side College Comparison [{currentBranchItem.branchCode}]</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComparisonOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {comparisonList.map((col) => (
                <div key={col.collegeCode} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                      {col.collegeCode}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-2">
                      {col.collegeName}
                    </h4>
                    <span className="text-[11px] text-slate-400 block">{col.district}</span>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Median OC Rank</span>
                      <p className="text-xl font-black text-emerald-400 font-mono">
                        {formatRank(col.stats.medianRank)}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Highest Observed Rank</span>
                      <p className="text-base font-bold text-sky-300 font-mono">
                        #{formatRank(col.stats.highestRank)}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Lowest Observed Rank</span>
                      <p className="text-base font-bold text-purple-300 font-mono">
                        #{formatRank(col.stats.lowestRank)}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Valid OC Allotments</span>
                      <p className="text-sm font-bold text-slate-200">
                        {col.stats.validAllotments} students
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsComparisonOpen(false);
                      handleNavigateToExplorer(col.collegeCode, col.branchCode);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Official Candidates
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsComparisonOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
