import React, { useMemo, useState } from 'react';
import './kineticMOS.css';
import { ArrowRight, Search, GraduationCap, Landmark, Wrench, Users, Sparkles, BookOpen, Heart } from 'lucide-react';
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
    <main className="naa-home">
      <section className="naa-hero" aria-labelledby="naa-hero-title">
        <div className="naa-hero-decoration naa-decoration-one" aria-hidden="true" />
        <div className="naa-hero-decoration naa-decoration-two" aria-hidden="true" />
        <div className="naa-dots" aria-hidden="true" />
        <div className="naa-hero-inner">
          <div className="naa-hero-copy">
            <div className="naa-eyebrow"><span className="naa-eyebrow-icon"><GraduationCap size={16}/></span> Your education journey starts here</div>
            <h1 id="naa-hero-title">Build your future with <span>Naa College</span><i aria-hidden="true">✦</i></h1>
            <p className="naa-hero-description">Explore colleges, understand EAPCET allotments, discover scholarships and use practical student tools — all in one friendly place.</p>
            <div className="naa-search-wrap">
              <Search size={19} aria-hidden="true"/>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && matches[0]) go(matches[0].workspace); }} placeholder="Search colleges, scholarships, tools..." aria-label="Search Naa College resources" />
              <button type="button" onClick={() => matches[0] ? go(matches[0].workspace) : scrollToTools()}>{matches.length ? 'Open' : 'Explore'} <ArrowRight size={16}/></button>
              {matches.length > 0 && <div className="naa-search-suggestions">{matches.map(item => <button type="button" key={item.title} onClick={() => go(item.workspace)}><span>{item.title}</span><ArrowRight size={15}/></button>)}</div>}
            </div>
            <div className="naa-stat-grid">
              <div className="naa-stat naa-stat-blue"><span><Landmark size={19}/></span><strong>AP + TG</strong><small>Admissions resources</small></div>
              <div className="naa-stat naa-stat-mint"><span><Heart size={19}/></span><strong>Scholarships</strong><small>Funding opportunities</small></div>
              <div className="naa-stat naa-stat-lilac"><span><Wrench size={19}/></span><strong>Free tools</strong><small>Useful student utilities</small></div>
              <div className="naa-stat naa-stat-sun"><span><Users size={19}/></span><strong>Student-first</strong><small>Made for your journey</small></div>
            </div>
          </div>
          <div className="naa-hero-art naa-hero-art-image">
            <img
              className="naa-campus-life-image"
              src="/Vibrant%20Campus%20Life%20Illustration.webp"
              alt="Three cheerful college students on a colourful campus with flying birds"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <div className="naa-updates-strip"><span><Sparkles size={17}/> Latest updates</span><div className="naa-updates-track"><b>AP &amp; Telangana EAPCET resources</b><i>✦</i><b>Scholarships and student opportunities</b><i>✦</i><b>Free practical tools for students</b><i>✦</i><b>AP &amp; Telangana EAPCET resources</b></div></div>

      <section className="naa-home-section" aria-labelledby="naa-services-title">
        <div className="naa-section-heading"><div><span className="naa-section-kicker">YOUR STUDENT TOOLKIT</span><h2 id="naa-services-title">Explore our <span>key services</span></h2></div><p>Everything you need, all in one place <span aria-hidden="true">↗</span></p><button type="button" onClick={scrollToTools}>View all services <ArrowRight size={16}/></button></div>
        <div className="naa-shortcut-grid">{shortcuts.map(item => { const Icon = item.icon; return <button type="button" key={item.title} className={'naa-shortcut naa-shortcut-' + item.tone} onClick={() => go(item.workspace)}><span className="naa-shortcut-icon"><Icon size={21}/></span><span className="naa-shortcut-title">{item.title}</span><small>{item.detail}</small><span className="naa-shortcut-arrow"><ArrowRight size={17}/></span></button>; })}</div>
      </section>

      <div id="features-hub"><FeaturesHub activeWorkspace={activeWorkspace} onSelectWorkspace={onSelectWorkspace} /></div>
      <section className="naa-trust-section"><div><span className="naa-section-kicker">01 / CLEAR INFORMATION</span><h2>Useful data.<br/><span>Clear context.</span></h2><p>Explore AP and Telangana counselling resources with context about the underlying allotment data and its limitations.</p></div><div><span className="naa-section-kicker">02 / STUDENT-FIRST</span><h2>Made for<br/><span>real student needs.</span></h2><p>From scholarships and roadmaps to attendance and PDF utilities, the platform brings everyday student tasks together.</p></div><div><span className="naa-section-kicker">03 / KEEP EXPLORING</span><h2>Your next step<br/><span>starts here.</span></h2><p>Use the resources that fit your goals, verify important deadlines with official sources, and keep learning at your own pace.</p></div></section>
    </main>
  );
};
export default HeroSection;
