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
  const excluded = ['index.json', 'manifest.json', 'predictor_index.json', 'search_index.json'];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !excluded.includes(f));
  
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

interface AllotmentCandidateRecord {
  rank: number;
  name: string;
  normalizedName: string;
  nameWords: string[];
  gender: string;
  caste: string;
  seatCategory: string;
  region: string;
  hallTicket: string;
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  phase: string;
  sourceFile: string;
}

let cachedCandidateRecords: AllotmentCandidateRecord[] | null = null;

function normalizeSearchText(text: string): string {
  return (text || '').toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function computeLevenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array(an + 1).fill(null).map(() => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

function evaluateCandidateMatch(cand: AllotmentCandidateRecord, qRaw: string) {
  const qClean = normalizeSearchText(qRaw);
  if (!qClean) {
    return { isMatch: true, matchType: 'Filter Match', priority: 100, reason: 'Filter criteria' };
  }

  const isNumeric = /^\d+$/.test(qClean);
  const qNum = isNumeric ? parseInt(qClean, 10) : null;

  if (isNumeric && qNum !== null) {
    if (cand.rank === qNum) {
      return { isMatch: true, matchType: 'Exact Match', priority: 1000, reason: 'Exact rank match' };
    }
    if (cand.hallTicket && cand.hallTicket.toUpperCase().includes(qClean)) {
      return { isMatch: true, matchType: 'Partial Match', priority: 550, reason: 'Hall ticket match' };
    }
    return { isMatch: false, matchType: '', priority: 0, reason: '' };
  }

  const name = cand.normalizedName;
  if (!name) return { isMatch: false, matchType: '', priority: 0, reason: '' };

  // 1. Exact full name match
  if (name === qClean) {
    return { isMatch: true, matchType: 'Exact Match', priority: 1000, reason: 'Exact full name match' };
  }

  // 2. Prefix match
  if (name.startsWith(qClean + ' ') || name.startsWith(qClean)) {
    return { isMatch: true, matchType: 'Exact Match', priority: 900, reason: 'Name prefix match' };
  }

  // 3. Exact token/word match (all query words are present as standalone words in name)
  const qWords = qClean.split(' ');
  const nameWords = cand.nameWords;
  const allWordsExact = qWords.every(qw => nameWords.includes(qw));
  if (allWordsExact) {
    return { isMatch: true, matchType: 'Exact Match', priority: 800, reason: 'Exact word/token match' };
  }

  // 4. Word prefix match (all query words are prefixes of words in name)
  const allWordsPrefix = qWords.every(qw => nameWords.some(nw => nw.startsWith(qw)));
  if (allWordsPrefix) {
    return { isMatch: true, matchType: 'Partial Match', priority: 600, reason: 'Word prefix match' };
  }

  // 5. Substring match
  if (name.includes(qClean)) {
    return { isMatch: true, matchType: 'Partial Match', priority: 400, reason: 'Substring match' };
  }

  // 6. Controlled fuzzy match (only for query tokens >= 4 characters)
  // All query words must have a valid match in candidate's name (exact word, prefix, or Levenshtein distance <= 1 or 2)
  if (qClean.length >= 4) {
    const allWordsMatch = qWords.every(qw => {
      if (nameWords.includes(qw)) return true;
      if (nameWords.some(nw => nw.startsWith(qw))) return true;
      if (qw.length >= 4) {
        const maxDist = qw.length <= 5 ? 1 : 2;
        return nameWords.some(nw => {
          if (nw.length < 4) return false;
          const dist = computeLevenshtein(qw, nw);
          return dist <= maxDist && (1 - (dist / Math.max(qw.length, nw.length))) >= 0.78;
        });
      }
      return false;
    });

    if (allWordsMatch) {
      return { isMatch: true, matchType: 'Similar Match', priority: 200, reason: 'Close name match' };
    }
  }

  return { isMatch: false, matchType: '', priority: 0, reason: '' };
}

function loadAllCandidateRecords(dir: string): AllotmentCandidateRecord[] {
  if (cachedCandidateRecords) return cachedCandidateRecords;
  if (!fs.existsSync(dir)) return [];

  const excluded = ['index.json', 'manifest.json', 'predictor_index.json', 'search_index.json'];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !excluded.includes(f));
  const list: AllotmentCandidateRecord[] = [];

  for (const filename of files) {
    try {
      const filePath = path.join(dir, filename);
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      const collegeCode = (data.collegeCode || filename.replace('.json', '')).trim();
      const collegeName = (data.collegeName || collegeCode).trim();
      const branches = Array.isArray(data.branches) ? data.branches : (Array.isArray(data) ? data : [data]);

      for (const branch of branches) {
        const branchCode = (branch.branchCode || 'ENGG').trim();
        const branchName = (branch.branchName || branchCode).trim();
        const records = Array.isArray(branch.records) ? branch.records : [];

        for (const r of records) {
          const rawName = (r.name || '').trim();
          const normName = normalizeSearchText(rawName);
          list.push({
            rank: typeof r.rank === 'number' ? r.rank : parseInt(r.rank, 10) || 0,
            name: rawName,
            normalizedName: normName,
            nameWords: normName ? normName.split(' ') : [],
            gender: r.gender || '',
            caste: r.caste || '',
            seatCategory: r.seatCategory || '',
            region: r.region || 'OU',
            hallTicket: r.hallTicket || '',
            collegeCode,
            collegeName,
            branchCode,
            branchName,
            phase: r.phase || '2026 Final Phase',
            sourceFile: filename
          });
        }
      }
    } catch (e) {
      console.error(`[loadAllCandidateRecords] Failed to read ${filename}:`, e);
    }
  }

  cachedCandidateRecords = list;
  console.log(`[loadAllCandidateRecords] In-memory index ready: ${list.length} candidate records cached across ${files.length} colleges.`);
  return list;
}

function tgAllotmentPlugin(): Plugin {
  return {
    name: 'tg-allotment-plugin',
    configureServer(server) {
      const allotmentDir = path.join(__dirname, 'public/TG_EAPCET_2026_ALLOTMENT');

      // Preload in-memory records on background start
      setTimeout(() => {
        try {
          loadAllCandidateRecords(allotmentDir);
        } catch (err) {
          console.warn('[tgAllotmentPlugin] Background index preload error:', err);
        }
      }, 50);

      server.middlewares.use('/api/tg-allotment/manifest', (_req, res) => {
        try {
          const result = scanAllotmentDir(allotmentDir);
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

      // Lightning-fast Candidate Search across all 151 Telangana Colleges with multi-mode filters
      server.middlewares.use('/api/tg-allotment/search', (req, res) => {
        try {
          const parsedUrl = new URL(req.url || '', 'http://localhost');
          const q = (parsedUrl.searchParams.get('q') || '').trim();
          const collegeFilter = (parsedUrl.searchParams.get('college') || 'ALL').trim().toUpperCase();
          const branchFilter = (parsedUrl.searchParams.get('branch') || 'ALL').trim().toUpperCase();
          const genderFilter = (parsedUrl.searchParams.get('gender') || 'ALL').trim().toUpperCase();
          const casteFilter = (parsedUrl.searchParams.get('caste') || 'ALL').trim().toUpperCase();
          const categoryFilter = (parsedUrl.searchParams.get('category') || 'ALL').trim().toUpperCase();
          const sortParam = (parsedUrl.searchParams.get('sort') || 'rank_asc').trim().toLowerCase();
          const limitParam = parseInt(parsedUrl.searchParams.get('limit') || '500', 10);

          const allRecords = loadAllCandidateRecords(allotmentDir);

          // If no query and no college/branch filters, return clean initial state
          if (!q && collegeFilter === 'ALL' && branchFilter === 'ALL') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              query: q,
              college: collegeFilter,
              branch: branchFilter,
              totalMatches: 0,
              results: [],
              stats: { collegeCount: 0, branchCount: 0, minRank: 0, maxRank: 0 }
            }));
            return;
          }

          const matched: any[] = [];
          const collegesSet = new Set<string>();
          const branchesSet = new Set<string>();
          const casteCountMap: Record<string, number> = {};
          let minObservedRank = 999999;
          let maxObservedRank = 0;

          for (let i = 0; i < allRecords.length; i++) {
            const cand = allRecords[i];

            // 1. College filter
            if (collegeFilter !== 'ALL' && cand.collegeCode.toUpperCase() !== collegeFilter) {
              continue;
            }

            // 2. Branch filter
            if (branchFilter !== 'ALL' && cand.branchCode.toUpperCase() !== branchFilter) {
              continue;
            }

            // 3. Gender filter
            if (genderFilter !== 'ALL' && cand.gender.toUpperCase() !== genderFilter) {
              continue;
            }

            // 4. Caste filter
            if (casteFilter !== 'ALL' && cand.caste.toUpperCase() !== casteFilter) {
              continue;
            }

            // 5. Seat category filter
            if (categoryFilter !== 'ALL' && cand.seatCategory.toUpperCase() !== categoryFilter) {
              continue;
            }

            // 6. Query matching
            const evalResult = evaluateCandidateMatch(cand, q);
            if (!evalResult.isMatch) {
              continue;
            }

            collegesSet.add(cand.collegeCode);
            branchesSet.add(cand.branchCode);
            if (cand.caste) {
              casteCountMap[cand.caste] = (casteCountMap[cand.caste] || 0) + 1;
            }
            if (cand.rank > 0 && cand.rank < minObservedRank) minObservedRank = cand.rank;
            if (cand.rank > maxObservedRank) maxObservedRank = cand.rank;

            matched.push({
              rank: cand.rank,
              name: cand.name,
              gender: cand.gender,
              caste: cand.caste,
              seatCategory: cand.seatCategory,
              region: cand.region,
              hallTicket: cand.hallTicket,
              collegeCode: cand.collegeCode,
              collegeName: cand.collegeName,
              branchCode: cand.branchCode,
              branchName: cand.branchName,
              phase: cand.phase,
              sourceFile: cand.sourceFile,
              matchType: evalResult.matchType,
              matchPriority: evalResult.priority,
              matchReason: evalResult.reason
            });
          }

          // Sorting: Priority first for non-empty search queries, then user-selected order
          matched.sort((a, b) => {
            if (q) {
              // Exact matches precede partial, partial precede similar
              if (b.matchPriority !== a.matchPriority) {
                return b.matchPriority - a.matchPriority;
              }
            }

            if (sortParam === 'rank_asc') return a.rank - b.rank;
            if (sortParam === 'rank_desc') return b.rank - a.rank;
            if (sortParam === 'name_asc') return a.name.localeCompare(b.name);
            if (sortParam === 'college_asc') return a.collegeName.localeCompare(b.collegeName);
            return a.rank - b.rank;
          });

          const totalMatches = matched.length;
          const cappedResults = matched.slice(0, Math.min(limitParam, 1000));

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            query: q,
            college: collegeFilter,
            branch: branchFilter,
            totalMatches,
            results: cappedResults,
            stats: {
              collegeCount: collegesSet.size,
              branchCount: branchesSet.size,
              minRank: minObservedRank === 999999 ? 0 : minObservedRank,
              maxRank: maxObservedRank,
              castes: Object.entries(casteCountMap).map(([caste, count]) => ({ caste, count }))
            }
          }));
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

      // Gemini AI Student Gap Analyzer Advisor API
      server.middlewares.use('/api/gemini/gap-analysis', (req, res) => {
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

        const handleGapPayload = async (data: any) => {
          try {
            const { studentProfile, gapAnalysisResult } = data || {};
            const strengthsText = gapAnalysisResult?.strengths?.map((s: any) => s.title).slice(0, 3).join(', ') || 'your verified foundations';
            const topPriority = gapAnalysisResult?.topPriorities?.[0]?.skillName || 'core problem solving';
            const nextAction = gapAnalysisResult?.nextActions?.[0] || 'solving fundamental problems';

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({
                success: true,
                mentorNote: `Your established proficiency in ${strengthsText} gives you a solid competitive edge for a ${studentProfile?.year || 'current'} student. Dedicate 45 minutes daily to ${topPriority} by ${nextAction}, and you will see your placement readiness surge before your next semester.`
              }));
              return;
            }

            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey });

            const prompt = `You are a friendly, pragmatic Senior Placement Advisor & Tech Career Mentor for Indian engineering students on Man of Study.
Student Profile:
Year: ${studentProfile?.year || '1st Year'}, Branch: ${studentProfile?.branch || 'CSE'}, CGPA: ${studentProfile?.cgpa || '8.0'}
Target Career: ${gapAnalysisResult?.careerTitle || 'Software Developer'}
Match Score: ${gapAnalysisResult?.matchScore || 50}%
Identified Strengths: ${strengthsText}
Top 3 Priorities: ${gapAnalysisResult?.topPriorities?.map((p: any) => p.skillName).join(', ') || 'DSA, SQL, OOP'}
Immediate Next Actions: ${gapAnalysisResult?.nextActions?.join(', ') || 'Learn arrays, solve 5 problems'}

Write a 3-sentence executive mentor brief (under 75 words) speaking directly to the student in second person ("You"):
1. Acknowledge their genuine current strengths and the edge it provides.
2. Give clear, calm direction on tackling their #1 priority without panic.
3. Give an encouraging, realistic closing goal for this semester.`;

            let mentorNote = '';
            const candidateModels = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
            for (const model of candidateModels) {
              try {
                const result = await ai.models.generateContent({
                  model,
                  contents: prompt,
                });
                if (result && result.text) {
                  mentorNote = result.text.trim();
                  break;
                }
              } catch (err: any) {
                console.warn(`[Gemini Gap Analysis] Model ${model} failed, trying next:`, err.status || err.message);
              }
            }

            if (!mentorNote) {
              mentorNote = `Your established proficiency in ${strengthsText} gives you a solid competitive edge for a ${studentProfile?.year || 'current'} student. Dedicate 45 minutes daily to ${topPriority} by ${nextAction}, and you will see your placement readiness surge before your next semester.`;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: true, mentorNote }));
          } catch (err: any) {
            console.error('[geminiGapAnalysis] error:', err);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              success: true,
              mentorNote: 'Build steady momentum on your top priority daily. With structured focus, small daily milestones compound rapidly into interview-ready confidence.'
            }));
          }
        };

        if ((req as any).body) {
          handleGapPayload((req as any).body);
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf-8');
            const data = JSON.parse(raw);
            handleGapPayload(data);
          } catch (e: any) {
            handleGapPayload({});
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
