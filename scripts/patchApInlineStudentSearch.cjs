const fs = require('node:fs');
const path = require('node:path');

const file = path.join(process.cwd(), 'src/components/ap-allotment/APAllotmentExplorer.tsx');
let source = fs.readFileSync(file, 'utf8');

if (!source.includes("import APInlineStudentSearch from './APInlineStudentSearch';")) {
  source = source.replace(
    "import APStudentSearch from './APStudentSearch';",
    "import APStudentSearch from './APStudentSearch';\nimport APInlineStudentSearch from './APInlineStudentSearch';"
  );
}

const marker = `            </section>\n\n            <nav className="flex justify-center">`;
const inline = `            </section>\n\n            <APInlineStudentSearch\n              year={selectedYear}\n              collegeCode={selectedCollegeCode}\n              branchCode={selectedBranchCode}\n              phase={selectedPhase}\n            />\n\n            <nav className="flex justify-center">`;

if (source.includes('            <APInlineStudentSearch')) {
  console.log('[ap-inline-search] inline student search already mounted.');
} else if (!source.includes(marker)) {
  throw new Error('[ap-inline-search] Could not find the AP controls section boundary; refusing to patch.');
} else {
  source = source.replace(marker, inline);
  console.log('[ap-inline-search] mounted student name/rank search directly below college + branch controls.');
}

fs.writeFileSync(file, source, 'utf8');
