const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE');
const indexFile = path.join(dir, 'index.json');

if (!fs.existsSync(indexFile)) {
  console.error('index.json not found in', dir);
  process.exit(1);
}

const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
const colleges = indexData.colleges || [];

const collegeMap = {};
const branchMap = {};
const candidates = [];
const collegeManifest = [];
const globalCategories = new Set();
const globalAllottedCategories = new Set();
const globalRegions = new Set();
const globalPhases = new Set();
let minRank = Infinity;
let maxRank = -Infinity;

let totalAllotmentRecords = 0;
let totalIndexedBranches = 0;

colleges.forEach((col) => {
  collegeMap[col.college_code] = col.college_name;
  const filePath = path.join(dir, col.file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    try {
      const colData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const branches = colData.branches || [];
      let collegeRecCount = 0;
      const branchSummaries = [];

      branches.forEach((b) => {
        branchMap[b.branch_code] = b.branch_name;
        totalIndexedBranches++;
        const recs = b.records || [];
        collegeRecCount += recs.length;
        totalAllotmentRecords += recs.length;

        branchSummaries.push({
          branch_code: b.branch_code,
          branch_name: b.branch_name,
          record_count: recs.length
        });

        recs.forEach((r) => {
          const rankNum = parseFloat(r.rank);
          const validRank = isNaN(rankNum) ? 0 : Math.round(rankNum);
          if (validRank > 0) {
            if (validRank < minRank) minRank = validRank;
            if (validRank > maxRank) maxRank = validRank;
          }

          if (r.category) globalCategories.add(r.category);
          if (r.alloted_category) globalAllottedCategories.add(r.alloted_category);
          if (r.region) globalRegions.add(r.region);
          if (r.phase !== undefined && r.phase !== null) globalPhases.add(r.phase);

          // Compact format for ultra-fast transfer:
          // [rank, cand_name, gender, category, region, alloted_category, phase, college_code, branch_code]
          candidates.push([
            validRank,
            r.cand_name || '',
            r.gender || '',
            r.category || '',
            r.region || '',
            r.alloted_category || '',
            r.phase || 1,
            col.college_code,
            b.branch_code
          ]);
        });
      });

      collegeManifest.push({
        college_code: col.college_code,
        college_name: colData.college_name || col.college_name,
        file: col.file,
        has_data: true,
        record_count: collegeRecCount,
        branches: branchSummaries
      });
    } catch (err) {
      console.error('Error processing', col.file, err.message);
    }
  } else {
    collegeManifest.push({
      college_code: col.college_code,
      college_name: col.college_name,
      file: col.file,
      has_data: false,
      record_count: 0,
      branches: []
    });
  }
});

const stats = {
  totalColleges: collegeManifest.length,
  collegesWithData: collegeManifest.filter((c) => c.has_data).length,
  totalBranches: totalIndexedBranches,
  totalRecords: totalAllotmentRecords,
  categories: Array.from(globalCategories).sort(),
  allottedCategories: Array.from(globalAllottedCategories).sort(),
  regions: Array.from(globalRegions).sort(),
  phases: Array.from(globalPhases).sort(),
  minRank: minRank === Infinity ? 0 : minRank,
  maxRank: maxRank === -Infinity ? 0 : maxRank
};

const searchIndex = {
  version: '2025.1',
  generated_at: new Date().toISOString(),
  stats,
  collegeMap,
  branchMap,
  candidates
};

const manifestData = {
  version: '2025.1',
  generated_at: new Date().toISOString(),
  stats,
  colleges: collegeManifest
};

fs.writeFileSync(path.join(dir, 'search_index.json'), JSON.stringify(searchIndex));
fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifestData, null, 2));

console.log('Successfully generated:');
console.log('- search_index.json (candidates:', candidates.length, ')');
console.log('- manifest.json (colleges:', collegeManifest.length, ')');
console.log('Stats:', stats);
