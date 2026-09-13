import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function scanAllotmentDir(dir: string) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'manifest.json');
  
  const manifest = files.map(filename => {
    try {
      const filePath = path.join(dir, filename);
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);

      let collegeCode = (data.collegeCode || data.inst_code || '').trim();
      let collegeName = (data.collegeName || data.inst_name || '').trim();

      if (!collegeCode) {
        const baseName = filename.replace(/\.json$/i, '');
        const segments = baseName.split('_');
        collegeCode = segments[segments.length - 1].toUpperCase();
      }

      if (!collegeName) {
        collegeName = filename.replace(/\.json$/i, '').replace(/_/g, ' ');
      }

      const branches = (data.branches || []).map((b: any) => {
        const recCount = b.records ? b.records.length : (b.totalAllotted || 0);
        return {
          branchCode: b.branchCode || b.branch_code || '',
          branchName: b.branchName || b.branch_name || b.branchCode || '',
          openingRank: typeof b.openingRank === 'number' ? b.openingRank : 0,
          closingRank: typeof b.closingRank === 'number' ? b.closingRank : 0,
          totalAllotted: recCount
        };
      });

      const recordCount = branches.reduce((sum: number, b: any) => sum + b.totalAllotted, 0);
      const openingRanks = branches.map((b: any) => b.openingRank).filter((r: number) => r > 0);
      const closingRanks = branches.map((b: any) => b.closingRank).filter((r: number) => r > 0);
      const minRank = openingRanks.length ? Math.min(...openingRanks) : 0;
      const maxRank = closingRanks.length ? Math.max(...closingRanks) : 0;

      return {
        collegeCode,
        collegeName,
        filename,
        file: `/TG_EAPCET_2026_ALLOTMENT/${filename}`,
        branchCount: branches.length,
        recordCount,
        minRank,
        maxRank,
        branches
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);

  manifest.sort((a: any, b: any) => a.collegeCode.localeCompare(b.collegeCode));

  const totalColleges = manifest.length;
  const totalRecords = manifest.reduce((sum: number, c: any) => sum + c.recordCount, 0);
  const allMinRanks = manifest.map((c: any) => c.minRank).filter((r: number) => r > 0);
  const allMaxRanks = manifest.map((c: any) => c.maxRank).filter((r: number) => r > 0);

  const stats = {
    totalColleges,
    totalRecords,
    overallMinRank: allMinRanks.length ? Math.min(...allMinRanks) : 0,
    overallMaxRank: allMaxRanks.length ? Math.max(...allMaxRanks) : 0,
    generatedAt: new Date().toISOString()
  };

  return { stats, colleges: manifest };
}

function tgAllotmentPlugin(): Plugin {
  return {
    name: 'tg-allotment-plugin',
    configureServer(server) {
      server.middlewares.use('/api/tg-allotment/manifest', (_req, res) => {
        try {
          const dir = path.join(__dirname, 'public/TG_EAPCET_2026_ALLOTMENT');
          const result = scanAllotmentDir(dir);
          if (result) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
            return;
          }
        } catch (err) {
          console.error('[tgAllotmentPlugin] error:', err);
        }
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Manifest not found' }));
      });

      // Global Candidate Search across all 151 Telangana Colleges
      server.middlewares.use('/api/tg-allotment/search', (req, res) => {
        try {
          const parsedUrl = new URL(req.url || '', 'http://localhost');
          const q = (parsedUrl.searchParams.get('q') || '').trim().toLowerCase();
          if (!q || q.length < 2) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ query: q, results: [] }));
            return;
          }

          const dir = path.join(__dirname, 'public/TG_EAPCET_2026_ALLOTMENT');
          if (!fs.existsSync(dir)) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ query: q, results: [] }));
            return;
          }

          const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
          const matches: any[] = [];
          const MAX_MATCHES = 50;

          for (const file of files) {
            if (matches.length >= MAX_MATCHES) break;
            try {
              const filePath = path.join(dir, file);
              const content = fs.readFileSync(filePath, 'utf-8');
              // Quick check if string exists in file before parsing JSON for high speed
              if (!content.toLowerCase().includes(q)) continue;

              const data = JSON.parse(content);
              const collegeCode = data.collegeCode || file.replace(/\.json$/i, '');
              const collegeName = data.collegeName || collegeCode;
              const branches = Array.isArray(data.branches) ? data.branches : (Array.isArray(data) ? data : [data]);

              for (const branch of branches) {
                if (matches.length >= MAX_MATCHES) break;
                const branchCode = branch.branchCode || 'ENGG';
                const branchName = branch.branchName || branchCode;
                const records = Array.isArray(branch.records) ? branch.records : [];

                for (const r of records) {
                  if (matches.length >= MAX_MATCHES) break;
                  const nameMatch = r.name && r.name.toLowerCase().includes(q);
                  const htMatch = r.hallTicket && r.hallTicket.toLowerCase().includes(q);
                  const rankMatch = r.rank && r.rank.toString() === q;

                  if (nameMatch || htMatch || rankMatch) {
                    matches.push({
                      ...r,
                      collegeCode,
                      collegeName,
                      branchCode,
                      branchName
                    });
                  }
                }
              }
            } catch (fileErr) {
              // skip unreadable
            }
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ query: q, total: matches.length, results: matches }));
        } catch (err: any) {
          console.error('[tgAllotmentSearch] error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: err.message, results: [] }));
        }
      });

      // Serve /TG_EAPCET_2026_ALLOTMENT/ requests directly with code-alias fallback and 404 JSON protection
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url.startsWith('/TG_EAPCET_2026_ALLOTMENT/')) {
          const rawFilename = path.basename(decodeURIComponent(url));
          const dir = path.join(__dirname, 'public/TG_EAPCET_2026_ALLOTMENT');

          // 1. Direct file match
          const exactPath = path.join(dir, rawFilename);
          if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            fs.createReadStream(exactPath).pipe(res);
            return;
          }

          // 2. Code alias match (e.g. VJEC.json, VASV.json, etc.)
          if (rawFilename.endsWith('.json')) {
            const code = rawFilename.replace(/\.json$/i, '').toUpperCase();
            if (fs.existsSync(dir)) {
              const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
              const match = files.find(f => {
                const base = f.replace(/\.json$/i, '').toUpperCase();
                return base === code || base.endsWith('_' + code) || base.split('_').includes(code);
              });
              if (match) {
                const matchPath = path.join(dir, match);
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                fs.createReadStream(matchPath).pipe(res);
                return;
              }
            }

            // 3. Not found: return JSON 404 so Vite never returns HTML index.html
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              error: `College allotment file not found for '${code}'.`,
              code,
              message: `File '${rawFilename}' is not available in public/TG_EAPCET_2026_ALLOTMENT/.`
            }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), tgAllotmentPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
