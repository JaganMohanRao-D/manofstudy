/**
 * Fail the build when old preview domains accidentally reappear in active source.
 * Raw counselling data files are skipped; this check scans code, configuration,
 * editorial assets, and small public text assets instead.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const staleHost = /(?:manofstudy|javisak)\.vercel\.app|manofstudy\.pages\.dev/i;
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.html', '.json', '.xml', '.txt', '.md', '.css']);
const skipDirectories = new Set([
  'node_modules',
  '.git',
  'AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE',
  'AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE',
  'TG_EAPCET_2026_ALLOTMENT',
]);
const roots = ['src', 'functions', 'scripts', 'public'];
const files = ['index.html', 'vite.config.ts', 'firebase.json', 'firestore.rules'];
const failures = [];

function visit(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    if (skipDirectories.has(path.basename(target))) return;
    for (const name of fs.readdirSync(target)) visit(path.join(target, name));
    return;
  }
  if (!extensions.has(path.extname(target).toLowerCase())) return;
  files.push(path.relative(root, target));
}

for (const name of roots) visit(path.join(root, name));

for (const relativePath of new Set(files)) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) continue;
  const lines = fs.readFileSync(absolutePath, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (staleHost.test(line)) failures.push(relativePath + ':' + (index + 1) + ' contains a legacy production link');
  });
}

if (failures.length) {
  console.error('[Production URL verify] FAIL: stale preview-domain links found:');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('[Production URL verify] Passed: no legacy preview-domain links found in active source.');
