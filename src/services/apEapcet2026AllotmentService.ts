/**
 * AP EAPCET 2026 College-Wise Allotment Service
 * Grounded in official AP EAPCET 2026 allotment records (102K+ records, 335 colleges, 3 phases).
 * Also supports 2025 allotment data through the Year selector.
 */

export interface AllotmentRecord2026 {
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
  records: number;
}

export interface CollegeDetailData2026 {
  college_code: string;
  college_name: string;
  file: string;
  recordCount: number;
  branchCount: number;
  branches: Array<{
    branch_code: string;
    branch_name: string;
    recordCount: number;
    bestRank: number;
    lastRank: number;
    records: AllotmentRecord2026[];
  }>;
  allRecords: AllotmentRecord2026[];
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

export interface SearchOptions2026 {
  year?: '2026' | '2025';
  phase?: 'ALL' | 1 | 2 | 3 | string;
  collegeCode?: string;
  branchCode?: string;
  nameQuery?: string;
  minRank?: number | null;
  maxRank?: number | null;
  category?: string;
  allottedCategory?: string;
  gender?: string;
  region?: string;
  sortBy?: 'RANK_ASC' | 'RANK_DESC' | 'NAME_ASC';
  page?: number;
  pageSize?: number;
}

export interface SearchResult2026 {
  totalMatches: number;
  page: number;
  pageSize: number;
  totalPages: number;
  records: AllotmentRecord2026[];
  isTruncated: boolean;
}

// In-memory caches
let cachedIndex2026: CollegeIndexEntry[] | null = null;
let indexFetchPromise2026: Promise<CollegeIndexEntry[]> | null = null;

const collegeCache2026 = new Map<string, CollegeDetailData2026>();
const collegeCache2025 = new Map<string, CollegeDetailData2026>();

let cachedSearchIndex2026: {
  candidates: Array<[number, string, string, string, string, string, number, string, string, number, number, number | null, number | null, string]>;
  branchMap: Record<string, string>;
  collegeMap: Record<string, string>;
} | null = null;
let searchIndexFetchPromise2026: Promise<boolean> | null = null;

let cachedSearchIndex2025: {
  candidates: Array<[number, string, string, string, string, string, number, string, string]>;
  branchMap: Record<string, string>;
} | null = null;
let searchIndexFetchPromise2025: Promise<boolean> | null = null;

/**
 * Normalizes text for case-insensitive searching
 */
export function normalizeSearchQuery(text: string): string {
  return (text || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Loads the 335 college list from public/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/index.json
 */
export async function load2026CollegesIndex(): Promise<CollegeIndexEntry[]> {
  if (cachedIndex2026) return cachedIndex2026;
  if (indexFetchPromise2026) return indexFetchPromise2026;

  indexFetchPromise2026 = (async () => {
    try {
      const res = await fetch('/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/index.json');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const list: CollegeIndexEntry[] = (data.colleges || []).map((c: any) => ({
        college_name: c.college_name || c.collegeCode || 'Unknown College',
        college_code: (c.college_code || c.inst_code || '').toUpperCase().trim(),
        file: c.file || `${c.college_code}.json`,
        records: c.records || 0,
      }));
      cachedIndex2026 = list;
      return list;
    } catch (err) {
      console.warn('Could not load 2026 index.json, falling back to empty list:', err);
      return [];
    } finally {
      indexFetchPromise2026 = null;
    }
  })();

  return indexFetchPromise2026;
}

/**
 * Preload 2026 search index
 */
export async function preloadSearchIndex2026(): Promise<boolean> {
  if (cachedSearchIndex2026) return true;
  if (searchIndexFetchPromise2026) return searchIndexFetchPromise2026;

  searchIndexFetchPromise2026 = (async () => {
    try {
      const res = await fetch('/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/search_index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedSearchIndex2026 = {
        candidates: data.candidates || [],
        branchMap: data.branchMap || {},
        collegeMap: data.collegeMap || {},
      };
      return true;
    } catch (err) {
      console.warn('Could not load 2026 search index:', err);
      return false;
    } finally {
      searchIndexFetchPromise2026 = null;
    }
  })();

  return searchIndexFetchPromise2026;
}

/**
 * Preload 2025 search index
 */
export async function preloadSearchIndex2025(): Promise<boolean> {
  if (cachedSearchIndex2025) return true;
  if (searchIndexFetchPromise2025) return searchIndexFetchPromise2025;

  searchIndexFetchPromise2025 = (async () => {
    try {
      const res = await fetch('/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/search_index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedSearchIndex2025 = {
        candidates: data.candidates || [],
        branchMap: data.branchMap || {},
      };
      return true;
    } catch (err) {
      console.warn('Could not load 2025 search index:', err);
      return false;
    } finally {
      searchIndexFetchPromise2025 = null;
    }
  })();

  return searchIndexFetchPromise2025;
}

/**
 * Loads a specific college's full JSON file with robust parsing for both 2026 formats.
 */
export async function getCollegeDetails2026(
  collegeCode: string,
  year: '2026' | '2025' = '2026'
): Promise<CollegeDetailData2026 | null> {
  const code = (collegeCode || '').toUpperCase().trim();
  if (!code || code === 'ALL') return null;

  const targetCache = year === '2025' ? collegeCache2025 : collegeCache2026;
  if (targetCache.has(code)) {
    return targetCache.get(code)!;
  }

  const baseFolder =
    year === '2025'
      ? '/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE'
      : '/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE';

  // Find file name from index or fallback to ${code}.json
  let fileName = `${code}.json`;
  let collegeName = code;

  if (year === '2026') {
    const colleges = await load2026CollegesIndex();
    const found = colleges.find((c) => c.college_code.toUpperCase() === code);
    if (found) {
      fileName = found.file;
      collegeName = found.college_name;
    }
  }

  try {
    const res = await fetch(`${baseFolder}/${fileName}`);
    if (!res.ok) {
      // Gracefully handle missing file
      const emptyData: CollegeDetailData2026 = {
        college_code: code,
        college_name: collegeName,
        file: fileName,
        recordCount: 0,
        branchCount: 0,
        branches: [],
        allRecords: [],
        isMissing: true,
      };
      targetCache.set(code, emptyData);
      return emptyData;
    }

    const rawData = await res.json();
    const finalCollegeCode = (rawData.college_code || code).toUpperCase();
    const finalCollegeName = rawData.college_name || collegeName;

    const allRecords: AllotmentRecord2026[] = [];
    const branchMap = new Map<
      string,
      {
        branch_code: string;
        branch_name: string;
        records: AllotmentRecord2026[];
        bestRank: number;
        lastRank: number;
      }
    >();

    const parseRecord = (r: any, defaultBranchCode = '', defaultBranchName = '') => {
      const numRank = parseFloat(String(r.rank ?? '').replace(/,/g, ''));
      const rank = !isNaN(numRank) && isFinite(numRank) && numRank > 0 ? Math.round(numRank) : 0;

      const cand_name = String(
        r.applicant_name ||
          r.cand_name ||
          r.candidateName ||
          (r.first_name_blurred ? `${r.first_name_blurred} ${r.last_name_visible || ''}`.trim() : '') ||
          'Candidate'
      ).trim();

      const gender = String(r.gender || '—').trim().toUpperCase();
      const category = String(r.community || r.category || 'OC').trim().toUpperCase();
      const region = String(r.region || 'AU').trim().toUpperCase();
      const alloted_category = String(
        r.allot_category || r.alloted_category || r.seatCategory || '—'
      ).trim().toUpperCase();

      let phase = 1;
      if (typeof r.phase === 'number') phase = r.phase;
      else if (typeof r.phase === 'string') {
        const lower = r.phase.toLowerCase();
        if (lower.includes('first') || lower === '1') phase = 1;
        else if (lower.includes('second') || lower === '2') phase = 2;
        else if (lower.includes('third') || lower.includes('final') || lower === '3') phase = 3;
      }

      const branch_code = String(r.branch_code || defaultBranchCode || '').trim().toUpperCase();
      const branch_name = String(r.branch_name || defaultBranchName || branch_code).trim();

      const fee_with_exemption =
        typeof r.fee_with_exemption === 'number'
          ? r.fee_with_exemption
          : r.fee_with_exemption
          ? Number(r.fee_with_exemption)
          : undefined;

      const fee_with_no_exemption =
        typeof r.fee_with_no_exemption === 'number'
          ? r.fee_with_no_exemption
          : r.fee_with_no_exemption
          ? Number(r.fee_with_no_exemption)
          : undefined;

      const left_over_seats =
        typeof r.left_over_seats === 'number'
          ? r.left_over_seats
          : r.left_over_seats
          ? Number(r.left_over_seats)
          : null;

      const total_seats =
        typeof r.total_seats === 'number'
          ? r.total_seats
          : r.total_seats
          ? Number(r.total_seats)
          : null;

      const roll_no = r.roll_no ? String(r.roll_no).trim() : undefined;
      const district = r.district ? String(r.district).trim() : undefined;
      const course_type = r.course_type ? String(r.course_type).trim() : undefined;

      const record: AllotmentRecord2026 = {
        rank,
        cand_name,
        gender,
        category,
        region,
        alloted_category,
        phase,
        college_code: finalCollegeCode,
        college_name: finalCollegeName,
        branch_code,
        branch_name,
        fee_with_exemption,
        fee_with_no_exemption,
        left_over_seats,
        total_seats,
        roll_no,
        district,
        course_type,
      };

      allRecords.push(record);

      if (!branchMap.has(branch_code)) {
        branchMap.set(branch_code, {
          branch_code,
          branch_name,
          records: [],
          bestRank: rank > 0 ? rank : Infinity,
          lastRank: rank > 0 ? rank : 0,
        });
      }

      const bGroup = branchMap.get(branch_code)!;
      bGroup.records.push(record);
      if (rank > 0) {
        if (rank < bGroup.bestRank) bGroup.bestRank = rank;
        if (rank > bGroup.lastRank) bGroup.lastRank = rank;
      }
    };

    // Format 1: branches: [ { branch_code, branch_name, records: [...] } ]
    if (rawData.branches && Array.isArray(rawData.branches)) {
      for (const b of rawData.branches) {
        const bCode = b.branch_code || '';
        const bName = b.branch_name || bCode;
        for (const r of b.records || []) {
          parseRecord(r, bCode, bName);
        }
      }
    }
    // Format 2: records: [ { ... } ]
    else if (rawData.records && Array.isArray(rawData.records)) {
      for (const r of rawData.records) {
        parseRecord(r, r.branch_code, r.branch_name);
      }
    }

    const branches = Array.from(branchMap.values()).map((b) => ({
      branch_code: b.branch_code,
      branch_name: b.branch_name,
      recordCount: b.records.length,
      bestRank: b.bestRank === Infinity ? 0 : b.bestRank,
      lastRank: b.lastRank,
      records: b.records,
    }));

    const parsedData: CollegeDetailData2026 = {
      college_code: finalCollegeCode,
      college_name: finalCollegeName,
      file: fileName,
      recordCount: allRecords.length,
      branchCount: branches.length,
      branches,
      allRecords,
      district: allRecords[0]?.district,
      isMissing: false,
    };

    targetCache.set(code, parsedData);
    return parsedData;
  } catch (err) {
    console.warn(`Error parsing college file ${fileName}:`, err);
    const fallback: CollegeDetailData2026 = {
      college_code: code,
      college_name: collegeName,
      file: fileName,
      recordCount: 0,
      branchCount: 0,
      branches: [],
      allRecords: [],
      isMissing: true,
    };
    targetCache.set(code, fallback);
    return fallback;
  }
}

/**
 * Compute rich analytics for College Insight View
 */
export function computeCollegeAnalytics(
  college: CollegeDetailData2026
): CollegeDashboardAnalytics {
  const records = college.allRecords;
  if (!records || records.length === 0) {
    return {
      collegeName: college.college_name,
      collegeCode: college.college_code,
      totalAllotments: 0,
      branchCount: 0,
      bestOverallRank: 0,
      lastOverallRank: 0,
      medianRank: 0,
      branches: [],
      categoryInsights: [],
      allottedCategoryInsights: [],
      genderDistribution: { male: 0, female: 0, other: 0, malePct: 0, femalePct: 0 },
      phaseDistribution: {},
      regionDistribution: {},
    };
  }

  let bestOverallRank = Infinity;
  let lastOverallRank = 0;
  const ranks: number[] = [];

  const catMap: Record<
    string,
    { best: number; last: number; count: number; male: number; female: number }
  > = {};
  const allotMap: Record<string, { best: number; last: number; count: number }> = {};
  let maleCount = 0;
  let femaleCount = 0;
  let otherCount = 0;
  const phaseDist: Record<number, number> = {};
  const regionDist: Record<string, number> = {};

  for (const r of records) {
    const rk = r.rank;
    if (rk > 0) {
      ranks.push(rk);
      if (rk < bestOverallRank) bestOverallRank = rk;
      if (rk > lastOverallRank) lastOverallRank = rk;
    }

    if (r.gender === 'M') maleCount++;
    else if (r.gender === 'F') femaleCount++;
    else otherCount++;

    const cat = r.category || 'OC';
    if (!catMap[cat]) {
      catMap[cat] = { best: rk, last: rk, count: 0, male: 0, female: 0 };
    }
    const cEntry = catMap[cat];
    cEntry.count++;
    if (rk < cEntry.best) cEntry.best = rk;
    if (rk > cEntry.last) cEntry.last = rk;
    if (r.gender === 'M') cEntry.male++;
    else if (r.gender === 'F') cEntry.female++;

    const alt = r.alloted_category || '—';
    if (!allotMap[alt]) {
      allotMap[alt] = { best: rk, last: rk, count: 0 };
    }
    const aEntry = allotMap[alt];
    aEntry.count++;
    if (rk < aEntry.best) aEntry.best = rk;
    if (rk > aEntry.last) aEntry.last = rk;

    const ph = r.phase || 1;
    phaseDist[ph] = (phaseDist[ph] || 0) + 1;

    const reg = r.region || 'AU';
    regionDist[reg] = (regionDist[reg] || 0) + 1;
  }

  ranks.sort((a, b) => a - b);
  const medianRank = ranks.length > 0 ? ranks[Math.floor(ranks.length / 2)] : 0;
  const total = records.length;

  const categoryInsights: CategoryRankInsight[] = Object.entries(catMap)
    .map(([category, d]) => ({
      category,
      bestRank: d.best === Infinity ? 0 : d.best,
      lastRank: d.last,
      studentCount: d.count,
      maleCount: d.male,
      femaleCount: d.female,
    }))
    .sort((a, b) => b.studentCount - a.studentCount);

  const allottedCategoryInsights: AllottedCategoryInsight[] = Object.entries(allotMap)
    .map(([allottedCategory, d]) => ({
      allottedCategory,
      bestRank: d.best === Infinity ? 0 : d.best,
      lastRank: d.last,
      count: d.count,
    }))
    .sort((a, b) => b.count - a.count);

  const branches = college.branches.map((b) => ({
    branchCode: b.branch_code,
    branchName: b.branch_name,
    allotmentCount: b.recordCount,
    bestRank: b.bestRank,
    lastRank: b.lastRank,
  }));

  return {
    collegeName: college.college_name,
    collegeCode: college.college_code,
    totalAllotments: total,
    branchCount: college.branchCount,
    bestOverallRank: bestOverallRank === Infinity ? 0 : bestOverallRank,
    lastOverallRank,
    medianRank,
    branches,
    categoryInsights,
    allottedCategoryInsights,
    genderDistribution: {
      male: maleCount,
      female: femaleCount,
      other: otherCount,
      malePct: total > 0 ? Math.round((maleCount / total) * 100) : 0,
      femalePct: total > 0 ? Math.round((femaleCount / total) * 100) : 0,
    },
    phaseDistribution: phaseDist,
    regionDistribution: regionDist,
  };
}

/**
 * Searches allotments across either "All Colleges" (using search_index) or a specific college (using direct JSON)
 */
export async function searchAllotments2026(
  options: SearchOptions2026
): Promise<SearchResult2026> {
  const {
    year = '2026',
    phase = 'ALL',
    collegeCode = 'ALL',
    branchCode = 'ALL',
    nameQuery = '',
    minRank = null,
    maxRank = null,
    category = 'ALL',
    allottedCategory = 'ALL',
    gender = 'ALL',
    region = 'ALL',
    sortBy = 'RANK_ASC',
    page = 1,
    pageSize = 30,
  } = options;

  let allMatches: AllotmentRecord2026[] = [];

  const nameTokens = nameQuery ? normalizeSearchQuery(nameQuery).split(' ').filter(Boolean) : [];
  const targetPhase = phase && phase !== 'ALL' ? Number(phase) : null;
  const targetCategory = category && category !== 'ALL' ? category.toUpperCase().trim() : null;
  const targetAllotted =
    allottedCategory && allottedCategory !== 'ALL'
      ? allottedCategory.toUpperCase().trim()
      : null;
  const targetGender = gender && gender !== 'ALL' ? gender.toUpperCase().trim() : null;
  const targetRegion = region && region !== 'ALL' ? region.toUpperCase().trim() : null;
  const targetBranch = branchCode && branchCode !== 'ALL' ? branchCode.toUpperCase().trim() : null;

  // Case 1: Specific College is Selected -> Load that college file directly
  if (collegeCode && collegeCode !== 'ALL') {
    const colData = await getCollegeDetails2026(collegeCode, year);
    if (!colData || colData.allRecords.length === 0) {
      return {
        totalMatches: 0,
        page: 1,
        pageSize,
        totalPages: 0,
        records: [],
        isTruncated: false,
      };
    }

    allMatches = colData.allRecords.filter((r) => {
      if (targetPhase !== null && r.phase !== targetPhase) return false;
      if (targetBranch && r.branch_code !== targetBranch) return false;
      if (minRank !== null && minRank > 0 && (r.rank <= 0 || r.rank < minRank)) return false;
      if (maxRank !== null && maxRank > 0 && (r.rank <= 0 || r.rank > maxRank)) return false;
      if (targetCategory && !r.category.includes(targetCategory)) return false;
      if (targetAllotted && !r.alloted_category.includes(targetAllotted)) return false;
      if (targetGender && r.gender !== targetGender) return false;
      if (targetRegion && !r.region.includes(targetRegion)) return false;

      if (nameTokens.length > 0) {
        const normName = normalizeSearchQuery(r.cand_name);
        if (!nameTokens.every((token) => normName.includes(token))) return false;
      }

      return true;
    });
  }
  // Case 2: "All Colleges" Selected -> Use precompiled search index
  else {
    if (year === '2026') {
      await preloadSearchIndex2026();
      if (!cachedSearchIndex2026) {
        return {
          totalMatches: 0,
          page: 1,
          pageSize,
          totalPages: 0,
          records: [],
          isTruncated: false,
        };
      }

      const rawList = cachedSearchIndex2026.candidates;
      const bMap = cachedSearchIndex2026.branchMap;
      const cMap = cachedSearchIndex2026.collegeMap;

      for (let i = 0; i < rawList.length; i++) {
        const raw = rawList[i];
        // [rank, name, gender, cat, reg, allot, phase, col, branch, feeExempt, feeNoExempt, leftSeats, totSeats, rollNo]
        const rawRankVal = raw[0];
        const rRank = typeof rawRankVal === 'number' ? rawRankVal : (parseFloat(String(rawRankVal ?? '').replace(/,/g, '')) || 0);
        const rName = raw[1];
        const rGender = raw[2];
        const rCat = raw[3];
        const rReg = raw[4];
        const rAllot = raw[5];
        const rPhase = raw[6];
        const rCol = raw[7];
        const rBranch = raw[8];

        if (targetPhase !== null && rPhase !== targetPhase) continue;
        if (targetBranch && rBranch !== targetBranch) continue;
        if (minRank !== null && minRank > 0 && (rRank <= 0 || rRank < minRank)) continue;
        if (maxRank !== null && maxRank > 0 && (rRank <= 0 || rRank > maxRank)) continue;
        if (targetCategory && !rCat.includes(targetCategory)) continue;
        if (targetAllotted && !rAllot.includes(targetAllotted)) continue;
        if (targetGender && rGender !== targetGender) continue;
        if (targetRegion && !rReg.includes(targetRegion)) continue;

        if (nameTokens.length > 0) {
          const normName = normalizeSearchQuery(rName);
          if (!nameTokens.every((token) => normName.includes(token))) continue;
        }

        allMatches.push({
          rank: rRank,
          cand_name: rName,
          gender: rGender,
          category: rCat,
          region: rReg,
          alloted_category: rAllot,
          phase: rPhase,
          college_code: rCol,
          college_name: cMap[rCol] || rCol,
          branch_code: rBranch,
          branch_name: bMap[rBranch] || rBranch,
          fee_with_exemption: raw[9],
          fee_with_no_exemption: raw[10],
          left_over_seats: raw[11],
          total_seats: raw[12],
          roll_no: raw[13] || undefined,
        });
      }
    } else {
      // 2025 fallback
      await preloadSearchIndex2025();
      if (!cachedSearchIndex2025) {
        return {
          totalMatches: 0,
          page: 1,
          pageSize,
          totalPages: 0,
          records: [],
          isTruncated: false,
        };
      }

      const rawList = cachedSearchIndex2025.candidates;
      const bMap = cachedSearchIndex2025.branchMap;

      for (let i = 0; i < rawList.length; i++) {
        const raw = rawList[i];
        const rawRankVal = raw[0];
        const rRank = typeof rawRankVal === 'number' ? rawRankVal : (parseFloat(String(rawRankVal ?? '').replace(/,/g, '')) || 0);
        const rName = raw[1];
        const rGender = raw[2];
        const rCat = raw[3];
        const rReg = raw[4];
        const rAllot = raw[5];
        const rPhase = raw[6];
        const rCol = raw[7];
        const rBranch = raw[8];

        if (targetPhase !== null && rPhase !== targetPhase) continue;
        if (targetBranch && rBranch !== targetBranch) continue;
        if (minRank !== null && minRank > 0 && (rRank <= 0 || rRank < minRank)) continue;
        if (maxRank !== null && maxRank > 0 && (rRank <= 0 || rRank > maxRank)) continue;
        if (targetCategory && !rCat.includes(targetCategory)) continue;
        if (targetAllotted && !rAllot.includes(targetAllotted)) continue;
        if (targetGender && rGender !== targetGender) continue;
        if (targetRegion && !rReg.includes(targetRegion)) continue;

        if (nameTokens.length > 0) {
          const normName = normalizeSearchQuery(rName);
          if (!nameTokens.every((token) => normName.includes(token))) continue;
        }

        allMatches.push({
          rank: rRank,
          cand_name: rName,
          gender: rGender,
          category: rCat,
          region: rReg,
          alloted_category: rAllot,
          phase: rPhase,
          college_code: rCol,
          college_name: rCol,
          branch_code: rBranch,
          branch_name: bMap[rBranch] || rBranch,
        });
      }
    }
  }

  // Sorting
  if (sortBy === 'RANK_ASC') {
    allMatches.sort((a, b) => {
      const valA = a.rank > 0 ? a.rank : Infinity;
      const valB = b.rank > 0 ? b.rank : Infinity;
      return valA - valB;
    });
  } else if (sortBy === 'RANK_DESC') {
    allMatches.sort((a, b) => (b.rank || 0) - (a.rank || 0));
  } else if (sortBy === 'NAME_ASC') {
    allMatches.sort((a, b) => a.cand_name.localeCompare(b.cand_name));
  }

  const totalMatches = allMatches.length;
  const totalPages = Math.ceil(totalMatches / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (validPage - 1) * pageSize;
  const pageRecords = allMatches.slice(startIndex, startIndex + pageSize);

  return {
    totalMatches,
    page: validPage,
    pageSize,
    totalPages,
    records: pageRecords,
    isTruncated: totalMatches > pageSize,
  };
}
