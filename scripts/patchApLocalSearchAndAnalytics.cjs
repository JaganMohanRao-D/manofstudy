const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const file = path.join(root, 'src/components/ap-allotment/APAllotmentExplorer.tsx');
let source = fs.readFileSync(file, 'utf8');

const MARKER = '/* AP_LOCAL_SEARCH_ANALYTICS_V1 */';
if (source.includes(MARKER)) {
  console.log('[ap-local-search] Patch already applied; skipping.');
  process.exit(0);
}

function replaceOnce(needle, replacement, label) {
  const index = source.indexOf(needle);
  if (index < 0) throw new Error(`[ap-local-search] Could not locate ${label}`);
  source = source.slice(0, index) + replacement + source.slice(index + needle.length);
}

replaceOnce(
  "  const [query, setQuery] = useState('');\n",
  "  const [query, setQuery] = useState('');\n  const [localSearchQuery, setLocalSearchQuery] = useState('');\n",
  'query state'
);

replaceOnce(
  "  const resetSearch = useCallback(() => { setResults([]); setHasSearched(false); setSearchError(null); setCurrentPage(1); }, []);",
  "  const resetSearch = useCallback(() => { setResults([]); setHasSearched(false); setSearchError(null); setCurrentPage(1); setLocalSearchQuery(''); }, []);",
  'resetSearch'
);

const localAnalyticsCode = `\n\n  ${MARKER}\n  const filteredLocalRecords = useMemo(() => {\n    const q = normalizeText(localSearchQuery);\n    if (!q) return localRecords;\n    return localRecords.filter((record: AllotmentRecord) => {\n      const name = normalizeText(record.cand_name);\n      const rank = String(record.rank ?? '');\n      const hallTicket = normalizeText(record.roll_no);\n      const category = normalizeText(record.category);\n      const allotted = normalizeText(record.alloted_category);\n      return name.includes(q) || rank.includes(q) || hallTicket.includes(q) || category.includes(q) || allotted.includes(q);\n    });\n  }, [localRecords, localSearchQuery]);\n\n  const categoryAnalytics = useMemo(() => {\n    const map = new Map<string, { category: string; students: number; boys: number; girls: number; bestRank: number; lastRank: number }>();\n    filteredLocalRecords.forEach((record: AllotmentRecord) => {\n      const category = record.category || 'Unknown';\n      const item = map.get(category) || { category, students: 0, boys: 0, girls: 0, bestRank: Number.POSITIVE_INFINITY, lastRank: 0 };\n      item.students += 1;\n      if (record.gender === 'M') item.boys += 1;\n      if (record.gender === 'F') item.girls += 1;\n      if (record.rank > 0) {\n        item.bestRank = Math.min(item.bestRank, record.rank);\n        item.lastRank = Math.max(item.lastRank, record.rank);\n      }\n      map.set(category, item);\n    });\n    const total = filteredLocalRecords.length;\n    return Array.from(map.values()).sort((a, b) => b.students - a.students || a.category.localeCompare(b.category)).map((item) => {\n      const genderKnown = item.boys + item.girls;\n      return { ...item, sharePct: total ? (item.students / total) * 100 : 0, boysPct: genderKnown ? (item.boys / genderKnown) * 100 : 0, girlsPct: genderKnown ? (item.girls / genderKnown) * 100 : 0, bestRank: Number.isFinite(item.bestRank) ? item.bestRank : 0 };\n    });\n  }, [filteredLocalRecords]);\n`;

replaceOnce(
  "  const displayRecords = useMemo(() => hasSearched ? results : selectedCollegeCode !== 'ALL' ? localRecords : [] as AllotmentRecord[], [hasSearched, results, selectedCollegeCode, localRecords]);",
  localAnalyticsCode + "\n  const displayRecords = useMemo(() => hasSearched ? results : selectedCollegeCode !== 'ALL' ? filteredLocalRecords : [] as AllotmentRecord[], [hasSearched, results, selectedCollegeCode, filteredLocalRecords]);",
  'displayRecords'
);

const localSearchUi = `\n            {selectedCollegeCode !== 'ALL' && !hasSearched && (\n              <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-3 dark:border-sky-500/20 dark:bg-sky-500/5">\n                <div className="mb-2 flex items-center justify-between gap-2">\n                  <div>\n                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Search in selected college</p>\n                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Search only within this college and selected branch.</p>\n                  </div>\n                  {localSearchQuery && <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300">{filteredLocalRecords.length.toLocaleString()} matches</span>}\n                </div>\n                <div className="relative">\n                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />\n                  <input value={localSearchQuery} onChange={(event) => { setLocalSearchQuery(event.target.value); setCurrentPage(1); }} placeholder="Search student name, rank or hall ticket in this college..." className="w-full rounded-xl border border-sky-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />\n                  {localSearchQuery && <button type="button" onClick={() => { setLocalSearchQuery(''); setCurrentPage(1); }} className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Clear college search">×</button>}\n                </div>\n              </div>\n            )}\n`;

replaceOnce(
  "            <div className=\"mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400\">",
  localSearchUi + "            <div className=\"mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400\">",
  'dataset metadata row'
);

const analyticsUi = `\n            {selectedCollegeCode !== 'ALL' && !hasSearched && (\n              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-5">\n                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">\n                  <div>\n                    <h3 className="text-sm font-black text-slate-900 dark:text-white">College &amp; Branch Allotment Insights</h3>\n                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Category-wise allotments, gender split and observed ranks for the selected college/branch.</p>\n                  </div>\n                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-300">{filteredLocalRecords.length.toLocaleString()} students in current view</span>\n                </div>\n                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">\n                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-[10px] text-slate-500 dark:text-slate-400">Total Students</div><div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{filteredLocalRecords.length.toLocaleString()}</div></div>\n                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/20 dark:bg-sky-500/5"><div className="text-[10px] text-sky-700 dark:text-sky-300">Boys</div><div className="mt-1 text-lg font-black text-sky-700 dark:text-sky-300">{filteredLocalRecords.filter((r) => r.gender === 'M').length.toLocaleString()}</div></div>\n                  <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 dark:border-pink-500/20 dark:bg-pink-500/5"><div className="text-[10px] text-pink-700 dark:text-pink-300">Girls</div><div className="mt-1 text-lg font-black text-pink-700 dark:text-pink-300">{filteredLocalRecords.filter((r) => r.gender === 'F').length.toLocaleString()}</div></div>\n                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/5"><div className="text-[10px] text-indigo-700 dark:text-indigo-300">Categories</div><div className="mt-1 text-lg font-black text-indigo-700 dark:text-indigo-300">{categoryAnalytics.length}</div></div>\n                </div>\n                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">\n                  <table className="w-full min-w-[850px] text-left text-xs">\n                    <thead className="bg-slate-50 dark:bg-slate-950/70">\n                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">\n                        <th className="px-3 py-2.5">Category</th><th className="px-3 py-2.5">Students</th><th className="px-3 py-2.5">Share</th><th className="px-3 py-2.5">Boys</th><th className="px-3 py-2.5">Boys %</th><th className="px-3 py-2.5">Girls</th><th className="px-3 py-2.5">Girls %</th><th className="px-3 py-2.5">Best Rank</th><th className="px-3 py-2.5">Last Rank</th>\n                      </tr>\n                    </thead>\n                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">\n                      {categoryAnalytics.map((row) => (\n                        <tr key={row.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">\n                          <td className="px-3 py-2.5 font-black text-slate-900 dark:text-white">{row.category}</td><td className="px-3 py-2.5 font-bold">{row.students.toLocaleString()}</td><td className="px-3 py-2.5 font-semibold text-indigo-600 dark:text-indigo-300">{row.sharePct.toFixed(1)}%</td><td className="px-3 py-2.5 font-semibold text-sky-700 dark:text-sky-300">{row.boys.toLocaleString()}</td><td className="px-3 py-2.5">{row.boysPct.toFixed(1)}%</td><td className="px-3 py-2.5 font-semibold text-pink-700 dark:text-pink-300">{row.girls.toLocaleString()}</td><td className="px-3 py-2.5">{row.girlsPct.toFixed(1)}%</td><td className="px-3 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-300">{row.bestRank > 0 ? `#${row.bestRank.toLocaleString()}` : '—'}</td><td className="px-3 py-2.5 font-mono font-bold text-rose-600 dark:text-rose-300">{row.lastRank > 0 ? `#${row.lastRank.toLocaleString()}` : '—'}</td>\n                        </tr>\n                      ))}\n                    </tbody>\n                  </table>\n                </div>\n              </section>\n            )}\n`;

replaceOnce(
  "            <div className=\"flex justify-center\"><div className=\"inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900\">",
  analyticsUi + "            <div className=\"flex justify-center\"><div className=\"inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900\">",
  'explorer mode tabs'
);

fs.writeFileSync(file, source, 'utf8');
console.log('[ap-local-search] Added selected-college/branch search and restored category/gender analytics table.');
