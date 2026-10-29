import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export type AllotmentYear = '2026' | '2025';
export type PhaseFilter = 'ALL' | '1' | '2' | '3';

export interface AllotmentRecord {
  rank: number;
  cand_name: string;
  gender: string;
  category: string;
  region: string;
  alloted_category: string;
  phase: number;
  college_code: string;
  college_name: string;
  branch_code: string;
  branch_name: string;
  fee_with_exemption?: number;
  fee_with_no_exemption?: number;
  left_over_seats?: number | null;
  total_seats?: number | null;
  roll_no?: string;
  district?: string;
  course_type?: string;
}

export interface CollegeIndexEntry {
  college_name: string;
  college_code: string;
  file: string;
  records?: number;
}

export interface CollegeDetailData {
  college_code: string;
  college_name: string;
  file: string;
  year: AllotmentYear;
  recordCount: number;
  branchCount: number;
  branches: Array<{
    branch_code: string;
    branch_name: string;
    recordCount: number;
    bestRank: number;
    lastRank: number;
    records: AllotmentRecord[];
  }>;
  allRecords: AllotmentRecord[];
  district?: string;
  isMissing?: boolean;
}

export interface CategoryRankInsight {
  category: string;
  bestRank: number;
  lastRank: number;
  studentCount: number;
  maleCount: number;
  femaleCount: number;
}

export interface AllottedCategoryInsight {
  allottedCategory: string;
  bestRank: number;
  lastRank: number;
  count: number;
}

export interface CollegeDashboardAnalytics {
  collegeName: string;
  collegeCode: string;
  year: AllotmentYear;
  totalAllotments: number;
  branchCount: number;
  bestOverallRank: number;
  lastOverallRank: number;
  medianRank: number;
  branches: Array<{
    branchCode: string;
    branchName: string;
    allotmentCount: number;
    bestRank: number;
    lastRank: number;
  }>;
  categoryInsights: CategoryRankInsight[];
  allottedCategoryInsights: AllottedCategoryInsight[];
  genderDistribution: {
    male: number;
    female: number;
    other: number;
    malePct: number;
    femalePct: number;
  };
  phaseDistribution: Record<number, number>;
  regionDistribution: Record<string, number>;
}

export interface AggregatedDatasetStats {
  year: AllotmentYear;
  totalSeats: number;
  totalColleges: number;
  medianRank: number;
  activePhaseSummary: string;
  bestRank: number;
  lastRank: number;
  phases: number[];
}

export interface SearchCandidateIndexItem {
  r: number; // rank
  n: string; // name
  g: string; // gender
  c: string; // category
  ac: string; // alloted_category
  rg: string; // region
  p: number; // phase
  cc: string; // college code
  bc: string; // branch code
  ro?: string; // roll no
  d?: string; // district
}

export interface SearchIndexPayload {
  candidates: SearchCandidateIndexItem[];
  branchMap: Record<string, string>;
  collegeMap: Record<string, string>;
  totalRecords?: number;
}

// In-memory client caching keyed by ${year}_${collegeCode} or ${year}
const indexCache = new Map<AllotmentYear, CollegeIndexEntry[]>();
const indexPromiseCache = new Map<AllotmentYear, Promise<CollegeIndexEntry[]>>();

const detailCache = new Map<string, CollegeDetailData>();
const detailPromiseCache = new Map<string, Promise<CollegeDetailData | null>>();

const searchIndexDataCache = new Map<AllotmentYear, SearchIndexPayload>();
const searchIndexPromiseCache = new Map<AllotmentYear, Promise<SearchIndexPayload | null>>();

export function getBasePath(year: AllotmentYear): string {
  return year === '2026'
    ? '/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE'
    : '/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE';
}

/**
 * Fetch and cache the college index for selected year
 */
export async function fetchCollegesIndex(year: AllotmentYear): Promise<CollegeIndexEntry[]> {
  if (indexCache.has(year)) {
    return indexCache.get(year)!;
  }
  if (indexPromiseCache.has(year)) {
    return indexPromiseCache.get(year)!;
  }

  const promise = (async () => {
    try {
      const basePath = getBasePath(year);
      const res = await fetch(`${basePath}/index.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${year} index`);
      const data = await res.json();
      const list: CollegeIndexEntry[] = (data.colleges || [])
        .map((c: any) => ({
          college_name: String(c.college_name || c.collegeCode || 'Unknown AP College').trim(),
          college_code: String(c.college_code || c.inst_code || '').toUpperCase().trim(),
          file: String(c.file || `${c.college_code}.json`).trim(),
          records: typeof c.records === 'number' ? c.records : undefined,
        }))
        .filter((c: CollegeIndexEntry) => Boolean(c.college_code) && c.college_code !== 'CBIT');

      indexCache.set(year, list);
      return list;
    } catch (err) {
      console.warn(`Failed to fetch ${year} index.json:`, err);
      return [];
    } finally {
      indexPromiseCache.delete(year);
    }
  })();

  indexPromiseCache.set(year, promise);
  return promise;
}

/**
 * Fetch and cache full college allotment data
 */
export async function fetchCollegeDetail(
  year: AllotmentYear,
  collegeCode: string
): Promise<CollegeDetailData | null> {
  const code = (collegeCode || '').toUpperCase().trim();
  if (!code || code === 'ALL') return null;

  const cacheKey = `${year}_${code}`;
  if (detailCache.has(cacheKey)) {
    return detailCache.get(cacheKey)!;
  }
  if (detailPromiseCache.has(cacheKey)) {
    return detailPromiseCache.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const basePath = getBasePath(year);
      const colleges = await fetchCollegesIndex(year);
      const meta = colleges.find((c) => c.college_code === code);
      const fileName = meta?.file || `${code}.json`;

      const res = await fetch(`${basePath}/${fileName}`);
      if (!res.ok) {
        return null;
      }

      const raw = await res.json();
      const college_code = String(raw.college_code || code).toUpperCase().trim();
      const college_name = String(raw.college_name || meta?.college_name || code).trim();
      const allRecords: AllotmentRecord[] = [];
      const branchMap = new Map<string, { name: string; records: AllotmentRecord[] }>();

      const addRecord = (r: any, bCode?: string, bName?: string) => {
        const rawRank = parseFloat(String(r.rank ?? '').replace(/,/g, ''));
        const rank = !isNaN(rawRank) && isFinite(rawRank) ? Math.round(rawRank) : 0;
        if (rank <= 0) return;

        let phase = 1;
        if (typeof r.phase === 'number') phase = r.phase;
        else if (typeof r.phase === 'string') {
          const m = r.phase.match(/\d+/);
          phase = m ? parseInt(m[0], 10) : 1;
        }

        const candName = String(
          r.cand_name ||
            r.applicant_name ||
            r.candidateName ||
            (r.first_name_blurred ? `${r.first_name_blurred} ${r.last_name_visible || ''}`.trim() : '') ||
            'Candidate'
        ).trim();

        const branch_code = String(r.branch_code || bCode || 'UNKNOWN').toUpperCase().trim();
        const branch_name = String(r.branch_name || bName || branch_code).trim();

        const item: AllotmentRecord = {
          rank,
          cand_name: candName,
          gender: String(r.gender || '—').trim().toUpperCase(),
          category: String(r.community || r.category || 'OC').trim().toUpperCase(),
          region: String(r.region || 'AU').trim().toUpperCase(),
          alloted_category: String(r.allot_category || r.alloted_category || r.seatCategory || '—').trim().toUpperCase(),
          phase,
          college_code,
          college_name,
          branch_code,
          branch_name,
          fee_with_exemption: typeof r.fee_with_exemption === 'number' ? r.fee_with_exemption : undefined,
          fee_with_no_exemption: typeof r.fee_with_no_exemption === 'number' ? r.fee_with_no_exemption : undefined,
          roll_no: r.roll_no ? String(r.roll_no).trim() : undefined,
          district: r.district ? String(r.district).trim() : undefined,
          course_type: r.course_type ? String(r.course_type).trim() : undefined,
          total_seats: r.total_seats,
          left_over_seats: r.left_over_seats,
        };

        allRecords.push(item);

        if (!branchMap.has(branch_code)) {
          branchMap.set(branch_code, { name: branch_name, records: [] });
        }
        branchMap.get(branch_code)!.records.push(item);
      };

      if (Array.isArray(raw.branches)) {
        for (const b of raw.branches) {
          if (Array.isArray(b.records)) {
            for (const r of b.records) {
              addRecord(r, b.branch_code, b.branch_name);
            }
          }
        }
      } else if (Array.isArray(raw.records)) {
        for (const r of raw.records) {
          addRecord(r);
        }
      }

      allRecords.sort((a, b) => a.rank - b.rank);

      const branches = Array.from(branchMap.entries()).map(([bCode, bData]) => {
        bData.records.sort((a, b) => a.rank - b.rank);
        return {
          branch_code: bCode,
          branch_name: bData.name,
          recordCount: bData.records.length,
          bestRank: bData.records.length > 0 ? bData.records[0].rank : 0,
          lastRank: bData.records.length > 0 ? bData.records[bData.records.length - 1].rank : 0,
          records: bData.records,
        };
      }).sort((a, b) => a.branch_code.localeCompare(b.branch_code));

      const parsed: CollegeDetailData = {
        college_code,
        college_name,
        file: fileName,
        year,
        recordCount: allRecords.length,
        branchCount: branches.length,
        branches,
        allRecords,
        district: raw.district,
      };

      detailCache.set(cacheKey, parsed);
      return parsed;
    } catch (err) {
      console.warn(`Error loading ${year} college ${code}:`, err);
      return null;
    } finally {
      detailPromiseCache.delete(cacheKey);
    }
  })();

  detailPromiseCache.set(cacheKey, promise);
  return promise;
}

/**
 * Fetch and cache search index for candidate search across ALL colleges
 */
export async function fetchSearchIndex(year: AllotmentYear): Promise<SearchIndexPayload | null> {
  if (searchIndexDataCache.has(year)) {
    return searchIndexDataCache.get(year)!;
  }
  if (searchIndexPromiseCache.has(year)) {
    return searchIndexPromiseCache.get(year)!;
  }

  const promise = (async () => {
    try {
      const basePath = getBasePath(year);
      const res = await fetch(`${basePath}/search_index.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SearchIndexPayload = await res.json();
      searchIndexDataCache.set(year, data);
      return data;
    } catch (err) {
      console.warn(`Failed to load ${year} search_index.json:`, err);
      return null;
    } finally {
      searchIndexPromiseCache.delete(year);
    }
  })();

  searchIndexPromiseCache.set(year, promise);
  return promise;
}

/**
 * Compute detailed analytics for a single college, respecting the phase filter
 */
export function computeCollegeDashboardAnalytics(
  collegeData: CollegeDetailData,
  phaseFilter: PhaseFilter = 'ALL'
): CollegeDashboardAnalytics {
  const targetPhase = phaseFilter !== 'ALL' ? parseInt(phaseFilter, 10) : null;
  const filteredRecords = targetPhase
    ? collegeData.allRecords.filter((r) => r.phase === targetPhase)
    : collegeData.allRecords;

  const totalAllotments = filteredRecords.length;
  const bestOverallRank = totalAllotments > 0 ? Math.min(...filteredRecords.map((r) => r.rank)) : 0;
  const lastOverallRank = totalAllotments > 0 ? Math.max(...filteredRecords.map((r) => r.rank)) : 0;

  const sortedRanks = filteredRecords.map((r) => r.rank).sort((a, b) => a - b);
  const medianRank =
    sortedRanks.length > 0 ? sortedRanks[Math.floor(sortedRanks.length / 2)] : 0;

  // Branch summaries
  const branchMap = new Map<string, { name: string; records: AllotmentRecord[] }>();
  filteredRecords.forEach((r) => {
    if (!branchMap.has(r.branch_code)) {
      branchMap.set(r.branch_code, { name: r.branch_name, records: [] });
    }
    branchMap.get(r.branch_code)!.records.push(r);
  });

  const branches = Array.from(branchMap.entries()).map(([code, data]) => {
    data.records.sort((a, b) => a.rank - b.rank);
    return {
      branchCode: code,
      branchName: data.name,
      allotmentCount: data.records.length,
      bestRank: data.records[0].rank,
      lastRank: data.records[data.records.length - 1].rank,
    };
  }).sort((a, b) => a.branchCode.localeCompare(b.branchCode));

  // Category insights
  const catMap = new Map<string, AllotmentRecord[]>();
  filteredRecords.forEach((r) => {
    const c = r.category || 'OC';
    if (!catMap.has(c)) catMap.set(c, []);
    catMap.get(c)!.push(r);
  });

  const categoryInsights: CategoryRankInsight[] = Array.from(catMap.entries()).map(
    ([category, recs]) => {
      recs.sort((a, b) => a.rank - b.rank);
      let maleCount = 0;
      let femaleCount = 0;
      recs.forEach((r) => {
        if (r.gender === 'M') maleCount++;
        else if (r.gender === 'F') femaleCount++;
      });
      return {
        category,
        bestRank: recs[0].rank,
        lastRank: recs[recs.length - 1].rank,
        studentCount: recs.length,
        maleCount,
        femaleCount,
      };
    }
  ).sort((a, b) => a.category.localeCompare(b.category));

  // Allotted category breakdown
  const allotMap = new Map<string, AllotmentRecord[]>();
  filteredRecords.forEach((r) => {
    const ac = r.alloted_category || '—';
    if (!allotMap.has(ac)) allotMap.set(ac, []);
    allotMap.get(ac)!.push(r);
  });

  const allottedCategoryInsights: AllottedCategoryInsight[] = Array.from(allotMap.entries()).map(
    ([allottedCategory, recs]) => {
      recs.sort((a, b) => a.rank - b.rank);
      return {
        allottedCategory,
        bestRank: recs[0].rank,
        lastRank: recs[recs.length - 1].rank,
        count: recs.length,
      };
    }
  ).sort((a, b) => b.count - a.count);

  // Gender & Region distributions
  let male = 0;
  let female = 0;
  let other = 0;
  const phaseDistribution: Record<number, number> = {};
  const regionDistribution: Record<string, number> = {};

  filteredRecords.forEach((r) => {
    if (r.gender === 'M') male++;
    else if (r.gender === 'F') female++;
    else other++;

    phaseDistribution[r.phase] = (phaseDistribution[r.phase] || 0) + 1;
    const reg = r.region || 'AU';
    regionDistribution[reg] = (regionDistribution[reg] || 0) + 1;
  });

  const malePct = totalAllotments > 0 ? Math.round((male / totalAllotments) * 100) : 0;
  const femalePct = totalAllotments > 0 ? Math.round((female / totalAllotments) * 100) : 0;

  return {
    collegeName: collegeData.college_name,
    collegeCode: collegeData.college_code,
    year: collegeData.year,
    totalAllotments,
    branchCount: branches.length,
    bestOverallRank,
    lastOverallRank,
    medianRank,
    branches,
    categoryInsights,
    allottedCategoryInsights,
    genderDistribution: { male, female, other, malePct, femalePct },
    phaseDistribution,
    regionDistribution,
  };
}

/**
 * Compute Aggregated statistics across all colleges for the active year and phase
 */
export function computeAggregatedStats(
  year: AllotmentYear,
  collegesList: CollegeIndexEntry[],
  searchIndex: SearchIndexPayload | null,
  phaseFilter: PhaseFilter
): AggregatedDatasetStats {
  const targetPhase = phaseFilter !== 'ALL' ? parseInt(phaseFilter, 10) : null;
  const phases = year === '2026' ? [1, 2, 3] : [1, 2];

  if (!searchIndex || !searchIndex.candidates || searchIndex.candidates.length === 0) {
    const totalSeats = collegesList.reduce((acc, c) => acc + (c.records || 0), 0);
    return {
      year,
      totalSeats: totalSeats || (year === '2026' ? 111358 : 119616),
      totalColleges: collegesList.length,
      medianRank: 45000,
      activePhaseSummary: phaseFilter === 'ALL' ? `All Phases (${phases.join(', ')})` : `Phase ${phaseFilter}`,
      bestRank: 1,
      lastRank: 175000,
      phases,
    };
  }

  const cands = targetPhase
    ? searchIndex.candidates.filter((c) => c.p === targetPhase)
    : searchIndex.candidates;

  const totalSeats = cands.length;
  const bestRank = totalSeats > 0 ? cands[0].r : 1;
  const lastRank = totalSeats > 0 ? cands[totalSeats - 1].r : 175000;
  const medianRank = totalSeats > 0 ? cands[Math.floor(totalSeats / 2)].r : 45000;

  return {
    year,
    totalSeats,
    totalColleges: collegesList.length,
    medianRank,
    activePhaseSummary: phaseFilter === 'ALL' ? `All Phases (${phases.join(', ')})` : `Phase ${phaseFilter}`,
    bestRank,
    lastRank,
    phases,
  };
}

export interface UseApAllotmentDataOptions {
  selectedYear: AllotmentYear;
  selectedPhase: PhaseFilter;
  selectedCollegeCode: string;
  selectedBranchCode: string;
  studentSearchQuery?: string;
  categoryFilter?: string;
  allottedCategoryFilter?: string;
  genderFilter?: string;
  regionFilter?: string;
  minRank?: number | null;
  maxRank?: number | null;
  sortBy?: 'RANK_ASC' | 'RANK_DESC' | 'NAME_ASC';
  currentPage?: number;
  pageSize?: number;
}

export function useApAllotmentData({
  selectedYear,
  selectedPhase,
  selectedCollegeCode,
  selectedBranchCode,
  studentSearchQuery = '',
  categoryFilter = 'ALL',
  allottedCategoryFilter = 'ALL',
  genderFilter = 'ALL',
  regionFilter = 'ALL',
  minRank = null,
  maxRank = null,
  sortBy = 'RANK_ASC',
  currentPage = 1,
  pageSize = 30,
}: UseApAllotmentDataOptions) {
  const [collegesList, setCollegesList] = useState<CollegeIndexEntry[]>([]);
  const [isLoadingCollegesIndex, setIsLoadingCollegesIndex] = useState(true);

  const [selectedCollegeData, setSelectedCollegeData] = useState<CollegeDetailData | null>(null);
  const [isLoadingCollegeData, setIsLoadingCollegeData] = useState(false);
  const [collegeLoadError, setCollegeLoadError] = useState<string | null>(null);

  const [searchIndexPayload, setSearchIndexPayload] = useState<SearchIndexPayload | null>(null);

  // Search Results
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AllotmentRecord[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Load colleges index whenever selectedYear changes
  useEffect(() => {
    let alive = true;
    setIsLoadingCollegesIndex(true);
    fetchCollegesIndex(selectedYear)
      .then((list) => {
        if (alive) {
          setCollegesList(list);
          setIsLoadingCollegesIndex(false);
        }
      })
      .catch(() => {
        if (alive) {
          setCollegesList([]);
          setIsLoadingCollegesIndex(false);
        }
      });

    // Also preload the search index for this year in background
    fetchSearchIndex(selectedYear).then((s) => {
      if (alive && s) setSearchIndexPayload(s);
    });

    return () => {
      alive = false;
    };
  }, [selectedYear]);

  // 2. Load detailed college data when selectedCollegeCode is specific
  useEffect(() => {
    if (!selectedCollegeCode || selectedCollegeCode === 'ALL') {
      setSelectedCollegeData(null);
      setCollegeLoadError(null);
      setIsLoadingCollegeData(false);
      return;
    }

    let alive = true;
    setIsLoadingCollegeData(true);
    setCollegeLoadError(null);

    fetchCollegeDetail(selectedYear, selectedCollegeCode)
      .then((data) => {
        if (!alive) return;
        if (!data || data.allRecords.length === 0) {
          setSelectedCollegeData(null);
          setCollegeLoadError(
            `No official ${selectedYear} allotment records were found in the dataset for [${selectedCollegeCode}]. It may not have participated in this round.`
          );
        } else {
          setSelectedCollegeData(data);
          setCollegeLoadError(null);
        }
      })
      .catch(() => {
        if (alive) {
          setSelectedCollegeData(null);
          setCollegeLoadError(`Failed to load data for college [${selectedCollegeCode}].`);
        }
      })
      .finally(() => {
        if (alive) setIsLoadingCollegeData(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedYear, selectedCollegeCode]);

  // 3. College Analytics (memoized)
  const collegeAnalytics = useMemo(() => {
    if (!selectedCollegeData) return null;
    return computeCollegeDashboardAnalytics(selectedCollegeData, selectedPhase);
  }, [selectedCollegeData, selectedPhase]);

  // 4. Aggregated Statewide Stats (when college === 'ALL')
  const aggregatedStats = useMemo(() => {
    return computeAggregatedStats(
      selectedYear,
      collegesList,
      searchIndexPayload,
      selectedPhase
    );
  }, [selectedYear, collegesList, searchIndexPayload, selectedPhase]);

  // 5. Query execution with 150ms debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeFilter = useCallback(async () => {
    setIsSearching(true);
    try {
      const targetPhase = selectedPhase !== 'ALL' ? parseInt(selectedPhase, 10) : null;
      const targetCategory = categoryFilter !== 'ALL' ? categoryFilter.toUpperCase() : null;
      const targetAllotted =
        allottedCategoryFilter !== 'ALL' ? allottedCategoryFilter.toUpperCase() : null;
      const targetGender = genderFilter !== 'ALL' ? genderFilter.toUpperCase() : null;
      const targetRegion = regionFilter !== 'ALL' ? regionFilter.toUpperCase() : null;
      const targetBranch =
        selectedBranchCode && selectedBranchCode !== 'ALL'
          ? selectedBranchCode.toUpperCase()
          : null;
      const nameQueryClean = (studentSearchQuery || '').toUpperCase().trim();

      let matchedRecords: AllotmentRecord[] = [];

      // A) If a single college is selected, query directly from collegeDetail
      if (selectedCollegeCode !== 'ALL') {
        const colData =
          selectedCollegeData || (await fetchCollegeDetail(selectedYear, selectedCollegeCode));
        if (colData && colData.allRecords.length > 0) {
          matchedRecords = colData.allRecords.filter((r) => {
            if (targetPhase !== null && r.phase !== targetPhase) return false;
            if (targetBranch !== null && r.branch_code !== targetBranch) return false;
            if (minRank !== null && minRank > 0 && r.rank < minRank) return false;
            if (maxRank !== null && maxRank > 0 && r.rank > maxRank) return false;
            if (targetCategory && !r.category.includes(targetCategory)) return false;
            if (targetAllotted && !r.alloted_category.includes(targetAllotted)) return false;
            if (targetGender && r.gender !== targetGender) return false;
            if (targetRegion && r.region !== targetRegion) return false;
            if (nameQueryClean) {
              const nameMatch = r.cand_name.toUpperCase().includes(nameQueryClean);
              const rankMatch = String(r.rank) === nameQueryClean;
              const rollMatch = r.roll_no ? r.roll_no.toUpperCase().includes(nameQueryClean) : false;
              if (!nameMatch && !rankMatch && !rollMatch) return false;
            }
            return true;
          });
        }
      } else {
        // B) Statewide 'ALL' search using pre-indexed candidates
        const sIndex = searchIndexPayload || (await fetchSearchIndex(selectedYear));
        if (sIndex && sIndex.candidates) {
          const { candidates, branchMap, collegeMap } = sIndex;
          const out: AllotmentRecord[] = [];

          for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            const rPhase = c.p;
            const rRank = c.r;
            const rBranch = c.bc;
            const rCat = c.c;
            const rAllot = c.ac;
            const rGender = c.g;
            const rRegion = c.rg;

            if (targetPhase !== null && rPhase !== targetPhase) continue;
            if (targetBranch !== null && rBranch !== targetBranch) continue;
            if (minRank !== null && minRank > 0 && rRank < minRank) continue;
            if (maxRank !== null && maxRank > 0 && rRank > maxRank) continue;
            if (targetCategory && !rCat.includes(targetCategory)) continue;
            if (targetAllotted && !rAllot.includes(targetAllotted)) continue;
            if (targetGender && rGender !== targetGender) continue;
            if (targetRegion && rRegion !== targetRegion) continue;

            if (nameQueryClean) {
              const nameMatch = c.n.includes(nameQueryClean);
              const rankMatch = String(rRank) === nameQueryClean;
              const rollMatch = c.ro ? c.ro.includes(nameQueryClean) : false;
              if (!nameMatch && !rankMatch && !rollMatch) continue;
            }

            out.push({
              rank: rRank,
              cand_name: c.n,
              gender: rGender,
              category: rCat,
              alloted_category: rAllot,
              region: rRegion,
              phase: rPhase,
              college_code: c.cc,
              college_name: collegeMap[c.cc] || c.cc,
              branch_code: rBranch,
              branch_name: branchMap[rBranch] || rBranch,
              roll_no: c.ro,
              district: c.d,
            });
          }
          matchedRecords = out;
        }
      }

      // Sorting
      if (sortBy === 'RANK_DESC') {
        matchedRecords.sort((a, b) => b.rank - a.rank);
      } else if (sortBy === 'NAME_ASC') {
        matchedRecords.sort((a, b) => a.cand_name.localeCompare(b.cand_name));
      } else {
        matchedRecords.sort((a, b) => a.rank - b.rank);
      }

      const total = matchedRecords.length;
      const pages = Math.ceil(total / pageSize) || 1;
      const validPage = Math.max(1, Math.min(currentPage, pages));
      const start = (validPage - 1) * pageSize;
      const pageSlice = matchedRecords.slice(start, start + pageSize);

      setTotalMatches(total);
      setTotalPages(pages);
      setSearchResults(pageSlice);
    } catch (err) {
      console.warn('Search execution error in useApAllotmentData:', err);
      setSearchResults([]);
      setTotalMatches(0);
      setTotalPages(1);
    } finally {
      setIsSearching(false);
    }
  }, [
    selectedYear,
    selectedPhase,
    selectedCollegeCode,
    selectedBranchCode,
    selectedCollegeData,
    searchIndexPayload,
    studentSearchQuery,
    categoryFilter,
    allottedCategoryFilter,
    genderFilter,
    regionFilter,
    minRank,
    maxRank,
    sortBy,
    currentPage,
    pageSize,
  ]);

  // Trigger search with 150ms debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      executeFilter();
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [executeFilter]);

  return {
    collegesList,
    isLoadingCollegesIndex,
    selectedCollegeData,
    isLoadingCollegeData,
    collegeLoadError,
    collegeAnalytics,
    aggregatedStats,
    searchResults,
    totalMatches,
    totalPages,
    isSearching,
    refetch: executeFilter,
  };
}
