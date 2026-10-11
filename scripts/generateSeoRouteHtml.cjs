/**
 * Generate route-specific HTML entry points for the public SEO landing pages.
 *
 * Vite's SPA build normally emits only dist/index.html. These copies ensure
 * each supported SEO URL ships its own title, description, canonical, Open
 * Graph and Twitter metadata in the initial HTML response, before React runs.
 * The client application still owns the interactive page UI and routing.
 *
 * This script intentionally includes only routes implemented in src/App.tsx.
 * Do not add a URL here unless it is a real, public, canonical page.
 */
const fs = require('node:fs');
const path = require('node:path');

const distDir = path.resolve(process.cwd(), 'dist');
const sourceHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(sourceHtmlPath)) {
  console.error('[SEO] dist/index.html was not found. Run this script after vite build.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(sourceHtmlPath, 'utf8');

const routes = [
  {
    path: '/ap-eapcet/college-wise-allotments/',
    title: 'AP EAPCET 2026 College-Wise Allotments | Naa College',
    description: 'Explore AP EAPCET engineering allotment records by college and branch with the Naa College allotment explorer.',
  },
  {
    path: '/tg-eapcet/name-wise-allotments/',
    title: 'TG EAPCET 2026 Name-Wise Seat Allotments | Naa College',
    description: 'Search Telangana EAPCET 2026 final-phase engineering seat allotment records by student name, hall ticket, college and branch.',
  },
  {
    path: '/ap-eapcet/college-predictor/',
    title: 'AP EAPCET College Predictor 2026 | Naa College',
    description: 'Explore AP EAPCET college and branch options based on rank, category, gender, region and preferences.',
  },
  {
    path: '/tg-eapcet/college-predictor/',
    title: 'TG EAPCET College Predictor 2026 | Naa College',
    description: 'Explore Telangana EAPCET college and branch options based on rank, category, gender and preferences.',
  },
  {
    path: '/tools/attendance-calculator/',
    title: 'Attendance Calculator & Bunk Planner | Naa College',
    description: 'Calculate current attendance, estimate classes you can miss, and find how many classes you need to attend to reach your target.',
  },
  {
    path: '/tools/gpa-calculator/',
    title: 'CGPA, SGPA & Percentage Calculator | Naa College',
    description: 'Explore CGPA and percentage conversions and plan a target SGPA. Check your university rules before using results officially.',
  },
  {
    path: '/engineering-roadmaps/',
    title: 'Engineering Branch Roadmaps for B.Tech Students | Naa College',
    description: 'Explore semester-by-semester engineering branch roadmaps with learning topics, project direction and career preparation guidance.',
  },
];

// Generate one crawlable static HTML entry point per scholarship record.
// The React detail page reads the same JSON dataset, keeping routes and content aligned.
const scholarshipDataPath = path.resolve(process.cwd(), 'public/indian_scholarships.json');
if (fs.existsSync(scholarshipDataPath)) {
  const scholarshipRecords = JSON.parse(fs.readFileSync(scholarshipDataPath, 'utf8'));
  const slugify = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const usedSlugs = new Set();
  scholarshipRecords.forEach((scholarship) => {
    const slug = slugify(scholarship.title);
    if (!slug || usedSlugs.has(slug)) {
      throw new Error('[SEO] Missing or duplicate scholarship slug for: ' + (scholarship.title || scholarship.id));
    }
    usedSlugs.add(slug);
    const title = scholarship.title + ': Eligibility, Benefits & Application | Naa College';
    const description = (scholarship.title + ' — review the listed benefit, eligibility summary, application timeline and source links on Naa College. Confirm current rules with the scheme provider.').slice(0, 158);
    routes.push({ path: '/scholarships/' + slug + '/', title, description });
  });
} else {
  console.warn('[SEO] Scholarship JSON not found; individual scholarship HTML routes were not generated.');
}

function escapeAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setMeta(html, attribute, key, content) {
  const safeContent = escapeAttribute(content);
  const tagPattern = new RegExp(
    "<meta\\b(?=[^>]*\\b" + attribute + "=[\"']" + key + "[\"'])[^>]*>",
    "i"
  );
  const existing = html.match(tagPattern);
  const replacement = existing
    ? existing[0].replace(/\bcontent=(["'])[^"']*\1/i, 'content="' + safeContent + '"')
    : '<meta ' + attribute + '="' + key + '" content="' + safeContent + '" />';
  return existing
    ? html.replace(tagPattern, replacement)
    : html.replace('</head>', '    ' + replacement + '\n  </head>');
}

function setCanonical(html, url) {
  const safeUrl = escapeAttribute(url);
  const pattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
  const replacement = '<link rel="canonical" href="' + safeUrl + '" />';
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', '    ' + replacement + '\n  </head>');
}

function buildRouteHtml(route) {
  const canonical = 'https://naacollege.in' + route.path;
  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>' + escapeAttribute(route.title) + '</title>');
  html = setMeta(html, 'name', 'description', route.description);
  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);
  html = setMeta(html, 'name', 'twitter:url', canonical);
  html = setCanonical(html, canonical);

  const routeDir = path.join(distDir, route.path.replace(/^\/+|\/+$/g, ''));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');

  const titleOk = html.includes('<title>' + escapeAttribute(route.title) + '</title>');
  const canonicalOk = html.includes('<link rel="canonical" href="' + canonical + '" />');
  if (!titleOk || !canonicalOk) {
    throw new Error('Could not write expected metadata for ' + route.path);
  }
  console.log('[SEO] Generated route-specific metadata: ' + route.path);
}

for (const route of routes) buildRouteHtml(route);

// Keep the deployed sitemap aligned with the exact static routes generated above.
const xmlEscape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => '  <url><loc>' + xmlEscape('https://naacollege.in' + route.path) + '</loc></url>'),
  '</urlset>',
].join('\\n') + '\\n';
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('[SEO] Generated ' + routes.length + ' static SEO route entry points and refreshed sitemap.xml.');
