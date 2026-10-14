import React, { useMemo, useState } from 'react';
import './kineticMOS.css';
import { ArrowRight, Search, GraduationCap, Landmark, Wrench, Users, Sparkles, BookOpen, Heart, Bell, MapPin } from 'lucide-react';
import { FeaturesHub } from './FeaturesHub';

export const HeroSection = ({ activeWorkspace = 'hub', onSelectWorkspace }) => {
  const [query, setQuery] = useState('');
  const shortcuts = [
    { title: 'AP EAPCET College Predictor', detail: 'Explore colleges by rank and branch', icon: Landmark, workspace: 'ap-predictor', tone: 'blue' },
    { title: 'Telangana College Predictor', detail: 'Find options from TG allotment data', icon: GraduationCap, workspace: 'tg-predictor', tone: 'mint' },
    { title: 'Scholarships Hub', detail: 'Find funding for your education', icon: Heart, workspace: 'scholarships', tone: 'sun' },
    { title: 'Student Tools', detail: 'PDF, image, attendance and GPA tools', icon: Wrench, workspace: 'utilities', tone: 'lilac' },
  ];
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? shortcuts.filter(item => (item.title + ' ' + item.detail).toLowerCase().includes(q)).slice(0, 3) : [];
  }, [query]);
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
        <div className="naa-bie-hero-inner">
          <div className="naa-bie-audience-cards">
            <button type="button" className="naa-bie-audience-card naa-bie-student-card" onClick={() => go('hub')}>
              <span className="naa-bie-card-art naa-bie-student-art" aria-hidden="true"><Users size={54} strokeWidth={1.4} /><GraduationCap size={35} strokeWidth={1.5} /></span>
              <span className="naa-bie-card-copy"><strong>FOR STUDENTS</strong><small>Explore college predictors, admission insights, scholarships, internships, and learning resources.</small><span className="naa-bie-card-action">Explore Student Tools <ArrowRight size={16}/></span></span>
            </button>
            <button type="button" className="naa-bie-audience-card naa-bie-college-card" onClick={() => go('hub')}>
              <span className="naa-bie-card-art naa-bie-college-art" aria-hidden="true"><Landmark size={60} strokeWidth={1.35} /><MapPin size={25} strokeWidth={1.5} /></span>
              <span className="naa-bie-card-copy"><strong>FOR COLLEGES</strong><small>Discover college information, branches, admissions data, and useful institutional insights.</small><span className="naa-bie-card-action">Explore Colleges <ArrowRight size={16}/></span></span>
            </button>
          </div>
          <div className="naa-hero-art naa-hero-art-image naa-bie-hero-art">
            <img
              className="naa-campus-life-image"
              src="/Vibrant%20Campus%20Life%20Illustration.webp"
              alt="Illustration celebrating college students and campus life"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="naa-bie-hero-accessible-copy">
            <span className="naa-eyebrow"><span className="naa-eyebrow-icon"><GraduationCap size={16}/></span> Your education journey starts here</span>
            <h1 id="naa-hero-title">Naa College <span>— Your Guide to Engineering Admissions &amp; Student Resources</span></h1>
            <p>Explore AP and Telangana admissions, scholarships, college information, and practical student tools in one place.</p>
            <div className="naa-search-wrap">
              <Search size={19} aria-hidden="true"/>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && matches[0]) go(matches[0].workspace); }} placeholder="Search colleges, scholarships, tools..." aria-label="Search Naa College resources" />
              <button type="button" onClick={() => matches[0] ? go(matches[0].workspace) : scrollToTools()}>{matches.length ? 'Open' : 'Explore'} <ArrowRight size={16}/></button>
              {matches.length > 0 && <div className="naa-search-suggestions">{matches.map(item => <button type="button" key={item.title} onClick={() => go(item.workspace)}><span>{item.title}</span><ArrowRight size={15}/></button>)}</div>}
            </div>
          </div>
        </div>
      </section>

      <div className="naa-updates-strip naa-bie-updates"><span><Sparkles size={17}/> Latest Updates</span><div className="naa-updates-track"><b>AP &amp; Telangana EAPCET resources</b><i>•</i><b>College Predictors</b><i>•</i><b>Scholarships</b><i>•</i><b>Student Resources</b></div></div>

      <section className="naa-bie-alert-links" aria-label="Latest alerts and quick links">
        <div className="naa-bie-alert-panel">
          <div className="naa-bie-section-title"><h2>Latest <span>Alerts</span></h2><Bell size={23} aria-hidden="true"/></div>
          <p className="naa-bie-section-intro">Quick access to important admission and student resources.</p>
          <button type="button" className="naa-bie-alert-link" onClick={() => go('ap-predictor')}><span><strong>AP EAPCET College Predictor</strong><small>Explore college options by rank and branch</small></span><ArrowRight size={18}/></button>
          <button type="button" className="naa-bie-alert-link" onClick={() => go('tg-predictor')}><span><strong>Telangana EAPCET Resources</strong><small>Explore Telangana college and allotment tools</small></span><ArrowRight size={18}/></button>
        </div>
        <div className="naa-bie-quick-panel">
          <div className="naa-bie-section-title"><h2>Quick <span>Links</span></h2><ArrowRight size={23} aria-hidden="true"/></div>
          <div className="naa-bie-quick-grid">
            {shortcuts.map(item => { const Icon = item.icon; return <button type="button" key={item.title} className="naa-bie-quick-link" onClick={() => go(item.workspace)}><span className="naa-bie-quick-icon"><Icon size={20}/></span><span>{item.title}</span><ArrowRight size={15}/></button>; })}
          </div>
          <button type="button" className="naa-bie-all-tools" onClick={scrollToTools}>Browse all student tools <ArrowRight size={16}/></button>
        </div>
      </section>

      <section className="naa-home-section naa-bie-services" aria-labelledby="naa-services-title">
        <div className="naa-section-heading"><div><span className="naa-section-kicker">YOUR STUDENT TOOLKIT</span><h2 id="naa-services-title">Explore our <span>key services</span></h2></div><p>Everything you need, all in one place <span aria-hidden="true">↗</span></p><button type="button" onClick={scrollToTools}>View all services <ArrowRight size={16}/></button></div>
        <div className="naa-shortcut-grid">{shortcuts.map(item => { const Icon = item.icon; return <button type="button" key={item.title} className={'naa-shortcut naa-shortcut-' + item.tone} onClick={() => go(item.workspace)}><span className="naa-shortcut-icon"><Icon size={21}/></span><span className="naa-shortcut-title">{item.title}</span><small>{item.detail}</small><span className="naa-shortcut-arrow"><ArrowRight size={17}/></span></button>; })}</div>
      </section>

      <div id="features-hub"><FeaturesHub activeWorkspace={activeWorkspace} onSelectWorkspace={onSelectWorkspace} /></div>
      <section className="naa-trust-section"><div><span className="naa-section-kicker">01 / CLEAR INFORMATION</span><h2>Useful data.<br/><span>Clear context.</span></h2><p>Explore AP and Telangana counselling resources with context about the underlying allotment data and its limitations.</p></div><div><span className="naa-section-kicker">02 / STUDENT-FIRST</span><h2>Made for<br/><span>real student needs.</span></h2><p>From scholarships and roadmaps to attendance and PDF utilities, the platform brings everyday student tasks together.</p></div><div><span className="naa-section-kicker">03 / KEEP EXPLORING</span><h2>Your next step<br/><span>starts here.</span></h2><p>Use the resources that fit your goals, verify important deadlines with official sources, and keep learning at your own pace.</p></div></section>
    </main>
  );
};
export default HeroSection;
