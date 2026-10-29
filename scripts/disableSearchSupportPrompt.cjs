const fs = require('fs');
const path = require('path');

const appPath = path.join(path.resolve(__dirname, '..'), 'src', 'App.tsx');
const source = fs.readFileSync(appPath, 'utf8');

const pattern = /\n  \/\/ Show one respectful support prompt only after a real search result is produced\.\n  useEffect\(\(\) => \{[\s\S]*?window\.removeEventListener\('mos:tool-result-ready', handleToolResultReady\);\n    \};\n  \}, \[user, openAuthModal\]\);\n/;

const next = source.replace(pattern, '\n');
if (next !== source) {
  fs.writeFileSync(appPath, next, 'utf8');
  console.log('[MOS] Disabled automatic support popup after tool/name searches; manual support access remains available.');
} else {
  console.log('[MOS] Automatic search support popup already disabled.');
}
