import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  Zap,
  BookOpen
} from 'lucide-react';
import { 
  TG_EAPCET_COLLEGE_MANIFEST, 
  TG_EAPCET_ALL_BRANCHES, 
  TG_EAPCET_GLOBAL_STATS 
} from '../data/tgEapcetCollegeManifest';
import TgOverallRankInsights from './TgOverallRankInsights';
import TgTopColleges from './TgTopColleges';
import { searchAllotmentsClientSide, preloadSearchIndex } from '../utils/allotmentClientSearch';

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

// Top branches for quick access in All Colleges mode
const TOP_POPULAR_BRANCHES = [
  { code: "CSE", name: "Computer Science & Engineering", count: "24,934" },
  { code: "CSM", name: "CSE (AI & Machine Learning)", count: "13,309" },
  { code: "ECE", name: "Electronics & Communication", count: "9,732" },
  { code: "CSD", name: "CSE (Data Science)", count: "6,600" },
  { code: "INF", name: "Information Technology", count: "3,211" },
  { code: "EEE", name: "Electrical & Electronics", count: "3,081" },
  { code: "CIV", name: "Civil Engineering", count: "2,540" },
  { code: "MEC", name: "Mechanical Engineering", count: "2,143" }
];

export default function TgAllotmentExplorer({ initialCollegeCode = 'ALL', initialBranchCode = 'ALL', initialTab = 'explorer' } = {}) {
  // Navigation & Dropdown Selection State
  // 'ALL' represents All Colleges / All Branches
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(initialCollegeCode || 'ALL');
  const [selectedBranchCode, setSelectedBranchCode] = useState(initialBranchCode || 'ALL');
  const [activeExplorerTab, setActiveExplorerTab] = useState(initialTab || 'explorer'); // 'explorer' | 'top-colleges' | 'insights'
  const [collegeData, setCollegeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync with incoming props if changed externally
  useEffect(() => {
    if (initialTab && initialTab !== activeExplorerTab) {
      setActiveExplorerTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialCollegeCode !== undefined && initialCollegeCode !== selectedCollegeCode) {
      setSelectedCollegeCode(initialCollegeCode);
    }
  }, [initialCollegeCode]);

  useEffect(() => {
    if (initialBranchCode !== undefined && initialBranchCode !== selectedBranchCode) {
      setSelectedBranchCode(initialBranchCode);
    }
  }, [initialBranchCode]);

  // Searchable dropdown open/search states
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');

  // Dropdown click-outside refs
  const collegeDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  // Active search query & secondary filters
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [casteFilter, setCasteFilter] = useState('ALL');
  const [seatCategoryFilter, setSeatCategoryFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [copiedTicket, setCopiedTicket] = useState(null);

  // Global / Server Search State
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [globalSearchStats, setGlobalSearchStats] = useState(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState(null);

  // Collapsible Analytics State (for specific college/branch views)
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

  // Fetch individual college allotment JSON when a specific college is chosen
  useEffect(() => {
    if (!selectedCollegeCode || selectedCollegeCode === 'ALL') {
      setCollegeData([]);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

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

        // If currently selected branch is not 'ALL' and not in this college, fallback to 'ALL' or first branch
        if (bundles.length > 0 && selectedBranchCode !== 'ALL') {
          const hasBranch = bundles.some((b) => b.branchCode === selectedBranchCode);
          if (!hasBranch) {
            setSelectedBranchCode('ALL');
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Notice loading college JSON:', err.message);
        setCollegeData([]);
        setErrorMessage(
          `College [${normalizedCode}] allotment data could not be loaded. Please select another college.`
        );
        setLoading(false);
      });
  }, [selectedCollegeCode]);

  // Selected college info from manifest or fallback
  const currentCollegeMeta = useMemo(() => {
    if (selectedCollegeCode === 'ALL') {
      return {
        collegeCode: 'ALL',
        collegeName: 'All Colleges (Statewide — 151 Colleges)',
        recordCount: TG_EAPCET_GLOBAL_STATS?.totalRecords || 71646,
        branchCount: TG_EAPCET_ALL_BRANCHES?.length || 37
      };
    }
    const found = TG_EAPCET_COLLEGE_MANIFEST.find(
      (c) => c.collegeCode.toUpperCase() === selectedCollegeCode.toUpperCase()
    );
    if (found) return found;
    const feat = FEATURED_COLLEGES.find((f) => f.code === selectedCollegeCode);
    return {
      collegeCode: selectedCollegeCode,
      collegeName: feat ? feat.name : selectedCollegeCode,
      recordCount: collegeData.reduce((acc, b) => acc + (b.records?.length || 0), 0),
      branchCount: collegeData.length
    };
  }, [selectedCollegeCode, collegeData]);

  // Filtered colleges list for searchable dropdown (includes "All Colleges" at top)
  const filteredColleges = useMemo(() => {
    const term = collegeSearchTerm.toLowerCase().trim();
    if (!term) return TG_EAPCET_COLLEGE_MANIFEST;
    return TG_EAPCET_COLLEGE_MANIFEST.filter(
      (c) =>
        c.collegeCode.toLowerCase().includes(term) ||
        c.collegeName.toLowerCase().includes(term)
    );
  }, [collegeSearchTerm]);

  // Available branches:
  // When selectedCollegeCode === 'ALL', shows all statewide branches
  // When specific college selected, shows branches in that college
  const availableBranches = useMemo(() => {
    if (selectedCollegeCode === 'ALL') {
      return [
        { 
          code: 'ALL', 
          name: 'All Branches (Statewide — 37 Branches)', 
          allottedCount: TG_EAPCET_GLOBAL_STATS?.totalRecords || 71646 
        },
        ...TG_EAPCET_ALL_BRANCHES.map((b) => ({
          code: b.branchCode,
          name: b.branchName,
          allottedCount: b.totalAllotted,
          openingRank: b.openingRank,
          closingRank: b.closingRank
        }))
      ];
    }

    const collegeTotal = collegeData.reduce((acc, b) => acc + (b.totalAllotted || b.records?.length || 0), 0);
    return [
      { 
        code: 'ALL', 
        name: 'All Branches (College-wide)', 
        allottedCount: collegeTotal 
      },
      ...collegeData.map((item) => ({
        code: item.branchCode || '',
        name: item.branchName || item.branchCode || '',
        allottedCount: item.totalAllotted || item.records?.length || 0,
        openingRank: item.openingRank || 0,
        closingRank: item.closingRank || 0
      }))
    ];
  }, [selectedCollegeCode, collegeData]);

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

  // Current selected branch bundle for local college view
  const currentBundle = useMemo(() => {
    if (selectedCollegeCode === 'ALL') return null;
    if (!collegeData.length) return null;

    if (selectedBranchCode === 'ALL') {
      const allRecords = collegeData.flatMap((b) =>
        (b.records || []).map((r) => ({
          ...r,
          collegeCode: r.collegeCode || selectedCollegeCode,
          collegeName: r.collegeName || currentCollegeMeta.collegeName,
          branchCode: r.branchCode || b.branchCode,
          branchName: r.branchName || b.branchName
        }))
      );
      return {
        branchCode: 'ALL',
        branchName: 'All Branches in College',
        totalAllotted: allRecords.length,
        openingRank: allRecords.length ? Math.min(...allRecords.map((r) => r.rank).filter(Boolean)) : 0,
        closingRank: allRecords.length ? Math.max(...allRecords.map((r) => r.rank).filter(Boolean)) : 0,
        records: allRecords
      };
    }

    const found = collegeData.find((item) => item.branchCode === selectedBranchCode);
    if (!found) return collegeData[0] || null;

    return {
      ...found,
      records: (found.records || []).map((r) => ({
        ...r,
        collegeCode: r.collegeCode || selectedCollegeCode,
        collegeName: r.collegeName || currentCollegeMeta.collegeName,
        branchCode: r.branchCode || found.branchCode,
        branchName: r.branchName || found.branchName
      }))
    };
  }, [collegeData, selectedCollegeCode, selectedBranchCode, currentCollegeMeta]);

  // Category-wise Opening & Closing Ranks (when viewing a specific branch)
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

  // Analytics & Distribution Metrics for local branch view
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

  // Unique castes & seat categories available in the current context
  const availableCastes = useMemo(() => {
    if (selectedCollegeCode === 'ALL') {
      return ['OC', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST', 'EWS'];
    }
    if (!currentBundle || !currentBundle.records) return [];
    const set = new Set();
    currentBundle.records.forEach((r) => {
      if (r.caste) set.add(r.caste);
    });
    return Array.from(set).sort();
  }, [selectedCollegeCode, currentBundle]);

  const availableSeatCategories = useMemo(() => {
    if (selectedCollegeCode === 'ALL') {
      return ['OC_GEN_UR', 'OC_GEN_OU', 'OC_GIRLS_UR', 'OC_GIRLS_OU', 'BC_A_GEN_OU', 'BC_B_GEN_OU', 'BC_D_GEN_OU', 'SC_GEN_OU', 'ST_GEN_OU', 'EWS_GEN_OU'];
    }
    return categoryCutoffs.map((c) => c.category);
  }, [selectedCollegeCode, categoryCutoffs]);

  // Filtered candidates in current local branch/college view
  const filteredLocalCandidates = useMemo(() => {
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
        (r.caste && r.caste.toLowerCase().includes(q)) ||
        (r.branchCode && r.branchCode.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => (sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank));
    return list;
  }, [currentBundle, searchQuery, genderFilter, casteFilter, seatCategoryFilter, sortOrder, isGlobalSearchActive]);

  // Preload static search index in background for instant fallback
  useEffect(() => {
    preloadSearchIndex().catch(() => {});
  }, []);

  // High-performance Global / Cross-College Search Handler with instant static fallback
  const executeGlobalSearch = useCallback(async (options = {}) => {
    const q = (options.q !== undefined ? options.q : searchQuery).trim();
    const college = options.college !== undefined ? options.college : selectedCollegeCode;
    const branch = options.branch !== undefined ? options.branch : selectedBranchCode;
    const gender = options.gender !== undefined ? options.gender : genderFilter;
    const caste = options.caste !== undefined ? options.caste : casteFilter;
    const category = options.category !== undefined ? options.category : seatCategoryFilter;
    const sort = sortOrder === 'ASC' ? 'rank_asc' : 'rank_desc';

    // If both are 'ALL' and search query is empty, do not run global search;
    // user is in the Statewide Explorer Hub mode.
    if (college === 'ALL' && branch === 'ALL' && !q) {
      setIsGlobalSearchActive(false);
      setGlobalSearchResults([]);
      setGlobalSearchStats(null);
      return;
    }

    setIsSearchingGlobal(true);
    setGlobalSearchError(null);
    setIsGlobalSearchActive(true);
    setAppliedSearchQuery(q);

    try {
      const params = new URLSearchParams({
        q,
        college,
        branch,
        gender,
        caste,
        category,
        sort,
        limit: '1000'
      });

      // Try backend endpoint with a 2500ms timeout
      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), 2500);

      let data;
      try {
        const res = await fetch(`/api/tg-allotment/search?${params.toString()}`, {
          signal: controller.signal
        });
        clearTimeout(timerId);
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // Fallback to client-side static engine
      }

      // If backend was not available or timed out, query the static index in-memory
      if (!data || !Array.isArray(data.results)) {
        data = await searchAllotmentsClientSide({
          q,
          college,
          branch,
          gender,
          caste,
          category,
          sort,
          limit: 1000
        });
      }

      setGlobalSearchResults(data.results || []);
      setGlobalSearchStats(data.stats || null);
      setCurrentPage(1);

      if (q && Array.isArray(data.results) && data.results.length > 0) {
        window.dispatchEvent(new CustomEvent('mos:tool-result-ready', {
          detail: { tool: 'tg-name-search', resultCount: data.results.length },
        }));
      }
    } catch (err) {
      console.warn('Cross-college search notice:', err);
      // Final attempt on client engine
      try {
        const fallbackData = await searchAllotmentsClientSide({
          q,
          college,
          branch,
          gender,
          caste,
          category,
          sort,
          limit: 1000
        });
        setGlobalSearchResults(fallbackData.results || []);
        setGlobalSearchStats(fallbackData.stats || null);
        setCurrentPage(1);
      } catch (fallbackErr) {
        setGlobalSearchError('Search is temporarily unavailable. Please try again.');
        setGlobalSearchResults([]);
      }
    } finally {
      setIsSearchingGlobal(false);
    }
  }, [searchQuery, selectedCollegeCode, selectedBranchCode, genderFilter, casteFilter, seatCategoryFilter, sortOrder]);

  // Trigger search when 'All Colleges' has a branch selected or filters changed
  useEffect(() => {
    if (selectedCollegeCode === 'ALL') {
      if (selectedBranchCode !== 'ALL' || searchQuery.trim().length > 0) {
        executeGlobalSearch();
      } else {
        setIsGlobalSearchActive(false);
        setGlobalSearchResults([]);
        setGlobalSearchStats(null);
      }
    }
  }, [selectedCollegeCode, selectedBranchCode]);

  const clearSearch = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    if (selectedCollegeCode === 'ALL' && selectedBranchCode === 'ALL') {
      setIsGlobalSearchActive(false);
      setGlobalSearchResults([]);
      setGlobalSearchStats(null);
    } else if (selectedCollegeCode === 'ALL') {
      executeGlobalSearch({ q: '' });
    } else {
      setIsGlobalSearchActive(false);
      setGlobalSearchResults([]);
    }
    setCurrentPage(1);
  };

  // Determine which candidate list to show
  const activeDisplayList = useMemo(() => {
    if (isGlobalSearchActive) {
      return globalSearchResults;
    }
    if (selectedCollegeCode !== 'ALL') {
      return filteredLocalCandidates;
    }
    return [];
  }, [isGlobalSearchActive, globalSearchResults, selectedCollegeCode, filteredLocalCandidates]);

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

  // Navigate directly into a specific college & branch view from any result card
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
    setAppliedSearchQuery('');
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

  // Match Type badge style generator
  const getMatchBadge = (matchType) => {
    if (!matchType) return null;
    if (matchType === 'Exact Rank Match' || matchType === 'Exact Match') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold tracking-wide flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          {matchType}
        </span>
      );
    }
    if (matchType === 'Partial Match') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold tracking-wide flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          {matchType}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold tracking-wide flex items-center gap-1">
        <Zap className="w-3 h-3 text-amber-400" />
        {matchType}
      </span>
    );
  };

  const isStatewideOverviewActive = selectedCollegeCode === 'ALL' && selectedBranchCode === 'ALL' && !isGlobalSearchActive;

  return (
    <div className="mos-tg-explorer min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* 1. BRANDING & TITLE */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold tracking-wide shadow-sm">
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

        {/* Primary View Switcher */}
        <div className="flex justify-center pt-1">
          <div className="inline-flex flex-wrap justify-center p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl gap-1">
            <button
              type="button"
              id="tab-allotment-explorer"
              onClick={() => setActiveExplorerTab('explorer')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeExplorerTab === 'explorer'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>College &amp; Candidate Explorer</span>
            </button>
            
            <button
              type="button"
              id="tab-top-colleges"
              onClick={() => setActiveExplorerTab('top-colleges')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeExplorerTab === 'top-colleges'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Top B.Tech Colleges</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-500/40">
                OC Ranks
              </span>
            </button>

            <button
              type="button"
              id="tab-overall-rank-insights"
              onClick={() => setActiveExplorerTab('insights')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeExplorerTab === 'insights'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overall Rank Insights</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                NEW
              </span>
            </button>
          </div>
        </div>

        {activeExplorerTab === 'top-colleges' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TgTopColleges onSelectCollegeBranch={handleJumpToCollegeBranch} />
          </div>
        ) : activeExplorerTab === 'insights' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TgOverallRankInsights />
          </div>
        ) : (
          <>
        {/* 2. TOP SELECTORS (COLLEGE & BRANCH) + GLOBAL SEARCH BAR */}
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
                className={`w-full flex items-center justify-between bg-slate-950 border text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-all text-left shadow-inner ${
                  selectedCollegeCode === 'ALL'
                    ? 'border-rose-500/50 hover:border-rose-400'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={`px-1.5 py-0.5 rounded font-mono text-xs font-bold shrink-0 ${
                    selectedCollegeCode === 'ALL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
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
                        placeholder="Search college code or name (e.g. CBIT, VNRV)..."
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

                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40 text-xs">
                    {/* ALL COLLEGES OPTION (ALWAYS PINNED OR FIRST) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCollegeCode('ALL');
                        setIsCollegeDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        selectedCollegeCode === 'ALL' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          ALL
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-rose-200 block truncate">All Colleges (Statewide — 151 Colleges)</span>
                          <span className="text-[10px] text-slate-400 block truncate">Search or browse across all colleges in Telangana</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-rose-400 font-mono shrink-0 ml-1">
                        71,646 seats
                      </span>
                    </button>

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
                  {availableBranches.length} Options
                </span>
              </label>

              <button
                type="button"
                id="branch-dropdown-trigger"
                onClick={() => {
                  setIsBranchDropdownOpen(!isBranchDropdownOpen);
                  setIsCollegeDropdownOpen(false);
                  setBranchSearchTerm('');
                }}
                className={`w-full flex items-center justify-between bg-slate-950 border text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-all text-left shadow-inner ${
                  selectedBranchCode === 'ALL'
                    ? 'border-indigo-500/50 hover:border-indigo-400'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold shrink-0">
                    {selectedBranchCode || 'ALL'}
                  </span>
                  <span className="truncate text-slate-100 font-medium">
                    {selectedBranchCode === 'ALL'
                      ? (selectedCollegeCode === 'ALL' ? 'All Branches (Statewide)' : 'All Branches (College-wide)')
                      : (currentBundle?.branchName || selectedBranchCode)}
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

                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40 text-xs">
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
                              {b.allottedCount ? `${b.allottedCount.toLocaleString()} seats` : ''}
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

          {/* 3. SEARCH BAR WITH DUAL MODES: GLOBAL & LOCAL */}
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
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeGlobalSearch();
                    }
                  }}
                  placeholder="Search candidate name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500 placeholder-slate-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-global-search"
                  onClick={() => executeGlobalSearch()}
                  disabled={isSearchingGlobal || (!searchQuery.trim() && selectedCollegeCode !== 'ALL')}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                    isGlobalSearchActive
                      ? 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                  } disabled:opacity-40`}
                  title="Search across all 151 Telangana engineering colleges"
                >
                  {isSearchingGlobal ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Globe2 className="w-3.5 h-3.5" />
                  )}
                  <span>{selectedCollegeCode === 'ALL' ? 'Search All Colleges' : 'Global Search'}</span>
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

            {/* Quick Filter Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                  if (isGlobalSearchActive || selectedCollegeCode === 'ALL') {
                    executeGlobalSearch({ gender: e.target.value });
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Genders</option>
                <option value="M">Boys (M)</option>
                <option value="F">Girls (F)</option>
              </select>

              {/* Caste Filter */}
              <select
                value={casteFilter}
                onChange={(e) => {
                  setCasteFilter(e.target.value);
                  setCurrentPage(1);
                  if (isGlobalSearchActive || selectedCollegeCode === 'ALL') {
                    executeGlobalSearch({ caste: e.target.value });
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Castes</option>
                {availableCastes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Seat Category / Quota Filter */}
              <select
                value={seatCategoryFilter}
                onChange={(e) => {
                  setSeatCategoryFilter(e.target.value);
                  setCurrentPage(1);
                  if (isGlobalSearchActive || selectedCollegeCode === 'ALL') {
                    executeGlobalSearch({ category: e.target.value });
                  }
                }}
                className="col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Seat Categories / Quotas</option>
                {availableSeatCategories.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Global Search Banner / Summary Header */}
        {isGlobalSearchActive && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Globe2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold text-white text-xs sm:text-sm">
                  Global Search Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-mono font-bold">
                  {globalSearchResults.length.toLocaleString()} matches
                </span>
                {appliedSearchQuery && (
                  <span className="text-slate-300 text-xs">
                    for "<span className="text-white font-semibold">{appliedSearchQuery}</span>"
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
                <span>Scope: <strong className="text-slate-200">{selectedCollegeCode === 'ALL' ? 'All 151 Colleges' : selectedCollegeCode}</strong></span>
                <span>•</span>
                <span>Branch: <strong className="text-slate-200">{selectedBranchCode === 'ALL' ? 'All Branches' : selectedBranchCode}</strong></span>
                {globalSearchStats && (
                  <>
                    <span>•</span>
                    <span>Colleges with matches: <strong className="text-emerald-400">{globalSearchStats.collegesCount}</strong></span>
                    <span>•</span>
                    <span>Rank Range: <strong className="text-emerald-400">#{globalSearchStats.minRank?.toLocaleString()} → #{globalSearchStats.maxRank?.toLocaleString()}</strong></span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={clearSearch}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold shrink-0 cursor-pointer border border-rose-500/40"
            >
              Reset Search ✕
            </button>
          </div>
        )}

        {/* Global Search Notice / Error */}
        {globalSearchError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{globalSearchError}</span>
          </div>
        )}

        {/* Error Notification for college file download */}
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
                    }}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    View {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CASE A: STATEWIDE OVERVIEW HUB
            (When College = 'ALL' & Branch = 'ALL' & No search entered yet)
           ======================================================== */}
        {isStatewideOverviewActive && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Statewide Key Numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-md">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Engineering Colleges
                </span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {TG_EAPCET_GLOBAL_STATS?.totalColleges || 151} Colleges
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Across Telangana State</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-md">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Total Allotted Students
                </span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {TG_EAPCET_GLOBAL_STATS?.totalRecords ? TG_EAPCET_GLOBAL_STATS.totalRecords.toLocaleString() : '71,646'}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">Final Phase Official Records</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-md">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  Engineering Branches
                </span>
                <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">
                  {TG_EAPCET_ALL_BRANCHES?.length || 37} Streams
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">CSE, CSM, ECE, CSD, etc.</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-md">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  State Rank Range
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  #1 → #400,379
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">All Categories Combined</div>
              </div>
            </div>

            {/* Quick Search Demonstration Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border border-rose-500/20 rounded-2xl p-4 sm:p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Statewide Candidate Search Engine
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                You can instantly search any student among all <strong>71,646 candidate allotments</strong> across all 151 Telangana engineering colleges without picking a single college or branch first.
              </p>

              {/* Sample Queries Chips */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-medium block mb-2">
                  Try one of these sample queries or enter any Rank / Name in the search bar above:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Rank 42500', query: '42500' },
                    { label: 'BHUKYA JAGAN', query: 'BHUKYA JAGAN' },
                    { label: 'RAMINENI JAGAN MOHAN', query: 'RAMINENI JAGAN MOHAN' },
                    { label: 'Rank 2887', query: '2887' },
                    { label: 'Hall Ticket 2625T07028', query: '2625T07028' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(chip.query);
                        executeGlobalSearch({ q: chip.query });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                    >
                      <Search className="w-3 h-3 text-rose-400" />
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Engineering Streams Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  Explore Top Engineering Streams Across Telangana
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Click any branch to view candidates statewide
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {TOP_POPULAR_BRANCHES.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => {
                      setSelectedCollegeCode('ALL');
                      setSelectedBranchCode(b.code);
                      executeGlobalSearch({ college: 'ALL', branch: b.code });
                    }}
                    className="text-left bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 space-y-1 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-300 text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 group-hover:bg-indigo-500/30">
                        {b.code}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {b.count} seats
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate" title={b.name}>
                      {b.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Engineering Colleges Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Popular Engineering Colleges
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Quick Access
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {FEATURED_COLLEGES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCollegeCode(c.code);
                      setSelectedBranchCode('ALL');
                      setIsGlobalSearchActive(false);
                      setGlobalSearchResults([]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-emerald-400 font-bold">{c.code}</span>
                    <span className="text-slate-400 max-w-[140px] truncate hidden sm:inline">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TG EAPCET 2026 — Statewide Overall Rank Insights */}
            <TgOverallRankInsights />
          </div>
        )}

        {/* ========================================================
            CASE B: CANDIDATE RESULTS GRID
            (When Global Search is active OR Specific College is chosen)
           ======================================================== */}
        {!isStatewideOverviewActive && (
          <>
            {loading || isSearchingGlobal ? (
              <div className="py-20 text-center space-y-3">
                <div className="inline-block w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-rose-400 font-mono text-xs sm:text-sm animate-pulse">
                  {isSearchingGlobal 
                    ? 'Scanning 71,646 candidate records across all 151 colleges...' 
                    : `Loading allotment records for [${selectedCollegeCode}]...`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header & Pagination status */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>
                      Showing <span className="text-white font-bold">{activeDisplayList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> – <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, activeDisplayList.length)}</span> of <span className="text-white font-bold">{activeDisplayList.length.toLocaleString()}</span> students {isGlobalSearchActive ? '(All Colleges / Global Search)' : `in [${selectedCollegeCode} - ${selectedBranchCode}]`}
                    </span>
                    {(genderFilter !== 'ALL' || casteFilter !== 'ALL' || seatCategoryFilter !== 'ALL' || searchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setGenderFilter('ALL');
                          setCasteFilter('ALL');
                          setSeatCategoryFilter('ALL');
                          clearSearch();
                        }}
                        className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] cursor-pointer"
                      >
                        Clear Filters ✕
                      </button>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
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
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer"
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
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {isGlobalSearchActive 
                        ? `No candidate matching "${searchQuery || appliedSearchQuery}" was found with the current filters across the 151 Telangana engineering colleges.` 
                        : `No candidate matching your filters was found in [${selectedCollegeCode} - ${selectedBranchCode}]. Try searching across all colleges.`}
                    </p>
                    {!isGlobalSearchActive && searchQuery && (
                      <button
                        type="button"
                        onClick={() => executeGlobalSearch()}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
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
                        key={`${c.hallTicket || ''}-${c.rank}-${c.collegeCode || ''}-${idx}`} 
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-2 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-sm"
                      >
                        {/* Header: Candidate Name & Rank */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate" title={c.name}>
                                {c.name}
                              </h4>
                              {c.matchType && getMatchBadge(c.matchType)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-mono">HT: {c.hallTicket}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyTicket(c.hallTicket)}
                                title="Copy Hall Ticket"
                                className="text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
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

                        {/* College & Branch Meta Strip (Always clear & unambiguous) */}
                        <div className="pt-1 pb-1 border-t border-slate-800/70 flex items-center justify-between gap-1 text-[11px]">
                          <div className="truncate text-slate-300">
                            <span className="font-bold text-rose-300 font-mono mr-1">[{c.collegeCode}]</span>
                            <span className="text-slate-200 font-medium truncate mr-1.5">
                              {c.collegeName || c.collegeCode}
                            </span>
                            <span className="font-mono text-indigo-300 font-semibold">({c.branchCode})</span>
                          </div>

                          {/* Quick Jump into this specific college & branch */}
                          {(isGlobalSearchActive || selectedCollegeCode === 'ALL') && (
                            <button
                              type="button"
                              onClick={() => handleJumpToCollegeBranch(c.collegeCode, c.branchCode)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                              title={`Open full ${c.collegeCode} allotment list`}
                            >
                              <span>Explore</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Demographics & Seat Quota Details */}
                        <div className="flex items-center gap-1.5 pt-0.5 text-[10px] sm:text-[11px] flex-wrap">
                          <span className={`px-1.5 py-0.2 rounded font-medium ${
                            c.gender === 'M' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-rose-500/15 text-rose-300'
                          }`}>
                            {c.gender === 'M' ? 'Boys (M)' : c.gender === 'F' ? 'Girls (F)' : c.gender}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                            {c.caste || 'GEN'}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-2 pb-4">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200 cursor-pointer"
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
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200 cursor-pointer"
                    >
                      Next Page
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================================
            CASE C: ANALYTICS & CUTOFFS FOR SPECIFIC COLLEGE VIEW
           ======================================================== */}
        {!loading && !isGlobalSearchActive && selectedCollegeCode !== 'ALL' && currentBundle && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
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
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
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
                    <span className="text-[11px] text-slate-400 font-medium">Total Branches in College</span>
                    <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{availableBranches.length - 1}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Current: {currentBundle.branchCode}
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

                  {/* Caste / Community Spread */}
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

        {/* Statewide Overall Rank Insights when exploring specific colleges / branches / search */}
        {!isStatewideOverviewActive && (
          <div className="pt-4 border-t border-slate-800/80">
            <TgOverallRankInsights />
          </div>
        )}
      </>
    )}

      </div>
      <div className="mt-6 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-3.5 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
        <strong className="text-cyan-600 dark:text-cyan-300">MOS data notice:</strong> This tool presents historical allotment records and derived statistics from the available 2026 source dataset. Figures are for educational context only, are not official cutoffs or admission guarantees, and should be checked against the current counselling authority's notices.
      </div>
    </div>
  );
}
