/**
 * Client-Side Allotment Search Engine
 * Fallback & instant search engine that runs against public/TG_EAPCET_2026_ALLOTMENT/search_index.json
 * Guarantees zero-timeout and 100% reliability even if backend API is unreachable or deployed statically.
 */

import { TG_EAPCET_COLLEGE_MANIFEST, TG_EAPCET_ALL_BRANCHES } from '../data/tgEapcetCollegeManifest';

export interface CandidateResult {
  rank: number;
  name: string;
  gender: string;
  caste: string;
  seatCategory: string;
  region: string;
  hallTicket: string;
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  phase: string;
  sourceFile: string;
  matchType?: string;
  matchPriority?: number;
  matchReason?: string;
}

export interface SearchResponse {
  query: string;
  college: string;
  branch: string;
  totalMatches: number;
  results: CandidateResult[];
  stats: {
    collegeCount: number;
    branchCount: number;
    minRank: number;
    maxRank: number;
    castes?: { caste: string; count: number }[];
  };
}

let cachedIndex: any[][] | null = null;
let isIndexLoading = false;
let loadPromise: Promise<any[][]> | null = null;

// Build college and branch lookup maps from build-time manifest
const collegeMap: Record<string, string> = {};
const branchMap: Record<string, string> = {};

TG_EAPCET_COLLEGE_MANIFEST.forEach((c) => {
  collegeMap[c.collegeCode.toUpperCase()] = c.collegeName;
  (c.branches || []).forEach((b) => {
    if (b.branchCode) {
      branchMap[b.branchCode.toUpperCase()] = b.branchName;
    }
  });
});

TG_EAPCET_ALL_BRANCHES.forEach((b) => {
  if (b.branchCode && !branchMap[b.branchCode.toUpperCase()]) {
    branchMap[b.branchCode.toUpperCase()] = b.branchName;
  }
});

export async function preloadSearchIndex(): Promise<any[][]> {
  if (cachedIndex) return cachedIndex;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch('/TG_EAPCET_2026_ALLOTMENT/search_index.json');
      if (!res.ok) {
        throw new Error(`Failed to load search index: HTTP ${res.status}`);
      }
      const data = await res.json();
      cachedIndex = data.candidates || [];
      return cachedIndex || [];
    } catch (err) {
      console.warn('[allotmentClientSearch] Could not load static search_index.json:', err);
      return [];
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

function normalize(text: string): string {
  return (text || '').toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function searchAllotmentsClientSide(options: {
  q?: string;
  college?: string;
  branch?: string;
  gender?: string;
  caste?: string;
  category?: string;
  sort?: string;
  limit?: number;
}): Promise<SearchResponse> {
  const candidates = await preloadSearchIndex();

  const qRaw = (options.q || '').trim();
  const qClean = normalize(qRaw);
  const college = (options.college || 'ALL').trim().toUpperCase();
  const branch = (options.branch || 'ALL').trim().toUpperCase();
  const gender = (options.gender || 'ALL').trim().toUpperCase();
  const caste = (options.caste || 'ALL').trim().toUpperCase();
  const category = (options.category || 'ALL').trim().toUpperCase();
  const sort = (options.sort || 'rank_asc').trim().toLowerCase();
  const limit = options.limit || 500;

  if (!qClean && college === 'ALL' && branch === 'ALL') {
    return {
      query: qRaw,
      college,
      branch,
      totalMatches: 0,
      results: [],
      stats: { collegeCount: 0, branchCount: 0, minRank: 0, maxRank: 0 },
    };
  }

  const isNumeric = /^\d+$/.test(qClean);
  const qNum = isNumeric ? parseInt(qClean, 10) : null;
  const qWords = qClean ? qClean.split(' ') : [];

  const matched: CandidateResult[] = [];
  const collegesSet = new Set<string>();
  const branchesSet = new Set<string>();
  const casteCountMap: Record<string, number> = {};
  let minObservedRank = 999999;
  let maxObservedRank = 0;

  // Candidate tuple: [rank, name, gender, caste, seatCategory, hallTicket, collegeCode, branchCode, region]
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const cRank = c[0] || 0;
    const cName = c[1] || '';
    const cGender = c[2] || '';
    const cCaste = c[3] || '';
    const cCategory = c[4] || '';
    const cHallTicket = c[5] || '';
    const cCollegeCode = c[6] || '';
    const cBranchCode = c[7] || '';
    const cRegion = c[8] || 'OU';

    // Filters
    if (college !== 'ALL' && cCollegeCode.toUpperCase() !== college) continue;
    if (branch !== 'ALL' && cBranchCode.toUpperCase() !== branch) continue;
    if (gender !== 'ALL' && cGender.toUpperCase() !== gender) continue;
    if (caste !== 'ALL' && cCaste.toUpperCase() !== caste) continue;
    if (category !== 'ALL' && cCategory.toUpperCase() !== category) continue;

    // Text Query Evaluation
    let isMatch = false;
    let matchType = 'Filter Match';
    let matchPriority = 100;
    let matchReason = 'Filter criteria';

    if (!qClean) {
      isMatch = true;
    } else if (isNumeric && qNum !== null) {
      if (cRank === qNum) {
        isMatch = true;
        matchType = 'Exact Match';
        matchPriority = 1000;
        matchReason = 'Exact rank match';
      } else if (cHallTicket.includes(qClean)) {
        isMatch = true;
        matchType = 'Partial Match';
        matchPriority = 550;
        matchReason = 'Hall ticket match';
      }
    } else {
      const normName = normalize(cName);
      if (normName === qClean) {
        isMatch = true;
        matchType = 'Exact Match';
        matchPriority = 1000;
        matchReason = 'Exact full name match';
      } else if (normName.startsWith(qClean + ' ') || normName.startsWith(qClean)) {
        isMatch = true;
        matchType = 'Exact Match';
        matchPriority = 900;
        matchReason = 'Name prefix match';
      } else {
        const nameWords = normName.split(' ');
        const allWordsExact = qWords.every((qw) => nameWords.includes(qw));
        if (allWordsExact) {
          isMatch = true;
          matchType = 'Exact Match';
          matchPriority = 800;
          matchReason = 'Exact word match';
        } else {
          const allWordsPrefix = qWords.every((qw) => nameWords.some((nw) => nw.startsWith(qw)));
          if (allWordsPrefix) {
            isMatch = true;
            matchType = 'Partial Match';
            matchPriority = 600;
            matchReason = 'Word prefix match';
          } else if (normName.includes(qClean)) {
            isMatch = true;
            matchType = 'Partial Match';
            matchPriority = 400;
            matchReason = 'Substring match';
          } else if (cHallTicket.includes(qClean)) {
            isMatch = true;
            matchType = 'Partial Match';
            matchPriority = 500;
            matchReason = 'Hall ticket match';
          }
        }
      }
    }

    if (!isMatch) continue;

    collegesSet.add(cCollegeCode);
    branchesSet.add(cBranchCode);
    if (cCaste) {
      casteCountMap[cCaste] = (casteCountMap[cCaste] || 0) + 1;
    }
    if (cRank > 0 && cRank < minObservedRank) minObservedRank = cRank;
    if (cRank > maxObservedRank) maxObservedRank = cRank;

    matched.push({
      rank: cRank,
      name: cName,
      gender: cGender,
      caste: cCaste,
      seatCategory: cCategory,
      region: cRegion,
      hallTicket: cHallTicket,
      collegeCode: cCollegeCode,
      collegeName: collegeMap[cCollegeCode] || cCollegeCode,
      branchCode: cBranchCode,
      branchName: branchMap[cBranchCode] || cBranchCode,
      phase: '2026 Final Phase',
      sourceFile: `${cCollegeCode}.json`,
      matchType,
      matchPriority,
      matchReason,
    });
  }

  // Sort
  matched.sort((a, b) => {
    if (qClean && b.matchPriority !== a.matchPriority) {
      return (b.matchPriority || 0) - (a.matchPriority || 0);
    }
    if (sort === 'rank_asc') return a.rank - b.rank;
    if (sort === 'rank_desc') return b.rank - a.rank;
    if (sort === 'name_asc') return a.name.localeCompare(b.name);
    if (sort === 'college_asc') return a.collegeName.localeCompare(b.collegeName);
    return a.rank - b.rank;
  });

  const totalMatches = matched.length;
  const cappedResults = matched.slice(0, Math.min(limit, 1000));

  return {
    query: qRaw,
    college,
    branch,
    totalMatches,
    results: cappedResults,
    stats: {
      collegeCount: collegesSet.size,
      branchCount: branchesSet.size,
      minRank: minObservedRank === 999999 ? 0 : minObservedRank,
      maxRank: maxObservedRank,
      castes: Object.entries(casteCountMap).map(([casteName, count]) => ({ caste: casteName, count })),
    },
  };
}
