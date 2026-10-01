const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

const file = (relativePath) => path.resolve(root, relativePath);
const read = (relativePath) => fs.readFileSync(file(relativePath), 'utf8');
const write = (relativePath, content) => fs.writeFileSync(file(relativePath), content, 'utf8');

function replaceIfPresent(relativePath, pattern, replacement, label) {
  const current = read(relativePath);
  if (!pattern.test(current)) return false;
  const next = current.replace(pattern, replacement);
  write(relativePath, next);
  console.log(`[MOS] Removed retired radar reference: ${label}`);
  return true;
}

function removeFileIfPresent(relativePath) {
  const target = file(relativePath);
  if (fs.existsSync(target)) {
    fs.rmSync(target);
    console.log(`[MOS] Removed retired radar file: ${relativePath}`);
  }
}

// ---------------------------------------------------------------------------
// Existing navigation hardening: Mock Test Series is public; individual
// protected exam engines still require authentication.
// ---------------------------------------------------------------------------
const appPath = 'src/App.tsx';
replaceIfPresent(
  appPath,
  /const requiresMockAuth = ws === 'mock-tests' \|\| ws === 'cbt-mock-test' \|\| ws === 'eapcet-cbt';/,
  "const requiresMockAuth = ws === 'cbt-mock-test' || ws === 'eapcet-cbt';",
  'mock-test auth gate'
);
replaceIfPresent(
  appPath,
  /        if \(user\) \{\n          setActiveWorkspace\('mock-tests'\);\n        \} else \{\n          setPendingProtectedWorkspace\(\{ workspace: 'mock-tests' \}\);\n          openAuthModal\(\{ type: 'mock-test' \}\);\n        \}/,
  "        setActiveWorkspace('mock-tests');",
  'public mock-test-series landing'
);

// ---------------------------------------------------------------------------
// Retire AP EAPCET Phase 2 Vacancy Radar from the application at build time.
// Keeping this transformation in the existing prebuild hook makes the change
// deterministic for Cloudflare Pages, local dev, and future deployments.
// Every operation is idempotent so repeated builds remain safe.
// ---------------------------------------------------------------------------

// App.tsx: imports, metadata, state, hash routing, handlers and renderer.
replaceIfPresent(
  appPath,
  /import type \{ EapcetPhaseTab \} from '\.\/components\/ApEapcetRadar';\n/,
  '',
  'App radar type import'
);
replaceIfPresent(
  appPath,
  /const ApEapcetRadar = lazyWithRetry\(\(\) =>[\s\S]*?\n\);\n(?=const ApCollegePredictor)/,
  '',
  'App radar lazy import'
);
replaceIfPresent(
  appPath,
  /\n  \{\n    id: 'eapcet-radar',[\s\S]*?\n  \},\n(?=  \{\n    id: 'ap-predictor')/,
  '\n',
  'App radar tool metadata'
);
replaceIfPresent(
  appPath,
  /  const \[eapcetPhase, setEapcetPhase\] = useState<EapcetPhaseTab>\('phase2'\);\n/,
  '',
  'App radar phase state'
);
replaceIfPresent(
  appPath,
  /      \} else if \(\n        hash === 'eapcet-radar' \|\|\n        hash === 'eapcet' \|\|\n        hash === 'phase1' \|\|\n        hash === 'phase2' \|\|\n        hash === 'radar' \|\|\n        hash === 'vacancy' \|\|\n        hash === 'predictor'\n      \) \{\n        setActiveWorkspace\('eapcet'\);\n        setEapcetPhase\('phase2'\);\n      \} else if \(hash\.startsWith\('roadmap'\)/,
  "      } else if (hash.startsWith('roadmap')",
  'App radar hash aliases'
);
replaceIfPresent(
  appPath,
  /\n  const handleSelectEapcetPhase = \(\) => \{[\s\S]*?\n  \};\n/,
  '\n',
  'App radar phase handler'
);
replaceIfPresent(
  appPath,
  /    \} else if \(tab === 'eapcet-radar'\) \{\n      handleSelectWorkspace\('eapcet'\);\n/,
  '',
  'App command palette radar branch'
);
replaceIfPresent(
  appPath,
  /      case 'eapcet':\n        return \{[\s\S]*?        \};\n(?=      case 'ap-allotments':)/,
  '',
  'App radar workspace details'
);
replaceIfPresent(
  appPath,
  /\n                \{activeWorkspace === 'eapcet' && \([\s\S]*?\n                \)\}\n/,
  '\n',
  'App radar workspace renderer'
);
replaceIfPresent(
  appPath,
  /                      if \(tab === 'eapcet-radar'\) handleSelectWorkspace\('eapcet'\);\n                      else if \(tab === 'roadmaps'\)/,
  "                      if (tab === 'roadmaps')",
  'App FAQ radar navigation'
);
replaceIfPresent(
  appPath,
  /          onSelectEapcetPhase=\{handleSelectEapcetPhase\}\n/,
  '',
  'App Header radar callback'
);

// Header navigation and prop.
replaceIfPresent(
  'src/components/Header.tsx',
  /  onSelectEapcetPhase\?: \(phase: string\) => void;\n/,
  '',
  'Header radar prop'
);
replaceIfPresent(
  'src/components/Header.tsx',
  /  \{ label: 'AP EAPCET Vacancy Radar', workspace: 'eapcet-radar', icon: Search \},\n/,
  '',
  'Header radar menu item'
);

// Command palette.
replaceIfPresent(
  'src/components/CommandPalette.tsx',
  /      \{\n        id: 'tool-eapcet-radar',[\s\S]*?\n      \},\n(?=      \{)/,
  '',
  'Command palette radar item'
);

// Legacy feature catalog imported by the hero section.
replaceIfPresent(
  'src/components/FeaturesHub.jsx',
  /  \{\n    id: 'ws-eapcet',\n    workspace: 'eapcet',[\s\S]*?\n  \},\n(?=  \{\n    id: 'ws-attendance')/,
  '',
  'FeaturesHub radar card'
);

// Guides: preserve the chapters, but point old radar shortcuts to existing AP tools.
replaceIfPresent(
  'src/components/GuidesHub.tsx',
  /return \{ ws: 'eapcet', label: 'Launch EAPCET Phase-2 Seat Radar' \};/,
  "return { ws: 'ap-allotments', label: 'Explore AP Allotments' };",
  'Guides chapter 1 radar shortcut'
);
replaceIfPresent(
  'src/components/GuidesHub.tsx',
  /return \{ ws: 'eapcet', label: 'Launch EAPCET & Cutoff Rank Simulator' \};/,
  "return { ws: 'ap-predictor', label: 'Open AP College Predictor' };",
  'Guides chapter 9 radar shortcut'
);

// Legacy side drawer shortcut.
replaceIfPresent(
  'src/components/SlideOverDrawer.jsx',
  /\n              <button\n                type="button"\n                id="drawer-counseling-eapcet-btn"[\s\S]*?\n              <\/button>/,
  '\n',
  'SlideOverDrawer radar button'
);

// UX clean-route map.
replaceIfPresent(
  'src/components/SiteUxFixes.tsx',
  /  'ws-eapcet': '\/ap-eapcet\/phase-2-vacancy-radar',\n/,
  '',
  'SiteUxFixes radar route'
);

// Clean-route bridge.
replaceIfPresent(
  'public/route-bridge.js',
  /    'eapcet': '\/ap-eapcet\/phase-2-vacancy-radar',\n/,
  '',
  'route bridge radar route'
);
replaceIfPresent(
  'public/route-bridge.js',
  /      'eapcet-radar': 'eapcet',\n      'eapcet': 'eapcet',\n      'phase1': 'eapcet',\n      'phase2': 'eapcet',\n      'radar': 'eapcet',\n      'vacancy': 'eapcet',\n      'predictor': 'eapcet',\n/,
  '',
  'route bridge radar aliases'
);

// Type identifiers that existed only for the retired workspace/tool.
replaceIfPresent('src/types.ts', /  \| 'eapcet'\n/, '', 'WorkspaceView radar identifier');
replaceIfPresent('src/types.ts', /  \| 'eapcet-radar'\n/, '', 'ToolTab radar identifier');

// Remove the radar from structured SEO metadata.
replaceIfPresent(
  'index.html',
  /            \{\n              "@type": "WebPage",\n              "@id": "https:\/\/manofstudy\.pages\.dev\/#eapcet-radar",\n              "name": "EAPCET Seat Vacancy Radar",\n              "description": "Real-time vacancy matrix, college cutoff comparison, and fee reimbursement clarity\."\n            \},\n/,
  '',
  'index radar schema'
);

// Remove the dedicated FAQ entry if it exists, without touching other EAPCET FAQs.
replaceIfPresent(
  'src/components/EducationalGuideAndSeo.tsx',
  /    \{\n      category: 'Counselling Tools',\n      question: 'How does the AP EAPCET Phase 2 Vacancy Radar track leftover seats\?',[\s\S]*?\n    \},\n/,
  '',
  'EducationalGuide radar FAQ'
);

// Finally remove the retired implementation and its dedicated vacancy dataset
// from the build workspace. They are not imported after the App patch above.
removeFileIfPresent('src/components/ApEapcetRadar.tsx');
removeFileIfPresent('src/eapcet_vacancies.json');

console.log('[MOS] Navigation/build patch complete. AP EAPCET Phase 2 Vacancy Radar is retired and absent from the deployed build.');
