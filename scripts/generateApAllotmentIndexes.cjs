const fs = require('fs');
const path = require('path');

const DATASETS = {
  '2025': path.join(process.cwd(), 'public', 'AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE'),
  '2026': path.join(process.cwd(), 'public', 'AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE'),
};
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
      name: String(r.applicant_name ?? r.cand_name ?? r.name ?? '').trim(),
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
    district: '',
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
    if (collegeCode === 'CBIT') continue; // Exclude erroneous Telangana institution from AP dataset

    const collegeName = String(raw.college_name ?? raw.collegeName ?? raw.inst_name ?? collegeCode).trim();
    const records = [];
    const branchSummaries = new Map();

    const add = (r, branchCode = '', branchName = '') => {
      const x = normalizeRecord(year, r, collegeCode, collegeName, branchCode, branchName);
      // Keep rankless/name-only records in the searchable index.
      // Some official dataset rows (for example, records with rank "-") are
      // still valid candidate records and must remain discoverable by name.
      if (!x.name) return;
      records.push(x);
      totalRecords++;

      // Rank statistics must only use valid numeric ranks.
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
      b.minRank = Math.min(b.minRank, x.rank);
      b.maxRank = Math.max(b.maxRank, x.rank);
      if (x.phase) b.phases.add(x.phase);
      if (x.category) b.categories.add(x.category);
      candidates.push([
        x.rank,
        x.name,
        x.gender,
        x.category,
        x.region,
        x.allottedCategory,
        x.phase,
        x.collegeCode,
        x.branchCode,
        x.hallTicket,
      ]);
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

    const derivedDistrict = records.find(r => r.district)?.district || 'Andhra Pradesh';

    colleges.push({
      collegeCode,
      collegeName,
      file,
      recordCount: records.length,
      branchCount: branches.length,
      minRank: records.length ? Math.min(...records.map(r=>r.rank)) : 0,
      maxRank: records.length ? Math.max(...records.map(r=>r.rank)) : 0,
      district: derivedDistrict,
      branches,
    });

    rawCollegesList.push({
      collegeCode,
      collegeName,
      district: derivedDistrict,
      records,
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

  // ==========================================
  // AP 2026 EXPANDED INDEX GENERATION
  // ==========================================
  if (year === '2026') {
    const RANK_THRESHOLDS = [10000, 25000, 50000];

    const rankStats = (ranks) => {
      const valid = ranks.filter((rank) => Number.isFinite(rank) && rank > 0).sort((a, b) => a - b);
      if (!valid.length) return null;
      const middle = Math.floor(valid.length / 2);
      const median = valid.length % 2
        ? valid[middle]
        : Math.round((valid[middle - 1] + valid[middle]) / 2);
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
        isLimitedData: (ranks?.validOcAllotments || 0) < 3,
        observedAllotments,
        topRankAllotments,
        top25kAllotments: top25,
        top25kSharePercent: observedAllotments
          ? Number(((top25 / observedAllotments) * 100).toFixed(1))
          : 0,
        seatStats: seats,
      };
    };

    // 1. TOP COLLEGES INDEX
    const branchNameMap = new Map();
    const districtMap = new Map();
    const collegeTopList = [];
    const predictorCollegesList = [];

    // CATEGORY INSIGHTS ACCUMULATORS
    const createCategoryAccumulator = () => {
      const map = {};
      for (const item of AP_CATEGORY_METADATA) {
        map[item.key] = {
          category: item.key,
          displayLabel: item.display,
          categoryName: item.name,
          boys: { topRank: null, lastRank: null, recordCount: 0, colleges: new Set(), branches: new Set() },
          girls: { topRank: null, lastRank: null, recordCount: 0, colleges: new Set(), branches: new Set() },
          totalRecords: 0,
          colleges: new Set(),
          branches: new Set(),
        };
      }
      return map;
    };

    const quotaInsights = createCategoryAccumulator();
    const casteInsights = createCategoryAccumulator();
    let totalInsightsRecords = 0;

    for (const college of rawCollegesList) {
      districtMap.set(college.district, (districtMap.get(college.district) || 0) + 1);

      const branchGroup = new Map();
      const collegeAllRanks = [];

      for (const r of college.records) {
        const bCode = r.branchCode;
        if (!bCode) continue;
        branchNameMap.set(bCode, r.branchName || bCode);

        if (!branchGroup.has(bCode)) {
          branchGroup.set(bCode, {
            branchCode: bCode,
            branchName: r.branchName || bCode,
            ocRanks: [],
            allRanks: [],
            seatSnapshots: [],
            records: [],
          });
        }
        const bObj = branchGroup.get(bCode);
        bObj.records.push(r);

        if (r.rank > 0) {
          bObj.allRanks.push(r.rank);
          collegeAllRanks.push(r.rank);
          if (r.category === 'OC') {
            bObj.ocRanks.push(r.rank);
          }

          // Category Insights Tracking
          totalInsightsRecords++;
          const gender = r.gender === 'F' ? 'girls' : 'boys';

          // A. By Candidate Caste
          if (casteInsights[r.category]) {
            const cItem = casteInsights[r.category];
            const g = cItem[gender];
            if (g.topRank === null || r.rank < g.topRank) g.topRank = r.rank;
            if (g.lastRank === null || r.rank > g.lastRank) g.lastRank = r.rank;
            g.recordCount++;
            g.colleges.add(college.collegeCode);
            g.branches.add(bCode);
            cItem.totalRecords++;
            cItem.colleges.add(college.collegeCode);
            cItem.branches.add(bCode);
          }

          // B. By Allotted Quota
          const quotaKey = normalizeAllottedQuotaKey(r.allottedCategory);
          if (quotaKey && quotaInsights[quotaKey]) {
            const qItem = quotaInsights[quotaKey];
            const g = qItem[gender];
            if (g.topRank === null || r.rank < g.topRank) g.topRank = r.rank;
            if (g.lastRank === null || r.rank > g.lastRank) g.lastRank = r.rank;
            g.recordCount++;
            g.colleges.add(college.collegeCode);
            g.branches.add(bCode);
            qItem.totalRecords++;
            qItem.colleges.add(college.collegeCode);
            qItem.branches.add(bCode);
          }
        }

        if (r.totalSeats > 0 && r.leftOverSeats >= 0 && r.leftOverSeats <= r.totalSeats) {
          bObj.seatSnapshots.push({
            phase: r.phase,
            totalSeats: r.totalSeats,
            leftOverSeats: r.leftOverSeats,
          });
        }
      }

      // Build branches object for top colleges
      const branches = {};
      const predictorBranches = {};

      for (const [bCode, bObj] of branchGroup.entries()) {
        const metrics = makeMetrics(bObj.ocRanks, bObj.allRanks, bObj.seatSnapshots);
        branches[bCode] = {
          branchCode: bCode,
          branchName: bObj.branchName,
          ...metrics,
        };

        // Predictor branch stats per category
        const categoriesStats = {};
        const genderStats = {};

        for (const catItem of AP_CATEGORY_METADATA) {
          const cat = catItem.key;
          const matchingCatRecords = bObj.records.filter(
            rec => (rec.category === cat || rec.category === 'OC') && rec.rank > 0
          );
          if (matchingCatRecords.length > 0) {
            const ranks = matchingCatRecords.map(rec => rec.rank).sort((a, b) => a - b);
            const med = ranks.length % 2
              ? ranks[Math.floor(ranks.length / 2)]
              : Math.round((ranks[Math.floor(ranks.length / 2) - 1] + ranks[Math.floor(ranks.length / 2)]) / 2);
            categoriesStats[cat] = {
              min: ranks[0],
              max: ranks[ranks.length - 1],
              median: med,
              count: ranks.length,
            };
          }

          // Per Gender stats (M, F)
          for (const gen of ['M', 'F']) {
            const key = `${cat}_${gen}`;
            const matchingGenderRecords = bObj.records.filter(rec => {
              if (rec.rank <= 0) return false;
              // Male candidates cannot take exclusive girls quota
              const allotCat = rec.allottedCategory || '';
              if (gen === 'M' && allotCat.includes('GIRLS') && !allotCat.includes('GEN')) return false;
              const matchesCat = rec.category === cat || rec.category === 'OC';
              return matchesCat;
            });
            if (matchingGenderRecords.length > 0) {
              const ranks = matchingGenderRecords.map(rec => rec.rank).sort((a, b) => a - b);
              const med = ranks.length % 2
                ? ranks[Math.floor(ranks.length / 2)]
                : Math.round((ranks[Math.floor(ranks.length / 2) - 1] + ranks[Math.floor(ranks.length / 2)]) / 2);
              genderStats[key] = {
                min: ranks[0],
                max: ranks[ranks.length - 1],
                median: med,
                count: ranks.length,
              };
            }
          }
        }

        predictorBranches[bCode] = {
          name: bObj.branchName,
          totalAllotted: bObj.allRanks.length,
          minRank: bObj.allRanks.length ? Math.min(...bObj.allRanks) : 0,
          maxRank: bObj.allRanks.length ? Math.max(...bObj.allRanks) : 0,
          categories: categoriesStats,
          genders: genderStats,
          seatStats: metrics.seatStats,
        };
      }

      const branchValues = Array.from(branchGroup.values());
      const allOcRanks = branchValues.flatMap(b => b.ocRanks);
      const allBranchMetrics = makeMetrics(allOcRanks, collegeAllRanks, []);

      // Aggregate seat stats from branch latest snapshots
      const branchSeatSnapshots = branchValues
        .map(b => seatStats(b.seatSnapshots))
        .filter(Boolean);
      if (branchSeatSnapshots.length) {
        const totalSeats = branchSeatSnapshots.reduce((sum, item) => sum + item.totalSeats, 0);
        const filledSeats = branchSeatSnapshots.reduce((sum, item) => sum + item.filledSeats, 0);
        const remainingSeats = branchSeatSnapshots.reduce((sum, item) => sum + item.remainingSeats, 0);
        allBranchMetrics.seatStats = {
          totalSeats,
          filledSeats,
          remainingSeats,
          fillRatePercent: totalSeats ? Number(((filledSeats / totalSeats) * 100).toFixed(1)) : 0,
          latestPhase: Math.max(...branchSeatSnapshots.map(item => item.latestPhase)),
        };
      }

      if (Object.keys(branches).length > 0) {
        collegeTopList.push({
          collegeCode: college.collegeCode,
          collegeName: college.collegeName,
          district: college.district,
          branches,
          allBranches: allBranchMetrics,
        });

        predictorCollegesList.push({
          code: college.collegeCode,
          name: college.collegeName,
          district: college.district,
          branches: predictorBranches,
        });
      }
    }

    collegeTopList.sort((a, b) => a.collegeCode.localeCompare(b.collegeCode));
    predictorCollegesList.sort((a, b) => a.code.localeCompare(b.code));

    const branchesList = Array.from(branchNameMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const topIndex = {
      generatedAt: new Date().toISOString(),
      methodology:
        'Observed AP EAPCET 2026 allotment analysis. OC rank statistics use valid candidate-category OC records as a standardized comparison cohort. Seat statistics use the latest observed counselling phase snapshot for each college/branch. Top-rank counts use transparent absolute-rank thresholds.',
      rankingBasis:
        'Users can sort by seat fill rate, filled seats, remaining seats, median/opening/closing observed OC rank, or allotments with rank ≤25,000.',
      disclaimer:
        'Methodology note: College-level rank comparisons use observed OC-category allotment ranks as a standardized comparison cohort. This does not indicate that any category or community is better or worse than another. Category-specific allotment information remains available separately in the College Predictor using the category selected by the user. All figures are historical observations from the available 2026 allotment dataset and are not guarantees of future admission.',
      topRankThresholds: RANK_THRESHOLDS,
      totalColleges: collegeTopList.length,
      districts: Array.from(districtMap.keys()).sort((a, b) => a.localeCompare(b)),
      branches: branchesList,
      colleges: collegeTopList,
    };

    fs.writeFileSync(path.join(dir, 'top_colleges_index.json'), JSON.stringify(topIndex, null, 2), 'utf8');

    // 2. CATEGORY INSIGHTS JSON
    const serializeCategoryStats = (map) => {
      return AP_CATEGORY_METADATA.map(item => {
        const obj = map[item.key];
        return {
          category: obj.category,
          displayLabel: obj.displayLabel,
          categoryName: obj.categoryName,
          boys: {
            topRank: obj.boys.topRank,
            lastRank: obj.boys.lastRank,
            recordCount: obj.boys.recordCount,
            collegesCount: obj.boys.colleges.size,
            branchesCount: obj.boys.branches.size,
          },
          girls: {
            topRank: obj.girls.topRank,
            lastRank: obj.girls.lastRank,
            recordCount: obj.girls.recordCount,
            collegesCount: obj.girls.colleges.size,
            branchesCount: obj.girls.branches.size,
          },
          totalRecords: obj.totalRecords,
          collegesRepresented: obj.colleges.size,
          branchesRepresented: obj.branches.size,
        };
      });
    };

    const categoryInsightsData = {
      datasetStats: {
        totalRecords: totalInsightsRecords,
        totalColleges: rawCollegesList.length,
        totalBranches: branchNameMap.size,
        generatedAt: new Date().toISOString(),
      },
      byAllottedQuota: serializeCategoryStats(quotaInsights),
      byCandidateCaste: serializeCategoryStats(casteInsights),
    };

    fs.writeFileSync(path.join(dir, 'category_insights.json'), JSON.stringify(categoryInsightsData, null, 2), 'utf8');

    // 3. PREDICTOR INDEX JSON
    const predictorIndexData = {
      version: '2026.2',
      generatedAt: new Date().toISOString(),
      totalColleges: predictorCollegesList.length,
      categories: AP_CATEGORY_METADATA.map(c => c.key),
      branches: branchesList,
      colleges: predictorCollegesList,
    };

    fs.writeFileSync(path.join(dir, 'predictor_index.json'), JSON.stringify(predictorIndexData), 'utf8');

    // Also write src/data/apEapcetCollegeManifest.ts for build-time typed exports
    const manifestTsContent = `// AUTOGENERATED BUILD-TIME MANIFEST FROM public/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/
// DO NOT EDIT MANUALLY. Run 'node scripts/generateApAllotmentIndexes.cjs' to regenerate.

export interface ApBranchItem {
  branchCode: string;
  branchName: string;
  recordCount: number;
  minRank: number;
  maxRank: number;
  phases: number[];
  categories: string[];
}

export interface ApCollegeItem {
  collegeCode: string;
  collegeName: string;
  file: string;
  recordCount: number;
  branchCount: number;
  minRank: number;
  maxRank: number;
  district?: string;
  branches: ApBranchItem[];
}

export interface ApAllotmentGlobalStats {
  year: string;
  totalColleges: number;
  totalRecords: number;
  totalBranches: number;
  categories: string[];
  allottedCategories: string[];
  regions: string[];
  phases: number[];
  minRank: number;
  maxRank: number;
  generatedAt: string;
}

export interface CategoryGenderInsight {
  topRank: number | null;
  lastRank: number | null;
  recordCount: number;
  collegesCount: number;
  branchesCount: number;
}

export interface CategoryInsightItem {
  category: string;
  displayLabel: string;
  categoryName: string;
  boys: CategoryGenderInsight;
  girls: CategoryGenderInsight;
  totalRecords: number;
  collegesRepresented: number;
  branchesRepresented: number;
}

export const AP_EAPCET_GLOBAL_STATS: ApAllotmentGlobalStats = ${JSON.stringify(stats, null, 2)};
export const AP_EAPCET_CATEGORY_INSIGHTS = ${JSON.stringify(categoryInsightsData, null, 2)};
export const AP_EAPCET_COLLEGES: ApCollegeItem[] = ${JSON.stringify(colleges, null, 2)};
`;
    fs.writeFileSync(path.join(process.cwd(), 'src/data/apEapcetCollegeManifest.ts'), manifestTsContent, 'utf8');

    console.log(`Generated AP 2026 category insights: ${totalInsightsRecords} records analyzed`);
    console.log(`Generated AP 2026 top-colleges index: ${collegeTopList.length} colleges, ${branchesList.length} branches`);
    console.log(`Generated AP 2026 predictor index: ${predictorCollegesList.length} colleges`);
  }

  console.log(`AP EAPCET ${year}: ${colleges.length} colleges, ${totalRecords} records, ${candidates.length} indexed candidates`);
}

for (const [year, dir] of Object.entries(DATASETS)) processYear(year, dir);
