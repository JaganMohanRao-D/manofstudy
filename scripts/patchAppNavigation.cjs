const fs = require('node:fs');
const path = require('node:path');

const appPath = path.resolve(process.cwd(), 'src/App.tsx');
let source = fs.readFileSync(appPath, 'utf8');

const replacements = [
  {
    from: "const requiresMockAuth = ws === 'mock-tests' || ws === 'cbt-mock-test' || ws === 'eapcet-cbt';",
    to: "const requiresMockAuth = ws === 'cbt-mock-test' || ws === 'eapcet-cbt';",
  },
  {
    from: `        if (user) {\n          setActiveWorkspace('mock-tests');\n        } else {\n          setPendingProtectedWorkspace({ workspace: 'mock-tests' });\n          openAuthModal({ type: 'mock-test' });\n        }`,
    to: `        setActiveWorkspace('mock-tests');`,
  },
];

for (const { from, to } of replacements) {
  if (!source.includes(from)) {
    // The patch is intentionally idempotent: an already-patched source is valid.
    if (source.includes(to)) continue;
    throw new Error(`Navigation patch target not found in ${appPath}`);
  }
  source = source.replace(from, to);
}

fs.writeFileSync(appPath, source, 'utf8');
console.log('[MOS] App navigation patch applied safely. Mock Test Series is public; individual test engines remain protected.');
