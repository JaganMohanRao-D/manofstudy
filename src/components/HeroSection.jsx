import React, { useEffect, useMemo, useState } from 'react';
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
  FileText,
  Image as ImageIcon,
  Target,
  Clock3,
  ShieldCheck,
  Zap,
  CalendarDays,
  Wallet,
  CheckCircle2 as VerifiedIcon,
} from 'lucide-react';
import './kineticMOS.css';
import './NaaHomepageRedesign.css';
import { WORKSPACES, FLAGSHIP_FEATURES } from './FeaturesHub';
import articlesData from '../data/blogArticles.json';

const publishedArticles = articlesData
  .filter((article) => article.status === 'published')
  .slice()
  .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(b.updatedAt || b.publishedAt).localeCompare(String(a.updatedAt || a.publishedAt)))
  .slice(0, 3);

const scholarshipDeadlineDate = (value) => {
  const text = String(value || '');
  const iso = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const long = text.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if (!long) return null;
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  return new Date(Number(long[3]), months.indexOf(long[2].toLowerCase()), Number(long[1]));
};
const getActiveFeaturedScholarships = (items) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return items
    .map((item) => ({ ...item, _deadlineDate: scholarshipDeadlineDate(item.deadline) }))
    .filter((item) => {
      const status = String(item.status || '').toLowerCase();
      return item._deadlineDate && item._deadlineDate >= today &&
        /open|live|registration|renewal/.test(status) &&
        !/closed|expired|ended|not confirmed/.test(status);
    })
    .sort((a, b) => a._deadlineDate - b._deadlineDate)
    .slice(0, 3);
};

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
  const [featuredScholarships, setFeaturedScholarships] = useState([]);
  const [scholarshipsLoaded, setScholarshipsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/indian_scholarships.json')
      .then((response) => {
        if (!response.ok) throw new Error('Scholarship data unavailable');
        return response.json();
      })
      .then((items) => {
        if (active && Array.isArray(items)) setFeaturedScholarships(getActiveFeaturedScholarships(items));
      })
      .catch(() => { if (active) setFeaturedScholarships([]); })
      .finally(() => { if (active) setScholarshipsLoaded(true); });
    return () => { active = false; };
  }, []);

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

  const scrollToTools = () => (document.getElementById('nc-student-tools') || document.getElementById('features-hub'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
            <h1 id="nc-hero-title">Your next chapter — <span>planned with clarity.</span></h1>
            <p className="nc-hero-description">
              Explore AP &amp; Telangana admission data, compare college options, discover funding and find practical tools for your student journey.
            </p>

            <div className="nc-state-cards" aria-label="Choose your state">
              <button
                type="button"
                className="nc-state-card nc-state-ap"
                onClick={() => go('ap-allotments')}
                aria-label="Explore Andhra Pradesh student resources"
              >
                <span className="nc-state-art nc-state-art-ap" aria-hidden="true">
                  <img src="/andhra-outline.webp" alt="" width="58" height="58" loading="eager" />
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
                  <img src="/telangana-outline.webp" alt="" width="58" height="58" loading="eager" />
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
          <div className="nc-ticker-label"><Sparkles size={16} aria-hidden="true" /><span>STUDENT RESOURCE SHORTCUTS</span></div>
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
          <span className="nc-section-kicker">ONE PLACE TO GET STARTED</span>
          <h2 id="nc-quick-title">Start with what <span>you need.</span></h2>
          <p>Search student tools, college resources and guidance in one place.</p>
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


      <section id="nc-student-tools" className="nc-home-tools" aria-labelledby="nc-home-tools-title">
        <div className="nc-page-width">
          <div className="nc-home-section-head">
            <div>
              <span className="nc-home-kicker"><Wrench size={14} aria-hidden="true" /> STUDENT UTILITY ENGINE</span>
              <h2 id="nc-home-tools-title">Everyday student tasks, <span>made easier.</span></h2>
              <p>Useful browser tools for admission forms, documents and the small academic jobs that take too much time.</p>
            </div>
            <div className="nc-home-head-aside" aria-label="Tool benefits">
              <span><ShieldCheck size={14} /> Files stay in your browser where supported</span>
              <span><Sparkles size={14} /> Free student resources</span>
            </div>
          </div>
          <div className="nc-home-tools-grid">
            <article className="nc-home-tool-card nc-home-tool-card-featured">
              <div className="nc-home-tool-card-top"><span className="nc-home-tool-badge"><Zap size={13} /> MOST USED</span><span className="nc-home-tool-index">01</span></div>
              <div className="nc-home-tool-visual nc-home-pdf-visual" aria-hidden="true">
                <div className="nc-home-file-sheet"><FileText size={35} /><span /><span /><span /><b>PDF</b></div>
                <span className="nc-home-visual-orbit nc-home-orbit-one" /><span className="nc-home-visual-orbit nc-home-orbit-two" />
              </div>
              <h3>PDF Compress &amp; Document Tools</h3>
              <p>Reduce the size of certificates, rank cards and application documents, or open the wider PDF toolkit.</p>
              <div className="nc-home-tool-tags"><span>Admission-ready files</span><span>Browser-based tools</span></div>
              <button type="button" className="nc-home-card-action" onClick={() => go('utilities')}>Open PDF toolkit <ArrowRight size={16} /></button>
            </article>
            <article className="nc-home-tool-card">
              <div className="nc-home-tool-card-top"><span className="nc-home-tool-badge nc-home-tool-badge-green"><ImageIcon size={13} /> IMAGE PREP</span><span className="nc-home-tool-index">02</span></div>
              <div className="nc-home-tool-visual nc-home-image-visual" aria-hidden="true">
                <div className="nc-home-photo-sheet"><ImageIcon size={34} /><span className="nc-home-photo-sun" /><span className="nc-home-photo-hill" /></div>
                <span className="nc-home-resize-corner" /><span className="nc-home-resize-corner nc-home-resize-corner-br" />
              </div>
              <h3>Image &amp; Signature Prep</h3>
              <p>Find image, scan and document utilities for common application-upload requirements.</p>
              <div className="nc-home-tool-tags"><span>JPG · PNG · WebP</span><span>Student uploads</span></div>
              <button type="button" className="nc-home-card-action" onClick={() => go('utilities')}>Explore image tools <ArrowRight size={16} /></button>
            </article>
            <article className="nc-home-tool-card">
              <div className="nc-home-tool-card-top"><span className="nc-home-tool-badge nc-home-tool-badge-blue"><Clock3 size={13} /> ACADEMICS</span><span className="nc-home-tool-index">03</span></div>
              <div className="nc-home-tool-visual nc-home-academic-visual" aria-hidden="true">
                <div className="nc-home-calculator"><div className="nc-home-calculator-screen">A+</div><span /><span /><span /><span /><span /><span /></div>
                <div className="nc-home-calculator-note"><CheckCircle2 size={18} /><b>Plan clearly</b></div>
              </div>
              <h3>Attendance Planner</h3>
              <p>Estimate attendance scenarios and understand how many classes you may need to attend to reach your target.</p>
              <div className="nc-home-tool-tags"><span>Attendance</span><span>Attendance target</span></div>
              <button type="button" className="nc-home-card-action" onClick={() => go('attendance')}>Open attendance planner <ArrowRight size={16} /></button>
            </article>
          </div>
          <div className="nc-home-tools-bottom"><span>Need something else?</span><button type="button" onClick={() => go('utilities')}>Browse the full student toolkit <ArrowUpRight size={15} /></button></div>
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


      <section id="nc-practice-zone" className="nc-home-practice" aria-labelledby="nc-practice-title">
        <div className="nc-page-width">
          <div className="nc-practice-hero">
            <div className="nc-practice-copy">
              <span className="nc-practice-kicker"><Target size={14} /> PRACTISE WITH PURPOSE</span>
              <h2 id="nc-practice-title">Walk into the exam <span>better prepared.</span></h2>
              <p>Get familiar with timed computer-based practice, question navigation and review before exam day. Choose the test that matches your preparation.</p>
              <div className="nc-practice-benefits"><span><Clock3 size={16} /> Timed practice</span><span><CheckCircle2 size={16} /> Score review</span><span><ShieldCheck size={16} /> Learn at your pace</span></div>
              <div className="nc-practice-actions">
                <button type="button" className="nc-practice-primary" onClick={() => go('mock-tests')}>Browse mock tests <ArrowRight size={17} /></button>
                <button type="button" className="nc-practice-secondary" onClick={() => go('eapcet-cbt')}>Open EAPCET simulator <ArrowUpRight size={16} /></button>
              </div>
            </div>
            <div className="nc-practice-visual" aria-hidden="true">
              <div className="nc-practice-glow" />
              <div className="nc-practice-monitor">
                <div className="nc-monitor-top"><span /><span /><span /><b>Practice workspace</b></div>
                <div className="nc-monitor-body">
                  <div className="nc-monitor-sidebar"><i /><i /><i /><i /></div>
                  <div className="nc-monitor-content"><b className="nc-monitor-question">Question 01</b><span className="nc-monitor-line nc-monitor-line-long" /><span className="nc-monitor-line" />
                    <div className="nc-monitor-option"><i /> Option A</div><div className="nc-monitor-option"><i /> Option B</div><div className="nc-monitor-option"><i /> Option C</div><div className="nc-monitor-option"><i /> Option D</div>
                  </div>
                  <div className="nc-monitor-timer"><Clock3 size={14} /><b>02:45</b><small>TIME LEFT</small></div>
                </div>
              </div>
              <div className="nc-practice-float nc-practice-float-score"><CheckCircle2 size={18} /><span><b>Review your work</b><small>Learn from each attempt</small></span></div>
              <div className="nc-practice-float nc-practice-float-questions"><Target size={18} /><span><b>Practice mode</b><small>One question at a time</small></span></div>
            </div>
          </div>
          <div className="nc-practice-options" aria-label="Available practice options">
            <button type="button" onClick={() => go('eapcet-cbt')} className="nc-practice-option nc-practice-option-ap"><span className="nc-practice-option-symbol">AP</span><span className="nc-practice-option-copy"><b>AP EAPCET Practice</b><small>Engineering pattern and rank-context tools</small></span><ArrowUpRight size={18} /></button>
            <button type="button" onClick={() => go('eapcet-cbt')} className="nc-practice-option nc-practice-option-tg"><span className="nc-practice-option-symbol">TG</span><span className="nc-practice-option-copy"><b>Telangana EAPCET Practice</b><small>Build familiarity with CBT-style questions</small></span><ArrowUpRight size={18} /></button>
            <button type="button" onClick={() => go('mock-tests')} className="nc-practice-option nc-practice-option-general"><span className="nc-practice-option-symbol"><BookOpen size={21} /></span><span className="nc-practice-option-copy"><b>More Mock Tests</b><small>Explore the available student test library</small></span><ArrowUpRight size={18} /></button>
          </div>
        </div>
      </section>

      <section id="naa-recent-blogs" className="nc-blogs-section nc-page-width" aria-labelledby="nc-blogs-title">
        <div className="nc-section-heading-row">
          <div>
            <span className="nc-section-kicker">READ · LEARN · GET AHEAD</span>
            <h2 id="nc-blogs-title">STUDENT FIELD NOTES <span>— GUIDES &amp; INSIGHTS</span></h2>
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


      <section className="nc-featured-scholarships nc-page-width" aria-labelledby="nc-featured-scholarships-title">
        <div className="nc-section-heading-row">
          <div>
            <span className="nc-section-kicker">FUND YOUR NEXT STEP</span>
            <h2 id="nc-featured-scholarships-title">FUND YOUR <span>NEXT STEP</span></h2>
            <p>Explore listed opportunities, compare eligibility details and follow the provider links before you apply.</p>
          </div>
          <a className="nc-all-blogs-link" href="/scholarships/">Explore all scholarships <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        {featuredScholarships.length > 0 ? (
          <div className="nc-featured-scholarship-grid">
            {featuredScholarships.map((item) => (
              <a className="nc-featured-scholarship-card" key={item.id} href={'/scholarships/' + String(item.title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '/'}>
                <div className="nc-featured-scholarship-topline"><span><Sparkles size={14} /> ACTIVE LISTING</span><ArrowUpRight size={18} aria-hidden="true" /></div>
                <h3 className="nc-featured-scholarship-title">{item.title}</h3>
                <div className="nc-featured-scholarship-facts">
                  <div><span><Wallet size={14} /> AMOUNT / AWARD</span><strong>{item.amount || 'Amount not confirmed'}</strong></div>
                  <div><span><CalendarDays size={14} /> DEADLINE</span><strong>{item.deadline || 'Check official source'}</strong></div>
                </div>
                <div className="nc-featured-scholarship-copy"><strong>SCHOLARSHIP DETAILS</strong><p>{item.description || item.target || 'Read the official scheme details.'}</p></div>
                <div className="nc-featured-scholarship-copy nc-featured-scholarship-eligibility"><strong>ELIGIBILITY</strong><p>{item.eligibility || item.target || 'Check the current provider guidelines.'}</p></div>
                <span className="nc-featured-scholarship-cta">View full scholarship details <ArrowRight size={16} aria-hidden="true" /></span>
              </a>
            ))}
          </div>
        ) : (
          <div className="nc-featured-scholarship-empty">
            {scholarshipsLoaded ? 'No upcoming deadlines are currently confirmed in the scholarship dataset. Check the full hub for updates.' : 'Checking currently listed scholarship deadlines…'}
          </div>
        )}
        <p className="nc-featured-scholarship-note"><VerifiedIcon size={15} aria-hidden="true" /> Dates and eligibility can change. Confirm details on the scholarship provider’s official portal before applying.</p>
      </section>


      <section className="nc-home-pathways" aria-labelledby="nc-pathways-title">
        <div className="nc-page-width">
          <div className="nc-pathways-panel">
            <div className="nc-pathways-copy">
              <span className="nc-home-kicker nc-pathways-kicker"><Sparkles size={14} /> YOUR NEXT STEP STARTS HERE</span>
              <h2 id="nc-pathways-title">Not sure what to learn next? <span>Start with a clear plan.</span></h2>
              <p>Use the AI Student Gap Analyzer to reflect on your current skills, identify learning priorities and organise practical milestones around your goals.</p>
              <div className="nc-pathway-chips"><span>Skills to strengthen</span><span>Project directions</span><span>Learning milestones</span></div>
              <button type="button" className="nc-pathways-action" onClick={() => go('gap-analyzer')}>Build my learning plan <ArrowRight size={17} /></button>
              <small className="nc-pathways-note">Guidance to help you plan—not a guarantee of an internship or placement.</small>
            </div>
            <div className="nc-pathways-board" aria-label="Example learning plan stages">
              <div className="nc-pathway-board-top"><span><Sparkles size={15} /> LEARNING MAP</span><span className="nc-pathway-board-live"><i /> READY TO EXPLORE</span></div>
              <div className="nc-pathway-step nc-pathway-step-one"><span className="nc-pathway-step-number">01</span><span><b>Understand your starting point</b><small>Skills, interests and current level</small></span><CheckCircle2 size={18} /></div>
              <div className="nc-pathway-connector" />
              <div className="nc-pathway-step nc-pathway-step-two"><span className="nc-pathway-step-number">02</span><span><b>Choose priority topics</b><small>Focus on what matters next</small></span><Target size={18} /></div>
              <div className="nc-pathway-connector" />
              <div className="nc-pathway-step nc-pathway-step-three"><span className="nc-pathway-step-number">03</span><span><b>Turn learning into projects</b><small>Practise, review and iterate</small></span><ArrowUpRight size={18} /></div>
              <div className="nc-pathway-board-footer"><ShieldCheck size={14} /> Student-first guidance, one practical step at a time.</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HeroSection;
