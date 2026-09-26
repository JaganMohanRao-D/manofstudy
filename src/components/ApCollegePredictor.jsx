import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Compass,
  Search,
  Building2,
  GitBranch,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  X,
  ExternalLink,
  Users,
  Download,
  ShieldCheck,
  BarChart3,
  Flame,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Copy,
  Check,
  Globe2,
  Loader2,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { AP_EAPCET_COLLEGES, AP_EAPCET_GLOBAL_STATS } from '../data/apEapcetCollegeManifest';

// AP Social & Reservation Categories
export const AP_CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'OC', label: 'OC (Open Competition)' },
  { id: 'EWS', label: 'EWS (Economically Weaker Section)' },
  { id: 'BC_A', label: 'BC-A (Backward Class Group A)' },
  { id: 'BC_B', label: 'BC-B (Backward Class Group B)' },
  { id: 'BC_C', label: 'BC-C (Backward Class Group C)' },
  { id: 'BC_D', label: 'BC-D (Backward Class Group D)' },
  { id: 'BC_E', label: 'BC-E (Backward Class Group E)' },
  { id: 'SC', label: 'SC (Scheduled Caste)' },
  { id: 'ST', label: 'ST (Scheduled Tribe)' },
];

export const AP_REGIONS = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AU', label: 'AU Region (Andhra University)' },
  { id: 'SVU', label: 'SVU Region (Sri Venkateswara University)' },
  { id: 'NL', label: 'Non-Local / Statewide (NL)' },
];

export const POPULAR_BRANCHES = [
  { code: 'ALL', label: 'All Branches' },
  { code: 'CSE', label: 'CSE' },
  { code: 'CSM', label: 'CSM (AI & ML)' },
  { code: 'CSD', label: 'CSD (Data Science)' },
  { code: 'CSC', label: 'CSC (Cyber Security)' },
  { code: 'AID', label: 'AID (AI & DS)' },
  { code: 'INF', label: 'INF (Information Tech)' },
  { code: 'ECE', label: 'ECE' },
  { code: 'EEE', label: 'EEE' },
  { code: 'MEC', label: 'Mechanical' },
  { code: 'CIV', label: 'Civil' },
];

// Top featured colleges in Andhra Pradesh for quick reference
export const FEATURED_AP_COLLEGES = [
  { code: 'AUCE', name: 'A U COLLEGE OF ENGG. VISAKHAPATNAM' },
  { code: 'VRSE', name: 'VELAGAPUDI RAMAKRISHNA SIDDHARTHA ENGG COLLEGE' },
  { code: 'GVPV', name: 'G V P COLLEGE OF ENGINEERING' },
  { code: 'JNTK', name: 'JNTUK COLLEGE OF ENGINEERING KAKINADA' },
  { code: 'SVCE', name: 'S V U COLLEGE OF ENGG. TIRUPATHI' },
  { code: 'PPSV', name: 'PRASAD V POTLURI SIDDHARTHA INST OF TECHNOLOGY' },
  { code: 'RVRJ', name: 'R V R AND J C COLLEGE OF ENGINEERING' },
  { code: 'MVGR', name: 'MAHARAJ VIJAYARAM GAJAPATHI RAJ COLLEGE OF ENGG' },
  { code: 'ANIL', name: 'ANIL NEERUKONDA INSTITUTE OF TECHNOLOGY AND SCI' },
  { code: 'VVIT', name: 'VASIREDDY VENKATADRI INST. OF TECHNOLOGY' },
  { code: 'GMRV', name: 'G M R INSTITUTE OF TECHNOLOGY' },
  { code: 'SRKR', name: 'S R K R ENGINEERING COLLEGE' },
];

// Module-level in-memory cache to guarantee 0ms repeat requests
const globalDataCache = new Map();
let globalAllCollegesPromise = null;

// Safe, zero-crash normalization function
function normalizeCandidateItem(
  item,
  fallbackCollegeCode = '',
  fallbackCollegeName = '',
  fallbackBranchCode = '',
  fallbackBranchName = ''
) {
  if (!item) return null;

  // Rank normalization
  const rawRank = item.rank;
  const numRank = parseFloat(String(rawRank ?? '').replace(/,/g, ''));
  const rank = !isNaN(numRank) && isFinite(numRank) ? Math.round(numRank) : 0;

  // Candidate Name normalization
  const name = String(item.cand_name || item.candidateName || item.name || 'Candidate').trim();

  // Gender normalization
  const rawGender = String(item.gender || '').trim().toUpperCase();
  const gender = rawGender.startsWith('M') ? 'M' : rawGender.startsWith('F') ? 'F' : rawGender || '—';

  // Category normalization
  const category = String(item.category || 'OC').trim();

  // Region normalization
  const rawRegion = String(item.region || 'AU').trim().toUpperCase();
  const region = rawRegion.includes('AU') ? 'AU' : rawRegion.includes('SVU') ? 'SVU' : rawRegion || 'NL';

  // Allotted Category normalization
  const allottedCategory = String(
    item.allotted_cat ||
      item.allottedCategory ||
      item.alloted_category ||
      item.allotted_category ||
      item.seatCategory ||
      '—'
  ).trim();

  // Branch normalization
  const branch = String(item.branch_code || item.branch || fallbackBranchCode || 'ENGG').trim();
  const branchName = String(item.branch_name || fallbackBranchName || branch).trim();

  // College normalization
  const collegeCode = String(item.college_code || item.collegeCode || fallbackCollegeCode).trim();
  const collegeName = String(item.college_name || item.collegeName || fallbackCollegeName || collegeCode).trim();

  // Hall Ticket normalization
  const hallTicket = String(
    item.hall_ticket || item.hallTicket || item.htno || item.hall_ticket_number || ''
  ).trim();

  const phase = item.phase ? Number(item.phase) : 1;

  return {
    rank,
    name,
    gender,
    category,
    region,
    allottedCategory,
    branch,
    branchName,
    collegeCode,
    collegeName,
    hallTicket,
    phase,
  };
}

export default function ApCollegePredictor({
  initialCollegeCode = 'ALL',
  initialBranchCode = 'ALL',
  initialTab = 'intelligence',
  onNavigateToTab,
}) {
  // Primary Navigation Tab: 'intelligence' (Allotments & Cutoffs) vs 'predictor' (Rank Predictor)
  const [activeTab, setActiveTab] = useState(initialTab);

  // College Selection: 'ALL' represents "All Colleges (Entire AP)"
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(initialCollegeCode || 'ALL');
  const [selectedBranchCode, setSelectedBranchCode] = useState(initialBranchCode || 'ALL');

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC'); // 'ASC' | 'DESC'
  const [sortField, setSortField] = useState('rank'); // 'rank' | 'name'

  // Pagination (Strict 25 records per page requirement)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // UI Dropdowns & Collapsibles
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);
  const [copiedTicket, setCopiedTicket] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // In-Memory React State Cache for Loaded Datasets
  const [cachedColleges, setCachedColleges] = useState({});
  const [allCollegesDataset, setAllCollegesDataset] = useState(null);

  const collegeDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  // Predictor Engine States
  const [userRank, setUserRank] = useState('14500');
  const [userCategory, setUserCategory] = useState('OC');
  const [userGender, setUserGender] = useState('M');
  const [userRegion, setUserRegion] = useState('AU');
  const [predictorBranchFilter, setPredictorBranchFilter] = useState('ALL');
  const [predictorChanceFilter, setPredictorChanceFilter] = useState('ALL');
  const [predictorSearchTerm, setPredictorSearchTerm] = useState('');

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

  // Sync prop changes
  useEffect(() => {
    if (initialCollegeCode && initialCollegeCode !== selectedCollegeCode) {
      setSelectedCollegeCode(initialCollegeCode);
    }
  }, [initialCollegeCode]);

  useEffect(() => {
    if (initialBranchCode && initialBranchCode !== selectedBranchCode) {
      setSelectedBranchCode(initialBranchCode);
    }
  }, [initialBranchCode]);

  // Debounce search query (220ms) for ultra-fast, smooth typing without lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pre-load Search Index for "All Colleges" Mode
  const loadAllCollegesData = useCallback(async () => {
    if (allCollegesDataset) return allCollegesDataset;
    if (globalDataCache.has('ALL_COLLEGES')) {
      const data = globalDataCache.get('ALL_COLLEGES');
      setAllCollegesDataset(data);
      return data;
    }

    if (globalAllCollegesPromise) {
      return globalAllCollegesPromise;
    }

    globalAllCollegesPromise = (async () => {
      try {
        const res = await fetch('/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/search_index.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const rawCandidates = json.candidates || [];
        const branchMap = json.branchMap || {};

        // College metadata lookup
        const collegeNameMap = {};
        AP_EAPCET_COLLEGES.forEach((c) => {
          collegeNameMap[c.collegeCode.toUpperCase()] = c.collegeName;
        });

        // Normalize all records safely: [rank, cand_name, gender, category, region, alloted_category, phase, college_code, branch_code]
        const normalized = rawCandidates.map((raw) => {
          const numRank = parseFloat(String(raw[0] ?? '').replace(/,/g, ''));
          const rank = !isNaN(numRank) && isFinite(numRank) ? Math.round(numRank) : 0;
          const name = String(raw[1] || 'Candidate').trim();
          const gender = String(raw[2] || '—').trim().toUpperCase();
          const category = String(raw[3] || 'OC').trim();
          const region = String(raw[4] || 'AU').trim().toUpperCase();
          const allottedCategory = String(raw[5] || '—').trim();
          const phase = raw[6] ? Number(raw[6]) : 1;
          const collegeCode = String(raw[7] || '').trim();
          const branchCode = String(raw[8] || '').trim();

          return {
            rank,
            name,
            gender,
            category,
            region,
            allottedCategory,
            branch: branchCode,
            branchName: branchMap[branchCode] || branchCode,
            collegeCode,
            collegeName: collegeNameMap[collegeCode.toUpperCase()] || collegeCode,
            hallTicket: '',
            phase,
          };
        });

        globalDataCache.set('ALL_COLLEGES', normalized);
        setAllCollegesDataset(normalized);
        return normalized;
      } catch (err) {
        console.warn('Could not load all-colleges search index:', err);
        return [];
      } finally {
        globalAllCollegesPromise = null;
      }
    })();

    return globalAllCollegesPromise;
  }, [allCollegesDataset]);

  // Load individual college JSON when a specific college code is selected
  const loadSingleCollege = useCallback(
    async (code) => {
      const targetCode = (code || '').toUpperCase().trim();
      if (!targetCode || targetCode === 'ALL') return;

      // Check React state cache first (0ms)
      if (cachedColleges[targetCode]) {
        setErrorMessage(null);
        setLoading(false);
        return;
      }

      // Check module level cache (0ms)
      if (globalDataCache.has(targetCode)) {
        const data = globalDataCache.get(targetCode);
        setCachedColleges((prev) => ({ ...prev, [targetCode]: data }));
        setErrorMessage(null);
        setLoading(false);
        return;
      }

      const collegeMeta = AP_EAPCET_COLLEGES.find(
        (c) => c.collegeCode.toUpperCase() === targetCode
      );

      if (!collegeMeta || !collegeMeta.hasData) {
        setErrorMessage(
          `College [${targetCode}] allotment data is compiling or unavailable for this counseling phase. Please choose another institution.`
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      const fileName = collegeMeta.file || `${targetCode}.json`;
      try {
        const response = await fetch(`/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/${fileName}`);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }
        const rawJson = await response.json();

        const collegeCode = rawJson.college_code || rawJson.collegeCode || targetCode;
        const collegeName = rawJson.college_name || rawJson.collegeName || collegeMeta.collegeName;
        const rawBranches = rawJson.branches || (Array.isArray(rawJson) ? rawJson : []);

        const normalizedRecords = [];
        const normalizedBranches = [];

        rawBranches.forEach((b) => {
          const bCode = b.branch_code || b.branchCode || b.branch || '';
          const bName = b.branch_name || b.branchName || bCode;
          const bRecords = b.records || [];

          const safeBranchRecords = [];
          bRecords.forEach((r) => {
            const norm = normalizeCandidateItem(r, collegeCode, collegeName, bCode, bName);
            if (norm && norm.rank > 0) {
              safeBranchRecords.push(norm);
              normalizedRecords.push(norm);
            }
          });

          normalizedBranches.push({
            branchCode: bCode,
            branchName: bName,
            records: safeBranchRecords,
            totalAllotted: safeBranchRecords.length,
          });
        });

        const packageData = {
          collegeCode,
          collegeName,
          branches: normalizedBranches,
          allRecords: normalizedRecords,
        };

        globalDataCache.set(targetCode, packageData);
        setCachedColleges((prev) => ({ ...prev, [targetCode]: packageData }));
        setErrorMessage(null);
      } catch (err) {
        console.warn(`Error loading ${targetCode}:`, err);
        setErrorMessage(
          `College data compiling or unavailable for this counseling phase. Detailed allotment JSON will be refreshed shortly.`
        );
      } finally {
        setLoading(false);
      }
    },
    [cachedColleges]
  );

  // Trigger data load on college selection
  useEffect(() => {
    setCurrentPage(1);
    if (selectedCollegeCode === 'ALL') {
      setLoading(true);
      loadAllCollegesData().finally(() => setLoading(false));
    } else {
      loadSingleCollege(selectedCollegeCode);
    }
  }, [selectedCollegeCode, loadAllCollegesData, loadSingleCollege]);

  // College metadata helper
  const currentCollegeMeta = useMemo(() => {
    if (selectedCollegeCode === 'ALL') {
      return {
        collegeCode: 'ALL',
        collegeName: 'All Colleges (Entire AP — 70 Colleges, 37,600+ Seats)',
        recordCount: AP_EAPCET_GLOBAL_STATS.totalRecords || 37637,
        branchCount: 35,
      };
    }
    const found = AP_EAPCET_COLLEGES.find(
      (c) => c.collegeCode.toUpperCase() === selectedCollegeCode.toUpperCase()
    );
    if (found) return found;

    return {
      collegeCode: selectedCollegeCode,
      collegeName: selectedCollegeCode,
      recordCount: cachedColleges[selectedCollegeCode]?.allRecords?.length || 0,
      branchCount: cachedColleges[selectedCollegeCode]?.branches?.length || 0,
    };
  }, [selectedCollegeCode, cachedColleges]);

  // Filtered colleges list for searchable dropdown
  const filteredColleges = useMemo(() => {
    const term = collegeSearchTerm.toLowerCase().trim();
    if (!term) return AP_EAPCET_COLLEGES.filter((c) => c.hasData);
    return AP_EAPCET_COLLEGES.filter(
      (c) =>
        c.hasData &&
        (c.collegeCode.toLowerCase().includes(term) ||
          c.collegeName.toLowerCase().includes(term))
    );
  }, [collegeSearchTerm]);

  // Available branches list based on context
  const availableBranches = useMemo(() => {
    if (selectedCollegeCode === 'ALL') {
      return [
        { code: 'ALL', name: 'All Branches (Statewide)' },
        ...POPULAR_BRANCHES.filter((b) => b.code !== 'ALL').map((b) => ({
          code: b.code,
          name: b.label,
        })),
      ];
    }

    const currentCollege = cachedColleges[selectedCollegeCode];
    if (!currentCollege || !currentCollege.branches) {
      return [{ code: 'ALL', name: 'All Branches in College' }];
    }

    return [
      { code: 'ALL', name: 'All Branches in College' },
      ...currentCollege.branches.map((b) => ({
        code: b.branchCode,
        name: b.branchName,
        totalAllotted: b.totalAllotted,
      })),
    ];
  }, [selectedCollegeCode, cachedColleges]);

  // Filtered branches for dropdown search
  const filteredBranchOptions = useMemo(() => {
    const term = branchSearchTerm.toLowerCase().trim();
    if (!term) return availableBranches;
    return availableBranches.filter(
      (b) =>
        b.code.toLowerCase().includes(term) ||
        (b.name && b.name.toLowerCase().includes(term))
    );
  }, [availableBranches, branchSearchTerm]);

  // Active records pool before search/filters
  const rawRecordsPool = useMemo(() => {
    if (selectedCollegeCode === 'ALL') {
      return allCollegesDataset || [];
    }
    const college = cachedColleges[selectedCollegeCode];
    if (!college) return [];

    if (selectedBranchCode === 'ALL') {
      return college.allRecords || [];
    }

    const branch = college.branches?.find((b) => b.branchCode === selectedBranchCode);
    return branch ? branch.records || [] : [];
  }, [selectedCollegeCode, selectedBranchCode, allCollegesDataset, cachedColleges]);

  // Filtered and Searched Records Engine
  const filteredRecords = useMemo(() => {
    let list = rawRecordsPool;
    if (!list || list.length === 0) return [];

    // Filter by branch if on "ALL" colleges and specific branch selected
    if (selectedCollegeCode === 'ALL' && selectedBranchCode !== 'ALL') {
      list = list.filter((r) => r.branch === selectedBranchCode);
    }

    // Filter by Category
    if (categoryFilter !== 'ALL') {
      const cat = categoryFilter.toUpperCase();
      list = list.filter(
        (r) =>
          (r.category && r.category.toUpperCase().includes(cat)) ||
          (r.allottedCategory && r.allottedCategory.toUpperCase().includes(cat))
      );
    }

    // Filter by Gender
    if (genderFilter !== 'ALL') {
      list = list.filter((r) => r.gender === genderFilter);
    }

    // Filter by Region
    if (regionFilter !== 'ALL') {
      list = list.filter((r) => r.region === regionFilter);
    }

    // Instant Debounced Search: Matches Candidate Name, Hall Ticket, or Numerical Rank
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      const numQ = parseInt(q.replace(/[^0-9]/g, ''), 10);
      const hasNumeric = !isNaN(numQ) && numQ > 0;

      list = list.filter((r) => {
        // Match exact or partial numerical rank
        if (hasNumeric && r.rank) {
          if (r.rank === numQ) return true;
          if (String(r.rank).includes(q)) return true;
        }

        // Match Candidate Name
        if (r.name && r.name.toLowerCase().includes(q)) return true;

        // Match Hall Ticket
        if (r.hallTicket && r.hallTicket.toLowerCase().includes(q)) return true;

        // Match Branch Code or College Code
        if (r.branch && r.branch.toLowerCase().includes(q)) return true;
        if (r.collegeCode && r.collegeCode.toLowerCase().includes(q)) return true;

        return false;
      });
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortField === 'rank') {
        return sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank;
      } else {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return sortOrder === 'ASC' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
    });
  }, [
    rawRecordsPool,
    selectedCollegeCode,
    selectedBranchCode,
    categoryFilter,
    genderFilter,
    regionFilter,
    debouncedSearchQuery,
    sortField,
    sortOrder,
  ]);

  // Deterministic Analytics & 4 KPI Cards Computation
  const analytics = useMemo(() => {
    const list = filteredRecords;
    const totalSeats = list.length;

    if (totalSeats === 0) {
      return {
        totalSeats: 0,
        medianRank: 0,
        openingRank: 0,
        closingRank: 0,
        maleCount: 0,
        femaleCount: 0,
        auCount: 0,
        svuCount: 0,
        nlCount: 0,
        categoryCutoffs: [],
      };
    }

    // Numerical ranks sorted ascending
    const ranks = list.map((r) => r.rank).filter((rk) => rk > 0).sort((a, b) => a - b);
    const validCount = ranks.length;

    // Median Rank calculation
    let medianRank = 0;
    if (validCount > 0) {
      if (validCount % 2 === 0) {
        medianRank = Math.round((ranks[validCount / 2 - 1] + ranks[validCount / 2]) / 2);
      } else {
        medianRank = ranks[Math.floor(validCount / 2)];
      }
    }

    // Opening (Best) Rank and Closing Cutoff Rank
    const openingRank = validCount > 0 ? ranks[0] : 0;
    const closingRank = validCount > 0 ? ranks[validCount - 1] : 0;

    let maleCount = 0;
    let femaleCount = 0;
    let auCount = 0;
    let svuCount = 0;
    let nlCount = 0;
    const quotaMap = {};

    list.forEach((r) => {
      if (r.gender === 'M') maleCount++;
      else if (r.gender === 'F') femaleCount++;

      if (r.region === 'AU') auCount++;
      else if (r.region === 'SVU') svuCount++;
      else nlCount++;

      const q = r.allottedCategory || 'GENERAL';
      if (!quotaMap[q]) {
        quotaMap[q] = {
          quota: q,
          count: 1,
          openingRank: r.rank,
          closingRank: r.rank,
        };
      } else {
        quotaMap[q].count++;
        if (r.rank < quotaMap[q].openingRank) quotaMap[q].openingRank = r.rank;
        if (r.rank > quotaMap[q].closingRank) quotaMap[q].closingRank = r.rank;
      }
    });

    const categoryCutoffs = Object.values(quotaMap).sort((a, b) => a.openingRank - b.openingRank);

    return {
      totalSeats,
      medianRank,
      openingRank,
      closingRank,
      maleCount,
      femaleCount,
      auCount,
      svuCount,
      nlCount,
      categoryCutoffs,
    };
  }, [filteredRecords]);

  // Paginated records for table & mobile cards (Strict 25 records per page)
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Copy Hall ticket handler
  const handleCopyTicket = (ticket) => {
    if (!ticket) return;
    navigator.clipboard?.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  // Jump from search result to specific college
  const handleSelectSpecificCollege = (collegeCode, branchCode) => {
    if (collegeCode) setSelectedCollegeCode(collegeCode);
    if (branchCode) setSelectedBranchCode(branchCode);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Export clean CSV
  const handleExportCsv = useCallback(() => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Rank',
      'Candidate Name',
      'College Code',
      'College Name',
      'Branch Code',
      'Branch Name',
      'Category',
      'Allotted Quota',
      'Gender',
      'Region',
      'Phase',
    ];

    const rows = filteredRecords.map((r) => [
      r.rank,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.collegeCode,
      `"${(r.collegeName || '').replace(/"/g, '""')}"`,
      r.branch,
      `"${(r.branchName || '').replace(/"/g, '""')}"`,
      r.category,
      `"${(r.allottedCategory || '').replace(/"/g, '""')}"`,
      r.gender,
      r.region,
      r.phase,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `AP_EAPCET_2025_${selectedCollegeCode}_${selectedBranchCode}_Allotments.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredRecords, selectedCollegeCode, selectedBranchCode]);

  // Rank Predictor Engine Calculations
  const predictorResults = useMemo(() => {
    const numRank = parseInt(userRank.replace(/,/g, ''), 10);
    if (isNaN(numRank) || numRank <= 0) return [];

    const results = [];

    AP_EAPCET_COLLEGES.forEach((col) => {
      if (!col.hasData || !col.branches) return;

      col.branches.forEach((br) => {
        if (predictorBranchFilter !== 'ALL' && br.branchCode !== predictorBranchFilter) {
          return;
        }

        const closingRank = br.maxRank || 0;
        const minRank = br.minRank || 0;
        if (closingRank === 0) return;

        let factor = 1.0;
        if (userCategory === 'EWS') factor = 1.08;
        else if (userCategory === 'BC_A') factor = 1.15;
        else if (userCategory === 'BC_B') factor = 1.12;
        else if (userCategory === 'BC_C') factor = 1.18;
        else if (userCategory === 'BC_D') factor = 1.14;
        else if (userCategory === 'BC_E') factor = 1.25;
        else if (userCategory === 'SC') factor = 1.45;
        else if (userCategory === 'ST') factor = 1.65;

        if (userGender === 'F') factor *= 1.08;

        const effectiveClosingRank = Math.round(closingRank * factor);
        const safeRankThreshold = Math.round(effectiveClosingRank * 0.82);

        let chance = 'AMBITIOUS';
        let chanceScore = 20;

        if (numRank <= safeRankThreshold) {
          chance = 'SAFE';
          chanceScore = 90;
        } else if (numRank <= effectiveClosingRank) {
          chance = 'MODERATE';
          chanceScore = 65;
        } else if (numRank <= Math.round(effectiveClosingRank * 1.18)) {
          chance = 'AMBITIOUS';
          chanceScore = 35;
        } else {
          return;
        }

        results.push({
          collegeCode: col.collegeCode,
          collegeName: col.collegeName,
          branchCode: br.branchCode,
          branchName: br.branchName,
          closingRank,
          minRank,
          effectiveClosingRank,
          chance,
          chanceScore,
          diff: effectiveClosingRank - numRank,
        });
      });
    });

    let filtered = results;
    if (predictorChanceFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.chance === predictorChanceFilter);
    }

    if (predictorSearchTerm.trim()) {
      const q = predictorSearchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.collegeCode.toLowerCase().includes(q) ||
          r.collegeName.toLowerCase().includes(q) ||
          r.branchCode.toLowerCase().includes(q) ||
          r.branchName.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      const chanceOrder = { SAFE: 1, MODERATE: 2, AMBITIOUS: 3 };
      if (chanceOrder[a.chance] !== chanceOrder[b.chance]) {
        return chanceOrder[a.chance] - chanceOrder[b.chance];
      }
      return b.diff - a.diff;
    });
  }, [
    userRank,
    userCategory,
    userGender,
    predictorBranchFilter,
    predictorChanceFilter,
    predictorSearchTerm,
  ]);

  // Rank badge class generator
  const getRankBadgeClass = (rank) => {
    if (!rank || rank <= 0) return 'bg-slate-800 text-slate-300 border-slate-700';
    if (rank <= 5000) {
      return 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/10';
    } else if (rank <= 15000) {
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-xs shadow-emerald-500/10';
    } else {
      return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-500/10';
    }
  };

  // Branch badge color classes
  const getBranchBadgeColor = (branch) => {
    const b = (branch || '').toUpperCase();
    if (b === 'CSE') return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (b === 'CSM' || b === 'AIM' || b === 'AIDS' || b === 'AID')
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (b === 'CSD') return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (b === 'CSC') return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
    if (b === 'ECE') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (b === 'EEE') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (b === 'MEC') return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    if (b === 'CIV') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* 1. BRANDING & HEADER STRIP */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide shadow-sm">
            <Flame className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-pulse" />
            <span>🔥 AP EAPCET 2025 College Intelligence & Cutoffs</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            AP EAPCET 2025 College Intelligence & Allotment Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed px-1">
            ఆంధ్రప్రదేశ్ ఇంజనీరింగ్ కాలేజీల వారీగా, బ్రాంచ్ వారీగా విద్యార్థుల అలాట్‌మెంట్ జాబితా &amp; కట్-ఆఫ్ ర్యాంకులు (70+ కాలేజీలు, 37,600+ సీట్లు)
          </p>
        </div>

        {/* 2. MODE SWITCHER TABS */}
        <div className="flex justify-center pt-1">
          <div className="inline-flex flex-wrap justify-center p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('intelligence')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'intelligence'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>College &amp; Candidate Explorer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('predictor')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'predictor'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Rank Predictor Engine</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-500/40">
                Safe &amp; Target
              </span>
            </button>
          </div>
        </div>

        {/* 3. INTELLIGENCE MODE: ALLOTMENTS & CUTOFFS */}
        {activeTab === 'intelligence' && (
          <div className="space-y-4 sm:space-y-6">

            {/* Top Control Bar: Institution & Branch Dropdowns + Global Search */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl backdrop-blur-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                {/* Institution Selector with "All Colleges" Option */}
                <div className="relative" ref={collegeDropdownRef}>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      Select Institution / కళాశాల
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                      {AP_EAPCET_COLLEGES.filter((c) => c.hasData).length} Colleges Verified
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCollegeDropdownOpen(!isCollegeDropdownOpen);
                      setIsBranchDropdownOpen(false);
                      setCollegeSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between bg-slate-950 border text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-all text-left shadow-inner ${
                      selectedCollegeCode === 'ALL'
                        ? 'border-cyan-500/50 hover:border-cyan-400'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-xs font-bold shrink-0 ${
                          selectedCollegeCode === 'ALL'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {selectedCollegeCode}
                      </span>
                      <span className="truncate text-slate-100 font-medium">
                        {currentCollegeMeta.collegeName}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isCollegeDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>

                  {/* Institution Popover */}
                  {isCollegeDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-800 bg-slate-950">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            autoFocus
                            value={collegeSearchTerm}
                            onChange={(e) => setCollegeSearchTerm(e.target.value)}
                            placeholder="Search college code or name (e.g. AUCE, VRSE, PPSV)..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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
                        {/* PINNED OPTION: All Colleges (Entire AP) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCollegeCode('ALL');
                            setIsCollegeDropdownOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                            selectedCollegeCode === 'ALL'
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                              : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              ALL
                            </span>
                            <div className="truncate">
                              <span className="font-bold text-cyan-200 block truncate">
                                All Colleges (Entire AP — 70 Colleges)
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Search or browse across all engineering colleges in Andhra Pradesh
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-mono shrink-0 ml-1">
                            37,637 seats
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
                                  isSelected
                                    ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                                    : 'text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate pr-2">
                                  <span
                                    className={`px-1 py-0.5 rounded font-mono text-[10px] font-bold ${
                                      isSelected
                                        ? 'bg-cyan-500/30 text-cyan-200'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
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
                          ? selectedCollegeCode === 'ALL'
                            ? 'All Branches (Statewide)'
                            : 'All Branches (College-wide)'
                          : availableBranches.find((b) => b.code === selectedBranchCode)?.name ||
                            selectedBranchCode}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isBranchDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>

                  {/* Branch Popover */}
                  {isBranchDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-800 bg-slate-950">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            autoFocus
                            value={branchSearchTerm}
                            onChange={(e) => setBranchSearchTerm(e.target.value)}
                            placeholder="Search branch code or name (e.g. CSE, CSM, ECE)..."
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
                        {filteredBranchOptions.length === 0 ? (
                          <div className="p-3 text-center text-slate-400">
                            No branches found matching "{branchSearchTerm}"
                          </div>
                        ) : (
                          filteredBranchOptions.map((b) => {
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
                                  isSelected
                                    ? 'bg-indigo-500/15 text-indigo-300 font-bold'
                                    : 'text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate pr-2">
                                  <span
                                    className={`px-1 py-0.5 rounded font-mono text-[10px] font-bold ${
                                      isSelected
                                        ? 'bg-indigo-500/30 text-indigo-200'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {b.code}
                                  </span>
                                  <span className="truncate">{b.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                                  {b.totalAllotted ? `${b.totalAllotted.toLocaleString()} seats` : ''}
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

              {/* Quick Branch Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] text-slate-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  Quick Branches:
                </span>
                {POPULAR_BRANCHES.map((pb) => (
                  <button
                    key={pb.code}
                    type="button"
                    onClick={() => {
                      setSelectedBranchCode(pb.code);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedBranchCode === pb.code
                        ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {pb.label}
                  </button>
                ))}
              </div>

              {/* Search Bar + Secondary Filter Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-800/70">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Candidate Name (e.g. PREETHI, VENKAT), Hall Ticket, or Rank (e.g. 48300)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500 shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setDebouncedSearchQuery('');
                        }}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Actions & Sort */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{sortOrder === 'ASC' ? 'Rank: Low-High' : 'Rank: High-Low'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCsv}
                      disabled={filteredRecords.length === 0}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                      title="Export clean CSV for offline access"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Filters Strip: Category, Gender, Region */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {AP_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {/* Gender Filter */}
                  <select
                    value={genderFilter}
                    onChange={(e) => {
                      setGenderFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="M">Boys (M)</option>
                    <option value="F">Girls (F)</option>
                  </select>

                  {/* Region Filter */}
                  <select
                    value={regionFilter}
                    onChange={(e) => {
                      setRegionFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="col-span-2 sm:col-span-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {AP_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-amber-300">{errorMessage}</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {FEATURED_AP_COLLEGES.slice(0, 5).map((fc) => (
                      <button
                        key={fc.code}
                        type="button"
                        onClick={() => setSelectedCollegeCode(fc.code)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        View {fc.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-slate-900/80 border border-slate-800 rounded-2xl p-4" />
                ))}
              </div>
            )}

            {/* 4 SUMMARY KPI CARDS (STRICT REQUIREMENT) */}
            {!loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">

                {/* KPI Card 1: Total Seats Allotted */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Total Seats Allotted
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      SEATS
                    </span>
                  </div>
                  <div className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {analytics.totalSeats.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-semibold">Boys: {analytics.maleCount}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-semibold">Girls: {analytics.femaleCount}</span>
                  </div>
                </div>

                {/* KPI Card 2: Median Allotment Rank */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      Median Allotment Rank
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      MEDIAN
                    </span>
                  </div>
                  <div className="text-xl sm:text-3xl font-black text-indigo-300 tracking-tight">
                    {analytics.medianRank > 0 ? `#${analytics.medianRank.toLocaleString()}` : '—'}
                  </div>
                  <div className="text-[11px] text-indigo-400/80 mt-1 truncate">
                    50th percentile admission benchmark
                  </div>
                </div>

                {/* KPI Card 3: Opening Rank (Best Rank) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Opening Rank (Best)
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      MIN RANK
                    </span>
                  </div>
                  <div className="text-xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                    {analytics.openingRank > 0 ? `#${analytics.openingRank.toLocaleString()}` : '—'}
                  </div>
                  <div className="text-[11px] text-emerald-400/80 mt-1 truncate">
                    First allotted candidate merit
                  </div>
                </div>

                {/* KPI Card 4: Closing Cutoff Rank */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-400" />
                      Closing Cutoff Rank
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      MAX RANK
                    </span>
                  </div>
                  <div className="text-xl sm:text-3xl font-black text-rose-400 tracking-tight">
                    {analytics.closingRank > 0 ? `#${analytics.closingRank.toLocaleString()}` : '—'}
                  </div>
                  <div className="text-[11px] text-rose-400/80 mt-1 truncate">
                    Final allotted candidate cutoff
                  </div>
                </div>

              </div>
            )}

            {/* 5. INTERACTIVE ALLOTMENT CANDIDATE LIST */}
            <div className="space-y-3">
              {/* Header with Results Count & Pagination summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    Allotment Records
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                    {filteredRecords.length.toLocaleString()} Candidates
                  </span>
                  {debouncedSearchQuery && (
                    <span className="text-xs text-slate-400">
                      matching "<strong className="text-white">{debouncedSearchQuery}</strong>"
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
                  {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
                </div>
              </div>

              {/* EMPTY STATE */}
              {!loading && filteredRecords.length === 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3 backdrop-blur-xl">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="text-base font-bold text-slate-200">
                    No Allotment Records Found
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    College data compiling or unavailable for the selected combination of branch, category, or search term. Try resetting your search filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchQuery('');
                      setCategoryFilter('ALL');
                      setGenderFilter('ALL');
                      setRegionFilter('ALL');
                      setSelectedBranchCode('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-600/20"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* A. DESKTOP VIEW: SLEEK TABLE WITH CUSTOM BADGES (hidden on mobile) */}
              {!loading && filteredRecords.length > 0 && (
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4 w-28">Rank</th>
                          <th className="py-3.5 px-4 min-w-[200px]">Candidate Name</th>
                          {selectedCollegeCode === 'ALL' && (
                            <th className="py-3.5 px-4 min-w-[140px]">Institution</th>
                          )}
                          <th className="py-3.5 px-4 w-28">Branch</th>
                          <th className="py-3.5 px-4 w-24">Category</th>
                          <th className="py-3.5 px-4 w-24">Gender</th>
                          <th className="py-3.5 px-4 w-24">Region</th>
                          <th className="py-3.5 px-4 min-w-[150px]">Allotted Quota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {paginatedRecords.map((r, idx) => (
                          <tr
                            key={`${r.collegeCode}-${r.branch}-${r.rank}-${idx}`}
                            className="hover:bg-slate-800/50 transition-colors group"
                          >
                            {/* Rank Badge Column */}
                            <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold inline-block ${getRankBadgeClass(
                                  r.rank
                                )}`}
                              >
                                #{r.rank ? r.rank.toLocaleString() : '—'}
                              </span>
                            </td>

                            {/* Candidate Name Column */}
                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors block">
                                  {r.name}
                                </span>
                                {r.hallTicket && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                                    <span>HT: {r.hallTicket}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyTicket(r.hallTicket)}
                                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                                      title="Copy Hall Ticket"
                                    >
                                      {copiedTicket === r.hallTicket ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* College Column (if in All Colleges view) */}
                            {selectedCollegeCode === 'ALL' && (
                              <td className="py-3 px-4">
                                <div className="space-y-0.5 max-w-[180px]">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectSpecificCollege(r.collegeCode, r.branch)}
                                    className="font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline text-xs flex items-center gap-1 text-left cursor-pointer"
                                  >
                                    <span>{r.collegeCode}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="text-[10px] text-slate-400 truncate block" title={r.collegeName}>
                                    {r.collegeName}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* Branch Badge Column */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${getBranchBadgeColor(
                                  r.branch
                                )}`}
                                title={r.branchName}
                              >
                                {r.branch}
                              </span>
                            </td>

                            {/* Candidate Category Column */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs">
                                {r.category || 'OC'}
                              </span>
                            </td>

                            {/* Gender Column */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                                  r.gender === 'M'
                                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                }`}
                              >
                                {r.gender === 'M' ? 'Boys (M)' : r.gender === 'F' ? 'Girls (F)' : r.gender}
                              </span>
                            </td>

                            {/* Region Column */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 font-mono text-xs">
                                {r.region || 'AU'}
                              </span>
                            </td>

                            {/* Allotted Quota Column */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-semibold">
                                {r.allottedCategory || '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* B. MOBILE CARD VIEW (Strict requirement: avoid awkward horizontal scroll) */}
              {!loading && filteredRecords.length > 0 && (
                <div className="block md:hidden space-y-2.5">
                  {paginatedRecords.map((r, idx) => (
                    <div
                      key={`mob-${r.collegeCode}-${r.branch}-${r.rank}-${idx}`}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-md backdrop-blur-xl"
                    >
                      {/* Card Header: Candidate Name & Rank Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white text-sm truncate">{r.name}</h4>
                          {r.hallTicket && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                              <span>HT: {r.hallTicket}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyTicket(r.hallTicket)}
                                className="text-slate-500 hover:text-cyan-400"
                              >
                                {copiedTicket === r.hallTicket ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-lg font-mono font-bold text-xs shrink-0 ${getRankBadgeClass(
                            r.rank
                          )}`}
                        >
                          #{r.rank ? r.rank.toLocaleString() : '—'}
                        </span>
                      </div>

                      {/* College & Branch Meta Strip */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80 gap-1">
                        <div className="truncate text-slate-300 flex items-center gap-1.5">
                          <span className="font-mono font-bold text-cyan-300">[{r.collegeCode}]</span>
                          <span className="truncate text-slate-400 text-[11px]">
                            {r.collegeName}
                          </span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] shrink-0 border ${getBranchBadgeColor(
                            r.branch
                          )}`}
                        >
                          {r.branch}
                        </span>
                      </div>

                      {/* Tags Strip: Gender, Category, Region, Quota */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            r.gender === 'M'
                              ? 'bg-cyan-500/15 text-cyan-300'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {r.gender === 'M' ? 'Boys (M)' : r.gender === 'F' ? 'Girls (F)' : r.gender}
                        </span>

                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {r.category || 'OC'}
                        </span>

                        <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                          {r.region || 'AU'}
                        </span>

                        <span className="ml-auto px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-[10px] font-semibold truncate max-w-[140px]">
                          {r.allottedCategory}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* C. CLIENT-SIDE PAGINATION CONTROLS (25 per page with Next/Prev) */}
              {!loading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-4 px-1 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 font-mono">
                    Page <strong className="text-white">{currentPage}</strong> of{' '}
                    <strong className="text-white">{totalPages}</strong> (25 per page)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 220, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 220, behavior: 'smooth' });
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 220, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* 6. CATEGORY CUTOFFS COLLAPSIBLE (Best & Last Rank per Quota) */}
            {!loading && selectedCollegeCode !== 'ALL' && analytics.categoryCutoffs.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Quota-Wise Opening &amp; Closing Cutoffs [{selectedCollegeCode} — {selectedBranchCode}]
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    <span>{isAnalyticsExpanded ? 'Hide Cutoffs' : 'Show Cutoffs'}</span>
                    {isAnalyticsExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {isAnalyticsExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {analytics.categoryCutoffs.map((item) => (
                      <div
                        key={item.quota}
                        className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 hover:border-slate-700 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {item.quota}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.count} Seats
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Opening</span>
                            <span className="font-mono font-bold text-emerald-400">
                              #{item.openingRank?.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Closing</span>
                            <span className="font-mono font-bold text-rose-400">
                              #{item.closingRank?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* 4. PREDICTOR ENGINE MODE (Safe, Target, Ambitious Admission Probability) */}
        {activeTab === 'predictor' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Predictor Inputs Strip */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Compass className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    AP EAPCET 2025 Precision Rank Predictor
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculates admission chances across 70 verified AP institutions using final counseling phase cutoff datasets.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* User Rank Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Your AP EAPCET Rank
                  </label>
                  <input
                    type="number"
                    value={userRank}
                    onChange={(e) => setUserRank(e.target.value)}
                    placeholder="e.g. 14500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>

                {/* User Category */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Social Category / Quota
                  </label>
                  <select
                    value={userCategory}
                    onChange={(e) => setUserCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="OC">OC (General)</option>
                    <option value="EWS">EWS (10% Quota)</option>
                    <option value="BC_A">BC-A (7%)</option>
                    <option value="BC_B">BC-B (10%)</option>
                    <option value="BC_C">BC-C (1%)</option>
                    <option value="BC_D">BC-D (7%)</option>
                    <option value="BC_E">BC-E (4%)</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                {/* User Gender */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Gender</label>
                  <select
                    value={userGender}
                    onChange={(e) => setUserGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="M">Male (Boys)</option>
                    <option value="F">Female (Girls Quota 33%)</option>
                  </select>
                </div>

                {/* Preferred Branch */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Target Branch
                  </label>
                  <select
                    value={predictorBranchFilter}
                    onChange={(e) => setPredictorBranchFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {POPULAR_BRANCHES.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secondary Predictor Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['ALL', 'SAFE', 'MODERATE', 'AMBITIOUS'].map((chance) => (
                    <button
                      key={chance}
                      type="button"
                      onClick={() => setPredictorChanceFilter(chance)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        predictorChanceFilter === chance
                          ? chance === 'SAFE'
                            ? 'bg-emerald-500 text-slate-950'
                            : chance === 'MODERATE'
                            ? 'bg-amber-500 text-slate-950'
                            : chance === 'AMBITIOUS'
                            ? 'bg-rose-500 text-white'
                            : 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {chance === 'ALL' ? 'All Chances' : chance}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={predictorSearchTerm}
                    onChange={(e) => setPredictorSearchTerm(e.target.value)}
                    placeholder="Search college code or name..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Predictor Results Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Predicted College Options</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs">
                    {predictorResults.length} Matched
                  </span>
                </h4>
              </div>

              {predictorResults.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                  No college options found within target range. Try adjusting your rank or selecting 'All Branches'.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {predictorResults.slice(0, 48).map((res, idx) => (
                    <div
                      key={`pred-${res.collegeCode}-${res.branchCode}-${idx}`}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition-all shadow-md backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300 mr-1.5">
                            {res.collegeCode}
                          </span>
                          <span className="font-bold text-white text-xs truncate inline-block max-w-[160px]">
                            {res.collegeName}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide shrink-0 ${
                            res.chance === 'SAFE'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : res.chance === 'MODERATE'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {res.chance} ({res.chanceScore}%)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] border ${getBranchBadgeColor(
                            res.branchCode
                          )}`}
                        >
                          {res.branchCode}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {res.branchName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span>
                          Cutoff: <strong className="text-slate-200">#{res.effectiveClosingRank.toLocaleString()}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('intelligence');
                            handleSelectSpecificCollege(res.collegeCode, res.branchCode);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span>Explore</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
