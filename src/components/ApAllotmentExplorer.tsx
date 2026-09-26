import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Building2,
  GitBranch,
  Users,
  Award,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  X,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  Loader2,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  FileText,
  Sparkles,
  Download,
  AlertTriangle,
  Compass
} from 'lucide-react';
import {
  AP_EAPCET_COLLEGES,
  AP_EAPCET_GLOBAL_STATS,
  ApCollegeItem,
  ApBranchItem
} from '../data/apEapcetCollegeManifest';
import {
  searchApAllotments,
  fetchCollegeDetails,
  computeAllotmentAnalytics,
  preloadApSearchIndex,
  ApCandidateRecord,
  BranchAnalytics
} from '../utils/apAllotmentClientSearch';

interface ApAllotmentExplorerProps {
  initialCollegeCode?: string;
  initialBranchCode?: string;
  onNavigateToTab?: (tabId: string) => void;
}

type ExplorerViewMode = 'college' | 'student-search' | 'rank-search' | 'analytics';

export default function ApAllotmentExplorer({
  initialCollegeCode = 'SVCE',
  initialBranchCode = 'ALL',
  onNavigateToTab
}: ApAllotmentExplorerProps) {
  // Navigation tabs
  const [viewMode, setViewMode] = useState<ExplorerViewMode>('college');

  // College & Branch Selection
  const [selectedCollegeCode, setSelectedCollegeCode] = useState<string>(initialCollegeCode);
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>(initialBranchCode);
  const [collegeSearchInput, setCollegeSearchInput] = useState<string>('');
  const [isCollegePickerOpen, setIsCollegePickerOpen] = useState<boolean>(false);
  const collegePickerRef = useRef<HTMLDivElement>(null);

  // Active college records from loaded JSON file
  const [collegeLoading, setCollegeLoading] = useState<boolean>(false);
  const [collegeError, setCollegeError] = useState<string | null>(null);
  const [loadedCollegeRecords, setLoadedCollegeRecords] = useState<ApCandidateRecord[]>([]);

  // Local table filters within College Explorer
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedAllottedCatFilter, setSelectedAllottedCatFilter] = useState<string>('ALL');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('ALL');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'rank' | 'name'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(30);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Student Name Search State
  const [studentSearchInput, setStudentSearchInput] = useState<string>('');
  const [studentSearchResults, setStudentSearchResults] = useState<ApCandidateRecord[]>([]);
  const [isStudentSearching, setIsStudentSearching] = useState<boolean>(false);
  const [studentSearchTotal, setStudentSearchTotal] = useState<number>(0);
  const [hasPerformedStudentSearch, setHasPerformedStudentSearch] = useState<boolean>(false);

  // Rank / Range Search State
  const [rankSearchType, setRankSearchType] = useState<'exact' | 'range'>('exact');
  const [exactRankInput, setExactRankInput] = useState<string>('3821');
  const [rangeFromInput, setRangeFromInput] = useState<string>('5000');
  const [rangeToInput, setRangeToInput] = useState<string>('10000');
  const [rankSearchResults, setRankSearchResults] = useState<ApCandidateRecord[]>([]);
  const [isRankSearching, setIsRankSearching] = useState<boolean>(false);
  const [rankSearchTotal, setRankSearchTotal] = useState<number>(0);
  const [hasPerformedRankSearch, setHasPerformedRankSearch] = useState<boolean>(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (collegePickerRef.current && !collegePickerRef.current.contains(e.target as Node)) {
        setIsCollegePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Preload global search index lazily in background
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadApSearchIndex();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch college data whenever selectedCollegeCode changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      const colMeta = AP_EAPCET_COLLEGES.find(
        (c) => c.collegeCode.toUpperCase() === selectedCollegeCode.toUpperCase()
      );

      if (!colMeta || !colMeta.hasData) {
        setLoadedCollegeRecords([]);
        setCollegeLoading(false);
        return;
      }

      setCollegeLoading(true);
      setCollegeError(null);

      try {
        const data = await fetchCollegeDetails(colMeta.collegeCode);
        if (isCancelled) return;

        if (!data || !data.branches) {
          setLoadedCollegeRecords([]);
          setCollegeError('No allotment records found for this college.');
          return;
        }

        // Flatten all branch records
        const allFlatRecords: ApCandidateRecord[] = [];
        data.branches.forEach((b) => {
          (b.records || []).forEach((r) => {
            const numRank = parseFloat(r.rank);
            allFlatRecords.push({
              rank: isNaN(numRank) ? 0 : Math.round(numRank),
              cand_name: r.cand_name || '',
              gender: (r.gender || '').toUpperCase(),
              category: r.category || '',
              region: r.region || '',
              alloted_category: r.alloted_category || '',
              phase: r.phase || 1,
              college_code: colMeta.collegeCode,
              college_name: data.college_name || colMeta.collegeName,
              branch_code: b.branch_code,
              branch_name: b.branch_name
            });
          });
        });

        setLoadedCollegeRecords(allFlatRecords);
      } catch (err: any) {
        if (!isCancelled) {
          setCollegeError('Failed to load college allotment file. Please check connection.');
        }
      } finally {
        if (!isCancelled) {
          setCollegeLoading(false);
        }
      }
    }

    loadData();
    setCurrentPage(1);

    return () => {
      isCancelled = true;
    };
  }, [selectedCollegeCode]);

  // Current selected college metadata
  const currentCollegeMeta = useMemo(() => {
    return (
      AP_EAPCET_COLLEGES.find(
        (c) => c.collegeCode.toUpperCase() === selectedCollegeCode.toUpperCase()
      ) || AP_EAPCET_COLLEGES[0]
    );
  }, [selectedCollegeCode]);

  // Filtered colleges list for command-style selector
  const filteredCollegesList = useMemo(() => {
    const q = collegeSearchInput.toLowerCase().trim();
    if (!q) return AP_EAPCET_COLLEGES;
    return AP_EAPCET_COLLEGES.filter(
      (c) =>
        c.collegeCode.toLowerCase().includes(q) ||
        c.collegeName.toLowerCase().includes(q)
    );
  }, [collegeSearchInput]);

  // Available branches inside the current college
  const currentCollegeBranches = useMemo(() => {
    if (!currentCollegeMeta || !currentCollegeMeta.branches) return [];
    return currentCollegeMeta.branches;
  }, [currentCollegeMeta]);

  // Filtered records for the college view based on active filters
  const filteredCollegeRecords = useMemo(() => {
    let result = loadedCollegeRecords;

    // Filter by branch
    if (selectedBranchCode !== 'ALL') {
      result = result.filter(
        (r) => r.branch_code.toUpperCase() === selectedBranchCode.toUpperCase()
      );
    }

    // Filter by phase
    if (selectedPhaseFilter !== 'ALL') {
      const ph = Number(selectedPhaseFilter);
      result = result.filter((r) => r.phase === ph);
    }

    // Filter by candidate category
    if (selectedCategoryFilter !== 'ALL') {
      result = result.filter(
        (r) => r.category.toUpperCase() === selectedCategoryFilter.toUpperCase()
      );
    }

    // Filter by allotted category
    if (selectedAllottedCatFilter !== 'ALL') {
      result = result.filter(
        (r) => r.alloted_category.toUpperCase() === selectedAllottedCatFilter.toUpperCase()
      );
    }

    // Filter by gender
    if (selectedGenderFilter !== 'ALL') {
      result = result.filter(
        (r) => r.gender.toUpperCase() === selectedGenderFilter.toUpperCase()
      );
    }

    // Filter by region
    if (selectedRegionFilter !== 'ALL') {
      result = result.filter(
        (r) => r.region.toUpperCase() === selectedRegionFilter.toUpperCase()
      );
    }

    // Search query within college records
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.cand_name.toLowerCase().includes(q) ||
          r.rank.toString().includes(q) ||
          r.alloted_category.toLowerCase().includes(q) ||
          r.branch_name.toLowerCase().includes(q)
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortField === 'rank') {
        return sortDirection === 'asc' ? a.rank - b.rank : b.rank - a.rank;
      } else {
        return sortDirection === 'asc'
          ? a.cand_name.localeCompare(b.cand_name)
          : b.cand_name.localeCompare(a.cand_name);
      }
    });
  }, [
    loadedCollegeRecords,
    selectedBranchCode,
    selectedPhaseFilter,
    selectedCategoryFilter,
    selectedAllottedCatFilter,
    selectedGenderFilter,
    selectedRegionFilter,
    tableSearchQuery,
    sortField,
    sortDirection
  ]);

  // Analytics calculated for the currently viewed records (respecting branch & phase filters)
  const currentAnalytics: BranchAnalytics = useMemo(() => {
    // When computing analytics for the branch view, we take the records filtered by branch and phase
    let recordsForAnalytics = loadedCollegeRecords;
    if (selectedBranchCode !== 'ALL') {
      recordsForAnalytics = recordsForAnalytics.filter(
        (r) => r.branch_code.toUpperCase() === selectedBranchCode.toUpperCase()
      );
    }
    if (selectedPhaseFilter !== 'ALL') {
      const ph = Number(selectedPhaseFilter);
      recordsForAnalytics = recordsForAnalytics.filter((r) => r.phase === ph);
    }
    return computeAllotmentAnalytics(recordsForAnalytics);
  }, [loadedCollegeRecords, selectedBranchCode, selectedPhaseFilter]);

  // Pagination slice
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCollegeRecords.slice(start, start + pageSize);
  }, [filteredCollegeRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCollegeRecords.length / pageSize) || 1;

  // Available unique categories in current college for filter dropdowns
  const availableCategoriesInCollege = useMemo(() => {
    const set = new Set<string>();
    loadedCollegeRecords.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set).sort();
  }, [loadedCollegeRecords]);

  // Available unique allotted categories in current college
  const availableAllottedCategoriesInCollege = useMemo(() => {
    const set = new Set<string>();
    loadedCollegeRecords.forEach((r) => {
      if (r.alloted_category) set.add(r.alloted_category);
    });
    return Array.from(set).sort();
  }, [loadedCollegeRecords]);

  // Available phases in current college
  const availablePhasesInCollege = useMemo(() => {
    const set = new Set<number>();
    loadedCollegeRecords.forEach((r) => {
      if (r.phase) set.add(r.phase);
    });
    return Array.from(set).sort();
  }, [loadedCollegeRecords]);

  // Handler for searching by student name
  const handleStudentSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = studentSearchInput.trim();
    if (!query) return;

    setIsStudentSearching(true);
    setHasPerformedStudentSearch(true);

    try {
      const res = await searchApAllotments({
        nameQuery: query,
        limit: 100
      });
      setStudentSearchResults(res.records);
      setStudentSearchTotal(res.totalMatches);
    } catch (err) {
      console.error('Student search failed:', err);
      setStudentSearchResults([]);
      setStudentSearchTotal(0);
    } finally {
      setIsStudentSearching(false);
    }
  };

  // Handler for searching by rank or range
  const handleRankSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsRankSearching(true);
    setHasPerformedRankSearch(true);

    try {
      if (rankSearchType === 'exact') {
        const exact = parseInt(exactRankInput, 10);
        if (isNaN(exact) || exact <= 0) {
          setRankSearchResults([]);
          setRankSearchTotal(0);
          setIsRankSearching(false);
          return;
        }
        const res = await searchApAllotments({
          exactRank: exact,
          limit: 100
        });
        setRankSearchResults(res.records);
        setRankSearchTotal(res.totalMatches);
      } else {
        const from = parseInt(rangeFromInput, 10);
        const to = parseInt(rangeToInput, 10);
        const res = await searchApAllotments({
          minRank: isNaN(from) ? undefined : from,
          maxRank: isNaN(to) ? undefined : to,
          limit: 100
        });
        setRankSearchResults(res.records);
        setRankSearchTotal(res.totalMatches);
      }
    } catch (err) {
      console.error('Rank search failed:', err);
      setRankSearchResults([]);
      setRankSearchTotal(0);
    } finally {
      setIsRankSearching(false);
    }
  };

  // Reset all local filters in college view
  const handleResetFilters = () => {
    setSelectedPhaseFilter('ALL');
    setSelectedCategoryFilter('ALL');
    setSelectedAllottedCatFilter('ALL');
    setSelectedGenderFilter('ALL');
    setSelectedRegionFilter('ALL');
    setTableSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedPhaseFilter !== 'ALL' ||
    selectedCategoryFilter !== 'ALL' ||
    selectedAllottedCatFilter !== 'ALL' ||
    selectedGenderFilter !== 'ALL' ||
    selectedRegionFilter !== 'ALL' ||
    tableSearchQuery.trim() !== '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* 1. Header Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Official AP EAPCET 2025 Allotment Dataset</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AP EAPCET 2025 Allotment Explorer
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
              Explore college-wise allotments, student ranks and category-wise admission insights.
            </p>
          </div>

          {/* Dataset Quick Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 mr-1.5">Indexed:</span>
              <strong className="text-slate-900 dark:text-white">37,637</strong> Students
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 mr-1.5">Colleges:</span>
              <strong className="text-slate-900 dark:text-white">70 / 255</strong> Ready
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 mr-1.5">Phases:</span>
              <strong className="text-slate-900 dark:text-white">Phase 1 & 2</strong>
            </div>
          </div>
        </div>

        {/* 2. Top Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('college')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
              viewMode === 'college'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Explore by College</span>
          </button>

          <button
            onClick={() => setViewMode('student-search')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
              viewMode === 'student-search'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Student</span>
          </button>

          <button
            onClick={() => setViewMode('rank-search')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
              viewMode === 'rank-search'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Search by Rank / Range</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
              viewMode === 'analytics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dataset Insights</span>
          </button>
        </div>
      </div>

      {/* 3. MODE: EXPLORE BY COLLEGE */}
      {viewMode === 'college' && (
        <div className="space-y-6">
          {/* College and Branch Selection Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* College Command Selector */}
              <div className="lg:col-span-7 relative" ref={collegePickerRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select College (255 AP Engineering Colleges)
                </label>
                <div
                  onClick={() => setIsCollegePickerOpen(!isCollegePickerOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-500 transition-colors flex items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {currentCollegeMeta.collegeName}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded">
                        {currentCollegeMeta.collegeCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentCollegeMeta.hasData
                        ? `${currentCollegeMeta.recordCount.toLocaleString()} records available · ${currentCollegeMeta.branchCount} branches`
                        : 'Batch 2 Release (Data archive scheduled)'}
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>

                {/* College Search Popup Menu */}
                {isCollegePickerOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={collegeSearchInput}
                          onChange={(e) => setCollegeSearchInput(e.target.value)}
                          placeholder="Search college name or code (e.g. SVCE, Gayatri, VR Siddhartha)..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCollegesList.map((col) => {
                        const isSelected =
                          col.collegeCode.toUpperCase() ===
                          selectedCollegeCode.toUpperCase();
                        return (
                          <div
                            key={col.collegeCode}
                            onClick={() => {
                              setSelectedCollegeCode(col.collegeCode);
                              setSelectedBranchCode('ALL');
                              setIsCollegePickerOpen(false);
                              setCollegeSearchInput('');
                            }}
                            className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                                : ''
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                  {col.collegeName}
                                </span>
                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {col.collegeCode}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {col.hasData
                                  ? `${col.recordCount.toLocaleString()} records · ${col.branchCount} branches`
                                  : 'Scheduled in next batch'}
                              </div>
                            </div>
                            {col.hasData && (
                              <span className="flex-shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Ready
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Branch Selector */}
              <div className="lg:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select Branch ({currentCollegeBranches.length} Available in College)
                </label>
                <select
                  value={selectedBranchCode}
                  onChange={(e) => {
                    setSelectedBranchCode(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={!currentCollegeMeta.hasData || currentCollegeBranches.length === 0}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="ALL">
                    All Branches ({loadedCollegeRecords.length.toLocaleString()} total students)
                  </option>
                  {currentCollegeBranches.map((b) => (
                    <option key={b.branchCode} value={b.branchCode}>
                      {b.branchCode} - {b.branchName} ({b.recordCount} students)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick College Summary Card */}
            {currentCollegeMeta.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Allotments</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {loadedCollegeRecords.length.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Across {currentCollegeBranches.length} branches</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Best Observed Rank</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentAnalytics.bestOverallRank > 0 ? currentAnalytics.bestOverallRank.toLocaleString() : 'N/A'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Lowest numeric rank</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Last Observed Rank</div>
                  <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {currentAnalytics.lastOverallRank > 0 ? currentAnalytics.lastOverallRank.toLocaleString() : 'N/A'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Highest numeric rank</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Gender Breakdown</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {currentAnalytics.genderDistribution.male} M · {currentAnalytics.genderDistribution.female} F
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {currentAnalytics.totalStudents > 0
                      ? `${Math.round((currentAnalytics.genderDistribution.female / currentAnalytics.totalStudents) * 100)}% Female`
                      : '0%'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                <div>
                  <div className="font-bold">College Allotment Data In Batch 2 Queue</div>
                  <div className="mt-1">
                    The JSON allotment records for <strong>{currentCollegeMeta.collegeName} ({currentCollegeMeta.collegeCode})</strong> are queued for release in Batch 2. Currently, 70 top AP colleges with 37,637 complete records are available to browse. Select another college such as SVCE, SRKR, ADIT, VITK, VIVP, or use the global student/rank search tools above!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {collegeLoading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3">
                Loading official allotment records for {currentCollegeMeta.collegeCode}...
              </p>
            </div>
          )}

          {/* College Content when loaded */}
          {!collegeLoading && currentCollegeMeta.hasData && (
            <div className="space-y-8">
              {/* Category-Wise Best & Last Ranks Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                      <span>Category-Wise Observed Rank Insights</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Observed allotment ranks in this dataset for{' '}
                      <strong>{selectedBranchCode === 'ALL' ? 'All Branches' : selectedBranchCode}</strong>.
                      Best Rank = minimum observed rank; Last Rank = maximum observed rank.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Filter Phase:</span>
                    <select
                      value={selectedPhaseFilter}
                      onChange={(e) => {
                        setSelectedPhaseFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200"
                    >
                      <option value="ALL">All Phases</option>
                      {availablePhasesInCollege.map((p) => (
                        <option key={p} value={p}>
                          Phase {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Categories Table / Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Candidate Category</th>
                        <th className="py-2.5 px-3">Best Rank (Min)</th>
                        <th className="py-2.5 px-3">Last Rank (Max)</th>
                        <th className="py-2.5 px-3">Allotted Students</th>
                        <th className="py-2.5 px-3">Gender Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentAnalytics.categoryInsights.length > 0 ? (
                        currentAnalytics.categoryInsights.map((cat) => (
                          <tr
                            key={cat.category}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {cat.category}
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              {cat.bestRank > 0 ? cat.bestRank.toLocaleString() : '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                              {cat.lastRank > 0 ? cat.lastRank.toLocaleString() : '—'}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                              {cat.studentCount}
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {cat.maleCount} M / {cat.femaleCount} F
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            No records found for this phase/branch combination.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Explanatory Info Notice */}
                <div className="pt-2 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Candidate Category vs Allotted Category:</strong> Candidate Category represents the student's personal reservation category (e.g. BC_D, SC), while Allotted Category specifies the exact seat quota they qualified into (e.g. OC_GEN_SVU, BC_D_GIRLS_UR). These two fields are distinct and recorded separately in official AP EAPCET registers.
                  </span>
                </div>
              </div>

              {/* Allotted Students Searchable, Sortable Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span>Allotted Students ({filteredCollegeRecords.length.toLocaleString()})</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Search, sort and filter official allotment rolls for {currentCollegeMeta.collegeName}.
                    </p>
                  </div>

                  {/* Search within this college */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={tableSearchQuery}
                        onChange={(e) => {
                          setTableSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search student or rank..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {tableSearchQuery && (
                        <button
                          onClick={() => setTableSearchQuery('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                        showAdvancedFilters || hasActiveFilters
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filters</span>
                      {hasActiveFilters && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Filter Parameters
                      </span>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Candidate Category
                        </label>
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => {
                            setSelectedCategoryFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                        >
                          <option value="ALL">All Categories</option>
                          {availableCategoriesInCollege.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Gender
                        </label>
                        <select
                          value={selectedGenderFilter}
                          onChange={(e) => {
                            setSelectedGenderFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                        >
                          <option value="ALL">All Genders</option>
                          <option value="M">Male (M)</option>
                          <option value="F">Female (F)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Region
                        </label>
                        <select
                          value={selectedRegionFilter}
                          onChange={(e) => {
                            setSelectedRegionFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                        >
                          <option value="ALL">All Regions</option>
                          <option value="AU">AU (Andhra Univ Region)</option>
                          <option value="SVU">SVU (Sri Venkateswara)</option>
                          <option value="NL">NL (Non-Local)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Phase
                        </label>
                        <select
                          value={selectedPhaseFilter}
                          onChange={(e) => {
                            setSelectedPhaseFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                        >
                          <option value="ALL">All Phases</option>
                          {availablePhasesInCollege.map((p) => (
                            <option key={p} value={p}>
                              Phase {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Allotted Category
                        </label>
                        <select
                          value={selectedAllottedCatFilter}
                          onChange={(e) => {
                            setSelectedAllottedCatFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                        >
                          <option value="ALL">All Allotted Quotas</option>
                          {availableAllottedCategoriesInCollege.map((ac) => (
                            <option key={ac} value={ac}>
                              {ac}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table View */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th
                          className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                          onClick={() => {
                            if (sortField === 'rank') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('rank');
                              setSortDirection('asc');
                            }
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Rank</span>
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </div>
                        </th>
                        <th
                          className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                          onClick={() => {
                            if (sortField === 'name') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('name');
                              setSortDirection('asc');
                            }
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Candidate Name</span>
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </div>
                        </th>
                        <th className="py-3 px-4">Gender</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Region</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Allotted Category</th>
                        <th className="py-3 px-4 text-right">Phase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {paginatedRecords.length > 0 ? (
                        paginatedRecords.map((r, idx) => (
                          <tr
                            key={`${r.cand_name}-${r.rank}-${idx}`}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {r.rank.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                              {r.cand_name}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              {r.gender}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                              {r.category}
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {r.region}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {r.branch_code}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                              {r.alloted_category}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                              Phase {r.phase}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-slate-500">
                            No students match the selected filters or query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-500">
                    Showing{' '}
                    <strong>
                      {filteredCollegeRecords.length === 0
                        ? 0
                        : (currentPage - 1) * pageSize + 1}
                    </strong>{' '}
                    to{' '}
                    <strong>
                      {Math.min(currentPage * pageSize, filteredCollegeRecords.length)}
                    </strong>{' '}
                    of <strong>{filteredCollegeRecords.length.toLocaleString()}</strong> students
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300"
                    >
                      <option value={20}>20 / page</option>
                      <option value={30}>30 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs px-2 text-slate-600 dark:text-slate-400 font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODE: SEARCH BY STUDENT NAME */}
      {viewMode === 'student-search' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                <span>Search Student Across Entire Dataset</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Search through all 37,637 official allotment records by student name. Supports full name, partial name, and multiple words (case-insensitive).
              </p>
            </div>

            <form onSubmit={handleStudentSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={studentSearchInput}
                  onChange={(e) => setStudentSearchInput(e.target.value)}
                  placeholder="Enter candidate name (e.g. JAGAN, PEDDIBOYINA BHAVITHA, LOKESH)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isStudentSearching || !studentSearchInput.trim()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isStudentSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search Records</span>
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Quick Test Searches:</span>
              {['JAGAN', 'PEDDIBOYINA BHAVITHA', 'CHARAN TEJA', 'LOKESH', 'SAI KUMAR'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setStudentSearchInput(sample);
                    setTimeout(() => {
                      searchApAllotments({ nameQuery: sample, limit: 100 }).then((res) => {
                        setStudentSearchResults(res.records);
                        setStudentSearchTotal(res.totalMatches);
                        setHasPerformedStudentSearch(true);
                      });
                    }, 50);
                  }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-mono transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          {hasPerformedStudentSearch && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                <span>
                  Found <strong>{studentSearchTotal}</strong> matching allotment record
                  {studentSearchTotal === 1 ? '' : 's'}.
                  {studentSearchTotal > 1 && (
                    <span className="ml-2 text-slate-400">
                      (Note: If identical names appear in multiple records, do not assume they are the same person; each allotment record is shown separately below.)
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">
                  Hall Ticket Number: Not published in official AP EAPCET public allotment dataset
                </span>
              </div>

              {studentSearchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentSearchResults.map((record, idx) => (
                    <div
                      key={`${record.cand_name}-${record.rank}-${idx}`}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {record.cand_name}
                          </h3>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Candidate Category: <strong>{record.category}</strong> · Gender:{' '}
                            <strong>{record.gender}</strong> · Region: <strong>{record.region}</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-mono">ALLOTMENT RANK</div>
                          <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                            {record.rank.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="text-[11px] uppercase font-bold text-slate-400">
                            Allotted Institution
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                            {record.college_name} ({record.college_code})
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] uppercase font-bold text-slate-400">
                            Branch
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {record.branch_name} ({record.branch_code})
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div>
                            <div className="text-[11px] uppercase font-bold text-slate-400">
                              Allotted Category
                            </div>
                            <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                              {record.alloted_category}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase font-bold text-slate-400">
                              Counselling Phase
                            </div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                              Phase {record.phase}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No matching allotment records found for &quot;{studentSearchInput}&quot;.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching by first name or check spelling variations.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MODE: SEARCH BY RANK / RANGE */}
      {viewMode === 'rank-search' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                <span>Search by Rank &amp; Rank Range</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                &quot;Where did this rank get allotted?&quot; Find exact students or explore where a rank band (e.g. 5,000 → 10,000) gained admission.
              </p>
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRankSearchType('exact')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  rankSearchType === 'exact'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Exact Rank Search
              </button>
              <button
                type="button"
                onClick={() => setRankSearchType('range')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  rankSearchType === 'range'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Rank Range (From → To)
              </button>
            </div>

            <form onSubmit={handleRankSearch} className="space-y-4">
              {rankSearchType === 'exact' ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={exactRankInput}
                      onChange={(e) => setExactRankInput(e.target.value)}
                      placeholder="Enter exact EAPCET rank (e.g. 3821, 53228)..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRankSearching || !exactRankInput.trim()}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isRankSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Explore Rank</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      From Rank:
                    </label>
                    <input
                      type="number"
                      value={rangeFromInput}
                      onChange={(e) => setRangeFromInput(e.target.value)}
                      placeholder="5000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="text-slate-400 font-bold self-end mb-2 hidden sm:block">
                    →
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      To Rank:
                    </label>
                    <input
                      type="number"
                      value={rangeToInput}
                      onChange={(e) => setRangeToInput(e.target.value)}
                      placeholder="10000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="w-full sm:w-auto self-end">
                    <button
                      type="submit"
                      disabled={isRankSearching}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isRankSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span>Filter Rank Band</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Rank Search Results */}
          {hasPerformedRankSearch && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-400 px-1">
                Found <strong>{rankSearchTotal}</strong> matching allotment record
                {rankSearchTotal === 1 ? '' : 's'}.
              </div>

              {rankSearchResults.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Candidate Name</th>
                        <th className="py-3 px-4">College</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Allotted Quota</th>
                        <th className="py-3 px-4">Region</th>
                        <th className="py-3 px-4 text-right">Phase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {rankSearchResults.map((r, idx) => (
                        <tr
                          key={`${r.cand_name}-${r.rank}-${idx}`}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {r.rank.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {r.cand_name}
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            <div className="font-semibold truncate max-w-xs">{r.college_name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{r.college_code}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {r.branch_code}
                            </span>
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              {r.branch_name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                            {r.category} ({r.gender})
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {r.alloted_category}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{r.region}</td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                            Phase {r.phase}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No matching allotment records found for this rank query.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. MODE: DATASET INSIGHTS & STATS */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>Overall AP EAPCET 2025 Dataset Statistics</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real, deterministic statistics computed directly from the uploaded AP EAPCET 2025 allotment files.
              </p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500">Colleges Cataloged</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {AP_EAPCET_GLOBAL_STATS.totalColleges}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  70 with full JSON archives ready
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500">Total Allotment Records</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {AP_EAPCET_GLOBAL_STATS.totalRecords.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Across {AP_EAPCET_GLOBAL_STATS.totalBranches} engineering branches
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500">Observed Rank Span</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {AP_EAPCET_GLOBAL_STATS.minRank.toLocaleString()} → {AP_EAPCET_GLOBAL_STATS.maxRank.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Min to max observed rank</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-500">Counselling Phases</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {AP_EAPCET_GLOBAL_STATS.phases.join(', ')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Phases 1 &amp; 2 recorded</div>
              </div>
            </div>

            {/* Categories & Regions Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Candidate Reservation Categories ({AP_EAPCET_GLOBAL_STATS.categories.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {AP_EAPCET_GLOBAL_STATS.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  University Regions
                </h3>
                <div className="flex flex-wrap gap-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">AU</div>
                    <div className="text-[11px] text-slate-500">Andhra University Area</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">SVU</div>
                    <div className="text-[11px] text-slate-500">Sri Venkateswara University Area</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">NL</div>
                    <div className="text-[11px] text-slate-500">Non-Local Quota</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
