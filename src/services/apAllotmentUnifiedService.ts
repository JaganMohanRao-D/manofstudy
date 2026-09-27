/**
 * Unified AP EAPCET Allotment Service
 * Strictly handles both AP EAPCET 2026 and 2025 datasets dynamically.
 * - 2026 dataset: /AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/ (335 colleges, 102K+ records, 3 phases)
 * - 2025 dataset: /AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/ (255 colleges, 119K+ records, 2 phases)
 *
 * Deterministic, no fake data, no cross-contamination with Telangana or between years.
 */

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
  year: '2026' | '2025';
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
  year: '2026' | '2025';
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

export interface SearchOptions {
  year?: '2026' | '2025';
  phase?: 'ALL' | 1 | 2 | 3 | string;
  collegeCode?: string;
  branchCode?: string;
  nameQuery?: string;
  exactRank?: number | null;
  minRank?: number | null;
  maxRank?: number | null;
  category?: string;
  allottedCategory?: string;
  gender?: string;
  region?: string;
  sortBy?: 'RANK_ASC' | 'RANK_DESC' | 'NAME_ASC';
  page?: number;
  pageSize?: number;
  limit?: number;
}

export interface SearchResult {
  totalMatches: number;
  page: number;
  pageSize: number;
  totalPages: number;
  records: AllotmentRecord[];
  isTruncated: boolean;
}

// In-memory cache structures segregated by year
const collegeIndexCache: Record<'2026' | '2025', CollegeIndexEntry[] | null> = {
  '2026': null,
  '2025': null,
};

const collegeIndexPromise: Record<'2026' | '2025', Promise<CollegeIndexEntry[]> | null> = {
  '2026': null,
  '2025': null,
};

const collegeDetailCache = new Map<string, CollegeDetailData>();

interface SearchIndexData {
  candidates: any[];
  branchMap: Record<string, string>;
  collegeMap: Record<string, string>;
}

const searchIndexCache: Record<'2026' | '2025', SearchIndexData | null> = {
  '2026': null,
  '2025': null,
};

const searchIndexPromise: Record<'2026' | '2025', Promise<boolean> | null> = {
  '2026': null,
  '2025': null,
};

export function normalizeSearchQuery(text: string): string {
  return (text || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Loads college index for the specified year
 */
export async function loadCollegesIndex(year: '2026' | '2025'): Promise<CollegeIndexEntry[]> {
  if (collegeIndexCache[year]) return collegeIndexCache[year]!;
  if (collegeIndexPromise[year]) return collegeIndexPromise[year]!;

  collegeIndexPromise[year] = (async () => {
    try {
      const folder =
        year === '2026'
          ? '/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE'
          : '/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE';
      const res = await fetch(`${folder}/index.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: CollegeIndexEntry[] = (data.colleges || [])
        .map((c: any) => ({
          college_name: String(c.college_name || c.collegeCode || 'Unknown College').trim(),
          college_code: String(c.college_code || c.inst_code || '').toUpperCase().trim(),
          file: String(c.file || `${c.college_code}.json`).trim(),
          records: typeof c.records === 'number' ? c.records : undefined,
        }))
        .filter((c: CollegeIndexEntry) => Boolean(c.college_code) && c.college_code !== 'CBIT');
      collegeIndexCache[year] = list;
      return list;
    } catch (err) {
      console.warn(`Could not load ${year} index.json:`, err);
      return [];
    } finally {
      collegeIndexPromise[year] = null;
    }
  })();

  return collegeIndexPromise[year]!;
}

/**
 * Preloads search index for the specified year
 */
export async function preloadSearchIndex(year: '2026' | '2025'): Promise<boolean> {
  if (searchIndexCache[year]) return true;
  if (searchIndexPromise[year]) return searchIndexPromise[year]!;

  searchIndexPromise[year] = (async () => {
    try {
      const folder =
        year === '2026'
          ? '/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE'
          : '/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE';
      const res = await fetch(`${folder}/search_index.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Ensure collegeMap exists for 2025 if missing in search_index
      const colMap = data.collegeMap || {};
      if (Object.keys(colMap).length === 0) {
        const colList = await loadCollegesIndex(year);
        colList.forEach((c) => {
          colMap[c.college_code.toUpperCase()] = c.college_name;
        });
      }

      searchIndexCache[year] = {
        candidates: data.candidates || [],
        branchMap: data.branchMap || {},
        collegeMap: colMap,
      };
      return true;
    } catch (err) {
      console.warn(`Could not load ${year} search index:`, err);
      return false;
    } finally {
      searchIndexPromise[year] = null;
    }
  })();

  return searchIndexPromise[year]!;
}

/**
 * Loads detailed college JSON for selected college and year
 */
export async function getCollegeDetails(
  collegeCode: string,
  year: '2026' | '2025'
): Promise<CollegeDetailData | null> {
  const code = (collegeCode || '').toUpperCase().trim();
  if (!code || code === 'ALL') return null;

  const cacheKey = `${year}_${code}`;
  if (collegeDetailCache.has(cacheKey)) {
    return collegeDetailCache.get(cacheKey)!;
  }

  const folder =
    year === '2026'
      ? '/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE'
      : '/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE';

  const colleges = await loadCollegesIndex(year);
  const collegeMeta = colleges.find((c) => c.college_code.toUpperCase() === code);
  const fileName = collegeMeta?.file || `${code}.json`;
  const fallbackName = collegeMeta?.college_name || code;

  try {
    const res = await fetch(`${folder}/${fileName}`);
    if (!res.ok) {
      const empty: CollegeDetailData = {
        college_code: code,
        college_name: fallbackName,
        file: fileName,
        year,
        recordCount: 0,
        branchCount: 0,
        branches: [],
        allRecords: [],
        isMissing: true,
      };
      collegeDetailCache.set(cacheKey, empty);
      return empty;
    }

    const rawData = await res.json();
    const finalCollegeCode = (rawData.college_code || code).toUpperCase();
    const finalCollegeName = rawData.college_name || fallbackName;

    const allRecords: AllotmentRecord[] = [];
    const branchMap = new Map<
      string,
      {
        branch_code: string;
        branch_name: string;
        records: AllotmentRecord[];
        bestRank: number;
        lastRank: number;
      }
    >();

    const parseRecord = (r: any, defaultBranchCode = '', defaultBranchName = '') => {
      const numRank = parseFloat(String(r.rank ?? '').replace(/,/g, ''));
      const rank = !isNaN(numRank) && isFinite(numRank) ? Math.round(numRank) : 0;
      if (rank <= 0) return;

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

      const record: AllotmentRecord = {
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
          bestRank: rank,
          lastRank: rank,
        });
      }

      const bGroup = branchMap.get(branch_code)!;
      bGroup.records.push(record);
      if (rank < bGroup.bestRank) bGroup.bestRank = rank;
      if (rank > bGroup.lastRank) bGroup.lastRank = rank;
    };

    if (rawData.branches && Array.isArray(rawData.branches)) {
      for (const b of rawData.branches) {
        const bCode = b.branch_code || '';
        const bName = b.branch_name || bCode;
        for (const r of b.records || []) {
          parseRecord(r, bCode, bName);
        }
      }
    } else if (rawData.records && Array.isArray(rawData.records)) {
      for (const r of rawData.records) {
        parseRecord(r, r.branch_code, r.branch_name);
      }
    }

    const branches = Array.from(branchMap.values()).map((b) => ({
      branch_code: b.branch_code,
      branch_name: b.branch_name,
      recordCount: b.records.length,
      bestRank: b.bestRank,
      lastRank: b.lastRank,
      records: b.records,
    }));

    const parsed: CollegeDetailData = {
      college_code: finalCollegeCode,
      college_name: finalCollegeName,
      file: fileName,
      year,
      recordCount: allRecords.length,
      branchCount: branches.length,
      branches,
      allRecords,
      district: allRecords[0]?.district,
      isMissing: false,
    };

    collegeDetailCache.set(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.warn(`Error parsing ${fileName} for ${year}:`, err);
    const fallback: CollegeDetailData = {
      college_code: code,
      college_name: fallbackName,
      file: fileName,
      year,
      recordCount: 0,
      branchCount: 0,
      branches: [],
      allRecords: [],
      isMissing: true,
    };
    collegeDetailCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Computes analytics for College View
 */
export function computeCollegeAnalytics(
  college: CollegeDetailData
): CollegeDashboardAnalytics {
  const records = college.allRecords;
  if (!records || records.length === 0) {
    return {
      collegeName: college.college_name,
      collegeCode: college.college_code,
      year: college.year,
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
    year: college.year,
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
 * Searches allotments across either "All Colleges" (via search index) or a specific college (via direct JSON)
 */
export async function searchAllotments(options: SearchOptions): Promise<SearchResult> {
  const {
    year = '2026',
    phase = 'ALL',
    collegeCode = 'ALL',
    branchCode = 'ALL',
    nameQuery = '',
    exactRank = null,
    minRank = null,
    maxRank = null,
    category = 'ALL',
    allottedCategory = 'ALL',
    gender = 'ALL',
    region = 'ALL',
    sortBy = 'RANK_ASC',
    page = 1,
    pageSize = 30,
    limit,
  } = options;

  let allMatches: AllotmentRecord[] = [];

  const effectiveMinRank = exactRank !== null && exactRank !== undefined ? exactRank : minRank;
  const effectiveMaxRank = exactRank !== null && exactRank !== undefined ? exactRank : maxRank;

  const nameTokens = nameQuery ? normalizeSearchQuery(nameQuery).split(' ').filter(Boolean) : [];
  const targetPhase = phase && phase !== 'ALL' ? Number(phase) : null;
  const targetCategory = category && category !== 'ALL' ? category.toUpperCase().trim() : null;
  const targetAllotted =
    allottedCategory && allottedCategory !== 'ALL' ? allottedCategory.toUpperCase().trim() : null;
  const targetGender = gender && gender !== 'ALL' ? gender.toUpperCase().trim() : null;
  const targetRegion = region && region !== 'ALL' ? region.toUpperCase().trim() : null;
  const targetBranch = branchCode && branchCode !== 'ALL' ? branchCode.toUpperCase().trim() : null;

  // Case 1: Specific College selected
  if (collegeCode && collegeCode !== 'ALL') {
    const colData = await getCollegeDetails(collegeCode, year);
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
      if (effectiveMinRank !== null && effectiveMinRank > 0 && r.rank < effectiveMinRank) return false;
      if (effectiveMaxRank !== null && effectiveMaxRank > 0 && r.rank > effectiveMaxRank) return false;
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
  // Case 2: All Colleges selected -> Use precompiled search_index.json
  else {
    await preloadSearchIndex(year);
    const searchIdx = searchIndexCache[year];

    if (!searchIdx || !searchIdx.candidates) {
      return {
        totalMatches: 0,
        page: 1,
        pageSize,
        totalPages: 0,
        records: [],
        isTruncated: false,
      };
    }

    const rawList = searchIdx.candidates;
    const bMap = searchIdx.branchMap || {};
    const cMap = searchIdx.collegeMap || {};

    for (let i = 0; i < rawList.length; i++) {
      const raw = rawList[i];
      // Format 2026: [rank, name, gender, cat, reg, allot, phase, col, branch, feeExempt, feeNoExempt, leftSeats, totSeats, rollNo]
      // Format 2025: [rank, name, gender, cat, reg, allot, phase, col, branch]
      const rRank: number = raw[0];
      const rName: string = raw[1];
      const rGender: string = raw[2];
      const rCat: string = raw[3];
      const rReg: string = raw[4];
      const rAllot: string = raw[5];
      const rPhase: number = raw[6];
      const rCol: string = raw[7];
      const rBranch: string = raw[8];

      if (targetPhase !== null && rPhase !== targetPhase) continue;
      if (targetBranch && rBranch !== targetBranch) continue;
      if (effectiveMinRank !== null && effectiveMinRank > 0 && rRank < effectiveMinRank) continue;
      if (effectiveMaxRank !== null && effectiveMaxRank > 0 && rRank > effectiveMaxRank) continue;
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
        fee_with_exemption: raw[9] !== undefined ? raw[9] : undefined,
        fee_with_no_exemption: raw[10] !== undefined ? raw[10] : undefined,
        left_over_seats: raw[11] !== undefined ? raw[11] : null,
        total_seats: raw[12] !== undefined ? raw[12] : null,
        roll_no: raw[13] || undefined,
      });
    }
  }

  // Sorting
  if (sortBy === 'RANK_ASC') {
    allMatches.sort((a, b) => a.rank - b.rank);
  } else if (sortBy === 'RANK_DESC') {
    allMatches.sort((a, b) => b.rank - a.rank);
  } else if (sortBy === 'NAME_ASC') {
    allMatches.sort((a, b) => a.cand_name.localeCompare(b.cand_name));
  }

  const finalMatches = limit && limit > 0 ? allMatches.slice(0, limit) : allMatches;
  const totalMatches = finalMatches.length;
  const totalPages = Math.ceil(totalMatches / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (validPage - 1) * pageSize;
  const pageRecords = finalMatches.slice(startIndex, startIndex + pageSize);

  return {
    totalMatches,
    page: validPage,
    pageSize,
    totalPages,
    records: pageRecords,
    isTruncated: totalMatches > pageSize,
  };
}

export function getDatasetStats(year: '2026' | '2025') {
  if (year === '2026') {
    return {
      year: '2026',
      totalRecords: 102671,
      totalColleges: 335,
      totalPhases: 3,
      phasesList: [1, 2, 3],
      badge: '102K+ Allotment Records • 335 Colleges • 3 Phases',
      label: 'AP EAPCET 2026 Allotment Dataset',
    };
  }
  return {
    year: '2025',
    totalRecords: 119616,
    totalColleges: 255,
    totalPhases: 2,
    phasesList: [1, 2],
    badge: '119K+ Allotment Records • 255 Colleges • 2 Phases',
    label: 'AP EAPCET 2025 Allotment Dataset',
  };
}
