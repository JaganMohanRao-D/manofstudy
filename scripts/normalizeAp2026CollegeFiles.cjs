const fs = require('fs');
const path = require('path');

// Keep the existing AP EAPCET 2026 college data contract intact.
// SIUPU was added as a root-level array, while the existing 2026 pipeline
// expects { records: [...] }. Normalize only that newly added file when needed.
const filePath = path.join(
  process.cwd(),
  'public',
  'AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE',
  'SIUPU.json'
);

if (!fs.existsSync(filePath)) {
  console.log('SIUPU.json not found; nothing to normalize.');
  process.exit(0);
}

const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

if (!Array.isArray(raw)) {
  console.log('SIUPU.json already uses the existing object format; no changes needed.');
  process.exit(0);
}

const first = raw.find((record) => record && typeof record === 'object') || {};
const normalized = {
  college_code: String(first.inst_code || 'SIUPU').trim().toUpperCase(),
  college_name: String(first.inst_name || 'SIUPU').trim(),
  records: raw,
};

fs.writeFileSync(filePath, JSON.stringify(normalized));
console.log(`Normalized SIUPU.json root array into the existing records format (${raw.length} records).`);
