const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(process.cwd(), 'scripts', 'patchAllotmentUx.cjs');
const source = fs.readFileSync(filePath, 'utf8');

// patchAllotmentUx.cjs contains TypeScript/JSX source inside JavaScript
// template literals. Keep nested template literals out of that build-time
// patcher so Node 22 can parse the prebuild script on Cloudflare.
const invalid = "if (numericSc) return `SC_${['I', 'II', 'III'][Number(numericSc[1]) - 1]}`;";
const valid = "if (numericSc) return 'SC_' + ['I', 'II', 'III'][Number(numericSc[1]) - 1];";

if (source.includes(invalid)) {
  fs.writeFileSync(filePath, source.replaceAll(invalid, valid), 'utf8');
  console.log('[allotment-ux-syntax] fixed nested template literal in patchAllotmentUx.cjs');
} else {
  console.log('[allotment-ux-syntax] no invalid nested template literal found; patcher is already safe');
}
