/**
 * AP EAPCET 2026 observed college analysis.
 *
 * Ranking rule:
 * - Overall college order is based ONLY on median observed OC allotment rank.
 * - Lower median rank appears earlier in the list.
 * - Search and filters only narrow the already-ranked list; they never
 *   renumber the results.
 * - Seat and rank-threshold metrics remain contextual information and are not
 *   used to calculate the college's overall rank.
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

export interface APTopCollegeBranch extends APTopRankStats {
  branchCode: string;
  branchName: string;
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
  /** Stable rank for the selected branch/all-branch view before any search/filter is applied. */
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

function compareByMedian(a: APTopCollegeRow, b: APTopCollegeRow): number {
  const aMedian = a.stats.medianRank > 0 ? a.stats.medianRank : Number.POSITIVE_INFINITY;
  const bMedian = b.stats.medianRank > 0 ? b.stats.medianRank : Number.POSITIVE_INFINITY;

  if (aMedian !== bMedian) return aMedian - bMedian;

  // Deterministic ordering for equal medians. This is NOT another ranking
  // metric; it only prevents the order from changing between builds.
  return a.collegeName.localeCompare(b.collegeName) || a.collegeCode.localeCompare(b.collegeCode);
}

/**
 * Returns rows with a stable overall rank.
 *
 * `searchQuery`, `district`, and the legacy `sortBy` argument are deliberately
 * applied only after the complete branch ranking has been created. This fixes
 * the bug where searching for a college made that college appear as #1.
 *
 * `sortBy` is retained in the signature so existing callers remain compatible,
 * but it no longer changes the ranking methodology.
 */
export async function getAPTopCollegeRows(
  branch = 'CSE',
  district = 'ALL',
  searchQuery = '',
  _sortBy:
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

  // Build the COMPLETE ranking first. Nothing below this point is allowed to
  // change rankPosition.
  const rankedRows: APTopCollegeRow[] = [];

  for (const college of index.colleges) {
    if (branchFilter === 'ALL') {
      if (!college.allBranches || college.allBranches.validOcAllotments <= 0) continue;
      rankedRows.push({
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

    rankedRows.push({
      rankPosition: 0,
      collegeCode: college.collegeCode,
      collegeName: college.collegeName,
      district: college.district,
      branchCode: branchData.branchCode,
      branchName: branchData.branchName,
      stats: branchData,
    });
  }

  rankedRows.sort(compareByMedian);
  rankedRows.forEach((row, index) => {
    row.rankPosition = index + 1;
  });

  // Search/filter after ranking. The stored rank is intentionally preserved.
  return rankedRows.filter((row) => {
    if (districtFilter !== 'ALL' && row.district.toUpperCase() !== districtFilter) {
      return false;
    }

    if (!query) return true;

    return (
      row.collegeName.toLowerCase().includes(query) ||
      row.collegeCode.toLowerCase().includes(query) ||
      row.district.toLowerCase().includes(query)
    );
  });
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
