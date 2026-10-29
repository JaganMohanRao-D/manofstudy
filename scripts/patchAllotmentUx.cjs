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

// AP/TG category analytics are deterministic build-time source patches.
// No runtime DOM injection or global CSS is used. Every transformation is
// idempotent so Cloudflare prebuild/build execution remains safe.

patchFile(
  'src/components/ap-allotment/APAllotmentExplorer.tsx',
  (source) => {
    let next = source;

    if (!next.includes('const categoryEnrollmentRows = useMemo(() => {')) {
      const start = next.indexOf('  const categoryInsights = useMemo(() => {');
      const end = next.indexOf('\n\n  const genderMix', start);
      if (start < 0 || end < 0) {
        throw new Error('[allotment-ux] AP category analytics source marker not found; refusing to modify the file.');
      }

      const replacement = `  const categoryEnrollmentRows = useMemo(() => {
    const CATEGORY_ORDER = ['OC', 'EWS', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC_I', 'SC_II', 'SC_III', 'SC', 'ST', 'MUS'];
    const CATEGORY_LABELS: Record<string, string> = {
      OC: 'OC', EWS: 'EWS', BC_A: 'BC-A', BC_B: 'BC-B', BC_C: 'BC-C', BC_D: 'BC-D', BC_E: 'BC-E',
      SC_I: 'SC-I', SC_II: 'SC-II', SC_III: 'SC-III', SC: 'SC', ST: 'ST', MUS: 'MUS',
    };

    const getSeatCategory = (record: AllotmentRecord) => {
      const raw = String(record.alloted_category || '').trim().toUpperCase().replace(/[()]/g, '_');
      const ordered = ['SC_III', 'SC_II', 'SC_I', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'EWS', 'OC', 'ST', 'SC', 'MUS'];
      const match = ordered.find((key) => raw === key || raw.startsWith(key + '_'));
      if (match) return match;
      const numericSc = raw.match(/^SC[_-]?([123])(?:_|$)/);
      if (numericSc) return 'SC_' + ['I', 'II', 'III'][Number(numericSc[1]) - 1];
      return String(record.category || 'OTHER').trim().toUpperCase();
    };

    const rows = new Map<string, {
      category: string;
      boys: { count: number; min: number; max: number };
      girls: { count: number; min: number; max: number };
    }>();

    visibleRecords.forEach((record) => {
      const category = getSeatCategory(record);
      const gender = String(record.gender || '').trim().toUpperCase() === 'F' ? 'girls' : 'boys';
      const current = rows.get(category) || {
        category,
        boys: { count: 0, min: Infinity, max: 0 },
        girls: { count: 0, min: Infinity, max: 0 },
      };
      const bucket = current[gender];
      bucket.count += 1;
      bucket.min = Math.min(bucket.min, record.rank);
      bucket.max = Math.max(bucket.max, record.rank);
      rows.set(category, current);
    });

    return Array.from(rows.values())
      .filter((row) => row.boys.count + row.girls.count > 0)
      .sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.category);
        const bi = CATEGORY_ORDER.indexOf(b.category);
        if (ai === -1 && bi === -1) return a.category.localeCompare(b.category);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
      .map((row) => ({ ...row, label: CATEGORY_LABELS[row.category] || row.category, total: row.boys.count + row.girls.count }));
  }, [visibleRecords]);`;

      // Keep the existing categoryInsights calculation. The enrollment table
      // is inserted beside it rather than replacing it, preventing runtime
      // ReferenceErrors in the legacy Candidate Categories card.
      next = next.slice(0, end) + '\n\n' + replacement + next.slice(end);
    }

    if (!next.includes('id="ap-category-enrollment-summary"')) {
      const branchSelectorIndex = next.indexOf('<APBranchSelector');
      const tagsMarker = '\n              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">';
      const tagsIndex = branchSelectorIndex >= 0 ? next.indexOf(tagsMarker, branchSelectorIndex) : -1;
      if (tagsIndex < 0) {
        throw new Error('[allotment-ux] AP category summary insertion point not found; refusing to modify the file.');
      }

      const block = `

              {selectedCollegeCode !== 'ALL' && selectedBranchCode !== 'ALL' && (
                <section id="ap-category-enrollment-summary" className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm" aria-labelledby="ap-category-enrollment-title">
                  <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700">Category-wise student allotments</p>
                      <h2 id="ap-category-enrollment-title" className="mt-1 text-sm sm:text-base font-black text-slate-900">Students allotted under each seat category</h2>
                      <p className="mt-1 text-[11px] sm:text-xs leading-5 text-slate-500">AP EAPCET {selectedYear} · {selectedPhase === 'ALL' ? 'All selected phases' : 'Phase ' + selectedPhase}. AU, SVU and non-local variants are combined. CAP, NCC, Sports and other special-seat variants are counted under their parent allotted category.</p>
                    </div>
                    <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600">{visibleRecords.length.toLocaleString()} total allotments in view</div>
                  </div>

                  {categoryEnrollmentRows.length > 0 ? (
                    <>
                      <div className="mt-4 hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full min-w-[760px] border-collapse text-left">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                              <th className="px-4 py-3">Allotted category</th>
                              <th className="px-4 py-3">Boys</th>
                              <th className="px-4 py-3">Girls</th>
                              <th className="px-4 py-3">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {categoryEnrollmentRows.map((row) => {
                              const totalPct = visibleRecords.length ? (row.total / visibleRecords.length) * 100 : 0;
                              const boysPct = visibleRecords.length ? (row.boys.count / visibleRecords.length) * 100 : 0;
                              const girlsPct = visibleRecords.length ? (row.girls.count / visibleRecords.length) * 100 : 0;
                              const cells = [
                                { label: 'Boys', item: row.boys, percentage: boysPct },
                                { label: 'Girls', item: row.girls, percentage: girlsPct },
                                { label: 'Total', item: { count: row.total, min: Math.min(row.boys.min, row.girls.min), max: Math.max(row.boys.max, row.girls.max) }, percentage: totalPct },
                              ];
                              return (
                                <tr key={row.category} className="align-top hover:bg-slate-50/80">
                                  <td className="px-4 py-3"><div className="font-black text-slate-900">{row.label}</div><div className="mt-0.5 text-[10px] text-slate-500">All regional variants combined</div></td>
                                  {cells.map((cell) => (
                                    <td key={cell.label} className="px-4 py-3">
                                      <div className="flex items-baseline gap-2"><span className="text-base font-black text-slate-900">{cell.item.count.toLocaleString()}</span><span className="text-[10px] font-bold text-cyan-700">{cell.percentage.toFixed(1)}%</span></div>
                                      {cell.item.count > 0 ? <div className="mt-1 text-[10px] font-mono text-slate-500">Rank {cell.item.min.toLocaleString()} → {cell.item.max.toLocaleString()}</div> : <div className="mt-1 text-[10px] text-slate-400">No allotments</div>}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-3 space-y-2 md:hidden">
                        {categoryEnrollmentRows.map((row) => {
                          const totalPct = visibleRecords.length ? (row.total / visibleRecords.length) * 100 : 0;
                          const renderBucket = (label: string, bucket: { count: number; min: number; max: number }, percentage: number) => (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span><span className="text-sm font-black text-slate-900">{bucket.count.toLocaleString()} <span className="text-[10px] font-bold text-cyan-700">({percentage.toFixed(1)}%)</span></span></div>
                              {bucket.count > 0 ? <div className="mt-1 text-[10px] font-mono text-slate-500">Rank {bucket.min.toLocaleString()} → {bucket.max.toLocaleString()}</div> : <div className="mt-1 text-[10px] text-slate-400">No allotments</div>}
                            </div>
                          );
                          return (
                            <article key={row.category} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2"><div><div className="text-sm font-black text-slate-900">{row.label}</div><div className="text-[10px] text-slate-500">Total {row.total.toLocaleString()} · {totalPct.toFixed(1)}% of allotments</div></div></div>
                              <div className="mt-2 grid grid-cols-1 gap-2">{renderBucket('Boys', row.boys, visibleRecords.length ? (row.boys.count / visibleRecords.length) * 100 : 0)}{renderBucket('Girls', row.girls, visibleRecords.length ? (row.girls.count / visibleRecords.length) * 100 : 0)}</div>
                            </article>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">No category allotments are available for the selected year, phase, college and branch.</div>
                  )}
                </section>
              )}`;

      next = next.slice(0, tagsIndex) + block + next.slice(tagsIndex);
    }

    return next;
  },
  'AP category enrollment summary'
);

patchFile(
  'src/components/TgAllotmentExplorer.jsx',
  (source) => {
    let next = source;
    const tgPercentageMarker = 'percentage: total > 0 ? ((item.count / total) * 100) : 0';

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
      const oldCard = `<div className="flex items-center justify-between mb-1.5">
                              <span className={\`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded \${colors.lightBg} \${colors.text} border \${colors.border} truncate max-w-[150px]\`}>
                                {item.category}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                                {item.count} {item.count === 1 ? 'seat' : 'seats'}
                              </span>
                            </div>`;
      const newCard = `${oldCard}
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

// AP legacy "Candidate categories" analytics must use the allotted seat
// category, not the candidate's social/category field. The latter can be BC/SC
// while an allotted seat is EWS/OC or a special quota variant, which is why EWS
// was missing from the UI. Keep this scoped to APAllotmentExplorer only.
patchFile(
  'src/components/ap-allotment/APAllotmentExplorer.tsx',
  (source) => {
    let next = source;
    const start = next.indexOf('  const categoryInsights = useMemo(() => {');
    const end = next.indexOf('\n\n  const categoryEnrollmentRows = useMemo(() => {', start);
    if (start < 0 || end < 0) {
      throw new Error('[allotment-ux] AP category mix source markers not found; refusing to modify the file.');
    }

    const replacement = `  const categoryInsights = useMemo(() => {
    const CATEGORY_ORDER = ['OC', 'EWS', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC_I', 'SC_II', 'SC_III', 'SC', 'ST', 'MUS'];
    const getSeatCategory = (record: AllotmentRecord) => {
      const raw = String(record.alloted_category || '').trim().toUpperCase().replace(/[()]/g, '_');
      const ordered = ['SC_III', 'SC_II', 'SC_I', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'EWS', 'OC', 'ST', 'SC', 'MUS'];
      const match = ordered.find((key) => raw === key || raw.startsWith(key + '_'));
      if (match) return match;
      const numericSc = raw.match(/^SC[_-]?([123])(?:_|$)/);
      if (numericSc) return 'SC_' + ['I', 'II', 'III'][Number(numericSc[1]) - 1];
      return String(record.category || 'OTHER').trim().toUpperCase();
    };

    const map = new Map<string, { min: number; max: number; count: number }>();
    visibleRecords.forEach((record) => {
      const key = getSeatCategory(record);
      const item = map.get(key) || { min: Infinity, max: 0, count: 0 };
      item.min = Math.min(item.min, record.rank);
      item.max = Math.max(item.max, record.rank);
      item.count += 1;
      map.set(key, item);
    });

    return Array.from(map.entries())
      .sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a[0]);
        const bi = CATEGORY_ORDER.indexOf(b[0]);
        if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
  }, [visibleRecords]);`;

    return next.slice(0, start) + replacement + next.slice(end);
  },
  'AP allotted category analytics'
);

patchFile(
  'src/components/ap-allotment/APAllotmentExplorer.tsx',
  (source) => {
    let next = source;
    if (!next.includes('const statewideCategoryBars = useMemo(() => (')) return next;
    const legacyMarker = '  const currentCollege = selectedCollegeCode !== \'ALL\' ? collegeData : null;';
    const legacyIndex = next.indexOf(legacyMarker);
    if (legacyIndex < 0) return next;
    return next;
  },
  'AP statewide category analytics'
);
