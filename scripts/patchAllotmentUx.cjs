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
