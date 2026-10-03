const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(process.cwd(), 'src/components/ap-allotment/APAllotmentExplorer.tsx');
let source = fs.readFileSync(filePath, 'utf8');

// This patch intentionally runs late in prebuild, after the older AP UX patches.
// Do not depend on a brittle exact JSX heading: earlier patches may rename that
// heading before this script executes. Everything below is idempotent.

// The name pagination uses useEffect for a clean reset whenever the selected
// college/branch/filter result set changes.
if (!source.includes('const [studentNamePage, setStudentNamePage] = useState(1);')) {
  const stateMarker = "  const [filters, setFilters] = useState({\n";
  const stateIndex = source.indexOf(stateMarker);
  if (stateIndex < 0) throw new Error('[student-names] filters state marker not found; refusing to modify APAllotmentExplorer.tsx.');
  source = source.slice(0, stateIndex) + "  const [studentNamePage, setStudentNamePage] = useState(1);\n" + source.slice(stateIndex);
}

// Add the pagination icons without adding a dependency.
if (!source.includes('ChevronLeft') || !source.includes('ChevronRight')) {
  const importStart = "import { Users, Search, Award, BookOpen, SlidersHorizontal, AlertCircle, GraduationCap, Sparkles, Loader2, Database, ChevronRight, TrendingUp, BarChart3, Target, Building2, Flame } from 'lucide-react';";
  if (source.includes(importStart)) {
    source = source.replace(
      importStart,
      "import { Users, Search, Award, BookOpen, SlidersHorizontal, AlertCircle, GraduationCap, Sparkles, Loader2, Database, ChevronLeft, ChevronRight, TrendingUp, BarChart3, Target, Building2, Flame } from 'lucide-react';"
    );
  } else {
    throw new Error('[student-names] lucide import marker not found; refusing to modify APAllotmentExplorer.tsx.');
  }
}

if (!source.includes('const studentNamePageRecords = useMemo(() => {')) {
  const derivedMarker = "  const currentCollege = selectedCollegeCode !== 'ALL' ? collegeData : null;\n";
  const derivedIndex = source.indexOf(derivedMarker);
  if (derivedIndex < 0) throw new Error('[student-names] derived state marker not found; refusing to modify APAllotmentExplorer.tsx.');

  const derived = `  const studentNamePageSize = 10;\n  const studentNamePageCount = Math.max(1, Math.ceil(visibleRecords.length / studentNamePageSize));\n  const studentNamePageRecords = useMemo(() => {\n    const safePage = Math.min(studentNamePage, studentNamePageCount);\n    const start = (safePage - 1) * studentNamePageSize;\n    return visibleRecords.slice(start, start + studentNamePageSize);\n  }, [visibleRecords, studentNamePage, studentNamePageCount]);\n\n`;
  source = source.slice(0, derivedIndex) + derived + source.slice(derivedIndex);
}

if (!source.includes('setStudentNamePage(1);\n  }, [visibleRecords, selectedCollegeCode, selectedBranchCode]')) {
  const effectMarker = "  const studentNamePageRecords = useMemo(() => {";
  const effectIndex = source.indexOf(effectMarker);
  if (effectIndex < 0) throw new Error('[student-names] pagination calculation marker not found; refusing to modify APAllotmentExplorer.tsx.');

  const effectEnd = source.indexOf('\n\n  const currentCollege', effectIndex);
  if (effectEnd < 0) throw new Error('[student-names] pagination insertion boundary not found; refusing to modify APAllotmentExplorer.tsx.');

  const effect = `\n\n  useEffect(() => {\n    setStudentNamePage(1);\n  }, [visibleRecords, selectedCollegeCode, selectedBranchCode]);`;
  source = source.slice(0, effectEnd) + effect + source.slice(effectEnd);
}

if (!source.includes('id="ap-neutral-student-names"')) {
  const tableTag = '<APAllotmentTable ';
  const tableIndex = source.indexOf(tableTag);
  if (tableIndex < 0) throw new Error('[student-names] AP allotment table marker not found; refusing to modify APAllotmentExplorer.tsx.');

  // Insert the neutral name list inside the existing student-table section,
  // immediately before the detailed allotment table. This keeps the existing
  // architecture and preserves the full table and analytics below it.
  const sectionStart = source.lastIndexOf('                    <section', tableIndex);
  if (sectionStart < 0) throw new Error('[student-names] student table section boundary not found; refusing to modify APAllotmentExplorer.tsx.');

  const namesBlock = `                    <section id="ap-neutral-student-names" className="mb-4 rounded-3xl border border-cyan-200/70 dark:border-cyan-900/50 bg-cyan-50/60 dark:bg-slate-950/50 p-4 sm:p-5 shadow-sm">\n                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">\n                        <div>\n                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">Student names</p>\n                          <h3 className="mt-1 text-base sm:text-lg font-black text-slate-950 dark:text-white">All allotted student names</h3>\n                          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Showing every student in the current college, branch and active filters, 10 names at a time. Use the pages below to browse the complete list.</p>\n                        </div>\n                        <span className="shrink-0 self-start sm:self-auto rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300">Page {Math.min(studentNamePage, studentNamePageCount)} of {studentNamePageCount}</span>\n                      </div>\n\n                      {studentNamePageRecords.length > 0 ? (\n                        <>\n                          <div className="mt-4 grid grid-cols-1 gap-2.5">\n                            {studentNamePageRecords.map((record, index) => (\n                              <div key={\`neutral-name-\${record.rank}-\${record.cand_name}-\${index}\`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 px-3.5 py-3">\n                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-black text-cyan-700 dark:text-cyan-300">{((Math.min(studentNamePage, studentNamePageCount) - 1) * studentNamePageSize) + index + 1}</span>\n                                <span className="min-w-0 truncate text-sm font-bold text-slate-900 dark:text-white" title={record.cand_name}>{record.cand_name || 'Name unavailable'}</span>\n                              </div>\n                            ))}\n                          </div>\n\n                          <div className="mt-4 flex items-center justify-between gap-3">\n                            <button type="button" onClick={() => setStudentNamePage((page) => Math.max(1, page - 1))} disabled={studentNamePage <= 1} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">\n                              <ChevronLeft className="h-4 w-4" /> Previous\n                            </button>\n                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{studentNamePageRecords.length} names shown</span>\n                            <button type="button" onClick={() => setStudentNamePage((page) => Math.min(studentNamePageCount, page + 1))} disabled={studentNamePage >= studentNamePageCount} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">\n                              Next <ChevronRight className="h-4 w-4" />\n                            </button>\n                          </div>\n                        </>\n                      ) : (\n                        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500 dark:text-slate-400">No student names are available for the current college, branch and filters.</div>\n                      )}\n\n                      <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-3.5 sm:p-4" aria-label="Gender distribution">\n                        <div className="flex items-center justify-between gap-3">\n                          <div>\n                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Gender distribution</p>\n                            <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">Current filtered allotments</p>\n                          </div>\n                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{genderMix.total.toLocaleString()} records</span>\n                        </div>\n                        <div className="mt-3 space-y-2.5">\n                          <div>\n                            <div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-800 dark:text-slate-200">Boys</span><span className="font-black text-cyan-700 dark:text-cyan-300">{genderMix.boysPct}% · {genderMix.boys.toLocaleString()}</span></div>\n                            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-cyan-500 transition-all duration-700 ease-out" style={{ width: genderMix.boysPct + '%' }} /></div>\n                          </div>\n                          <div>\n                            <div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-800 dark:text-slate-200">Girls</span><span className="font-black text-pink-600 dark:text-pink-300">{genderMix.girlsPct}% · {genderMix.girls.toLocaleString()}</span></div>\n                            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-pink-500 transition-all duration-700 ease-out" style={{ width: genderMix.girlsPct + '%' }} /></div>\n                          </div>\n                        </div>\n                      </div>\n                    </section>\n\n`;

  source = source.slice(0, sectionStart) + namesBlock + source.slice(sectionStart);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('[student-names] neutral 10-per-page name listing + gender ratio ensured');
