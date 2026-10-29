const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const dir = path.join(root, 'public', 'AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE');

if (!fs.existsSync(dir)) {
  throw new Error(`[ap-predictor] Missing AP 2026 dataset directory: ${dir}`);
}

const excluded = new Set([
  'index.json',
  'manifest.json',
  'search_index.json',
  'predictor_index.json',
  'quota_closing_ranks_2026.json',
  'top_colleges_index.json',
  'category_insights.json',
  'CBIT.json',
]);

function rankNumber(value) {
  const n = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

function addStat(map, quotaKey, rank) {
  if (!quotaKey || !rank) return;
  if (!map[quotaKey]) map[quotaKey] = [];
  map[quotaKey].push(rank);
}

const colleges = {};
const branchCatalog = {};
let totalRecords = 0;

for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.json') && !excluded.has(name))) {
  const filePath = path.join(dir, file);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.warn(`[ap-predictor] Skipping invalid JSON: ${file}`);
    continue;
  }

  const collegeCode = String(raw.college_code ?? raw.collegeCode ?? raw.inst_code ?? file.replace(/\.json$/i, '')).trim().toUpperCase();
  if (!collegeCode || collegeCode === 'CBIT') continue;

  const collegeName = String(raw.college_name ?? raw.collegeName ?? raw.inst_name ?? collegeCode).trim();
  const records = Array.isArray(raw.records)
    ? raw.records
    : Array.isArray(raw.allotments)
      ? raw.allotments
      : Array.isArray(raw.data)
        ? raw.data
        : [];

  if (!colleges[collegeCode]) {
    colleges[collegeCode] = {
      code: collegeCode,
      name: collegeName,
      district: '',
      branches: {},
    };
  }

  const college = colleges[collegeCode];

  for (const record of records) {
    const branchCode = String(record.branch_code ?? record.branchCode ?? '').trim().toUpperCase();
    if (!branchCode) continue;

    const branchName = String(record.branch_name ?? record.branchName ?? branchCode).trim();
    const quotaKey = String(record.allot_category ?? record.alloted_category ?? record.allotted_category ?? '').trim().toLowerCase();
    const rank = rankNumber(record.rank);
    if (!quotaKey || !rank) continue;

    totalRecords++;
    if (!college.district) college.district = String(record.district ?? '').trim();

    if (!college.branches[branchCode]) {
      college.branches[branchCode] = {
        name: branchName,
        quotas: {},
      };
    }

    if (!branchCatalog[branchCode]) {
      branchCatalog[branchCode] = branchName;
    }

    addStat(college.branches[branchCode].quotas, quotaKey, rank);
  }
}

const output = {};
for (const [collegeCode, college] of Object.entries(colleges)) {
  const branches = {};
  for (const [branchCode, branch] of Object.entries(college.branches)) {
    const quotas = {};
    for (const [quotaKey, ranks] of Object.entries(branch.quotas)) {
      ranks.sort((a, b) => a - b);
      quotas[quotaKey] = {
        min: ranks[0],
        max: ranks[ranks.length - 1],
        count: ranks.length,
        med: ranks[Math.floor(ranks.length / 2)],
      };
    }
    branches[branchCode] = {
      name: branch.name,
      quotas,
    };
  }
  output[collegeCode] = {
    code: college.code,
    name: college.name,
    district: college.district,
    branches,
  };
}

const quotaFile = path.join(dir, 'quota_closing_ranks_2026.json');
fs.writeFileSync(quotaFile, JSON.stringify(output), 'utf8');

const predictorIndex = {
  year: 2026,
  totalColleges: Object.keys(output).length,
  totalRecords,
  branches: Object.entries(branchCatalog)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code)),
  colleges: Object.values(output).map(college => ({
    code: college.code,
    name: college.name,
    district: college.district,
    branches: Object.entries(college.branches).map(([code, branch]) => ({
      code,
      name: branch.name,
    })),
  })).sort((a, b) => a.code.localeCompare(b.code)),
};

fs.writeFileSync(
  path.join(dir, 'predictor_index.json'),
  JSON.stringify(predictorIndex),
  'utf8'
);

console.log(`[ap-predictor] Generated AP 2026 quota predictor data: ${Object.keys(output).length} colleges, ${Object.keys(branchCatalog).length} branches, ${totalRecords} ranked records.`);
