const fs = require('node:fs');
const path = require('node:path');

const file = path.join(process.cwd(), 'src/components/ap-allotment/APAllotmentExplorer.tsx');
let source = fs.readFileSync(file, 'utf8');

const importLine = "import APGlobalStudentSearch from './APGlobalStudentSearch';";
if (!source.includes(importLine)) {
  const anchor = "import APBranchSelector, { BranchOption } from './APBranchSelector';";
  if (!source.includes(anchor)) {
    throw new Error('[ap-global-search] Could not find APBranchSelector import; refusing to patch.');
  }
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

if (source.includes('<APGlobalStudentSearch year={selectedYear} phase={selectedPhase} />')) {
  console.log('[ap-global-search] Global student search already mounted.');
} else {
  const marker = `              </div>\n              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">`;
  if (!source.includes(marker)) {
    throw new Error('[ap-global-search] Could not find the AP selector metadata boundary; refusing to patch.');
  }
  source = source.replace(
    marker,
    `              </div>\n              <APGlobalStudentSearch year={selectedYear} phase={selectedPhase} />\n              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">`
  );
  console.log('[ap-global-search] Mounted global student name/rank search directly below branch selector.');
}

fs.writeFileSync(file, source, 'utf8');
