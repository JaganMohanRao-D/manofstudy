/**
 * AP EAPCET 2026 observed college analysis.
 *
 * This module reads a build-generated index derived from the AP EAPCET 2026
 * allotment records. It never invents cutoffs: opening = minimum observed
 * rank, closing = maximum observed rank, and median = mathematical median of
 * the valid OC candidate-category records in the selected branch.
 */

export interface APTopRankStats {
  openingRank: number;
  medianRank: number;
  closingRank: number;
  validOcAllotments: number;
  observedAllotments: number;
  topRankAllotments: Record<string, number>;
  top25kAllotments: number;
  top25kSharePercent: number;
  seatStats: {
    totalSeats: number;
    filledSeats: number;
    remainingSeats: number;
    fillRatePercent: number;
    latestPhase: number;
  } | null;
}

export interface APTopCollegeBranch {
  branchCode: string;
  branchName: string;
  openingRank: number;
  medianRank: number;
  closingRank: number;
  validOcAllotments: number;
}

export interface APTopCollege {
  collegeCode: string;
  collegeName: string;
  district: string;
  branches: Record<string, APTopCollegeBranch>;
  allBranches: APTopRankStats | null;
}

interface APTopCollegeIndex {
  generatedAt: string;
  methodology: string;
  rankingBasis: string;
  totalColleges: number;
  districts: string[];
  branches: Array<{ code: string; name: string }>;
  statewideBranchStats: Record<string, APTopRankStats>;
  colleges: APTopCollege[];
}

export interface APTopCollegeRow {
  rankPosition: number;
  collegeCode: string;
  collegeName: string;
  district: string;
  branchCode: string;
  branchName: string;
  stats: APTopRankStats;
}

let cache: APTopCollegeIndex | null = null;
let pending: Promise<APTopCollegeIndex> | null = null;

export async function getAPTopCollegeIndex(): Promise<APTopCollegeIndex> {
  if (cache) return cache;
  if (pending) return pending;

  pending = fetch('/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/top_colleges_index.json')
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Unable to load the AP EAPCET 2026 college analysis index.');
      }
      const data = (await response.json()) as APTopCollegeIndex;
      cache = data;
      return data;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

export async function getAPTopCollegeRows(
  branch = 'CSE',
  district = 'ALL',
  searchQuery = '',
  sortBy:
    | 'median_asc'
    | 'opening_asc'
    | 'closing_asc'
    | 'fill_desc'
    | 'filled_desc'
    | 'remaining_asc'
    | 'top25_desc'
    | 'top25share_desc' = 'median_asc'
): Promise<APTopCollegeRow[]> {
  const index = await getAPTopCollegeIndex();
  const branchFilter = String(branch || 'CSE').trim().toUpperCase();
  const districtFilter = String(district || 'ALL').trim().toUpperCase();
  const query = String(searchQuery || '').trim().toLowerCase();

  const rows: APTopCollegeRow[] = [];

  for (const college of index.colleges) {
    if (districtFilter !== 'ALL' && college.district.toUpperCase() !== districtFilter) continue;

    if (
      query &&
      !college.collegeName.toLowerCase().includes(query) &&
      !college.collegeCode.toLowerCase().includes(query) &&
      !college.district.toLowerCase().includes(query)
    ) {
      continue;
    }

    if (branchFilter === 'ALL') {
      if (!college.allBranches || college.allBranches.validOcAllotments <= 0) continue;
      rows.push({
        rankPosition: 0,
        collegeCode: college.collegeCode,
        collegeName: college.collegeName,
        district: college.district,
        branchCode: 'ALL',
        branchName: 'All branches with OC allotment records',
        stats: college.allBranches,
      });
      continue;
    }

    const branchData = college.branches[branchFilter];
    if (!branchData || branchData.validOcAllotments <= 0) continue;

    rows.push({
      rankPosition: 0,
      collegeCode: college.collegeCode,
      collegeName: college.collegeName,
      district: college.district,
      branchCode: branchData.branchCode,
      branchName: branchData.branchName,
      stats: {
        openingRank: branchData.openingRank,
        medianRank: branchData.medianRank,
        closingRank: branchData.closingRank,
        validOcAllotments: branchData.validOcAllotments,
      },
    });
  }

  rows.sort((a, b) => {
    const aSeats = a.stats.seatStats;
    const bSeats = b.stats.seatStats;

    const primary =
      sortBy === 'opening_asc'
        ? a.stats.openingRank - b.stats.openingRank
        : sortBy === 'closing_asc'
          ? a.stats.closingRank - b.stats.closingRank
          : sortBy === 'fill_desc'
            ? (bSeats?.fillRatePercent ?? -1) - (aSeats?.fillRatePercent ?? -1)
            : sortBy === 'filled_desc'
              ? (bSeats?.filledSeats ?? -1) - (aSeats?.filledSeats ?? -1)
              : sortBy === 'remaining_asc'
                ? (aSeats?.remainingSeats ?? Number.POSITIVE_INFINITY) - (bSeats?.remainingSeats ?? Number.POSITIVE_INFINITY)
                : sortBy === 'top25_desc'
                  ? b.stats.top25kAllotments - a.stats.top25kAllotments
                  : sortBy === 'top25share_desc'
                    ? b.stats.top25kSharePercent - a.stats.top25kSharePercent
                    : a.stats.medianRank - b.stats.medianRank;

    return primary ||
      b.stats.top25kAllotments - a.stats.top25kAllotments ||
      (bSeats?.fillRatePercent ?? -1) - (aSeats?.fillRatePercent ?? -1) ||
      a.stats.medianRank - b.stats.medianRank ||
      a.collegeName.localeCompare(b.collegeName);
  });

  rows.forEach((row, index) => {
    row.rankPosition = index + 1;
  });

  return rows;
}

export async function getAPTopCollegeDistricts(): Promise<string[]> {
  const index = await getAPTopCollegeIndex();
  return Array.from(new Set(index.colleges.map((college) => college.district).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

export async function getAPTopCollegeBranches(): Promise<{ code: string; name: string }[]> {
  const index = await getAPTopCollegeIndex();
  return index.branches.length
    ? index.branches.slice().sort((a, b) => a.name.localeCompare(b.name))
    : [];
}

export function clearAPTopCollegeCache() {
  cache = null;
  pending = null;
}
