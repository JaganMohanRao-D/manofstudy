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

      // Send Reply Alert via Resend
      server.middlewares.use('/api/send-reply-alert', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf-8');
            const data = JSON.parse(raw);
            const { toEmail, questionTitle, replyAuthor, replyContent, college } = data || {};

            if (!toEmail || typeof toEmail !== 'string' || !toEmail.includes('@')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Valid toEmail required' }));
              return;
            }

            const apiKey = process.env.RESEND_API_KEY || 're_2ZBQ4b12_7vRxwSgcwkKrFm2BnnbCyF6y';

            const safeTitle = String(questionTitle || 'Your Question').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeAuthor = String(replyAuthor || 'A fellow student').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeContent = String(replyContent || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

            const emailHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #fbcfe8; border-radius: 16px; background-color: #fffafc;">
  <h2 style="color: #be185d; margin-top: 0; margin-bottom: 8px; font-size: 20px;">🎓 New Answer on MOS CampusConnect!</h2>
  <p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.5;">Hello! A fellow student from ${college || 'Campus'} just replied to your question:</p>
  <blockquote style="border-left: 4px solid #f43f5e; padding: 10px 14px; background-color: #ffffff; color: #0f172a; font-weight: 600; margin: 16px 0; border-radius: 4px;">
    "${safeTitle}"
  </blockquote>
  <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #fecdd3; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #9d174d; font-weight: bold;">💬 Answer from ${safeAuthor}:</p>
    <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">${safeContent}</p>
  </div>
  <div style="text-align: center; margin: 24px 0 16px 0;">
    <a href="https://manofstudy.vercel.app/#campus-connect" style="display: inline-block; background-color: #ec4899; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
      View Full Discussion on Man of Study
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #fce7f3; margin: 20px 0 16px 0;" />
  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
    You received this email because you opted in for doubt resolution updates on Man of Study (MOS). Your email is 100% private and never visible to peers.
  </p>
</div>`;

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'MOS CampusConnect <onboarding@resend.dev>',
                to: [toEmail.trim()],
                subject: '🎓 Someone just answered your question on Man of Study!',
                html: emailHtml,
              }),
            });

            const resendData = await resendRes.json();
            res.statusCode = resendRes.status;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(resendData));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      // Gemini AI PDF Summarizer API
      server.middlewares.use('/api/gemini/summarize', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const handlePayload = async (data: any) => {
          try {
            const { text } = data || {};
            if (!text || typeof text !== 'string' || text.trim().length < 15) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Could not extract text. Please ensure this is a readable text PDF.' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }));
              return;
            }

            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey });

            const truncatedText = text.slice(0, 30000);
            const prompt = `Provide a structured 5-bullet summary and key exam takeaways from the following student notes/syllabus text.

Document Text:
${truncatedText}

Format the output cleanly in Markdown:
### 📌 5-Bullet Summary
- [Bullet 1: Main core thesis or topic overview]
- [Bullet 2: Key theoretical mechanism or principle]
- [Bullet 3: Primary application, workflow or architecture]
- [Bullet 4: Critical constraints, edge cases or comparison points]
- [Bullet 5: Conclusion or overarching practical takeaway]

### 🎯 Key Exam Takeaways
- **High-Frequency Formulas / Definitions**: Essential formulas, laws, or terms that examiners frequently test.
- **Midterm & Viva Probable Questions**: Top 2-3 conceptual questions professors or external viva examiners ask.
- **Common Tricky Pitfalls**: Mistakes students often make when solving related problems or derivations.`;

            let responseText = '';
            const candidateModels = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
            let lastErr: any = null;

            for (const model of candidateModels) {
              try {
                const result = await ai.models.generateContent({
                  model,
                  contents: prompt,
                });
                if (result && result.text) {
                  responseText = result.text;
                  break;
                }
              } catch (err: any) {
                console.warn(`[Gemini] Model ${model} failed, attempting next. Error:`, err.status || err.message);
                lastErr = err;
              }
            }

            if (!responseText) {
              throw new Error(lastErr?.message || 'Unable to generate summary. The AI model is temporarily busy.');
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: true, summary: responseText }));
          } catch (err: any) {
            console.error('[geminiSummarize] error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: err.message || 'Failed to process AI summary.' }));
          }
        };

        if ((req as any).body) {
          handlePayload((req as any).body);
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf-8');
            const data = JSON.parse(raw);
            handlePayload(data);
          } catch (e: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON body: ' + e.message }));
          }
        });
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
