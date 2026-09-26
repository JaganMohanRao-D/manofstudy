/**
 * AP EAPCET allotment data service.
 * The selected year is the source of truth:
 *   2026 -> public/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/
 *   2025 -> public/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/
 *
 * No Telangana dataset is used here. CBIT is explicitly excluded because the
 * supplied AP datasets contain that Telangana institution as an erroneous entry.
 */
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
  course_type?: string;
  district?: string;
  fee_with_exemption?: number;
  fee_with_no_exemption?: number;
  roll_no?: string;
  first_name_blurred?: string;
  last_name_visible?: string;
  roll_no_blurred?: string;
  roll_no_prefix?: string;
  total_seats?: number;
  left_over_seats?: number;
  id?: number;
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

export interface CollegeListItem {
  collegeCode: string;
  collegeName: string;
  file: string;
  recordCount: number;
}

export interface DatasetSummary {
  year: AllotmentYear;
  totalColleges: number;
  totalRecords: number;
  phases: number[];
  categories: string[];
  regions: string[];
  branches: number;
}

export interface BranchSummary {
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  count: number;
  minRank: number;
  maxRank: number;
  categoryRanks: Record<string, { minRank: number; maxRank: number; count: number }>;
}

export interface PredictorRow {
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  category: string;
  gender: string;
  region: string;
  minRank: number;
  maxRank: number;
  count: number;
  phases: number[];
}

const EXCLUDED_AP_COLLEGE_CODES = new Set(['CBIT']);
const cache = new Map<string, CollegeDetailData>();
const listCache = new Map<AllotmentYear, Promise<CollegeListItem[]>>();
const allCache = new Map<AllotmentYear, Promise<CollegeDetailData[]>>();
const summaryCache = new Map<AllotmentYear, Promise<DatasetSummary>>();

const BASE_PATH: Record<AllotmentYear, string> = {
  '2026': '/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/',
  '2025': '/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE/',
};

const normalize = (value: unknown) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9\\s]/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();

function phaseNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (text === 'first' || text === '1' || text.includes('phase 1')) return 1;
  if (text === 'second' || text === '2' || text.includes('phase 2')) return 2;
  if (text === 'third' || text === '3' || text.includes('phase 3')) return 3;
  return 0;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

async function loadIndex(year: AllotmentYear): Promise<CollegeListItem[]> {
  const existing = listCache.get(year);
  if (existing) return existing;

  const promise = (async () => {
    const response = await fetch(BASE_PATH[year] + 'index.json');
    if (!response.ok) throw new Error('Unable to load AP EAPCET ' + year + ' index');
    const data = await response.json();

    return (Array.isArray(data.colleges) ? data.colleges : [])
      .map((college: any) => ({
        collegeCode: String(college.college_code ?? college.collegeCode ?? '').trim(),
        collegeName: String(college.college_name ?? college.collegeName ?? '').trim(),
        file: String(college.file ?? '').trim(),
        recordCount: Number(college.records ?? college.record_count ?? 0),
      }))
      .filter(
        (college: CollegeListItem) =>
          college.collegeCode &&
          college.collegeName &&
          college.file &&
          !EXCLUDED_AP_COLLEGE_CODES.has(college.collegeCode.toUpperCase())
      )
      .sort((a, b) => a.collegeName.localeCompare(b.collegeName));
  })();

  listCache.set(year, promise);
  return promise;
}

export async function getCollegeList(year: AllotmentYear = '2026') {
  return loadIndex(year);
}

function parseCollege(raw: any, meta: CollegeListItem): CollegeDetailData {
  const collegeCode = String(raw.college_code ?? raw.collegeCode ?? raw.inst_code ?? meta.collegeCode).trim();
  const collegeName = String(raw.college_name ?? raw.collegeName ?? raw.inst_name ?? meta.collegeName).trim();
  const records: AllotmentRecord[] = [];
  const branchMap = new Map<string, { name: string; records: AllotmentRecord[] }>();

  const push = (source: any, branchCodeHint = '', branchNameHint = '') => {
    const rank = asOptionalNumber(source.rank);
    if (!rank || rank <= 0) return;

    const record: AllotmentRecord = {
      rank: Math.round(rank),
      cand_name: String(source.cand_name ?? source.applicant_name ?? source.name ?? '').trim(),
      gender: String(source.gender ?? '').trim().toUpperCase(),
      category: String(source.category ?? source.community ?? '').trim(),
      region: String(source.region ?? '').trim().toUpperCase(),
      alloted_category: String(
        source.alloted_category ?? source.allot_category ?? source.allotted_category ?? ''
      ).trim(),
      phase: phaseNumber(source.phase),
      college_code: collegeCode,
      college_name: collegeName,
      branch_code: String(source.branch_code ?? branchCodeHint ?? '').trim(),
      branch_name: String(source.branch_name ?? branchNameHint ?? source.branch ?? '').trim(),
      course_type: source.course_type,
      district: source.district,
      fee_with_exemption: asOptionalNumber(source.fee_with_exemption),
      fee_with_no_exemption: asOptionalNumber(source.fee_with_no_exemption),
      roll_no: source.roll_no,
      first_name_blurred: source.first_name_blurred,
      last_name_visible: source.last_name_visible,
      roll_no_blurred: source.roll_no_blurred,
      roll_no_prefix: source.roll_no_prefix,
      total_seats: asOptionalNumber(source.total_seats),
      left_over_seats: asOptionalNumber(source.left_over_seats),
      id: asOptionalNumber(source.id),
    };

    records.push(record);
    const key = record.branch_code || record.branch_name || 'UNKNOWN';
    if (!branchMap.has(key)) {
      branchMap.set(key, { name: record.branch_name || key, records: [] });
    }
    branchMap.get(key)!.records.push(record);
  };

  if (Array.isArray(raw.records)) {
    raw.records.forEach((record: any) => push(record));
  }

  if (Array.isArray(raw.branches)) {
    raw.branches.forEach((branch: any) => {
      (branch.records ?? []).forEach((record: any) =>
        push(record, String(branch.branch_code ?? branch.branch ?? '').trim(), String(branch.branch_name ?? '').trim())
      );
    });
  }

  const branches = Array.from(branchMap.entries())
    .map(([branchCode, value]) => ({
      branch_code: branchCode,
      branch_name: value.name,
      recordCount: value.records.length,
      records: value.records,
    }))
    .sort((a, b) => a.branch_name.localeCompare(b.branch_name));

  return {
    college_code: collegeCode,
    college_name: collegeName,
    file: meta.file,
    recordCount: records.length,
    branchCount: branches.length,
    branches,
    allRecords: records,
  };
}

export async function getCollegeDetails(
  year: AllotmentYear,
  collegeCode: string
): Promise<CollegeDetailData | null> {
  const code = String(collegeCode ?? '').trim().toUpperCase();
  if (!code || code === 'ALL' || EXCLUDED_AP_COLLEGE_CODES.has(code)) return null;

  const cacheKey = year + ':' + code;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const list = await loadIndex(year);
  const meta = list.find((college) => college.collegeCode.toUpperCase() === code);
  if (!meta) return null;

  const response = await fetch(BASE_PATH[year] + meta.file);
  if (!response.ok) throw new Error('Unable to load ' + meta.collegeName);

  const parsed = parseCollege(await response.json(), meta);
  cache.set(cacheKey, parsed);
  return parsed;
}

export async function loadAllColleges(year: AllotmentYear): Promise<CollegeDetailData[]> {
  const cached = allCache.get(year);
  if (cached) return cached;

  const promise = (async () => {
    const list = await loadIndex(year);
    const output: CollegeDetailData[] = [];

    for (let start = 0; start < list.length; start += 12) {
      const chunk = await Promise.all(
        list.slice(start, start + 12).map(async (college) => {
          try {
            return await getCollegeDetails(year, college.collegeCode);
          } catch (error) {
            console.warn('Failed to load AP allotment college', college.collegeCode, error);
            return null;
          }
        })
      );
      output.push(...(chunk.filter(Boolean) as CollegeDetailData[]));
    }

    return output;
  })();

  allCache.set(year, promise);
  return promise;
}

export async function getDatasetSummary(year: AllotmentYear): Promise<DatasetSummary> {
  const cached = summaryCache.get(year);
  if (cached) return cached;

  const promise = (async () => {
    const colleges = await loadAllColleges(year);
    const phaseSet = new Set<number>();
    const categorySet = new Set<string>();
    const regionSet = new Set<string>();
    const branchSet = new Set<string>();
    let totalRecords = 0;

    colleges.forEach((college) => {
      totalRecords += college.recordCount;
      college.allRecords.forEach((record) => {
        if (record.phase) phaseSet.add(record.phase);
        if (record.category) categorySet.add(record.category);
        if (record.region) regionSet.add(record.region);
        if (record.branch_code) branchSet.add(record.branch_code);
      });
    });

    return {
      year,
      totalColleges: colleges.length,
      totalRecords,
      phases: Array.from(phaseSet).sort((a, b) => a - b),
      categories: Array.from(categorySet).sort(),
      regions: Array.from(regionSet).sort(),
      branches: branchSet.size,
    };
  })();

  summaryCache.set(year, promise);
  return promise;
}

export interface SearchOptions {
  nameQuery?: string;
  exactRank?: number;
  minRank?: number;
  maxRank?: number;
  collegeCode?: string;
  branchCode?: string;
  category?: string;
  allottedCategory?: string;
  gender?: string;
  region?: string;
  phase?: PhaseFilter | number;
  limit?: number;
}

export async function searchAllotments(
  year: AllotmentYear,
  options: SearchOptions = {}
): Promise<AllotmentRecord[]> {
  const limit = options.limit ?? 500;
  const targetCollege = String(options.collegeCode ?? 'ALL').toUpperCase();
  const colleges =
    targetCollege === 'ALL'
      ? await loadAllColleges(year)
      : [await getCollegeDetails(year, targetCollege)].filter(Boolean) as CollegeDetailData[];

  const nameQuery = normalize(options.nameQuery);
  const phase = options.phase && options.phase !== 'ALL' ? Number(options.phase) : 0;
  const results: AllotmentRecord[] = [];

  for (const college of colleges) {
    for (const record of college.allRecords) {
      if (nameQuery && !normalize(record.cand_name).includes(nameQuery)) continue;
      if (options.exactRank && record.rank !== options.exactRank) continue;
      if (options.minRank && record.rank < options.minRank) continue;
      if (options.maxRank && record.rank > options.maxRank) continue;
      if (options.branchCode && options.branchCode !== 'ALL' && record.branch_code !== options.branchCode) continue;
      if (options.category && options.category !== 'ALL' && record.category !== options.category) continue;
      if (options.allottedCategory && options.allottedCategory !== 'ALL' && record.alloted_category !== options.allottedCategory) continue;
      if (options.gender && options.gender !== 'ALL' && record.gender !== options.gender) continue;
      if (options.region && options.region !== 'ALL' && record.region !== options.region) continue;
      if (phase && record.phase !== phase) continue;

      results.push(record);
      if (results.length >= limit) return results;
    }
  }

  return results;
}

export async function getBranchSummaries(year: AllotmentYear): Promise<BranchSummary[]> {
  const colleges = await loadAllColleges(year);
  const summaries: BranchSummary[] = [];

  for (const college of colleges) {
    for (const branch of college.branches) {
      let minRank = Infinity;
      let maxRank = 0;
      const categoryRanks: BranchSummary['categoryRanks'] = {};

      for (const record of branch.records) {
        minRank = Math.min(minRank, record.rank);
        maxRank = Math.max(maxRank, record.rank);
        const category = record.category || 'UNKNOWN';
        if (!categoryRanks[category]) {
          categoryRanks[category] = { minRank: Infinity, maxRank: 0, count: 0 };
        }
        categoryRanks[category].minRank = Math.min(categoryRanks[category].minRank, record.rank);
        categoryRanks[category].maxRank = Math.max(categoryRanks[category].maxRank, record.rank);
        categoryRanks[category].count += 1;
      }

      summaries.push({
        collegeCode: college.college_code,
        collegeName: college.college_name,
        branchCode: branch.branch_code,
        branchName: branch.branch_name,
        count: branch.recordCount,
        minRank: minRank === Infinity ? 0 : minRank,
        maxRank,
        categoryRanks,
      });
    }
  }

  return summaries;
}

/**
 * Backward-compatible 2026 search API used by APStudentSearch.
 * The component historically called search2026(options); keep that contract
 * while routing all searches through the year-aware searchAllotments service.
 */
export async function search2026(
  options: SearchOptions & { rank?: number } = {}
): Promise<AllotmentRecord[]> {
  const { rank, ...rest } = options;
  return searchAllotments('2026', {
    ...rest,
    exactRank: rest.exactRank ?? rank,
  });
}

export async function get2026BranchSummaries() {
  return getBranchSummaries('2026');
}

export async function get2026PredictorRows(): Promise<PredictorRow[]> {
  const colleges = await loadAllColleges('2026');
  const grouped = new Map<string, PredictorRow>();

  for (const college of colleges) {
    for (const record of college.allRecords) {
      if (!record.category) continue;
      const key = [
        college.college_code,
        record.branch_code,
        record.category,
        record.gender || 'ALL',
        record.region || 'ALL',
      ].join('||');

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          collegeCode: college.college_code,
          collegeName: college.college_name,
          branchCode: record.branch_code,
          branchName: record.branch_name,
          category: record.category,
          gender: record.gender || 'ALL',
          region: record.region || 'ALL',
          minRank: record.rank,
          maxRank: record.rank,
          count: 1,
          phases: record.phase ? [record.phase] : [],
        });
      } else {
        existing.minRank = Math.min(existing.minRank, record.rank);
        existing.maxRank = Math.max(existing.maxRank, record.rank);
        existing.count += 1;
        if (record.phase && !existing.phases.includes(record.phase)) existing.phases.push(record.phase);
      }
    }
  }

  return Array.from(grouped.values()).map((row) => ({
    ...row,
    phases: row.phases.sort((a, b) => a - b),
  }));
}
