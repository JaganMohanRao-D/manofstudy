import React, { useMemo, useState } from 'react';
import './kineticMOS.css';
import { ArrowRight, Search, GraduationCap, Landmark, Wrench, Users, Sparkles, BookOpen, Heart, Bell, MapPin, Building2 } from 'lucide-react';
import './homepageReferencePolish.css';
import { FeaturesHub, WORKSPACES, FLAGSHIP_FEATURES } from './FeaturesHub';

export const HeroSection = ({ activeWorkspace = 'hub', onSelectWorkspace }) => {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const shortcuts = [
    { title: 'AP EAPCET College Predictor', detail: 'Explore Andhra Pradesh colleges by rank and branch', icon: Landmark, workspace: 'ap-predictor', tone: 'blue' },
    { title: 'Telangana College Predictor', detail: 'Find Telangana colleges using EAPCET allotment data', icon: GraduationCap, workspace: 'tg-predictor', tone: 'mint' },
    { title: 'Scholarships Hub', detail: 'Find funding for your education', icon: Heart, workspace: 'scholarships', tone: 'sun' },
    { title: 'Student Tools', detail: 'PDF, image, attendance and GPA tools', icon: Wrench, workspace: 'utilities', tone: 'lilac' },
  ];
  const searchIndex = useMemo(() => {
    const items = [
      ...WORKSPACES.map(item => ({ title: item.title.replace(/^🎯\\s*/, ''), detail: item.description || item.category || 'Student resource', workspace: item.workspace, keywords: item.category || '' })),
      ...FLAGSHIP_FEATURES.map(item => ({ title: item.title, detail: item.description || item.badge || 'Featured resource', workspace: item.workspace, keywords: item.badge || '' })),
      { title: 'Andhra Students — AP EAPCET tools', detail: 'AP namewise allotments, college predictor, rank predictor and top colleges', target: 'regional-section-ap', keywords: 'andhra ap eapcet counselling' },
      { title: 'Telangana Students — TG EAPCET tools', detail: 'TG namewise allotments, college predictor and top colleges', target: 'regional-section-tg', keywords: 'telangana tg eapcet counselling' },
      { title: 'PDF & Document Utilities', detail: 'Merge, split and optimize PDFs', workspace: 'utilities', keywords: 'pdf document merge split compress' },
      { title: 'Image Compressor', detail: 'Compress images in your browser', workspace: 'utilities', keywords: 'image photo compress' },
    ];
    return items.filter((item, index, arr) => arr.findIndex(other => other.title === item.title && other.workspace === item.workspace && other.target === item.target) === index);
  }, []);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const terms = q.split(/\\s+/).filter(Boolean);
    return searchIndex.map(item => {
      const haystack = (item.title + ' ' + item.detail + ' ' + (item.keywords || '')).toLowerCase();
      const score = terms.reduce((sum, term) => sum + (item.title.toLowerCase().includes(term) ? 3 : haystack.includes(term) ? 1 : 0), 0);
      return { ...item, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 7);
  }, [query, searchIndex]);
  const openSearchResult = (item) => {
    setSearchOpen(false);
    if (item.target) {
      document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    go(item.workspace || 'hub');
  };
  const go = (workspace) => {
    onSelectWorkspace?.(workspace);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const scrollToTools = () => document.getElementById('features-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <main className="naa-home naa-bie-inspired-home">
      <section className="naa-hero naa-bie-hero" aria-labelledby="naa-hero-title">
        <div className="naa-hero-decoration naa-decoration-one" aria-hidden="true" />
        <div className="naa-hero-decoration naa-decoration-two" aria-hidden="true" />
        <div className="naa-dots" aria-hidden="true" />
        <div className="naa-bie-hero-heading">
          <p className="naa-bie-hero-eyebrow"><span aria-hidden="true" /> AP &amp; TELANGANA STUDENT RESOURCES</p>
          <h1 id="naa-hero-title">College decisions, <span>made clearer.</span></h1>
          <p className="naa-bie-hero-subtitle">Explore EAPCET allotments, compare colleges, discover scholarships and find practical tools for your engineering journey.</p>
        </div>
        <div className="naa-bie-hero-inner">
          <div className="naa-bie-audience-cards">
            <button type="button" className="naa-bie-audience-card naa-bie-student-card" onClick={() => document.getElementById('regional-section-ap')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <span className="naa-bie-card-art naa-bie-student-art" aria-hidden="true"><Users size={54} strokeWidth={1.4} /><GraduationCap size={35} strokeWidth={1.5} /></span>
              <span className="naa-bie-card-copy"><strong>ANDHRA STUDENTS</strong><small>AP EAPCET allotments, college predictors, rank insights, scholarships and student resources.</small><span className="naa-bie-card-action">Explore AP Tools <ArrowRight size={16}/></span></span>
            </button>
            <button type="button" className="naa-bie-audience-card naa-bie-college-card" onClick={() => document.getElementById('regional-section-tg')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <span className="naa-bie-card-art naa-bie-college-art" aria-hidden="true"><Landmark size={60} strokeWidth={1.35} /><MapPin size={25} strokeWidth={1.5} /></span>
              <span className="naa-bie-card-copy"><strong>TELANGANA STUDENTS</strong><small>TG EAPCET allotments, college discovery, category cutoffs and rank-based insights.</small><span className="naa-bie-card-action">Explore TG Tools <ArrowRight size={16}/></span></span>
            </button>
          </div>
          <div className="naa-hero-art naa-hero-art-image naa-bie-hero-art">
            <video
              className="naa-campus-life-image"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Naa College campus hero video"
            >
              <source src="/HERO_VEDIO.webm" type="video/webm" />
            </video>
          </div>
        </div>
      </section>

      <div className="naa-updates-strip naa-bie-updates" aria-label="Latest updates"><span><Sparkles size={17} aria-hidden="true"/> Latest Updates</span><div className="naa-updates-viewport"><div className="naa-updates-track"><b>AP &amp; Telangana EAPCET resources</b><i>•</i><b>College Predictors</b><i>•</i><b>Scholarships</b><i>•</i><b>Student Resources</b><i>•</i><b>AP &amp; Telangana EAPCET resources</b><i>•</i><b>College Predictors</b><i>•</i><b>Scholarships</b><i>•</i><b>Student Resources</b><i aria-hidden="true">•</i></div></div></div>

      <section className="naa-bie-alert-links" aria-label="Latest alerts and quick links">
        <div className="naa-bie-alert-panel">
          <div className="naa-bie-section-title"><h2>Latest <span>Alerts</span></h2><Bell size={23} aria-hidden="true"/></div>
          <p className="naa-bie-section-intro">Quick access to important admission and student resources.</p>
          <button type="button" className="naa-bie-alert-link" onClick={() => go('ap-predictor')}><span><strong>AP EAPCET College Predictor</strong><small>Explore college options by rank and branch</small></span><ArrowRight size={18}/></button>
          <button type="button" className="naa-bie-alert-link" onClick={() => go('tg-predictor')}><span><strong>Telangana EAPCET Resources</strong><small>Explore Telangana college and allotment tools</small></span><ArrowRight size={18}/></button>
        </div>
        <div className="naa-bie-quick-panel">
          <div className="naa-bie-section-title"><h2>Quick <span>Links</span></h2><ArrowRight size={23} aria-hidden="true"/></div>
          <div className="naa-search-wrap naa-bie-quick-search">
            <Search size={18} aria-hidden="true"/>
            <input value={query} onFocus={() => setSearchOpen(true)} onChange={e => { setQuery(e.target.value); setSearchOpen(true); }} onKeyDown={e => { if (e.key === 'Enter' && matches[0]) openSearchResult(matches[0]); if (e.key === 'Escape') setSearchOpen(false); }} placeholder="Search any tool, college resource, scholarship..." aria-label="Search all Naa College tools and resources" aria-expanded={searchOpen && matches.length > 0} aria-controls="naa-global-search-results" autoComplete="off" />
            <button type="button" onClick={() => matches[0] ? openSearchResult(matches[0]) : (setSearchOpen(true), scrollToTools())}>{matches.length ? 'Open' : 'Search'} <ArrowRight size={16}/></button>
            {searchOpen && query.trim().length >= 2 && <div className="naa-search-suggestions" id="naa-global-search-results" role="listbox">{matches.length ? matches.map(item => <button type="button" role="option" key={item.title + (item.workspace || item.target || '')} onClick={() => openSearchResult(item)}><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowRight size={15}/></button>) : <p className="naa-search-empty">No matching resources. Try “AP”, “TG”, “scholarship”, “PDF” or “attendance”.</p>}</div>}
          </div>
          <div className="naa-bie-quick-grid">
            {shortcuts.map(item => { const Icon = item.icon; return <button type="button" key={item.title} className="naa-bie-quick-link" onClick={() => go(item.workspace)}><span className="naa-bie-quick-icon"><Icon size={20}/></span><span>{item.title}</span><ArrowRight size={15}/></button>; })}
          </div>
          <button type="button" className="naa-bie-all-tools" onClick={scrollToTools}>Browse all student tools <ArrowRight size={16}/></button>
        </div>
      </section>

      <section className="naa-autonomous-home-promo" aria-labelledby="naa-autonomous-home-title">
        <div className="naa-autonomous-promo-mark" aria-hidden="true"><Building2 size={30} strokeWidth={1.6} /><span>AP · TG</span></div>
        <div className="naa-autonomous-promo-copy"><p>COLLEGE RESEARCH</p><h2 id="naa-autonomous-home-title">Looking for autonomous colleges?</h2><span>Search colleges across Andhra Pradesh and Telangana, compare recorded autonomy dates and find their affiliating universities.</span></div>
        <a href="/autonomous-colleges" className="naa-autonomous-promo-link">Explore directory <ArrowRight size={17} aria-hidden="true" /></a>
      </section>
      <div id="features-hub"><FeaturesHub activeWorkspace={activeWorkspace} onSelectWorkspace={onSelectWorkspace} /></div>
      <section className="naa-trust-section"><div><span className="naa-section-kicker">01 / CLEAR INFORMATION</span><h2>Useful data.<br/><span>Clear context.</span></h2><p>Explore AP and Telangana counselling resources with context about the underlying allotment data and its limitations.</p></div><div><span className="naa-section-kicker">02 / STUDENT-FIRST</span><h2>Made for<br/><span>real student needs.</span></h2><p>From scholarships and roadmaps to attendance and PDF utilities, the platform brings everyday student tasks together.</p></div><div><span className="naa-section-kicker">03 / KEEP EXPLORING</span><h2>Your next step<br/><span>starts here.</span></h2><p>Use the resources that fit your goals, verify important deadlines with official sources, and keep learning at your own pace.</p></div></section>
    </main>
  );
};
export default HeroSection;
