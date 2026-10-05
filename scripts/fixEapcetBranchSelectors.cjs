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

function buildOptions(allotmentPath, branchSource) {
  const entries = branchSource === 'ap'
    ? Object.entries(allotmentPath?.branchMap || {}).map(([code, name]) => ({ code, name }))
    : Array.isArray(allotmentPath?.branches)
      ? allotmentPath.branches.map((branch) => ({ code: branch.branchCode, name: branch.branchName }))
      : [];

  const options = normalizeOptions(entries);
  if (!options.length) {
    throw new Error(`[branch-selector] No ${branchSource.toUpperCase()} 2026 branches were found. Refusing to overwrite branch catalogs.`);
  }
  return [
    { code: 'ALL', name: branchSource === 'ap' ? 'All Branches (Show all engineering disciplines)' : 'All Branches (Show all engineering disciplines)' },
    ...options,
  ];
}

function optionSource(options) {
  return options.map((option) => `  { code: ${JSON.stringify(option.code)}, name: ${JSON.stringify(option.name)} },`).join('\n');
}

function replaceExportedArray(file, exportName, options) {
  let source = fs.readFileSync(file, 'utf8');
  const pattern = new RegExp(`export const ${exportName} = \\[\\s\\S]*?\\n\\];`);
  const replacement = `export const ${exportName} = [\n${optionSource(options)}\n];`;
  if (!pattern.test(source)) {
    throw new Error(`[branch-selector] Could not find ${exportName} in ${file}`);
  }
  source = source.replace(pattern, replacement);
  fs.writeFileSync(file, source, 'utf8');
}

function ensureImport(file, importPath) {
  let source = fs.readFileSync(file, 'utf8');
  if (!source.includes("./SearchableBranchSelect")) {
    const marker = "import React";
    const index = source.indexOf(marker);
    if (index < 0) throw new Error(`[branch-selector] React import not found in ${file}`);
    const lineEnd = source.indexOf('\n', index);
    source = source.slice(0, lineEnd + 1) + `import SearchableBranchSelect from './SearchableBranchSelect';\n` + source.slice(lineEnd + 1);
    fs.writeFileSync(file, source, 'utf8');
  }
}

function patchApPredictor() {
  const file = path.join(root, 'src/components/ApCollegePredictor.jsx');
  let source = fs.readFileSync(file, 'utf8');
  ensureImport(file, './SearchableBranchSelect');
  source = fs.readFileSync(file, 'utf8');

  if (!source.includes('<SearchableBranchSelect options={AP_BRANCH_OPTIONS}')) {
    const pattern = /<select\s+value=\{selectedBranch\}[\s\S]*?\{AP_BRANCH_OPTIONS\.map\(\(b\) => \([\s\S]*?<\/select>/;
    if (!pattern.test(source)) throw new Error('[branch-selector] AP predictor branch select marker not found.');
    source = source.replace(pattern, `<SearchableBranchSelect\n                  options={AP_BRANCH_OPTIONS}\n                  value={selectedBranch}\n                  onChange={setSelectedBranch}\n                  placeholder="Search AP branch name or code..."\n                />`);
    fs.writeFileSync(file, source, 'utf8');
  }
}

function patchTgPredictor() {
  const file = path.join(root, 'src/components/TgCollegePredictor.jsx');
  let source = fs.readFileSync(file, 'utf8');
  ensureImport(file, './SearchableBranchSelect');
  source = fs.readFileSync(file, 'utf8');

  if (!source.includes('<SearchableBranchSelect options={ALL_BRANCH_OPTIONS}')) {
    const pattern = /<select\s+value=\{selectedBranch\}[\s\S]*?\{ALL_BRANCH_OPTIONS\.map\(b => \([\s\S]*?<\/select>/;
    if (!pattern.test(source)) throw new Error('[branch-selector] TG predictor branch select marker not found.');
    source = source.replace(pattern, `<SearchableBranchSelect\n                      options={ALL_BRANCH_OPTIONS}\n                      value={selectedBranch}\n                      onChange={setSelectedBranch}\n                      placeholder="Search Telangana branch name or code..."\n                    />`);
    fs.writeFileSync(file, source, 'utf8');
  }
}

function patchApTopColleges() {
  const file = path.join(root, 'src/components/ApTopColleges.jsx');
  let source = fs.readFileSync(file, 'utf8');
  ensureImport(file, './SearchableBranchSelect');
  source = fs.readFileSync(file, 'utf8');

  if (!source.includes('<SearchableBranchSelect options={branches}')) {
    const pattern = /<select\s+value=\{branch\}[\s\S]*?\{branches\.map\(\(item\) => \([\s\S]*?<\/select>/;
    if (!pattern.test(source)) throw new Error('[branch-selector] AP top-colleges branch select marker not found.');
    source = source.replace(pattern, `<SearchableBranchSelect\n                options={[{ code: 'ALL', name: 'All Engineering Branches (Combined View)' }, ...branches]}\n                value={branch}\n                onChange={setBranch}\n                placeholder="Search AP branch name or code..."\n              />`);
    fs.writeFileSync(file, source, 'utf8');
  }
}

function patchApAllotmentExplorer() {
  const file = path.join(root, 'src/components/ap-allotment/APAllotmentExplorer.tsx');
  let source = fs.readFileSync(file, 'utf8');

  source = source.replace(
    /  const onDistrictChange = \(district: string\) => \{\n    setSelectedDistrict\(district\);\n    setSelectedCollegeCode\('ALL'\);\n    setSelectedBranchCode\('ALL'\);\n    resetFilters\(\);\n  \};/,
    `  const onDistrictChange = (district: string) => {\n    setSelectedDistrict(district);\n    setSelectedCollegeCode('ALL');\n    // Keep the student's selected branch when switching back to statewide view.\n    resetFilters();\n  };`
  );

  source = source.replace(
    /  const onCollegeChange = \(code: string\) => \{\n    setSelectedCollegeCode\(code\);\n    setSelectedBranchCode\('ALL'\);\n    setAllColleges\(\[\]\);\n    resetFilters\(\);\n  \};/,
    `  const onCollegeChange = (code: string) => {\n    setSelectedCollegeCode(code);\n    // Do not force the branch back to ALL. The validation effect below keeps the\n    // selected branch when that branch exists in the chosen college and only\n    // falls back to ALL when the college truly does not offer it.\n    setAllColleges([]);\n    resetFilters();\n  };`
  );

  source = source.replace(
    /  useEffect\(\(\) => \{\n    const available = new Set\(\(collegeData\?\.branches \?\? \[\]\)\.map\(\(branch\) => branch\.branch_code\)\);\n    if \(selectedBranchCode !== 'ALL' && !available\.has\(selectedBranchCode\)\) setSelectedBranchCode\('ALL'\);\n  \}, \[collegeData, selectedBranchCode\]\);/,
    `  useEffect(() => {\n    // Ignore the old college's branch list while the newly selected college is\n    // still loading. This prevents a valid branch from being reset to ALL.\n    if (!collegeData || collegeData.college_code !== selectedCollegeCode) return;\n    const available = new Set((collegeData.branches ?? []).map((branch) => branch.branch_code));\n    if (selectedBranchCode !== 'ALL' && !available.has(selectedBranchCode)) setSelectedBranchCode('ALL');\n  }, [collegeData, selectedCollegeCode, selectedBranchCode]);`
  );

  source = source.replace(/limit: 500,\n      \}\);/, 'limit: 1000,\n      });');
  fs.writeFileSync(file, source, 'utf8');
}

function patchTgAllotmentExplorer() {
  const file = path.join(root, 'src/components/TgAllotmentExplorer.jsx');
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(
    /setSelectedCollegeCode\(c\.code\);\n\s*setSelectedBranchCode\('ALL'\);/,
    `setSelectedCollegeCode(c.code);\n                      // Preserve the chosen branch. The college-data loader\n                      // validates it and falls back to ALL only when unavailable.`
  );
  fs.writeFileSync(file, source, 'utf8');
}

function patchApNameFallback() {
  const file = path.join(root, 'scripts/generateApAllotmentIndexes.cjs');
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(
    "r.applicant_name ?? r.cand_name ?? r.name ?? ''",
    "r.applicant_name ?? r.candidate_name ?? r.student_name ?? r.candidateName ?? r.studentName ?? r.cand_name ?? r.name ?? ''"
  );
  source = source.replace(
    "r.cand_name ?? r.applicant_name ?? r.name ?? ''",
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

patchApPredictor();
patchTgPredictor();
patchApTopColleges();
patchApAllotmentExplorer();
patchTgAllotmentExplorer();
patchApNameFallback();

console.log(`[branch-selector] AP 2026 branch catalog: ${apOptions.length - 1} real branches`);
console.log(`[branch-selector] TG 2026 branch catalog: ${tgOptions.length - 1} real branches`);
console.log('[branch-selector] Searchable selectors + branch persistence + student-name fallback applied.');
