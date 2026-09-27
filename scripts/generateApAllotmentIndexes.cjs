const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'public', 'AP_EAPCET');
const DATASETS = {
  '2025': path.join(process.cwd(), 'public', 'AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE'),
  '2026': path.join(process.cwd(), 'public', 'AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE'),
};
const EXCLUDED = new Set(['index.json', 'manifest.json', 'search_index.json', 'top_colleges_index.json', 'CBIT.json']);

function phaseNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const s = String(value ?? '').trim().toLowerCase();
  if (s === '1' || s.includes('first')) return 1;
  if (s === '2' || s.includes('second')) return 2;
  if (s === '3' || s.includes('third')) return 3;
  return 0;
}

function num(value) {
  const n = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function normalizeRecord(year, r, collegeCode, collegeName, branchCode = '', branchName = '') {
  if (year === '2026') {
    return {
      rank: num(r.rank),
      name: String(r.applicant_name ?? r.cand_name ?? r.name ?? '').trim(),
      gender: String(r.gender ?? '').trim().toUpperCase(),
      category: String(r.community ?? r.category ?? '').trim().toUpperCase(),
      region: String(r.region ?? '').trim().toUpperCase(),
      allottedCategory: String(r.allot_category ?? r.alloted_category ?? r.allotted_category ?? '').trim().toUpperCase(),
      phase: phaseNumber(r.phase),
      collegeCode,
      collegeName,
      branchCode: String(r.branch_code ?? branchCode ?? '').trim().toUpperCase(),
      branchName: String(r.branch_name ?? branchName ?? '').trim(),
      district: String(r.district ?? '').trim(),
    };
  }
  return {
    rank: num(r.rank),
    name: String(r.cand_name ?? r.applicant_name ?? r.name ?? '').trim(),
    gender: String(r.gender ?? '').trim().toUpperCase(),
    category: String(r.category ?? r.community ?? '').trim().toUpperCase(),
    region: String(r.region ?? '').trim().toUpperCase(),
    allottedCategory: String(r.alloted_category ?? r.allot_category ?? r.allotted_category ?? '').trim().toUpperCase(),
    phase: phaseNumber(r.phase),
    collegeCode,
    collegeName,
    branchCode: String(r.branch_code ?? branchCode ?? '').trim().toUpperCase(),
    branchName: String(r.branch_name ?? branchName ?? '').trim(),
  };
}

function processYear(year, dir) {
  if (!fs.existsSync(dir)) throw new Error(`Missing AP EAPCET ${year} directory: ${dir}`);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !EXCLUDED.has(f));
  const colleges = [];
  const candidates = [];
  const branchMap = {};
  const categorySet = new Set();
  const allottedSet = new Set();
  const regionSet = new Set();
  const phaseSet = new Set();
  const branchSet = new Set();
  const apTopCollegeStats = new Map();
  let totalRecords = 0;
  let minRank = Infinity;
  let maxRank = 0;

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const collegeCode = String(raw.college_code ?? raw.collegeCode ?? raw.inst_code ?? file.replace(/\.json$/i, '')).trim().toUpperCase();
    const collegeName = String(raw.college_name ?? raw.collegeName ?? raw.inst_name ?? collegeCode).trim();
    const records = [];
    const branchSummaries = new Map();

    const add = (r, branchCode = '', branchName = '') => {
      const x = normalizeRecord(year, r, collegeCode, collegeName, branchCode, branchName);
      if (!x.rank || !x.name) return;
      records.push(x);
      totalRecords++;
      minRank = Math.min(minRank, x.rank);
      maxRank = Math.max(maxRank, x.rank);
      if (x.category) categorySet.add(x.category);
      if (x.allottedCategory) allottedSet.add(x.allottedCategory);
      if (x.region) regionSet.add(x.region);
      if (x.phase) phaseSet.add(x.phase);
      if (x.branchCode) {
        branchSet.add(x.branchCode);
        branchMap[x.branchCode] = x.branchName || x.branchCode;
      }

      if (year === '2026' && x.category === 'OC' && x.branchCode) {
        const key = x.collegeCode + '::' + x.branchCode;
        if (!apTopCollegeStats.has(key)) apTopCollegeStats.set(key, { collegeCode: x.collegeCode, collegeName: x.collegeName, district: x.district || 'Andhra Pradesh', branchCode: x.branchCode, branchName: x.branchName || x.branchCode, ocRanks: [] });
        apTopCollegeStats.get(key).ocRanks.push(x.rank);
      }
      const key = x.branchCode || 'UNKNOWN';
      if (!branchSummaries.has(key)) branchSummaries.set(key, { branchCode: key, branchName: x.branchName || key, recordCount: 0, minRank: Infinity, maxRank: 0, phases: new Set(), categories: new Set() });
      const b = branchSummaries.get(key);
      b.recordCount++;
      b.minRank = Math.min(b.minRank, x.rank);
      b.maxRank = Math.max(b.maxRank, x.rank);
      if (x.phase) b.phases.add(x.phase);
      if (x.category) b.categories.add(x.category);
      candidates.push([x.rank, x.name, x.gender, x.category, x.region, x.allottedCategory, x.phase, x.collegeCode, x.branchCode, String(r.roll_no ?? r.hall_ticket ?? r.hallTicket ?? '')]);
    };

    if (year === '2026') {
      for (const r of (Array.isArray(raw.records) ? raw.records : [])) add(r, r.branch_code, r.branch_name);
    } else {
      for (const b of (Array.isArray(raw.branches) ? raw.branches : [])) {
        for (const r of (Array.isArray(b.records) ? b.records : [])) add(r, b.branch_code, b.branch_name);
      }
    }

    const branches = Array.from(branchSummaries.values()).map(b => ({
      branchCode: b.branchCode,
      branchName: b.branchName,
      recordCount: b.recordCount,
      minRank: b.minRank === Infinity ? 0 : b.minRank,
      maxRank: b.maxRank,
      phases: Array.from(b.phases).sort((a,b)=>a-b),
      categories: Array.from(b.categories).sort(),
    })).sort((a,b)=>a.branchCode.localeCompare(b.branchCode));

    colleges.push({
      collegeCode,
      collegeName,
      file,
      recordCount: records.length,
      branchCount: branches.length,
      minRank: records.length ? Math.min(...records.map(r=>r.rank)) : 0,
      maxRank: records.length ? Math.max(...records.map(r=>r.rank)) : 0,
      district: records.find(r => r.district)?.district || 'Andhra Pradesh',
      branches,
    });
  }

  colleges.sort((a,b)=>a.collegeCode.localeCompare(b.collegeCode));
  const stats = {
    year,
    totalColleges: colleges.length,
    totalRecords,
    totalBranches: branchSet.size,
    categories: Array.from(categorySet).sort(),
    allottedCategories: Array.from(allottedSet).sort(),
    regions: Array.from(regionSet).sort(),
    phases: Array.from(phaseSet).sort((a,b)=>a-b),
    minRank: minRank === Infinity ? 0 : minRank,
    maxRank,
    generatedAt: new Date().toISOString(),
  };

  const manifest = { version: `${year}.2`, generated_at: stats.generatedAt, stats, colleges };
  const searchIndex = {
    version: `${year}.2`,
    generated_at: stats.generatedAt,
    stats,
    collegeMap: Object.fromEntries(colleges.map(c => [c.collegeCode, c.collegeName])),
    branchMap,
    candidates,
  };

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, 'search_index.json'), JSON.stringify(searchIndex));

  // AP 2026 Top B.Tech College analysis index.
  // Only candidate-category OC records are used. Opening = minimum observed
  // rank, closing = maximum observed rank, median = mathematical median.
  if (year === '2026') {
    const rankStats = (ranks) => {
      const valid = ranks.filter((rank) => Number.isFinite(rank) && rank > 0).sort((a, b) => a - b);
      if (!valid.length) return null;
      const middle = Math.floor(valid.length / 2);
      const median = valid.length % 2
        ? valid[middle]
        : (valid[middle - 1] + valid[middle]) / 2;
      return {
        openingRank: valid[0],
        medianRank: median,
        closingRank: valid[valid.length - 1],
        validOcAllotments: valid.length,
      };
    };

    const collegeMap = new Map();
    const branchRankMap = new Map();
    const branchNameMap = new Map();
    const districtMap = new Map();

    for (const file of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const code = String(raw.college_code ?? raw.collegeCode ?? raw.inst_code ?? file.replace(/\.json$/i, '')).trim().toUpperCase();
      if (code === 'CBIT') continue;

      const name = String(raw.college_name ?? raw.collegeName ?? raw.inst_name ?? code).trim();
      const records = Array.isArray(raw.records) ? raw.records : [];
      const district = String(
        records.find((record) => record && record.district)?.district ?? 'Andhra Pradesh'
      ).trim() || 'Andhra Pradesh';

      if (!collegeMap.has(code)) {
        collegeMap.set(code, {
          collegeCode: code,
          collegeName: name,
          district,
          branches: new Map(),
          allRanks: [],
        });
      }

      const college = collegeMap.get(code);
      districtMap.set(district, true);

      for (const record of records) {
        const rank = num(record.rank);
        const branchCode = String(record.branch_code ?? '').trim().toUpperCase();
        const branchName = String(record.branch_name ?? branchCode).trim();
        const category = String(record.community ?? record.category ?? '').trim().toUpperCase();
        if (!rank || category !== 'OC' || !branchCode) continue;

        college.allRanks.push(rank);
        const branchKey = code + '::' + branchCode;
        if (!branchRankMap.has(branchKey)) branchRankMap.set(branchKey, []);
        branchRankMap.get(branchKey).push(rank);
        branchNameMap.set(branchCode, branchName);

        if (!college.branches.has(branchCode)) {
          college.branches.set(branchCode, { branchCode, branchName, ranks: [] });
        }
        college.branches.get(branchCode).ranks.push(rank);
      }
    }

    const topColleges = Array.from(collegeMap.values()).map((college) => {
      const branches = {};
      for (const [branchCode, branch] of college.branches.entries()) {
        const stats = rankStats(branch.ranks);
        if (stats) {
          branches[branchCode] = {
            branchCode,
            branchName: branch.branchName,
            ...stats,
          };
        }
      }

      return {
        collegeCode: college.collegeCode,
        collegeName: college.collegeName,
        district: college.district,
        branches,
        allBranches: rankStats(college.allRanks),
      };
    }).filter((college) => Object.keys(college.branches).length > 0)
      .sort((a, b) => a.collegeCode.localeCompare(b.collegeCode));

    const statewideBranchRanks = new Map();
    for (const [key, ranks] of branchRankMap.entries()) {
      const branchCode = key.split('::')[1];
      if (!statewideBranchRanks.has(branchCode)) statewideBranchRanks.set(branchCode, []);
      statewideBranchRanks.get(branchCode).push(...ranks);
    }

    const statewideBranchStats = {};
    for (const [branchCode, ranks] of statewideBranchRanks.entries()) {
      const stats = rankStats(ranks);
      if (stats) statewideBranchStats[branchCode] = stats;
    }

    const branches = Array.from(branchNameMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const topIndex = {
      generatedAt: new Date().toISOString(),
      methodology: 'Observed AP EAPCET 2026 allotment analysis using valid candidate-category OC records.',
      rankingBasis: 'Branch-wise comparison sorted by mathematical median observed OC rank; opening and closing are the minimum and maximum observed OC ranks.',
      totalColleges: topColleges.length,
      districts: Array.from(districtMap.keys()).sort((a, b) => a.localeCompare(b)),
      branches,
      statewideBranchStats,
      colleges: topColleges,
    };

    fs.writeFileSync(
      path.join(dir, 'top_colleges_index.json'),
      JSON.stringify(topIndex),
      'utf8'
    );
    console.log(`Generated AP 2026 top-colleges index: ${topColleges.length} colleges, ${branches.length} branches`);
  }
  console.log(`AP EAPCET ${year}: ${colleges.length} colleges, ${totalRecords} records, ${candidates.length} indexed candidates`);
}

for (const [year, dir] of Object.entries(DATASETS)) processYear(year, dir);
