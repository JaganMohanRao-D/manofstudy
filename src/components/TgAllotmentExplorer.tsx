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
  Copy,
  Check,
  Flame,
  Layers,
  Sparkles,
  AlertCircle,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Table as TableIcon,
  LayoutGrid,
  RefreshCw,
  TrendingUp,
  SlidersHorizontal,
  X,
  FileText,
  Info
} from 'lucide-react';
import {
  TgCandidateRecord,
  TgBranchData,
  TgCollegeFullData
} from '../types';
import {
  TG_EAPCET_COLLEGE_MANIFEST,
  TG_EAPCET_GLOBAL_STATS,
  TgCollegeManifestItem,
  TgAllotmentGlobalStats
} from '../data/tgEapcetCollegeManifest';

// Base path helper for asset fetching
const getBaseAllotmentPath = () => {
  const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
  const base = (metaEnv?.BASE_URL || '/').replace(/\/$/, '');
  return `${base}/TG_EAPCET_2026_ALLOTMENT`;
};

export default function TgAllotmentExplorer() {
  // 1. Core Manifest - Initialized from static build-time manifest, synchronized live from /api/tg-allotment/manifest
  const [collegesManifest, setCollegesManifest] = useState<TgCollegeManifestItem[]>(TG_EAPCET_COLLEGE_MANIFEST);
  const [globalStats, setGlobalStats] = useState<TgAllotmentGlobalStats>(TG_EAPCET_GLOBAL_STATS);

  // Sync live manifest on mount to pick up any dynamically added JSON files
  useEffect(() => {
    let isMounted = true;
    const fetchLiveManifest = async () => {
      try {
        const res = await fetch('/api/tg-allotment/manifest');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.colleges) && data.colleges.length > 0) {
            setCollegesManifest(data.colleges);
            if (data.stats) {
              setGlobalStats(data.stats);
            }
          }
        }
      } catch {
        // Fallback gracefully to bundled static manifest
      }
    };
    fetchLiveManifest();
    return () => {
      isMounted = false;
    };
  }, []);

  // Active College Selection (default to first available or VJEC if present)
  const defaultCollege = useMemo(() => {
    if (collegesManifest.length === 0) return '';
    const preferred = collegesManifest.find((c) => c.collegeCode === 'VJEC');
    return preferred ? preferred.collegeCode : collegesManifest[0].collegeCode;
  }, [collegesManifest]);

  const [selectedCollegeCode, setSelectedCollegeCode] = useState<string>(defaultCollege);

  // Synchronize selectedCollegeCode if empty
  useEffect(() => {
    if (!selectedCollegeCode && collegesManifest.length > 0) {
      const preferred = collegesManifest.find((c) => c.collegeCode === 'VJEC');
      setSelectedCollegeCode(preferred ? preferred.collegeCode : collegesManifest[0].collegeCode);
    }
  }, [collegesManifest, selectedCollegeCode]);

  const [selectedBranchCode, setSelectedBranchCode] = useState<string>('ALL'); // 'ALL' or specific branch
  const [collegeData, setCollegeData] = useState<TgCollegeFullData | null>(null);
  const [loadingCollege, setLoadingCollege] = useState<boolean>(false);
  const [collegeError, setCollegeError] = useState<string | null>(null);

  // In-memory cache to ensure zero redundant network requests when switching colleges
  const collegeCacheRef = useRef<Map<string, TgCollegeFullData>>(new Map());

  // College Selector & Search States
  const [collegeSearchTerm, setCollegeSearchTerm] = useState<string>('');
  const [selectedAlphabet, setSelectedAlphabet] = useState<string>('ALL');
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active Analytics Chart View
  const [branchMetricView, setBranchMetricView] = useState<'allotted' | 'opening' | 'closing' | 'spread'>('allotted');

  // Candidate Register Filters & Search
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [casteFilter, setCasteFilter] = useState<string>('ALL');
  const [seatCategoryFilter, setSeatCategoryFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'rank' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  // Cutoff Reference Search Filter
  const [quotaSearch, setQuotaSearch] = useState<string>('');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCollegeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Selected College Data dynamically
  useEffect(() => {
    if (!selectedCollegeCode || collegesManifest.length === 0) return;

    const currentCollegeItem = collegesManifest.find(
      (c) => c.collegeCode === selectedCollegeCode
    );
    if (!currentCollegeItem) return;

    // Check cache first
    if (collegeCacheRef.current.has(selectedCollegeCode)) {
      setCollegeData(collegeCacheRef.current.get(selectedCollegeCode)!);
      setCollegeError(null);
      setSelectedBranchCode('ALL');
      setCurrentPage(1);
      return;
    }

    let isMounted = true;
    const fetchCollegeData = async () => {
      setLoadingCollege(true);
      setCollegeError(null);

      const paths = [
        `${getBaseAllotmentPath()}/${currentCollegeItem.filename}`,
        `/TG_EAPCET_2026_ALLOTMENT/${currentCollegeItem.filename}`,
        `./TG_EAPCET_2026_ALLOTMENT/${currentCollegeItem.filename}`,
        `/TG_EAPCET_2026_ALLOTMENT/${currentCollegeItem.collegeCode}.json`,
        `./TG_EAPCET_2026_ALLOTMENT/${currentCollegeItem.collegeCode}.json`
      ];

      let success = false;
      for (const path of paths) {
        try {
          const res = await fetch(path);
          if (res.ok) {
            const data: TgCollegeFullData = await res.json();
            if (isMounted && data && Array.isArray(data.branches)) {
              collegeCacheRef.current.set(selectedCollegeCode, data);
              setCollegeData(data);
              setSelectedBranchCode('ALL');
              setCurrentPage(1);
              success = true;
              break;
            }
          }
        } catch {
          // try next path
        }
      }

      if (isMounted) {
        if (!success) {
          setCollegeError(
            `Unable to retrieve official allotment dataset for ${currentCollegeItem.collegeCode}. Please verify the network connection.`
          );
        }
        setLoadingCollege(false);
      }
    };

    fetchCollegeData();

    return () => {
      isMounted = false;
    };
  }, [selectedCollegeCode, collegesManifest]);

  // Current selected college metadata from manifest
  const currentCollegeMeta = useMemo(() => {
    return collegesManifest.find((c) => c.collegeCode === selectedCollegeCode) || null;
  }, [collegesManifest, selectedCollegeCode]);

  // Unique alphabet letters available in manifest
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    collegesManifest.forEach((c) => {
      const codeFirst = (c.collegeCode || '')[0]?.toUpperCase();
      if (codeFirst) letters.add(codeFirst);
    });
    return Array.from(letters).sort();
  }, [collegesManifest]);

  // Filtered list of colleges for selector
  const filteredColleges = useMemo(() => {
    const q = collegeSearchTerm.toLowerCase().trim();

    return collegesManifest.filter((c) => {
      // 1. Search term takes precedence and searches across ALL colleges regardless of alphabet selection
      if (q) {
        const codeMatch = (c.collegeCode || '').toLowerCase().includes(q);
        const nameMatch = (c.collegeName || '').toLowerCase().includes(q);
        const fileMatch = (c.filename || '').toLowerCase().includes(q);
        return codeMatch || nameMatch || fileMatch;
      }

      // 2. Alphabet filter applies only when no search query is active
      if (selectedAlphabet !== 'ALL') {
        const startsWithCode = (c.collegeCode || '').toUpperCase().startsWith(selectedAlphabet);
        const startsWithName = (c.collegeName || '').toUpperCase().startsWith(selectedAlphabet);
        if (!startsWithCode && !startsWithName) return false;
      }

      return true;
    });
  }, [collegesManifest, collegeSearchTerm, selectedAlphabet]);

  // Available branches in current college
  const availableBranches = useMemo(() => {
    if (!collegeData || !collegeData.branches) return [];
    return collegeData.branches.map((b) => ({
      code: b.branchCode,
      name: b.branchName,
      totalAllotted: b.totalAllotted || (b.records ? b.records.length : 0),
      openingRank: b.openingRank,
      closingRank: b.closingRank,
      spread: b.closingRank - b.openingRank
    }));
  }, [collegeData]);

  // Flattened or branch-specific candidate pool
  const allActiveRecords = useMemo(() => {
    if (!collegeData || !collegeData.branches) return [];
    if (selectedBranchCode === 'ALL') {
      return collegeData.branches.flatMap((b) => b.records || []);
    }
    const targetBranch = collegeData.branches.find(
      (b) => b.branchCode === selectedBranchCode
    );
    return targetBranch?.records || [];
  }, [collegeData, selectedBranchCode]);

  // Dynamic Institutional Analytics Calculated Directly from Active Records
  const analytics = useMemo(() => {
    if (!allActiveRecords || allActiveRecords.length === 0) {
      return {
        totalAllotted: 0,
        openingRank: 0,
        closingRank: 0,
        medianRank: 0,
        averageRank: 0,
        maleCount: 0,
        femaleCount: 0,
        malePct: '0.0',
        femalePct: '0.0',
        casteBreakdown: [] as { caste: string; count: number; percentage: string; closingRank: number }[],
        regionBreakdown: [] as { region: string; count: number; percentage: string }[],
        rankBuckets: [] as { label: string; count: number; percentage: string }[],
        categoryCutoffs: [] as { quota: string; count: number; openingRank: number; closingRank: number }[]
      };
    }

    const total = allActiveRecords.length;
    const ranks = allActiveRecords
      .map((r) => r.rank)
      .filter((r) => typeof r === 'number' && !isNaN(r))
      .sort((a, b) => a - b);

    const minR = ranks.length ? ranks[0] : 0;
    const maxR = ranks.length ? ranks[ranks.length - 1] : 0;
    const medianR = ranks.length ? ranks[Math.floor(ranks.length / 2)] : 0;
    const sumR = ranks.reduce((acc, curr) => acc + curr, 0);
    const avgR = ranks.length ? Math.round(sumR / ranks.length) : 0;

    // Gender breakdown
    let male = 0;
    let female = 0;
    allActiveRecords.forEach((r) => {
      const g = (r.gender || '').toUpperCase();
      if (g === 'M' || g === 'MALE') male++;
      else if (g === 'F' || g === 'FEMALE') female++;
      else male++; // fallback
    });

    // Caste breakdown with closing cutoff per caste
    const casteMap: Record<string, { count: number; maxRank: number }> = {};
    allActiveRecords.forEach((r) => {
      const c = r.caste || 'OTHER';
      if (!casteMap[c]) {
        casteMap[c] = { count: 0, maxRank: 0 };
      }
      casteMap[c].count++;
      if (r.rank > casteMap[c].maxRank) {
        casteMap[c].maxRank = r.rank;
      }
    });

    const standardCasteOrder = ['OC', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST', 'EWS'];
    const casteBreakdown = Object.entries(casteMap)
      .map(([caste, val]) => ({
        caste,
        count: val.count,
        percentage: ((val.count / total) * 100).toFixed(1),
        closingRank: val.maxRank
      }))
      .sort((a, b) => {
        const idxA = standardCasteOrder.indexOf(a.caste);
        const idxB = standardCasteOrder.indexOf(b.caste);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return b.count - a.count;
      });

    // Region breakdown (OU vs NL vs others)
    const regionMap: Record<string, number> = {};
    allActiveRecords.forEach((r) => {
      const reg = r.region || 'OU';
      regionMap[reg] = (regionMap[reg] || 0) + 1;
    });

    const regionBreakdown = Object.entries(regionMap)
      .map(([region, count]) => ({
        region,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    // Rank quartiles / tiers
    const b1 = ranks.filter((r) => r < 10000).length;
    const b2 = ranks.filter((r) => r >= 10000 && r < 25000).length;
    const b3 = ranks.filter((r) => r >= 25000 && r < 50000).length;
    const b4 = ranks.filter((r) => r >= 50000 && r < 100000).length;
    const b5 = ranks.filter((r) => r >= 100000).length;

    const rankBuckets = [
      { label: '< 10,000', count: b1, percentage: ((b1 / total) * 100).toFixed(1) },
      { label: '10,000 - 25,000', count: b2, percentage: ((b2 / total) * 100).toFixed(1) },
      { label: '25,000 - 50,000', count: b3, percentage: ((b3 / total) * 100).toFixed(1) },
      { label: '50,000 - 100,000', count: b4, percentage: ((b4 / total) * 100).toFixed(1) },
      { label: '> 100,000', count: b5, percentage: ((b5 / total) * 100).toFixed(1) }
    ];

    // Seat category breakdown
    const quotaMap: Record<string, { count: number; openingRank: number; closingRank: number }> = {};
    allActiveRecords.forEach((r) => {
      const q = r.seatCategory || 'GENERAL';
      if (!quotaMap[q]) {
        quotaMap[q] = { count: 0, openingRank: r.rank, closingRank: r.rank };
      }
      quotaMap[q].count++;
      if (r.rank < quotaMap[q].openingRank) quotaMap[q].openingRank = r.rank;
      if (r.rank > quotaMap[q].closingRank) quotaMap[q].closingRank = r.rank;
    });

    const categoryCutoffs = Object.entries(quotaMap)
      .map(([quota, val]) => ({
        quota,
        count: val.count,
        openingRank: val.openingRank,
        closingRank: val.closingRank
      }))
      .sort((a, b) => a.closingRank - b.closingRank);

    return {
      totalAllotted: total,
      openingRank: minR,
      closingRank: maxR,
      medianRank: medianR,
      averageRank: avgR,
      maleCount: male,
      femaleCount: female,
      malePct: total > 0 ? ((male / total) * 100).toFixed(1) : '0.0',
      femalePct: total > 0 ? ((female / total) * 100).toFixed(1) : '0.0',
      casteBreakdown,
      regionBreakdown,
      rankBuckets,
      categoryCutoffs
    };
  }, [allActiveRecords]);

  // Unique options for Candidate Filter dropdowns
  const filterOptions = useMemo(() => {
    const castes = new Set<string>();
    const quotas = new Set<string>();
    const regions = new Set<string>();

    allActiveRecords.forEach((r) => {
      if (r.caste) castes.add(r.caste);
      if (r.seatCategory) quotas.add(r.seatCategory);
      if (r.region) regions.add(r.region);
    });

    return {
      castes: Array.from(castes).sort(),
      quotas: Array.from(quotas).sort(),
      regions: Array.from(regions).sort()
    };
  }, [allActiveRecords]);

  // Search, Filter, and Sort Candidates
  const filteredCandidates = useMemo(() => {
    let list = [...allActiveRecords];

    // Search query
    if (candidateSearchQuery.trim()) {
      const q = candidateSearchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        return (
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.hallTicket && r.hallTicket.toLowerCase().includes(q)) ||
          (r.rank && r.rank.toString().includes(q)) ||
          (r.seatCategory && r.seatCategory.toLowerCase().includes(q)) ||
          (r.branchCode && r.branchCode.toLowerCase().includes(q))
        );
      });
    }

    // Gender filter
    if (genderFilter !== 'ALL') {
      list = list.filter((r) => r.gender === genderFilter);
    }

    // Caste filter
    if (casteFilter !== 'ALL') {
      list = list.filter((r) => r.caste === casteFilter);
    }

    // Seat Category filter
    if (seatCategoryFilter !== 'ALL') {
      list = list.filter((r) => r.seatCategory === seatCategoryFilter);
    }

    // Region filter
    if (regionFilter !== 'ALL') {
      list = list.filter((r) => r.region === regionFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortField === 'rank') {
        return sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank;
      } else {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return sortOrder === 'ASC'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
    });

    return list;
  }, [
    allActiveRecords,
    candidateSearchQuery,
    genderFilter,
    casteFilter,
    seatCategoryFilter,
    regionFilter,
    sortField,
    sortOrder
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));
  const paginatedCandidates = useMemo(() => {
    if (itemsPerPage >= filteredCandidates.length) {
      return filteredCandidates;
    }
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  // Copy Roll Number / Hall Ticket
  const handleCopy = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!filteredCandidates || filteredCandidates.length === 0) return;

    const headers = [
      'Rank',
      'Candidate Name',
      'Hall Ticket',
      'Gender',
      'Caste',
      'Seat Category',
      'Region',
      'College Code',
      'Branch Code',
      'Branch Name'
    ];

    const rows = filteredCandidates.map((c) => [
      c.rank,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.hallTicket || '',
      c.gender || '',
      c.caste || '',
      `"${c.seatCategory || ''}"`,
      c.region || '',
      c.collegeCode || selectedCollegeCode,
      c.branchCode || '',
      `"${(c.branchName || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TG_EAPCET_2026_${selectedCollegeCode}_${selectedBranchCode}_Candidates.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Category Quotas for reference table
  const filteredCategoryCutoffs = useMemo(() => {
    if (!quotaSearch.trim()) return analytics.categoryCutoffs;
    const q = quotaSearch.toLowerCase().trim();
    return analytics.categoryCutoffs.filter((c) =>
      c.quota.toLowerCase().includes(q)
    );
  }, [analytics.categoryCutoffs, quotaSearch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Top Header Banner with Dynamic Totals Derived Directly from Manifest */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/80 p-5 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                <span>OFFICIAL TG EAPCET 2026 FINAL PHASE ALLOTMENT INTELLIGENCE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Institutional Cutoffs &amp; Candidate Allotment Registers
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Zero-mock data analysis engine built strictly on official counseling allotment JSON records.
                Filter verified candidate rank allocations, branch admissions, and reservation closing boundaries.
              </p>
            </div>

            {/* Quick College Switcher Pill / Real Dynamic Stats from Manifest */}
            <div className="shrink-0 flex items-center gap-3 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 shadow-inner">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                  Participating Colleges
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {globalStats.totalColleges}{' '}
                  <span className="text-xs font-normal text-emerald-400">Institutions</span>
                </div>
                <div className="text-[10px] text-slate-500">Verified official files</div>
              </div>
              <div className="h-10 w-px bg-slate-800 mx-1" />
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                  Total Final Seats
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {globalStats.totalRecords.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Final phase admissions</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Primary Navigation Bar: College & Branch Selector with A-Z Alphabet Filtering */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* College Search & Select Dropdown */}
            <div className="lg:col-span-7 space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Select Engineering College ({collegesManifest.length} Available)
                </span>
                {currentCollegeMeta && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Code: {currentCollegeMeta.collegeCode}
                  </span>
                )}
              </label>

              {/* Custom College Picker Button */}
              <button
                type="button"
                onClick={() => setIsCollegeDropdownOpen(!isCollegeDropdownOpen)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="truncate pr-2">
                  <span className="font-bold text-emerald-400 mr-2">
                    [{currentCollegeMeta?.collegeCode || selectedCollegeCode}]
                  </span>
                  <span>{currentCollegeMeta?.collegeName || 'Choose College...'}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isCollegeDropdownOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Popover / Dropdown Menu */}
              {isCollegeDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-3 space-y-3">
                  
                  {/* Search input inside dropdown */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={collegeSearchTerm}
                      onChange={(e) => setCollegeSearchTerm(e.target.value)}
                      placeholder="Search all colleges by code (e.g. CBIT, VJEC, ACEG, VASV) or college name..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                    {collegeSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setCollegeSearchTerm('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* A-Z Quick Filter Bar */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedAlphabet('ALL')}
                      className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                        selectedAlphabet === 'ALL'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      ALL
                    </button>
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => {
                      const isAvail = availableLetters.includes(char);
                      return (
                        <button
                          key={char}
                          type="button"
                          disabled={!isAvail}
                          onClick={() => setSelectedAlphabet(char)}
                          className={`px-1.5 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                            selectedAlphabet === char
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : isAvail
                              ? 'bg-slate-950 text-slate-300 hover:text-emerald-300'
                              : 'text-slate-700 cursor-not-allowed opacity-40'
                          }`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </div>

                  {/* College Results List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50 pr-1">
                    {filteredColleges.length === 0 ? (
                      <div className="py-6 px-3 text-center space-y-2">
                        <p className="text-xs text-slate-300 font-semibold">
                          No colleges match &quot;{collegeSearchTerm}&quot;
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                          Searched across all {collegesManifest.length} verified institution allotment files in{' '}
                          <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[10px] border border-slate-800">
                            public/TG_EAPCET_2026_ALLOTMENT/
                          </code>
                          .
                        </p>
                        {selectedAlphabet !== 'ALL' && (
                          <button
                            type="button"
                            onClick={() => setSelectedAlphabet('ALL')}
                            className="mt-1 text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
                          >
                            Reset Alphabet filter &amp; view all {collegesManifest.length} colleges
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredColleges.map((c) => (
                        <button
                          key={c.collegeCode}
                          type="button"
                          onClick={() => {
                            setSelectedCollegeCode(c.collegeCode);
                            setIsCollegeDropdownOpen(false);
                            setCollegeSearchTerm('');
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                            selectedCollegeCode === c.collegeCode
                              ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="space-y-0.5 truncate">
                            <div className="font-bold flex items-center gap-1.5">
                              <span className="text-emerald-400 font-mono">[{c.collegeCode}]</span>
                              <span className="truncate">{c.collegeName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                              <span>{c.branchCount} Branches</span>
                              <span>•</span>
                              <span>{c.recordCount} Seats Allotted</span>
                              <span>•</span>
                              <span>Cutoffs: #{c.minRank.toLocaleString()} – #{c.maxRank.toLocaleString()}</span>
                            </div>
                          </div>
                          {selectedCollegeCode === c.collegeCode && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Branch Filter Dropdown */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  Filter by Branch Quota
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedBranchCode === 'ALL'
                    ? `All ${availableBranches.length} Branches`
                    : selectedBranchCode}
                </span>
              </label>

              <select
                value={selectedBranchCode}
                onChange={(e) => {
                  setSelectedBranchCode(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                <option value="ALL">
                  ★ All Branches Combined ({analytics.totalAllotted} Allotted Candidates)
                </option>
                {availableBranches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.name} ({b.totalAllotted} Allotted • #{b.openingRank} - #{b.closingRank})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Branch Select Pill Tabs */}
          {availableBranches.length > 0 && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap mr-1">
                Quick Branch:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedBranchCode('ALL');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                  selectedBranchCode === 'ALL'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                ALL ({collegeData?.branches.reduce((s, b) => s + (b.records ? b.records.length : b.totalAllotted), 0) || 0})
              </button>
              {availableBranches.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => {
                    setSelectedBranchCode(b.code);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                    selectedBranchCode === b.code
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                  title={`${b.name} (${b.totalAllotted} seats)`}
                >
                  {b.code} ({b.totalAllotted})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading / Error for Selected College */}
        {loadingCollege && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl py-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading {selectedCollegeCode} allotment register from official dataset...</p>
          </div>
        )}

        {collegeError && !loadingCollege && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center text-xs text-rose-300 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{collegeError}</span>
          </div>
        )}

        {!loadingCollege && !collegeError && collegeData && (
          <>
            {/* 3. Bento KPI Metric Cards (Strictly Computed from Real Candidate Records) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              
              {/* Total Seats */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span>Seats Allotted</span>
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {analytics.totalAllotted.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {selectedBranchCode === 'ALL' ? 'Total' : selectedBranchCode}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Official counseling intake</span>
              </div>

              {/* Opening Cutoff */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span>Opening Rank</span>
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    #{analytics.openingRank ? analytics.openingRank.toLocaleString() : '—'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">First admitted candidate</span>
              </div>

              {/* Closing Cutoff */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span>Closing Cutoff</span>
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                    #{analytics.closingRank ? analytics.closingRank.toLocaleString() : '—'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Final allotment boundary</span>
              </div>

              {/* Median Rank */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span>Median Rank</span>
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
                    #{analytics.medianRank ? analytics.medianRank.toLocaleString() : '—'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">50th percentile rank</span>
              </div>

              {/* Average Rank */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span>Average Rank</span>
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                    #{analytics.averageRank ? analytics.averageRank.toLocaleString() : '—'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Batch arithmetic mean</span>
              </div>

              {/* Branches Count */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span>Branches</span>
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
                    {availableBranches.length}
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">Disciplines</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{selectedCollegeCode} Quotas</span>
              </div>

            </div>

            {/* 4. Visual Analytics: Donut Charts (Gender, Region) & Bar Charts (Branch Metrics, Caste, Quartiles) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Gender Demographics Donut Chart */}
              <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 border-b border-slate-800/60 pb-2.5">
                  <span className="flex items-center gap-1.5">
                    <PieChartIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Gender Admission Distribution (Donut Chart)
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {analytics.totalAllotted} Candidates
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth="14"
                      />
                      {/* Boys Slice */}
                      {analytics.totalAllotted > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="36"
                          fill="transparent"
                          stroke="#06b6d4"
                          strokeWidth="14"
                          strokeDasharray={`${(analytics.maleCount / analytics.totalAllotted) * 226.2} 226.2`}
                          strokeDashoffset="0"
                          className="transition-all duration-700 ease-out"
                        />
                      )}
                      {/* Girls Slice */}
                      {analytics.totalAllotted > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="36"
                          fill="transparent"
                          stroke="#f43f5e"
                          strokeWidth="14"
                          strokeDasharray={`${(analytics.femaleCount / analytics.totalAllotted) * 226.2} 226.2`}
                          strokeDashoffset={`-${(analytics.maleCount / analytics.totalAllotted) * 226.2}`}
                          className="transition-all duration-700 ease-out"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-base font-black text-white font-mono leading-none">
                        {analytics.femalePct}%
                      </span>
                      <span className="text-[9px] text-rose-400 font-medium">Girls Ratio</span>
                    </div>
                  </div>

                  {/* Legend & Breakdown */}
                  <div className="space-y-2.5 w-full sm:w-auto">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Boys / Male</div>
                          <div className="text-[10px] text-slate-400">Standard &amp; open quota</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {analytics.maleCount} ({analytics.malePct}%)
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Girls / Female</div>
                          <div className="text-[10px] text-slate-400">33.3% women quota &amp; open merit</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-rose-400">
                          {analytics.femaleCount} ({analytics.femalePct}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="font-semibold text-slate-300">Analytical Insight:</span> In {selectedCollegeCode}, female candidates represent {analytics.femalePct}% of total admissions across {selectedBranchCode === 'ALL' ? 'all branches' : selectedBranchCode}.
                </div>
              </div>

              {/* Region Quota Distribution Donut Chart */}
              <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 border-b border-slate-800/60 pb-2.5">
                  <span className="flex items-center gap-1.5">
                    <PieChartIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Regional Area Quota (OU vs NL Donut Chart)
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Local 85% Reservation
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth="14"
                      />
                      {analytics.regionBreakdown.map((reg, idx) => {
                        const total = analytics.totalAllotted || 1;
                        const dash = (reg.count / total) * 226.2;
                        const prevSum = analytics.regionBreakdown
                          .slice(0, idx)
                          .reduce((s, r) => s + r.count, 0);
                        const offset = (prevSum / total) * 226.2;
                        const colors = ['#10b981', '#a855f7', '#f59e0b', '#3b82f6'];
                        return (
                          <circle
                            key={reg.region}
                            cx="50"
                            cy="50"
                            r="36"
                            fill="transparent"
                            stroke={colors[idx % colors.length]}
                            strokeWidth="14"
                            strokeDasharray={`${dash} 226.2`}
                            strokeDashoffset={`-${offset}`}
                            className="transition-all duration-700 ease-out"
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-base font-black text-white font-mono leading-none">
                        {analytics.regionBreakdown[0]?.percentage || '0'}%
                      </span>
                      <span className="text-[9px] text-emerald-400 font-medium">
                        {analytics.regionBreakdown[0]?.region || 'OU'} Quota
                      </span>
                    </div>
                  </div>

                  {/* Region Slices Legend */}
                  <div className="space-y-2 w-full sm:w-auto">
                    {analytics.regionBreakdown.map((r, idx) => {
                      const colors = ['bg-emerald-500 text-emerald-400', 'bg-purple-500 text-purple-400', 'bg-amber-500 text-amber-400'];
                      return (
                        <div
                          key={r.region}
                          className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length].split(' ')[0]}`} />
                            <span className="text-xs font-bold text-white">
                              {r.region === 'OU' ? 'OU Local Area (Osmania)' : r.region === 'NL' ? 'NL (Non-Local 15%)' : r.region}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-200">
                            {r.count} ({r.percentage}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="font-semibold text-slate-300">Statutory Quota Note:</span> Telangana state counseling allocates 85% of university seats to the Osmania University (OU) local jurisdiction, reserving 15% for Non-Local (NL) candidates.
                </div>
              </div>

            </div>

            {/* 5. Branch-Wise Allotments & Cutoffs Bar Chart */}
            {availableBranches.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      Branch-Wise Allotments &amp; Cutoff Matrix (Bar Chart)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Comparative engineering intake and closing thresholds across all disciplines in {selectedCollegeCode}.
                    </p>
                  </div>

                  {/* View Metric Mode Switcher */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1 self-start sm:self-auto text-xs">
                    <button
                      type="button"
                      onClick={() => setBranchMetricView('allotted')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        branchMetricView === 'allotted'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Seats Allotted
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchMetricView('closing')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        branchMetricView === 'closing'
                          ? 'bg-rose-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Closing Cutoff
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchMetricView('opening')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        branchMetricView === 'opening'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Opening Rank
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchMetricView('spread')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        branchMetricView === 'spread'
                          ? 'bg-purple-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Cutoff Spread
                    </button>
                  </div>
                </div>

                {/* Horizontal Bar Chart for Branches */}
                <div className="space-y-2.5 pt-1">
                  {(() => {
                    const maxAllotted = Math.max(...availableBranches.map((b) => b.totalAllotted), 1);
                    const maxClosing = Math.max(...availableBranches.map((b) => b.closingRank), 1);
                    const maxSpread = Math.max(...availableBranches.map((b) => b.spread), 1);

                    return availableBranches.map((b) => {
                      let barWidth = 0;
                      let displayVal = '';
                      let barColor = 'bg-emerald-500';

                      if (branchMetricView === 'allotted') {
                        barWidth = (b.totalAllotted / maxAllotted) * 100;
                        displayVal = `${b.totalAllotted} Seats`;
                        barColor = 'bg-emerald-500';
                      } else if (branchMetricView === 'closing') {
                        barWidth = (b.closingRank / maxClosing) * 100;
                        displayVal = `Closing: #${b.closingRank.toLocaleString()}`;
                        barColor = 'bg-rose-500';
                      } else if (branchMetricView === 'opening') {
                        barWidth = (b.openingRank / maxClosing) * 100;
                        displayVal = `Opening: #${b.openingRank.toLocaleString()}`;
                        barColor = 'bg-cyan-500';
                      } else {
                        barWidth = (b.spread / maxSpread) * 100;
                        displayVal = `Spread: ${b.spread.toLocaleString()} ranks`;
                        barColor = 'bg-purple-500';
                      }

                      return (
                        <div
                          key={b.code}
                          onClick={() => setSelectedBranchCode(selectedBranchCode === b.code ? 'ALL' : b.code)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            selectedBranchCode === b.code
                              ? 'bg-slate-900 border-emerald-500/60 shadow-md'
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold text-[11px]">
                                {b.code}
                              </span>
                              <span className="font-semibold text-slate-200 truncate">
                                {b.name}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] font-bold text-white shrink-0">
                              {displayVal}
                            </span>
                          </div>

                          {/* Bar Fill */}
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.max(barWidth, 2)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            />
                          </div>

                          {/* Sub-label showing opening and closing */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                            <span>Open: #{b.openingRank.toLocaleString()}</span>
                            <span>{b.totalAllotted} Candidates</span>
                            <span>Close: #{b.closingRank.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* 6. Caste Distribution & Rank Quartile Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Caste Breakdown Bar Chart */}
              <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 border-b border-slate-800/60 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Caste &amp; Community Intake (Bar Chart)
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Social Category Cutoffs
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {analytics.casteBreakdown.map((c) => {
                    const maxCount = Math.max(...analytics.casteBreakdown.map((item) => item.count), 1);
                    const pct = (c.count / maxCount) * 100;
                    return (
                      <div key={c.caste} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 w-12">
                              {c.caste}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {c.count} seats ({c.percentage}%)
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-300">
                            Cutoff: #{c.closingRank.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rank Brackets / Quartiles Bar Chart */}
              <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 border-b border-slate-800/60 pb-2">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Admitted Candidate Rank Brackets
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Quartiles
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {analytics.rankBuckets.map((b) => {
                    const maxB = Math.max(...analytics.rankBuckets.map((item) => item.count), 1);
                    const pct = (b.count / maxB) * 100;
                    return (
                      <div key={b.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-300">{b.label}</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {b.count} ({b.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-linear-to-r from-indigo-500 to-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 mt-2">
                  Reflects the student competitive density in this institution. High concentration in &lt;10,000 indicates premier engineering demand.
                </div>
              </div>

            </div>

            {/* 7. Category Quota Cutoff Reference Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Seat Category Reservation Cutoff Matrix
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Official opening and closing ranks for specific counseling quota reservation codes in {selectedCollegeCode}.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={quotaSearch}
                    onChange={(e) => setQuotaSearch(e.target.value)}
                    placeholder="Search quota (e.g. OC_GEN, BC_B)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Seat Category Quota</th>
                      <th className="py-2.5 px-3">Candidates Allotted</th>
                      <th className="py-2.5 px-3">Opening Rank</th>
                      <th className="py-2.5 px-3">Closing Rank</th>
                      <th className="py-2.5 px-3 text-right">Spread</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                    {filteredCategoryCutoffs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                          No category quotas found matching &quot;{quotaSearch}&quot;
                        </td>
                      </tr>
                    ) : (
                      filteredCategoryCutoffs.map((q) => (
                        <tr key={q.quota} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                            {q.quota}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {q.count} seats
                          </td>
                          <td className="py-2 px-3 font-mono text-emerald-300">
                            #{q.openingRank.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-mono text-rose-300 font-bold">
                            #{q.closingRank.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400 text-right">
                            {(q.closingRank - q.openingRank).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 8. Candidate Allotment Register with Search, Filters, View Modes & CSV Export */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/70 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">
                      Admitted Candidate Allotment Register
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {filteredCandidates.length} of {allActiveRecords.length} Records
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Complete candidate-level allotment verification from the official counseling return.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* View Mode Switcher */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Table View"
                    >
                      <TableIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'cards'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Card View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Export CSV */}
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filtering Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-1">
                
                {/* Search Bar */}
                <div className="lg:col-span-2 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={candidateSearchQuery}
                    onChange={(e) => {
                      setCandidateSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search candidate, hall ticket, rank..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {candidateSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Gender Dropdown */}
                <div>
                  <select
                    value={genderFilter}
                    onChange={(e) => {
                      setGenderFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">Gender: All</option>
                    <option value="M">Male (Boys)</option>
                    <option value="F">Female (Girls)</option>
                  </select>
                </div>

                {/* Caste Dropdown */}
                <div>
                  <select
                    value={casteFilter}
                    onChange={(e) => {
                      setCasteFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">Caste: All</option>
                    {filterOptions.castes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seat Category Dropdown */}
                <div>
                  <select
                    value={seatCategoryFilter}
                    onChange={(e) => {
                      setSeatCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">Seat Quota: All</option>
                    {filterOptions.quotas.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region Dropdown */}
                <div>
                  <select
                    value={regionFilter}
                    onChange={(e) => {
                      setRegionFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">Region: All</option>
                    {filterOptions.regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Sorting and Page Size Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 font-medium">Sort By:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (sortField === 'rank') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortField('rank');
                        setSortOrder('ASC');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                      sortField === 'rank'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                    <span>({sortOrder === 'ASC' ? '1 → 100K' : '100K → 1'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (sortField === 'name') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortField('name');
                        setSortOrder('ASC');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                      sortField === 'name'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                    <span>({sortOrder === 'ASC' ? 'A → Z' : 'Z → A'})</span>
                  </button>
                </div>

                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-slate-500">Per Page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                    <option value={10000}>All ({filteredCandidates.length})</option>
                  </select>
                </div>
              </div>

              {/* Candidates Presentation: Table or Card Grid */}
              {filteredCandidates.length === 0 ? (
                <div className="py-12 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-2">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No candidates match the specified filters.</p>
                  <p className="text-xs text-slate-500">Try resetting your search query or broadening the filter options.</p>
                </div>
              ) : viewMode === 'table' ? (
                /* Dense Academic Table */
                <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3.5">Rank</th>
                        <th className="py-3 px-3.5">Candidate Name</th>
                        <th className="py-3 px-3.5">Hall Ticket</th>
                        <th className="py-3 px-3.5">Gender</th>
                        <th className="py-3 px-3.5">Caste</th>
                        <th className="py-3 px-3.5">Seat Category Quota</th>
                        <th className="py-3 px-3.5">Region</th>
                        <th className="py-3 px-3.5">Branch</th>
                        <th className="py-3 px-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {paginatedCandidates.map((c, idx) => (
                        <tr
                          key={`${c.hallTicket}_${c.rank}_${idx}`}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3.5 font-mono font-black text-emerald-400">
                            #{c.rank.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3.5 font-semibold text-slate-100">
                            {c.name}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-300">
                            {c.hallTicket}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                c.gender === 'M'
                                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {c.gender}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-amber-400">
                            {c.caste}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-200">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {c.seatCategory}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-400">
                            {c.region}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-cyan-300" title={c.branchName}>
                            {c.branchCode}
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy(c.hallTicket)}
                              className="p-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                              title="Copy Hall Ticket"
                            >
                              {copiedTicket === c.hallTicket ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 text-[10px]">Copied</span>
                                </>
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Card Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedCandidates.map((c, idx) => (
                    <div
                      key={`${c.hallTicket}_${c.rank}_${idx}`}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 hover:border-slate-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-white leading-snug">
                            {c.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>HT: {c.hallTicket}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.hallTicket)}
                              className="text-slate-500 hover:text-white"
                            >
                              {copiedTicket === c.hallTicket ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black font-mono text-emerald-400">
                            #{c.rank.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Branch</span>
                          <span className="font-mono text-cyan-300 font-semibold">{c.branchCode}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Quota</span>
                          <span className="font-mono text-slate-300">{c.seatCategory}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Caste &amp; Gender</span>
                          <span className="font-mono text-amber-400">
                            {c.caste} ({c.gender})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Region</span>
                          <span className="font-mono text-slate-300">{c.region}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80 text-xs">
                  <div className="text-slate-400 text-[11px] font-mono">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of{' '}
                    {filteredCandidates.length} candidate records
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs">
                      Page <span className="text-emerald-400 font-bold">{currentPage}</span> of{' '}
                      {totalPages}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}
