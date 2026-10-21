#!/usr/bin/env node
'use strict';

/*
 * Builds one normalized article index from the existing editorial dataset and
 * structured article JSON files that remain in src/data/.
 *
 * blog_01_cse_core_vs_specializations.json is a metadata/citation companion for
 * 01_cse_core_vs_specializations_blog.json. They cover the same article topic,
 * so only the richer v2 content is published.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'src', 'data');
const BASE_PATH = path.join(DATA_DIR, 'blogArticles.json');
const OUTPUT_PATH = path.join(DATA_DIR, 'blogArticles.generated.json');
const INTEGRATION_DATE = '2026-10-21';

const SOURCES = [
  {
    file: '01_cse_core_vs_specializations_blog.json',
    companion: 'blog_01_cse_core_vs_specializations.json',
    category: 'Engineering Branch Guidance'
  },
  {
    file: 'ap_tg_eapcet_complete_guide.json',
    category: 'AP & TG EAPCET Guides'
  },
  {
    file: 'blog_03_eapcet_web_options_mistakes.json',
    category: 'AP & TG EAPCET Guides'
  },
  {
    file: 'blog_04_top_engineering_colleges_ap_tg.json',
    category: 'AP & TG Engineering Colleges'
  },
  {
    file: 'blog_05_score_9_sgpa_first_year.json',
    category: 'Study Skills & Roadmaps'
  },
  {
    file: 'blog_06_c_programming_dsa_roadmap.json',
    category: 'Programming & DSA'
  },
  {
    file: 'blog_08_autonomous_vs_affiliated.json',
    category: 'College Choice Guides'
  },
  {
    file: 'blog_10_first_tech_internship_second_year.json',
    category: 'Internships & Career Preparation'
  }
];

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) throw new Error('[Blog integration] Missing ' + label + ': ' + filePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error('[Blog integration] Invalid JSON in ' + label + ': ' + error.message);
  }
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function cleanText(value) {
  return String(value == null ? '' : value).replace(/\r\n/g, '\n').trim();
}

function isHttpUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function safeLink(label, href, description) {
  const text = cleanText(label) || cleanText(href);
  const url = cleanText(href);
  if (!text || !url) return '';
  const link = isHttpUrl(url) || url.startsWith('/') || url.startsWith('#')
    ? '[' + text.replace(/\]/g, '\\]') + '](' + url.replace(/\)/g, '%29') + ')'
    : text;
  return link + (description ? ' — ' + cleanText(description) : '');
}

function renderTable(table) {
  if (!table || typeof table !== 'object') return '';
  const headers = Array.isArray(table.headers) ? table.headers : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  if (!headers.length || !rows.length) return '';
  const cell = (value) => {
    let text;
    if (value && typeof value === 'object') {
      text = value.name || value.label || value.title || Object.values(value).filter((v) => typeof v === 'string').join(' — ');
      if (value.url && text) return safeLink(text, value.url, value.description_te || value.description);
    } else {
      text = String(value == null ? '' : value);
    }
    return cleanText(text).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
  };
  const lines = [
    '| ' + headers.map(cell).join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |'
  ];
  for (const row of rows) {
    const cells = Array.isArray(row)
      ? row
      : row && typeof row === 'object'
        ? headers.map((header, index) => row[header] ?? Object.values(row)[index] ?? '')
        : [row];
    lines.push('| ' + headers.map((_, index) => cell(cells[index] ?? '')).join(' | ') + ' |');
  }
  return lines.join('\n');
}

function renderLinkList(items) {
  return asArray(items).map((item) => {
    if (typeof item === 'string') return '- ' + cleanText(item);
    if (!item || typeof item !== 'object') return '';
    const label = item.name || item.label || item.title || item.heading_te || item.heading || item.url;
    const url = item.url || item.href;
    const description = item.description_te || item.description || item.note;
    return label && url ? '- ' + safeLink(label, url, description) : renderSimpleItem(item);
  }).filter(Boolean).join('\n');
}

function renderSimpleItem(item) {
  if (typeof item === 'string') return cleanText(item);
  if (typeof item === 'number') return String(item);
  if (!item || typeof item !== 'object') return '';
  if (item.term) return '**' + cleanText(item.term) + '** — ' + cleanText(item.meaning_te || item.meaning || item.description_te || '');
  if (item.name && (item.url || item.href)) return safeLink(item.name, item.url || item.href, item.description_te || item.description);
  const preferred = ['text_te', 'text', 'point_te', 'point', 'item_te', 'item', 'label', 'name', 'title_te', 'title', 'heading_te', 'heading'];
  for (const key of preferred) if (typeof item[key] === 'string' && item[key].trim()) return cleanText(item[key]);
  return Object.entries(item)
    .filter(([key, value]) => !['id', 'url', 'href', 'heading_en'].includes(key) && typeof value === 'string' && value.trim())
    .map(([key, value]) => '**' + key.replace(/_te$/, '').replace(/_/g, ' ') + ':** ' + cleanText(value))
    .join(' — ');
}

function renderParagraphs(value) {
  return asArray(value).map((item) => {
    if (typeof item === 'string') return cleanText(item);
    if (item && typeof item === 'object') return renderSimpleItem(item);
    return '';
  }).filter(Boolean).join('\n\n');
}

function renderList(value, ordered) {
  const items = asArray(value).map(renderSimpleItem).filter(Boolean);
  return items.map((item, index) => (ordered ? (index + 1) + '. ' : '- ') + item).join('\n');
}

function renderFaq(items, level) {
  if (!Array.isArray(items) || !items.length) return '';
  return items.map((item) => {
    if (!item || typeof item !== 'object') return renderSimpleItem(item);
    const question = item.q_te || item.question_te || item.question || item.heading_te || item.title || 'Question';
    const answer = item.a_te || item.answer_te || item.answer || item.paragraphs_te || '';
    return '#'.repeat(Math.min(level, 4)) + ' ' + cleanText(question) + (answer ? '\n\n' + renderParagraphs(answer) : '');
  }).filter(Boolean).join('\n\n');
}

function renderMyths(items, level) {
  if (!Array.isArray(items) || !items.length) return '';
  return items.map((item) => {
    if (!item || typeof item !== 'object') return renderSimpleItem(item);
    const myth = item.myth_te || item.myth || item.heading_te || item.title || 'Myth';
    const reality = item.reality_te || item.reality || item.a_te || '';
    return '#'.repeat(Math.min(level, 4)) + ' ' + cleanText(myth) + (reality ? '\n\n**Reality:** ' + cleanText(reality) : '');
  }).filter(Boolean).join('\n\n');
}

function renderMistakes(items, level) {
  if (!Array.isArray(items) || !items.length) return '';
  return items.map((item) => {
    if (!item || typeof item !== 'object') return renderSimpleItem(item);
    const title = item.mistake_te || item.heading_te || item.title || item.name || 'Common mistake';
    const fix = item.fix_te || item.reality_te || item.solution_te || '';
    const extra = [];
    if (item.paragraphs_te) extra.push(renderParagraphs(item.paragraphs_te));
    if (item.points_te) extra.push(renderList(item.points_te, false));
    if (fix) extra.push('**What to do instead:** ' + cleanText(fix));
    if (item.tip_te) extra.push('> ' + cleanText(item.tip_te));
    return '#'.repeat(Math.min(level, 4)) + ' ' + cleanText(title) + (extra.filter(Boolean).length ? '\n\n' + extra.filter(Boolean).join('\n\n') : '');
  }).join('\n\n');
}

function renderNode(node, level = 2, includeHeading = true) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return cleanText(node);
  if (Array.isArray(node)) return node.map((item) => renderNode(item, level, false)).filter(Boolean).join('\n\n');
  if (typeof node !== 'object') return '';

  const blocks = [];
  const heading = node.heading_te || node.heading || node.title_te || node.title || node.name;
  if (includeHeading && heading) blocks.push('#'.repeat(Math.min(level, 4)) + ' ' + cleanText(heading));

  const handled = new Set([
    'id', 'heading_te', 'heading_en', 'heading', 'title_te', 'title', 'name',
    'paragraphs_te', 'paragraphs_after_te', 'paragraphs_closing_te', 'paragraphs',
    'intro_te', 'description_te', 'closing_te', 'tip_te', 'example_te',
    'warning_te', 'note_te', 'note', 'quick_answer_te', 'fix_te', 'reality_te',
    'meaning_te', 'a_te', 'points_te', 'checklist_te', 'final_checklist_te',
    'numbered_questions_te', 'numbered_points_te', 'columns', 'table', 'headers',
    'rows', 'links', 'subsections', 'sections', 'faq', 'myths', 'mistakes',
    'tracker_te', 'glossary', 'editorial_note_te', 'publication_checklist_te',
    'publication_checklist', 'source_file', 'language', 'version', 'seo',
    'table_of_contents_te', 'audience_te', 'publication_type', 'resources',
    'official_references', 'references_note_te', 'conclusion_te', 'conclusion'
  ]);

  for (const key of ['paragraphs_te', 'intro_te', 'description_te', 'paragraphs_after_te', 'paragraphs_closing_te', 'paragraphs', 'closing_te']) {
    if (node[key] != null) {
      const rendered = renderParagraphs(node[key]);
      if (rendered) blocks.push(rendered);
    }
  }
  for (const key of ['quick_answer_te', 'tip_te', 'example_te', 'warning_te', 'note_te', 'note', 'fix_te', 'reality_te', 'a_te', 'meaning_te']) {
    if (node[key] != null) {
      const rendered = renderParagraphs(node[key]);
      if (rendered) blocks.push((key === 'tip_te' || key === 'example_te' || key === 'warning_te') ? '> ' + rendered.replace(/\n\n/g, '\n> ') : rendered);
    }
  }

  for (const key of ['points_te', 'checklist_te', 'final_checklist_te', 'numbered_questions_te', 'numbered_points_te', 'columns']) {
    if (node[key] != null) {
      const rendered = renderList(node[key], key === 'numbered_questions_te' || key === 'numbered_points_te');
      if (rendered) blocks.push(rendered);
    }
  }

  if (node.table) {
    const table = renderTable(node.table);
    if (table) blocks.push(table);
  } else if (Array.isArray(node.headers) && Array.isArray(node.rows)) {
    const table = renderTable(node);
    if (table) blocks.push(table);
  }

  if (node.links) {
    const links = renderLinkList(node.links);
    if (links) blocks.push(links);
  }
  if (node.myths) {
    const myths = renderMyths(node.myths, level + 1);
    if (myths) blocks.push(myths);
  }
  if (node.mistakes) {
    const mistakes = renderMistakes(node.mistakes, level + 1);
    if (mistakes) blocks.push(mistakes);
  }
  if (node.faq) {
    const faq = renderFaq(node.faq, level + 1);
    if (faq) blocks.push(faq);
  }
  if (node.tracker_te) {
    const tracker = renderNode(node.tracker_te, level + 1, true);
    if (tracker) blocks.push(tracker);
  }
  for (const key of ['subsections', 'sections']) {
    if (Array.isArray(node[key])) {
      const nested = node[key].map((item) => renderNode(item, level + 1, true)).filter(Boolean).join('\n\n');
      if (nested) blocks.push(nested);
    }
  }

  // Keep otherwise-unrecognised editorial body fields rather than silently dropping content.
  for (const [key, value] of Object.entries(node)) {
    if (handled.has(key) || value == null) continue;
    if (typeof value === 'string' && value.trim()) {
      blocks.push('**' + key.replace(/_te$/, '').replace(/_/g, ' ') + ':** ' + cleanText(value));
    } else if (Array.isArray(value) && value.length && value.every((item) => typeof item === 'string' || typeof item === 'number')) {
      const rendered = renderList(value, false);
      if (rendered) blocks.push(rendered);
    } else if (value && typeof value === 'object') {
      const rendered = renderNode(value, level + 1, true);
      if (rendered) blocks.push(rendered);
    }
  }

  return blocks.filter(Boolean).join('\n\n');
}

function collectUrls(value, sources = [], seen = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, sources, seen);
    return sources;
  }
  if (!value || typeof value !== 'object') return sources;
  if (typeof value.url === 'string' && isHttpUrl(value.url)) {
    const label = value.name || value.label || value.title || value.heading_te || value.heading || value.url;
    const description = value.description_te || value.description || '';
    if (!seen.has(value.url)) {
      sources.push({ label: cleanText(label), url: cleanText(value.url), ...(description ? { description: cleanText(description) } : {}) });
      seen.add(value.url);
    }
  }
  for (const child of Object.values(value)) if (child && typeof child === 'object') collectUrls(child, sources, seen);
  return sources;
}

function collectToolLinks(content) {
  const output = [];
  const seen = new Set();
  const re = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const href = match[2];
    if (href.startsWith('/blog/') || href.startsWith('/blog?') || seen.has(href)) continue;
    output.push({ label: cleanText(match[1]), href });
    seen.add(href);
  }
  return output;
}

function buildContent(doc) {
  const blocks = [];
  if (doc.intro_te) {
    const intro = renderParagraphs(doc.intro_te);
    if (intro) blocks.push(intro);
  }
  if (doc.introduction) {
    const intro = renderNode(doc.introduction, 2, true);
    if (intro) blocks.push(intro);
  }
  if (doc.quick_answer_te) blocks.push('## Quick answer\n\n' + renderParagraphs(doc.quick_answer_te));
  if (Array.isArray(doc.sections)) {
    for (const section of doc.sections) {
      const rendered = renderNode(section, 2, true);
      if (rendered) blocks.push(rendered);
    }
  }
  if (doc.conclusion && typeof doc.conclusion === 'object') {
    const rendered = renderNode(doc.conclusion, 2, true);
    if (rendered) blocks.push(rendered);
  } else if (doc.conclusion_te) {
    const rendered = renderParagraphs(doc.conclusion_te);
    if (rendered) blocks.push('## ముగింపు\n\n' + rendered);
  }

  if (doc.final_checklist_te) {
    const checklist = renderList(doc.final_checklist_te, false);
    if (checklist) blocks.push('## Final checklist\n\n' + checklist);
  }
  if (doc.faq) {
    const faq = renderFaq(doc.faq, 2);
    if (faq) blocks.push('## Frequently asked questions\n\n' + faq);
  }
  if (Array.isArray(doc.glossary) && doc.glossary.length) {
    const glossary = doc.glossary.map((item) => {
      if (!item || typeof item !== 'object') return renderSimpleItem(item);
      return '- **' + cleanText(item.term || item.name) + '** — ' + cleanText(item.meaning_te || item.meaning || '');
    }).filter(Boolean).join('\n');
    if (glossary) blocks.push('## Glossary\n\n' + glossary);
  }
  if (doc.references_note_te) blocks.push('> ' + cleanText(doc.references_note_te));
  return blocks.map((block) => cleanText(block)).filter(Boolean).join('\n\n');
}

function slugify(value) {
  return cleanText(value).toLowerCase().replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function makeArticle(config) {
  const filePath = path.join(DATA_DIR, config.file);
  const doc = readJson(filePath, config.file);
  const companion = config.companion ? readJson(path.join(DATA_DIR, config.companion), config.companion) : null;
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error('[Blog integration] ' + config.file + ' must contain a single article object.');
  if (!doc.title_te && !doc.title_en) throw new Error('[Blog integration] Missing title in ' + config.file);
  if (!Array.isArray(doc.sections) || !doc.sections.length) throw new Error('[Blog integration] Missing sections in ' + config.file);

  const seo = doc.seo || {};
  const companionSeo = companion && companion.seo ? companion.seo : {};
  const title = cleanText(doc.title_te || doc.title_en);
  const slug = slugify(seo.slug || companionSeo.slug || config.slug || title);
  const summary = cleanText(seo.excerpt_te || seo.meta_description_te || doc.subtitle_te || (companion && companion.subtitle_te) || title);
  const category = cleanText(doc.category || (companion && companion.category) || config.category || 'Student Guides');

  const body = buildContent(doc);
  if (!body || body.length < 1200) throw new Error('[Blog integration] Generated article body is too short for ' + config.file + ' (' + body.length + ' characters).');
  const sources = collectUrls([doc.resources || [], doc.official_references || [], companion ? (companion.resources || []) : []]);
  const keywords = [
    seo.primary_keyword,
    ...(Array.isArray(seo.related_keywords) ? seo.related_keywords : []),
    ...(Array.isArray(seo.secondary_keywords) ? seo.secondary_keywords : []),
    ...(companionSeo.primary_keyword ? [companionSeo.primary_keyword] : []),
    ...(Array.isArray(companionSeo.secondary_keywords) ? companionSeo.secondary_keywords : [])
  ];
  const tags = Array.from(new Set(keywords.map(cleanText).filter(Boolean))).slice(0, 12);
  const article = {
    slug,
    title,
    ...(seo.title ? { seoTitle: cleanText(seo.title) } : companionSeo.title ? { seoTitle: cleanText(companionSeo.title) } : {}),
    category,
    tags: tags.length ? tags : [category],
    status: 'published',
    publishedAt: INTEGRATION_DATE,
    updatedAt: INTEGRATION_DATE,
    featured: false,
    summary,
    content: body,
    sources,
    toolLinks: collectToolLinks(body)
  };
  return article;
}

function main() {
  const base = readJson(BASE_PATH, 'existing blogArticles.json');
  if (!Array.isArray(base)) throw new Error('[Blog integration] blogArticles.json must contain an array.');
  const articles = base.map((article) => ({ ...article }));
  const slugs = new Set();
  for (const article of articles) {
    if (!article || !slugify(article.slug)) throw new Error('[Blog integration] Existing article has no valid slug.');
    if (slugs.has(article.slug)) throw new Error('[Blog integration] Duplicate existing article slug: ' + article.slug);
    slugs.add(article.slug);
  }

  const additions = SOURCES.map(makeArticle);
  for (const article of additions) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) throw new Error('[Blog integration] Invalid generated slug: ' + article.slug);
    if (slugs.has(article.slug)) throw new Error('[Blog integration] New article slug collides with an existing article: ' + article.slug);
    slugs.add(article.slug);
    if (!article.title || !article.summary || !article.category || !article.content) throw new Error('[Blog integration] Missing required fields for ' + article.slug);
    if (!Array.isArray(article.sources) || !Array.isArray(article.toolLinks) || !Array.isArray(article.tags)) throw new Error('[Blog integration] Invalid mapped arrays for ' + article.slug);
    for (const source of article.sources) if (!isHttpUrl(source.url)) throw new Error('[Blog integration] Invalid source URL in ' + article.slug + ': ' + source.url);
    for (const link of article.toolLinks) if (!link.href.startsWith('/')) throw new Error('[Blog integration] Non-local tool link in ' + article.slug + ': ' + link.href);
    articles.push(article);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(articles, null, 2) + '\n', 'utf8');
  console.log('[Blog integration] Generated ' + path.relative(ROOT, OUTPUT_PATH) + ': ' + base.length + ' existing + ' + additions.length + ' new unique articles = ' + articles.length + '.');
  console.log('[Blog integration] Duplicate CSE article source excluded: blog_01_cse_core_vs_specializations.json (used only for metadata and citations).');
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
}
