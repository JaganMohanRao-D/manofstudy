const fs = require('node:fs');
const path = require('node:path');

const file = path.join(process.cwd(), 'src/components/ap-allotment/APAllotmentExplorer.tsx');
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

const analyticsCode = [
  '',
  '',
  `  ${MARKER}`,
  '  const filteredLocalRecords = useMemo(() => {',
  '    const q = normalizeText(localSearchQuery);',
  '    if (!q) return localRecords;',
  '    return localRecords.filter((record: AllotmentRecord) => {',
  '      const name = normalizeText(record.cand_name);',
  "      const rank = String(record.rank ?? '');",
  '      const hallTicket = normalizeText(record.roll_no);',
  "      const category = normalizeText(record.category);",
  "      const allotted = normalizeText(record.alloted_category);",
  '      return name.includes(q) || rank.includes(q) || hallTicket.includes(q) || category.includes(q) || allotted.includes(q);',
  '    });',
  '  }, [localRecords, localSearchQuery]);',
  '',
  '  const categoryAnalytics = useMemo(() => {',
  '    const map = new Map<string, { category: string; students: number; boys: number; girls: number; bestRank: number; lastRank: number }>();',
  '    filteredLocalRecords.forEach((record: AllotmentRecord) => {',
  "      const category = record.category || 'Unknown';",
  "      const item = map.get(category) || { category, students: 0, boys: 0, girls: 0, bestRank: Number.POSITIVE_INFINITY, lastRank: 0 };",
  '      item.students += 1;',
  "      if (record.gender === 'M') item.boys += 1;",
  "      if (record.gender === 'F') item.girls += 1;",
  '      if (record.rank > 0) { item.bestRank = Math.min(item.bestRank, record.rank); item.lastRank = Math.max(item.lastRank, record.rank); }',
  '      map.set(category, item);',
  '    });',
  '    const total = filteredLocalRecords.length;',
  '    return Array.from(map.values()).sort((a, b) => b.students - a.students || a.category.localeCompare(b.category)).map((item) => {',
  '      const genderKnown = item.boys + item.girls;',
  '      return { ...item, sharePct: total ? (item.students / total) * 100 : 0, boysPct: genderKnown ? (item.boys / genderKnown) * 100 : 0, girlsPct: genderKnown ? (item.girls / genderKnown) * 100 : 0, bestRank: Number.isFinite(item.bestRank) ? item.bestRank : 0 };',
  '    });',
  '  }, [filteredLocalRecords]);',
  '',
].join('\n');

replaceOnce(
  "  const displayRecords = useMemo(() => hasSearched ? results : selectedCollegeCode !== 'ALL' ? localRecords : [] as AllotmentRecord[], [hasSearched, results, selectedCollegeCode, localRecords]);",
  analyticsCode + "\n  const displayRecords = useMemo(() => hasSearched ? results : selectedCollegeCode !== 'ALL' ? filteredLocalRecords : [] as AllotmentRecord[], [hasSearched, results, selectedCollegeCode, filteredLocalRecords]);",
  'displayRecords'
);

const localSearchUi = [
  '',
  '            {selectedCollegeCode !== \'ALL\' && !hasSearched && (',
  '              <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-3 dark:border-sky-500/20 dark:bg-sky-500/5">',
  '                <div className="mb-2 flex items-center justify-between gap-2">',
  '                  <div>',
  '                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Search in selected college</p>',
  '                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Search only within this college and selected branch.</p>',
  '                  </div>',
  '                  {localSearchQuery && <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300">@@LOCAL_COUNT@@ matches</span>}',
  '                </div>',
  '                <div className="relative">',
  '                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />',
  '                  <input value={localSearchQuery} onChange={(event) => { setLocalSearchQuery(event.target.value); setCurrentPage(1); }} placeholder="Search student name, rank or hall ticket in this college..." className="w-full rounded-xl border border-sky-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />',
  '                  {localSearchQuery && <button type="button" onClick={() => { setLocalSearchQuery(\'\'); setCurrentPage(1); }} className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Clear college search">×</button>}',
  '                </div>',
  '              </div>',
  '            )}',
  '',
].join('\n').replace('@@LOCAL_COUNT@@', '${filteredLocalRecords.length.toLocaleString()}');

replaceOnce(
  "            <div className=\"mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400\">",
  localSearchUi + "            <div className=\"mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400\">",
  'dataset metadata row'
);

const analyticsUi = [
  '',
  '            {selectedCollegeCode !== \'ALL\' && !hasSearched && (',
  '              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-5">',
  '                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">',
  '                  <div>',
  '                    <h3 className="text-sm font-black text-slate-900 dark:text-white">College &amp; Branch Allotment Insights</h3>',
  '                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Category-wise allotments, gender split and observed ranks for the selected college/branch.</p>',
  '                  </div>',
  '                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-300">@@CURRENT_COUNT@@ students in current view</span>',
  '                </div>',
  '                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">',
  '                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-[10px] text-slate-500 dark:text-slate-400">Total Students</div><div className="mt-1 text-lg font-black text-slate-900 dark:text-white">@@TOTAL@@</div></div>',
  '                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/20 dark:bg-sky-500/5"><div className="text-[10px] text-sky-700 dark:text-sky-300">Boys</div><div className="mt-1 text-lg font-black text-sky-700 dark:text-sky-300">@@BOYS@@</div></div>',
  '                  <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 dark:border-pink-500/20 dark:bg-pink-500/5"><div className="text-[10px] text-pink-700 dark:text-pink-300">Girls</div><div className="mt-1 text-lg font-black text-pink-700 dark:text-pink-300">@@GIRLS@@</div></div>',
  '                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/5"><div className="text-[10px] text-indigo-700 dark:text-indigo-300">Categories</div><div className="mt-1 text-lg font-black text-indigo-700 dark:text-indigo-300">@@CATEGORIES@@</div></div>',
  '                </div>',
  '                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">',
  '                  <table className="w-full min-w-[850px] text-left text-xs">',
  '                    <thead className="bg-slate-50 dark:bg-slate-950/70"><tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">',
  '                      <th className="px-3 py-2.5">Category</th><th className="px-3 py-2.5">Students</th><th className="px-3 py-2.5">Share</th><th className="px-3 py-2.5">Boys</th><th className="px-3 py-2.5">Boys %</th><th className="px-3 py-2.5">Girls</th><th className="px-3 py-2.5">Girls %</th><th className="px-3 py-2.5">Best Rank</th><th className="px-3 py-2.5">Last Rank</th>',
  '                    </tr></thead>',
  '                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">',
  '                      {categoryAnalytics.map((row) => (',
  '                        <tr key={row.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">',
  '                          <td className="px-3 py-2.5 font-black text-slate-900 dark:text-white">{row.category}</td><td className="px-3 py-2.5 font-bold">{row.students.toLocaleString()}</td><td className="px-3 py-2.5 font-semibold text-indigo-600 dark:text-indigo-300">{row.sharePct.toFixed(1)}%</td><td className="px-3 py-2.5 font-semibold text-sky-700 dark:text-sky-300">{row.boys.toLocaleString()}</td><td className="px-3 py-2.5">{row.boysPct.toFixed(1)}%</td><td className="px-3 py-2.5 font-semibold text-pink-700 dark:text-pink-300">{row.girls.toLocaleString()}</td><td className="px-3 py-2.5">{row.girlsPct.toFixed(1)}%</td><td className="px-3 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-300">@@BEST@@</td><td className="px-3 py-2.5 font-mono font-bold text-rose-600 dark:text-rose-300">@@LAST@@</td>',
  '                        </tr>',
  '                      ))}',
  '                    </tbody>',
  '                  </table>',
  '                </div>',
  '              </section>',
  '            )}',
  '',
].join('\n')
  .replaceAll('@@CURRENT_COUNT@@', '${filteredLocalRecords.length.toLocaleString()}')
  .replaceAll('@@TOTAL@@', '${filteredLocalRecords.length.toLocaleString()}')
  .replaceAll('@@BOYS@@', "${filteredLocalRecords.filter((r) => r.gender === 'M').length.toLocaleString()}")
  .replaceAll('@@GIRLS@@', "${filteredLocalRecords.filter((r) => r.gender === 'F').length.toLocaleString()}")
  .replaceAll('@@CATEGORIES@@', '${categoryAnalytics.length}')
  .replaceAll('@@BEST@@', "{row.bestRank > 0 ? `#${row.bestRank.toLocaleString()}` : '—'}")
  .replaceAll('@@LAST@@', "{row.lastRank > 0 ? `#${row.lastRank.toLocaleString()}` : '—'}");

replaceOnce(
  "            <div className=\"flex justify-center\"><div className=\"inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900\">",
  analyticsUi + "            <div className=\"flex justify-center\"><div className=\"inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900\">",
  'explorer mode tabs'
);

fs.writeFileSync(file, source, 'utf8');
console.log('[ap-local-search] Added selected-college/branch search and restored category/gender analytics table.');
