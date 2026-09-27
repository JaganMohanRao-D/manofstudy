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
  // Rank metrics use candidate-category OC records. Seat metrics use the
  // latest observed counselling phase snapshot available for each branch.
  // "Top-rank" metrics are transparent counts at fixed rank thresholds,
  // not a subjective quality score.
  if (year === '2026') {
    const RANK_THRESHOLDS = [10000, 25000, 50000];

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

    const modeNumber = (values) => {
      const counts = new Map();
      for (const value of values) {
        const n = num(value);
        if (n <= 0) continue;
        counts.set(n, (counts.get(n) || 0) + 1);
      }
      let best = 0;
      let bestCount = -1;
      for (const [value, count] of counts.entries()) {
        if (count > bestCount || (count === bestCount && value > best)) {
          best = value;
          bestCount = count;
        }
      }
      return best;
    };

    const seatStats = (snapshots) => {
      if (!snapshots.length) return null;
      const latestPhase = Math.max(...snapshots.map((item) => item.phase || 0));
      const latest = snapshots.filter((item) => (item.phase || 0) === latestPhase);
      const totalSeats = modeNumber(latest.map((item) => item.totalSeats));
      const remainingSeats = modeNumber(latest.map((item) => item.leftOverSeats));
      if (totalSeats <= 0 || remainingSeats < 0 || remainingSeats > totalSeats) return null;
      const filledSeats = Math.max(0, totalSeats - remainingSeats);
      return {
        totalSeats,
        filledSeats,
        remainingSeats,
        fillRatePercent: Number(((filledSeats / totalSeats) * 100).toFixed(1)),
        latestPhase,
      };
    };

    const collegeMap = new Map();
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
          allSeatSnapshots: [],
        });
      }

      const college = collegeMap.get(code);
      districtMap.set(district, true);

      for (const record of records) {
        const rank = num(record.rank);
        const branchCode = String(record.branch_code ?? '').trim().toUpperCase();
        const branchName = String(record.branch_name ?? branchCode).trim();
        const category = String(record.community ?? record.category ?? '').trim().toUpperCase();
        const phase = phaseNumber(record.phase);
        const totalSeats = num(record.total_seats);
        const leftOverSeats = num(record.left_over_seats);

        if (!branchCode) continue;
        branchNameMap.set(branchCode, branchName);

        if (!college.branches.has(branchCode)) {
          college.branches.set(branchCode, {
            branchCode,
            branchName,
            ocRanks: [],
            allRanks: [],
            seatSnapshots: [],
          });
        }

        const branch = college.branches.get(branchCode);
        if (rank > 0) {
          branch.allRanks.push(rank);
          college.allRanks.push(rank);
          if (category === 'OC') branch.ocRanks.push(rank);
        }

        if (totalSeats > 0 && leftOverSeats >= 0 && leftOverSeats <= totalSeats) {
          const snapshot = { phase, totalSeats, leftOverSeats };
          branch.seatSnapshots.push(snapshot);
          college.allSeatSnapshots.push(snapshot);
        }
      }
    }

    const makeMetrics = (ocRanks, allRanks, seatSnapshots) => {
      const ranks = rankStats(ocRanks);
      const seats = seatStats(seatSnapshots);
      const observedAllotments = allRanks.length;
      const topRankAllotments = {};
      for (const threshold of RANK_THRESHOLDS) {
        topRankAllotments[String(threshold)] = allRanks.filter((rank) => rank <= threshold).length;
      }
      const top25 = topRankAllotments['25000'] || 0;
      return {
        ...(ranks || {
          openingRank: 0,
          medianRank: 0,
          closingRank: 0,
          validOcAllotments: 0,
        }),
        observedAllotments,
        topRankAllotments,
        top25kAllotments: top25,
        top25kSharePercent: observedAllotments
          ? Number(((top25 / observedAllotments) * 100).toFixed(1))
          : 0,
        seatStats: seats,
      };
    };

    const topColleges = Array.from(collegeMap.values()).map((college) => {
      const branches = {};
      for (const [branchCode, branch] of college.branches.entries()) {
        branches[branchCode] = {
          branchCode,
          branchName: branch.branchName,
          ...makeMetrics(branch.ocRanks, branch.allRanks, branch.seatSnapshots),
        };
      }

      return {
        collegeCode: college.collegeCode,
        collegeName: college.collegeName,
        district: college.district,
        branches,
        allBranches: makeMetrics(college.branches.size
          ? Array.from(college.branches.values()).flatMap((branch) => branch.ocRanks)
          : [],
          college.allRanks,
          college.allSeatSnapshots),
      };
    }).filter((college) => Object.keys(college.branches).length > 0)
      .sort((a, b) => a.collegeCode.localeCompare(b.collegeCode));

    const statewideBranchRanks = new Map();
    for (const college of topColleges) {
      for (const [branchCode, branch] of Object.entries(college.branches)) {
        if (!statewideBranchRanks.has(branchCode)) statewideBranchRanks.set(branchCode, []);
        statewideBranchRanks.get(branchCode).push(branch);
      }
    }

    const statewideBranchStats = {};
    for (const [branchCode, branchRows] of statewideBranchRanks.entries()) {
      const ocRanks = branchRows.flatMap((row) => {
        const ranks = [];
        if (row.validOcAllotments > 0) {
          // Statewide rank stats are recomputed from college-level aggregate
          // values below only where raw rank arrays are available.
        }
        return ranks;
      });
      const observedAllotments = branchRows.reduce((sum, row) => sum + row.observedAllotments, 0);
      const top25kAllotments = branchRows.reduce((sum, row) => sum + row.top25kAllotments, 0);
      const totalSeats = branchRows.reduce((sum, row) => sum + (row.seatStats?.totalSeats || 0), 0);
      const filledSeats = branchRows.reduce((sum, row) => sum + (row.seatStats?.filledSeats || 0), 0);
      const remainingSeats = branchRows.reduce((sum, row) => sum + (row.seatStats?.remainingSeats || 0), 0);
      statewideBranchStats[branchCode] = {
        observedAllotments,
        top25kAllotments,
        top25kSharePercent: observedAllotments ? Number(((top25kAllotments / observedAllotments) * 100).toFixed(1)) : 0,
        totalSeats,
        filledSeats,
        remainingSeats,
        fillRatePercent: totalSeats ? Number(((filledSeats / totalSeats) * 100).toFixed(1)) : 0,
      };
    }

    const branches = Array.from(branchNameMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const topIndex = {
      generatedAt: new Date().toISOString(),
      methodology: 'Observed AP EAPCET 2026 allotment analysis. OC rank statistics use valid candidate-category OC records. Seat statistics use the latest observed counselling phase snapshot for each college/branch. Top-rank counts use transparent absolute-rank thresholds.',
      rankingBasis: 'Users can sort by median/opening/closing observed OC rank, filled seats, seat fill rate, remaining seats, top-rank allotments up to rank 25,000, or top-rank share up to rank 25,000.',
      topRankThresholds: RANK_THRESHOLDS,
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
