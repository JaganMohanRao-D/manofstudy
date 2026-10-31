import React from 'react';
import { ArrowUpRight, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer({ onNavigate, onOpenSupport }) {
  const handleNav = (route) => onNavigate?.(route);

  return (
    <footer className="w-full overflow-hidden border-t border-white/10 bg-[#102B3F] text-white">
      <section className="border-b border-white/10 bg-[#163852]/70 px-4 pt-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#E2C16A]">
            Built for students across Andhra Pradesh & Telangana
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
            Every College. Every Cutoff. Every Student Opportunity.
          </h2>
        </div>
        <div
          className="mx-auto mt-6 h-[150px] max-w-7xl rounded-t-2xl border-x border-t border-[#C29316]/35 bg-[#EAF4F0]"
          role="img"
          aria-label="Illustrated university campus artwork"
          style={{
            backgroundImage: "url('/Aspiring%20University%20Campus%20Banner.webp')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
          }}
        />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-9">
          <section className="min-w-0" aria-label="About Naa College">
            <a href="/" aria-label="Naa College home" className="inline-flex items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C29316]">
              <img
                src="/Naacollege_fulllogo.webp"
                alt="Naa College"
                width="320"
                height="180"
                className="h-12 w-auto max-w-[210px] object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>
            <p className="mt-5 max-w-sm text-[13px] leading-7 text-white/75">
              A student-first platform for historical admissions insights, college discovery, scholarship listings, academic tools and career resources.
            </p>
            <div className="mt-5 flex max-w-sm items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[11px] leading-relaxed text-white/75">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#E2C16A]" aria-hidden="true" />
              <span>Independent educational resource. Not affiliated with a government body.</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenSupport}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C29316] px-4 py-2.5 text-xs font-extrabold text-[#102B3F] transition hover:-translate-y-0.5 hover:bg-[#E2C16A]"
              >
                <HeartHandshake size={15} aria-hidden="true" />
                Support Naa College
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/65">
                <MapPin size={14} className="text-[#E2C16A]" aria-hidden="true" />
                AP & Telangana, India
              </span>
            </div>
          </section>

          <nav aria-label="Admissions tools">
            <h3 className="mb-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#E2C16A]">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C29316]" /> Admissions
            </h3>
            <div className="flex flex-col items-start gap-3 text-[13px] text-white/80">
              <button onClick={() => handleNav('ap-allotment-explorer')} className="transition hover:text-[#E2C16A]">AP EAPCET Allotments</button>
              <button onClick={() => handleNav('ap-eapcet-predictor')} className="transition hover:text-[#E2C16A]">AP College Predictor</button>
              <button onClick={() => handleNav('tg-allotment-explorer')} className="transition hover:text-[#E2C16A]">TG EAPCET Allotments</button>
              <button onClick={() => handleNav('tg-eapcet-predictor')} className="transition hover:text-[#E2C16A]">TG College Predictor</button>
              <button onClick={() => handleNav('web-options-generator')} className="transition hover:text-[#E2C16A]">EAPCET Web Options</button>
              <button onClick={() => handleNav('autonomous-colleges')} className="transition hover:text-[#E2C16A]">Autonomous Colleges</button>
            </div>
          </nav>

          <nav aria-label="Student resources">
            <h3 className="mb-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#E2C16A]">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C29316]" /> Student Hub
            </h3>
            <div className="flex flex-col items-start gap-3 text-[13px] text-white/80">
              <button onClick={() => handleNav('scholarships')} className="transition hover:text-[#E2C16A]">Scholarships</button>
              <button onClick={() => handleNav('engineering-roadmaps')} className="transition hover:text-[#E2C16A]">Engineering Roadmaps</button>
              <button onClick={() => handleNav('internships')} className="transition hover:text-[#E2C16A]">Internships Radar</button>
              <button onClick={() => handleNav('projects')} className="transition hover:text-[#E2C16A]">Major Projects Hub</button>
              <button onClick={() => handleNav('mock-tests')} className="transition hover:text-[#E2C16A]">Mock Tests</button>
              <button onClick={() => handleNav('attendance-defender')} className="transition hover:text-[#E2C16A]">Attendance Defender</button>
              <button onClick={() => handleNav('gpa-calculator')} className="transition hover:text-[#E2C16A]">GPA & CGPA Tools</button>
            </div>
          </nav>

          <nav aria-label="Information and legal">
            <h3 className="mb-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#E2C16A]">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C29316]" /> About & Help
            </h3>
            <div className="flex flex-col items-start gap-3 text-[13px] text-white/80">
              <button onClick={() => handleNav('blogs')} className="transition hover:text-[#E2C16A]">Student Blog</button>
              <button onClick={() => handleNav('about')} className="transition hover:text-[#E2C16A]">About Naa College</button>
              <button onClick={() => handleNav('contact')} className="transition hover:text-[#E2C16A]">Contact</button>
              <button onClick={() => handleNav('privacy-policy')} className="transition hover:text-[#E2C16A]">Privacy Policy</button>
              <button onClick={() => handleNav('terms')} className="transition hover:text-[#E2C16A]">Terms of Service</button>
              <button onClick={() => handleNav('disclaimer')} className="transition hover:text-[#E2C16A]">Disclaimer</button>
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-[11px] text-white/65 sm:flex-row sm:text-left">
          <div>
            <p>© {new Date().getFullYear()} Naa College. All rights reserved.</p>
            <p className="mt-1 font-semibold text-[#E2C16A]">Built by Jagan Mohan Rao Dunna</p>
          </div>
          <p>Historical admissions data · Student-first resources · Clear limitations</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
