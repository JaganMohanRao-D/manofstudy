/**
 * AP EAPCET 2025 Client-Side Search & Data Engine
 * Fast, deterministic search & analytics engine grounded strictly in official AP EAPCET 2025 allotment records.
 */

import { AP_EAPCET_COLLEGES, AP_EAPCET_GLOBAL_STATS } from '../data/apEapcetCollegeManifest';

export interface ApCandidateRecord {
  rank: number;
  cand_name: string;
  gender: 'M' | 'F' | string;
  category: string;
  region: string;
  alloted_category: string;
  phase: number;
  college_code: string;
  college_name: string;
  branch_code: string;
  branch_name: string;
}

export interface ApCollegeData {
  college_name: string;
  college_code: string;
  branches: Array<{
    branch_code: string;
    branch_name: string;
    records: Array<{
      rank: string;
      cand_name: string;
      gender: string;
      category: string;
      region: string;
      alloted_category: string;
      phase: number;
      college: string;
      branch: string;
    }>;
  }>;
}

export interface CategoryRankInsight {
  category: string;
  bestRank: number;
  lastRank: number;
  studentCount: number;
  maleCount: number;
  femaleCount: number;
}

export interface BranchAnalytics {
  totalStudents: number;
  bestOverallRank: number;
  lastOverallRank: number;
  categoryInsights: CategoryRankInsight[];
  allottedCategoryBreakdown: Array<{
    allottedCategory: string;
    count: number;
    bestRank: number;
    lastRank: number;
  }>;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  regionDistribution: Record<string, number>;
  phaseDistribution: Record<number, number>;
}

// College code to college name lookup
const collegeNameMap: Record<string, string> = {};
const collegeFileMap: Record<string, string> = {};

AP_EAPCET_COLLEGES.forEach((c) => {
  collegeNameMap[c.collegeCode.toUpperCase()] = c.collegeName;
  collegeFileMap[c.collegeCode.toUpperCase()] = c.file;
});

// Cache for search_index.json candidates array
// Each candidate in raw index: [rank, cand_name, gender, category, region, alloted_category, phase, college_code, branch_code]
let cachedRawCandidates: any[][] | null = null;
let cachedBranchNames: Record<string, string> = {};
let loadIndexPromise: Promise<boolean> | null = null;

export async function preloadApSearchIndex(): Promise<boolean> {
  if (cachedRawCandidates) return true;
  if (loadIndexPromise) return loadIndexPromise;

  loadIndexPromise = (async () => {
    try {
      const res = await fetch('/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/search_index.json');
      if (!res.ok) {
        throw new Error(`Failed to load search index: HTTP ${res.status}`);
      }
      const data = await res.json();
      cachedRawCandidates = data.candidates || [];
      cachedBranchNames = data.branchMap || {};
      return true;
    } catch (err) {
      console.warn('Could not preload AP EAPCET search index:', err);
      return false;
    } finally {
      loadIndexPromise = null;
    }
  })();

  return loadIndexPromise;
}

// Cache for individually loaded college JSON files
const collegeCache: Record<string, ApCollegeData> = {};

export async function fetchCollegeDetails(collegeCode: string): Promise<ApCollegeData | null> {
  const code = collegeCode.toUpperCase();
  if (collegeCache[code]) {
    return collegeCache[code];
  }

  const collegeMeta = AP_EAPCET_COLLEGES.find((c) => c.collegeCode.toUpperCase() === code);
  if (!collegeMeta || !collegeMeta.hasData) {
    return null;
  }

  const fileName = collegeMeta.file || `${code}.json`;
  try {
    const res = await fetch(`/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/${fileName}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: ApCollegeData = await res.json();
    collegeCache[code] = data;
    return data;
  } catch (err) {
    console.warn(`Error loading college file for ${code}:`, err);
    return null;
  }
}

function normalizeSearchString(val: string): string {
  return (val || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ApSearchParams {
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

export interface ApSearchResult {
  totalMatches: number;
  records: ApCandidateRecord[];
  isTruncated: boolean;
}

export async function searchApAllotments(params: ApSearchParams): Promise<ApSearchResult> {
  await preloadApSearchIndex();

  if (!cachedRawCandidates || cachedRawCandidates.length === 0) {
    return { totalMatches: 0, records: [], isTruncated: false };
  }

  const nameTokens = params.nameQuery
    ? normalizeSearchString(params.nameQuery).split(' ').filter(Boolean)
    : [];

  const targetRank = params.exactRank && params.exactRank > 0 ? params.exactRank : null;
  const minRank = params.minRank && params.minRank > 0 ? params.minRank : null;
  const maxRank = params.maxRank && params.maxRank > 0 ? params.maxRank : null;

  const targetCollege = params.collegeCode && params.collegeCode !== 'ALL' ? params.collegeCode.toUpperCase() : null;
  const targetBranch = params.branchCode && params.branchCode !== 'ALL' ? params.branchCode.toUpperCase() : null;
  const targetCategory = params.category && params.category !== 'ALL' ? params.category.toUpperCase() : null;
  const targetAllottedCat = params.allottedCategory && params.allottedCategory !== 'ALL' ? params.allottedCategory.toUpperCase() : null;
  const targetGender = params.gender && params.gender !== 'ALL' ? params.gender.toUpperCase() : null;
  const targetRegion = params.region && params.region !== 'ALL' ? params.region.toUpperCase() : null;
  const targetPhase = params.phase && params.phase !== 'ALL' ? Number(params.phase) : null;

  const limit = params.limit || 500;
  const matchingRecords: ApCandidateRecord[] = [];
  let totalCount = 0;

  for (let i = 0; i < cachedRawCandidates.length; i++) {
    const raw = cachedRawCandidates[i];
    // raw: [rank, cand_name, gender, category, region, alloted_category, phase, college_code, branch_code]
    const rRank: number = raw[0];
    const rName: string = raw[1];
    const rGender: string = raw[2];
    const rCategory: string = raw[3];
    const rRegion: string = raw[4];
    const rAllotedCat: string = raw[5];
    const rPhase: number = raw[6];
    const rCollegeCode: string = raw[7];
    const rBranchCode: string = raw[8];

    // Filter by Exact Rank if specified
    if (targetRank !== null) {
      if (rRank !== targetRank) continue;
    }

    // Filter by Rank range if specified
    if (minRank !== null && rRank < minRank) continue;
    if (maxRank !== null && rRank > maxRank) continue;

    // Filter by College
    if (targetCollege && rCollegeCode !== targetCollege) continue;

    // Filter by Branch
    if (targetBranch && rBranchCode !== targetBranch) continue;

    // Filter by Candidate Category
    if (targetCategory && rCategory !== targetCategory) continue;

    // Filter by Allotted Category
    if (targetAllottedCat && rAllotedCat !== targetAllottedCat) continue;

    // Filter by Gender
    if (targetGender && rGender !== targetGender) continue;

    // Filter by Region
    if (targetRegion && rRegion !== targetRegion) continue;

    // Filter by Phase
    if (targetPhase !== null && rPhase !== targetPhase) continue;

    // Filter by Name multi-word matching
    if (nameTokens.length > 0) {
      const normCandName = normalizeSearchString(rName);
      const matchesAllTokens = nameTokens.every((token) => normCandName.includes(token));
      if (!matchesAllTokens) continue;
    }

    totalCount++;

    if (matchingRecords.length < limit) {
      matchingRecords.push({
        rank: rRank,
        cand_name: rName,
        gender: rGender,
        category: rCategory,
        region: rRegion,
        alloted_category: rAllotedCat,
        phase: rPhase,
        college_code: rCollegeCode,
        college_name: collegeNameMap[rCollegeCode] || rCollegeCode,
        branch_code: rBranchCode,
        branch_name: cachedBranchNames[rBranchCode] || rBranchCode
      });
    }
  }

  return {
    totalMatches: totalCount,
    records: matchingRecords,
    isTruncated: totalCount > limit
  };
}

/**
 * Computes deterministic statistics & category insights from a list of records.
 */
export function computeAllotmentAnalytics(records: ApCandidateRecord[]): BranchAnalytics {
  if (!records || records.length === 0) {
    return {
      totalStudents: 0,
      bestOverallRank: 0,
      lastOverallRank: 0,
      categoryInsights: [],
      allottedCategoryBreakdown: [],
      genderDistribution: { male: 0, female: 0, other: 0 },
      regionDistribution: {},
      phaseDistribution: {}
    };
  }

  let bestOverall = Infinity;
  let lastOverall = -Infinity;

  const categoryMap: Record<
    string,
    { best: number; last: number; count: number; male: number; female: number }
  > = {};

  const allottedCatMap: Record<string, { count: number; best: number; last: number }> = {};
  const genderCount = { male: 0, female: 0, other: 0 };
  const regionMap: Record<string, number> = {};
  const phaseMap: Record<number, number> = {};

  records.forEach((r) => {
    const rank = r.rank;
    if (rank > 0) {
      if (rank < bestOverall) bestOverall = rank;
      if (rank > lastOverall) lastOverall = rank;
    }

    // Candidate Category grouping
    const cat = r.category || 'UNKNOWN';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { best: Infinity, last: -Infinity, count: 0, male: 0, female: 0 };
    }
    categoryMap[cat].count++;
    if (rank > 0) {
      if (rank < categoryMap[cat].best) categoryMap[cat].best = rank;
      if (rank > categoryMap[cat].last) categoryMap[cat].last = rank;
    }
    if (r.gender === 'M') {
      categoryMap[cat].male++;
      genderCount.male++;
    } else if (r.gender === 'F') {
      categoryMap[cat].female++;
      genderCount.female++;
    } else {
      genderCount.other++;
    }

    // Allotted Category grouping
    const allotedCat = r.alloted_category || 'UNKNOWN';
    if (!allottedCatMap[allotedCat]) {
      allottedCatMap[allotedCat] = { count: 0, best: Infinity, last: -Infinity };
    }
    allottedCatMap[allotedCat].count++;
    if (rank > 0) {
      if (rank < allottedCatMap[allotedCat].best) allottedCatMap[allotedCat].best = rank;
      if (rank > allottedCatMap[allotedCat].last) allottedCatMap[allotedCat].last = rank;
    }

    // Region distribution
    const reg = r.region || 'OTHER';
    regionMap[reg] = (regionMap[reg] || 0) + 1;

    // Phase distribution
    const ph = r.phase || 1;
    phaseMap[ph] = (phaseMap[ph] || 0) + 1;
  });

  const categoryInsights: CategoryRankInsight[] = Object.entries(categoryMap)
    .map(([cat, stats]) => ({
      category: cat,
      bestRank: stats.best === Infinity ? 0 : stats.best,
      lastRank: stats.last === -Infinity ? 0 : stats.last,
      studentCount: stats.count,
      maleCount: stats.male,
      femaleCount: stats.female
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const allottedCategoryBreakdown = Object.entries(allottedCatMap)
    .map(([cat, stats]) => ({
      allottedCategory: cat,
      count: stats.count,
      bestRank: stats.best === Infinity ? 0 : stats.best,
      lastRank: stats.last === -Infinity ? 0 : stats.last
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalStudents: records.length,
    bestOverallRank: bestOverall === Infinity ? 0 : bestOverall,
    lastOverallRank: lastOverall === -Infinity ? 0 : lastOverall,
    categoryInsights,
    allottedCategoryBreakdown,
    genderDistribution: genderCount,
    regionDistribution: regionMap,
    phaseDistribution: phaseMap
  };
}
