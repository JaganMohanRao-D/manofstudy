const fs = require('node:fs');
const path = require('node:path');

const explorerPath = path.join(process.cwd(), 'src/components/ap-allotment/APAllotmentExplorer.tsx');
const tablePath = path.join(process.cwd(), 'src/components/ap-allotment/APAllotmentTable.tsx');

let explorer = fs.readFileSync(explorerPath, 'utf8');
let table = fs.readFileSync(tablePath, 'utf8');

// The standalone 10-name preview was only a duplicate presentation of the
// detailed allotment table. Remove it at build time so every production build
// has one authoritative student-data view.
const duplicateSectionPattern = /\n\s*<section id="ap-neutral-student-names"[\s\S]*?<\/section>\s*/;
if (duplicateSectionPattern.test(explorer)) {
  explorer = explorer.replace(duplicateSectionPattern, '\n');
  console.log('[student-names] removed duplicate standalone student-name section');
} else {
  console.log('[student-names] duplicate standalone student-name section already absent');
}

// Remove state/derived code that existed only for the retired preview.
explorer = explorer.replace(/\n\s*const \[studentNamePage, setStudentNamePage\] = useState\(1\);\n/, '\n');
explorer = explorer.replace(/\n\s*const studentNamePageSize = 10;\n\s*const studentNamePageCount = Math\.max\(1, Math\.ceil\(visibleRecords\.length \/ studentNamePageSize\)\);\n\s*const studentNamePageRecords = useMemo\(\(\) => \{[\s\S]*?\n\s*\}, \[visibleRecords, studentNamePage, studentNamePageCount\]\);\n/, '\n');
explorer = explorer.replace(/\n\s*useEffect\(\(\) => \{\n\s*setStudentNamePage\(1\);\n\s*\}, \[visibleRecords, selectedCollegeCode, selectedBranchCode\]\);/, '');

// Add a stable serial-number column to the detailed student table. The serial
// is the position within the current filtered/sorted result set, so pagination
// continues naturally (1-25, 26-50, ...), independent of admission rank.
if (!table.includes('aria-label="Serial number"')) {
  const desktopHeader = '<th className="py-3 px-4 w-28">Rank</th>';
  if (!table.includes(desktopHeader)) {
    throw new Error('[student-names] desktop Rank header marker not found; refusing to modify APAllotmentTable.tsx.');
  }
  table = table.replace(
    desktopHeader,
    '<th className="py-3 px-4 w-16 text-center" aria-label="Serial number">S.No.</th>\n                  ' + desktopHeader
  );

  const desktopRowMarker = '                  <tr\n                    key={`${r.rank}-${r.cand_name}-${idx}`}';
  if (!table.includes(desktopRowMarker)) {
    throw new Error('[student-names] desktop student row marker not found; refusing to modify APAllotmentTable.tsx.');
  }
  table = table.replace(
    desktopRowMarker,
    '                  <tr\n                    key={`${r.rank}-${r.cand_name}-${idx}`}'
  );

  const rankCellMarker = '                    {/* Rank Badge */}\n                    <td className="py-3 px-4 whitespace-nowrap">';
  if (!table.includes(rankCellMarker)) {
    throw new Error('[student-names] desktop Rank cell marker not found; refusing to modify APAllotmentTable.tsx.');
  }
  table = table.replace(
    rankCellMarker,
    '                    {/* Serial Number */}\n                    <td className="py-3 px-4 text-center whitespace-nowrap">\n                      <span className="inline-flex min-w-7 h-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-300">\n                        {(currentPage - 1) * pageSize + idx + 1}\n                      </span>\n                    </td>\n\n                    {/* Rank Badge */}\n                    <td className="py-3 px-4 whitespace-nowrap">'
  );

  table = table.replace(/colSpan=\{7\}/g, 'colSpan={8}');

  // Mobile cards use the same filtered/paginated records. Show the same serial
  // beside the rank without changing the mobile information hierarchy.
  const mobileCardMarker = '              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xs"\n            >';
  if (!table.includes(mobileCardMarker)) {
    throw new Error('[student-names] mobile student card marker not found; refusing to modify APAllotmentTable.tsx.');
  }
  table = table.replace(
    mobileCardMarker,
    mobileCardMarker + '\n              <div className="flex items-center justify-between gap-2">\n                <span className="inline-flex min-w-7 h-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-300" aria-label={`Serial number ${(currentPage - 1) * pageSize + idx + 1}`}>\n                  {(currentPage - 1) * pageSize + idx + 1}\n                </span>\n                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Student</span>\n              </div>'
  );

  console.log('[student-names] serial numbers added to desktop and mobile student views');
} else {
  console.log('[student-names] serial numbers already present');
}

fs.writeFileSync(explorerPath, explorer, 'utf8');
fs.writeFileSync(tablePath, table, 'utf8');
console.log('[student-names] AP student-list cleanup complete');
