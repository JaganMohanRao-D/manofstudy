import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Landmark,
  MapPin,
  Search,
  Sparkles,
  Wrench,
  Users,
  BookMarked,
  LibraryBig,
} from 'lucide-react';
import './kineticMOS.css';
import './NaaHomepageRedesign.css';
import { WORKSPACES, FLAGSHIP_FEATURES } from './FeaturesHub';
import articlesData from '../data/blogArticles.generated.json';

const publishedArticles = articlesData
  .filter((article) => article.status === 'published')
  .slice()
  .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(b.updatedAt || b.publishedAt).localeCompare(String(a.updatedAt || a.publishedAt)))
  .slice(0, 3);

const TICKER_ITEMS = [
  { label: 'AP EAPCET allotments', detail: 'Explore available college-wise records', workspace: 'ap-allotments' },
  { label: 'TG EAPCET name-wise allotments', detail: 'Search Telangana allotment records', workspace: 'tg-allotments' },
  { label: 'College predictors', detail: 'Explore options by rank and preferences', workspace: 'ap-predictor' },
  { label: 'Scholarships hub', detail: 'Find student funding information', workspace: 'scholarships' },
  { label: 'Autonomous colleges directory', detail: 'Browse autonomy information', href: '/autonomous-colleges/' },
  { label: 'Mock test series', detail: 'Open the available practice tests', workspace: 'mock-tests' },
];

export const HeroSection = ({ activeWorkspace = 'hub', onSelectWorkspace }) => {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const shortcuts = [
    { title: 'AP EAPCET College Predictor', detail: 'College options from your rank and preferences', icon: Landmark, workspace: 'ap-predictor' },
    { title: 'Telangana College Predictor', detail: 'Explore TG college and branch options', icon: GraduationCap, workspace: 'tg-predictor' },
    { title: 'Scholarships', detail: 'Browse student funding resources', icon: BookMarked, workspace: 'scholarships' },
    { title: 'Student Tools', detail: 'Attendance, GPA, PDF and image tools', icon: Wrench, workspace: 'utilities' },
  ];

  const searchIndex = useMemo(() => {
    const items = [
      ...WORKSPACES.map((item) => ({
        title: item.title.replace(/^🎯\s*/, ''),
        detail: item.description || item.category || 'Student resource',
        workspace: item.workspace,
        keywords: item.category || '',
      })),
      ...FLAGSHIP_FEATURES.map((item) => ({
        title: item.title,
        detail: item.description || item.badge || 'Featured resource',
        workspace: item.workspace,
        keywords: item.badge || '',
      })),
      { title: 'Andhra Pradesh student tools', detail: 'AP EAPCET allotments, predictors and rank insights', target: 'regional-section-ap', keywords: 'andhra ap eapcet counselling' },
      { title: 'Telangana student tools', detail: 'TG EAPCET allotments, predictor and college insights', target: 'regional-section-tg', keywords: 'telangana tg eapcet counselling' },
      { title: 'Autonomous Colleges Directory', detail: 'Find colleges and review autonomy information', href: '/autonomous-colleges/', keywords: 'autonomous college university affiliation' },
      { title: 'Recent Blogs', detail: 'Read published student guides from Naa College', target: 'naa-recent-blogs', keywords: 'articles guides blog' },
      { title: 'PDF & Document Utilities', detail: 'Use document tools in your browser', workspace: 'utilities', keywords: 'pdf document merge split compress' },
      { title: 'Image Compressor', detail: 'Compress images for student documents', workspace: 'utilities', keywords: 'image photo compress' },
      { title: 'Mock Test Series', detail: 'Open the existing practice-test workspace', workspace: 'mock-tests', keywords: 'mock exam test cbt preparation' },
    ];
    return items.filter((item, index, all) =>
      all.findIndex((other) => other.title === item.title && other.workspace === item.workspace && other.target === item.target && other.href === item.href) === index
    );
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return searchIndex
      .map((item) => {
        const title = item.title.toLowerCase();
        const haystack = (item.title + ' ' + item.detail + ' ' + (item.keywords || '')).toLowerCase();
        const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 3 : haystack.includes(term) ? 1 : 0), 0);
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 7);
  }, [query, searchIndex]);

  const go = (workspace) => {
    setSearchOpen(false);
    onSelectWorkspace?.(workspace);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSearchResult = (item) => {
    setSearchOpen(false);
    if (item.href) {
      window.location.assign(item.href);
      return;
    }
    if (item.target) {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    go(item.workspace || 'hub');
  };

  const scrollToTools = () => document.getElementById('features-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const renderTickerItems = (duplicate = false) => TICKER_ITEMS.map((item, index) => {
    const common = {
      key: item.label + (duplicate ? '-loop' : ''),
      className: 'nc-ticker-item',
      tabIndex: duplicate ? -1 : undefined,
    };
    const contents = <><span>{item.label}</span><ArrowUpRight size={14} aria-hidden="true" /></>;
    return item.href
      ? <a {...common} href={item.href} aria-label={duplicate ? undefined : item.detail}>{contents}</a>
      : <button {...common} type="button" onClick={() => go(item.workspace)} aria-label={duplicate ? undefined : item.detail}>{contents}</button>;
  });

  return (
    <main className="naa-wireframe-home">
      <section className="nc-hero" aria-labelledby="nc-hero-title">
        <div className="nc-page-width nc-hero-grid">
          <div className="nc-hero-copy">
            <p className="nc-eyebrow"><span className="nc-eyebrow-dot" aria-hidden="true" /> Mana AP &amp; Telangana students kosam</p>
            <h1 id="nc-hero-title">College decisions — <span>ippudu inka clear ga.</span></h1>
            <p className="nc-hero-description">
              EAPCET allotments choodandi, colleges compare cheyyandi, scholarships vetakandi — mee engineering journey ki useful tools anni oke chota.
            </p>

            <div className="nc-state-cards" aria-label="Choose your state">
              <button
                type="button"
                className="nc-state-card nc-state-ap"
                onClick={() => go('ap-allotments')}
                aria-label="Explore Andhra Pradesh student resources"
              >
                <span className="nc-state-art nc-state-art-ap" aria-hidden="true">
                  <Landmark size={29} strokeWidth={1.7} />
                  <span className="nc-state-art-pin"><MapPin size={15} /></span>
                </span>
                <span className="nc-state-copy">
                  <span className="nc-state-label">FOR AP STUDENTS</span>
                  <strong>Andhra Pradesh</strong>
                  <small>Allotments, predictors &amp; rank insights</small>
                  <span className="nc-card-action">Explore AP <ArrowRight size={15} /></span>
                </span>
              </button>

              <button
                type="button"
                className="nc-state-card nc-state-tg"
                onClick={() => go('tg-allotments')}
                aria-label="Explore Telangana student resources"
              >
                <span className="nc-state-art nc-state-art-tg" aria-hidden="true">
                  <Building2 size={30} strokeWidth={1.7} />
                  <span className="nc-state-art-pin"><MapPin size={15} /></span>
                </span>
                <span className="nc-state-copy">
                  <span className="nc-state-label">FOR TG STUDENTS</span>
                  <strong>Telangana</strong>
                  <small>College discovery &amp; seat records</small>
                  <span className="nc-card-action">Explore TG <ArrowRight size={15} /></span>
                </span>
              </button>
            </div>
            <p className="nc-hero-note"><CheckCircle2 size={15} aria-hidden="true" /> Student resources, clear context. Important counselling decisions ni official sources tho verify cheyyandi.</p>
          </div>

          <div className="nc-video-column">
            <div className="nc-video-frame">
              <video
                className="nc-campus-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noplaybackrate noremoteplayback"
                poster="/Vibrant%20Campus%20Life%20Illustration.webp"
                aria-label="Naa College introduction video"
              >
                <source src="/HERO_VEDIO.webm" type="video/webm" />
                Your browser does not support the Naa College introduction video.
              </video>
            </div>
            <div className="nc-video-footnote"><span>ADMISSIONS</span><i aria-hidden="true" /><span>ACADEMICS</span><i aria-hidden="true" /><span>STUDENT LIFE</span></div>
          </div>
        </div>
      </section>

      <section className="nc-ticker-strip" aria-label="Latest updates and student resources">
        <div className="nc-page-width nc-ticker-inner">
          <div className="nc-ticker-label"><Sparkles size={16} aria-hidden="true" /><span>LATEST UPDATES</span></div>
          <div className="nc-ticker-viewport">
            <div className="nc-ticker-track">
              <div className="nc-ticker-group">{renderTickerItems(false)}</div>
              <div className="nc-ticker-group" aria-hidden="true">{renderTickerItems(true)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="nc-quick-section nc-page-width" aria-labelledby="nc-quick-title">
        <div className="nc-quick-heading">
          <span className="nc-section-kicker">FIND WHAT YOU NEED</span>
          <h2 id="nc-quick-title">Quick Links<span>.</span></h2>
          <p>College, scholarship, tool search cheyyandi.</p>
        </div>
        <div className="nc-quick-content">
          <div className="nc-search-wrap">
            <Search size={20} aria-hidden="true" />
            <label className="nc-sr-only" htmlFor="nc-resource-search">Search colleges, scholarships and student tools</label>
            <input
              id="nc-resource-search"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && matches[0]) {
                  event.preventDefault();
                  openSearchResult(matches[0]);
                }
                if (event.key === 'Escape') setSearchOpen(false);
              }}
              placeholder="College, scholarship, tool search cheyyandi..."
              aria-expanded={searchOpen && query.trim().length >= 2}
              aria-controls="nc-search-results"
              autoComplete="off"
              type="search"
            />
            <button type="button" className="nc-search-submit" onClick={() => matches[0] ? openSearchResult(matches[0]) : (setSearchOpen(true), scrollToTools())}>
              Search <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
          {searchOpen && query.trim().length >= 2 && (
            <div className="nc-search-results" id="nc-search-results" role="status" aria-live="polite">
              {matches.length ? matches.map((item) => (
                <button type="button" key={item.title + (item.workspace || item.target || item.href || '')} onClick={() => openSearchResult(item)} className="nc-search-result">
                  <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              )) : <p className="nc-search-empty">No matching resources. Try “AP”, “TG”, “scholarship”, “PDF” or “attendance”.</p>}
            </div>
          )}

          <div className="nc-shortcut-grid" aria-label="Popular quick links">
            {shortcuts.map((item, index) => {
              const Icon = item.icon;
              return (
                <button type="button" className={'nc-shortcut nc-shortcut-' + (index + 1)} key={item.title} onClick={() => go(item.workspace)}>
                  <span className="nc-shortcut-icon"><Icon size={19} aria-hidden="true" /></span>
                  <span className="nc-shortcut-text"><strong>{item.title}</strong><small>{item.detail}</small></span>
                  <ArrowRight className="nc-shortcut-arrow" size={17} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="nc-discovery-section" aria-label="Explore more student resources">
        <div className="nc-page-width nc-discovery-grid">
          <article className="nc-discovery-card nc-autonomous-card">
            <div className="nc-discovery-art nc-autonomous-art" aria-hidden="true">
              <div className="nc-art-paper"><LibraryBig size={40} strokeWidth={1.45} /><span /><span /><span /></div>
              <div className="nc-art-stamp">COLLEGE<br />GUIDE</div>
            </div>
            <div className="nc-discovery-copy">
              <span className="nc-section-kicker">COLLEGE DISCOVERY</span>
              <h2>Autonomous Colleges</h2>
              <p>Autonomous colleges kosam vetukuthunnara? AP, Telangana colleges search cheyyandi; autonomy and affiliating university details choodandi.</p>
              <a href="/autonomous-colleges/" className="nc-primary-link">Explore colleges <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </article>

          <article className="nc-discovery-card nc-mock-card">
            <div className="nc-discovery-art nc-mock-art" aria-hidden="true">
              <div className="nc-test-sheet"><span className="nc-test-sheet-top" /><span /><span /><span /><span /></div>
              <div className="nc-test-score"><ClipboardCheck size={23} /><strong>TEST</strong><small>Practice mode</small></div>
            </div>
            <div className="nc-discovery-copy">
              <span className="nc-section-kicker">PRACTISE &amp; PREPARE</span>
              <h2>Mock Test Series</h2>
              <p>Mee preparation ela undo test chesukondi. Available mock tests start chesi, mee score and progress ni review cheyyandi.</p>
              <button type="button" className="nc-primary-link" onClick={() => go('mock-tests')}>Explore mock tests <ArrowRight size={16} aria-hidden="true" /></button>
            </div>
          </article>
        </div>
      </section>

      <section id="naa-recent-blogs" className="nc-blogs-section nc-page-width" aria-labelledby="nc-blogs-title">
        <div className="nc-section-heading-row">
          <div>
            <span className="nc-section-kicker">READ · LEARN · GET AHEAD</span>
            <h2 id="nc-blogs-title">NAA COLLEGE <span>— RECENT BLOGS</span></h2>
            <p>Student guides and practical explainers, together in one place.</p>
          </div>
          <a className="nc-all-blogs-link" href="/blog/">View all blogs <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="nc-laptop-device" aria-label="Recent Naa College blogs displayed on a laptop screen">
          <div className="nc-laptop-lid">
            <span className="nc-laptop-camera" aria-hidden="true" />
            <div className="nc-laptop-screen">
              <div className="nc-laptop-toolbar" aria-hidden="true">
                <span className="nc-laptop-brand-icon"><BookOpen size={16} /></span>
                <strong>NAA COLLEGE</strong>
                <span className="nc-laptop-toolbar-divider" />
                <span className="nc-laptop-toolbar-subtitle">STUDENT KNOWLEDGE DESK</span>
                <span className="nc-laptop-toolbar-spacer" />
                <span className="nc-laptop-toolbar-status"><i /> ONLINE</span>
              </div>
              <div className="nc-laptop-content">
                <div className="nc-laptop-content-heading">
                  <span className="nc-laptop-overline">THE LATEST FROM OUR BLOG</span>
                  <strong>Ideas that move you forward.</strong>
                  <span className="nc-laptop-count">03 GUIDES <Sparkles size={13} /></span>
                </div>
                <div className="nc-blogs-grid nc-laptop-blog-grid">
          {publishedArticles.map((article, index) => (
            <article className={'nc-blog-card nc-blog-card-' + (index + 1)} key={article.slug}>
              <a href={'/blog/' + article.slug + '/'} className="nc-blog-art-link" aria-label={'Read ' + article.title}>
                <div className={'nc-blog-art nc-blog-art-' + (index + 1)} aria-hidden="true">
                  {index === 0 ? (
                    <>
                      <span className="nc-art-index">AP / 01</span>
                      <Landmark className="nc-blog-main-icon" size={47} strokeWidth={1.4} />
                      <div className="nc-rank-ticket"><span>RANK</span><i /><i /><i /></div>
                    </>
                  ) : index === 1 ? (
                    <>
                      <span className="nc-art-index">TG / 02</span>
                      <div className="nc-map-lines"><i /><i /><i /><i /></div>
                      <Building2 className="nc-blog-main-icon" size={44} strokeWidth={1.4} />
                      <span className="nc-map-pin"><MapPin size={17} /></span>
                    </>
                  ) : (
                    <>
                      <span className="nc-art-index">GUIDE / 03</span>
                      <div className="nc-result-sheet"><ClipboardCheck size={35} /><span /><span /><span /></div>
                      <BookOpen className="nc-blog-main-icon" size={32} strokeWidth={1.5} />
                    </>
                  )}
                </div>
              </a>
              <div className="nc-blog-body">
                <div className="nc-blog-meta"><span>{article.category || 'Student guide'}</span><span className="nc-blog-meta-dot" aria-hidden="true" /></div>
                <h3><a href={'/blog/' + article.slug + '/'}>{article.title}</a></h3>
                <p>{article.summary}</p>
                <a href={'/blog/' + article.slug + '/'} className="nc-read-article">Read article <ArrowRight size={16} aria-hidden="true" /></a>
              </div>
            </article>
          ))}
                </div>
              </div>
            </div>
          </div>
          <div className="nc-laptop-base" aria-hidden="true">
            <span className="nc-laptop-trackpad" />
          </div>
        </div>
      </section>



    </main>
  );
};

export default HeroSection;
