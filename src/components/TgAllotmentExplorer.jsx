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
  Copy, 
  Check, 
  Flame,
  Layers,
  Sparkles,
  AlertCircle,
  Filter,
  BarChart3,
  PieChart,
  X,
  ShieldCheck,
  TrendingUp,
  Globe2,
  ExternalLink,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { TG_EAPCET_COLLEGE_MANIFEST } from '../data/tgEapcetCollegeManifest';

// Top engineering colleges for quick access
const FEATURED_COLLEGES = [
  { code: "CBIT", name: "CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY" },
  { code: "VJEC", name: "VNR VIGNANA JYOTHI INSTITUTE OF ENGG & TECH" },
  { code: "VASV", name: "VASAVI COLLEGE OF ENGINEERING" },
  { code: "CVRH", name: "CVR COLLEGE OF ENGINEERING" },
  { code: "GRET", name: "GOKARAJU RANGARAJU INSTITUTE OF ENGG & TECH" },
  { code: "MGIT", name: "MAHATMA GANDHI INSTITUTE OF TECHNOLOGY" },
  { code: "KMIT", name: "KESAV MEMORIAL INSTITUTE OF TECHNOLOGY" },
  { code: "OUCE", name: "OSMANIA UNIVERSITY COLLEGE OF ENGINEERING" },
  { code: "JNTH", name: "JNTUH COLLEGE OF ENGINEERING HYDERABAD" },
  { code: "ACEG", name: "A C E ENGINEERING COLLEGE" },
  { code: "VBIT", name: "VIGNAN BHARATI INSTITUTE OF TECHNOLOGY" },
  { code: "VMEG", name: "VARDHAMAN COLLEGE OF ENGINEERING" },
  { code: "TKRC", name: "T K R COLLEGE OF ENGINEERING AND TECHNOLOGY" },
  { code: "MLRD", name: "MALLA REDDY COLLEGE OF ENGG & TECHNOLOGY" },
  { code: "SNIS", name: "SREENIDHI INSTITUTE OF SCIENCE & TECHNOLOGY" }
];

export default function TgAllotmentExplorer() {
  const [selectedCollegeCode, setSelectedCollegeCode] = useState('CBIT');
  const [collegeData, setCollegeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  
  // Searchable dropdown open/search states
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');

  // Dropdown click-outside refs
  const collegeDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [casteFilter, setCasteFilter] = useState('ALL');
  const [seatCategoryFilter, setSeatCategoryFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [copiedTicket, setCopiedTicket] = useState(null);

  // Global Cross-College Search State
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState(null);

  // Bottom Analytics Drawer / Section Collapsible State
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target)) {
        setIsCollegeDropdownOpen(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setIsBranchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch college allotment JSON
  useEffect(() => {
    if (!selectedCollegeCode) return;
    setLoading(true);
    setErrorMessage(null);

    const normalizedCode = selectedCollegeCode === 'VNRV' ? 'VJEC' : selectedCollegeCode;
    const manifestEntry = TG_EAPCET_COLLEGE_MANIFEST.find(
      (c) => c.collegeCode.toUpperCase() === normalizedCode.toUpperCase()
    );
    const targetUrl = manifestEntry?.file || `/TG_EAPCET_2026_ALLOTMENT/${normalizedCode}.json`;

    fetch(targetUrl)
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || contentType.includes('text/html')) {
          throw new Error(`Data file not available for [${normalizedCode}].`);
        }
        return res.json();
      })
      .then((data) => {
        const bundles = Array.isArray(data) ? data : (data.branches || [data]);
        setCollegeData(bundles);

        if (bundles.length > 0) {
          setSelectedBranchCode((prev) => {
            const hasBranch = bundles.some((b) => b.branchCode === prev);
            return hasBranch ? prev : (bundles[0].branchCode || '');
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Notice loading college JSON:', err.message);
        setCollegeData([]);
        setErrorMessage(
          `కాలేజీ [${normalizedCode}] అలాట్‌మెంట్ డేటా ప్రస్తుతం లోడ్ కాలేదు. దయచేసి అందుబాటులో ఉన్న కాలేజీని ఎంచుకోండి.`
        );
        setLoading(false);
      });
  }, [selectedCollegeCode]);

  // Selected college info from manifest or fallback
  const currentCollegeMeta = useMemo(() => {
    const found = TG_EAPCET_COLLEGE_MANIFEST.find(
      (c) => c.collegeCode.toUpperCase() === selectedCollegeCode.toUpperCase()
    );
    if (found) return found;
    const feat = FEATURED_COLLEGES.find((f) => f.code === selectedCollegeCode);
    return {
      collegeCode: selectedCollegeCode,
      collegeName: feat ? feat.name : selectedCollegeCode,
      recordCount: collegeData.reduce((acc, b) => acc + (b.records?.length || 0), 0)
    };
  }, [selectedCollegeCode, collegeData]);

  // Filtered colleges list for searchable dropdown
  const filteredColleges = useMemo(() => {
    const term = collegeSearchTerm.toLowerCase().trim();
    if (!term) return TG_EAPCET_COLLEGE_MANIFEST;
    return TG_EAPCET_COLLEGE_MANIFEST.filter(
      (c) =>
        c.collegeCode.toLowerCase().includes(term) ||
        c.collegeName.toLowerCase().includes(term)
    );
  }, [collegeSearchTerm]);

  // Available branches in currently selected college
  const availableBranches = useMemo(() => {
    return collegeData.map((item) => ({
      code: item.branchCode || '',
      name: item.branchName || item.branchCode || '',
      allottedCount: item.totalAllotted || item.records?.length || 0,
      openingRank: item.openingRank || 0,
      closingRank: item.closingRank || 0
    }));
  }, [collegeData]);

  // Filtered branches for searchable dropdown
  const filteredBranches = useMemo(() => {
    const term = branchSearchTerm.toLowerCase().trim();
    if (!term) return availableBranches;
    return availableBranches.filter(
      (b) =>
        b.code.toLowerCase().includes(term) ||
        b.name.toLowerCase().includes(term)
    );
  }, [availableBranches, branchSearchTerm]);

  // Current selected branch bundle
  const currentBundle = useMemo(() => {
    if (!collegeData.length) return null;
    return collegeData.find((item) => item.branchCode === selectedBranchCode) || collegeData[0] || null;
  }, [collegeData, selectedBranchCode]);

  // Category-wise Opening & Closing Ranks (Best & Last Rank per Quota)
  const categoryCutoffs = useMemo(() => {
    if (!currentBundle || !currentBundle.records || currentBundle.records.length === 0) {
      return [];
    }
    const map = {};
    currentBundle.records.forEach((r) => {
      const cat = r.seatCategory || 'UNSPECIFIED';
      if (!map[cat]) {
        map[cat] = {
          category: cat,
          openingRank: r.rank,
          closingRank: r.rank,
          count: 1,
          maleCount: r.gender === 'M' ? 1 : 0,
          femaleCount: r.gender === 'F' ? 1 : 0
        };
      } else {
        map[cat].count++;
        if (r.gender === 'M') map[cat].maleCount++;
        if (r.gender === 'F') map[cat].femaleCount++;
        if (r.rank < map[cat].openingRank) map[cat].openingRank = r.rank;
        if (r.rank > map[cat].closingRank) map[cat].closingRank = r.rank;
      }
    });

    return Object.values(map).sort((a, b) => a.openingRank - b.openingRank);
  }, [currentBundle]);

  // Real-time Analytics & Distribution Metrics
  const analytics = useMemo(() => {
    if (!currentBundle || !currentBundle.records || currentBundle.records.length === 0) {
      return { 
        totalAllotted: 0, 
        openingRank: 0, 
        closingRank: 0, 
        maleCount: 0, 
        femaleCount: 0, 
        malePct: 0, 
        femalePct: 0,
        quotaDistribution: [],
        casteDistribution: []
      };
    }

    const records = currentBundle.records;
    const total = records.length;
    let male = 0;
    let female = 0;
    const casteMap = {};
    const quotaGroupMap = {};

    records.forEach((r) => {
      if (r.gender === 'M') male++;
      if (r.gender === 'F') female++;

      const caste = r.caste || 'OTHER';
      casteMap[caste] = (casteMap[caste] || 0) + 1;

      let broadQuota = 'OTHER';
      const catUpper = (r.seatCategory || '').toUpperCase();
      if (catUpper.startsWith('OC') || catUpper.startsWith('OPEN')) broadQuota = 'OC';
      else if (catUpper.startsWith('BC_A')) broadQuota = 'BC-A';
      else if (catUpper.startsWith('BC_B')) broadQuota = 'BC-B';
      else if (catUpper.startsWith('BC_C')) broadQuota = 'BC-C';
      else if (catUpper.startsWith('BC_D')) broadQuota = 'BC-D';
      else if (catUpper.startsWith('BC_E')) broadQuota = 'BC-E';
      else if (catUpper.startsWith('SC')) broadQuota = 'SC';
      else if (catUpper.startsWith('ST')) broadQuota = 'ST';
      else if (catUpper.startsWith('EWS')) broadQuota = 'EWS';
      else broadQuota = r.caste || 'RESERVED';

      quotaGroupMap[broadQuota] = (quotaGroupMap[broadQuota] || 0) + 1;
    });

    const quotaDistribution = Object.entries(quotaGroupMap)
      .map(([name, count]) => ({
        name,
        count,
        pct: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const casteDistribution = Object.entries(casteMap)
      .map(([caste, count]) => ({
        caste,
        count,
        pct: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.caste.localeCompare(b.caste);
      });

    return {
      totalAllotted: total,
      openingRank: currentBundle.openingRank || records[0]?.rank || 0,
      closingRank: currentBundle.closingRank || records[total - 1]?.rank || 0,
      maleCount: male,
      femaleCount: female,
      malePct: total > 0 ? ((male / total) * 100).toFixed(1) : 0,
      femalePct: total > 0 ? ((female / total) * 100).toFixed(1) : 0,
      quotaDistribution,
      casteDistribution
    };
  }, [currentBundle]);

  // Unique castes & seat categories for filters
  const availableCastes = useMemo(() => {
    if (!currentBundle || !currentBundle.records) return [];
    const set = new Set();
    currentBundle.records.forEach((r) => {
      if (r.caste) set.add(r.caste);
    });
    return Array.from(set).sort();
  }, [currentBundle]);

  const availableSeatCategories = useMemo(() => {
    return categoryCutoffs.map((c) => c.category);
  }, [categoryCutoffs]);

  // Filtered Candidates in current branch
  const filteredCandidates = useMemo(() => {
    if (!currentBundle || !currentBundle.records) return [];
    let list = [...currentBundle.records];

    if (genderFilter !== 'ALL') {
      list = list.filter((r) => r.gender === genderFilter);
    }

    if (casteFilter !== 'ALL') {
      list = list.filter((r) => r.caste === casteFilter);
    }

    if (seatCategoryFilter !== 'ALL') {
      list = list.filter((r) => r.seatCategory === seatCategoryFilter);
    }

    if (searchQuery.trim() !== '' && !isGlobalSearchActive) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => 
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.hallTicket && r.hallTicket.toLowerCase().includes(q)) ||
        (r.rank && r.rank.toString().includes(q)) ||
        (r.seatCategory && r.seatCategory.toLowerCase().includes(q)) ||
        (r.caste && r.caste.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => (sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank));
    return list;
  }, [currentBundle, searchQuery, genderFilter, casteFilter, seatCategoryFilter, sortOrder, isGlobalSearchActive]);

  // Global Cross-College Search Handler
  const handleExecuteGlobalSearch = async (term) => {
    const q = (term !== undefined ? term : searchQuery).trim();
    if (!q || q.length < 2) {
      setIsGlobalSearchActive(false);
      setGlobalSearchResults([]);
      return;
    }

    setIsSearchingGlobal(true);
    setGlobalSearchError(null);
    setIsGlobalSearchActive(true);

    try {
      const res = await fetch(`/api/tg-allotment/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Global search request failed');
      const data = await res.json();
      setGlobalSearchResults(data.results || []);
      setCurrentPage(1);
    } catch (err) {
      console.warn('Global search notice:', err);
      setGlobalSearchError('Cross-college search currently scanning offline. Showing local matches.');
      setGlobalSearchResults([]);
    } finally {
      setIsSearchingGlobal(false);
    }
  };

  const clearGlobalSearch = () => {
    setIsGlobalSearchActive(false);
    setGlobalSearchResults([]);
    setGlobalSearchError(null);
    setCurrentPage(1);
  };

  // Active candidates list (local branch vs global cross-college)
  const activeDisplayList = isGlobalSearchActive ? globalSearchResults : filteredCandidates;
  const totalPages = Math.ceil(activeDisplayList.length / itemsPerPage) || 1;

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return activeDisplayList.slice(start, start + itemsPerPage);
  }, [activeDisplayList, currentPage, itemsPerPage]);

  const handleCopyTicket = (ticket) => {
    if (!ticket) return;
    navigator.clipboard?.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  // Jump to specific college & branch from global search result card
  const handleJumpToCollegeBranch = (collegeCode, branchCode) => {
    if (collegeCode) {
      setSelectedCollegeCode(collegeCode);
    }
    if (branchCode) {
      setSelectedBranchCode(branchCode);
    }
    setIsGlobalSearchActive(false);
    setGlobalSearchResults([]);
    setSearchQuery('');
    setCurrentPage(1);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Color mapping helper for quota badges/bars
  const getQuotaColorClasses = (quotaName) => {
    const q = (quotaName || '').toUpperCase();
    if (q === 'OC') return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', lightBg: 'bg-emerald-500/10' };
    if (q.startsWith('BC-B') || q.startsWith('BC_B')) return { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', lightBg: 'bg-blue-500/10' };
    if (q.startsWith('BC-A') || q.startsWith('BC_A')) return { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30', lightBg: 'bg-cyan-500/10' };
    if (q.startsWith('BC-D') || q.startsWith('BC_D')) return { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/30', lightBg: 'bg-indigo-500/10' };
    if (q.startsWith('SC')) return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', lightBg: 'bg-amber-500/10' };
    if (q.startsWith('ST')) return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30', lightBg: 'bg-rose-500/10' };
    if (q.startsWith('EWS')) return { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', lightBg: 'bg-purple-500/10' };
    return { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/30', lightBg: 'bg-teal-500/10' };
  };

  // Dynamic color palette helper for Caste / Community spread
  const getCommunityColorClasses = (communityName) => {
    const c = (communityName || '').toUpperCase().trim();
    if (c === 'OC' || c === 'OPEN') {
      return {
        bar: 'from-emerald-500 to-teal-400',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        text: 'text-emerald-400'
      };
    }
    if (c.startsWith('EWS')) {
      return {
        bar: 'from-teal-500 to-emerald-400',
        badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
        text: 'text-teal-400'
      };
    }
    if (c.startsWith('BC_A') || c.startsWith('BC-A')) {
      return {
        bar: 'from-cyan-500 to-blue-500',
        badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        text: 'text-cyan-400'
      };
    }
    if (c.startsWith('BC_B') || c.startsWith('BC-B')) {
      return {
        bar: 'from-blue-500 to-indigo-500',
        badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        text: 'text-blue-400'
      };
    }
    if (c.startsWith('BC_C') || c.startsWith('BC-C')) {
      return {
        bar: 'from-sky-500 to-cyan-500',
        badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        text: 'text-sky-400'
      };
    }
    if (c.startsWith('BC_D') || c.startsWith('BC-D')) {
      return {
        bar: 'from-indigo-500 to-sky-500',
        badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        text: 'text-indigo-400'
      };
    }
    if (c.startsWith('BC_E') || c.startsWith('BC-E')) {
      return {
        bar: 'from-violet-500 to-purple-500',
        badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
        text: 'text-violet-400'
      };
    }
    if (c.startsWith('SC')) {
      return {
        bar: 'from-amber-500 to-orange-400',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        text: 'text-amber-400'
      };
    }
    if (c.startsWith('ST')) {
      return {
        bar: 'from-rose-500 to-pink-500',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        text: 'text-rose-400'
      };
    }
    return {
      bar: 'from-fuchsia-500 to-rose-400',
      badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
      text: 'text-fuchsia-400'
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* 1. BRANDING & TERMINOLOGY OVERHAUL */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold tracking-wide">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>🔥 TG EAPCET 2026 Final Phase Seat Allotments Name Wise</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            TG EAPCET 2026 Final Phase Seat Allotments Name Wise
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed px-1">
            తెలంగాణ ఇంజనీరింగ్ కాలేజీల వారీగా, బ్రాంచ్ వారీగా విద్యార్థుల అలాట్‌మెంట్ జాబితా &amp; కట్-ఆఫ్ ర్యాంకులు (151+ కాలేజీలు, 71,600+ సీట్లు)
          </p>
        </div>

        {/* 2. TOP SELECTORS & QUICK SEARCH (MOBILE-FIRST) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

            {/* Institution Selector */}
            <div className="relative" ref={collegeDropdownRef}>
              <label className="text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Select Institution / కళాశాల
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                  {TG_EAPCET_COLLEGE_MANIFEST.length} Colleges
                </span>
              </label>

              <button
                type="button"
                id="college-dropdown-trigger"
                onClick={() => {
                  setIsCollegeDropdownOpen(!isCollegeDropdownOpen);
                  setIsBranchDropdownOpen(false);
                  setCollegeSearchTerm('');
                }}
                className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 transition-all text-left shadow-inner"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold shrink-0">
                    {selectedCollegeCode}
                  </span>
                  <span className="truncate text-slate-100 font-medium">
                    {currentCollegeMeta.collegeName}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isCollegeDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {/* Popover */}
              {isCollegeDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-800 bg-slate-950">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        autoFocus
                        id="institution-search-input"
                        value={collegeSearchTerm}
                        onChange={(e) => setCollegeSearchTerm(e.target.value)}
                        placeholder="Search college code or name..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      {collegeSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setCollegeSearchTerm('')}
                          className="absolute right-2 top-2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/40 text-xs">
                    {filteredColleges.length === 0 ? (
                      <div className="p-3 text-center text-slate-400">
                        No colleges found matching "{collegeSearchTerm}"
                      </div>
                    ) : (
                      filteredColleges.map((c) => {
                        const isSelected = c.collegeCode === selectedCollegeCode;
                        return (
                          <button
                            key={c.collegeCode}
                            type="button"
                            onClick={() => {
                              setSelectedCollegeCode(c.collegeCode);
                              setIsCollegeDropdownOpen(false);
                              clearGlobalSearch();
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                              isSelected ? 'bg-emerald-500/15 text-emerald-300 font-bold' : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate pr-2">
                              <span className={`px-1 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {c.collegeCode}
                              </span>
                              <span className="truncate">{c.collegeName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                              {c.recordCount} seats
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Branch Selector */}
            <div className="relative" ref={branchDropdownRef}>
              <label className="text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  Select Branch / ఇంజనీరింగ్ బ్రాంచ్
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                  {availableBranches.length} Branches
                </span>
              </label>

              <button
                type="button"
                id="branch-dropdown-trigger"
                disabled={availableBranches.length === 0}
                onClick={() => {
                  setIsBranchDropdownOpen(!isBranchDropdownOpen);
                  setIsCollegeDropdownOpen(false);
                  setBranchSearchTerm('');
                }}
                className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-all text-left shadow-inner disabled:opacity-50"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold shrink-0">
                    {selectedBranchCode || 'None'}
                  </span>
                  <span className="truncate text-slate-100 font-medium">
                    {currentBundle ? (currentBundle.branchName || currentBundle.branchCode) : 'Select branch'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isBranchDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>

              {/* Popover */}
              {isBranchDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-800 bg-slate-950">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        autoFocus
                        id="branch-search-input"
                        value={branchSearchTerm}
                        onChange={(e) => setBranchSearchTerm(e.target.value)}
                        placeholder="Search branch code or name (e.g. CSE, CSM)..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      {branchSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setBranchSearchTerm('')}
                          className="absolute right-2 top-2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/40 text-xs">
                    {filteredBranches.length === 0 ? (
                      <div className="p-3 text-center text-slate-400">
                        No branches found matching "{branchSearchTerm}"
                      </div>
                    ) : (
                      filteredBranches.map((b) => {
                        const isSelected = b.code === selectedBranchCode;
                        return (
                          <button
                            key={b.code}
                            type="button"
                            onClick={() => {
                              setSelectedBranchCode(b.code);
                              setIsBranchDropdownOpen(false);
                              clearGlobalSearch();
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                              isSelected ? 'bg-indigo-500/15 text-indigo-300 font-bold' : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate pr-2">
                              <span className={`px-1 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {b.code}
                              </span>
                              <span className="truncate">{b.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                              {b.allottedCount} seats
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 3. GLOBAL CROSS-COLLEGE & LOCAL CANDIDATE SEARCH BAR */}
          <div className="space-y-2 pt-1 border-t border-slate-800/70">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  id="candidate-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (isGlobalSearchActive) {
                      setIsGlobalSearchActive(false);
                    }
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleExecuteGlobalSearch();
                    }
                  }}
                  placeholder="Type Student Name, Hall Ticket, or Rank..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500 placeholder-slate-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      clearGlobalSearch();
                    }}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons: Global Search + Filter toggles */}
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-global-search"
                  onClick={() => handleExecuteGlobalSearch()}
                  disabled={isSearchingGlobal || !searchQuery.trim()}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isGlobalSearchActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                  } disabled:opacity-40 cursor-pointer`}
                  title="Search across all 151 Telangana engineering colleges"
                >
                  {isSearchingGlobal ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Globe2 className="w-3.5 h-3.5" />
                  )}
                  <span>Search All Colleges</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">{sortOrder === 'ASC' ? 'Rank: Low-High' : 'Rank: High-Low'}</span>
                </button>
              </div>
            </div>

            {/* Quick Filters Strip */}
            {!isGlobalSearchActive && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                {/* Gender */}
                <select
                  value={genderFilter}
                  onChange={(e) => {
                    setGenderFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Genders</option>
                  <option value="M">Boys (M)</option>
                  <option value="F">Girls (F)</option>
                </select>

                {/* Caste */}
                <select
                  value={casteFilter}
                  onChange={(e) => {
                    setCasteFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Castes</option>
                  {availableCastes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Quota */}
                <select
                  value={seatCategoryFilter}
                  onChange={(e) => {
                    setSeatCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Seat Categories / Quotas</option>
                  {availableSeatCategories.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Global Search Banner (when active) */}
        {isGlobalSearchActive && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white">Global Student Tracker Active: </span>
                <span className="text-rose-300">
                  Found {globalSearchResults.length} student record{globalSearchResults.length === 1 ? '' : 's'} matching "{searchQuery}" across all 151 colleges.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={clearGlobalSearch}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold shrink-0"
            >
              Back to {selectedCollegeCode} Branch ✕
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-amber-300">{errorMessage}</h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['CBIT', 'VJEC', 'VASV', 'CVRH', 'VBIT'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCollegeCode(c);
                      clearGlobalSearch();
                    }}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold"
                  >
                    View {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. DIRECT CANDIDATE CARDS GRID (IMMEDIATE VISIBILITY) */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-rose-400 font-mono text-xs sm:text-sm animate-pulse">
              [{selectedCollegeCode}] అలాట్‌మెంట్ రికార్డులను లోడ్ చేస్తోంది...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header & Pagination status */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Showing <span className="text-white font-bold">{activeDisplayList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> – <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, activeDisplayList.length)}</span> of <span className="text-white font-bold">{activeDisplayList.length}</span> students {isGlobalSearchActive ? '(All Colleges)' : `in [${selectedCollegeCode} - ${currentBundle?.branchCode}]`}
                </span>
                {(genderFilter !== 'ALL' || casteFilter !== 'ALL' || seatCategoryFilter !== 'ALL' || searchQuery) && !isGlobalSearchActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setGenderFilter('ALL');
                      setCasteFilter('ALL');
                      setSeatCategoryFilter('ALL');
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]"
                  >
                    Clear Filter ✕
                  </button>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[11px]">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Candidate List Cards */}
            {activeDisplayList.length === 0 ? (
              <div className="py-14 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 p-4">
                <Users className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-sm font-semibold text-white">No candidate records found</p>
                <p className="text-xs text-slate-400">
                  {isGlobalSearchActive 
                    ? `No candidate matching "${searchQuery}" was found in any of the 151 Telangana engineering colleges.` 
                    : `Try searching across all colleges using "Search All Colleges" or resetting branch filters.`}
                </p>
                {!isGlobalSearchActive && searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleExecuteGlobalSearch()}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    Search "{searchQuery}" across all 151 Colleges
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {paginatedCandidates.map((c, idx) => (
                  <div 
                    key={`${c.hallTicket || ''}-${c.rank}-${idx}`} 
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-2 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate" title={c.name}>
                          {c.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">HT: {c.hallTicket}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTicket(c.hallTicket)}
                            title="Copy Hall Ticket"
                            className="text-slate-500 hover:text-emerald-400 transition-colors"
                          >
                            {copiedTicket === c.hallTicket ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono font-bold shrink-0">
                        #{c.rank?.toLocaleString()}
                      </span>
                    </div>

                    {/* If Global Search Result: Show College & Branch with Quick Switch Action */}
                    {isGlobalSearchActive && c.collegeCode && (
                      <div className="pt-1 pb-0.5 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[11px]">
                        <div className="truncate text-slate-300">
                          <span className="font-bold text-rose-300 font-mono mr-1">[{c.collegeCode}]</span>
                          <span className="font-mono text-cyan-300">{c.branchCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJumpToCollegeBranch(c.collegeCode, c.branchCode)}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <span>Open College</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-0.5 text-[10px] sm:text-[11px] flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded font-medium ${
                        c.gender === 'M' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        {c.gender === 'M' ? 'Boys (M)' : c.gender === 'F' ? 'Girls (F)' : c.gender}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                        {c.caste}
                      </span>
                      {c.region && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">
                          {c.region}
                        </span>
                      )}
                      <span className="ml-auto px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-semibold text-[10px]">
                        {c.seatCategory}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-2 pb-4">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200"
                >
                  Previous Page
                </button>
                <span className="text-xs text-slate-400 font-mono px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200"
                >
                  Next Page
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. ANALYTICS & DISTRIBUTION VISUALS (POSITIONED AT BOTTOM) */}
        {!loading && !isGlobalSearchActive && currentBundle && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            {/* Header toggle for bottom analytics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Allotment Analytics &amp; Category Cutoffs [{selectedCollegeCode} — {currentBundle.branchCode}]
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium"
              >
                <span>{isAnalyticsExpanded ? 'Hide Analytics' : 'Show Analytics'}</span>
                {isAnalyticsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isAnalyticsExpanded && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* KPI Overview Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-md">
                    <span className="text-[11px] text-slate-400 font-medium">Total Allotted Seats</span>
                    <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{analytics.totalAllotted}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Boys: {analytics.maleCount} | Girls: {analytics.femaleCount}
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-md">
                    <span className="text-[11px] text-slate-400 font-medium">Opening Cutoff Rank</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                      {analytics.openingRank > 0 ? `#${analytics.openingRank.toLocaleString()}` : '—'}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 mt-0.5">First Allotted Candidate</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-md">
                    <span className="text-[11px] text-slate-400 font-medium">Closing Cutoff Rank</span>
                    <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">
                      {analytics.closingRank > 0 ? `#${analytics.closingRank.toLocaleString()}` : '—'}
                    </div>
                    <div className="text-[10px] text-rose-400/80 mt-0.5">Last Allotted Candidate</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-md">
                    <span className="text-[11px] text-slate-400 font-medium">Stream / Total Branches</span>
                    <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{availableBranches.length}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Code: {currentBundle.branchCode}
                    </div>
                  </div>
                </div>

                {/* Category-Wise Opening & Closing Ranks Grid */}
                {categoryCutoffs.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 space-y-3 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800 pb-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Category-Wise Opening &amp; Closing Ranks (Best &amp; Last Rank per Quota)
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {categoryCutoffs.length} Quotas in {currentBundle.branchCode}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {categoryCutoffs.map((item) => {
                        const isSelected = seatCategoryFilter === item.category;
                        const colors = getQuotaColorClasses(item.category);
                        return (
                          <div
                            key={item.category}
                            onClick={() => {
                              setSeatCategoryFilter(isSelected ? 'ALL' : item.category);
                              window.scrollTo({ top: 150, behavior: 'smooth' });
                            }}
                            className={`cursor-pointer rounded-xl p-2.5 border transition-all ${
                              isSelected
                                ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${colors.lightBg} ${colors.text} border ${colors.border} truncate max-w-[150px]`}>
                                {item.category}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                                {item.count} {item.count === 1 ? 'seat' : 'seats'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                                <span className="text-[9px] text-slate-400 uppercase block">Best (Open)</span>
                                <span className="text-emerald-400 font-bold text-xs">
                                  #{item.openingRank.toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-slate-900 rounded p-1 border border-slate-800">
                                <span className="text-[9px] text-slate-400 uppercase block">Last (Close)</span>
                                <span className="text-rose-400 font-bold text-xs">
                                  #{item.closingRank.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Demographics & Quota Visual Flex-Bars */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {/* Gender Ratio */}
                  <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-2.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          Gender Ratio
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {analytics.totalAllotted} Students
                        </span>
                      </div>

                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 shadow-inner">
                        <div 
                          style={{ width: `${analytics.malePct}%` }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-l-full transition-all duration-500"
                          title={`Boys: ${analytics.maleCount} (${analytics.malePct}%)`}
                        />
                        <div 
                          style={{ width: `${analytics.femalePct}%` }}
                          className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-r-full transition-all duration-500"
                          title={`Girls: ${analytics.femaleCount} (${analytics.femalePct}%)`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/60">
                      <span className="text-cyan-400 font-mono">Boys: {analytics.maleCount} ({analytics.malePct}%)</span>
                      <span className="text-rose-400 font-mono">Girls: {analytics.femaleCount} ({analytics.femalePct}%)</span>
                    </div>
                  </div>

                  {/* Quota Breakdown */}
                  <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-2.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          Quota Groups
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {analytics.quotaDistribution.length} Families
                        </span>
                      </div>

                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
                        {analytics.quotaDistribution.map((item) => {
                          const colors = getQuotaColorClasses(item.name);
                          return (
                            <div
                              key={item.name}
                              style={{ width: `${item.pct}%` }}
                              className={`h-full ${colors.bg} rounded-xs`}
                              title={`${item.name}: ${item.count} (${item.pct}%)`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto text-[10px] font-mono pt-1 border-t border-slate-800/60">
                      {analytics.quotaDistribution.map((item) => (
                        <span key={item.name} className="px-1.5 py-0.5 bg-slate-950 rounded text-slate-300 border border-slate-800">
                          {item.name}: {item.count}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Caste / Community Spread (Render EVERY community dynamically) */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 flex flex-col">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <PieChart className="w-3.5 h-3.5 text-amber-400" />
                        Caste / Community Spread
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-semibold">
                        {analytics.casteDistribution.length} Communities
                      </span>
                    </div>

                    {/* Responsive Dual-Column / Scrollable Grid Container */}
                    <div className="max-h-56 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                      {analytics.casteDistribution.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-500">
                          No community data available
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {analytics.casteDistribution.map((c) => {
                            const colors = getCommunityColorClasses(c.caste);
                            return (
                              <div
                                key={c.caste}
                                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 rounded-lg p-2 space-y-1.5 transition-colors"
                              >
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${colors.badge}`}>
                                    {c.caste}
                                  </span>
                                  <span className="text-slate-300 text-[11px] font-semibold">
                                    {c.count}{' '}
                                    <span className="text-slate-400 font-normal">({c.pct}%)</span>
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800/90 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${c.pct}%` }}
                                    className={`h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-500 ease-out`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
