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
  Hash
} from 'lucide-react';
import { TG_EAPCET_COLLEGE_MANIFEST } from '../data/tgEapcetCollegeManifest';

// Featured top engineering colleges for quick access
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

    // Sort by opening rank ascending (best rank first)
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

      // Caste aggregation
      const caste = r.caste || 'OTHER';
      casteMap[caste] = (casteMap[caste] || 0) + 1;

      // Quota group aggregation (e.g. OC, BC_A, BC_B, SC, ST, EWS)
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
      .sort((a, b) => b.count - a.count);

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

  // Filtered Candidates List
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

    if (searchQuery.trim() !== '') {
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
  }, [currentBundle, searchQuery, genderFilter, casteFilter, seatCategoryFilter, sortOrder]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const handleCopyTicket = (ticket) => {
    if (!ticket) return;
    navigator.clipboard?.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  // Color mapping helper for quota badges/bars
  const getQuotaColorClasses = (quotaName) => {
    const q = quotaName.toUpperCase();
    if (q === 'OC') return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', lightBg: 'bg-emerald-500/10' };
    if (q.startsWith('BC-B') || q.startsWith('BC_B')) return { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', lightBg: 'bg-blue-500/10' };
    if (q.startsWith('BC-A') || q.startsWith('BC_A')) return { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30', lightBg: 'bg-cyan-500/10' };
    if (q.startsWith('BC-D') || q.startsWith('BC_D')) return { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/30', lightBg: 'bg-indigo-500/10' };
    if (q.startsWith('SC')) return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', lightBg: 'bg-amber-500/10' };
    if (q.startsWith('ST')) return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30', lightBg: 'bg-rose-500/10' };
    if (q.startsWith('EWS')) return { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', lightBg: 'bg-purple-500/10' };
    return { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/30', lightBg: 'bg-teal-500/10' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>🔥 AP & TG FINAL PHASE ALLOTMENTS NAME WISE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            TG EAPCET 2026 Allotment Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            తెలంగాణ ఇంజనీరింగ్ కాలేజీల వారీగా, బ్రాంచ్ వారీగా విద్యార్థుల అలాట్‌మెంట్ జాబితా & కట్-ఆఫ్ ర్యాంకులు (151+ కాలేజీలు, 71,600+ సీట్లు)
          </p>
        </div>

        {/* Interactive Searchable Selectors Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* 1. SEARCHABLE INSTITUTION DROPDOWN */}
            <div className="relative" ref={collegeDropdownRef}>
              <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Select Institution / కళాశాల
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {TG_EAPCET_COLLEGE_MANIFEST.length} Colleges Available
                </span>
              </label>

              {/* Dropdown trigger button */}
              <button
                type="button"
                id="college-dropdown-trigger"
                onClick={() => {
                  setIsCollegeDropdownOpen(!isCollegeDropdownOpen);
                  setIsBranchDropdownOpen(false);
                  setCollegeSearchTerm('');
                }}
                className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-all text-left shadow-inner"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold shrink-0">
                    {selectedCollegeCode}
                  </span>
                  <span className="truncate text-slate-100 font-medium text-xs sm:text-sm">
                    {currentCollegeMeta.collegeName}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isCollegeDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {/* Dropdown Menu Popover */}
              {isCollegeDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {/* Embedded Search Input */}
                  <div className="p-2.5 border-b border-slate-800 bg-slate-950/80">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        autoFocus
                        id="institution-search-input"
                        value={collegeSearchTerm}
                        onChange={(e) => setCollegeSearchTerm(e.target.value)}
                        placeholder="Type college name or code (e.g. CBIT, VNR, Vasavi)..."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      {collegeSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setCollegeSearchTerm('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-700">
                    {filteredColleges.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
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
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                              isSelected ? 'bg-emerald-500/15 text-emerald-300 font-semibold' : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
                                isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {c.collegeCode}
                              </span>
                              <span className="truncate">{c.collegeName}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
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

            {/* 2. SEARCHABLE BRANCH DROPDOWN */}
            <div className="relative" ref={branchDropdownRef}>
              <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  Select Branch / ఇంజనీరింగ్ బ్రాంచ్
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {availableBranches.length} Branches Available
                </span>
              </label>

              {/* Dropdown trigger button */}
              <button
                type="button"
                id="branch-dropdown-trigger"
                disabled={availableBranches.length === 0}
                onClick={() => {
                  setIsBranchDropdownOpen(!isBranchDropdownOpen);
                  setIsCollegeDropdownOpen(false);
                  setBranchSearchTerm('');
                }}
                className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition-all text-left shadow-inner disabled:opacity-50"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold shrink-0">
                    {selectedBranchCode || 'None'}
                  </span>
                  <span className="truncate text-slate-100 font-medium text-xs sm:text-sm">
                    {currentBundle ? (currentBundle.branchName || currentBundle.branchCode) : 'Select a branch'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isBranchDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>

              {/* Dropdown Menu Popover */}
              {isBranchDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {/* Embedded Search Input */}
                  <div className="p-2.5 border-b border-slate-800 bg-slate-950/80">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        autoFocus
                        id="branch-search-input"
                        value={branchSearchTerm}
                        onChange={(e) => setBranchSearchTerm(e.target.value)}
                        placeholder="Filter branch name or code (e.g. CSE, CSM, ECE)..."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      {branchSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setBranchSearchTerm('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-700">
                    {filteredBranches.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
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
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                              isSelected ? 'bg-indigo-500/15 text-indigo-300 font-semibold' : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
                                isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {b.code}
                              </span>
                              <span className="truncate">{b.name}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
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

          {/* Quick-Select Filter Chips for Featured Top Colleges */}
          <div className="pt-1 border-t border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Select Top Institutions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FEATURED_COLLEGES.slice(0, 10).map((c) => {
                const isCurrent = c.code === selectedCollegeCode;
                return (
                  <button
                    key={`quick-${c.code}`}
                    type="button"
                    onClick={() => {
                      setSelectedCollegeCode(c.code);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {c.code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                id="search-candidates"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Name, Hall Ticket, or Rank..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500 shadow-inner"
              />
            </div>

            {/* Gender Filter */}
            <div className="sm:col-span-2">
              <select
                id="gender-filter"
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-inner"
              >
                <option value="ALL">All Genders</option>
                <option value="M">Boys (M)</option>
                <option value="F">Girls (F)</option>
              </select>
            </div>

            {/* Caste Filter */}
            <div className="sm:col-span-2">
              <select
                id="caste-filter"
                value={casteFilter}
                onChange={(e) => {
                  setCasteFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-inner"
              >
                <option value="ALL">All Castes</option>
                {availableCastes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Seat Category Filter */}
            <div className="sm:col-span-3">
              <select
                id="quota-filter"
                value={seatCategoryFilter}
                onChange={(e) => {
                  setSeatCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-inner"
              >
                <option value="ALL">All Categories / Quotas</option>
                {availableSeatCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Graceful Error Notification */}
        {errorMessage && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-amber-200 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-amber-300">
                {errorMessage}
              </h4>
              <p className="text-xs text-amber-200/80">
                క్రింద ఉన్న ప్రముఖ కాలేజీలలో ఒకదానిని తక్షణమే వీక్షించడానికి క్లిక్ చేయండి:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['CBIT', 'VJEC', 'VASV', 'CVRH', 'VBIT'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCollegeCode(c)}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold"
                  >
                    {c} వీక్షించండి
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-emerald-400 font-mono text-sm animate-pulse">
              [{selectedCollegeCode}] అలాట్‌మెంట్ డేటాను లోడ్ చేస్తోంది...
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <span className="text-xs text-slate-400 font-medium">Total Allotted Seats</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.totalAllotted}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  M: {analytics.maleCount} ({analytics.malePct}%) | F: {analytics.femaleCount} ({analytics.femalePct}%)
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <span className="text-xs text-slate-400 font-medium">Opening Cutoff Rank</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {analytics.openingRank > 0 ? `#${analytics.openingRank.toLocaleString()}` : '—'}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-0.5">Best Overall Rank</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <span className="text-xs text-slate-400 font-medium">Closing Cutoff Rank</span>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  {analytics.closingRank > 0 ? `#${analytics.closingRank.toLocaleString()}` : '—'}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-0.5">Last Allotted Rank</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                <span className="text-xs text-slate-400 font-medium">College Branches</span>
                <div className="text-2xl font-black text-white mt-1">{availableBranches.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Stream: {currentBundle?.branchCode || 'None'}
                </div>
              </div>
            </div>

            {/* FEATURE 1: CATEGORY-WISE OPENING & CLOSING RANKS (Best & Last Rank per Quota) */}
            {categoryCutoffs.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Category-Wise Opening & Closing Ranks (Best & Last Rank per Quota)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentBundle?.branchCode} — {categoryCutoffs.length} Quota Categories found in real final allotments
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    Sorted by Best Opening Rank
                  </div>
                </div>

                {/* High-visibility Category Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {categoryCutoffs.map((item) => {
                    const isSelected = seatCategoryFilter === item.category;
                    const colors = getQuotaColorClasses(item.category);
                    return (
                      <div
                        key={item.category}
                        onClick={() => setSeatCategoryFilter(isSelected ? 'ALL' : item.category)}
                        className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${colors.lightBg} ${colors.text} border ${colors.border} truncate max-w-[170px]`}>
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {item.count} {item.count === 1 ? 'seat' : 'seats'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <div className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Best (Open)</span>
                            <span className="text-emerald-400 font-bold text-xs">
                              #{item.openingRank.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Last (Close)</span>
                            <span className="text-rose-400 font-bold text-xs">
                              #{item.closingRank.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-0.5">
                          <span>Gender: M:{item.maleCount} | F:{item.femaleCount}</span>
                          {isSelected && (
                            <span className="text-emerald-400 font-semibold">Active Filter ✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FEATURE 2: REAL-TIME ANALYTICS VISUAL BARS & DISTRIBUTION CHARTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Real-Time Allotment Distribution & Demographics ({currentBundle?.branchCode})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live calculated from all {analytics.totalAllotted} confirmed candidate records
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. GENDER RATIO BAR */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      Gender Ratio
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {analytics.totalAllotted} Students
                    </span>
                  </div>

                  {/* Dual-tone Progress Bar */}
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 shadow-inner">
                    <div 
                      style={{ width: `${analytics.malePct}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-l-full transition-all duration-700 relative group cursor-pointer"
                      title={`Boys: ${analytics.maleCount} (${analytics.malePct}%)`}
                    />
                    <div 
                      style={{ width: `${analytics.femalePct}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-r-full transition-all duration-700 relative group cursor-pointer"
                      title={`Girls: ${analytics.femaleCount} (${analytics.femalePct}%)`}
                    />
                  </div>

                  {/* Legend & Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Boys (M)</span>
                        <span className="font-bold text-white font-mono">{analytics.maleCount} ({analytics.malePct}%)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50"></span>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Girls (F)</span>
                        <span className="font-bold text-white font-mono">{analytics.femaleCount} ({analytics.femalePct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CATEGORY QUOTA PROPORTIONAL BREAKDOWN */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Quota Breakdown
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {analytics.quotaDistribution.length} Groups
                    </span>
                  </div>

                  {/* Multi-segment Proportional Flex Bar */}
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 shadow-inner gap-0.5">
                    {analytics.quotaDistribution.map((item) => {
                      const colors = getQuotaColorClasses(item.name);
                      return (
                        <div
                          key={item.name}
                          style={{ width: `${item.pct}%` }}
                          className={`h-full ${colors.bg} rounded-sm transition-all duration-700 cursor-pointer`}
                          title={`${item.name}: ${item.count} seats (${item.pct}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Top Quota Badges */}
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pt-1">
                    {analytics.quotaDistribution.map((item) => {
                      const colors = getQuotaColorClasses(item.name);
                      return (
                        <div
                          key={item.name}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1 font-mono"
                        >
                          <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
                          <span className="text-slate-300 font-medium">{item.name}:</span>
                          <span className={`${colors.text} font-bold`}>{item.count}</span>
                          <span className="text-slate-500 text-[10px]">({item.pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CASTE/COMMUNITY SPREAD */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-amber-400" />
                      Caste / Community Spread
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {analytics.casteDistribution.length} Castes
                    </span>
                  </div>

                  {/* Horizontal Bar Breakdown for Castes */}
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {analytics.casteDistribution.slice(0, 5).map((c) => (
                      <div key={c.caste} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-300">{c.caste}</span>
                          <span className="text-slate-400">{c.count} seats ({c.pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${c.pct}%` }}
                            className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Results Counter & Pagination Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Showing <span className="text-white font-bold">{filteredCandidates.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> – <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredCandidates.length)}</span> of <span className="text-white font-bold">{filteredCandidates.length}</span> candidates in {currentBundle?.branchCode}
                </span>
                {(genderFilter !== 'ALL' || casteFilter !== 'ALL' || seatCategoryFilter !== 'ALL' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setGenderFilter('ALL');
                      setCasteFilter('ALL');
                      setSeatCategoryFilter('ALL');
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="ml-2 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] hover:bg-rose-500/30 transition-colors"
                  >
                    Reset Filters ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Toggle */}
                <button
                  type="button"
                  id="sort-toggle-header"
                  onClick={() => setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium transition-colors text-xs"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{sortOrder === 'ASC' ? 'Rank: Low to High' : 'Rank: High to Low'}</span>
                </button>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[11px]">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Candidate List Cards */}
            {filteredCandidates.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-sm font-medium text-slate-300">No candidates match the selected filters or search query.</p>
                <p className="text-xs text-slate-400">Try adjusting the category quota, gender, or search keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paginatedCandidates.map((c) => (
                  <div 
                    key={`${c.hallTicket || ''}-${c.rank}`} 
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-sm font-bold text-white tracking-tight truncate">{c.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono">HT: {c.hallTicket}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTicket(c.hallTicket)}
                            title="Copy Hall Ticket"
                            className="text-slate-500 hover:text-emerald-400 transition-colors"
                          >
                            {copiedTicket === c.hallTicket ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono font-bold shrink-0">
                        #{c.rank?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] flex-wrap">
                      <span className={`px-2 py-0.5 rounded font-medium ${
                        c.gender === 'M' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        {c.gender === 'M' ? 'Boys (M)' : c.gender === 'F' ? 'Girls (F)' : c.gender}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {c.caste}
                      </span>
                      {c.region && (
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px]">
                          {c.region}
                        </span>
                      )}
                      <span className="ml-auto px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-semibold text-[11px]">
                        {c.seatCategory}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200"
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
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200"
                >
                  Next Page
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
