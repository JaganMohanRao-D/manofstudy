import React, { useEffect, useRef } from 'react';
import './kineticMOS.css';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { FeaturesHub } from './FeaturesHub';

export const HeroSection = ({ activeWorkspace = 'hub', onSelectWorkspace }) => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const heroRef = useRef(null);
  const stringPathRef = useRef(null);
  const stringGripRef = useRef(null);

  const go = (workspace) => {
    onSelectWorkspace?.(workspace);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const root = heroRef.current;
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    const path = stringPathRef.current;
    const grip = stringGripRef.current;
    if (!root || !cursor || !dot || !ring || !path || !grip || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const boxes = Array.from(root.querySelectorAll('.mos-k-physics-box')).map((el) => ({ el, homeX: parseFloat(el.dataset.x || '50'), homeY: parseFloat(el.dataset.y || '50'), x: 0, y: 0, vx: 0, vy: 0, rot: 0 }));
    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let mouseX = root.clientWidth / 2;
    let mouseY = root.clientHeight / 2;
    let stringX = mouseX;
    let stringY = root.clientHeight * 0.57;
    let stringVY = 0;
    let lastX = mouseX;
    let lastY = mouseY;
    let active = false;

    const updatePointer = (event) => {
      targetX = event.clientX; targetY = event.clientY; active = root.contains(event.target); cursor.classList.toggle('is-active', active);
      const rect = root.getBoundingClientRect();
      mouseX = event.clientX - rect.left; mouseY = event.clientY - rect.top;
      root.style.setProperty('--mk-mouse-x', event.clientX + 'px');
      root.style.setProperty('--mk-mouse-y', event.clientY + 'px');
    };
    const hidePointer = (event) => { if (!event.relatedTarget) { active = false; cursor.classList.remove('is-active'); } };

    const animate = () => {
      const width = root.clientWidth || 1; const height = root.clientHeight || 1;
      const rect = root.getBoundingClientRect();
      mouseX = targetX - rect.left; mouseY = targetY - rect.top;
      stringVY += (mouseY - stringY) * 0.055; stringVY *= 0.8; stringY += stringVY; stringX += (mouseX - stringX) * 0.12;
      const baseY = height * 0.57; const controlY = 2 * stringY - baseY;
      path.setAttribute('d', 'M 0 ' + baseY + ' Q ' + stringX + ' ' + controlY + ' ' + width + ' ' + baseY);
      grip.setAttribute('cx', stringX); grip.setAttribute('cy', stringY); grip.setAttribute('opacity', active ? '1' : '0');
      const speedX = mouseX - lastX; const speedY = mouseY - lastY; lastX = mouseX; lastY = mouseY;
      boxes.forEach((box) => {
        const homeX = (box.homeX / 100) * width; const homeY = (box.homeY / 100) * height;
        const dx = homeX - mouseX; const dy = homeY - mouseY; const distance = Math.max(1, Math.hypot(dx, dy));
        const force = Math.max(0, 1 - distance / Math.min(250, Math.max(150, width * 0.18)));
        const nx = dx / distance; const ny = dy / distance;
        const tx = nx * force * 85 + speedX * force * 0.8; const ty = ny * force * 85 + speedY * force * 0.8;
        box.vx += (tx - box.x) * 0.075; box.vy += (ty - box.y) * 0.075; box.vx *= 0.82; box.vy *= 0.82; box.x += box.vx; box.y += box.vy;
        box.rot += ((speedX - speedY) * force * 0.03 - box.rot) * 0.08;
        box.el.style.left = box.homeX + '%'; box.el.style.top = box.homeY + '%';
        box.el.style.transform = 'translate3d(' + box.x.toFixed(1) + 'px,' + box.y.toFixed(1) + 'px,0) rotate(' + box.rot.toFixed(2) + 'deg)';
      });
      dot.style.transform = 'translate3d(' + targetX + 'px,' + targetY + 'px,0)';
      ring.style.transform = 'translate3d(' + targetX + 'px,' + targetY + 'px,0)';
      cursor.style.opacity = active ? '1' : '0';
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pointerout', hidePointer);
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener('pointermove', updatePointer); window.removeEventListener('pointerout', hidePointer); cancelAnimationFrame(raf); };
  }, []);

  const scrollToTools = () => {
    document.getElementById('features-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="mos-kinetic-home">
      <section ref={heroRef} className="mos-k-hero" aria-labelledby="mos-k-title">
        <div ref={cursorRef} className="mos-k-cursor" aria-hidden="true">
          <span ref={cursorRingRef} className="mos-k-cursor-ring"><i /><i /><i /><i /></span>
          <span ref={cursorDotRef} className="mos-k-cursor-dot" />
          <span className="mos-k-cursor-label">MOVE / EXPLORE</span>
        </div>
        <div className="mos-k-grid" aria-hidden="true" />
        <div className="mos-k-physics-field" aria-hidden="true">
          <span className="mos-k-physics-box acid" data-x="9" data-y="24" />
          <span className="mos-k-physics-box warm" data-x="18" data-y="42" />
          <span className="mos-k-physics-box" data-x="31" data-y="20" />
          <span className="mos-k-physics-box acid" data-x="46" data-y="31" />
          <span className="mos-k-physics-box warm" data-x="61" data-y="18" />
          <span className="mos-k-physics-box" data-x="77" data-y="30" />
          <span className="mos-k-physics-box acid" data-x="90" data-y="20" />
          <span className="mos-k-physics-box warm" data-x="13" data-y="72" />
          <span className="mos-k-physics-box" data-x="29" data-y="82" />
          <span className="mos-k-physics-box acid" data-x="48" data-y="74" />
          <span className="mos-k-physics-box warm" data-x="70" data-y="82" />
          <span className="mos-k-physics-box" data-x="88" data-y="68" />
        </div>
        <svg className="mos-k-string" aria-hidden="true">
          <path ref={stringPathRef} className="mos-k-string-path" />
          <circle className="mos-k-string-anchor" cx="0" cy="0" r="4" />
          <circle className="mos-k-string-anchor" cx="100%" cy="0" r="4" />
          <circle ref={stringGripRef} className="mos-k-string-grip" cx="50%" cy="50%" r="7" />
        </svg>
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
