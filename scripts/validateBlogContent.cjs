const fs = require('node:fs');
const path = require('node:path');

const dataPath = path.resolve(process.cwd(), 'src/data/blogArticles.json');
if (!fs.existsSync(dataPath)) throw new Error('[Blog] Article data file is missing.');
const articles = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (!Array.isArray(articles) || articles.length === 0) throw new Error('[Blog] Article data must be a non-empty array.');

const slugs = new Set();
const errors = [];
for (const article of articles) {
  if (!article || typeof article !== 'object') { errors.push('Article entry is not an object.'); continue; }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '')) errors.push('Invalid slug: ' + (article.slug || '(missing)'));
  if (slugs.has(article.slug)) errors.push('Duplicate slug: ' + article.slug);
  slugs.add(article.slug);
  if (!article.title || !article.summary || !article.category || !article.content) errors.push('Missing required content fields: ' + article.slug);
  if (!['published', 'draft'].includes(article.status)) errors.push('Invalid publication status: ' + article.slug);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt || '') || !/^\d{4}-\d{2}-\d{2}$/.test(article.updatedAt || '')) errors.push('Invalid publication/update date: ' + article.slug);
  if (article.status === 'published') {
    const content = String(article.content || '').trim();
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const headingCount = (content.match(/^##\s+.+$/gm) || []).length;
    // Editorial sanity checks only; Google does not prescribe a minimum word count.
    if (content.length < 1200 || wordCount < 250) errors.push('Published article needs more substantive content: ' + article.slug + ' (' + wordCount + ' words).');
    if (headingCount < 4) errors.push('Published article needs clearer section structure (at least four H2 sections): ' + article.slug);
  }
  if (!Array.isArray(article.tags) || !Array.isArray(article.sources) || !Array.isArray(article.toolLinks)) errors.push('Tags, sources, and toolLinks must be arrays: ' + article.slug);
  for (const source of article.sources || []) {
    if (!/^https?:\/\//.test(source.url || '')) errors.push('Invalid source URL: ' + article.slug + ' (' + (source.url || 'missing') + ')');
  }
  for (const link of article.toolLinks || []) {
    if (!link.href || !link.href.startsWith('/')) errors.push('Tool links must be site-local paths: ' + article.slug);
  }
}
const published = articles.filter((article) => article.status === 'published');
const drafts = articles.filter((article) => article.status === 'draft');
if (published.some((article) => !article.slug || !article.content)) errors.push('Published article missing a route or content.');
if (errors.length) {
  console.error('[Blog] Content validation failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('[Blog] Content validation passed: ' + articles.length + ' records (' + published.length + ' published, ' + drafts.length + ' drafts); draft entries are excluded from public route generation.');
