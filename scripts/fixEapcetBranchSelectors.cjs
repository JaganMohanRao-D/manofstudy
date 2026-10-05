const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`[branch-selector] Failed to parse ${filePath}: ${error.message}`);
  }
}

function normalizeOptions(entries) {
  const seen = new Map();
  for (const entry of entries || []) {
    const code = String(entry?.code ?? entry?.branchCode ?? '').trim().toUpperCase();
    const name = String(entry?.name ?? entry?.branchName ?? code).trim();
    if (!code || !name || code === 'ALL') continue;
    if (!seen.has(code)) seen.set(code, { code, name });
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
}

function buildOptions(allotmentData, branchSource) {
  const entries = branchSource === 'ap'
    ? Object.entries(allotmentData?.branchMap || {}).map(([code, name]) => ({ code, name }))
    : Array.isArray(allotmentData?.branches)
      ? allotmentData.branches.map((branch) => ({ code: branch.branchCode, name: branch.branchName }))
      : [];

  const options = normalizeOptions(entries);
  if (!options.length) {
    throw new Error(`[branch-selector] No ${branchSource.toUpperCase()} 2026 branches were found. Refusing to overwrite branch catalogs.`);
  }

  return [
    { code: 'ALL', name: 'All Branches (Show all engineering disciplines)' },
    ...options,
  ];
}

function optionSource(options) {
  return options
    .map((option) => `  { code: ${JSON.stringify(option.code)}, name: ${JSON.stringify(option.name)} },`)
    .join('\n');
}

// Formatting-independent replacement. The previous version relied on a
// multiline regex and caused the Cloudflare build to stop before Vite ran.
function replaceExportedArray(file, exportName, options) {
  let source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const declaration = `export const ${exportName} =`;
  const start = source.indexOf(declaration);
  const replacement = `${declaration} [\n${optionSource(options)}\n];`;

  if (start >= 0) {
    const arrayStart = source.indexOf('[', start + declaration.length);
    const end = arrayStart >= 0 ? source.indexOf('];', arrayStart) : -1;
    if (arrayStart >= 0 && end >= 0) {
      source = source.slice(0, start) + replacement + source.slice(end + 2);
      fs.writeFileSync(file, source, 'utf8');
      return;
    }
  }

  // Recovery path for a partially applied earlier commit.
  const markers = ['\nlet cachedQuotaData', '\nlet cached', '\nconst ALL_BRANCH_OPTIONS'];
  for (const marker of markers) {
    const index = source.indexOf(marker);
    if (index >= 0) {
      source = source.slice(0, index) + `\n\n${replacement}\n` + source.slice(index);
      fs.writeFileSync(file, source, 'utf8');
      console.log(`[branch-selector] Restored missing ${exportName} in ${path.relative(root, file)}`);
      return;
    }
  }

  throw new Error(`[branch-selector] Could not safely locate or restore ${exportName} in ${file}`);
}

function ensureImport(file) {
  let source = fs.readFileSync(file, 'utf8');
  if (source.includes("./SearchableBranchSelect")) return;

  const reactImport = source.match(/^import[^\n]*from ['"]react['"];?/m);
  if (reactImport) {
    const insertAt = source.indexOf(reactImport[0]) + reactImport[0].length;
    source = source.slice(0, insertAt) + `\nimport SearchableBranchSelect from './SearchableBranchSelect';` + source.slice(insertAt);
  } else {
    source = `import SearchableBranchSelect from './SearchableBranchSelect';\n${source}`;
  }
  fs.writeFileSync(file, source, 'utf8');
}

function patchBranchSelect(file, stateName, optionName, placeholder, label) {
  if (!fs.existsSync(file)) return;
  ensureImport(file);
  let source = fs.readFileSync(file, 'utf8');

  if (source.includes('<SearchableBranchSelect') && source.includes(`options={${optionName}}`)) return;

  const pattern = new RegExp(`<select\\b[\\s\\S]*?value=\\{${stateName}\\}[\\s\\S]*?\\{${optionName}\\.map[\\s\\S]*?<\\/select>`);
  if (!pattern.test(source)) {
    console.log(`[branch-selector] ${label}: existing selector markup not found; leaving it unchanged.`);
    return;
  }

  const replacement = `<SearchableBranchSelect\n                  options={${optionName}}\n                  value={${stateName}}\n                  onChange={setSelectedBranch}\n                  placeholder=${JSON.stringify(placeholder)}\n                />`;
  source = source.replace(pattern, replacement);
  fs.writeFileSync(file, source, 'utf8');
  console.log(`[branch-selector] ${label}: searchable selector applied.`);
}

function patchApTopColleges() {
  const file = path.join(root, 'src/components/ApTopColleges.jsx');
  if (!fs.existsSync(file)) return;
  ensureImport(file);
  let source = fs.readFileSync(file, 'utf8');
  if (source.includes('<SearchableBranchSelect') && source.includes('options={[{ code:')) return;

  const pattern = /<select\b[\s\S]*?value=\{branch\}[\s\S]*?\{branches\.map\([\s\S]*?<\/select>/;
  if (!pattern.test(source)) return;

  source = source.replace(
    pattern,
    `<SearchableBranchSelect\n                options={[{ code: 'ALL', name: 'All Engineering Branches (Combined View)' }, ...branches]}\n                value={branch}\n                onChange={setBranch}\n                placeholder="Search AP branch name or code..."\n              />`
  );
  fs.writeFileSync(file, source, 'utf8');
}

function patchApAllotmentExplorer() {
  const file = path.join(root, 'src/components/ap-allotment/APAllotmentExplorer.tsx');
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');

  source = source.replace(
    /  const onDistrictChange = \(district: string\) => \{\n    setSelectedDistrict\(district\);\n    setSelectedCollegeCode\('ALL'\);\n    setSelectedBranchCode\('ALL'\);\n    resetFilters\(\);\n  \};/,
    `  const onDistrictChange = (district: string) => {\n    setSelectedDistrict(district);\n    setSelectedCollegeCode('ALL');\n    resetFilters();\n  };`
  );

  source = source.replace(
    /  const onCollegeChange = \(code: string\) => \{\n    setSelectedCollegeCode\(code\);\n    setSelectedBranchCode\('ALL'\);\n    setAllColleges\(\[\]\);\n    resetFilters\(\);\n  \};/,
    `  const onCollegeChange = (code: string) => {\n    setSelectedCollegeCode(code);\n    setAllColleges([]);\n    resetFilters();\n  };`
  );

  source = source.replace(
    /  useEffect\(\(\) => \{\n    const available = new Set\(\(collegeData\?\.branches \?\? \[\]\)\.map\(\(branch\) => branch\.branch_code\)\);\n    if \(selectedBranchCode !== 'ALL' && !available\.has\(selectedBranchCode\)\) setSelectedBranchCode\('ALL'\);\n  \}, \[collegeData, selectedBranchCode\]\);/,
    `  useEffect(() => {\n    if (!collegeData || collegeData.college_code !== selectedCollegeCode) return;\n    const available = new Set((collegeData.branches ?? []).map((branch) => branch.branch_code));\n    if (selectedBranchCode !== 'ALL' && !available.has(selectedBranchCode)) setSelectedBranchCode('ALL');\n  }, [collegeData, selectedCollegeCode, selectedBranchCode]);`
  );

  fs.writeFileSync(file, source, 'utf8');
}

function patchTgAllotmentExplorer() {
  const file = path.join(root, 'src/components/TgAllotmentExplorer.jsx');
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(
    /setSelectedCollegeCode\(c\.code\);\n\s*setSelectedBranchCode\('ALL'\);/,
    `setSelectedCollegeCode(c.code);\n                      // Preserve the selected branch; validate it after the new college loads.`
  );
  fs.writeFileSync(file, source, 'utf8');
}

function patchApNameFallback() {
  const file = path.join(root, 'scripts/generateApAllotmentIndexes.cjs');
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(
    /r\.applicant_name \?\? r\.cand_name \?\? r\.name \?\? ''/g,
    "r.applicant_name ?? r.candidate_name ?? r.student_name ?? r.candidateName ?? r.studentName ?? r.cand_name ?? r.name ?? ''"
  );
  source = source.replace(
    /r\.cand_name \?\? r\.applicant_name \?\? r\.name \?\? ''/g,
    "r.cand_name ?? r.applicant_name ?? r.candidate_name ?? r.student_name ?? r.candidateName ?? r.studentName ?? r.name ?? ''"
  );
  fs.writeFileSync(file, source, 'utf8');
}

const apIndex = readJson(path.join(root, 'public/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/search_index.json'));
const tgManifest = readJson(path.join(root, 'public/TG_EAPCET_2026_ALLOTMENT/manifest.json'));

const apOptions = buildOptions(apIndex, 'ap');
const tgOptions = buildOptions(tgManifest, 'tg');

replaceExportedArray(path.join(root, 'src/services/apCollegePredictorService.ts'), 'AP_BRANCH_OPTIONS', apOptions);
replaceExportedArray(path.join(root, 'src/components/TgCollegePredictor.jsx'), 'ALL_BRANCH_OPTIONS', tgOptions);

patchBranchSelect(path.join(root, 'src/components/ApCollegePredictor.jsx'), 'selectedBranch', 'AP_BRANCH_OPTIONS', 'Search AP branch name or code...', 'AP predictor');
patchBranchSelect(path.join(root, 'src/components/ApCollegePredictor.tsx'), 'selectedBranch', 'AP_BRANCH_OPTIONS', 'Search AP branch name or code...', 'AP predictor TSX');
patchBranchSelect(path.join(root, 'src/components/TgCollegePredictor.jsx'), 'selectedBranch', 'ALL_BRANCH_OPTIONS', 'Search Telangana branch name or code...', 'TG predictor');
patchBranchSelect(path.join(root, 'src/components/TgCollegePredictor.tsx'), 'selectedBranch', 'ALL_BRANCH_OPTIONS', 'Search Telangana branch name or code...', 'TG predictor TSX');

patchApTopColleges();
patchApAllotmentExplorer();
patchTgAllotmentExplorer();
patchApNameFallback();

console.log(`[branch-selector] AP 2026 branch catalog: ${apOptions.length - 1} real branches`);
console.log(`[branch-selector] TG 2026 branch catalog: ${tgOptions.length - 1} real branches`);
console.log('[branch-selector] Searchable selectors + branch persistence + student-name fallback applied successfully.');
