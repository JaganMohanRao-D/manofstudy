const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(process.cwd(), 'src', 'components', 'TgAllotmentExplorer.jsx');
if (!fs.existsSync(filePath)) process.exit(0);

let source = fs.readFileSync(filePath, 'utf8');

// Keep the Telangana statewide search card readable even when global/theme CSS
// contains stronger text-color rules. This changes presentation only.
source = source.replace(
  '<h3 className="text-base sm:text-lg font-bold text-white">\n                  Statewide Candidate Search Engine',
  '<h3 className="text-base sm:text-lg font-bold !text-white">\n                  Statewide Candidate Search Engine'
);
source = source.replace(
  'text-slate-300 max-w-3xl leading-relaxed">\n                You can instantly search any student among all',
  '!text-slate-300 max-w-3xl leading-relaxed">\n                You can instantly search any student among all'
);

// Do not promote example candidates, ranks, or hall-ticket numbers in the
// statewide search card. The search remains available through the main field.
const suggestionBlock = /\s*<div className="flex flex-wrap gap-2">\s*\{\[\s*\{ label: 'Rank 42500'[\s\S]*?\]\}\s*<\/div>/;
source = source.replace(suggestionBlock, '');

fs.writeFileSync(filePath, source, 'utf8');
