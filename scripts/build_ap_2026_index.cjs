const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE');
const indexPath = path.join(dir, 'index.json');

if (!fs.existsSync(indexPath)) {
  console.error('index.json not found in', dir);
  process.exit(1);
}

const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log(`Processing index with ${indexData.colleges.length} colleges...`);

const candidates = [];
const branchMap = {};
const collegeMap = {};
const predictorColleges = [];

let totalCount = 0;

for (const col of indexData.colleges) {
  const filePath = path.join(dir, col.file);
  const collegeCode = col.college_code.toUpperCase();
  const collegeName = col.college_name;
  collegeMap[collegeCode] = collegeName;

  if (!fs.existsSync(filePath)) {
    // Missing file on disk
    continue;
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`Failed to parse ${col.file}:`, e.message);
    continue;
  }

  const branchesMapForCol = {};
  let colRecordCount = 0;

  function processRecord(r, defaultBranchCode, defaultBranchName) {
    const rawRank = parseFloat(String(r.rank ?? '').replace(/,/g, ''));
    const rank = !isNaN(rawRank) && isFinite(rawRank) ? Math.round(rawRank) : 0;
    if (rank <= 0) return;

    const candName = String(
      r.applicant_name ||
      r.cand_name ||
      r.candidateName ||
      (r.first_name_blurred ? `${r.first_name_blurred} ${r.last_name_visible || ''}`.trim() : '') ||
      'Candidate'
    ).trim();

    const gender = String(r.gender || '—').trim().toUpperCase();
    const category = String(r.community || r.category || 'OC').trim().toUpperCase();
    const region = String(r.region || 'AU').trim().toUpperCase();
    const allottedCat = String(r.allot_category || r.alloted_category || r.seatCategory || '—').trim().toUpperCase();

    let phase = 1;
    if (typeof r.phase === 'number') phase = r.phase;
    else if (typeof r.phase === 'string') {
      const lower = r.phase.toLowerCase();
      if (lower.includes('first') || lower === '1') phase = 1;
      else if (lower.includes('second') || lower === '2') phase = 2;
      else if (lower.includes('third') || lower.includes('final') || lower === '3') phase = 3;
    }

    const branchCode = String(r.branch_code || defaultBranchCode || '').trim().toUpperCase();
    const branchName = String(r.branch_name || defaultBranchName || branchCode).trim();
    if (branchCode && branchName) {
      if (!branchMap[branchCode]) branchMap[branchCode] = branchName;
    }

    const feeExempt = typeof r.fee_with_exemption === 'number' ? r.fee_with_exemption : (r.fee_with_exemption ? Number(r.fee_with_exemption) : 0);
    const feeNoExempt = typeof r.fee_with_no_exemption === 'number' ? r.fee_with_no_exemption : (r.fee_with_no_exemption ? Number(r.fee_with_no_exemption) : 0);
    const leftSeats = typeof r.left_over_seats === 'number' ? r.left_over_seats : (r.left_over_seats ? Number(r.left_over_seats) : null);
    const totSeats = typeof r.total_seats === 'number' ? r.total_seats : (r.total_seats ? Number(r.total_seats) : null);
    const rollNo = r.roll_no ? String(r.roll_no).trim() : '';

    candidates.push([
      rank,
      candName,
      gender,
      category,
      region,
      allottedCat,
      phase,
      collegeCode,
      branchCode,
      feeExempt,
      feeNoExempt,
      leftSeats,
      totSeats,
      rollNo
    ]);

    totalCount++;
    colRecordCount++;

    // Aggregate for predictor
    if (!branchesMapForCol[branchCode]) {
      branchesMapForCol[branchCode] = {
        name: branchName,
        minRank: rank,
        maxRank: rank,
        count: 0,
        categories: {},
        phases: {},
      };
    }
    const bEntry = branchesMapForCol[branchCode];
    if (rank < bEntry.minRank) bEntry.minRank = rank;
    if (rank > bEntry.maxRank) bEntry.maxRank = rank;
    bEntry.count++;

    if (!bEntry.phases[phase]) bEntry.phases[phase] = 0;
    bEntry.phases[phase]++;

    // Grouping by student social category and general quota
    const catKey = category;
    if (!bEntry.categories[catKey]) {
      bEntry.categories[catKey] = {
        min: rank,
        max: rank,
        count: 0,
        maleCount: 0,
        femaleCount: 0,
        ranks: []
      };
    }
    const cEntry = bEntry.categories[catKey];
    if (rank < cEntry.min) cEntry.min = rank;
    if (rank > cEntry.max) cEntry.max = rank;
    cEntry.count++;
    if (gender === 'F') cEntry.femaleCount++;
    else if (gender === 'M') cEntry.maleCount++;
    if (cEntry.ranks.length < 500) cEntry.ranks.push(rank);
  }

  if (raw.branches && Array.isArray(raw.branches)) {
    for (const b of raw.branches) {
      const bCode = b.branch_code || '';
      const bName = b.branch_name || bCode;
      for (const r of (b.records || [])) {
        processRecord(r, bCode, bName);
      }
    }
  } else if (raw.records && Array.isArray(raw.records)) {
    for (const r of raw.records) {
      processRecord(r, r.branch_code, r.branch_name);
    }
  }

  // Finalize branch stats for this college
  const branchesObj = {};
  for (const [bCode, bData] of Object.entries(branchesMapForCol)) {
    const catsObj = {};
    for (const [cKey, cData] of Object.entries(bData.categories)) {
      cData.ranks.sort((a, b) => a - b);
      const med = cData.ranks.length ? cData.ranks[Math.floor(cData.ranks.length / 2)] : cData.min;
      catsObj[cKey] = {
        min: cData.min,
        max: cData.max,
        median: med,
        count: cData.count,
        maleCount: cData.maleCount,
        femaleCount: cData.femaleCount
      };
    }
    branchesObj[bCode] = {
      name: bData.name,
      minRank: bData.minRank,
      maxRank: bData.maxRank,
      count: bData.count,
      categories: catsObj,
      phases: bData.phases
    };
  }

  predictorColleges.push({
    code: collegeCode,
    name: collegeName,
    file: col.file,
    recordCount: colRecordCount,
    branches: branchesObj
  });
}

console.log(`Parsed total ${totalCount} records across ${predictorColleges.length} colleges.`);

// Write search_index.json
const searchIndexOutput = {
  version: '2026.1',
  dataset: 'AP EAPCET 2026 College-Wise Allotments',
  totalRecords: totalCount,
  branchMap,
  collegeMap,
  candidates
};

const searchIndexPath = path.join(dir, 'search_index.json');
fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndexOutput));
console.log(`Wrote search_index.json (${(fs.statSync(searchIndexPath).size / 1024 / 1024).toFixed(2)} MB)`);

// Write predictor_index.json
const predictorIndexOutput = {
  version: '2026.1',
  dataset: 'AP EAPCET 2026 Deterministic College Predictor Index',
  totalColleges: predictorColleges.length,
  totalRecords: totalCount,
  branchMap,
  colleges: predictorColleges
};

const predictorIndexPath = path.join(dir, 'predictor_index.json');
fs.writeFileSync(predictorIndexPath, JSON.stringify(predictorIndexOutput));
console.log(`Wrote predictor_index.json (${(fs.statSync(predictorIndexPath).size / 1024 / 1024).toFixed(2)} MB)`);
