/**
 * Regression checks for the static SEO HTML generated during the production build.
 * The text-length assertion is only a blank-output sanity check; it is not a Google
 * word-count requirement and does not determine whether content is valuable.
 */
const fs = require('node:fs');
const path = require('node:path');

const dist = path.resolve(process.cwd(), 'dist');
const sitemapPath = path.join(dist, 'sitemap.xml');
const rootPath = path.join(dist, 'index.html');

function fail(message) {
  console.error('[SEO verify] FAIL: ' + message);
  process.exitCode = 1;
}

if (!fs.existsSync(rootPath)) {
  fail('dist/index.html is missing');
  process.exit(1);
}
if (!fs.existsSync(sitemapPath)) {
  fail('dist/sitemap.xml is missing');
  process.exit(1);
}

const urls = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => match[1].replace(/&amp;/g, '&'));
if (!urls.includes('https://naacollege.in/')) {
  fail('sitemap does not include the canonical homepage');
}

function checkPage(filePath, expectedCanonical, label) {
  if (!fs.existsSync(filePath)) {
    fail(label + ': generated HTML file is missing (' + filePath + ')');
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  const canonicals = [...html.matchAll(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (titles.length !== 1 || !titles[0][1].trim()) fail(label + ': expected exactly one non-empty title');
  if (canonicals.length !== 1 || canonicals[0][1] !== expectedCanonical) fail(label + ': canonical is missing, duplicated, or mismatched');
  if (/id=["']seo-prerender["']/i.test(html)) fail(label + ': hidden SEO prerender markup detected');
  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.toLowerCase().lastIndexOf('</body>');
  if (rootStart < 0 || bodyEnd < rootStart) {
    fail(label + ': root container or body boundary is missing');
    return;
  }
  const rootHtml = html.slice(rootStart, bodyEnd).replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(rootHtml)) fail(label + ': no initial h1 found in the application root');
  const visibleText = rootHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  if (visibleText.length < 80) fail(label + ': initial root content appears blank or incomplete (sanity check only, not a Google word-count rule)');
}

checkPage(rootPath, 'https://naacollege.in/', 'homepage');

for (const url of urls) {
  if (url === 'https://naacollege.in/') continue;
  let parsed;
  try { parsed = new URL(url); } catch { fail('invalid sitemap URL: ' + url); continue; }
  if (parsed.origin !== 'https://naacollege.in') {
    fail('unexpected non-canonical origin in sitemap: ' + url);
    continue;
  }
  const route = parsed.pathname.replace(/^\\/+|\\/+$/g, '');
  const filePath = route ? path.join(dist, route, 'index.html') : rootPath;
  checkPage(filePath, url, parsed.pathname || '/');
}
if (process.exitCode) {
  console.error('[SEO verify] Generated HTML checks failed.');
} else {
  console.log('[SEO verify] Passed: ' + urls.length + ' sitemap URLs have generated, route-specific HTML, a title, canonical, and initial visible content.');
}
