import React from 'react';
import './kineticMOS.css';
import { ArrowDownRight, ArrowRight, Database, GraduationCap, Wrench } from 'lucide-react';
import { FeaturesHub } from './FeaturesHub';

export const HeroSection = ({ activeWorkspace = 'hub', onSelectWorkspace }) => {
  const go = (workspace, tab) => {
    if (tab) window.location.hash = tab;
    onSelectWorkspace?.(workspace);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTools = () => {
    document.getElementById('features-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="mos-kinetic-home">
      <section className="mos-k-hero" aria-labelledby="mos-k-title">
        <div className="mos-k-grid" aria-hidden="true" />
        <div className="mos-k-glow" aria-hidden="true" />
        <span className="mos-k-orb a" aria-hidden="true" />
        <span className="mos-k-orb b" aria-hidden="true" />
        <span className="mos-k-orb c" aria-hidden="true" />

        <div className="mos-k-content">
          <div className="mos-k-meta">
            <span><strong>MAN OF STUDY</strong> / STUDENT PLATFORM</span>
            <span>AP + TG / 2026</span>
          </div>

          <div>
            <h1 id="mos-k-title" className="mos-k-title">
              <span>MAN</span>
              <span className="accent">OF</span>
              <span>STUDY<span className="orange">.</span></span>
            </h1>

            <div className="mos-k-bottom">
              <p className="mos-k-copy">
                <b>Everything students need, in one place.</b><br />
                Explore AP &amp; Telangana admissions, allotments, college predictors,
                scholarships, internships, roadmaps and practical student tools — built
                around the real student journey.
              </p>

              <button type="button" className="mos-k-cta" onClick={scrollToTools}>
                Explore Man of Study <ArrowDownRight size={15} />
              </button>

              <div className="mos-k-index" aria-label="Homepage sections">
                <span>01 / Admissions</span>
                <span>02 / Academics</span>
                <span>03 / Career</span>
                <span>04 / Student Tools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mos-k-section" aria-labelledby="mos-k-discover">
        <div className="mos-k-section-head">
          <div>
            <div className="mos-k-section-label">01 / Student Intelligence</div>
            <h2 id="mos-k-discover" className="mos-k-section-title">Find what<br />you need.</h2>
          </div>
          <div className="mos-k-section-label">DATA / TOOLS / GUIDANCE</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-white/10">
          <button type="button" onClick={() => go('ap-predictor')} className="group min-h-[180px] border-r border-b border-white/10 p-6 text-left transition hover:bg-white/[.025]">
            <div className="flex items-start justify-between"><span className="text-xs font-mono text-[#c9ff19]">01</span><ArrowRight className="text-white/40 transition group-hover:translate-x-1 group-hover:text-[#c9ff19]" size={17}/></div>
            <h3 className="mt-16 font-['Syne'] text-2xl font-bold tracking-tight">AP / TG Admissions</h3>
            <p className="mt-2 max-w-sm text-xs leading-6 text-[#858990]">Predict colleges, inspect allotments, compare ranks and explore counselling data.</p>
          </button>

          <button type="button" onClick={() => go('academics')} className="group min-h-[180px] border-r border-b border-white/10 p-6 text-left transition hover:bg-white/[.025]">
            <div className="flex items-start justify-between"><span className="text-xs font-mono text-[#ff9f68]">02</span><ArrowRight className="text-white/40 transition group-hover:translate-x-1 group-hover:text-[#ff9f68]" size={17}/></div>
            <h3 className="mt-16 font-['Syne'] text-2xl font-bold tracking-tight">Academics</h3>
            <p className="mt-2 max-w-sm text-xs leading-6 text-[#858990]">Attendance, GPA, internal marks, backlogs, mock tests and study resources.</p>
          </button>

          <button type="button" onClick={() => go('roadmaps')} className="group min-h-[180px] border-r border-b border-white/10 p-6 text-left transition hover:bg-white/[.025]">
            <div className="flex items-start justify-between"><span className="text-xs font-mono text-[#c9ff19]">03</span><ArrowRight className="text-white/40 transition group-hover:translate-x-1 group-hover:text-[#c9ff19]" size={17}/></div>
            <h3 className="mt-16 font-['Syne'] text-2xl font-bold tracking-tight">Career &amp; Skills</h3>
            <p className="mt-2 max-w-sm text-xs leading-6 text-[#858990]">Roadmaps, internships, projects, placement preparation and practical guidance.</p>
          </button>
        </div>
      </section>

      <div id="features-hub">
        <FeaturesHub activeWorkspace={activeWorkspace} onSelectWorkspace={onSelectWorkspace} />
      </div>

      <section className="mos-k-section" aria-label="Man of Study principles">
        <div className="grid gap-10 md:grid-cols-3">
          <div><div className="mos-k-section-label">02 / Data</div><h2 className="mt-5 font-['Syne'] text-3xl font-bold">Useful data.<br/>Clear context.</h2><p className="mt-4 text-xs leading-6 text-[#858990]">AP and Telangana counselling tools are organised around the questions students actually ask.</p></div>
          <div><div className="mos-k-section-label">03 / Access</div><h2 className="mt-5 font-['Syne'] text-3xl font-bold">Built for<br/>students.</h2><p className="mt-4 text-xs leading-6 text-[#858990]">Most tools work directly in the browser, keeping common student tasks quick and accessible.</p></div>
          <div><div className="mos-k-section-label">04 / Future</div><h2 className="mt-5 font-['Syne'] text-3xl font-bold">Keep<br/>building.</h2><p className="mt-4 text-xs leading-6 text-[#858990]">Man of Study keeps evolving as new student needs, data and practical resources become available.</p></div>
        </div>
      </section>
    </main>
  );
};

export default HeroSection;
