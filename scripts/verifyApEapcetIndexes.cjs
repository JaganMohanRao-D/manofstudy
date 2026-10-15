const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const years = ['2025', '2026'];
const errors = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function countCollegeRecords(raw) {
  if (Array.isArray(raw.records)) return raw.records.length;
  if (Array.isArray(raw.branches)) {
    return raw.branches.reduce((total, branch) =>
      total + (Array.isArray(branch.records) ? branch.records.length : 0), 0);
  }
  if (Array.isArray(raw.allotments)) return raw.allotments.length;
  if (Array.isArray(raw.data)) return raw.data.length;
  return 0;
}

for (const year of years) {
  const dir = path.join(root, 'public', `AP_EAPCET_${year}_ALLOTMENT_BY_COLLEGE`);
  const manifestPath = path.join(dir, 'manifest.json');
  const searchPath = path.join(dir, 'search_index.json');
  if (!fs.existsSync(manifestPath) || !fs.existsSync(searchPath)) {
    errors.push(`${year}: missing manifest.json or search_index.json`);
    continue;
  }

  const manifest = readJson(manifestPath);
  const search = readJson(searchPath);
  const colleges = Array.isArray(manifest.colleges) ? manifest.colleges : [];
  const expectedRecords = Number(manifest.stats?.totalRecords ?? manifest.totalRecords ?? 0);
  let indexedRecords = Array.isArray(search.candidates) ? search.candidates.length : 0;

  if (Array.isArray(search.chunks) && search.chunks.length) {
    indexedRecords = 0;
    for (const chunkName of search.chunks) {
      const chunkPath = path.join(dir, path.basename(String(chunkName)));
      if (!fs.existsSync(chunkPath)) {
        errors.push(`${year}: missing search chunk ${chunkName}`);
        continue;
      }
      const chunk = readJson(chunkPath);
      if (Array.isArray(chunk)) indexedRecords += chunk.length;
      else if (Array.isArray(chunk.candidates)) indexedRecords += chunk.candidates.length;
    }
  }

  const districts = new Set(colleges
    .map((college) => String(college.district ?? '').trim())
    .filter((district) => district && district.toUpperCase() !== 'ANDHRA PRADESH'));

  const firstCollege = colleges.find((college) => college.file && String(college.college_code ?? college.collegeCode ?? '').toUpperCase() !== 'CBIT');
  let sampleRecords = 0;
  if (firstCollege) {
    const filePath = path.join(dir, path.basename(firstCollege.file));
    if (fs.existsSync(filePath)) sampleRecords = countCollegeRecords(readJson(filePath));
  }

  if (!colleges.length) errors.push(`${year}: college manifest is empty`);
  if (!expectedRecords || !indexedRecords) errors.push(`${year}: search index has zero records (expected ${expectedRecords}, loaded ${indexedRecords})`);
  if (expectedRecords && indexedRecords !== expectedRecords) {
    errors.push(`${year}: search-index count mismatch (expected ${expectedRecords}, loaded ${indexedRecords})`);
  }
  if (!sampleRecords) errors.push(`${year}: sample college file has zero parsed allotment records`);
  if (year === '2025' && districts.size < 10) errors.push(`2025: only ${districts.size} usable districts found in manifest`);

  console.log(`[ap-verify] ${year}: ${colleges.length} colleges; ${indexedRecords} indexed records; ${districts.size} usable districts; sample college records ${sampleRecords}`);
}

if (errors.length) {
  for (const error of errors) console.error('[ap-verify] ERROR:', error);
  process.exitCode = 1;
} else {
  console.log('[ap-verify] AP EAPCET indexes passed runtime-data checks.');
}
