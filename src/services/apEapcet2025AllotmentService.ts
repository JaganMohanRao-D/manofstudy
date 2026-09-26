/**
 * AP EAPCET 2025 College-Wise Allotment Service
 * Deterministic service grounded strictly in official AP EAPCET 2025 allotment records.
 * Dataset: 255 Colleges, 1,557 Branches, 119,616 Allotment Records.
 */

import {
  AP_EAPCET_COLLEGES,
  AP_EAPCET_GLOBAL_STATS,
  ApCollegeItem,
  ApBranchItem,
  ApAllotmentGlobalStats,
} from '../data/apEapcetCollegeManifest';

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
}

export interface CollegeDetailData {
  college_code: string;
  college_name: string;
  file: string;
  recordCount: number;
  branchCount: number;
  branches: Array<{
    branch_code: string;
    branch_name: string;
    recordCount: number;
    records: AllotmentRecord[];
  }>;
  allRecords: AllotmentRecord[];
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

export interface BranchAnalyticsResult {
  totalStudents: number;
  bestOverallRank: number;
  lastOverallRank: number;
  medianRank: number;
  categoryInsights: CategoryRankInsight[];
  allottedCategoryInsights: AllottedCategoryInsight[];
  genderDistribution: {
    male: number;
    female: number;
    malePct: number;
    femalePct: number;
  };
  regionDistribution: Record<string, number>;
  phaseDistribution: Record<number, number>;
}

export interface SearchOptions {
  nameQuery?: string;
  exactRank?: number | null;
  minRank?: number | null;
  maxRank?: number | null;
  collegeCode?: string;
  branchCode?: string;
  category?: string;
  allottedCategory?: string;
  gender?: string;
  region?: string;
  phase?: number | string;
  limit?: number;
}

export interface SearchResult {
  totalMatches: number;
  records: AllotmentRecord[];
  isTruncated: boolean;
}

// In-memory cache for loaded college JSON files
const collegeCache = new Map<string, CollegeDetailData>();

// In-memory cache for search_index.json
let cachedSearchIndex: {
  candidates: Array<[number, string, string, string, string, string, number, string, string]>;
  branchMap: Record<string, string>;
} | null = null;
let searchIndexLoadingPromise: Promise<boolean> | null = null;

// College name lookup
const collegeNameMap: Record<string, string> = {};
AP_EAPCET_COLLEGES.forEach((c) => {
  collegeNameMap[c.collegeCode.toUpperCase()] = c.collegeName;
});

/**
 * Return static global dataset statistics
 */
export function getGlobalDatasetStats(): ApAllotmentGlobalStats {
  return AP_EAPCET_GLOBAL_STATS;
}

/**
 * Return list of all 255 colleges
 */
export function getAllCollegesList(): ApCollegeItem[] {
  return AP_EAPCET_COLLEGES;
}

/**
 * Preloads the global search index in the background
 */
export async function preloadGlobalSearchIndex(): Promise<boolean> {
  if (cachedSearchIndex) return true;
  if (searchIndexLoadingPromise) return searchIndexLoadingPromise;

  searchIndexLoadingPromise = (async () => {
    try {
      const res = await fetch('/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/search_index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedSearchIndex = {
        candidates: data.candidates || [],
        branchMap: data.branchMap || {},
      };
      return true;
    } catch (err) {
      console.warn('Could not load AP EAPCET search index:', err);
      return false;
    } finally {
      searchIndexLoadingPromise = null;
    }
  })();

  return searchIndexLoadingPromise;
}

/**
 * Normalizes text for search matching
 */
function normalizeSearchText(text: string): string {
  return (text || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Lazy loads a specific college JSON file with in-memory caching
 */
export async function getCollegeDetails(collegeCode: string): Promise<CollegeDetailData | null> {
  const code = (collegeCode || '').toUpperCase().trim();
  if (!code || code === 'ALL') return null;

  if (collegeCache.has(code)) {
    return collegeCache.get(code)!;
  }

  const meta = AP_EAPCET_COLLEGES.find((c) => c.collegeCode.toUpperCase() === code);
  const fileName = meta?.file || `${code}.json`;

  try {
    const res = await fetch(`/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/${fileName}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const rawData = await res.json();

    const college_code = rawData.college_code || code;
    const college_name = rawData.college_name || meta?.collegeName || college_code;
    const rawBranches = rawData.branches || (Array.isArray(rawData) ? rawData : []);

    const allRecords: AllotmentRecord[] = [];
    const branches = rawBranches.map((b: any) => {
      const branch_code = String(b.branch_code || b.branch || '').trim();
      const branch_name = String(b.branch_name || branch_code).trim();
      const records: AllotmentRecord[] = [];

      (b.records || []).forEach((r: any) => {
        const numRank = parseFloat(String(r.rank ?? '').replace(/,/g, ''));
        const rank = !isNaN(numRank) && isFinite(numRank) ? Math.round(numRank) : 0;
        if (rank <= 0) return;

        const record: AllotmentRecord = {
          rank,
          cand_name: String(r.cand_name || r.candidateName || r.name || 'Candidate').trim(),
          gender: String(r.gender || '—').trim().toUpperCase(),
          category: String(r.category || 'OC').trim(),
          region: String(r.region || 'AU').trim().toUpperCase(),
          alloted_category: String(
            r.alloted_category || r.allotted_cat || r.allottedCategory || r.seatCategory || '—'
          ).trim(),
          phase: r.phase ? Number(r.phase) : 1,
          college_code,
          college_name,
          branch_code,
          branch_name,
        };

        records.push(record);
        allRecords.push(record);
      });

      return {
        branch_code,
        branch_name,
        recordCount: records.length,
        records,
      };
    });

    const parsedData: CollegeDetailData = {
      college_code,
      college_name,
      file: fileName,
      recordCount: allRecords.length,
      branchCount: branches.length,
      branches,
      allRecords,
    };

    collegeCache.set(code, parsedData);
    return parsedData;
  } catch (err) {
    console.warn(`Could not load college data for ${code}:`, err);
    return null;
  }
}

/**
 * Searches students across the dataset by Name, Exact Rank, Rank Range, College, Branch, Category, Gender, Region, Phase
 */
export async function searchAllotments(options: SearchOptions): Promise<SearchResult> {
  await preloadGlobalSearchIndex();

  if (!cachedSearchIndex || !cachedSearchIndex.candidates.length) {
    return { totalMatches: 0, records: [], isTruncated: false };
  }

  const {
    nameQuery,
    exactRank,
    minRank,
    maxRank,
    collegeCode,
    branchCode,
    category,
    allottedCategory,
    gender,
    region,
    phase,
    limit = 500,
  } = options;

  const nameTokens = nameQuery
    ? normalizeSearchText(nameQuery).split(' ').filter(Boolean)
    : [];

  const targetCollege = collegeCode && collegeCode !== 'ALL' ? collegeCode.toUpperCase().trim() : null;
  const targetBranch = branchCode && branchCode !== 'ALL' ? branchCode.toUpperCase().trim() : null;
  const targetCategory = category && category !== 'ALL' ? category.toUpperCase().trim() : null;
  const targetAllotted = allottedCategory && allottedCategory !== 'ALL' ? allottedCategory.toUpperCase().trim() : null;
  const targetGender = gender && gender !== 'ALL' ? gender.toUpperCase().trim() : null;
  const targetRegion = region && region !== 'ALL' ? region.toUpperCase().trim() : null;
  const targetPhase = phase && phase !== 'ALL' ? Number(phase) : null;
  const targetRank = exactRank && exactRank > 0 ? exactRank : null;
  const minRankFilter = minRank && minRank > 0 ? minRank : null;
  const maxRankFilter = maxRank && maxRank > 0 ? maxRank : null;

  const rawList = cachedSearchIndex.candidates;
  const branchMap = cachedSearchIndex.branchMap || {};
  const matchedRecords: AllotmentRecord[] = [];
  let totalMatches = 0;

  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    // raw: [rank, cand_name, gender, category, region, alloted_category, phase, college_code, branch_code]
    const rRank: number = raw[0];
    const rName: string = raw[1];
    const rGender: string = raw[2];
    const rCategory: string = raw[3];
    const rRegion: string = raw[4];
    const rAlloted: string = raw[5];
    const rPhase: number = raw[6];
    const rCollege: string = raw[7];
    const rBranch: string = raw[8];

    // Filter by Exact Rank
    if (targetRank !== null && rRank !== targetRank) continue;

    // Filter by Rank Range
    if (minRankFilter !== null && rRank < minRankFilter) continue;
    if (maxRankFilter !== null && rRank > maxRankFilter) continue;

    // Filter by College
    if (targetCollege && rCollege.toUpperCase() !== targetCollege) continue;

    // Filter by Branch
    if (targetBranch && rBranch.toUpperCase() !== targetBranch) continue;

    // Filter by Candidate Category
    if (targetCategory && !rCategory.toUpperCase().includes(targetCategory)) continue;

    // Filter by Allotted Category
    if (targetAllotted && !rAlloted.toUpperCase().includes(targetAllotted)) continue;

    // Filter by Gender
    if (targetGender && rGender !== targetGender) continue;

    // Filter by Region
    if (targetRegion && !rRegion.includes(targetRegion)) continue;

    // Filter by Phase
    if (targetPhase !== null && rPhase !== targetPhase) continue;

    // Filter by Name multi-word matching
    if (nameTokens.length > 0) {
      const normName = normalizeSearchText(rName);
      const matchesAll = nameTokens.every((token) => normName.includes(token));
      if (!matchesAll) continue;
    }

    totalMatches++;

    if (matchedRecords.length < limit) {
      matchedRecords.push({
        rank: rRank,
        cand_name: rName,
        gender: rGender,
        category: rCategory,
        region: rRegion,
        alloted_category: rAlloted,
        phase: rPhase,
        college_code: rCollege,
        college_name: collegeNameMap[rCollege.toUpperCase()] || rCollege,
        branch_code: rBranch,
        branch_name: branchMap[rBranch] || rBranch,
      });
    }
  }

  return {
    totalMatches,
    records: matchedRecords,
    isTruncated: totalMatches > limit,
  };
}

/**
 * Computes deterministic statistics and category-wise Best & Last ranks from a list of records
 */
export function computeBranchAnalytics(records: AllotmentRecord[]): BranchAnalyticsResult {
  if (!records || records.length === 0) {
    return {
      totalStudents: 0,
      bestOverallRank: 0,
      lastOverallRank: 0,
      medianRank: 0,
      categoryInsights: [],
      allottedCategoryInsights: [],
      genderDistribution: { male: 0, female: 0, malePct: 0, femalePct: 0 },
      regionDistribution: {},
      phaseDistribution: {},
    };
  }

  let bestOverall = Infinity;
  let lastOverall = 0;
  const ranks: number[] = [];

  const categoryMap: Record<
    string,
    { best: number; last: number; count: number; male: number; female: number }
  > = {};

  const allottedMap: Record<string, { best: number; last: number; count: number }> = {};
  let maleCount = 0;
  let femaleCount = 0;
  const regionMap: Record<string, number> = {};
  const phaseMap: Record<number, number> = {};

  records.forEach((r) => {
    const rank = r.rank;
    if (rank > 0) {
      ranks.push(rank);
      if (rank < bestOverall) bestOverall = rank;
      if (rank > lastOverall) lastOverall = rank;
    }

    // Candidate Category stats
    const cat = r.category || 'OTHER';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { best: Infinity, last: 0, count: 0, male: 0, female: 0 };
    }
    categoryMap[cat].count++;
    if (rank > 0) {
      if (rank < categoryMap[cat].best) categoryMap[cat].best = rank;
      if (rank > categoryMap[cat].last) categoryMap[cat].last = rank;
    }
    if (r.gender === 'M') {
      categoryMap[cat].male++;
      maleCount++;
    } else if (r.gender === 'F') {
      categoryMap[cat].female++;
      femaleCount++;
    }

    // Allotted Category stats
    const allotedCat = r.alloted_category || 'OTHER';
    if (!allottedMap[allotedCat]) {
      allottedMap[allotedCat] = { best: Infinity, last: 0, count: 0 };
    }
    allottedMap[allotedCat].count++;
    if (rank > 0) {
      if (rank < allottedMap[allotedCat].best) allottedMap[allotedCat].best = rank;
      if (rank > allottedMap[allotedCat].last) allottedMap[allotedCat].last = rank;
    }

    // Region distribution
    const reg = r.region || 'OTHER';
    regionMap[reg] = (regionMap[reg] || 0) + 1;

    // Phase distribution
    const ph = r.phase || 1;
    phaseMap[ph] = (phaseMap[ph] || 0) + 1;
  });

  // Calculate Median Rank
  ranks.sort((a, b) => a - b);
  let medianRank = 0;
  if (ranks.length > 0) {
    if (ranks.length % 2 === 0) {
      medianRank = Math.round((ranks[ranks.length / 2 - 1] + ranks[ranks.length / 2]) / 2);
    } else {
      medianRank = ranks[Math.floor(ranks.length / 2)];
    }
  }

  const categoryInsights: CategoryRankInsight[] = Object.entries(categoryMap)
    .map(([cat, stats]) => ({
      category: cat,
      bestRank: stats.best === Infinity ? 0 : stats.best,
      lastRank: stats.last === 0 ? 0 : stats.last,
      studentCount: stats.count,
      maleCount: stats.male,
      femaleCount: stats.female,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const allottedCategoryInsights: AllottedCategoryInsight[] = Object.entries(allottedMap)
    .map(([cat, stats]) => ({
      allottedCategory: cat,
      bestRank: stats.best === Infinity ? 0 : stats.best,
      lastRank: stats.last === 0 ? 0 : stats.last,
      count: stats.count,
    }))
    .sort((a, b) => b.count - a.count);

  const total = records.length;
  const malePct = total > 0 ? Math.round((maleCount / total) * 100) : 0;
  const femalePct = total > 0 ? Math.max(0, 100 - malePct) : 0;

  return {
    totalStudents: total,
    bestOverallRank: bestOverall === Infinity ? 0 : bestOverall,
    lastOverallRank: lastOverall,
    medianRank,
    categoryInsights,
    allottedCategoryInsights,
    genderDistribution: {
      male: maleCount,
      female: femaleCount,
      malePct,
      femalePct,
    },
    regionDistribution: regionMap,
    phaseDistribution: phaseMap,
  };
}
