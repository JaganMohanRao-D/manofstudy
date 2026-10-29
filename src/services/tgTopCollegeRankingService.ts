import { preloadSearchIndex } from '../utils/allotmentClientSearch';
import { TG_EAPCET_COLLEGE_MANIFEST, TG_EAPCET_ALL_BRANCHES } from '../data/tgEapcetCollegeManifest';

export interface TgTopCollegeRow {
  rank: number;
  collegeCode: string;
  collegeName: string;
  district: string;
  branchCode: string;
  branchName: string;
  highestObservedRank: number;
  lowestObservedRank: number;
  medianOcRank: number;
  validOcAllotments: number;
  availableBranches: string[];
}

export interface TgTopCollegeFilters {
  branchCode: string;
  district: string;
  page: number;
  pageSize?: number;
}

export interface TgTopCollegeResponse {
  rows: TgTopCollegeRow[];
  total: number;
  totalOcAllotments: number;
  rankFloor: number;
  rankCeiling: number;
}

let cache: TgTopCollegeRow[] | null = null;
let loadPromise: Promise<TgTopCollegeRow[]> | null = null;

const SPECIAL_OC_TOKENS = new Set(['PHO', 'PHH', 'PHV', 'PHC', 'PHM', 'CAP', 'NCC', 'SPORTS', 'SG', 'PHA']);

function isPureOcAllotment(caste: unknown, seatCategory: unknown): boolean {
  if (String(caste || '').trim().toUpperCase() !== 'OC') return false;

  const tokens = String(seatCategory || '')
    .toUpperCase()
    .replace(/\([0-9]+\)/g, '')
    .split('_')
    .filter(Boolean);

  if (tokens[0] !== 'OC') return false;
  if (!tokens.includes('GEN') && !tokens.includes('GIRLS')) return false;
  if (!tokens.includes('UR') && !tokens.includes('OU')) return false;
  if (tokens.some((token) => SPECIAL_OC_TOKENS.has(token))) return false;

  return true;
}

function median(sorted: number[]): number {
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function buildRows(candidates: any[][]): TgTopCollegeRow[] {
  const byKey = new Map<string, { ranks: number[]; code: string; branch: string }>();

  for (const c of candidates) {
    const rank = Number(c?.[0]);
    if (!Number.isFinite(rank) || rank <= 0) continue;

    const collegeCode = String(c?.[6] || '').trim().toUpperCase();
    const branchCode = String(c?.[7] || '').trim().toUpperCase();
    if (!collegeCode || !branchCode) continue;

    if (!isPureOcAllotment(c?.[3], c?.[4])) continue;

    const key = `${collegeCode}__${branchCode}`;
    const item = byKey.get(key);
    if (item) item.ranks.push(rank);
    else byKey.set(key, { ranks: [rank], code: collegeCode, branch: branchCode });
  }

  const collegeMap = new Map(TG_EAPCET_COLLEGE_MANIFEST.map((c) => [c.collegeCode.toUpperCase(), c]));
  const branchMap = new Map(TG_EAPCET_ALL_BRANCHES.map((b) => [b.branchCode.toUpperCase(), b]));

  const rows: TgTopCollegeRow[] = [];

  for (const item of byKey.values()) {
    const college = collegeMap.get(item.code);
    const branch = college?.branches.find((b) => b.branchCode.toUpperCase() === item.branch);

    if (!college || !branch) continue;

    const ranks = item.ranks.filter(Number.isFinite).sort((a, b) => a - b);
    if (!ranks.length) continue;

    rows.push({
      rank: 0,
      collegeCode: college.collegeCode,
      collegeName: college.collegeName,
      district: college.district || 'Location unavailable',
      branchCode: item.branch,
      branchName: branch.branchName || branchMap.get(item.branch)?.branchName || item.branch,
      highestObservedRank: ranks[0],
      lowestObservedRank: ranks[ranks.length - 1],
      medianOcRank: median(ranks),
      validOcAllotments: ranks.length,
      availableBranches: college.branches.map((b) => b.branchName || b.branchCode),
    });
  }

  return rows;
}

export async function getTgTopCollegeRows(): Promise<TgTopCollegeRow[]> {
  if (cache) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const candidates = await preloadSearchIndex();
    cache = buildRows(candidates);
    loadPromise = null;
    return cache;
  })().catch((error) => {
    loadPromise = null;
    throw error;
  });

  return loadPromise;
}

export async function getTgTopCollegeRanking(
  filters: TgTopCollegeFilters
): Promise<TgTopCollegeResponse> {
  const rows = await getTgTopCollegeRows();

  const branchCode = (filters.branchCode || 'ALL').toUpperCase();
  const district = filters.district || 'All Districts';

  const filtered = rows.filter((row) => {
    if (branchCode !== 'ALL' && row.branchCode !== branchCode) return false;
    if (district !== 'All Districts' && row.district !== district) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (a.medianOcRank !== b.medianOcRank) return a.medianOcRank - b.medianOcRank;
    if (a.validOcAllotments !== b.validOcAllotments) return b.validOcAllotments - a.validOcAllotments;
    if (a.highestObservedRank !== b.highestObservedRank) return a.highestObservedRank - b.highestObservedRank;
    return a.collegeName.localeCompare(b.collegeName);
  });

  const ranked = filtered.map((row, index) => ({ ...row, rank: index + 1 }));
  const start = Math.max(0, (filters.page - 1) * (filters.pageSize || 10));
  const pageRows = ranked.slice(start, start + (filters.pageSize || 10));

  const totalOcAllotments = filtered.reduce((sum, row) => sum + row.validOcAllotments, 0);
  const rankFloor = filtered.length ? Math.min(...filtered.map((r) => r.highestObservedRank)) : 0;
  const rankCeiling = filtered.length ? Math.max(...filtered.map((r) => r.lowestObservedRank)) : 0;

  return {
    rows: pageRows,
    total: filtered.length,
    totalOcAllotments,
    rankFloor,
    rankCeiling,
  };
}

export function getTgRankingBranches() {
  return TG_EAPCET_ALL_BRANCHES;
}

export function getTgRankingDistricts() {
  return Array.from(
    new Set(
      TG_EAPCET_COLLEGE_MANIFEST
        .map((college) => college.district)
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b));
}
