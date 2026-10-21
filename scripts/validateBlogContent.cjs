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
  'src/data/blog_10_first_tech_internship_second_year.json'
];
for (const sourcePath of sourcePaths) readJson(sourcePath);

if (!Array.isArray(baseline) || baseline.length === 0) throw new Error('[Blog] Existing article data must be a non-empty array.');
if (!Array.isArray(editorial) || editorial.length !== 7) {
  throw new Error('[Blog] Expected seven normalized editorial articles; found ' + (editorial?.length ?? 'invalid data'));
}

const articles = [...baseline, ...editorial];
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
  editorial.length + ' normalized from structured src/data JSON).');
