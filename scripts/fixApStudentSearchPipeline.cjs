const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const serviceFile = path.join(root, 'src/services/apEapcetAllotmentService.ts');

function patchService() {
  let source = fs.readFileSync(serviceFile, 'utf8');

  const start = source.indexOf('async function loadSearchIndex(year: AllotmentYear): Promise<SearchIndexData> {');
  const end = source.indexOf('\n\nexport async function searchAllotments(', start);
  if (start < 0 || end < 0) {
    throw new Error('[ap-student-search] Could not safely locate loadSearchIndex in apEapcetAllotmentService.ts');
  }

  const replacement = `async function loadSearchIndex(year: AllotmentYear): Promise<SearchIndexData> {
  const cached = searchIndexCache.get(year);
  if (cached) return cached;

  const promise = (async () => {
    const basePath = BASE_PATH[year].replace(/\\/$/, '');
    const response = await fetch(basePath + '/search_index.json');
    if (!response.ok) {
      throw new Error(\`Unable to load AP EAPCET \${year} search index (HTTP \${response.status})\`);
    }

    const manifest = await response.json();
    let candidates: SearchIndexCandidate[] = [];

    if (Array.isArray(manifest.chunks) && manifest.chunks.length > 0) {
      const chunkArrays = await Promise.all(
        manifest.chunks.map(async (fileName: string) => {
          const chunkResponse = await fetch(basePath + '/' + fileName);
          if (!chunkResponse.ok) {
            throw new Error(\`Unable to load AP EAPCET \${year} search chunk \${fileName} (HTTP \${chunkResponse.status})\`);
          }
          const chunk = await chunkResponse.json();
          return Array.isArray(chunk) ? chunk : (Array.isArray(chunk.candidates) ? chunk.candidates : []);
        })
      );
      candidates = chunkArrays.flat() as SearchIndexCandidate[];
    } else if (Array.isArray(manifest.candidates)) {
      candidates = manifest.candidates as SearchIndexCandidate[];
    }

    return {
      candidates,
      stats: manifest.stats ?? {
        totalColleges: Number(manifest.collegeCount ?? 0),
        totalRecords: Number(manifest.totalRecords ?? candidates.length),
        totalBranches: Object.keys(manifest.branchMap ?? {}).length,
      },
      branchMap: manifest.branchMap ?? {},
      collegeMap: manifest.collegeMap ?? {},
    };
  })();

  searchIndexCache.set(year, promise);
  return promise;
}`;

  source = source.slice(0, start) + replacement + source.slice(end);

  if (!source.includes('stats?: { totalColleges?: number; totalRecords?: number; totalBranches?: number;')) {
    source = source.replace(
      /interface SearchIndexData \{\n  candidates: SearchIndexCandidate\[\];/,
      'interface SearchIndexData {\n  candidates: SearchIndexCandidate[];\n  stats?: { totalColleges?: number; totalRecords?: number; totalBranches?: number; categories?: string[]; regions?: string[]; phases?: number[]; minRank?: number; maxRank?: number };'
    );
  }

  fs.writeFileSync(serviceFile, source, 'utf8');
  console.log('[ap-student-search] AP search loader now supports Cloudflare chunked indexes and preserves stats.');
}

patchService();
