'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const outputPath = path.join(root, 'src/data/editorialBlogArticles.generated.json');
const contentDate = '2026-10-21';
const alternateCsePath = 'src/data/01_cse_core_vs_specializations_blog.json';
const specs = [
  { path: 'src/data/blog_01_cse_core_vs_specializations.json', category: 'Branch & Career Guidance', tags: ['CSE Core','AI/ML','Data Science','Cyber Security','engineering branches','career guidance'], toolLinks: [{label:'AP EAPCET College Predictor',href:'/ap-eapcet/college-predictor/'},{label:'TG EAPCET College Predictor',href:'/tg-eapcet/college-predictor/'}] },
  { path: 'src/data/blog_03_eapcet_web_options_mistakes.json', category: 'EAPCET Counselling', tags: ['EAPCET','web options','counselling','AP EAPCET','TG EAPCET','college choice'], toolLinks: [{label:'AP college-wise allotment explorer',href:'/ap-eapcet/college-wise-allotments/'},{label:'TG name-wise allotment explorer',href:'/tg-eapcet/name-wise-allotments/'}] },
  { path: 'src/data/blog_04_top_engineering_colleges_ap_tg.json', category: 'College Selection', tags: ['engineering colleges','Andhra Pradesh colleges','Telangana colleges','college comparison','placements','fees'], toolLinks: [{label:'AP EAPCET College Predictor',href:'/ap-eapcet/college-predictor/'},{label:'TG EAPCET College Predictor',href:'/tg-eapcet/college-predictor/'}] },
  { path: 'src/data/blog_05_score_9_sgpa_first_year.json', category: 'Study Skills', tags: ['SGPA','B.Tech first year','study plan','exam preparation','active recall'], toolLinks: [{label:'Open GPA Calculator',href:'/tools/gpa-calculator/'}] },
  { path: 'src/data/blog_06_c_programming_dsa_roadmap.json', category: 'Programming Roadmaps', tags: ['C programming','data structures','DSA','programming roadmap','beginners'], toolLinks: [{label:'Explore Engineering Roadmaps',href:'/engineering-roadmaps/'}] },
  { path: 'src/data/blog_08_autonomous_vs_affiliated.json', category: 'College Selection', tags: ['autonomous colleges','JNTU','Andhra University','college selection','curriculum','exams'], toolLinks: [{label:'Explore autonomous colleges',href:'/autonomous-colleges/'}] },
  { path: 'src/data/blog_10_first_tech_internship_second_year.json', category: 'Internships & Careers', tags: ['internships','second year','resume','GitHub','projects','career'], toolLinks: [{label:'Explore Engineering Roadmaps',href:'/engineering-roadmaps/'}] }
];

const structuredSpecs = [
  { path: 'src/data/blog-1-chatgpt-vs-claude.json', slug: 'chatgpt-vs-claude-which-ai-is-better-for-students' },
  { path: 'src/data/blog-2-gemini-chatgpt-grok-meta-claude.json', slug: 'gemini-vs-chatgpt-vs-grok-vs-meta-ai-vs-claude' },
  { path: 'src/data/blog-3-iiit-hyderabad-admission-ugee.json', slug: 'how-to-join-iiit-hyderabad-without-jee-main-ugee' },
  { path: 'src/data/blog-4-github-basics.json', slug: 'github-basics-for-beginners-complete-guide' }
];

const markdownSpecs = [
  {
    path: 'src/data/VITEEE_2027_Complete_Exam_Details.md',
    slug: 'viteee-2027-complete-exam-details',
    category: 'Engineering Entrance Exams',
    tags: ['VITEEE 2027', 'VITEEE application', 'B.Tech admissions', 'engineering entrance exam', 'VIT campuses'],
    coverImage: '/Scholorship_images/VITEEE%202027%20Exam%20Update.webp',
    publishedAt: '2026-10-30'
  }
];

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) throw new Error('[Blog integration] Missing source file: ' + relativePath);
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (error) { throw new Error('[Blog integration] Invalid JSON in ' + relativePath + ': ' + error.message); }
}
function asArray(value) { return value == null ? [] : Array.isArray(value) ? value : [value]; }
function str(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value)) return value.map(str).filter(Boolean).join('\n');
  if (typeof value === 'object') {
    for (const key of ['text_te','text','content_te','content','description_te','description','meaning_te','answer_te','a_te','label','name','term','question_te','q_te']) {
      if (typeof value[key] === 'string' && value[key].trim()) return value[key].trim();
    }
  }
  return '';
}
function paragraphs(value) { return asArray(value).map(str).filter(Boolean).join('\n\n'); }
function sanitizeBlogContent(input) {
  let content = String(input || '');
  // Code examples are not source/reference links. Keep their exact commands
  // intact (especially the Git remote URL), while preventing clickable or
  // loose third-party URLs from appearing in ordinary article prose.
  const codeBlocks = [];
  content = content.replace(/```[^\n]*\n[\s\S]*?```/g, (block) => {
    const index = codeBlocks.push(block) - 1;
    return '__NAA_EDITORIAL_CODE_BLOCK_' + index + '__';
  });
  const sourceHeading = /^\s*#{2,4}\s*(?:(?:official\s+(?:and\s+)?(?:reference\s+)?)|(?:reference\s+)|(?:external\s+)|(?:additional\s+))?(?:sources?|references?|resources|further reading|reference links|official links)(?:\s*(?:&|and)\s*(?:further reading|references?|sources?))?\s*$/im;
  const match = sourceHeading.exec(content);
  if (match) content = content.slice(0, match.index);
  content = content.replace(/\[([^\]]+)\]\(\s*https?:\/\/[^)\s]+[^)]*\)/gi, '$1');
  content = content.replace(/<https?:\/\/[^>]+>/gi, '');
  content = content.replace(/\bhttps?:\/\/[^\s)\]]+/gi, '');
  content = content.replace(/\bwww\.[^\s)\]]+/gi, '');
  content = content.replace(/__NAA_EDITORIAL_CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[Number(index)] || '');
  return content.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function tableMarkdown(table) {
  if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) return '';
  const cell = value => str(value).replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
  const headers = table.headers.map(cell);
  return ['| ' + headers.join(' | ') + ' |','| ' + headers.map(() => '---').join(' | ') + ' |', ...table.rows.map(row => '| ' + headers.map((_, index) => cell(row?.[index] ?? '')).join(' | ') + ' |')].join('\n');
}
function bullets(values) {
  return asArray(values).map(value => {
    if (typeof value === 'string' || typeof value === 'number') return '- ' + str(value);
    if (value && typeof value === 'object') {
      const label = str(value.myth_te || value.term_te || value.title_te || value.heading_te || value.label || value.name || value.term);
      const detail = str(value.reality_te || value.meaning_te || value.description_te || value.explanation_te || value.body_te || value.text_te || value.answer_te);
      if (label || detail) return '- ' + (label ? '**' + label + '**' : '') + (label && detail ? ' — ' : '') + detail;
    }
    return '';
  }).filter(Boolean).join('\n');
}
function numbered(values) {
  return asArray(values).map((item, index) => {
    const value = item && typeof item === 'object' ? str(item.question_te || item.q_te || item.text_te || item.label || item.title_te || item.question || item.q) : str(item);
    return value ? (index + 1) + '. ' + value : '';
  }).filter(Boolean).join('\n');
}
function faqs(values) {
  return asArray(values).map(item => {
    const question = str(item?.q_te || item?.question_te || item?.question || item?.q);
    const answer = str(item?.a_te || item?.answer_te || item?.answer || item?.a);
    return question && answer ? '### ' + question + '\n\n' + answer : '';
  }).filter(Boolean).join('\n\n');
}
function sectionMarkdown(section, level = 2) {
  const parts = [];
  const heading = str(section.heading_te || section.title_te || section.heading || section.title);
  if (heading) parts.push('#'.repeat(Math.min(4, Math.max(2, level))) + ' ' + heading);
  const body = paragraphs(section.paragraphs_te); if (body) parts.push(body);
  const after = paragraphs(section.paragraphs_after_te); if (after) parts.push(after);
  const points = bullets(section.points_te); if (points) parts.push(points);
  const table = tableMarkdown(section.table); if (table) parts.push(table);
  const nums = numbered(section.numbered_questions_te); if (nums) parts.push(nums);
  const checklist = bullets(section.checklist_te); if (checklist) parts.push(checklist);
  const myths = bullets(section.myths); if (myths) parts.push(myths);
  const warning = str(section.warning_te); if (warning) parts.push('> **Note:** ' + warning.replace(/\n/g, ' '));
  const tip = str(section.tip_te); if (tip) parts.push('> **Tip:** ' + tip.replace(/\n/g, ' '));
  const example = str(section.example_te); if (example) parts.push('> **Example:** ' + example.replace(/\n/g, ' '));
  for (const nested of asArray(section.subsections)) {
    const value = sectionMarkdown(nested, Math.min(level + 1, 4));
    if (value) parts.push(value);
  }
  const faq = faqs(section.faq); if (faq) parts.push(faq);
  return parts.filter(Boolean).join('\n\n');
}
function normalize(raw, spec) {
  const parts = [];
  const intro = paragraphs(raw.intro_te); if (intro) parts.push(intro);
  const quick = str(raw.quick_answer_te); if (quick) parts.push('## Quick Answer\n\n' + quick);
  const glossary = asArray(raw.glossary).map(item => {
    const term = str(item.term_te || item.term || item.name);
    const meaning = str(item.meaning_te || item.definition_te || item.definition);
    return term && meaning ? '- **' + term + '** — ' + meaning : '';
  }).filter(Boolean).join('\n');
  if (glossary) parts.push('## Key Terms\n\n' + glossary);
  for (const section of asArray(raw.sections)) {
    const rendered = sectionMarkdown(section, 2);
    if (rendered) parts.push(rendered);
  }
  const checklist = bullets(raw.final_checklist_te); if (checklist) parts.push('## Final Checklist\n\n' + checklist);
  const conclusion = paragraphs(raw.conclusion_te); if (conclusion) parts.push('## Conclusion\n\n' + conclusion);
  const faq = faqs(raw.faq); if (faq) parts.push('## Frequently Asked Questions\n\n' + faq);
  const content = sanitizeBlogContent(parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim());
  const slug = String(raw.seo?.slug || '').replace(/^\/+|\/+$/g, '');
  const tags = [...new Set([...spec.tags, raw.seo?.primary_keyword, ...asArray(raw.seo?.secondary_keywords)].map(str).filter(Boolean))];
  const sources = [];
  return {
    slug, title: str(raw.title_te || raw.title_en || raw.seo?.title),
    category: spec.category, tags, status: 'published',
    publishedAt: contentDate, updatedAt: contentDate, featured: false,
    summary: str(raw.seo?.meta_description_te || raw.subtitle_te || asArray(raw.intro_te)[0] || raw.seo?.title),
    content, sources, toolLinks: spec.toolLinks
  };
}


function structuredTableMarkdown(table) {
  if (!table || !Array.isArray(table.rows)) return '';
  const headers = Array.isArray(table.columns) ? table.columns : table.headers;
  if (!Array.isArray(headers)) return '';
  return tableMarkdown({ headers, rows: table.rows });
}
function structuredSectionMarkdown(section) {
  const parts = [];
  const heading = str(section.heading || section.title);
  if (heading) parts.push('## ' + heading);
  const before = paragraphs(section.paragraphs);
  if (before) parts.push(before);
  const points = bullets(section.list);
  if (points) parts.push(points);
  const steps = numbered(section.steps);
  if (steps) parts.push(steps);
  const table = structuredTableMarkdown(section.table);
  if (table) parts.push(table);
  if (section.code) parts.push('```text\n' + String(section.code).replace(/\s+$/,'') + '\n```');
  const after = paragraphs(section.paragraphs_after);
  if (after) parts.push(after);
  const takeaway = str(section.takeaway);
  if (takeaway) parts.push('> **Takeaway:** ' + takeaway.replace(/\n/g, ' '));
  const note = str(section.note);
  if (note) parts.push('> **Note:** ' + note.replace(/\n/g, ' '));
  return parts.filter(Boolean).join('\n\n');
}
function normalizeStructured(raw) {
  const parts = [];
  const importantNote = str(raw.important_note);
  if (importantNote) parts.push('> **Important note:** ' + importantNote.replace(/\n/g, ' '));
  for (const section of asArray(raw.sections)) {
    const rendered = structuredSectionMarkdown(section);
    if (rendered) parts.push(rendered);
  }
  const conclusion = str(raw.conclusion);
  if (conclusion) parts.push('## Conclusion\n\n' + conclusion);
  const faq = faqs(raw.faq);
  if (faq) parts.push('## Frequently Asked Questions\n\n' + faq);
  const disclaimer = str(raw.disclaimer);
  if (disclaimer) parts.push('> **Disclaimer:** ' + disclaimer.replace(/\n/g, ' '));
  // Do not import raw.official_sources: published blog pages intentionally do
  // not render third-party source/reference link sections.
  const content = sanitizeBlogContent(parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim());
  const publishedAt = str(raw.published_date) || contentDate;
  return {
    slug: str(raw.slug).replace(/^\/+|\/+$/g, ''),
    title: str(raw.title),
    metaTitle: str(raw.meta_title || raw.title),
    metaDescription: str(raw.meta_description || raw.excerpt || raw.title),
    category: str(raw.category) || 'Student Guides',
    tags: [...new Set(asArray(raw.tags).map(str).filter(Boolean))],
    status: 'published',
    publishedAt,
    updatedAt: str(raw.updated_date || raw.published_date) || contentDate,
    featured: false,
    author: str(raw.author) || 'Naa College Editorial Desk',
    readingTimeMinutes: Number(raw.reading_time_minutes) || null,
    summary: str(raw.excerpt || raw.meta_description || raw.title),
    content,
    sources: [],
    toolLinks: [],
    coverImage: str(raw.cover_image)
  };
}


function pandocSimpleTablesToPipe(content) {
  const lines = String(content || '').split(/\r?\n/);
  const output = [];
  for (let i = 0; i < lines.length; i += 1) {
    const separator = lines[i];
    const groups = [...separator.matchAll(/-{3,}/g)];
    if (groups.length < 2 || !/^\s*-{3,}(?:\s+-{3,})+\s*$/.test(separator)) {
      output.push(lines[i]);
      continue;
    }

    const starts = groups.map((group) => group.index ?? 0);
    const headerLine = lines[i - 1] || '';
    if (output.length) output.pop();
    if (output.length && /^\s*-{3,}\s*$/.test(output[output.length - 1])) output.pop();

    const cellsFor = (line) => starts.map((start, index) => {
      const nextStart = starts[index + 1];
      return line.slice(index === 0 ? 0 : start, nextStart === undefined ? undefined : nextStart).trim();
    });
    const headers = cellsFor(headerLine);
    const rows = [];
    let cursor = i + 1;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (/^\s*-{3,}\s*$/.test(line)) { cursor += 1; break; }
      if (!line.trim()) { cursor += 1; continue; }
      if (!/^\s{2,}\S/.test(line) || /^\s*#{1,6}\s/.test(line)) break;

      const cells = cellsFor(line);
      if (!cells[0] && rows.length && cells.slice(1).some(Boolean)) {
        const continuation = cells.slice(1).filter(Boolean).join(' ');
        const last = rows[rows.length - 1];
        last[last.length - 1] = [last[last.length - 1], continuation].filter(Boolean).join(' ');
      } else {
        rows.push(cells);
      }
      cursor += 1;
    }

    if (headers.length > 1 && rows.length) {
      const cleanCell = (value) => String(value || '').replace(/\s+/g, ' ').trim();
      output.push('| ' + headers.map(cleanCell).join(' | ') + ' |');
      output.push('| ' + headers.map(() => '---').join(' | ') + ' |');
      for (const row of rows) {
        output.push('| ' + headers.map((_, index) => cleanCell(row[index] || '')).join(' | ') + ' |');
      }
    } else {
      output.push(headerLine, separator, ...lines.slice(i + 1, cursor));
    }
    i = cursor - 1;
  }
  return output.join('\n');
}

function normalizeMarkdownArticle(spec) {
  const filePath = path.join(root, spec.path);
  if (!fs.existsSync(filePath)) throw new Error('[Blog integration] Missing Markdown source: ' + spec.path);
  const source = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const titleMatch = source.match(/^#\s+(.+)$/m);
  if (!titleMatch) throw new Error('[Blog integration] Markdown source is missing its H1 title: ' + spec.path);
  let content = source.replace(/^#\s+.+\r?\n+/, '');
  content = pandocSimpleTablesToPipe(content);
  const slash = String.fromCharCode(92);
  content = content.split(slash + '[').join('[').split(slash + ']').join(']');
  content = content
    .replace(/(\b\d{1,2})\s+--\s+(\d{1,2}\b)/g, '$1 – $2')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const firstParagraph = content.split(/\n\s*\n/).find((block) => block.trim() && !block.trim().startsWith('#')) || '';
  const summary = firstParagraph.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)[0] || titleMatch[1].trim();
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return {
    slug: spec.slug,
    title: titleMatch[1].trim(),
    metaTitle: 'VITEEE 2027: Exam Details, Dates & Eligibility | Naa College',
    metaDescription: summary,
    category: spec.category,
    tags: spec.tags,
    status: 'published',
    publishedAt: spec.publishedAt,
    updatedAt: spec.publishedAt,
    featured: false,
    author: 'TEAM NAA COLLEGE',
    readingTimeMinutes: Math.max(2, Math.ceil(wordCount / 220)),
    summary,
    coverImage: spec.coverImage,
    content,
    sources: [],
    toolLinks: []
  };
}

const existing = readJson('src/data/blogArticles.json');
if (!Array.isArray(existing)) throw new Error('[Blog integration] Existing blog data must be an array.');
const alternateCse = readJson(alternateCsePath);
if (!Array.isArray(alternateCse.sections) || !alternateCse.seo) throw new Error('[Blog integration] Alternate CSE JSON failed its structure check.');
const slugs = new Set(existing.map(article => article.slug));
function registerArticle(article, sourcePath) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '')) {
    throw new Error('[Blog integration] Invalid slug in ' + sourcePath + ': ' + (article.slug || '(missing)'));
  }
  if (slugs.has(article.slug)) throw new Error('[Blog integration] Duplicate slug: ' + article.slug);
  slugs.add(article.slug);
  const wordCount = article.content.split(/\s+/).filter(Boolean).length;
  const headingCount = (article.content.match(/^##\s+.+$/gm) || []).length;
  if (!article.title || !article.summary || article.content.length < 1200 || wordCount < 250 || headingCount < 4) {
    throw new Error('[Blog integration] Incomplete article: ' + article.slug + ' (' + wordCount + ' words; ' + headingCount + ' H2 headings)');
  }
  if (!Array.isArray(article.sources) || article.sources.length !== 0) {
    throw new Error('[Blog integration] Third-party source links must remain disabled: ' + article.slug);
  }
  if (!Array.isArray(article.toolLinks) || article.toolLinks.some(link => !link.label || !link.href || !link.href.startsWith('/'))) {
    throw new Error('[Blog integration] Tool links must be named site-local paths: ' + article.slug);
  }
  return article;
}

const legacyArticles = specs.map(spec => {
  const raw = readJson(spec.path);
  if (!raw.seo?.slug || !Array.isArray(raw.sections) || raw.sections.length < 4) {
    throw new Error('[Blog integration] Missing SEO slug/sections in ' + spec.path);
  }
  return registerArticle(normalize(raw, spec), spec.path);
});
const structuredArticles = structuredSpecs.map(spec => {
  const raw = readJson(spec.path);
  if (raw.site !== 'naacollege.in' || raw.slug !== spec.slug || !raw.meta_title || !raw.meta_description ||
      !raw.title || !raw.excerpt || !Array.isArray(raw.sections) || raw.sections.length < 4) {
    throw new Error('[Blog integration] Missing title, SEO metadata, excerpt, or article sections in ' + spec.path);
  }
  return registerArticle(normalizeStructured(raw), spec.path);
});
const markdownArticles = markdownSpecs.map(spec => {
  const article = normalizeMarkdownArticle(spec);
  return registerArticle(article, spec.path);
});
const articles = [...legacyArticles, ...structuredArticles, ...markdownArticles];
fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2) + '\n', 'utf8');
console.log('[Blog integration] Generated ' + articles.length + ' articles from structured JSON and Markdown src/data sources.');
console.log('[Blog integration] Preserved the four new English-only articles and their SEO metadata without translating them.');
console.log('[Blog integration] Excluded raw third-party source lists; retained non-clickable URLs only inside fenced code examples.');
console.log('[Blog integration] Excluded alternate CSE JSON from publication to prevent duplicate-topic content and a slugless route.');
