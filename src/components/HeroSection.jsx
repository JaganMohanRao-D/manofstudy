import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
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
import './NaaDesignFoundation.css';
import { NaaCollegeAssistant } from './NaaCollegeAssistant';
import { WORKSPACES, FLAGSHIP_FEATURES } from './FeaturesHub';
import articlesData from '../data/blogArticles.json';
import editorialArticlesData from '../data/editorialBlogArticles.generated.json';

const publishedArticles = [...articlesData, ...editorialArticlesData]
  .filter((article) => article.status === 'published')
  .slice()
  .sort((a, b) =>
    String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) ||
    String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) ||
    a.title.localeCompare(b.title)
  )
  .slice(0, 5);

const latestBlogArticle = publishedArticles[0] || null;

const scholarshipDeadlineDate = (value) => {
  const text = String(value || '');
  const iso = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const long = text.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if (!long) return null;
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  return new Date(Number(long[3]), months.indexOf(long[2].toLowerCase()), Number(long[1]));
};
const getFeaturedScholarships = (items) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const getPriority = (item) => {
    const status = String(item.status || '').toLowerCase();
    const deadline = item._deadlineDate;
    const explicitlyClosed = /closed|expired|ended/.test(status);
    const uncertain = /not confirmed|not verified|unknown/.test(status);
    const currentlyOpen = deadline && deadline >= today &&
      /open|live|registration|renewal/.test(status) &&
      !explicitlyClosed && !uncertain;
    if (currentlyOpen) return 0;
    if (!explicitlyClosed && !uncertain && (!deadline || deadline >= today)) return 1;
    if (uncertain) return 2;
    return 3;
  };
  return items
    .filter((item) => item && item.title)
    .map((item) => ({ ...item, _deadlineDate: scholarshipDeadlineDate(item.deadline) }))
    .sort((a, b) => {
      const priorityDifference = getPriority(a) - getPriority(b);
      if (priorityDifference) return priorityDifference;
      const aDate = a._deadlineDate ? a._deadlineDate.getTime() : Number.POSITIVE_INFINITY;
      const bDate = b._deadlineDate ? b._deadlineDate.getTime() : Number.POSITIVE_INFINITY;
      if (aDate !== bDate) return aDate - bDate;
      return String(a.title).localeCompare(String(b.title));
    });
};

const TICKER_ITEMS = [
  { label: 'AP EAPCET College-Wise Allotments', detail: 'Explore available historical allotment records', workspace: 'ap-allotments' },
  { label: 'EAPCET Web Options Generator', detail: 'Organise your college and branch preferences', workspace: 'ap-web-options' },
  { label: 'AP College Predictor', detail: 'Explore rank matches using historical data', workspace: 'ap-predictor' },
  { label: 'TG EAPCET name-wise allotments', detail: 'Search Telangana allotment records', workspace: 'tg-allotments' },
  { label: 'Scholarships hub', detail: 'Find student funding information', workspace: 'scholarships' },
  { label: 'Autonomous colleges directory', detail: 'Browse autonomy information', href: '/autonomous-colleges/' },
  { label: 'Mock test series', detail: 'Open the available practice tests', workspace: 'mock-tests' },
];

export const HeroSection = ({ activeWorkspace = 'hub', onSelectWorkspace }) => {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [featuredScholarships, setFeaturedScholarships] = useState([]);
  const [scholarshipsLoaded, setScholarshipsLoaded] = useState(false);
  const [activeBlogIndex, setActiveBlogIndex] = useState(0);
  const blogTouchStartX = useRef(null);
  const activeBlogArticle = publishedArticles[activeBlogIndex] || null;
  const changeFeaturedBlog = (direction) => {
    setActiveBlogIndex((current) => (current + direction + publishedArticles.length) % publishedArticles.length);
  };
  const handleBlogKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeFeaturedBlog(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeFeaturedBlog(1);
    }
  };
  const formatBlogPublishedDate = (value) => {
    if (!value) return '';
    const date = new Date(value + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  useEffect(() => {
    let active = true;
    fetch('/indian_scholarships.json')
      .then((response) => {
        if (!response.ok) throw new Error('Scholarship data unavailable');
        return response.json();
      })
      .then((items) => {
        if (active && Array.isArray(items)) setFeaturedScholarships(getFeaturedScholarships(items));
      })
      .catch(() => { if (active) setFeaturedScholarships([]); })
      .finally(() => { if (active) setScholarshipsLoaded(true); });
    return () => { active = false; };
  }, []);

  const shortcuts = [
    { title: 'AP College Predictor', detail: 'Explore rank matches with available historical data', icon: Landmark, workspace: 'ap-predictor' },
    { title: 'Telangana College Predictor', detail: 'Explore TG college and branch options', icon: GraduationCap, workspace: 'tg-predictor' },
    { title: 'EAPCET Web Options Generator', detail: 'Build a preference draft from historical ranks', icon: ClipboardCheck, workspace: 'ap-web-options' },
    { title: 'AP B.Tech Colleges', detail: 'Compare available branch-rank patterns', icon: LibraryBig, workspace: 'ap-top-colleges' },
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
            <div
              className="nc-video-frame"
              onContextMenu={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
              onCopy={(event) => event.preventDefault()}
            >
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
                draggable={false}
                onContextMenu={(event) => event.preventDefault()}
                onDragStart={(event) => event.preventDefault()}
                onCopy={(event) => event.preventDefault()}
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

      <section id="naa-recent-blogs" className="nc-premium-blogs-section nc-phone-blogs-section" aria-labelledby="nc-blogs-title">
        <div className="nc-page-width nc-premium-blogs-inner">
          <div className="nc-premium-blogs-heading nc-phone-blogs-heading">
            <span className="nc-premium-blogs-kicker"><span aria-hidden="true" /> LATEST STORIES</span>
            <h2 id="nc-blogs-title">RECENT <span>BLOGS</span></h2>
            <p>Latest admissions updates, education news, exam notifications and practical student guides.</p>
            <span className="nc-phone-heading-rule" aria-hidden="true" />
          </div>
          {activeBlogArticle ? (
            <div
              className="nc-phone-blog-stage"
              aria-label="Featured Naa College articles. Use the arrow keys to browse."
              tabIndex={0}
              onKeyDown={handleBlogKeyDown}
              onTouchStart={(event) => { blogTouchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
              onTouchEnd={(event) => {
                if (blogTouchStartX.current === null) return;
                const distance = event.changedTouches[0].clientX - blogTouchStartX.current;
                if (Math.abs(distance) > 45) changeFeaturedBlog(distance < 0 ? 1 : -1);
                blogTouchStartX.current = null;
              }}
            >
              <div className="nc-phone-blog-device">
                <div className="nc-phone-blog-side-button nc-phone-blog-side-button-left" aria-hidden="true" />
                <div className="nc-phone-blog-side-button nc-phone-blog-side-button-right" aria-hidden="true" />
                <div className="nc-phone-blog-bezel">
                  <div className="nc-phone-blog-notch" aria-hidden="true"><span /><i /></div>
                  <div className="nc-phone-blog-screen">
                    <div className="nc-phone-blog-statusbar" aria-hidden="true">
                      <span>9:41</span>
                      <span className="nc-phone-blog-status-icons"><i /><i /><b /></span>
                    </div>
                    <div className="nc-phone-blog-screen-header">
                      <div className="nc-phone-blog-screen-heading">
                        <span className="nc-phone-blog-screen-marker" aria-hidden="true" />
                        <div><h3>Recent Blogs</h3><p>Latest official updates</p></div>
                      </div>
                      <a href="/blog/" className="nc-phone-blog-view-all">View all <ArrowRight size={15} aria-hidden="true" /></a>
                    </div>
                    <div className="nc-phone-blog-featured-line">
                      <span><i aria-hidden="true" /> FEATURED ({activeBlogIndex + 1} OF {publishedArticles.length})</span>
                      <div className="nc-phone-blog-mini-dots" aria-hidden="true">
                        {publishedArticles.map((article, index) => <i key={article.slug} className={index === activeBlogIndex ? 'is-active' : ''} />)}
                      </div>
                    </div>
                    <article className="nc-phone-blog-article" aria-live="polite">
                      <a className="nc-phone-blog-cover-link" href={'/blog/' + activeBlogArticle.slug + '/'} aria-label={'Read ' + activeBlogArticle.title}>
                        {activeBlogArticle.coverImage ? (
                          <img
                            className="nc-phone-blog-cover"
                            src={activeBlogArticle.coverImage}
                            alt=""
                            loading={activeBlogIndex === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                          />
                        ) : (
                          <div className="nc-phone-blog-cover-fallback" aria-hidden="true">
                            <BookOpen size={48} strokeWidth={1.4} />
                            <span>NAA COLLEGE</span>
                          </div>
                        )}
                      </a>
                      <div className="nc-phone-blog-article-copy">
                        <span className="nc-phone-blog-category">{activeBlogArticle.category || 'STUDENT GUIDES'}</span>
                        <h4><a href={'/blog/' + activeBlogArticle.slug + '/'}>{activeBlogArticle.title}</a></h4>
                        <p>{activeBlogArticle.summary}</p>
                        <div className="nc-phone-blog-article-footer">
                          <div className="nc-phone-blog-date"><CalendarDays size={15} aria-hidden="true" /><time dateTime={activeBlogArticle.publishedAt || undefined}>{formatBlogPublishedDate(activeBlogArticle.publishedAt) || 'Recently published'}</time></div>
                          <a href={'/blog/' + activeBlogArticle.slug + '/'} className="nc-phone-blog-read">READ ARTICLE <ArrowRight size={16} aria-hidden="true" /></a>
                        </div>
                      </div>
                    </article>
                    <div className="nc-phone-blog-bottom-controls">
                      <div className="nc-phone-blog-dots" role="group" aria-label="Choose a featured article">
                        {publishedArticles.map((article, index) => (
                          <button
                            key={article.slug}
                            type="button"
                            className={'nc-phone-blog-dot' + (index === activeBlogIndex ? ' is-active' : '')}
                            onClick={() => setActiveBlogIndex(index)}
                            aria-label={'Show article ' + (index + 1) + ': ' + article.title}
                            aria-current={index === activeBlogIndex ? 'true' : undefined}
                          />
                        ))}
                      </div>
                      <div className="nc-phone-blog-arrows">
                        <button type="button" onClick={() => changeFeaturedBlog(-1)} aria-label="Previous featured article"><ArrowLeft size={17} aria-hidden="true" /></button>
                        <button type="button" onClick={() => changeFeaturedBlog(1)} aria-label="Next featured article"><ArrowRight size={17} aria-hidden="true" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="nc-featured-blog-empty">No published articles are available yet. <a href="/blog/">Visit all articles <ArrowRight size={15} /></a></div>
          )}
          <a href="/blog/" className="nc-phone-blog-mobile-view-all">VIEW ALL ARTICLES <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </section>


      <section className="nc-featured-scholarships nc-page-width" aria-labelledby="nc-featured-scholarships-title">
        <div className="nc-section-heading-row">
          <div>
            <span className="nc-section-kicker">FUND YOUR NEXT STEP</span>
            <h2 id="nc-featured-scholarships-title">FUND YOUR <span>NEXT STEP</span></h2>
            <p>Browse the cards horizontally to explore listed scholarships, compare eligibility details and confirm current application status before applying.</p>
          </div>
          <a className="nc-all-blogs-link" href="/scholarships/">Explore all scholarships <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        {featuredScholarships.length > 0 ? (
          <div className="nc-featured-scholarship-grid">
            {featuredScholarships.map((item) => (
              <a className="nc-featured-scholarship-card" key={item.id} href={'/scholarships/' + String(item.title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '/'}>
                <div className="nc-featured-scholarship-topline"><span><Sparkles size={14} /> SCHOLARSHIP LISTING</span><ArrowUpRight size={18} aria-hidden="true" /></div>
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

      

      <section className="nc-naacox-section" aria-labelledby="nc-naacox-title">
        <div className="nc-page-width">
          <div className="nc-naacox-heading-wrap">
            <span className="nc-naacox-eyebrow"><Sparkles size={14} aria-hidden="true" /> A STUDENT-FIRST AI ASSISTANT</span>
            <h2 id="nc-naacox-title" className="nc-naacox-display-title">
              <span className="nc-naacox-title-our">OUR</span>
              <span className="nc-naacox-title-ai">AI</span>
              <span className="nc-naacox-title-chip">CHATBOT</span>
            </h2>
            <p>Meet <strong>NaaCox AI</strong> — your guide to college choices, AP &amp; Telangana admissions, scholarships, study planning, programming and career questions.</p>
          </div>

          <div className="nc-naacox-chat-stage">
            <div className="nc-naacox-chat-context">
              <div className="nc-naacox-context-brand">
                <span className="nc-naacox-context-icon"><GraduationCap size={22} aria-hidden="true" /></span>
                <span><strong>Ask NaaCox AI</strong><small>English or Telugu-English · Type your question below</small></span>
              </div>
              <div className="nc-naacox-context-topics" aria-label="Example topics">
                <span>AP / TG EAPCET</span>
                <span>Scholarships</span>
                <span>College choices</span>
                <span>Study &amp; careers</span>
              </div>
            </div>
            <NaaCollegeAssistant embedded />
          </div>
          <p className="nc-naacox-safety-note"><CheckCircle2 size={14} aria-hidden="true" /> Use NaaCox for guidance; confirm important admissions and scholarship decisions with official sources.</p>
        </div>
      </section>



    </main>
  );
};

export default HeroSection;
