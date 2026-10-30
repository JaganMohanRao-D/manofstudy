const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();

function readJson(relativePath) {
  const filePath = path.resolve(root, relativePath);
  if (!fs.existsSync(filePath)) throw new Error('[Blog] Required file is missing: ' + relativePath);
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (error) { throw new Error('[Blog] Invalid JSON in ' + relativePath + ': ' + error.message); }
}

const baseline = readJson('src/data/blogArticles.json');
const editorial = readJson('src/data/editorialBlogArticles.generated.json');
const sourcePaths = [
  'src/data/01_cse_core_vs_specializations_blog.json',
  'src/data/blog_01_cse_core_vs_specializations.json',
  'src/data/blog_03_eapcet_web_options_mistakes.json',
  'src/data/blog_04_top_engineering_colleges_ap_tg.json',
  'src/data/blog_05_score_9_sgpa_first_year.json',
  'src/data/blog_06_c_programming_dsa_roadmap.json',
  'src/data/blog_08_autonomous_vs_affiliated.json',
  'src/data/blog_10_first_tech_internship_second_year.json',
  'src/data/blog-1-chatgpt-vs-claude.json',
  'src/data/blog-2-gemini-chatgpt-grok-meta-claude.json',
  'src/data/blog-3-iiit-hyderabad-admission-ugee.json',
  'src/data/blog-4-github-basics.json'
];
for (const sourcePath of sourcePaths) readJson(sourcePath);

if (!Array.isArray(baseline) || baseline.length === 0) throw new Error('[Blog] Existing article data must be a non-empty array.');
if (!Array.isArray(editorial) || editorial.length !== 12) {
  throw new Error('[Blog] Expected twelve normalized editorial articles; found ' + (editorial?.length ?? 'invalid data'));
}

const articles = [...baseline, ...editorial];
const requiredEnglishBlogs = [
  { slug: 'chatgpt-vs-claude-which-ai-is-better-for-students', path: 'src/data/blog-1-chatgpt-vs-claude.json' },
  { slug: 'gemini-vs-chatgpt-vs-grok-vs-meta-ai-vs-claude', path: 'src/data/blog-2-gemini-chatgpt-grok-meta-claude.json' },
  { slug: 'how-to-join-iiit-hyderabad-without-jee-main-ugee', path: 'src/data/blog-3-iiit-hyderabad-admission-ugee.json' },
  { slug: 'github-basics-for-beginners-complete-guide', path: 'src/data/blog-4-github-basics.json' }
];
for (const expected of requiredEnglishBlogs) {
  const source = readJson(expected.path);
  const article = editorial.find((item) => item.slug === expected.slug);
  if (source.slug !== expected.slug || !source.meta_title || !source.meta_description) {
    throw new Error('[Blog] English source/SEO metadata is invalid: ' + expected.path);
  }
  if (!article) throw new Error('[Blog] New English article was not integrated: ' + expected.slug);
  if (!article.metaTitle || !article.metaDescription) throw new Error('[Blog] SEO metadata missing after normalization: ' + expected.slug);
  if (/[\u0C00-\u0C7F]/.test([article.title, article.summary, article.content].join(' '))) {
    throw new Error('[Blog] New article must remain English-only: ' + expected.slug);
  }
  if ((article.sources || []).length !== 0) throw new Error('[Blog] Third-party source lists must not be rendered: ' + expected.slug);
}
const viteeeArticle = editorial.find((item) => item.slug === 'viteee-2027-complete-exam-details');
if (!viteeeArticle || viteeeArticle.status !== 'published' ||
    viteeeArticle.coverImage !== '/Scholorship_images/VITEEE%202027%20Exam%20Update.webp' ||
    !viteeeArticle.metaTitle || !viteeeArticle.metaDescription) {
  throw new Error('[Blog] VITEEE 2027 article or its cover-image metadata is missing.');
}
const viteeeImagePath = path.resolve(root, 'public', viteeeArticle.coverImage.replace(/^\\//, '').replace(/%20/g, ' '));
if (!fs.existsSync(viteeeImagePath)) throw new Error('[Blog] VITEEE cover image is missing: ' + viteeeImagePath);

const slugs = new Set();
const errors = [];
for (const article of articles) {
  if (!article || typeof article !== 'object') { errors.push('Article entry is not an object.'); continue; }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '')) errors.push('Invalid slug: ' + (article.slug || '(missing)'));
  if (slugs.has(article.slug)) errors.push('Duplicate slug: ' + article.slug);
  slugs.add(article.slug);
  if (!article.title || !article.summary || !article.category || !article.content) errors.push('Missing required content fields: ' + article.slug);
  if (!['published', 'draft'].includes(article.status)) errors.push('Invalid publication status: ' + article.slug);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt || '') || !/^\d{4}-\d{2}-\d{2}$/.test(article.updatedAt || '')) {
    errors.push('Invalid publication/update date: ' + article.slug);
  }
  if (article.status === 'published') {
    const content = String(article.content || '').trim();
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const headingCount = (content.match(/^##\s+.+$/gm) || []).length;
    if (content.length < 1200 || wordCount < 250) errors.push('Published article needs more substantive content: ' + article.slug + ' (' + wordCount + ' words).');
    if (headingCount < 4) errors.push('Published article needs at least four H2 sections: ' + article.slug);
  }
  if (!Array.isArray(article.tags) || !Array.isArray(article.sources) || !Array.isArray(article.toolLinks)) {
    errors.push('Tags, sources, and toolLinks must be arrays: ' + article.slug);
  }
  for (const source of article.sources || []) {
    if (!source.label || !/^https?:\/\//.test(source.url || '')) errors.push('Invalid source link: ' + article.slug + ' (' + (source.url || 'missing') + ')');
  }
  for (const link of article.toolLinks || []) {
    if (!link.label || !link.href || !link.href.startsWith('/')) errors.push('Tool links must be named site-local paths: ' + article.slug);
  }
}
if (errors.length) {
  console.error('[Blog] Content validation failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('[Blog] Content validation passed: ' + articles.length + ' records (' +
  articles.filter(article => article.status === 'published').length + ' published, ' +
  editorial.length + ' generated from structured JSON and Markdown src/data sources).');
