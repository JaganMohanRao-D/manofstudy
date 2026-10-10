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
    '<meta\\b(?=[^>]*\\b' + attribute + '=["\\']' + key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&') + '["\\'])[^>]*>',
    'i'
  );
  const existing = html.match(tagPattern);
  const replacement = existing
    ? (existing[0].includes('content=')
      ? existing[0].replace(/\\bcontent=(["'])[^"']*\\1/i, 'content="' + safeContent + '"')
      : existing[0].replace(/\\s*\\/?>(?=$)/, ' content="' + safeContent + '">'))
    : '<meta ' + attribute + '="' + key + '" content="' + safeContent + '" />';
  return existing ? html.replace(tagPattern, replacement) : html.replace('</head>', '    ' + replacement + '\\n  </head>');
}

function setCanonical(html, url) {
  const safeUrl = escapeAttribute(url);
  const pattern = /<link\\b(?=[^>]*\\brel=["']canonical["'])[^>]*>/i;
  const replacement = '<link rel="canonical" href="' + safeUrl + '" />';
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', '    ' + replacement + '\\n  </head>');
}

function buildRouteHtml(route) {
  const canonical = 'https://naacollege.in' + route.path;
  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\\/title>/i, '<title>' + escapeAttribute(route.title) + '</title>');
  html = setMeta(html, 'name', 'description', route.description);
  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);
  html = setMeta(html, 'name', 'twitter:url', canonical);
  html = setCanonical(html, canonical);

  const routeDir = path.join(distDir, route.path.replace(/^\\/+|\\/+$/g, ''));
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
console.log('[SEO] Generated ' + routes.length + ' static SEO route entry points.');
