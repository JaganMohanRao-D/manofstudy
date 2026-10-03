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

  next = next.replace(
    '<nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Primary navigation">',
    '<nav id="mos-desktop-primary-nav" className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Primary navigation">'
  );

  next = next.replace(
    'className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-3 text-xs font-bold text-cyan-200 hover:bg-cyan-400/15 hover:text-white transition-colors"><Heart className="h-3.5 w-3.5" /> Support</button>',
    'className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-2.5 sm:px-3 text-xs font-bold text-cyan-200 hover:bg-cyan-400/15 hover:text-white transition-colors"><Heart className="h-3.5 w-3.5" /><span>Support</span></button>'
  );

  if (!next.includes('id="mobile-search-tools"')) {
    const mobileNavPattern = /      \{mobileOpen && \(\n        <div className="border-t border-cyan-300\/10 bg-\[#040b16\] px-3 pb-4 pt-2 lg:hidden">[\s\S]*?        <\/div>\n      \)\}/;
    if (!mobileNavPattern.test(next)) {
      throw new Error('[mobile-ap-ux] mobile navigation marker not found; refusing to modify Header.tsx.');
    }

    const mobileNav = `      {mobileOpen && (
        <div id="mos-mobile-navigation-panel" className="border-t border-cyan-300/10 bg-[#040b16] px-3 pb-4 pt-2 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1">
            <button
              type="button"
              id="mobile-search-tools"
              onClick={() => { setMobileOpen(false); onOpenCommandPalette?.(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-cyan-400/10 hover:text-white"
            >
              <Search className="h-4 w-4 text-cyan-300" /> Search Tools
            </button>
            <MobileGroup title="For AP" items={AP_TOOLS} onSelect={navigate} />
            <MobileGroup title="For TG" items={TG_TOOLS} onSelect={navigate} />
            <MobileGroup title="Other Tools" items={OTHER_TOOLS} onSelect={navigate} />
          </div>
        </div>
      )}`;
    next = next.replace(mobileNavPattern, mobileNav);
  }

  if (!next.includes('id="mos-responsive-header-fix"')) {
    const styleBlock = `
const RESPONSIVE_HEADER_STYLE = (
  <style id="mos-responsive-header-fix">{\`
    @media (max-width: 1023px) {
      #mos-desktop-primary-nav { display: none !important; }
      #main-header #header-support-btn { display: inline-flex !important; }
      #main-header button[aria-label="Open navigation"],
      #main-header button[aria-label="Close navigation"] { display: inline-flex !important; }
    }
    @media (min-width: 1024px) {
      #mos-mobile-navigation-panel { display: none !important; }
    }
  \`}</style>
);
`;
    const importMarker = "import { ToolTab, WorkspaceView, LegalModalType } from '../types';\n";
    if (!next.includes(importMarker)) {
      throw new Error('[mobile-ap-ux] Header import marker not found; refusing to modify Header.tsx.');
    }
    next = next.replace(importMarker, importMarker + styleBlock + '\n');
  }

  if (!next.includes('{RESPONSIVE_HEADER_STYLE}')) {
    next = next.replace(
      '  return (\n    <header',
      '  return (\n    <>\n      {RESPONSIVE_HEADER_STYLE}\n      <header'
    );
    next = next.replace(
      '    </header>\n  );',
      '      </header>\n    </>\n  );'
    );
  }

  return next;
}, 'responsive mobile/tablet navigation');

// The old build patch used to inject a "Selected branch students" preview.
// That subset was removed intentionally. The neutral, paginated student table
// is now the single student-list presentation, so this script must never
// recreate the old preview on future Cloudflare/Vite builds.
patchFile('src/components/ap-allotment/APAllotmentExplorer.tsx', (source) => {
  let next = source;
  const legacyStart = next.indexOf('                    {selectedStudentPreview.length > 0 && (');
  if (legacyStart >= 0) {
    const legacyEnd = next.indexOf('                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">', legacyStart);
    if (legacyEnd < 0) {
      throw new Error('[mobile-ap-ux] legacy student preview boundary not found; refusing to modify APAllotmentExplorer.tsx.');
    }
    next = next.slice(0, legacyStart) + next.slice(legacyEnd);
  }
  const stateStart = next.indexOf('  const selectedStudentPreview = useMemo(() => {');
  if (stateStart >= 0) {
    const stateEnd = next.indexOf('\n\n  const bestRank =', stateStart);
    if (stateEnd < 0) {
      throw new Error('[mobile-ap-ux] legacy student preview state boundary not found; refusing to modify APAllotmentExplorer.tsx.');
    }
    next = next.slice(0, stateStart) + next.slice(stateEnd + 2);
  }
  return next;
}, 'retire selected-student preview');

patchFile('src/components/ap-allotment/APAllotmentTable.tsx', (source) => {
  let next = source;
  next = next.replace(
    "import React, { useState, useMemo, useCallback } from 'react';",
    "import React, { useState, useMemo, useCallback, useEffect } from 'react';"
  );
  next = next.replace('  const pageSize = 25;', '  const pageSize = 10;');
  if (!next.includes('setCurrentPage(1);\n    setExpandedStudentKey(null);')) {
    const marker = '  const paginatedRecords = useMemo(() => {\n';
    const index = next.indexOf(marker);
    if (index < 0) {
      throw new Error('[mobile-ap-ux] APAllotmentTable pagination marker not found; refusing to modify the table.');
    }
    const effect = `  useEffect(() => {\n    setCurrentPage(1);\n    setExpandedStudentKey(null);\n  }, [records]);\n\n`;
    next = next.slice(0, index) + effect + next.slice(index);
  }
  return next;
}, 'neutral 10-record AP pagination');

patchFile('src/components/ap-allotment/APAllotmentExplorer.tsx', (source) => {
  return source.replace(
    '<h3 className="font-bold text-slate-950 dark:text-white">Allotted students</h3>',
    '<h3 className="font-bold text-slate-950 dark:text-white">All Allotted Students</h3>'
  );
}, 'neutral AP student-list heading');
