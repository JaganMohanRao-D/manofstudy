/**
 * Regression checks for static SEO HTML emitted by the production build.
 * Character floors are blank-output safety checks, not Google word-count rules.
 * Content quality still requires editorial judgement and accurate, useful material.
 */
const fs = require('node:fs');
const path = require('node:path');

const dist = path.resolve(process.cwd(), 'dist');
const sitemapPath = path.join(dist, 'sitemap.xml');
const rootPath = path.join(dist, 'index.html');
const SITE = 'https://naacollege.in';

function fail(message) {
  console.error('[SEO verify] FAIL: ' + message);
  process.exitCode = 1;
}
function decodeEntities(value) {
  return String(value).replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&nbsp;|&#160;/gi, ' ');
}
if (!fs.existsSync(rootPath)) {
  fail('dist/index.html is missing');
  process.exit(1);
}
if (!fs.existsSync(sitemapPath)) {
  fail('dist/sitemap.xml is missing');
  process.exit(1);
}

const sitemapText = fs.readFileSync(sitemapPath, 'utf8');
const urls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => decodeEntities(match[1].trim()));
if (!urls.includes(SITE + '/')) fail('sitemap does not include the canonical homepage');
if (!urls.length) fail('sitemap contains no URLs');

const urlSet = new Set();
for (const url of urls) {
  if (urlSet.has(url)) fail('duplicate sitemap URL: ' + url);
  urlSet.add(url);
  let parsed;
  try { parsed = new URL(url); } catch { fail('invalid sitemap URL: ' + url); continue; }
  if (parsed.origin !== SITE) fail('unexpected non-canonical origin in sitemap: ' + url);
  if (parsed.search || parsed.hash) fail('sitemap URL contains query/hash: ' + url);
  if (parsed.pathname !== '/' && !parsed.pathname.endsWith('/')) {
    fail('non-root sitemap URL must use the canonical trailing slash: ' + url);
  }
}

const requiredUrls = [
  '/', '/about/', '/contact-us/', '/privacy-policy/', '/terms-of-service/',
  '/legal-safe-harbor/', '/scholarships/', '/blog/',
  '/ap-eapcet/college-wise-allotments/', '/tg-eapcet/name-wise-allotments/',
  '/ap-eapcet/college-predictor/', '/tg-eapcet/college-predictor/',
  '/tools/attendance-calculator/', '/tools/gpa-calculator/', '/engineering-roadmaps/'
];
for (const requiredPath of requiredUrls) {
  if (!urlSet.has(SITE + requiredPath)) fail('required public route missing from sitemap: ' + requiredPath);
}
const scholarshipUrls = urls.filter((url) => /^https:\/\/naacollege\.in\/scholarships\/[^/]+\/$/.test(url));
const blogArticleUrls = urls.filter((url) => /^https:\/\/naacollege\.in\/blog\/(?!category\/)[^/]+\/$/.test(url) && !url.endsWith('/blog/'));
if (scholarshipUrls.length < 40) fail('expected at least 40 individually generated scholarship records; found ' + scholarshipUrls.length);
if (blogArticleUrls.length < 39) fail('expected at least 39 published blog article URLs after adding four English articles; found ' + blogArticleUrls.length);
const requiredEditorialBlogSlugs = [
  'cse-core-vs-ai-ml-vs-data-science-vs-cyber-security',
  'top-mistakes-to-avoid-during-eapcet-web-options-and-counselling',
  'top-engineering-colleges-in-andhra-pradesh-telangana',
  'how-to-score-a-9-sgpa-in-b-tech-first-year',
  'c-programming-and-data-structures-roadmap-for-absolute-beginners',
  'autonomous-colleges-vs-jntu-au-affiliated-colleges',
  'how-to-land-your-first-tech-internship-in-2nd-year',
  'chatgpt-vs-claude-which-ai-is-better-for-students',
  'gemini-vs-chatgpt-vs-grok-meta-ai-vs-claude',
  'how-to-join-iiit-hyderabad-without-jee-main-ugee',
  'github-basics-for-beginners-complete-guide'
];
for (const slug of requiredEditorialBlogSlugs) {
  if (!urlSet.has(SITE + '/blog/' + slug + '/')) fail('new editorial blog route missing from sitemap: ' + slug);
}

const seenTitles = new Map();
function minimumVisibleChars(url, pathname) {
  if (pathname === '/') return 500;
  if (/^\/scholarships\/$/.test(pathname)) return 1500;
  if (/^\/scholarships\/.+\/$/.test(pathname)) return 600;
  if (/^\/blog\/category\/.+\/$/.test(pathname)) return 700;
  if (/^\/blog\/[^/]+\/$/.test(pathname) && !pathname.endsWith('/blog/')) return 1200;
  if (pathname === '/blog/') return 1600;
  if (/^\/(about|contact-us|privacy-policy|terms-of-service|legal-safe-harbor)\/$/.test(pathname)) return 650;
  return 220;
}
function checkPage(filePath, expectedCanonical, label, pathname) {
  if (!fs.existsSync(filePath)) {
    fail(label + ': generated HTML file is missing (' + filePath + ')');
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  const canonicals = [...html.matchAll(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (titles.length !== 1 || !titles[0][1].trim()) fail(label + ': expected exactly one non-empty title');
  if (canonicals.length !== 1 || canonicals[0][1] !== expectedCanonical) fail(label + ': canonical is missing, duplicated, or mismatched');
  if (titles.length === 1) {
    const title = decodeEntities(titles[0][1].trim());
    const other = seenTitles.get(title);
    if (other && other !== expectedCanonical) fail(label + ': duplicate title also used by ' + other);
    else seenTitles.set(title, expectedCanonical);
  }
  if (/id=["']seo-prerender["']/i.test(html)) fail(label + ': hidden SEO prerender markup detected');
  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.toLowerCase().lastIndexOf('</body>');
  if (rootStart < 0 || bodyEnd < rootStart) {
    fail(label + ': root container or body boundary is missing');
    return;
  }
  const rootHtml = html.slice(rootStart, bodyEnd)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  if (/display\s*:\s*none/i.test(rootHtml)) fail(label + ': root contains hidden content in place of visible page text');
  const h1Count = [...rootHtml.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)].length;
  if (h1Count !== 1) fail(label + ': expected exactly one initial h1; found ' + h1Count);
  const visibleText = decodeEntities(rootHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  const minChars = minimumVisibleChars(expectedCanonical, pathname);
  if (visibleText.length < minChars) {
    fail(label + ': initial visible content is only ' + visibleText.length + ' characters; expected at least ' + minChars + ' as a blank-output sanity check');
  }
}

checkPage(rootPath, SITE + '/', 'homepage', '/');
for (const url of urls) {
  if (url === SITE + '/') continue;
  let parsed;
  try { parsed = new URL(url); } catch { continue; }
  if (parsed.origin !== SITE) continue;
  const route = parsed.pathname.replace(/^\/+|\/+$/g, '');
  const filePath = route ? path.join(dist, route, 'index.html') : rootPath;
  checkPage(filePath, url, parsed.pathname || '/', parsed.pathname || '/');
}

if (process.exitCode) {
  console.error('[SEO verify] Generated HTML checks failed.');
} else {
  console.log('[SEO verify] Passed: ' + urls.length + ' unique sitemap URLs have generated, route-specific HTML, a unique title, canonical, one H1, and visible initial content.');
}
