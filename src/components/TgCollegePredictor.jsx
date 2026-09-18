import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Compass,
  Search,
  Building2,
  GitBranch,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileDown,
  ShieldCheck,
  Filter,
  CheckCheck,
  HelpCircle,
  Layers,
  Info,
  X
} from 'lucide-react';
import {
  TG_EAPCET_COLLEGE_MANIFEST,
  TG_EAPCET_GLOBAL_STATS
} from '../data/tgEapcetCollegeManifest';

// All official TG EAPCET Social Categories including Telangana SC Sub-Categorization
export const BASE_SOCIAL_CATEGORIES = [
  { id: 'OC', label: 'OC (Open Competition / General)' },
  { id: 'EWS', label: 'EWS (Economically Weaker Section - 10%)' },
  { id: 'BC_A', label: 'BC_A (Backward Class Group A - 7%)' },
  { id: 'BC_B', label: 'BC_B (Backward Class Group B - 10%)' },
  { id: 'BC_C', label: 'BC_C (Backward Class Group C - 1%)' },
  { id: 'BC_D', label: 'BC_D (Backward Class Group D - 7%)' },
  { id: 'BC_E', label: 'BC_E (Backward Class Group E - 4%)' },
  { id: 'SC_1', label: 'SC_1 / SC-I (Scheduled Caste Group 1)' },
  { id: 'SC_2', label: 'SC_2 / SC-II (Scheduled Caste Group 2)' },
  { id: 'SC_3', label: 'SC_3 / SC-III (Scheduled Caste Group 3)' },
  { id: 'SC', label: 'SC (General Scheduled Caste Pool)' },
  { id: 'ST', label: 'ST (Scheduled Tribe - 10%)' },
];

// Special Reservation Quotas strictly present in official 2026 JSON dataset
export const SPECIAL_RESERVATION_OPTIONS = [
  {
    id: 'NCC',
    code: 'NCC',
    label: 'NCC',
    fullName: 'National Cadet Corps (NCC Quota)',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  },
  {
    id: 'SPORTS',
    code: 'SPORTS', // matches 'SPORTS' or 'SG' (Sports & Games)
    label: 'SPORTS / SG',
    fullName: 'Sports & Games Quota (SG / SPORTS)',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'CAP',
    code: 'CAP',
    label: 'CAP',
    fullName: 'Children of Armed Personnel (Ex-Servicemen & Defense)',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  {
    id: 'PHO',
    code: 'PHO',
    label: 'PHO',
    fullName: 'Physically Handicapped (Orthopedically / Locomotor)',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  },
  {
    id: 'PHH',
    code: 'PHH',
    label: 'PHH',
    fullName: 'Physically Handicapped (Hearing Impaired)',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'PHV',
    code: 'PHV',
    label: 'PHV',
    fullName: 'Physically Handicapped (Visual Impairment)',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'PHC',
    code: 'PHC', // matches 'PHC', 'PHA' (Autism), or 'PHM' (Multiple)
    label: 'PHC / PHA / PHM',
    fullName: 'Physically Handicapped (Autism / Multiple / Other)',
    badgeColor: 'bg-pink-500/15 text-pink-300 border-pink-500/30'
  },
];

// All special reservation token keys used to detect special seats in the raw data
const ALL_SPECIAL_DATA_KEYS = ['NCC', 'CAP', 'SG', 'SPORTS', 'PHO', 'PHA', 'PHM', 'PHV', 'PHH', 'PHC'];

// Gender pool
const GENDER_POOLS = [
  { id: 'GEN', label: 'Boys / General Pool (Open for All)' },
  { id: 'GIRLS', label: 'Girls Only (33.3% Horizontal Quota)' },
];

// Region jurisdiction
const REGIONS = [
  { id: 'OU', label: 'OU Region (85% Local Quota)' },
  { id: 'UR', label: 'Unreserved / Statewide (15% Open Quota)' },
  { id: 'ALL', label: 'Combined / All Regions' },
];

// Prebuilt popular web options strategy templates
const POPULAR_STRATEGY_TEMPLATES = [
  {
    name: 'Top Hyderabad Tier-1 CS & AI Options',
    description: 'Premier autonomous institutions (CBIT, VNR VJIET, Vasavi, CVR, GRIET)',
    options: [
      { collegeCode: 'CBIT', branchCode: 'CSE' },
      { collegeCode: 'CBIT', branchCode: 'CSM' },
      { collegeCode: 'VJEC', branchCode: 'CSE' },
      { collegeCode: 'VJEC', branchCode: 'CSM' },
      { collegeCode: 'VASV', branchCode: 'CSE' },
      { collegeCode: 'VASV', branchCode: 'INF' },
      { collegeCode: 'CVRH', branchCode: 'CSE' },
      { collegeCode: 'GRET', branchCode: 'CSE' },
    ]
  },
  {
    name: 'Top Autonomous Core & Electronics Options',
    description: 'ECE, EEE and Mech in premier colleges for high-demand hardware careers',
    options: [
      { collegeCode: 'CBIT', branchCode: 'ECE' },
      { collegeCode: 'VJEC', branchCode: 'ECE' },
      { collegeCode: 'VASV', branchCode: 'ECE' },
      { collegeCode: 'CVRH', branchCode: 'ECE' },
      { collegeCode: 'GRET', branchCode: 'ECE' },
      { collegeCode: 'MGIT', branchCode: 'ECE' },
    ]
  },
  {
    name: 'Safe High-Placements IT Cluster',
    description: 'High-intake colleges with strong corporate placement track records',
    options: [
      { collegeCode: 'KMIT', branchCode: 'CSE' },
      { collegeCode: 'KMIT', branchCode: 'CSM' },
      { collegeCode: 'VMEG', branchCode: 'CSE' },
      { collegeCode: 'VBIT', branchCode: 'CSE' },
      { collegeCode: 'MLRD', branchCode: 'CSE' },
      { collegeCode: 'TKRC', branchCode: 'CSE' },
    ]
  }
];

export default function TgCollegePredictor() {
  // Candidate inputs
  const [userRank, setUserRank] = useState(18500);
  const [rankInputStr, setRankInputStr] = useState('18500');
  const [rankError, setRankError] = useState(null);
  const [caste, setCaste] = useState('OC');
  const [gender, setGender] = useState('GEN');
  const [region, setRegion] = useState('OU');

  // Special Reservation Quota Toggle: Multi-select array (e.g. [], ['NCC'], ['CAP'], etc.)
  const [selectedSpecialQuotas, setSelectedSpecialQuotas] = useState([]);

  // Active view: 'web-options' (custom strategy list) or 'statewide-scanner' (scan all 151 colleges)
  const [activeTab, setActiveTab] = useState('web-options');

  // Multi-Preference Web Options State
  const [webOptions, setWebOptions] = useState([
    {
      id: 'opt-1',
      collegeCode: 'CBIT',
      branchCode: 'CSE',
    },
    {
      id: 'opt-2',
      collegeCode: 'VJEC',
      branchCode: 'CSM',
    },
    {
      id: 'opt-3',
      collegeCode: 'CVRH',
      branchCode: 'CSE',
    },
    {
      id: 'opt-4',
      collegeCode: 'GRET',
      branchCode: 'INF',
    },
    {
      id: 'opt-5',
      collegeCode: 'MGIT',
      branchCode: 'CSE',
    },
    {
      id: 'opt-6',
      collegeCode: 'KMIT',
      branchCode: 'CSM',
    },
  ]);

  // New option selection form states
  const [newCollegeCode, setNewCollegeCode] = useState('CBIT');
  const [newBranchCode, setNewBranchCode] = useState('CSE');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [isCollegePickerOpen, setIsCollegePickerOpen] = useState(false);
  const collegePickerRef = useRef(null);

  // In-memory cache for detailed college records: { [COLLEGE_CODE]: branchesArray }
  const [collegeRecordCache, setCollegeRecordCache] = useState({});
  const [loadingColleges, setLoadingColleges] = useState({});
  const [copiedStrategy, setCopiedStrategy] = useState(false);

  // Statewide scanner filters
  const [scannerBranchFilter, setScannerBranchFilter] = useState('ALL');
  const [scannerChanceFilter, setScannerChanceFilter] = useState('ALL');
  const [scannerSearchQuery, setScannerSearchQuery] = useState('');
  const [scannerPage, setScannerPage] = useState(1);
  const SCANNER_ITEMS_PER_PAGE = 25;

  // Handle rank change with validation
  const handleRankChange = (val) => {
    setRankInputStr(val);
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setRankError('Please enter a valid numerical rank.');
      return;
    }
    if (num < 1 || num > 450000) {
      setRankError('Rank must be between 1 and 400,000.');
      return;
    }
    setRankError(null);
    setUserRank(num);
  };

  // Toggle special reservation quota item
  const toggleSpecialQuota = (quotaId) => {
    setSelectedSpecialQuotas((prev) => {
      if (prev.includes(quotaId)) {
        return prev.filter((id) => id !== quotaId);
      } else {
        return [...prev, quotaId];
      }
    });
  };

  const clearAllSpecialQuotas = () => {
    setSelectedSpecialQuotas([]);
  };

  // Close college search picker on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (collegePickerRef.current && !collegePickerRef.current.contains(e.target)) {
        setIsCollegePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch detailed allotment JSON for a college when needed
  const fetchCollegeDetails = async (code) => {
    const norm = code.toUpperCase();
    if (collegeRecordCache[norm] || loadingColleges[norm]) return;

    const manifestItem = TG_EAPCET_COLLEGE_MANIFEST.find(
      (c) => c.collegeCode.toUpperCase() === norm
    );
    if (!manifestItem) return;

    setLoadingColleges((prev) => ({ ...prev, [norm]: true }));
    try {
      const res = await fetch(manifestItem.file);
      if (!res.ok) throw new Error('File not found');
      const data = await res.json();
      const bundles = Array.isArray(data) ? data : (data.branches || [data]);
      setCollegeRecordCache((prev) => ({ ...prev, [norm]: bundles }));
    } catch (err) {
      console.warn(`Could not load detailed JSON for ${norm}:`, err.message);
    } finally {
      setLoadingColleges((prev) => ({ ...prev, [norm]: false }));
    }
  };

  // Eagerly prefetch colleges in current web options
  useEffect(() => {
    const codes = Array.from(new Set(webOptions.map((o) => o.collegeCode.toUpperCase())));
    codes.forEach((code) => {
      fetchCollegeDetails(code);
    });
  }, [webOptions]);

  // Derived list of all unique branch codes from manifest
  const uniqueBranches = useMemo(() => {
    const map = new Map();
    TG_EAPCET_COLLEGE_MANIFEST.forEach((c) => {
      c.branches.forEach((b) => {
        if (!map.has(b.branchCode)) {
          map.set(b.branchCode, b.branchName);
        }
      });
    });
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, []);

  // Dynamically extract any additional social categories from loaded cache (e.g. Muslim Minority MUS, Christian CHR)
  const availableSocialCategories = useMemo(() => {
    const knownIds = new Set(BASE_SOCIAL_CATEGORIES.map((c) => c.id));
    const dynamicList = [...BASE_SOCIAL_CATEGORIES];

    Object.values(collegeRecordCache).forEach((branches) => {
      if (!Array.isArray(branches)) return;
      branches.forEach((branch) => {
        (branch.records || []).forEach((r) => {
          if (r.seatCategory) {
            const raw = r.seatCategory.replace(/\([0-9]+\)/g, '');
            const prefix = raw.split('_')[0];
            if ((prefix === 'MUS' || prefix === 'CHR') && !knownIds.has(prefix)) {
              knownIds.add(prefix);
              dynamicList.push({
                id: prefix,
                label: prefix === 'MUS' ? 'MUS (Muslim Minority)' : 'CHR (Christian Minority)',
              });
            }
          }
        });
      });
    });

    return dynamicList;
  }, [collegeRecordCache]);

  // Filtered colleges for autocomplete
  const filteredColleges = useMemo(() => {
    const q = collegeSearchQuery.toLowerCase().trim();
    if (!q) return TG_EAPCET_COLLEGE_MANIFEST.slice(0, 30);
    return TG_EAPCET_COLLEGE_MANIFEST.filter(
      (c) =>
        c.collegeCode.toLowerCase().includes(q) ||
        c.collegeName.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [collegeSearchQuery]);

  // Available branches for newly selected college in the Add Option form
  const availableBranchesForNewCollege = useMemo(() => {
    const found = TG_EAPCET_COLLEGE_MANIFEST.find(
      (c) => c.collegeCode.toUpperCase() === newCollegeCode.toUpperCase()
    );
    return found ? found.branches : [];
  }, [newCollegeCode]);

  // Whenever new college changes, reset branch to first available
  useEffect(() => {
    if (availableBranchesForNewCollege.length > 0) {
      const exists = availableBranchesForNewCollege.some(
        (b) => b.branchCode === newBranchCode
      );
      if (!exists) {
        setNewBranchCode(availableBranchesForNewCollege[0].branchCode);
      }
    }
  }, [newCollegeCode, availableBranchesForNewCollege]);

  /**
   * RE-ENGINEERED DETERMINISTIC MATCHING ALGORITHM (NO GUESSWORK)
   *
   * 1. Filtering Strategy:
   *    - Filter records by collegeCode & branchCode.
   *    - Match candidate records against user's profile:
   *      * Special reservation quota:
   *        - If none selected: Exclude any record containing special tags (NCC, CAP, SG, PHO, etc.)
   *        - If checked: Require matching the requested special quota tag.
   *      * Gender Pool: Female candidates eligible for both _GIRLS and _GEN; male candidates excluded from exclusive _GIRLS seats.
   *      * Region Jurisdiction: OU candidates can compete in both OU local and UR unreserved seats.
   *      * Social Category: Open competition (OC) seats are accessible to ANY candidate on pure merit (Supreme Court Article 15/16).
   *        Reserved seats match the candidate's specific social category pool:
   *        - SC_1 / SC-I -> SC_I seats (plus General SC & OC)
   *        - SC_2 / SC-II -> SC_II seats (plus General SC & OC)
   *        - SC_3 / SC-III -> SC_III seats (plus General SC & OC)
   *        - SC -> General SC seats (SC_I, SC_II, SC_III & OC)
   *        - BC_A, BC_B, BC_C, BC_D, BC_E, ST -> matched group seats & OC
   *
   * 2. Closing Rank Extraction:
   *    Closing Rank = max(allotmentRanks in matched pool)
   *
   * 3. Difference / Buffer Calculation:
   *    Rank Buffer = Closing Rank - User Rank
   *
   * 4. Ground-Truth Allotment Evidence:
   *    Pull the exact candidate record that closed that branch pool:
   *    "In 2026 Phase-3 allotments, the last admitted candidate under [Category] secured rank #[Rank]."
   */
  const evaluateOption = (collegeCode, branchCode) => {
    const normCol = collegeCode.toUpperCase();
    const manifestCol = TG_EAPCET_COLLEGE_MANIFEST.find(
      (c) => c.collegeCode.toUpperCase() === normCol
    );
    const manifestBranch = manifestCol?.branches?.find(
      (b) => b.branchCode === branchCode
    );

    const fallbackClosingRank = manifestBranch?.closingRank || 999999;
    const fallbackBranchName = manifestBranch?.branchName || branchCode;
    const collegeName = manifestCol?.collegeName || collegeCode;

    // Check if detailed records are loaded in memory cache
    const collegeBundles = collegeRecordCache[normCol];
    let matchedClosingRank = fallbackClosingRank;
    let groundTruthRecord = null;
    let matchedCategoryLabel = 'General Allotment';
    let isDetailedMatch = false;
    let hasSpecialQuotaMatch = false;
    let specialQuotaFallbackUsed = false;

    if (collegeBundles && collegeBundles.length > 0) {
      const branchBundle = collegeBundles.find((b) => b.branchCode === branchCode);
      if (branchBundle && branchBundle.records && branchBundle.records.length > 0) {
        const records = branchBundle.records;

        // Core matching predicate
        const isEligibleRecord = (r, allowSpecialFilter) => {
          const cat = (r.seatCategory || '').toUpperCase().replace(/\([0-9]+\)/g, '');
          const catTokens = cat.split('_');

          // Special reservation checks
          const recordSpecialTags = catTokens.filter((t) => ALL_SPECIAL_DATA_KEYS.includes(t));
          const hasRecordSpecial = recordSpecialTags.length > 0;

          if (allowSpecialFilter && selectedSpecialQuotas.length > 0) {
            // User checked a special quota: candidate record MUST have one of the selected tags
            const matchesSpecial = selectedSpecialQuotas.some((s) => {
              if (s === 'SPORTS') return catTokens.includes('SPORTS') || catTokens.includes('SG');
              if (s === 'PHC') return catTokens.includes('PHC') || catTokens.includes('PHA') || catTokens.includes('PHM');
              return catTokens.includes(s);
            });
            if (!matchesSpecial) return false;
          } else {
            // Standard candidate or evaluating regular fallback: EXCLUDE special reservation seats
            if (hasRecordSpecial) return false;
          }

          // Gender pool checks
          if (gender === 'GEN') {
            // Male candidates cannot take exclusive girls quota seats
            if (catTokens.includes('GIRLS') && !catTokens.includes('GEN')) {
              return false;
            }
          }
          // Girls candidates can take both GIRLS and GEN seats.

          // Region jurisdiction checks
          if (region === 'UR') {
            // UR candidate can only take UR seats
            if (catTokens.includes('OU') && !catTokens.includes('UR')) {
              return false;
            }
          }
          // OU candidates can take both OU local seats and UR statewide seats

          // Caste / Social Category matching
          const isOCSeat = catTokens.includes('OC') || catTokens.includes('OPEN');

          if (caste === 'OC') {
            return isOCSeat;
          } else if (caste === 'EWS') {
            return catTokens.includes('EWS') || isOCSeat;
          } else if (caste === 'SC_1' || caste === 'SC1' || caste === 'SC_I') {
            return (catTokens.includes('SC') && (catTokens.includes('I') || catTokens.includes('1'))) || isOCSeat;
          } else if (caste === 'SC_2' || caste === 'SC2' || caste === 'SC_II') {
            return (catTokens.includes('SC') && (catTokens.includes('II') || catTokens.includes('2'))) || isOCSeat;
          } else if (caste === 'SC_3' || caste === 'SC3' || caste === 'SC_III') {
            return (catTokens.includes('SC') && (catTokens.includes('III') || catTokens.includes('3'))) || isOCSeat;
          } else if (caste === 'SC') {
            return catTokens.includes('SC') || isOCSeat;
          } else if (caste.startsWith('BC_')) {
            const sub = caste.split('_')[1]; // A, B, C, D, E
            return (catTokens.includes('BC') && catTokens.includes(sub)) || isOCSeat;
          } else if (caste === 'ST') {
            return catTokens.includes('ST') || isOCSeat;
          } else if (caste === 'MUS') {
            return catTokens.includes('MUS') || isOCSeat;
          } else if (caste === 'CHR') {
            return catTokens.includes('CHR') || isOCSeat;
          }

          return isOCSeat;
        };

        // First attempt: match with user's special quota selection
        let eligibleRecords = [];
        if (selectedSpecialQuotas.length > 0) {
          eligibleRecords = records.filter((r) => isEligibleRecord(r, true));
          if (eligibleRecords.length > 0) {
            hasSpecialQuotaMatch = true;
          } else {
            // Fallback: if no special quota seat was allotted for this specific branch,
            // evaluate against candidate's regular social category pool so they receive useful counsel
            eligibleRecords = records.filter((r) => isEligibleRecord(r, false));
            specialQuotaFallbackUsed = true;
          }
        } else {
          eligibleRecords = records.filter((r) => isEligibleRecord(r, false));
        }

        if (eligibleRecords.length > 0) {
          // Closing cutoff is the maximum rank allotted to an admitted candidate in the matched pool
          const sorted = [...eligibleRecords].sort((a, b) => b.rank - a.rank);
          groundTruthRecord = sorted[0];
          matchedClosingRank = groundTruthRecord.rank;
          matchedCategoryLabel = groundTruthRecord.seatCategory || caste;
          isDetailedMatch = true;
        } else {
          // If no records in this specific pool, use branch general cutoff
          matchedClosingRank = fallbackClosingRank;
        }
      }
    } else {
      // Trigger eager background fetch if not yet loaded
      fetchCollegeDetails(normCol);
    }

    // Mathematical Disparity Formula:
    // Rank Buffer = Closing Rank - User Rank
    const buffer = matchedClosingRank - userRank;

    // Probability Classification Tiers:
    // - Very High Chance (Safe / Confirmed): User Rank <= Closing Rank - 2000 (Buffer > +2000)
    // - Moderate / Likely: User Rank within +-2000 of Closing Rank (-2000 <= Buffer <= +2000)
    // - Tough / Ambitious (Borderline): Buffer between -2000 and -5000
    // - Low Chance: Buffer < -5000
    let tier = 'low';
    let tierLabel = 'Low Chance (Dream Reach)';
    let tierBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    let bufferBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    let tierIcon = AlertCircle;

    if (buffer > 2000) {
      tier = 'safe';
      tierLabel = 'Very High Chance (Safe)';
      tierBadgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      bufferBadgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      tierIcon = CheckCircle2;
    } else if (buffer >= -2000 && buffer <= 2000) {
      tier = 'likely';
      tierLabel = 'Moderate / Likely';
      tierBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      bufferBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      tierIcon = Clock;
    } else if (buffer >= -5000 && buffer < -2000) {
      tier = 'ambitious';
      tierLabel = 'Tough / Ambitious (Borderline)';
      tierBadgeColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      bufferBadgeColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      tierIcon = TrendingUp;
    } else {
      tier = 'low';
      tierLabel = 'Low Chance (Dream Reach)';
      tierBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      bufferBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      tierIcon = AlertCircle;
    }

    return {
      collegeCode: normCol,
      collegeName,
      branchCode,
      branchName: fallbackBranchName,
      matchedClosingRank,
      buffer,
      tier,
      tierLabel,
      tierBadgeColor,
      bufferBadgeColor,
      tierIcon,
      groundTruthRecord,
      matchedCategoryLabel,
      isDetailedMatch,
      hasSpecialQuotaMatch,
      specialQuotaFallbackUsed,
    };
  };

  // Evaluated Web Options list
  const evaluatedWebOptions = useMemo(() => {
    return webOptions.map((opt, idx) => ({
      ...opt,
      priority: idx + 1,
      ...evaluateOption(opt.collegeCode, opt.branchCode),
    }));
  }, [webOptions, userRank, caste, gender, region, selectedSpecialQuotas, collegeRecordCache]);

  // Aggregate stats across web options
  const strategyStats = useMemo(() => {
    const total = evaluatedWebOptions.length;
    const safe = evaluatedWebOptions.filter((o) => o.tier === 'safe').length;
    const likely = evaluatedWebOptions.filter((o) => o.tier === 'likely').length;
    const ambitious = evaluatedWebOptions.filter((o) => o.tier === 'ambitious').length;
    const low = evaluatedWebOptions.filter((o) => o.tier === 'low').length;
    return { total, safe, likely, ambitious, low };
  }, [evaluatedWebOptions]);

  // Reorder web options
  const moveOption = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= webOptions.length) return;
    const copy = [...webOptions];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setWebOptions(copy);
  };

  // Delete web option
  const removeOption = (id) => {
    setWebOptions((prev) => prev.filter((o) => o.id !== id));
  };

  // Add newly chosen option
  const handleAddOption = () => {
    if (!newCollegeCode || !newBranchCode) return;
    // Prevent duplicate option
    const exists = webOptions.some(
      (o) => o.collegeCode === newCollegeCode && o.branchCode === newBranchCode
    );
    if (exists) {
      alert(`Option [${newCollegeCode} - ${newBranchCode}] is already in your preference list.`);
      return;
    }
    const newOpt = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      collegeCode: newCollegeCode,
      branchCode: newBranchCode,
    };
    setWebOptions((prev) => [...prev, newOpt]);
  };

  // Apply prebuilt strategy template
  const applyTemplate = (tpl) => {
    const newItems = tpl.options.map((opt, idx) => ({
      id: `opt-tpl-${Date.now()}-${idx}`,
      collegeCode: opt.collegeCode,
      branchCode: opt.branchCode,
    }));
    setWebOptions(newItems);
  };

  // Copy shareable web options strategy text
  const handleCopyStrategy = () => {
    const specialStr = selectedSpecialQuotas.length > 0 ? selectedSpecialQuotas.join(', ') : 'None (Standard Allotment)';
    const lines = [
      `==================================================`,
      `MAN OF STUDY (MOS) — TG EAPCET 2026 WEB OPTIONS STRATEGY`,
      `==================================================`,
      `Candidate Rank: #${userRank.toLocaleString()}`,
      `Category: ${caste} | Gender: ${gender === 'GIRLS' ? 'Girls Quota' : 'General/Boys Pool'} | Region: ${region}`,
      `Special Reservation Quota: ${specialStr}`,
      `Total Preferences: ${evaluatedWebOptions.length}`,
      `Safe Confirmed: ${strategyStats.safe} | Moderate Likely: ${strategyStats.likely} | Ambitious: ${strategyStats.ambitious} | Reach: ${strategyStats.low}`,
      `--------------------------------------------------`,
      ...evaluatedWebOptions.map((opt) => {
        const sign = opt.buffer >= 0 ? '+' : '';
        return `[Priority ${opt.priority}] ${opt.collegeCode} - ${opt.branchCode} (${opt.branchName})
   Closing Rank: #${opt.matchedClosingRank.toLocaleString()} | Buffer: ${sign}${opt.buffer.toLocaleString()}
   Status: ${opt.tierLabel.toUpperCase()}`;
      }),
      `--------------------------------------------------`,
      `Generated via MAN OF STUDY TG EAPCET College Predictor`,
      `Official 2026 Allotment Cutoff Dataset (71,646 Candidates)`,
      `https://manofstudy.com`,
      `==================================================`,
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedStrategy(true);
      setTimeout(() => setCopiedStrategy(false), 2500);
    });
  };

  // Download options as CSV
  const handleDownloadCsv = () => {
    const headers = ['Priority', 'College Code', 'College Name', 'Branch Code', 'Branch Name', 'Closing Rank', 'User Rank', 'Rank Buffer', 'Admission Probability'];
    const rows = evaluatedWebOptions.map((opt) => [
      opt.priority,
      opt.collegeCode,
      `"${opt.collegeName.replace(/"/g, '""')}"`,
      opt.branchCode,
      `"${opt.branchName.replace(/"/g, '""')}"`,
      opt.matchedClosingRank,
      userRank,
      opt.buffer,
      `"${opt.tierLabel}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TG_EAPCET_2026_Web_Options_Rank_${userRank}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // All college-branch combinations for Statewide College Scanner Mode
  const scannerResults = useMemo(() => {
    if (activeTab !== 'statewide-scanner') return [];

    const results = [];
    TG_EAPCET_COLLEGE_MANIFEST.forEach((college) => {
      college.branches.forEach((b) => {
        // Filter by branch
        if (scannerBranchFilter !== 'ALL' && b.branchCode !== scannerBranchFilter) {
          return;
        }

        // Filter by search query
        if (scannerSearchQuery) {
          const q = scannerSearchQuery.toLowerCase();
          const matchCode = college.collegeCode.toLowerCase().includes(q);
          const matchColName = college.collegeName.toLowerCase().includes(q);
          const matchBranchCode = b.branchCode.toLowerCase().includes(q);
          const matchBranchName = b.branchName.toLowerCase().includes(q);
          if (!matchCode && !matchColName && !matchBranchCode && !matchBranchName) {
            return;
          }
        }

        const evaluation = evaluateOption(college.collegeCode, b.branchCode);

        // Filter by admission probability
        if (scannerChanceFilter !== 'ALL' && evaluation.tier !== scannerChanceFilter) {
          return;
        }

        results.push(evaluation);
      });
    });

    return results;
  }, [activeTab, TG_EAPCET_COLLEGE_MANIFEST, scannerBranchFilter, scannerChanceFilter, scannerSearchQuery, userRank, caste, gender, region, selectedSpecialQuotas, collegeRecordCache]);

  const scannerTotalPages = Math.ceil(scannerResults.length / SCANNER_ITEMS_PER_PAGE) || 1;
  const paginatedScannerResults = useMemo(() => {
    const start = (scannerPage - 1) * SCANNER_ITEMS_PER_PAGE;
    return scannerResults.slice(start, start + SCANNER_ITEMS_PER_PAGE);
  }, [scannerResults, scannerPage]);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 tracking-tight">
                  TG EAPCET College Predictor
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Data-backed admission probability engine based on 71,646 official 2026 candidate allotments across 151 Telangana engineering colleges.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                2026 Phase-3 Data
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                151 Colleges Indexed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mobile-First User Input Parameter Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            Candidate Counselling Profile
          </span>
          <span className="text-[11px] text-slate-500">
            Real-time buffer recalculation
          </span>
        </div>

        {/* Primary Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rank Input with instant validation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Your TG EAPCET Rank</span>
              <span className="text-[10px] text-emerald-400 font-mono">1 to 400,000</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="400000"
                value={rankInputStr}
                onChange={(e) => handleRankChange(e.target.value)}
                placeholder="e.g. 14520"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 transition-all ${
                  rankError
                    ? 'border-rose-500 focus:ring-rose-500/50'
                    : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              <div className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">
                RANK
              </div>
            </div>
            {rankError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {rankError}
              </p>
            )}
            {/* Quick rank testing presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-[10px] text-slate-500 self-center mr-1">Presets:</span>
              {[7500, 14520, 28000, 48500, 85000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleRankChange(preset.toString())}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Social Category Dropdown with Official Telangana SC Sub-Categorization */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Caste / Social Category
            </label>
            <select
              value={caste}
              onChange={(e) => setCaste(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              {availableSocialCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">
              Supports true Telangana SC sub-categorization (SC-I, SC-II, SC-III) &amp; merit migration.
            </p>
          </div>

          {/* Gender Pool Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Gender Pool / Quota
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              {GENDER_POOLS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">
              Female candidates compete in both General and Girls quotas.
            </p>
          </div>

          {/* Region Jurisdiction */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Local Region Jurisdiction
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">
              Telangana districts fall under Osmania University (OU) local quota.
            </p>
          </div>
        </div>

        {/* 3. Special Reservation Quota Toggle (Optional) */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-slate-200">
                Special Reservation Quota (Optional)
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                {selectedSpecialQuotas.length === 0
                  ? 'Standard Seat Allotments'
                  : `${selectedSpecialQuotas.length} Selected`}
              </span>
            </div>

            {selectedSpecialQuotas.length > 0 && (
              <button
                type="button"
                onClick={clearAllSpecialQuotas}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset to Standard Seats</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            If no special quota is checked, the predictor evaluates <strong>standard general seat cutoffs</strong>. Select only if you possess official verified state reservation certificates (NCC, Defense CAP, Sports SG, or Physically Handicapped).
          </p>

          {/* Interactive Checkbox / Toggle Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-1">
            {SPECIAL_RESERVATION_OPTIONS.map((quota) => {
              const isSelected = selectedSpecialQuotas.includes(quota.id);
              return (
                <button
                  key={quota.id}
                  type="button"
                  onClick={() => toggleSpecialQuota(quota.id)}
                  title={quota.fullName}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${quota.badgeColor} bg-opacity-20 shadow-xs ring-1 ring-emerald-500/30`
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-mono font-bold">{quota.label}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate mt-1">
                    {quota.id === 'SPORTS' ? 'Sports/SG' : quota.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Navigation View Switcher (Web Options vs Statewide Scanner) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('web-options')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'web-options'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Web Options Strategy Matrix ({evaluatedWebOptions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('statewide-scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'statewide-scanner'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Statewide College Scanner (All 151 Colleges)</span>
          </button>
        </div>

        {/* Global summary badge for active rank */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Target Rank:</span>
          <span className="text-emerald-400 font-bold">#{userRank.toLocaleString()}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{caste}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{gender === 'GIRLS' ? 'Girls' : 'General'}</span>
          {selectedSpecialQuotas.length > 0 && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">{selectedSpecialQuotas.join('+')}</span>
            </>
          )}
        </div>
      </div>

      {/* 5. VIEW A: MULTI-PREFERENCE WEB OPTIONS BUILDER */}
      {activeTab === 'web-options' && (
        <div className="space-y-6">
          {/* Strategy Balance Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Options
              </span>
              <span className="text-lg font-black text-white font-mono">
                {strategyStats.total}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Safe (Buffer &gt; +2K)
              </span>
              <span className="text-lg font-black text-emerald-300 font-mono">
                {strategyStats.safe}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Likely (±2K)
              </span>
              <span className="text-lg font-black text-amber-300 font-mono">
                {strategyStats.likely}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider block flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Ambitious (-2K to -5K)
              </span>
              <span className="text-lg font-black text-purple-300 font-mono">
                {strategyStats.ambitious}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider block flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Dream Reach (&lt; -5K)
              </span>
              <span className="text-lg font-black text-rose-300 font-mono">
                {strategyStats.low}
              </span>
            </div>
          </div>

          {/* Quick Strategy Templates */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Fill Counselling Templates
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyStrategy}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedStrategy ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Strategy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {POPULAR_STRATEGY_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                    <span>{tpl.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1" />
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {tpl.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Add Option Selector Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Add New Option to Your Strategy Matrix
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* College Picker */}
              <div className="sm:col-span-6 relative" ref={collegePickerRef}>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Select College (151 Available)
                </label>
                <button
                  type="button"
                  onClick={() => setIsCollegePickerOpen(!isCollegePickerOpen)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">
                    <strong className="text-emerald-400 mr-1.5">[{newCollegeCode}]</strong>
                    {TG_EAPCET_COLLEGE_MANIFEST.find(
                      (c) => c.collegeCode.toUpperCase() === newCollegeCode.toUpperCase()
                    )?.collegeName || newCollegeCode}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>

                {isCollegePickerOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-full z-50 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-2 max-h-72 flex flex-col">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={collegeSearchQuery}
                        onChange={(e) => setCollegeSearchQuery(e.target.value)}
                        placeholder="Search college by code or name..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto space-y-1 flex-1 pr-1 text-xs">
                      {filteredColleges.map((c) => (
                        <button
                          key={c.collegeCode}
                          type="button"
                          onClick={() => {
                            setNewCollegeCode(c.collegeCode);
                            setIsCollegePickerOpen(false);
                            setCollegeSearchQuery('');
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                            c.collegeCode === newCollegeCode
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                              : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <span className="truncate pr-2">
                            <span className="font-mono font-bold text-emerald-400 mr-1.5">
                              {c.collegeCode}
                            </span>
                            {c.collegeName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {c.branchCount} br
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Branch Selector */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Select Branch ({availableBranchesForNewCollege.length} in this college)
                </label>
                <select
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  {availableBranchesForNewCollege.map((b) => (
                    <option key={b.branchCode} value={b.branchCode}>
                      {b.branchCode} - {b.branchName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
          </div>

          {/* Web Options Priority Order List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Prioritized Web Options Matrix &amp; Buffer Proof
              </span>
              <span className="text-[11px] text-slate-500">
                Move up &amp; down to adjust official preference priority
              </span>
            </div>

            {evaluatedWebOptions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 space-y-3">
                <Compass className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">No web options added to your strategy yet.</p>
                <p className="text-xs text-slate-500">
                  Select a college and branch above, or click one of the quick templates to auto-fill.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluatedWebOptions.map((opt, idx) => {
                  const Icon = opt.tierIcon;
                  const isPositive = opt.buffer >= 0;

                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border transition-all hover:border-slate-700 ${
                        opt.tier === 'safe'
                          ? 'border-emerald-500/30'
                          : opt.tier === 'likely'
                          ? 'border-amber-500/30'
                          : opt.tier === 'ambitious'
                          ? 'border-purple-500/30'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Priority Badge & College Details */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 shrink-0 font-mono text-xs font-black text-slate-200">
                            #{opt.priority}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {opt.collegeCode}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {opt.branchCode}
                              </span>
                              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug break-words">
                                {opt.collegeName}
                              </h4>
                            </div>

                            <p className="text-[11px] sm:text-xs text-slate-400 break-words">
                              {opt.branchName}
                            </p>
                          </div>
                        </div>

                        {/* Right: Cutoff, Buffer, Admission Probability, & Move Controls */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 justify-between sm:justify-end">
                          {/* Cutoff & Buffer Metrics */}
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-mono">
                              2026 Cutoff: <strong className="text-slate-200">#{opt.matchedClosingRank.toLocaleString()}</strong>
                            </div>
                            <div className="flex items-center gap-1.5 justify-end mt-0.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${opt.bufferBadgeColor}`}
                              >
                                {isPositive ? `+${opt.buffer.toLocaleString()} Buffer` : `${opt.buffer.toLocaleString()} Deficit`}
                              </span>
                            </div>
                          </div>

                          {/* Probability Tier Badge */}
                          <div className="shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${opt.tierBadgeColor}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="whitespace-nowrap">{opt.tierLabel}</span>
                            </span>
                          </div>

                          {/* Priority Reordering & Delete Controls */}
                          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveOption(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="Move Priority Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveOption(idx, 1)}
                              disabled={idx === evaluatedWebOptions.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="Move Priority Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeOption(opt.id)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors ml-1 cursor-pointer"
                              title="Remove Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Ground-Truth Data Verification Evidence */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-[11px] text-slate-400">
                        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="leading-relaxed flex-1">
                          {opt.groundTruthRecord ? (
                            <span>
                              In 2026 Phase-3 allotments, the last admitted candidate under{' '}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                                {opt.groundTruthRecord.seatCategory || opt.matchedCategoryLabel}
                              </span>{' '}
                              secured rank{' '}
                              <strong className="text-emerald-300 font-mono">
                                #{opt.groundTruthRecord.rank.toLocaleString()}
                              </strong>{' '}
                              at{' '}
                              <strong className="text-slate-200">
                                {opt.collegeName} ({opt.branchName})
                              </strong>
                              .{' '}
                              <span className="text-slate-500">
                                (Your rank #{userRank.toLocaleString()} yields {opt.buffer >= 0 ? `+${opt.buffer.toLocaleString()} rank buffer` : `${opt.buffer.toLocaleString()} deficit`})
                              </span>
                            </span>
                          ) : (
                            <span>
                              In 2026 Phase-3 allotments, the official closing cutoff for{' '}
                              <strong className="text-slate-200">{opt.branchName}</strong> at{' '}
                              <strong className="text-slate-200">{opt.collegeName}</strong> was{' '}
                              <strong className="text-emerald-300 font-mono">
                                #{opt.matchedClosingRank.toLocaleString()}
                              </strong>
                              .{' '}
                              <span className="text-slate-500">
                                (Your rank #{userRank.toLocaleString()} yields {opt.buffer >= 0 ? `+${opt.buffer.toLocaleString()} rank buffer` : `${opt.buffer.toLocaleString()} deficit`})
                              </span>
                            </span>
                          )}

                          {opt.specialQuotaFallbackUsed && (
                            <span className="block mt-1 text-[10px] text-amber-400/90 italic">
                              * No verified {selectedSpecialQuotas.join('/')} quota seat was allotted in this branch for 2026 Phase-3; evaluated against regular {caste} pool.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. VIEW B: STATEWIDE COLLEGE SCANNER ACROSS ALL 151 COLLEGES */}
      {activeTab === 'statewide-scanner' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                Filter All 151 Colleges for Rank #{userRank.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {scannerResults.length} Matching Engineering Programs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Branch code filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Engineering Branch
                </label>
                <select
                  value={scannerBranchFilter}
                  onChange={(e) => {
                    setScannerBranchFilter(e.target.value);
                    setScannerPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ALL">All Branches</option>
                  {uniqueBranches.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chance tier filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Admission Probability
                </label>
                <select
                  value={scannerChanceFilter}
                  onChange={(e) => {
                    setScannerChanceFilter(e.target.value);
                    setScannerPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ALL">All Chances</option>
                  <option value="safe">Very High Chance (Safe / Buffer &gt; +2,000)</option>
                  <option value="likely">Moderate / Likely (Within ±2,000)</option>
                  <option value="ambitious">Tough / Ambitious (-2,000 to -5,000)</option>
                  <option value="low">Low Chance (Dream Reach)</option>
                </select>
              </div>

              {/* Search Query */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Search College Code or Name
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={scannerSearchQuery}
                    onChange={(e) => {
                      setScannerSearchQuery(e.target.value);
                      setScannerPage(1);
                    }}
                    placeholder="e.g. CBIT, VNR, Vasavi, CVR..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid / Cards */}
          <div className="space-y-2.5">
            {paginatedScannerResults.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">No colleges matched your filters.</p>
                <p className="text-xs text-slate-500">
                  Try switching the probability filter to "All Chances" or clear the search query.
                </p>
              </div>
            ) : (
              paginatedScannerResults.map((item, idx) => {
                const Icon = item.tierIcon;
                const isAlreadyAdded = webOptions.some(
                  (o) => o.collegeCode === item.collegeCode && o.branchCode === item.branchCode
                );

                return (
                  <div
                    key={`${item.collegeCode}-${item.branchCode}-${idx}`}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.collegeCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {item.branchCode}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.collegeName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{item.branchName}</p>

                      {item.groundTruthRecord && (
                        <p className="text-[10px] text-slate-500 pt-0.5">
                          In 2026 Phase-3 allotments, the last admitted candidate under{' '}
                          <span className="text-amber-300 font-mono font-bold">
                            {item.groundTruthRecord.seatCategory}
                          </span>{' '}
                          secured rank #{item.groundTruthRecord.rank.toLocaleString()}.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Cutoff: #{item.matchedClosingRank.toLocaleString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border inline-block ${item.bufferBadgeColor}`}
                        >
                          {item.buffer >= 0 ? `+${item.buffer.toLocaleString()} Buffer` : `${item.buffer.toLocaleString()} Deficit`}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${item.tierBadgeColor}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{item.tierLabel}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (isAlreadyAdded) {
                            alert('This program is already in your Web Options Strategy matrix.');
                            return;
                          }
                          setWebOptions((prev) => [
                            ...prev,
                            {
                              id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                              collegeCode: item.collegeCode,
                              branchCode: item.branchCode,
                            },
                          ]);
                        }}
                        disabled={isAlreadyAdded}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          isAlreadyAdded
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs'
                        }`}
                      >
                        {isAlreadyAdded ? 'Added' : '+ Add Option'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination controls */}
          {scannerTotalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-500">
                Page {scannerPage} of {scannerTotalPages} ({scannerResults.length} programs)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setScannerPage((p) => Math.max(1, p - 1))}
                  disabled={scannerPage === 1}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setScannerPage((p) => Math.min(scannerTotalPages, p + 1))}
                  disabled={scannerPage === scannerTotalPages}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Technical Methodology & Supreme Court Merit Migration Explainer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-400" />
          How MAN OF STUDY Calculates Admission Probabilities &amp; Rank Buffers
        </h4>
        <p className="leading-relaxed">
          The <strong>Rank Buffer</strong> is mathematically defined as{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-950 text-emerald-300 font-mono text-[11px]">
            Rank Buffer = Matched Closing Rank − Candidate Rank
          </code>
          . A positive buffer represents safe margin beyond the closing cutoff, whereas a negative buffer represents an ambitious deficit.
        </p>
        <p className="leading-relaxed">
          Under constitutional reservation jurisprudence (Article 15/16 and the 103rd EWS Amendment) as detailed in Chapter 9 of the MOS Knowledge Hub, all reserved category candidates who score within the open category closing cutoff are allotted open competition seats without exhausting reserved quota pools. Female candidates are automatically evaluated in both General and 33.3% Girls horizontal reservation pools.
        </p>
      </div>
    </div>
  );
}
