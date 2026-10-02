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

// AP/TG category analytics are intentionally kept as small, deterministic
// build-time source patches. Do not inject runtime DOM nodes or use global CSS.
// Every insertion has an explicit source marker and fails closed if the source
// structure changes, preventing a silent malformed production build.

patchFile(
  'src/components/ap-allotment/APAllotmentExplorer.tsx',
  (source) => {
    let next = source;

    // The user-facing breakdown must use the exact allotted-seat code
    // (for example OC_GEN_AU / OC_GIRLS_AU / EWS_GEN_AU / SC_II_GEN_AU),
    // not the broader social-category field.
    if (!next.includes("const key = record.alloted_category || 'Unknown';")) {
      const oldCategoryKey = "const key = record.category || 'Unknown';";
      if (!next.includes(oldCategoryKey)) {
        throw new Error('[allotment-ux] AP category source marker not found; refusing to modify the file.');
      }
      next = next.replace(oldCategoryKey, "const key = record.alloted_category || 'Unknown';");
    }

    // Keep the existing AP summary component, but make it explicitly about
    // exact allotted-seat categories and show the percentage beside each count.
    if (!next.includes('id="ap-category-cutoff-summary"')) {
      const marker = /(?<selector>\s+<APBranchSelector[\s\S]*?totalCollegeRecords=\{collegeData\?\.recordCount \?\? 0\}\n\s+\/>\n\s+<\/div>\n)(?<next>\s+<div className="mt-3 flex flex-wrap items-center gap-2 text-\[11px\] text-slate-600 dark:text-slate-400">)/;
      const match = next.match(marker);
      if (!match || !match.groups) {
        throw new Error('[allotment-ux] AP branch selector insertion point not found; refusing to modify the file.');
      }

      const block = `

              {selectedCollegeCode !== 'ALL' && selectedBranchCode !== 'ALL' && categoryInsights.length > 0 && (
                <section id="ap-category-cutoff-summary" className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm" aria-labelledby="ap-category-cutoff-title">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h2 id="ap-category-cutoff-title" className="text-sm sm:text-base font-black text-slate-900">Allotted Seat Category Breakdown</h2>
                      <p className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-5">Exact AP allotment category codes · {currentCollege?.college_name || 'Selected college'} · {branchLabel}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500">Best = smallest observed rank · Last = largest observed rank</span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {categoryInsights.map(([category, insight]) => (
                      <div key={category} className="rounded-xl border border-slate-200 bg-slate-50 p-3 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] sm:text-xs font-black font-mono text-slate-900" title={category}>{category}</span>
                          <span className="shrink-0 rounded-full bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 text-[9px] font-bold text-cyan-700">{insight.count}</span>
                        </div>
                        <div className="mt-1 text-[10px] font-mono text-slate-500">{visibleRecords.length ? ((insight.count / visibleRecords.length) * 100).toFixed(1) : '0.0'}% of selected allotments</div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-emerald-700">Best Rank</div>
                            <div className="mt-0.5 text-xs font-black text-slate-900">{insight.min.toLocaleString()}</div>
                          </div>
                          <div className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-1.5">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-amber-700">Last Rank</div>
                            <div className="mt-0.5 text-xs font-black text-slate-900">{insight.max.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}`;

      next = next.replace(marker, `${match.groups.selector}${block}\n${match.groups.next}`);
    }

    return next;
  },
  'AP exact allotted-category summary'
);

// TG already has the exact seat-category grouping in categoryCutoffs. Add only
// the percentage metric; preserve its existing best/last rank calculation and
// card layout so the TG experience remains unchanged.
patchFile(
  'src/components/TgAllotmentExplorer.jsx',
  (source) => {
    let next = source;
    const tgPercentageMarker = 'percentage: total > 0 ? ((item.count / total) * 100) : 0';

    // Idempotent: npm run build invokes prebuild, and our verification workflow
    // may invoke the same prebuild sequence once before npm run build invokes it
    // again. Always detect the already-generated form, not the original marker.
    if (!next.includes(tgPercentageMarker)) {
      const oldReturn = '    return Object.values(map).sort((a, b) => a.openingRank - b.openingRank);';
      const newReturn = `    const total = currentBundle.records.length;
    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: total > 0 ? ((item.count / total) * 100) : 0
      }))
      .sort((a, b) => a.openingRank - b.openingRank);`;
      if (!next.includes(oldReturn)) {
        throw new Error('[allotment-ux] TG categoryCutoffs source marker not found; refusing to modify the file.');
      }
      next = next.replace(oldReturn, newReturn);
    }

    if (!next.includes('{item.percentage.toFixed(1)}% of branch allotments')) {
      const oldCard = `                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                                {item.count} {item.count === 1 ? 'seat' : 'seats'}
                              </span>`;
      const newCard = `${oldCard}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mb-1.5">
                              {item.percentage.toFixed(1)}% of branch allotments
                            </div>`;
      if (!next.includes(oldCard)) {
        throw new Error('[allotment-ux] TG category card source marker not found; refusing to modify the file.');
      }
      next = next.replace(oldCard, newCard);
    }

    return next;
  },
  'TG category percentages'
);
