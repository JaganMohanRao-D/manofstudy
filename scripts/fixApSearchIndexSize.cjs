const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const MAX_ASSET_BYTES = 24 * 1024 * 1024;
const CHUNK_TARGET_BYTES = 18 * 1024 * 1024;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function toTuple(candidate) {
  if (Array.isArray(candidate)) return candidate;
  return [
    Number(candidate.rank ?? 0),
    String(candidate.name ?? candidate.cand_name ?? '').trim(),
    String(candidate.gender ?? '').trim().toUpperCase(),
    String(candidate.category ?? '').trim().toUpperCase(),
    String(candidate.region ?? '').trim().toUpperCase(),
    String(candidate.allottedCategory ?? candidate.alloted_category ?? '').trim().toUpperCase(),
    Number(candidate.phase ?? 0),
    String(candidate.collegeCode ?? candidate.college_code ?? '').trim().toUpperCase(),
    String(candidate.branchCode ?? candidate.branch_code ?? '').trim().toUpperCase(),
    candidate.feeWithExemption ?? candidate.fee_with_exemption ?? null,
    candidate.feeWithNoExemption ?? candidate.fee_with_no_exemption ?? null,
    candidate.leftOverSeats ?? candidate.left_over_seats ?? null,
    candidate.totalSeats ?? candidate.total_seats ?? null,
    candidate.rollNo ?? candidate.roll_no ?? null,
  ];
}

function buildCollegeMap(candidates, existing) {
  const map = { ...(existing || {}) };
  for (const candidate of candidates) {
    const tuple = toTuple(candidate);
    const code = tuple[7];
    if (code && !map[code]) {
      map[code] = String(candidate.collegeName ?? candidate.college_name ?? code).trim();
    }
  }
  return map;
}

function splitCandidates(candidates) {
  const chunks = [];
  let current = [];
  let currentBytes = 2;

  for (const candidate of candidates) {
    const tuple = toTuple(candidate);
    const bytes = Buffer.byteLength(JSON.stringify(tuple), 'utf8') + 1;
    if (current.length && currentBytes + bytes > CHUNK_TARGET_BYTES) {
      chunks.push(current);
      current = [];
      currentBytes = 2;
    }
    current.push(tuple);
    currentBytes += bytes;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function patchService() {
  const file = path.join(root, 'src/services/apEapcet2026AllotmentService.ts');
  let source = fs.readFileSync(file, 'utf8');

  const helper = `/** Loads either a legacy single search index or the Cloudflare-safe chunked index. */\nasync function loadSearchIndexAsset(baseFolder: string): Promise<any | null> {\n  try {\n    const manifestRes = await fetch(\`${'${'}baseFolder}/search_index.json\`);\n    if (!manifestRes.ok) throw new Error(\`HTTP \${manifestRes.status}\`);\n    const manifest = await manifestRes.json();\n    if (!Array.isArray(manifest.chunks) || manifest.chunks.length === 0) return manifest;\n\n    const chunks = await Promise.all(\n      manifest.chunks.map(async (fileName: string) => {\n        const res = await fetch(\`${'${'}baseFolder}/\${fileName}\`);\n        if (!res.ok) throw new Error(\`HTTP \${res.status} for \${fileName}\`);\n        return res.json();\n      })\n    );\n\n    return {\n      ...manifest,\n      candidates: chunks.flatMap((chunk: any) => Array.isArray(chunk) ? chunk : (chunk.candidates || [])),\n    };\n  } catch (error) {\n    console.warn('Could not load search index asset:', error);\n    return null;\n  }\n}\n\n`;

  if (!source.includes('async function loadSearchIndexAsset(')) {
    const marker = '/**\n * Preload 2026 search index\n */';
    const index = source.indexOf(marker);
    if (index < 0) throw new Error('[search-index] Could not find 2026 preload marker');
    source = source.slice(0, index) + helper + source.slice(index);
  }

  const replacement2026 = `/**\n * Preload 2026 search index\n */\nexport async function preloadSearchIndex2026(): Promise<boolean> {\n  if (cachedSearchIndex2026) return true;\n  if (searchIndexFetchPromise2026) return searchIndexFetchPromise2026;\n\n  searchIndexFetchPromise2026 = (async () => {\n    try {\n      const data = await loadSearchIndexAsset('/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE');\n      if (!data) return false;\n      cachedSearchIndex2026 = {\n        candidates: data.candidates || [],\n        branchMap: data.branchMap || {},\n        collegeMap: data.collegeMap || {},\n      };\n      return true;\n    } catch (err) {\n      console.warn('Could not load 2026 search index:', err);\n      return false;\n    } finally {\n      searchIndexFetchPromise2026 = null;\n    }\n  })();\n\n  return searchIndexFetchPromise2026;\n}\n`;

  const replacement2025 = `/**\n * Preload 2025 search index\n */\nexport async function preloadSearchIndex2025(): Promise<boolean> {\n  if (cachedSearchIndex2025) return true;\n  if (searchIndexFetchPromise2025) return searchIndexFetchPromise2025;\n\n  searchIndexFetchPromise2025 = (async () => {\n    try {\n      const data = await loadSearchIndexAsset('/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE');\n      if (!data) return false;\n      cachedSearchIndex2025 = {\n        candidates: data.candidates || [],\n        branchMap: data.branchMap || {},\n      };\n      return true;\n    } catch (err) {\n      console.warn('Could not load 2025 search index:', err);\n      return false;\n    } finally {\n      searchIndexFetchPromise2025 = null;\n    }\n  })();\n\n  return searchIndexFetchPromise2025;\n}\n`;

  const start2026 = source.indexOf('/**\n * Preload 2026 search index\n */');
  const start2025 = source.indexOf('/**\n * Preload 2025 search index\n */');
  const nextAfter2025 = source.indexOf('/**\n * Loads a specific college', start2025);
  if (start2026 < 0 || start2025 < 0 || nextAfter2025 < 0 || start2025 <= start2026) {
    throw new Error('[search-index] Could not safely locate preload functions');
  }

  source = source.slice(0, start2026) + replacement2026 + source.slice(start2025);
  const newStart2025 = source.indexOf('/**\n * Preload 2025 search index\n */', start2026);
  const newNextAfter2025 = source.indexOf('/**\n * Loads a specific college', newStart2025);
  source = source.slice(0, newStart2025) + replacement2025 + source.slice(newNextAfter2025);

  fs.writeFileSync(file, source, 'utf8');
}

function processYear(year) {
  const dir = path.join(root, 'public', `AP_EAPCET_${year}_ALLOTMENT_BY_COLLEGE`);
  const file = path.join(dir, 'search_index.json');
  if (!fs.existsSync(file)) return;

  const bytes = fs.statSync(file).size;
  const data = readJson(file);
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const collegeMap = buildCollegeMap(candidates, data.collegeMap);

  if (bytes <= MAX_ASSET_BYTES) {
    // Still normalize legacy object records into the tuple format expected by the runtime.
    if (candidates.length && !Array.isArray(candidates[0])) {
      const normalized = { ...data, collegeMap, candidates: candidates.map(toTuple) };
      fs.writeFileSync(file, JSON.stringify(normalized), 'utf8');
      console.log(`[search-index] ${year}: normalized existing search index (${candidates.length} candidates).`);
    } else if (!data.collegeMap) {
      fs.writeFileSync(file, JSON.stringify({ ...data, collegeMap }), 'utf8');
    }
    return;
  }

  const chunks = splitCandidates(candidates);
  const chunkFiles = [];
  for (let i = 0; i < chunks.length; i++) {
    const fileName = `search_index_${i + 1}.json`;
    fs.writeFileSync(path.join(dir, fileName), JSON.stringify(chunks[i]), 'utf8');
    chunkFiles.push(fileName);
  }

  const manifest = {
    year,
    totalRecords: data.totalRecords || candidates.length,
    collegeCount: data.collegeCount || 0,
    branchMap: data.branchMap || {},
    collegeMap,
    chunkCount: chunkFiles.length,
    chunks: chunkFiles,
  };
  fs.writeFileSync(file, JSON.stringify(manifest), 'utf8');

  console.log(`[search-index] ${year}: ${Math.round(bytes / 1024 / 1024)} MiB index split into ${chunkFiles.length} Cloudflare-safe chunks.`);
}

processYear('2025');
processYear('2026');
patchService();
console.log('[search-index] Cloudflare-safe AP search index loader applied.');
