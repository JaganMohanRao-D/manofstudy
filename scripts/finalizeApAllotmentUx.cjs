const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();

function patchFile(relativePath, transform, label) {
  const filePath = path.join(root, relativePath);
  const before = fs.readFileSync(filePath, 'utf8');
  const after = transform(before);
  if (after === before) return console.log(`[final-ap-ux] ${label}: already correct`);
  fs.writeFileSync(filePath, after, 'utf8');
  console.log(`[final-ap-ux] ${label}: patched`);
}

// Remove the duplicate Candidate categories card; the detailed category table
// below is the canonical neutral presentation.
patchFile('src/components/ap-allotment/APAllotmentExplorer.tsx', (source) => {
  const marker = '<p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-400">Category mix</p><h3 className="mt-1 font-black text-slate-950 dark:text-white">Candidate categories</h3>';
  const textIndex = source.indexOf(marker);
  if (textIndex < 0) return source;
  const cardStart = source.lastIndexOf('                      <div className="mos-fade-up rounded-[1.75rem]', textIndex);
  const phaseMarker = '<p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-400">Phase activity</p><h3 className="mt-1 font-black text-slate-950 dark:text-white">Allotment distribution</h3>';
  const phaseIndex = source.indexOf(phaseMarker, textIndex);
  const phaseStart = source.lastIndexOf('                      <div className="mos-fade-up rounded-[1.75rem]', phaseIndex);
  if (cardStart < 0 || phaseStart < cardStart) throw new Error('[final-ap-ux] Category card boundaries not found.');
  return source.slice(0, cardStart) + source.slice(phaseStart);
}, 'remove duplicate category analytics card');

// Move the existing category table to immediately after the student table.
patchFile('src/components/ap-allotment/APAllotmentExplorer.tsx', (source) => {
  const id = 'id="ap-category-enrollment-summary"';
  const idIndex = source.indexOf(id);
  if (idIndex < 0) return source;
  const sectionStart = source.lastIndexOf('              <section', idIndex);
  const sectionEnd = source.indexOf('</section>', idIndex);
  if (sectionStart < 0 || sectionEnd < 0) throw new Error('[final-ap-ux] Category table boundaries not found.');
  const block = source.slice(sectionStart, sectionEnd + 10);
  const without = source.slice(0, sectionStart) + source.slice(sectionEnd + 10);
  const table = without.indexOf('<APAllotmentTable ');
  const tableEnd = table >= 0 ? without.indexOf('/>', table) : -1;
  const wrapperEnd = tableEnd >= 0 ? without.indexOf('</section>', tableEnd) : -1;
  if (table < 0 || tableEnd < 0 || wrapperEnd < 0) throw new Error('[final-ap-ux] Student table insertion point not found.');
  const insertion = wrapperEnd + 10;
  return without.slice(0, insertion) + '\n\n' + block + without.slice(insertion);
}, 'place category table after student list');

// Limit the table search input to student name or rank only.
patchFile('src/components/ap-allotment/APAllotmentTable.tsx', (source) => {
  let next = source;
  next = next.replace(
    /r\.cand_name\.toLowerCase\(\)\.includes\(q\) \|\|\s*\(r\.rank && String\(r\.rank\)\.includes\(q\)\) \|\|\s*r\.category\.toLowerCase\(\)\.includes\(q\) \|\|\s*r\.alloted_category\.toLowerCase\(\)\.includes\(q\)/,
    'r.cand_name.toLowerCase().includes(q) || (r.rank && String(r.rank).includes(q))'
  );
  next = next.replace('placeholder="Search student name, rank, or category in this branch..."', 'placeholder="Search student name or rank in this branch..."');
  next = next.replace("import React, { useState, useMemo, useCallback } from 'react';", "import React, { useState, useMemo, useCallback, useEffect } from 'react';");
  next = next.replace('const pageSize = 25;', 'const pageSize = 10;');
  if (!next.includes('  useEffect(() => {\n    setCurrentPage(1);\n    setExpandedStudentKey(null);\n  }, [records]);')) {
    const marker = '  const paginatedRecords = useMemo(() => {\n';
    const index = next.indexOf(marker);
    if (index < 0) throw new Error('[final-ap-ux] Table pagination marker not found.');
    next = next.slice(0, index) + '  useEffect(() => {\n    setCurrentPage(1);\n    setExpandedStudentKey(null);\n  }, [records]);\n\n' + next.slice(index);
  }
  return next;
}, 'enforce 10-record name/rank pagination');

// Disable the automatic support prompt after search results. Manual Support
// buttons remain available.
patchFile('src/App.tsx', (source) => {
  const startMarker = '  // Show one respectful support prompt only after a real search result is produced.\n';
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const endMarker = "  const supportEmail = 'support.jamord@gmail.com';";
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error('[final-ap-ux] Support prompt block end not found.');
  return source.slice(0, start) + source.slice(end);
}, 'disable automatic support popup');

// Remove the AP search event that only existed to trigger that popup.
patchFile('src/components/ap-allotment/APStudentSearch.tsx', (source) => source.replace(/\n\s*if \(searchMode === 'name' && records\.length > 0\) \{\n\s*window\.dispatchEvent\(new CustomEvent\('mos:tool-result-ready', \{[\s\S]*?\n\s*\}\);\n\s*\}/, ''), 'remove AP search support event');

// Candidate search modes are limited to student name and rank.
patchFile('src/components/ap-allotment/APStudentSearch.tsx', (source) => {
  let next = source;
  next = next.replace("const [searchMode, setSearchMode] = useState<'name' | 'rank' | 'hallticket'>('name');", "const [searchMode, setSearchMode] = useState<'name' | 'rank'>('name');");
  next = next.replace("        hallTicket: searchMode === 'hallticket' ? nameInput : undefined,\n", '');
  next = next.replace("if ((searchMode === 'name' || searchMode === 'hallticket') && nameInput.trim().length >= 2)", "if (searchMode === 'name' && nameInput.trim().length >= 2)");
  const hallMarker = "setSearchMode('hallticket');";
  const hallIndex = next.indexOf(hallMarker);
  if (hallIndex >= 0) {
    const buttonStart = next.lastIndexOf('<button', hallIndex);
    const buttonEnd = next.indexOf('</button>', hallIndex);
    if (buttonStart < 0 || buttonEnd < 0) throw new Error('[final-ap-ux] Hall Ticket toggle boundaries not found.');
    next = next.slice(0, buttonStart) + next.slice(buttonEnd + 9);
  }
  next = next.replace(/\n\s*\{searchMode === 'hallticket' && \([\s\S]*?\n\s*\)\}\n\n\s*\/\* Rank Mode Inputs \*\//, '\n\n        {/* Rank Mode Inputs */');
  next = next.replace('placeholder="Search candidate name..."', 'placeholder="Search by student name..."');
  next = next.replace('const pageSize = 25;', 'const pageSize = 10;');
  return next;
}, 'limit candidate search to name/rank');
