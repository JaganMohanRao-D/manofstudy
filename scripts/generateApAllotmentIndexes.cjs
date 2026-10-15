const fs = require('fs');
const path = require('path');

const DATASETS = {
  '2025': path.join(process.cwd(), 'public', 'AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE'),
  '2026': path.join(process.cwd(), 'public', 'AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE'),
};
// Reuse verified AP 2026 campus locations for colleges that also appear in
// the 2025 allotment dataset. 2025 source rows do not carry district values.
const districtByCollegeCode = new Map();
try {
  const manifest2026 = JSON.parse(fs.readFileSync(
    path.join(DATASETS['2026'], 'manifest.json'),
    'utf8'
  ));
  for (const college of (manifest2026.colleges || [])) {
    const code = String(college.collegeCode ?? college.college_code ?? '').trim().toUpperCase();
    const district = String(college.district ?? '').trim();
    if (code && district && district.toUpperCase() !== 'ANDHRA PRADESH') {
      districtByCollegeCode.set(code, district);
    }
  }
} catch (error) {
  console.warn('[ap-index] Could not read AP 2026 district reference; district fallback will be used.', error.message);
}

const EXCLUDED = new Set([
  'index.json',
  'manifest.json',
  'search_index.json',
  'top_colleges_index.json',
  'category_insights.json',
  'predictor_index.json',
  'CBIT.json',
]);

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
      // AP 2026 source rows use applicant_name. Keep robust fallbacks so
      // future source variants do not silently remove student rows.
      name: String(
        r.applicant_name ??
        r.candidate_name ??
        r.student_name ??
        r.candidateName ??
        r.studentName ??
        r.cand_name ??
        r.name ??
        ''
      ).trim(),
      gender: String(r.gender ?? '').trim().toUpperCase(),
      category: normalizeCommunityKey(String(r.community ?? r.category ?? '').trim().toUpperCase()),
      region: String(r.region ?? '').trim().toUpperCase(),
      allottedCategory: String(r.allot_category ?? r.alloted_category ?? r.allotted_category ?? '').trim().toUpperCase(),
      phase: phaseNumber(r.phase),
      collegeCode,
      collegeName,
      branchCode: String(r.branch_code ?? branchCode ?? '').trim().toUpperCase(),
      branchName: String(r.branch_name ?? branchName ?? '').trim(),
      district: String(r.district ?? '').trim(),
      totalSeats: num(r.total_seats),
      leftOverSeats: num(r.left_over_seats),
      hallTicket: String(r.roll_no ?? r.hall_ticket ?? r.hallTicket ?? ''),
    };
  }
  return {
    rank: num(r.rank),
    name: String(r.cand_name ?? r.applicant_name ?? r.candidate_name ?? r.student_name ?? r.candidateName ?? r.studentName ?? r.name ?? '').trim(),
    gender: String(r.gender ?? '').trim().toUpperCase(),
    category: String(r.category ?? r.community ?? '').trim().toUpperCase(),
    region: String(r.region ?? '').trim().toUpperCase(),
    allottedCategory: String(r.alloted_category ?? r.allot_category ?? r.allotted_category ?? '').trim().toUpperCase(),
    phase: phaseNumber(r.phase),
    collegeCode,
    collegeName,
    branchCode: String(r.branch_code ?? branchCode ?? '').trim().toUpperCase(),
    branchName: String(r.branch_name ?? branchName ?? '').trim(),
    district: districtByCollegeCode.get(String(collegeCode).trim().toUpperCase()) || '',
    totalSeats: 0,
    leftOverSeats: 0,
    hallTicket: String(r.roll_no ?? r.hall_ticket ?? r.hallTicket ?? ''),
  };
}

const AP_CATEGORY_METADATA = [
  { key: 'OC', display: 'OC', name: 'Open Competition (General Merit)' },
  { key: 'EWS', display: 'EWS', name: 'Economically Weaker Section (10% Quota)' },
  { key: 'BC_A', display: 'BC-A', name: 'Backward Class Group A (7% Quota)' },
  { key: 'BC_B', display: 'BC-B', name: 'Backward Class Group B (10% Quota)' },
  { key: 'BC_C', display: 'BC-C', name: 'Backward Class Group C (1% Quota)' },
  { key: 'BC_D', display: 'BC-D', name: 'Backward Class Group D (7% Quota)' },
  { key: 'BC_E', display: 'BC-E', name: 'Backward Class Group E (4% Quota)' },
  { key: 'SC_I', display: 'SC-I', name: 'Scheduled Caste Group 1' },
  { key: 'SC_II', display: 'SC-II', name: 'Scheduled Caste Group 2' },
  { key: 'SC_III', display: 'SC-III', name: 'Scheduled Caste Group 3' },
  { key: 'ST', display: 'ST', name: 'Scheduled Tribe (6% Quota)' },
];

function normalizeCommunityKey(catRaw) {
  const s = String(catRaw ?? '').toUpperCase().trim();
  if (s === 'SC_III' || s === 'SC-III' || s === 'SC3' || s === 'SC_3') return 'SC_III';
  if (s === 'SC_II' || s === 'SC-II' || s === 'SC2' || s === 'SC_2') return 'SC_II';
  if (s === 'SC_I' || s === 'SC-I' || s === 'SC1' || s === 'SC_1') return 'SC_I';
  if (s === 'BC_A' || s === 'BC-A' || s === 'BCA') return 'BC_A';
  if (s === 'BC_B' || s === 'BC-B' || s === 'BCB') return 'BC_B';
  if (s === 'BC_C' || s === 'BC-C' || s === 'BCC') return 'BC_C';
  if (s === 'BC_D' || s === 'BC-D' || s === 'BCD') return 'BC_D';
  if (s === 'BC_E' || s === 'BC-E' || s === 'BCE') return 'BC_E';
  if (s === 'EWS') return 'EWS';
  if (s === 'ST') return 'ST';
  if (s === 'OC' || s === 'OPEN') return 'OC';
  return s;
}

function normalizeAllottedQuotaKey(allotCatRaw) {
  const s = String(allotCatRaw ?? '').toUpperCase().trim();
  if (s.startsWith('EWS') || s.includes('_EWS_') || s.endsWith('_EWS')) return 'EWS';
  if (s.startsWith('BC_A') || s.includes('_BC_A_') || s.includes('_BCA_')) return 'BC_A';
  if (s.startsWith('BC_B') || s.includes('_BC_B_') || s.includes('_BCB_')) return 'BC_B';
  if (s.startsWith('BC_C') || s.includes('_BC_C_') || s.includes('_BCC_')) return 'BC_C';
  if (s.startsWith('BC_D') || s.includes('_BC_D_') || s.includes('_BCD_')) return 'BC_D';
  if (s.startsWith('BC_E') || s.includes('_BC_E_') || s.includes('_BCE_')) return 'BC_E';
  // Match SC_III and SC_II strictly before SC_I to prevent prefix collision
  if (s.startsWith('SC_III') || s.includes('_SC_III_') || s.includes('SC3') || s.includes('SC_3')) return 'SC_III';
  if (s.startsWith('SC_II') || s.includes('_SC_II_') || s.includes('SC2') || s.includes('SC_2')) return 'SC_II';
  if (s.startsWith('SC_I') || s.includes('_SC_I_') || s.includes('SC1') || s.includes('SC_1') || (s.startsWith('SC_') && !s.startsWith('SC_II') && !s.startsWith('SC_III')) || s === 'SC') return 'SC_I';
  if (s.startsWith('ST') || s.includes('_ST_') || s.endsWith('_ST')) return 'ST';
  if (s.startsWith('OC') || s.includes('_OC_') || s.startsWith('OPEN') || s.endsWith('_OC')) return 'OC';
  return '';
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
  let totalRecords = 0;
  let minRank = Infinity;
  let maxRank = 0;

  const rawCollegesList = [];

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const collegeCode = String(raw.college_code ?? raw.collegeCode ?? raw.inst_code ?? file.replace(/\.json$/i, '')).trim().toUpperCase();
    if (collegeCode === 'CBIT') continue;

    const collegeName = String(raw.college_name ?? raw.collegeName ?? raw.inst_name ?? collegeCode).trim();
    const records = [];
    const branchSummaries = new Map();

    const add = (r, branchCode = '', branchName = '') => {
      const x = normalizeRecord(year, r, collegeCode, collegeName, branchCode, branchName);
      // Keep rankless/name-only records in the searchable index.
      if (!x.name) return;
      records.push(x);
      totalRecords++;

      if (x.rank > 0) {
        minRank = Math.min(minRank, x.rank);
        maxRank = Math.max(maxRank, x.rank);
      }
      if (x.category) categorySet.add(x.category);
      if (x.allottedCategory) allottedSet.add(x.allottedCategory);
      if (x.region) regionSet.add(x.region);
      if (x.phase) phaseSet.add(x.phase);
      if (x.branchCode) {
        branchSet.add(x.branchCode);
        branchMap[x.branchCode] = x.branchName || x.branchCode;
      }

      const key = x.branchCode || 'UNKNOWN';
      if (!branchSummaries.has(key)) {
        branchSummaries.set(key, {
          branchCode: key,
          branchName: x.branchName || key,
          recordCount: 0,
          minRank: Infinity,
          maxRank: 0,
          phases: new Set(),
          categories: new Set(),
        });
      }
      const b = branchSummaries.get(key);
      b.recordCount++;
      if (x.rank > 0) {
        b.minRank = Math.min(b.minRank, x.rank);
        b.maxRank = Math.max(b.maxRank, x.rank);
      }
      if (x.phase) b.phases.add(x.phase);
      if (x.category) b.categories.add(x.category);
    };

    if (Array.isArray(raw.records)) {
      for (const r of raw.records) add(r);
    } else if (Array.isArray(raw.allotments)) {
      for (const r of raw.allotments) add(r);
    } else if (Array.isArray(raw.data)) {
      for (const r of raw.data) add(r);
    } else {
      for (const value of Object.values(raw)) {
        if (Array.isArray(value)) {
          for (const r of value) {
            if (r && typeof r === 'object') add(r);
          }
        }
      }
    }

    const branchList = Array.from(branchSummaries.values()).map(b => ({
      branchCode: b.branchCode,
      branchName: b.branchName,
      recordCount: b.recordCount,
      minRank: Number.isFinite(b.minRank) ? b.minRank : 0,
      maxRank: b.maxRank,
      phases: Array.from(b.phases).sort((a, b) => a - b),
      categories: Array.from(b.categories).sort(),
    }));

    colleges.push({
      code: collegeCode,
      name: collegeName,
      district: records.find((record) => record.district)?.district || districtByCollegeCode.get(collegeCode) || '',
      recordCount: records.length,
      branches: branchList,
    });
    candidates.push(...records);
  }

  colleges.sort((a, b) => a.name.localeCompare(b.name));
  const compact = candidates.map(r => ({
    rank: r.rank,
    name: r.name,
    gender: r.gender,
    category: r.category,
    region: r.region,
    allottedCategory: r.allottedCategory,
    phase: r.phase,
    collegeCode: r.collegeCode,
    collegeName: r.collegeName,
    branchCode: r.branchCode,
    branchName: r.branchName,
    district: r.district,
  }));

  const result = {
    year,
    totalRecords,
    collegeCount: colleges.length,
    branchCount: branchSet.size,
    minRank: Number.isFinite(minRank) ? minRank : 0,
    maxRank,
    colleges,
    branchMap,
    categories: Array.from(categorySet).sort(),
    allottedCategories: Array.from(allottedSet).sort(),
    regions: Array.from(regionSet).sort(),
    phases: Array.from(phaseSet).sort((a, b) => a - b),
  };

  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(result));
  fs.writeFileSync(path.join(dir, 'search_index.json'), JSON.stringify({ year, totalRecords, collegeCount: colleges.length, branchMap, candidates: compact }));
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ year, totalRecords, collegeCount: colleges.length, branches: Object.entries(branchMap).map(([branchCode, branchName]) => ({ branchCode, branchName })) }));

  console.log(`AP EAPCET ${year}: ${colleges.length} colleges, ${totalRecords} records, ${compact.length} indexed candidates`);
}

processYear('2025', DATASETS['2025']);
processYear('2026', DATASETS['2026']);
