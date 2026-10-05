const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const YEARS = ['2025', '2026'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCollege(raw, year) {
  const code = String(raw.college_code ?? raw.collegeCode ?? raw.code ?? raw.inst_code ?? '').trim().toUpperCase();
  const name = String(raw.college_name ?? raw.collegeName ?? raw.name ?? raw.inst_name ?? code).trim();
  const fileName = String(raw.file ?? `${code}.json`).trim().replace(/^\//, '').split('/').pop();
  const branches = Array.isArray(raw.branches) ? raw.branches.map((branch) => ({
    branchCode: String(branch.branchCode ?? branch.branch_code ?? '').trim().toUpperCase(),
    branchName: String(branch.branchName ?? branch.branch_name ?? branch.name ?? branch.branchCode ?? branch.branch_code ?? '').trim(),
    recordCount: toNumber(branch.recordCount ?? branch.records ?? branch.totalAllotted),
    minRank: toNumber(branch.minRank ?? branch.bestRank ?? branch.openingRank),
    maxRank: toNumber(branch.maxRank ?? branch.lastRank ?? branch.closingRank),
    phases: Array.isArray(branch.phases) ? branch.phases.map(Number).filter(Boolean) : [],
    categories: Array.isArray(branch.categories) ? branch.categories.map(String) : [],
  })).filter((b) => b.branchCode || b.branchName) : [];

  return {
    college_code: code,
    college_name: name,
    file: fileName,
    records: toNumber(raw.records ?? raw.recordCount ?? raw.record_count),
    recordCount: toNumber(raw.recordCount ?? raw.records ?? raw.record_count),
    branchCount: toNumber(raw.branchCount ?? branches.length),
    district: String(raw.district ?? '').trim(),
    branches,
    year,
  };
}

function repairYear(year) {
  const dir = path.join(root, 'public', `AP_EAPCET_${year}_ALLOTMENT_BY_COLLEGE`);
  const indexFile = path.join(dir, 'index.json');
  const searchFile = path.join(dir, 'search_index.json');

  if (!fs.existsSync(indexFile)) throw new Error(`[ap-repair] Missing ${indexFile}`);
  if (!fs.existsSync(searchFile)) throw new Error(`[ap-repair] Missing ${searchFile}`);

  const index = readJson(indexFile);
  const colleges = (Array.isArray(index.colleges) ? index.colleges : [])
    .map((college) => normalizeCollege(college, year))
    .filter((college) => college.college_code && college.college_name && college.file && college.college_code !== 'CBIT');

  const stats = {
    year,
    totalColleges: colleges.length,
    totalRecords: toNumber(index.totalRecords ?? index.stats?.totalRecords),
    totalBranches: toNumber(index.branchCount ?? index.stats?.totalBranches ?? Object.keys(index.branchMap ?? {}).length),
    categories: Array.isArray(index.categories) ? index.categories.map(String).sort() : [],
    allottedCategories: Array.isArray(index.allottedCategories) ? index.allottedCategories.map(String).sort() : [],
    regions: Array.isArray(index.regions) ? index.regions.map(String).sort() : [],
    phases: Array.isArray(index.phases) ? index.phases.map(Number).filter(Boolean).sort((a, b) => a - b) : [],
    minRank: toNumber(index.minRank ?? index.stats?.minRank),
    maxRank: toNumber(index.maxRank ?? index.stats?.maxRank),
    generatedAt: new Date().toISOString(),
  };

  // Keep the legacy index compatible with the older AP allotment service.
  const legacyIndex = {
    version: '2026.3',
    generated_at: stats.generatedAt,
    stats,
    colleges: colleges.map((c) => ({
      college_name: c.college_name,
      college_code: c.college_code,
      file: c.file,
      records: c.records,
      recordCount: c.recordCount,
      branchCount: c.branchCount,
      district: c.district,
      branches: c.branches,
    })),
  };
  fs.writeFileSync(indexFile, JSON.stringify(legacyIndex), 'utf8');

  // This is the manifest consumed by APAllotmentExplorer: it must contain the
  // college list and district metadata. The previous generator replaced it
  // with a branch-only manifest, which made the UI show 0 colleges/districts.
  const manifest = {
    version: '2026.3',
    generated_at: stats.generatedAt,
    stats,
    colleges: colleges.map((c) => ({
      college_code: c.college_code,
      college_name: c.college_name,
      collegeCode: c.college_code,
      collegeName: c.college_name,
      file: c.file,
      records: c.records,
      recordCount: c.recordCount,
      branchCount: c.branchCount,
      district: c.district,
      branches: c.branches,
    })),
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest), 'utf8');

  // Preserve the Cloudflare-safe search index produced by fixApSearchIndexSize,
  // while adding the statistics required by the explorer summary cards.
  const search = readJson(searchFile);
  const candidates = Array.isArray(search.candidates) ? search.candidates : [];
  const collegeMap = { ...(search.collegeMap ?? {}) };
  for (const college of colleges) {
    if (college.college_code && !collegeMap[college.college_code]) collegeMap[college.college_code] = college.college_name;
  }

  const repairedSearch = {
    ...search,
    year,
    totalRecords: stats.totalRecords || toNumber(search.totalRecords ?? candidates.length),
    collegeCount: stats.totalColleges,
    stats,
    collegeMap,
    branchMap: search.branchMap ?? index.branchMap ?? {},
  };
  fs.writeFileSync(searchFile, JSON.stringify(repairedSearch), 'utf8');

  console.log(`[ap-repair] ${year}: ${stats.totalColleges} colleges, ${stats.totalRecords} records, ${stats.totalBranches} branches; manifest/index/search metadata repaired.`);
}

function patchExplorerService() {
  const file = path.join(root, 'src/services/apEapcetAllotmentService.ts');
  let source = fs.readFileSync(file, 'utf8');

  if (!source.includes('stats?: { totalColleges?: number')) {
    source = source.replace(
      "interface SearchIndexData {\n  candidates: SearchIndexCandidate[];",
      "interface SearchIndexData {\n  candidates: SearchIndexCandidate[];\n  stats?: { totalColleges?: number; totalRecords?: number; totalBranches?: number; categories?: string[]; regions?: string[]; phases?: number[]; minRank?: number; maxRank?: number };"
    );
  }

  const oldReturn = "return {\n      candidates: Array.isArray(data.candidates) ? data.candidates : [],\n      branchMap: data.branchMap ?? {},\n      collegeMap: data.collegeMap ?? {},\n    };";
  const newReturn = "return {\n      candidates: Array.isArray(data.candidates) ? data.candidates : [],\n      branchMap: data.branchMap ?? {},\n      collegeMap: data.collegeMap ?? {},\n      stats: data.stats ?? {\n        totalColleges: Number(data.collegeCount ?? 0),\n        totalRecords: Number(data.totalRecords ?? (Array.isArray(data.candidates) ? data.candidates.length : 0)),\n        totalBranches: Object.keys(data.branchMap ?? {}).length,\n      },\n    };";

  if (source.includes(oldReturn)) {
    source = source.replace(oldReturn, newReturn);
  } else if (!source.includes('stats: data.stats')) {
    throw new Error('[ap-repair] Could not safely patch AP allotment service search-index return block.');
  }

  fs.writeFileSync(file, source, 'utf8');
  console.log('[ap-repair] AP explorer service now consumes search-index statistics.');
}

for (const year of YEARS) repairYear(year);
patchExplorerService();
console.log('[ap-repair] AP allotment index repair completed successfully.');
