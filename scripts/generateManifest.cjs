const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public/TG_EAPCET_2026_ALLOTMENT');

if (!fs.existsSync(dir)) {
  console.error('Error: Directory does not exist:', dir);
  process.exit(1);
}

const EXCLUDED_FILES = ['index.json', 'manifest.json', 'predictor_index.json', 'search_index.json'];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !EXCLUDED_FILES.includes(f));

const manifest = files.map(filename => {
  const filePath = path.join(dir, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  let data = {};
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse JSON file: ${filename}`, err);
    return null;
  }
  
  // Extract or derive collegeCode
  let collegeCode = (data.collegeCode || data.inst_code || '').trim();
  let collegeName = (data.collegeName || data.inst_name || '').trim();

  if (!collegeCode) {
    const baseName = filename.replace(/\.json$/i, '');
    const segments = baseName.split('_');
    collegeCode = segments[segments.length - 1].toUpperCase();
  }

  if (!collegeName) {
    collegeName = filename.replace(/\.json$/i, '').replace(/_/g, ' ');
  }

  const branches = (data.branches || []).map(b => {
    const recCount = b.records ? b.records.length : (b.totalAllotted || 0);
    return {
      branchCode: b.branchCode || b.branch_code || '',
      branchName: b.branchName || b.branch_name || b.branchCode || '',
      openingRank: typeof b.openingRank === 'number' ? b.openingRank : 0,
      closingRank: typeof b.closingRank === 'number' ? b.closingRank : 0,
      totalAllotted: recCount
    };
  });

  const recordCount = branches.reduce((sum, b) => sum + b.totalAllotted, 0);
  const openingRanks = branches.map(b => b.openingRank).filter(r => r > 0);
  const closingRanks = branches.map(b => b.closingRank).filter(r => r > 0);
  const minRank = openingRanks.length ? Math.min(...openingRanks) : 0;
  const maxRank = closingRanks.length ? Math.max(...closingRanks) : 0;

  // Derive district / region
  const upperName = collegeName.toUpperCase();
  let district = 'Hyderabad / Ranga Reddy / Medchal';
  if (upperName.includes('WARANGAL') || upperName.includes('KITS') || upperName.includes('KU ') || upperName.includes('KUEW')) {
    district = 'Warangal / Hanamkonda';
  } else if (upperName.includes('KHAMMAM') || upperName.includes('PALONCHA') || upperName.includes('SBIT') || upperName.includes('MOTHER TERESA')) {
    district = 'Khammam / Bhadradri';
  } else if (upperName.includes('KARIMNAGAR') || upperName.includes('JAGTIAL') || upperName.includes('JNKR') || upperName.includes('KTKM') || upperName.includes('VGSE')) {
    district = 'Karimnagar / Jagtial';
  } else if (upperName.includes('NIZAMABAD') || upperName.includes('KCEA')) {
    district = 'Nizamabad / Kamareddy';
  } else if (upperName.includes('NALGONDA') || upperName.includes('KODADA') || upperName.includes('KDDW') || upperName.includes('MGU') || upperName.includes('ANRK')) {
    district = 'Nalgonda / Suryapet';
  } else if (upperName.includes('MAHABUBNAGAR') || upperName.includes('WANAPARTHY') || upperName.includes('JNWN') || upperName.includes('JPNE')) {
    district = 'Mahabubnagar / Wanaparthy';
  } else if (upperName.includes('MEDAK') || upperName.includes('SANGAREDDY') || upperName.includes('SULTANPUR') || upperName.includes('JNTS') || upperName.includes('BVRI')) {
    district = 'Medak / Sangareddy';
  } else if (upperName.includes('MANTHANI') || upperName.includes('JNTM') || upperName.includes('PEDDAPALLI')) {
    district = 'Peddapalli / Manthani';
  } else if (upperName.includes('SIRICILLA') || upperName.includes('JNTR')) {
    district = 'Rajanna Siricilla';
  }

  // Precompute observed statistics for predictor
  const predictorBranchStats = {};
  const categories = ['OC', 'EWS', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC_I', 'SC_II', 'SC_III', 'SC', 'ST', 'MUS'];
  const genders = ['M', 'F'];
  const specialKeys = ['NCC', 'CAP', 'SPORTS', 'SG', 'PHO', 'PHH', 'PHV', 'PHA', 'PHM', 'PHC'];

  (data.branches || []).forEach(b => {
    const bCode = b.branchCode || b.branch_code || '';
    if (!bCode) return;
    const recs = b.records || [];
    const statsMap = {};
    const specialStats = {};

    categories.forEach(cat => {
      genders.forEach(gen => {
        const key = `${cat}_${gen}`;
        const matching = recs.filter(r => {
          const sc = (r.seatCategory || '').toUpperCase().replace(/\([0-9]+\)/g, '');
          const tokens = sc.split('_');

          // Exclude special reservations from normal category pool
          const hasSpecial = tokens.some(t => specialKeys.includes(t));
          if (hasSpecial) return false;

          // Gender pool filter
          // Male candidate cannot take exclusive girls quota
          if (gen === 'M' && tokens.includes('GIRLS') && !tokens.includes('GEN')) {
            return false;
          }

          // Social Category filter (Reserved students also eligible for OC merit seats)
          const isOC = tokens.includes('OC') || tokens.includes('OPEN');
          if (cat === 'OC') return isOC;
          if (cat === 'EWS') return tokens.includes('EWS') || isOC;
          if (cat === 'ST') return tokens.includes('ST') || isOC;
          if (cat === 'SC') return tokens.includes('SC') || isOC;
          if (cat === 'SC_I') return (tokens.includes('SC') && (tokens.includes('I') || tokens.includes('1'))) || isOC;
          if (cat === 'SC_II') return (tokens.includes('SC') && (tokens.includes('II') || tokens.includes('2'))) || isOC;
          if (cat === 'SC_III') return (tokens.includes('SC') && (tokens.includes('III') || tokens.includes('3'))) || isOC;
          if (cat.startsWith('BC_')) {
            const sub = cat.split('_')[1];
            return (tokens.includes('BC') && tokens.includes(sub)) || isOC;
          }
          if (cat === 'MUS') return tokens.includes('MUS') || isOC;
          return false;
        });

        if (matching.length > 0) {
          const ranks = matching.map(r => r.rank).filter(rk => typeof rk === 'number' && rk > 0).sort((a, b) => a - b);
          if (ranks.length > 0) {
            statsMap[key] = {
              min: ranks[0],
              max: ranks[ranks.length - 1],
              cnt: ranks.length,
              med: ranks[Math.floor(ranks.length / 2)]
            };
          }
        }
      });
    });

    // Also compute special quotas if any
    ['NCC', 'CAP', 'SPORTS', 'PHO', 'PHH', 'PHV', 'PHC'].forEach(sp => {
      const spMatching = recs.filter(r => {
        const sc = (r.seatCategory || '').toUpperCase();
        if (sp === 'SPORTS') return sc.includes('SPORTS') || sc.includes('SG');
        if (sp === 'PHC') return sc.includes('PHC') || sc.includes('PHA') || sc.includes('PHM');
        return sc.includes(sp);
      });
      if (spMatching.length > 0) {
        const ranks = spMatching.map(r => r.rank).filter(rk => typeof rk === 'number' && rk > 0).sort((a, b) => a - b);
        if (ranks.length > 0) {
          specialStats[sp] = {
            min: ranks[0],
            max: ranks[ranks.length - 1],
            cnt: ranks.length,
            med: ranks[Math.floor(ranks.length / 2)]
          };
        }
      }
    });

    predictorBranchStats[bCode] = {
      name: b.branchName || bCode,
      allotted: recs.length,
      stats: statsMap,
      specials: specialStats
    };
  });

  return {
    collegeCode,
    collegeName,
    district,
    filename,
    file: `/TG_EAPCET_2026_ALLOTMENT/${filename}`,
    branchCount: branches.length,
    recordCount,
    minRank,
    maxRank,
    branches,
    predictorBranches: predictorBranchStats
  };
}).filter(Boolean);

// Sort colleges alphabetically by college code
manifest.sort((a, b) => a.collegeCode.localeCompare(b.collegeCode));

const totalColleges = manifest.length;
const totalRecords = manifest.reduce((sum, c) => sum + c.recordCount, 0);
const allMinRanks = manifest.map(c => c.minRank).filter(r => r > 0);
const allMaxRanks = manifest.map(c => c.maxRank).filter(r => r > 0);
const minRankAll = allMinRanks.length ? Math.min(...allMinRanks) : 0;
const maxRankAll = allMaxRanks.length ? Math.max(...allMaxRanks) : 0;

const stats = {
  totalColleges,
  totalRecords,
  overallMinRank: minRankAll,
  overallMaxRank: maxRankAll,
  generatedAt: new Date().toISOString()
};

// Aggregate statewide branch catalog across all colleges
const branchAggMap = new Map();
manifest.forEach(c => {
  (c.branches || []).forEach(b => {
    const code = (b.branchCode || '').trim();
    if (!code) return;
    if (!branchAggMap.has(code)) {
      branchAggMap.set(code, {
        branchCode: code,
        branchName: b.branchName || code,
        totalAllotted: 0,
        collegeCount: 0,
        minOpeningRank: 999999,
        maxClosingRank: 0
      });
    }
    const item = branchAggMap.get(code);
    item.totalAllotted += b.totalAllotted;
    item.collegeCount += 1;
    if (b.openingRank > 0 && b.openingRank < item.minOpeningRank) item.minOpeningRank = b.openingRank;
    if (b.closingRank > item.maxClosingRank) item.maxClosingRank = b.closingRank;
  });
});

const statewideBranches = Array.from(branchAggMap.values())
  .map(b => ({
    branchCode: b.branchCode,
    branchName: b.branchName,
    totalAllotted: b.totalAllotted,
    collegeCount: b.collegeCount,
    openingRank: b.minOpeningRank === 999999 ? 0 : b.minOpeningRank,
    closingRank: b.maxClosingRank
  }))
  .sort((a, b) => b.totalAllotted - a.totalAllotted);

// Create a compact predictor index for instant client load (< 500 KB)
const compactPredictorIndex = {
  generatedAt: stats.generatedAt,
  totalColleges,
  totalRecords,
  colleges: manifest.map(c => ({
    code: c.collegeCode,
    name: c.collegeName,
    district: c.district,
    file: c.file,
    branches: c.predictorBranches
  }))
};

const predictorIndexFile = path.join(dir, 'predictor_index.json');
fs.writeFileSync(predictorIndexFile, JSON.stringify(compactPredictorIndex), 'utf8');

// Build compact client-side search index and compute category rank insights
console.log('Generating compact normalized search index and category insights...');

const CATEGORY_KEYS = ['OC', 'EWS', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC_I', 'SC_II', 'SC_III', 'ST'];
const DISPLAY_LABELS = {
  OC: 'OC',
  EWS: 'EWS',
  BC_A: 'BC-A',
  BC_B: 'BC-B',
  BC_C: 'BC-C',
  BC_D: 'BC-D',
  BC_E: 'BC-E',
  SC_I: 'SC-I',
  SC_II: 'SC-II',
  SC_III: 'SC-III',
  ST: 'ST'
};

const CATEGORY_NAMES = {
  OC: 'Open Competition (General Merit)',
  EWS: 'Economically Weaker Sections (10% Quota)',
  BC_A: 'Backward Class - Group A',
  BC_B: 'Backward Class - Group B',
  BC_C: 'Backward Class - Group C (Christian Converts)',
  BC_D: 'Backward Class - Group D',
  BC_E: 'Backward Class - Group E (Socially & Educationally Backward Muslims)',
  SC_I: 'Scheduled Caste - Group I (Sub-categorized)',
  SC_II: 'Scheduled Caste - Group II (Sub-categorized)',
  SC_III: 'Scheduled Caste - Group III (Sub-categorized)',
  ST: 'Scheduled Tribe'
};

function normalizeAllottedCategory(seatCategory) {
  if (!seatCategory) return null;
  const sc = seatCategory.toUpperCase();
  if (sc.startsWith('EWS')) return 'EWS';
  if (sc.startsWith('OC')) return 'OC';
  if (sc.startsWith('BC_A')) return 'BC_A';
  if (sc.startsWith('BC_B')) return 'BC_B';
  if (sc.startsWith('BC_C')) return 'BC_C';
  if (sc.startsWith('BC_D')) return 'BC_D';
  if (sc.startsWith('BC_E')) return 'BC_E';
  if (sc.startsWith('SC_III')) return 'SC_III';
  if (sc.startsWith('SC_II')) return 'SC_II';
  if (sc.startsWith('SC_I')) return 'SC_I';
  if (sc.startsWith('ST')) return 'ST';
  return null;
}

function createEmptyCategoryStats() {
  const map = {};
  for (const k of CATEGORY_KEYS) {
    map[k] = {
      category: k,
      displayLabel: DISPLAY_LABELS[k],
      categoryName: CATEGORY_NAMES[k],
      boys: { topRank: null, lastRank: null, recordCount: 0, colleges: new Set(), branches: new Set() },
      girls: { topRank: null, lastRank: null, recordCount: 0, colleges: new Set(), branches: new Set() },
      totalRecords: 0,
      colleges: new Set(),
      branches: new Set()
    };
  }
  return map;
}

const quotaInsightsMap = createEmptyCategoryStats();
const casteInsightsMap = createEmptyCategoryStats();
const compactCandidates = [];
const overallCollegesSet = new Set();
const overallBranchesSet = new Set();
let validRecordCount = 0;

for (const file of files) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const cCode = d.collegeCode || file.replace('.json', '');
    overallCollegesSet.add(cCode);

    for (const b of (d.branches || [])) {
      const bCode = b.branchCode || '';
      if (bCode) overallBranchesSet.add(bCode);

      for (const r of (b.records || [])) {
        compactCandidates.push([
          r.rank,
          r.name,
          r.gender,
          r.caste,
          r.seatCategory,
          r.hallTicket,
          cCode,
          bCode,
          r.region || 'OU'
        ]);

        const rank = r.rank;
        if (typeof rank !== 'number' || isNaN(rank) || rank <= 0) continue;
        const gender = r.gender;
        if (gender !== 'M' && gender !== 'F') continue;
        validRecordCount++;

        // 1. Quota category
        const quotaCat = normalizeAllottedCategory(r.seatCategory);
        if (quotaCat && quotaInsightsMap[quotaCat]) {
          const item = quotaInsightsMap[quotaCat];
          const g = gender === 'M' ? item.boys : item.girls;
          if (g.topRank === null || rank < g.topRank) g.topRank = rank;
          if (g.lastRank === null || rank > g.lastRank) g.lastRank = rank;
          g.recordCount++;
          g.colleges.add(cCode);
          g.branches.add(bCode);

          item.totalRecords++;
          item.colleges.add(cCode);
          item.branches.add(bCode);
        }

        // 2. Candidate Caste category
        const casteCat = r.caste;
        if (casteCat && casteInsightsMap[casteCat]) {
          const item = casteInsightsMap[casteCat];
          const g = gender === 'M' ? item.boys : item.girls;
          if (g.topRank === null || rank < g.topRank) g.topRank = rank;
          if (g.lastRank === null || rank > g.lastRank) g.lastRank = rank;
          g.recordCount++;
          g.colleges.add(cCode);
          g.branches.add(bCode);

          item.totalRecords++;
          item.colleges.add(cCode);
          item.branches.add(bCode);
        }
      }
    }
  } catch (e) {
    console.error('Error indexing file:', file, e);
  }
}

function serializeInsights(map) {
  return CATEGORY_KEYS.map(k => {
    const item = map[k];
    return {
      category: item.category,
      displayLabel: item.displayLabel,
      categoryName: item.categoryName,
      boys: {
        topRank: item.boys.topRank,
        lastRank: item.boys.lastRank,
        recordCount: item.boys.recordCount,
        collegesCount: item.boys.colleges.size,
        branchesCount: item.boys.branches.size
      },
      girls: {
        topRank: item.girls.topRank,
        lastRank: item.girls.lastRank,
        recordCount: item.girls.recordCount,
        collegesCount: item.girls.colleges.size,
        branchesCount: item.girls.branches.size
      },
      totalRecords: item.totalRecords,
      collegesRepresented: item.colleges.size,
      branchesRepresented: item.branches.size
    };
  });
}

const overallInsightsData = {
  datasetStats: {
    totalRecords: validRecordCount,
    totalColleges: overallCollegesSet.size,
    totalBranches: overallBranchesSet.size,
    generatedAt: new Date().toISOString()
  },
  byAllottedQuota: serializeInsights(quotaInsightsMap),
  byCandidateCaste: serializeInsights(casteInsightsMap)
};

const insightsFile = path.join(dir, 'category_insights.json');
fs.writeFileSync(insightsFile, JSON.stringify(overallInsightsData, null, 2), 'utf8');

const searchIndexObj = {
  total: compactCandidates.length,
  fields: ['rank', 'name', 'gender', 'caste', 'seatCategory', 'hallTicket', 'collegeCode', 'branchCode', 'region'],
  candidates: compactCandidates
};
const searchIndexFile = path.join(dir, 'search_index.json');
fs.writeFileSync(searchIndexFile, JSON.stringify(searchIndexObj), 'utf8');

// Build Top B.Tech Colleges OC ranking index
console.log('Generating Top B.Tech Colleges OC ranking index...');
const collegeDistrictMap = new Map();
manifest.forEach(c => collegeDistrictMap.set(c.collegeCode, c.district || 'Telangana'));

function calcRankStats(ranks) {
  if (!ranks || ranks.length === 0) return null;
  const sorted = ranks.slice().sort((a, b) => a - b);
  const len = sorted.length;
  const m = Math.floor(len / 2);
  const median = len % 2 !== 0 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
  return {
    highestRank: sorted[0],
    lowestRank: sorted[len - 1],
    medianRank: median,
    validAllotments: len
  };
}

const topCollegesList = [];
const branchStatewideOcRanks = new Map();

for (const file of files) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const cCode = (d.collegeCode || file.replace('.json', '')).trim();
    const cName = (d.collegeName || cCode).trim();
    const district = collegeDistrictMap.get(cCode) || 'Telangana';

    const branchesMap = {};
    const collegeAllCasteOc = [];
    const collegeAllQuotaOc = [];

    for (const b of (d.branches || [])) {
      const bCode = (b.branchCode || '').trim();
      if (!bCode) continue;

      const recs = b.records || [];
      const casteOc = [];
      const quotaOc = [];

      for (const r of recs) {
        const rank = r.rank;
        if (typeof rank !== 'number' || isNaN(rank) || rank <= 0) continue;

        if (r.caste === 'OC') {
          casteOc.push(rank);
          collegeAllCasteOc.push(rank);

          if (!branchStatewideOcRanks.has(bCode)) {
            branchStatewideOcRanks.set(bCode, []);
          }
          branchStatewideOcRanks.get(bCode).push(rank);
        }

        const seatCat = (r.seatCategory || '').toUpperCase();
        if (seatCat.startsWith('OC')) {
          quotaOc.push(rank);
          collegeAllQuotaOc.push(rank);
        }
      }

      branchesMap[bCode] = {
        branchCode: bCode,
        branchName: b.branchName || bCode,
        totalBranchAllotted: recs.length,
        casteOc: calcRankStats(casteOc),
        quotaOc: calcRankStats(quotaOc)
      };
    }

    topCollegesList.push({
      collegeCode: cCode,
      collegeName: cName,
      district,
      branches: branchesMap,
      allBranchesCasteOc: calcRankStats(collegeAllCasteOc),
      allBranchesQuotaOc: calcRankStats(collegeAllQuotaOc)
    });
  } catch (err) {
    console.error('Error generating OC stats for file:', file, err);
  }
}

const branchStatewideSummaries = {};
for (const [bCode, ranks] of branchStatewideOcRanks.entries()) {
  branchStatewideSummaries[bCode] = calcRankStats(ranks);
}

const topCollegesIndexData = {
  generatedAt: new Date().toISOString(),
  methodology: "College comparisons in this section are calculated using valid OC-category allotment ranks from the available Telangana EAPCET 2026 dataset.",
  totalColleges: topCollegesList.length,
  branchSummaries: branchStatewideSummaries,
  colleges: topCollegesList
};

const topCollegesFile = path.join(dir, 'top_colleges_index.json');
fs.writeFileSync(topCollegesFile, JSON.stringify(topCollegesIndexData), 'utf8');
console.log(`Successfully generated top colleges OC ranking index at ${topCollegesFile}`);

// Strip predictorBranches from manifest.ts to keep the manifest file concise
const manifestClean = manifest.map(({ predictorBranches, ...rest }) => rest);

const code = `// AUTOGENERATED BUILD-TIME MANIFEST FROM public/TG_EAPCET_2026_ALLOTMENT/
// DO NOT EDIT MANUALLY. Run 'node scripts/generateManifest.cjs' to regenerate.

export interface TgBranchManifestItem {
  branchCode: string;
  branchName: string;
  openingRank: number;
  closingRank: number;
  totalAllotted: number;
}

export interface TgCollegeManifestItem {
  collegeCode: string;
  collegeName: string;
  district?: string;
  filename: string;
  file: string;
  branchCount: number;
  recordCount: number;
  minRank: number;
  maxRank: number;
  branches: TgBranchManifestItem[];
}

export interface TgBranchGlobalItem {
  branchCode: string;
  branchName: string;
  totalAllotted: number;
  collegeCount: number;
  openingRank: number;
  closingRank: number;
}

export interface TgAllotmentGlobalStats {
  totalColleges: number;
  totalRecords: number;
  overallMinRank: number;
  overallMaxRank: number;
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

export interface TgOverallInsightsData {
  datasetStats: {
    totalRecords: number;
    totalColleges: number;
    totalBranches: number;
    generatedAt: string;
  };
  byAllottedQuota: CategoryInsightItem[];
  byCandidateCaste: CategoryInsightItem[];
}

export const TG_EAPCET_GLOBAL_STATS: TgAllotmentGlobalStats = ${JSON.stringify(stats, null, 2)};

export const TG_EAPCET_ALL_BRANCHES: TgBranchGlobalItem[] = ${JSON.stringify(statewideBranches, null, 2)};

export const TG_EAPCET_CATEGORY_INSIGHTS: TgOverallInsightsData = ${JSON.stringify(overallInsightsData, null, 2)};

export const TG_EAPCET_COLLEGE_MANIFEST: TgCollegeManifestItem[] = ${JSON.stringify(manifestClean, null, 2)};
`;

const targetFile = path.join(process.cwd(), 'src/data/tgEapcetCollegeManifest.ts');
fs.writeFileSync(targetFile, code, 'utf8');

// Also write public/TG_EAPCET_2026_ALLOTMENT/manifest.json for runtime dynamic fetching
const jsonTargetFile = path.join(dir, 'manifest.json');
fs.writeFileSync(jsonTargetFile, JSON.stringify({ stats, branches: statewideBranches, colleges: manifestClean }, null, 2), 'utf8');

console.log(`Successfully generated manifest at ${targetFile} and ${jsonTargetFile}`);
console.log(`Successfully generated compact predictor index at ${predictorIndexFile}`);
console.log(`Successfully generated compact search index at ${searchIndexFile} (${compactCandidates.length} records)`);
console.log(`Count: ${totalColleges} colleges, ${totalRecords} total candidate records.`);
