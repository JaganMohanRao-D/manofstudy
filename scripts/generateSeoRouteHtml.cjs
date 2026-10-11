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
    .replace(/[\u0300-\u036f]/g, '')
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


// Blog routes share the same typed editorial JSON used by the React UI.
// Only published articles become public URLs or sitemap entries.
const blogDataPath = path.resolve(process.cwd(), 'src/data/blogArticles.json');
const blogArticles = fs.existsSync(blogDataPath)
  ? JSON.parse(fs.readFileSync(blogDataPath, 'utf8'))
  : [];
const publishedBlogArticles = blogArticles.filter((article) => article.status === 'published');
const slugifyBlogCategory = (value) => String(value || '').toLowerCase()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const htmlEscape = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const inlineStatic = (value) => htmlEscape(value)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
  .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const renderStaticArticle = (article) => {
  const blocks = String(article.content || '').trim().split(/\n\s*\n/);
  const body = blocks.map((raw) => {
    const block = raw.trim();
    if (!block) return '';
    if (block.startsWith('## ')) return '<h2>' + inlineStatic(block.slice(3)) + '</h2>';
    if (block.startsWith('> ')) return '<blockquote>' + inlineStatic(block.slice(2).replace(/\n> /g, ' ')) + '</blockquote>';
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.every((line) => line.startsWith('- '))) {
      return '<ul>' + lines.map((line) => '<li>' + inlineStatic(line.slice(2)) + '</li>').join('') + '</ul>';
    }
    if (lines.every((line) => /^\d+\.\s/.test(line))) {
      return '<ol>' + lines.map((line) => '<li>' + inlineStatic(line.replace(/^\d+\.\s/, '')) + '</li>').join('') + '</ol>';
    }
    return '<p>' + inlineStatic(block.replace(/\n/g, ' ')) + '</p>';
  }).join('\n');
  return '<article><p><a href="/blog/">Naa College Blog</a> / ' + htmlEscape(article.category) +
    '</p><h1>' + htmlEscape(article.title) + '</h1><p>' + htmlEscape(article.summary) +
    '</p><p>Updated ' + htmlEscape(article.updatedAt) + ' · By Naa College</p>' + body +
    (article.sources && article.sources.length ? '<h2>Official and reference sources</h2><ul>' +
      article.sources.map((source) => '<li><a href="' + htmlEscape(source.url) + '" rel="noopener noreferrer">' + htmlEscape(source.label) + '</a></li>').join('') + '</ul>' : '') +
    '<p>Educational information only. Verify time-sensitive details with the relevant official authority or product documentation.</p></article>';
};
const blogListingBody = (title, description, list) =>
  '<section><h1>' + htmlEscape(title) + '</h1><p>' + htmlEscape(description) + '</p><nav aria-label="Blog categories"><ul>' +
  Array.from(new Set(publishedBlogArticles.map((article) => article.category))).map((category) =>
    '<li><a href="/blog/category/' + slugifyBlogCategory(category) + '/">' + htmlEscape(category) + '</a></li>').join('') +
  '</ul></nav><h2>Published guides</h2><ul>' + list.map((article) =>
    '<li><article><h3><a href="/blog/' + htmlEscape(article.slug) + '/">' + htmlEscape(article.title) +
    '</a></h3><p>' + htmlEscape(article.summary) + '</p><p>' + htmlEscape(article.category) + ' · ' +
    Math.max(2, Math.ceil(String(article.content || '').trim().split(/\s+/).filter(Boolean).length / 220)) + ' min read</p></article></li>').join('') +
  '</ul></section>';
routes.push({
  path: '/blog/',
  title: 'Student Blog & Knowledge Hub | Naa College',
  description: 'Practical guides for EAPCET counselling, student tools, scholarships, programming, and responsible AI-assisted development.',
  staticBody: blogListingBody('Naa College Blog & Student Knowledge Hub', 'Practical, student-focused guides for admissions, tools, scholarships, programming, and responsible AI-assisted development.', publishedBlogArticles),
  schema: { '@context': 'https://schema.org', '@type': 'Blog', name: 'Naa College Blog', url: 'https://naacollege.in/blog/' }
});
const blogCategories = Array.from(new Set(publishedBlogArticles.map((article) => article.category)));
blogCategories.forEach((category) => {
  const slug = slugifyBlogCategory(category);
  const categoryArticles = publishedBlogArticles.filter((article) => article.category === category);
  routes.push({
    path: '/blog/category/' + slug + '/',
    title: category + ' Guides | Naa College Blog',
    description: ('Practical student-focused guides in ' + category + ' from Naa College.').slice(0, 158),
    staticBody: blogListingBody(category + ' Guides', 'Published Naa College articles in ' + category + '.', categoryArticles),
    schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: category + ' Guides', url: 'https://naacollege.in/blog/category/' + slug + '/' }
  });
});
publishedBlogArticles.forEach((article) => {
  const canonical = 'https://naacollege.in/blog/' + article.slug + '/';
  routes.push({
    path: '/blog/' + article.slug + '/',
    title: article.title + ' | Naa College',
    description: String(article.summary || '').slice(0, 158),
    staticBody: renderStaticArticle(article),
    schema: {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title,
      description: article.summary, datePublished: article.publishedAt, dateModified: article.updatedAt,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'Naa College', url: 'https://naacollege.in/' },
      publisher: { '@type': 'Organization', name: 'Naa College', url: 'https://naacollege.in/' }
    }
  });
});

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
  if (route.schema) {
    const schemaTag = '<script type="application/ld+json" data-generated-blog-schema>' + JSON.stringify(route.schema).replace(/</g, '\\u003c') + '</script>';
    html = html.replace('</head>', '    ' + schemaTag + '\n  </head>');
  }
  if (route.staticBody) {
    html = html.replace('<div id="root"></div>', '<div id="root">' + route.staticBody + '</div>');
  }

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
  '  <url><loc>https://naacollege.in/</loc></url>',
  ...routes.map((route) => '  <url><loc>' + xmlEscape('https://naacollege.in' + route.path) + '</loc></url>'),
  '</urlset>',
].join('\n') + '\n';
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('[SEO] Generated ' + routes.length + ' static SEO route entry points and refreshed sitemap.xml.');
