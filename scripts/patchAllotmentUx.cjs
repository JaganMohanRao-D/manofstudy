const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function patchFile(relativePath, transform, label) {
  const filePath = path.join(root, relativePath);
  const before = fs.readFileSync(filePath, 'utf8');
  const after = transform(before);
  if (after === before) {
    console.log(`[allotment-ux] ${label}: already patched`);
    return;
  }
  fs.writeFileSync(filePath, after, 'utf8');
  console.log(`[allotment-ux] ${label}: patched`);
}

// AP and TG use different explorers, but the AP explorer previously pushed its
// category-level rank information much farther down the page. Add a compact,
// mobile-first summary immediately after the college + branch selectors.
patchFile(
  'src/components/ap-allotment/APAllotmentExplorer.tsx',
  (source) => {
    if (source.includes('id="ap-category-cutoff-summary"')) return source;

    const marker = /(?<selector>\s+<APBranchSelector[\s\S]*?totalCollegeRecords=\{collegeData\?\.recordCount \?\? 0\}\n\s+\/>\n\s+<\/div>\n)(?<next>\s+<div className="mt-3 flex flex-wrap items-center gap-2 text-\[11px\] text-slate-600 dark:text-slate-400">)/;
    const match = source.match(marker);
    if (!match || !match.groups) {
      throw new Error('[allotment-ux] AP branch selector insertion point not found; refusing to modify the file.');
    }

    const block = `

              {selectedCollegeCode !== 'ALL' && selectedBranchCode !== 'ALL' && categoryInsights.length > 0 && (
                <section id="ap-category-cutoff-summary" className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-5 shadow-lg" aria-labelledby="ap-category-cutoff-title">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h2 id="ap-category-cutoff-title" className="text-sm sm:text-base font-black text-white">Category-wise Best &amp; Last Ranks</h2>
                      <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-5">{currentCollege?.college_name || 'Selected college'} · {branchLabel}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500">Lowest observed → highest observed rank</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {categoryInsights.map(([category, insight]) => (
                      <div key={category} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-black text-slate-100" title={category}>{category}</span>
                          <span className="shrink-0 rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">{insight.count}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/15 px-2 py-1.5">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-emerald-400">Best</div>
                            <div className="mt-0.5 text-xs font-black text-white">{insight.min.toLocaleString()}</div>
                          </div>
                          <div className="rounded-lg bg-amber-500/10 border border-amber-500/15 px-2 py-1.5">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-amber-300">Last</div>
                            <div className="mt-0.5 text-xs font-black text-white">{insight.max.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}`;

    return source.replace(marker, `${match.groups.selector}${block}\n${match.groups.next}`);
  },
  'AP category rank summary'
);

// AP: add an exact seat-category breakdown for the selected college + branch.
// This uses the AP allotment field `alloted_category` (for example OC_GEN_AU,
// EWS_GEN_AU, SC_II_GEN_AU) rather than the broader social category field.
patchFile(
  'src/components/ap-allotment/APAllotmentExplorer.tsx',
  (source) => {
    if (source.includes('ap-seat-category-breakdown')) return source;

    const analyticsMarker = /(?<before>\s+const genderMix = useMemo\(\(\) => \{)/;
    const match = source.match(analyticsMarker);
    if (!match || !match.groups) {
      throw new Error('[allotment-ux] AP genderMix insertion point not found; refusing to modify the file.');
    }

    const calculation = `

  const apSeatCategoryBreakdown = useMemo(() => {
    if (selectedCollegeCode === 'ALL' || selectedBranchCode === 'ALL' || !collegeData) return [];

    const records = (collegeData.allRecords || []).filter((record) => {
      if (selectedPhase !== 'ALL' && record.phase !== Number(selectedPhase)) return false;
      return record.branch_code === selectedBranchCode;
    });

    const total = records.length;
    if (!total) return [];

    const map = new Map<string, { count: number; bestRank: number; lastRank: number }>();
    records.forEach((record) => {
      const category = String(record.alloted_category || 'UNSPECIFIED').trim() || 'UNSPECIFIED';
      const rank = Number(record.rank);
      const current = map.get(category) || { count: 0, bestRank: Infinity, lastRank: 0 };
      current.count += 1;
      if (Number.isFinite(rank) && rank > 0) {
        current.bestRank = Math.min(current.bestRank, rank);
        current.lastRank = Math.max(current.lastRank, rank);
      }
      map.set(category, current);
    });

    return Array.from(map.entries())
      .map(([category, item]) => ({
        category,
        count: item.count,
        percentage: (item.count / total) * 100,
        bestRank: Number.isFinite(item.bestRank) ? item.bestRank : 0,
        lastRank: item.lastRank || 0,
      }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
  }, [collegeData, selectedCollegeCode, selectedBranchCode, selectedPhase]);
`;

    return source.replace(analyticsMarker, `${calculation}\n${match.groups.before}  const genderMix = useMemo(() => {`);
  },
  'AP seat-category analytics'
);

// AP: render the exact allotted-seat categories with count, percentage, best rank and last rank.
patchFile(
  'src/components/ap-allotment/APAllotmentExplorer.tsx',
  (source) => {
    if (source.includes('id="ap-seat-category-breakdown"')) return source;

    const marker = /(?<block>\s+\{selectedCollegeCode !== 'ALL' && selectedBranchCode !== 'ALL' && categoryInsights\.length > 0 && \([\s\S]*?\n\s+\s+\)\})/;
    const match = source.match(marker);
    if (!match || !match.groups) {
      throw new Error('[allotment-ux] AP category summary block not found; refusing to modify the file.');
    }

    const seatBlock = `

              {apSeatCategoryBreakdown.length > 0 && (
                <section id="ap-seat-category-breakdown" className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-5 shadow-lg" aria-labelledby="ap-seat-category-title">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h2 id="ap-seat-category-title" className="text-sm sm:text-base font-black text-white">Allotted Seat Category Breakdown</h2>
                      <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-5">Exact AP allotment category codes for {currentCollege?.college_name || selectedCollegeCode} · {branchLabel}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500">Count and share are calculated from the selected branch records</span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {apSeatCategoryBreakdown.map((item) => (
                      <div key={item.category} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] sm:text-xs font-black font-mono text-slate-100" title={item.category}>{item.category}</span>
                          <span className="shrink-0 rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">{item.count}</span>
                        </div>
                        <div className="mt-1 text-[10px] font-mono text-slate-400">{item.percentage.toFixed(1)}% of selected branch allotments</div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/15 px-2 py-1.5">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-emerald-400">Highest Merit</div>
                            <div className="mt-0.5 text-xs font-black text-white">#{item.bestRank ? item.bestRank.toLocaleString() : '—'}</div>
                          </div>
                          <div className="rounded-lg bg-amber-500/10 border border-amber-500/15 px-2 py-1.5">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-amber-300">Lowest Merit</div>
                            <div className="mt-0.5 text-xs font-black text-white">#{item.lastRank ? item.lastRank.toLocaleString() : '—'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}`;

    return source.replace(match.groups.block, `${match.groups.block}${seatBlock}`);
  },
  'AP exact seat-category breakdown'
);

// TG: enrich the existing exact seat-category cards with a percentage of the
// selected branch allotments. TG already groups by `seatCategory`, so preserve
// that existing logic and only add the missing percentage metric.
patchFile(
  'src/components/TgAllotmentExplorer.jsx',
  (source) => {
    if (source.includes('percentage: total > 0 ? ((count / total) * 100) : 0')) return source;

    const old = `    return Object.values(map).sort((a, b) => a.openingRank - b.openingRank);`;
    const replacement = `    const total = currentBundle.records.length;\n    return Object.values(map)\n      .map((item) => ({\n        ...item,\n        percentage: total > 0 ? ((item.count / total) * 100) : 0\n      }))\n      .sort((a, b) => a.openingRank - b.openingRank);`;
    if (!source.includes(old)) {
      throw new Error('[allotment-ux] TG categoryCutoffs return statement not found; refusing to modify the file.');
    }
    return source.replace(old, replacement);
  },
  'TG category percentages'
);

patchFile(
  'src/components/TgAllotmentExplorer.jsx',
  (source) => {
    if (source.includes('{item.percentage.toFixed(1)}% of branch')) return source;

    const old = `                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">\n                                {item.count} {item.count === 1 ? 'seat' : 'seats'}\n                              </span>`;
    const replacement = `                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">\n                                {item.count} {item.count === 1 ? 'seat' : 'seats'}\n                              </span>\n                            </div>\n                            <div className="text-[10px] font-mono text-slate-400 mb-1.5">\n                              {item.percentage.toFixed(1)}% of branch allotments\n                            </div>`;
    if (!source.includes(old)) {
      throw new Error('[allotment-ux] TG category card count markup not found; refusing to modify the file.');
    }
    return source.replace(old, replacement);
  },
  'TG category percentage display'
);
