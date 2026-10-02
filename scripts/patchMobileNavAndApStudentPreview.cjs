const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function patchFile(relativePath, transform, label) {
  const filePath = path.join(root, relativePath);
  const before = fs.readFileSync(filePath, 'utf8');
  const after = transform(before);
  if (after === before) {
    console.log(`[mobile-ap-ux] ${label}: already patched`);
    return;
  }
  fs.writeFileSync(filePath, after, 'utf8');
  console.log(`[mobile-ap-ux] ${label}: patched`);
}

patchFile('src/components/Header.tsx', (source) => {
  let next = source;

  // Keep the compact search/support/menu controls visible on mobile.
  // Desktop navigation remains controlled by the existing lg breakpoint.
  next = next.replace(
    'className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-3 text-xs font-bold text-cyan-200 hover:bg-cyan-400/15 hover:text-white transition-colors"><Heart className="h-3.5 w-3.5" /> Support</button>',
    'className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-2.5 sm:px-3 text-xs font-bold text-cyan-200 hover:bg-cyan-400/15 hover:text-white transition-colors"><Heart className="h-3.5 w-3.5" /><span className="hidden min-[380px]:inline">Support</span></button>'
  );

  if (!next.includes('id="mobile-search-tools"')) {
    const mobileNavPattern = /      \{mobileOpen && \(\n        <div className="border-t border-cyan-300\/10 bg-\[#040b16\] px-3 pb-4 pt-2 lg:hidden">[\s\S]*?        <\/div>\n      \)\}/;
    if (!mobileNavPattern.test(next)) {
      throw new Error('[mobile-ap-ux] mobile navigation marker not found; refusing to modify Header.tsx.');
    }

    const mobileNav = `      {mobileOpen && (\n        <div className="border-t border-cyan-300/10 bg-[#040b16] px-3 pb-4 pt-2 lg:hidden">\n          <div className="mx-auto max-w-7xl space-y-1">\n            <button\n              type="button"\n              id="mobile-search-tools"\n              onClick={() => { setMobileOpen(false); onOpenCommandPalette?.(); }}\n              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-cyan-400/10 hover:text-white"\n            >\n              <Search className="h-4 w-4 text-cyan-300" /> Search Tools\n            </button>\n            <MobileGroup title="For AP" items={AP_TOOLS} onSelect={navigate} />\n            <MobileGroup title="For TG" items={TG_TOOLS} onSelect={navigate} />\n            <MobileGroup title="Other Tools" items={OTHER_TOOLS} onSelect={navigate} />\n          </div>\n        </div>\n      )}`;
    next = next.replace(mobileNavPattern, mobileNav);
  }

  return next;
}, 'mobile navigation');

patchFile('src/components/ap-allotment/APAllotmentExplorer.tsx', (source) => {
  let next = source;

  if (!next.includes('const selectedStudentPreview = useMemo(() => {')) {
    const marker = '  const genderMix = useMemo(() => {\n';
    const start = next.indexOf(marker);
    const end = next.indexOf('\n\n  const bestRank =', start);
    if (start < 0 || end < 0) {
      throw new Error('[mobile-ap-ux] genderMix insertion marker not found; refusing to modify APAllotmentExplorer.tsx.');
    }

    const block = `  const selectedStudentPreview = useMemo(() => {\n    // Preview names only after a specific college + branch is selected.\n    // Use the already year/phase/filter-scoped records so 2025/2026 data\n    // cannot be mixed. Keep the preview deterministic and capped at 5.\n    if (selectedCollegeCode === 'ALL' || selectedBranchCode === 'ALL') return [];\n    return visibleRecords\n      .map((record) => String(record.cand_name ?? '').trim())\n      .filter(Boolean)\n      .slice(0, 5);\n  }, [visibleRecords, selectedCollegeCode, selectedBranchCode]);\n\n`;
    next = next.slice(0, end) + '\n\n' + block + next.slice(end);
  }

  if (!next.includes('id="ap-selected-student-preview"')) {
    const marker = '                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">';
    const index = next.indexOf(marker);
    if (index < 0) {
      throw new Error('[mobile-ap-ux] AP stats insertion marker not found; refusing to modify APAllotmentExplorer.tsx.');
    }

    const block = `                    {selectedStudentPreview.length > 0 && (\n                      <section id="ap-selected-student-preview" className="rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-cyan-50/80 via-white to-indigo-50/70 dark:from-cyan-950/30 dark:via-slate-900/80 dark:to-indigo-950/30 p-4 sm:p-5 shadow-xl">\n                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">\n                          <div>\n                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-300">Selected branch students</p>\n                            <h3 className="mt-1 text-base sm:text-lg font-black text-slate-950 dark:text-white">Student names</h3>\n                            <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">First 5 names from the selected {branchLabel} allotment records. More students remain available in the full allotment table below.</p>\n                          </div>\n                          <span className="shrink-0 rounded-full border border-cyan-500/15 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">Showing {selectedStudentPreview.length} names</span>\n                        </div>\n                        <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">\n                          {selectedStudentPreview.map((name, index) => (\n                            <li key={name + index} className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 dark:border-white/10 dark:bg-slate-950/40">\n                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-[10px] font-black text-cyan-700 dark:text-cyan-300">{index + 1}</span>\n                              <span className="min-w-0 truncate text-xs font-bold text-slate-800 dark:text-slate-200" title={name}>{name}</span>\n                            </li>\n                          ))}\n                        </ol>\n                      </section>\n                    )}\n\n`;
    next = next.slice(0, index) + block + next.slice(index);
  }

  return next;
}, 'AP student-name preview');
