const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const cssPath = path.join(root, 'public', 'regional-light-integration.css');
const css = fs.readFileSync(cssPath, 'utf8');

const marker = '/* AP/TG header parity fix v2 */';
if (css.includes(marker)) {
  console.log('[regional-header] already patched');
  process.exit(0);
}

const patch = `\n\n${marker}\n/* Header.tsx is the single source of truth. SiteUxFixes may still carry the legacy\n   compact-nav injector, so hide that retired duplicate rather than creating a\n   second navigation system. */\n#mos-compact-header-nav { display:none !important; }\n\n/* AP/TG use the real React Header dropdowns. Convert those dropdown surfaces to\n   the same light palette and keep every menu label readable. */\nbody.mos-regional-light #main-header nav[aria-label="Primary navigation"] > div > div.absolute {\n  background:#fff !important;\n  border-color:#d7dee8 !important;\n  box-shadow:0 18px 42px rgba(15,23,42,.12) !important;\n  color:#172033 !important;\n}\nbody.mos-regional-light #main-header nav[aria-label="Primary navigation"] > div > div.absolute button {\n  color:#334155 !important;\n}\nbody.mos-regional-light #main-header nav[aria-label="Primary navigation"] > div > div.absolute button:hover {\n  color:#0e7490 !important;\n  background:#f0f9ff !important;\n}\nbody.mos-regional-light #main-header nav[aria-label="Primary navigation"] > div > div.absolute span {\n  color:inherit !important;\n}\n\n/* Mobile AP/TG navigation must use the same readable light surface. */\nbody.mos-regional-light #main-header > div + div {\n  background:#fff !important;\n  color:#172033 !important;\n  border-top-color:#e2e8f0 !important;\n}\nbody.mos-regional-light #main-header > div + div button {\n  color:#334155 !important;\n}\nbody.mos-regional-light #main-header > div + div button:hover {\n  color:#0e7490 !important;\n  background:#f0f9ff !important;\n}\n`;

fs.writeFileSync(cssPath, `${css.trimEnd()}${patch}`, 'utf8');
console.log('[regional-header] patched AP/TG header and dropdown styling');
