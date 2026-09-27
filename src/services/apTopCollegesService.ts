/**
 * AP EAPCET 2026 - Top B.Tech Colleges
 *
 * Uses only candidate-category OC allotment ranks from the available 2026 source
 * records. This is descriptive historical analysis, not an official ranking.
 */

export interface APTopRankStats {
  highestRank: number;
  medianRank: number;
  lowestRank: number;
  validOcAllotments: number;
}

export interface APTopCollegeBranch {
  branchCode: string;
  branchName: string;
  highestRank: number;
  medianRank: number;
  lowestRank: number;
  validOcAllotments: number;
}

export interface APTopCollege {
  collegeCode: string;
  collegeName: string;
  district: string;
  branches: Record<string, APTopCollegeBranch>;
}

interface APTopCollegeIndex {
  generatedAt: string;
  methodology: string;
  rankingBasis: string;
  totalColleges: number;
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
        throw new Error('Unable to load AP EAPCET 2026 top-college analysis index.');
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
  searchQuery = ''
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
      const branchRows = Object.values(college.branches);
      if (!branchRows.length) continue;

      const ranks = branchRows.flatMap((item) =>
        Array.from({ length: item.validOcAllotments }, (_, index) =>
          index === 0 ? item.highestRank : index === item.validOcAllotments - 1 ? item.lowestRank : item.medianRank
        )
      );
      if (!ranks.length) continue;

      const sorted = [...ranks].sort((a, b) => a - b);
      const medianRank = sorted.length % 2
        ? sorted[Math.floor(sorted.length / 2)]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

      rows.push({
        rankPosition: 0,
        collegeCode: college.collegeCode,
        collegeName: college.collegeName,
        district: college.district,
        branchCode: 'ALL',
        branchName: 'All branches with OC allotment records',
        stats: {
          highestRank: Math.min(...sorted),
          medianRank,
          lowestRank: Math.max(...sorted),
          validOcAllotments: sorted.length,
        },
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
        highestRank: branchData.highestRank,
        medianRank: branchData.medianRank,
        lowestRank: branchData.lowestRank,
        validOcAllotments: branchData.validOcAllotments,
      },
    });
  }

  rows.sort((a, b) =>
    a.stats.medianRank - b.stats.medianRank ||
    a.stats.highestRank - b.stats.highestRank ||
    a.stats.lowestRank - b.stats.lowestRank ||
    a.collegeName.localeCompare(b.collegeName)
  );

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
  const branches = new Map<string, string>();

  for (const college of index.colleges) {
    for (const branch of Object.values(college.branches)) {
      branches.set(branch.branchCode, branch.branchName);
    }
  }

  return Array.from(branches.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
