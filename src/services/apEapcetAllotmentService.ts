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
  minRank: number;
  maxRank: number;
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
    const response = await fetch(BASE_PATH[year] + 'manifest.json');
    if (!response.ok) throw new Error('Unable to load AP EAPCET ' + year + ' index');
    const data = await response.json();

    return (Array.isArray(data.colleges) ? data.colleges : [])
      .map((college: any) => ({
        collegeCode: String(college.college_code ?? college.collegeCode ?? '').trim(),
        collegeName: String(college.college_name ?? college.collegeName ?? '').trim(),
        file: String(college.file ?? '').trim(),
        recordCount: Number(college.recordCount ?? college.records ?? college.record_count ?? 0),
        district: String(college.district ?? '').trim(),
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

export async function getAvailableBranches(
  year: AllotmentYear = '2026'
): Promise<Array<{ branchCode: string; branchName: string }>> {
  const { branchMap = {} } = await loadSearchIndex(year);
  return Object.entries(branchMap)
    .filter(([code, name]) => Boolean(code && String(name).trim()))
    .map(([branchCode, branchName]) => ({
      branchCode: String(branchCode).trim().toUpperCase(),
      branchName: String(branchName).trim(),
    }))
    .sort((a, b) => a.branchName.localeCompare(b.branchName));
}

export function getAvailableDistricts(colleges: CollegeListItem[]): string[] {
  return Array.from(new Set(colleges.map((c) => String(c.district ?? '').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b));
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
    const index = await loadSearchIndex(year);
    const stats = index.stats ?? {};
    return {
      year,
      totalColleges: Number(stats.totalColleges ?? (await loadIndex(year)).length),
      totalRecords: Number(stats.totalRecords ?? index.candidates.length),
      phases: Array.isArray(stats.phases) ? stats.phases.map(Number).filter(Boolean).sort((a,b)=>a-b) : [],
      categories: Array.isArray(stats.categories) ? stats.categories.map(String).sort() : [],
      regions: Array.isArray(stats.regions) ? stats.regions.map(String).sort() : [],
      branches: Number(stats.totalBranches ?? Object.keys(index.branchMap ?? {}).length),
      minRank: Number(stats.minRank ?? 0),
      maxRank: Number(stats.maxRank ?? 0),
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
  hallTicket?: string;
  phase?: PhaseFilter | number;
  limit?: number;
}

type SearchIndexCandidate = [number, string, string, string, string, string, number, string, string, string];

interface SearchIndexData {
  candidates: SearchIndexCandidate[];
  stats?: { totalColleges?: number; totalRecords?: number; totalBranches?: number; categories?: string[]; regions?: string[]; phases?: number[]; minRank?: number; maxRank?: number };
  branchMap?: Record<string, string>;
  collegeMap?: Record<string, string>;
}

const searchIndexCache = new Map<AllotmentYear, Promise<SearchIndexData>>();

async function loadSearchIndex(year: AllotmentYear): Promise<SearchIndexData> {
  const cached = searchIndexCache.get(year);
  if (cached) return cached;
  const promise = (async () => {
    const response = await fetch(BASE_PATH[year] + 'search_index.json');
    if (!response.ok) throw new Error(`Unable to load AP EAPCET ${year} search index (HTTP ${response.status})`);
    const data = await response.json();
    return {
      candidates: Array.isArray(data.candidates) ? data.candidates : [],
      branchMap: data.branchMap ?? {},
      collegeMap: data.collegeMap ?? {},
    };
  })();
  searchIndexCache.set(year, promise);
  return promise;
}

export async function searchAllotments(year: AllotmentYear, options: SearchOptions = {}): Promise<AllotmentRecord[]> {
  const { candidates, branchMap = {}, collegeMap = {} } = await loadSearchIndex(year);
  const limit = Math.max(1, Math.min(options.limit ?? 500, 1000));
  const nameQuery = normalize(options.nameQuery);
  const phase = options.phase && options.phase !== 'ALL' ? Number(options.phase) : 0;
  const targetCollege = String(options.collegeCode ?? 'ALL').trim().toUpperCase();
  const targetBranch = String(options.branchCode ?? 'ALL').trim().toUpperCase();
  const targetCategory = String(options.category ?? 'ALL').trim().toUpperCase();
  const targetAllotted = String(options.allottedCategory ?? 'ALL').trim().toUpperCase();
  const targetGender = String(options.gender ?? 'ALL').trim().toUpperCase();
  const targetRegion = String(options.region ?? 'ALL').trim().toUpperCase();
  const results: AllotmentRecord[] = [];

  for (const raw of candidates) {
    const [rank, candName, gender, category, region, allottedCategory, rawPhase, collegeCode, branchCode, hallTicket] = raw;
    if (!rank || rank <= 0) continue;
    if (nameQuery && !normalize(candName).includes(nameQuery)) continue;
    if (options.exactRank && rank !== options.exactRank) continue;
    if (options.minRank && rank < options.minRank) continue;
    if (options.maxRank && rank > options.maxRank) continue;
    if (targetCollege !== 'ALL' && String(collegeCode).toUpperCase() !== targetCollege) continue;
    if (targetBranch !== 'ALL' && String(branchCode).toUpperCase() !== targetBranch) continue;
    if (targetCategory !== 'ALL' && String(category).toUpperCase() !== targetCategory) continue;
    if (targetAllotted !== 'ALL' && String(allottedCategory).toUpperCase() !== targetAllotted) continue;
    if (targetGender !== 'ALL' && String(gender).toUpperCase() !== targetGender) continue;
    if (targetRegion !== 'ALL' && String(region).toUpperCase() !== targetRegion) continue;
    if (options.hallTicket && !String(hallTicket ?? '').toUpperCase().includes(String(options.hallTicket).trim().toUpperCase())) continue;
    if (phase && Number(rawPhase) !== phase) continue;

    const code = String(collegeCode ?? '').toUpperCase();
    if (EXCLUDED_AP_COLLEGE_CODES.has(code)) continue;
    const bcode = String(branchCode ?? '').toUpperCase();
    results.push({
      rank: Number(rank),
      cand_name: String(candName ?? ''),
      gender: String(gender ?? '').toUpperCase(),
      category: String(category ?? ''),
      region: String(region ?? '').toUpperCase(),
      alloted_category: String(allottedCategory ?? ''),
      phase: Number(rawPhase) || 0,
      college_code: code,
      college_name: String(collegeMap[code] ?? collegeCode ?? ''),
      branch_code: bcode,
      branch_name: String(branchMap[bcode] ?? branchCode ?? ''),
      roll_no: String(hallTicket ?? ''),
    });
    if (results.length >= limit) break;
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
  const { candidates, branchMap = {}, collegeMap = {} } = await loadSearchIndex('2026');
  const grouped = new Map<string, PredictorRow>();

  for (const raw of candidates) {
    const [rank, _candidateName, gender, category, region, _allottedCategory, phase, collegeCodeRaw, branchCodeRaw] = raw;
    const rankNumber = Number(rank);
    if (!Number.isFinite(rankNumber) || rankNumber <= 0 || !category) continue;

    const collegeCode = String(collegeCodeRaw ?? '').trim().toUpperCase();
    const branchCode = String(branchCodeRaw ?? '').trim().toUpperCase();
    if (!collegeCode || !branchCode || EXCLUDED_AP_COLLEGE_CODES.has(collegeCode)) continue;

    const normalizedGender = String(gender ?? '').trim().toUpperCase() || 'ALL';
    const normalizedRegion = String(region ?? '').trim().toUpperCase() || 'ALL';
    const normalizedCategory = String(category ?? '').trim().toUpperCase();
    const phaseNumberValue = Number(phase) || 0;

    const key = [
      collegeCode,
      branchCode,
      normalizedCategory,
      normalizedGender,
      normalizedRegion,
    ].join('||');

    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        collegeCode,
        collegeName: String(collegeMap[collegeCode] ?? collegeCode),
        branchCode,
        branchName: String(branchMap[branchCode] ?? branchCode),
        category: normalizedCategory,
        gender: normalizedGender,
        region: normalizedRegion,
        minRank: rankNumber,
        maxRank: rankNumber,
        count: 1,
        phases: phaseNumberValue ? [phaseNumberValue] : [],
      });
    } else {
      existing.minRank = Math.min(existing.minRank, rankNumber);
      existing.maxRank = Math.max(existing.maxRank, rankNumber);
      existing.count += 1;
      if (phaseNumberValue && !existing.phases.includes(phaseNumberValue)) {
        existing.phases.push(phaseNumberValue);
      }
    }
  }

  return Array.from(grouped.values()).map((row) => ({
    ...row,
    phases: row.phases.sort((a, b) => a - b),
  }));
}
