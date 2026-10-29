const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(process.cwd(), 'src', 'components', 'ap-allotment', 'APAllotmentExplorer.tsx');
const source = fs.readFileSync(filePath, 'utf8');

// finalizeApAllotmentUx moves the canonical category table after the student
// table. The table is wrapped by a selection condition; when the section is
// moved, only the empty condition can remain at the original location.
// Remove that empty wrapper without touching populated analytics blocks.
const emptyWrapper = /\n\s*\{selectedCollegeCode !== 'ALL' && selectedBranchCode !== 'ALL' && \(\s*\n\s*\)\}\n/;
const next = source.replace(emptyWrapper, '\n');

if (next !== source) {
  fs.writeFileSync(filePath, next, 'utf8');
  console.log('[final-ap-ux] removed empty AP analytics condition wrapper');
} else {
  console.log('[final-ap-ux] no empty AP analytics wrapper found');
}
