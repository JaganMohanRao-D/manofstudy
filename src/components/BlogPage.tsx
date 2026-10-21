import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Clock3, Search } from 'lucide-react';
import articlesData from '../data/blogArticles.generated.json';

type BlogArticle = {
  slug: string; title: string; seoTitle?: string; seoDescription?: string; category: string; tags: string[]; status: 'published' | 'draft';
  publishedAt: string; updatedAt: string; featured: boolean; summary: string; content: string;
  sources: { label: string; url: string }[]; toolLinks: { label: string; href: string }[];
};
const allArticles = articlesData as BlogArticle[];
const articles = allArticles.filter((article) => article.status === 'published');
const SITE = 'https://naacollege.in';
const categorySlug = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slugFromPath = (path: string) => path.replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
const readTime = (article: BlogArticle) => Math.max(2, Math.ceil(article.content.trim().split(/\s+/).filter(Boolean).length / 220));
const headingId = (value: string) => categorySlug(value);

function InlineText({ value }: { value: string }) {
  const tokens = value.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return <>{tokens.map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2].trim();
      if (!/^(https?:\/\/|\/|#)/i.test(href) || /^javascript:/i.test(href)) return <React.Fragment key={index}>{link[1]}</React.Fragment>;
      const external = /^https?:\/\//i.test(href);
      return <a key={index} href={href} className="font-medium text-cyan-700 underline underline-offset-4 hover:text-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500 dark:text-cyan-300" {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>{link[1]}</a>;
    }
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">{token.slice(2, -2)}</strong>;
    return <React.Fragment key={index}>{token}</React.Fragment>;
  })}</>;
}

function ArticleBody({ content }: { content: string }) {
  const lines = content.trim().split(/\r?\n/);
  const blocks: { type: string; value: string[] }[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', value: [line.slice(3).trim()] }); i++; continue; }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', value: [line.slice(4).trim()] }); i++; continue; }
    if (line.startsWith('> ')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) quote.push(lines[i++].trim().replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', value: quote }); continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^[-*]\s+/, ''));
      blocks.push({ type: 'ul', value: items }); continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+[.)]\s+/, ''));
      blocks.push({ type: 'ol', value: items }); continue;
    }
    const paragraph = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|>\s|[-*]\s+|\d+[.)]\s+)/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    blocks.push({ type: 'p', value: [paragraph.join(' ')] });
  }
  return <div className="blog-prose space-y-5" onCopy={(event) => event.preventDefault()}>
    {blocks.map((block, index) => {
      if (block.type === 'h2') return <h2 id={headingId(block.value[0])} key={index} className="scroll-mt-24 pt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{block.value[0]}</h2>;
      if (block.type === 'h3') return <h3 key={index} className="pt-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">{block.value[0]}</h3>;
      if (block.type === 'quote') return <blockquote key={index} className="rounded-r-xl border-l-4 border-cyan-500 bg-cyan-50 px-4 py-3 text-[15px] leading-7 text-slate-700 dark:bg-cyan-950/30 dark:text-slate-200"><InlineText value={block.value.join(' ')} /></blockquote>;
      if (block.type === 'ul' || block.type === 'ol') {
        const List = block.type === 'ul' ? 'ul' : 'ol';
        return <List key={index} className={(block.type === 'ul' ? 'list-disc' : 'list-decimal') + ' space-y-2 pl-6 text-[16px] leading-7 text-slate-700 dark:text-slate-300'}>{block.value.map((item, j) => <li key={j} className="pl-1"><InlineText value={item} /></li>)}</List>;
      }
      return <p key={index} className="text-[16px] font-normal leading-[1.8] text-slate-700 dark:text-slate-300"><InlineText value={block.value[0]} /></p>;
    })}
  </div>;
}
function ArticleCard({ article }: { article: BlogArticle }) {
  return <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold"><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200">{article.category}</span><span className="inline-flex items-center gap-1 text-slate-500"><Clock3 className="h-3.5 w-3.5" />{readTime(article)} min read</span></div>
    <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-slate-950 dark:text-white">{article.title}</h2>
    <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{article.summary}</p>
    <a href={'/blog/' + article.slug + '/'} className="mt-5 inline-flex items-center gap-2 self-start text-sm font-bold text-cyan-800 dark:text-cyan-300">Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
  </article>;
}

export function isBlogPath(pathname: string) {
  return pathname === '/blog' || pathname.startsWith('/blog/');
}

export const BlogPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const pathname = typeof window === 'undefined' ? '/blog/' : window.location.pathname;
  const isCategory = pathname.startsWith('/blog/category/');
  const categoryPathSlug = isCategory ? slugFromPath(pathname) : '';
  const currentCategory = isCategory ? articles.find((item) => categorySlug(item.category) === categoryPathSlug)?.category : undefined;
  const slug = isCategory || pathname.replace(/\/+$/, '') === '/blog' ? '' : slugFromPath(pathname);
  const article = articles.find((item) => item.slug === slug);
  const isListing = !slug || isCategory;
  const categories = useMemo(() => ['All', ...Array.from(new Set(articles.map((item) => item.category)))], []);
  const filtered = useMemo(() => articles.filter((item) => {
    const text = [item.title, item.summary, ...item.tags, item.category].join(' ').toLowerCase();
    return (category === 'All' || item.category === category) && (!isCategory || !currentCategory || item.category === currentCategory) && text.includes(query.trim().toLowerCase());
  }), [category, query, isCategory, currentCategory]);
  const toc = useMemo(() => article ? article.content.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim()) : [], [article]);
  const related = useMemo(() => article ? articles.filter((item) => item.slug !== article.slug && (item.category === article.category || item.tags.some((tag) => article.tags.includes(tag)))).slice(0, 3) : [], [article]);

  useEffect(() => {
    let title = 'Student Blog & Knowledge Hub | Naa College';
    let description = 'Practical guides for EAPCET, student tools, scholarships, programming, and responsible AI-assisted development.';
    let canonical = SITE + '/blog/';
    if (article) { title = (article.seoTitle || article.title) + ' | Naa College'; description = article.seoDescription || article.summary; canonical = SITE + '/blog/' + article.slug + '/'; }
    else if (isCategory && currentCategory) { title = currentCategory + ' Guides | Naa College Blog'; description = 'Practical, student-focused guides in ' + currentCategory + ' from Naa College.'; canonical = SITE + '/blog/category/' + categorySlug(currentCategory) + '/'; }
    document.title = title;
    const setMeta = (selector: string, value: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); const match = selector.match(/(?:name|property)="([^"]+)"/); if (selector.includes('property=')) el.setAttribute('property', match?.[1] || ''); else el.setAttribute('name', match?.[1] || ''); document.head.appendChild(el); }
      el.content = value;
    };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:type"]', article ? 'article' : 'website');
    setMeta('meta[property="og:title"]', title); setMeta('meta[property="og:description"]', description); setMeta('meta[property="og:url"]', canonical);
    setMeta('meta[name="twitter:title"]', title); setMeta('meta[name="twitter:description"]', description); setMeta('meta[name="twitter:url"]', canonical);
    let canonicalElement = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalElement) { canonicalElement = document.createElement('link'); canonicalElement.rel = 'canonical'; document.head.appendChild(canonicalElement); }
    canonicalElement.href = canonical;
    let schema = document.getElementById('naa-blog-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'naa-blog-schema'; schema.setAttribute('type', 'application/ld+json'); document.head.appendChild(schema); }
    schema.textContent = JSON.stringify(article ? {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description: article.summary,
      datePublished: article.publishedAt, dateModified: article.updatedAt, mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'Naa College Editorial Desk', url: SITE + '/' },
      publisher: { '@type': 'Organization', name: 'Naa College Editorial Desk', url: SITE + '/' }
    } : { '@context': 'https://schema.org', '@type': 'Blog', name: 'Naa College Blog', url: SITE + '/blog/' });
    // Remove the static first-paint copy only after BlogPage has committed its
    // own article/listing DOM. This avoids a blank interval while React starts.
    requestAnimationFrame(() => document.getElementById('seo-prerender')?.remove());
    return () => { document.getElementById('naa-blog-schema')?.remove(); };
  }, [article, isCategory, currentCategory]);

  if (!isListing && !article) return <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-12"><BookOpen className="mx-auto h-10 w-10 text-cyan-600" /><h1 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Article not found</h1><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">This article may be unpublished or the URL may be incorrect. Only published articles are available here.</p><a href="/blog/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white"><ArrowLeft className="h-4 w-4" />Back to Blog</a></section>;

  if (article) return <article className="mx-auto max-w-6xl">
    <a href="/blog/" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-800 dark:text-cyan-300"><ArrowLeft className="h-4 w-4" />All articles</a>
    <header className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">{article.category}</p><h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl">{article.title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{article.summary}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Updated {article.updatedAt}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{readTime(article)} min read</span><span>By Naa College Editorial Desk</span></div></header>
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]"><div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-9"><ArticleBody content={article.content} />
      {article.sources.length > 0 && <section className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800"><h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Official and reference sources</h2><ul className="mt-3 space-y-2">{article.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer noopener" className="text-sm font-semibold text-cyan-800 underline underline-offset-4 dark:text-cyan-300">{source.label}</a></li>)}</ul></section>}
      {article.toolLinks.length > 0 && <section className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5 dark:border-cyan-900 dark:bg-cyan-950/30"><h2 className="font-extrabold text-slate-950 dark:text-white">Open a related Naa College tool</h2><div className="mt-3 flex flex-wrap gap-2">{article.toolLinks.map((link) => <a key={link.href} href={link.href} className="inline-flex items-center gap-2 rounded-xl bg-cyan-800 px-3 py-2 text-sm font-bold text-white">{link.label}<ArrowRight className="h-4 w-4" /></a>)}</div></section>}
      <p className="mt-8 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">Educational information only. Time-sensitive details should be confirmed with the relevant official authority or product documentation.</p>
    </div><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24"><h2 className="font-extrabold text-slate-950 dark:text-white">In this guide</h2><ol className="mt-3 space-y-2">{toc.map((heading) => <li key={heading}><a href={'#' + headingId(heading)} className="text-sm leading-5 text-slate-600 hover:text-cyan-700 dark:text-slate-300">{heading}</a></li>)}</ol><a href="/blog/" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-800 dark:text-cyan-300">Browse all guides <ArrowRight className="h-4 w-4" /></a></aside></div>
    {related.length > 0 && <section className="mt-8"><h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Related guides</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{related.map((item) => <ArticleCard key={item.slug} article={item} />)}</div></section>}
  </article>;

  return <div className="mx-auto max-w-7xl space-y-8">
    <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-cyan-50 p-6 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40 sm:p-10"><div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" /><div className="relative max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-200"><BookOpen className="h-4 w-4" />Naa College Knowledge Hub</span><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Practical guides for your next step.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Straightforward student guides for EAPCET counselling, Naa College tools, scholarships, programming, and responsible AI-assisted development. Verify important decisions with official sources.</p><label className="mt-6 flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950"><Search className="h-5 w-5 shrink-0 text-slate-400" /><span className="sr-only">Search published articles</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guides, tools, scholarships..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" /></label></div></header>
    <nav aria-label="Blog categories" className="flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={'shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ' + (category === item ? 'border-cyan-700 bg-cyan-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200')}>{item}</button>)}</nav>
    {query.trim() === '' && category === 'All' && !isCategory && <section><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Start here</p><h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Featured guides</h2></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{articles.filter((item) => item.featured).slice(0, 3).map((item) => <ArticleCard key={item.slug} article={item} />)}</div></section>}
    <section><div className="mb-4"><h2 className="text-2xl font-black text-slate-950 dark:text-white">{isCategory && currentCategory ? currentCategory : query ? 'Search results' : 'All published guides'}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filtered.length} {filtered.length === 1 ? 'article' : 'articles'}</p></div>{filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <ArticleCard key={item.slug} article={item} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700"><BookOpen className="mx-auto h-8 w-8 text-slate-400" /><h3 className="mt-3 font-bold text-slate-900 dark:text-white">No guides found</h3><p className="mt-1 text-sm text-slate-500">Try another search or choose a different category.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="mt-4 rounded-xl bg-cyan-800 px-4 py-2 text-sm font-bold text-white">Clear filters</button></div>}</section>
    <p className="border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">Article information is reviewed for publication, but admissions rules, deadlines, fees, product interfaces, and scholarship availability can change. Follow linked official sources for current decisions.</p>
  </div>;
};
