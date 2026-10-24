import React from 'react';
import { ArrowUpRight, Heart, ShieldCheck } from 'lucide-react';
import './Footer.css';

const FooterLink = ({ href, children }) => (
  <a href={href} className="nc-footer-link text-[13px] sm:text-sm">
    {children}
  </a>
);

const FooterColumnTitle = ({ children }) => (
  <h2 className="nc-footer-column-title mb-5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.17em]">
    <span className="nc-footer-heading-mark" aria-hidden="true" />
    {children}
  </h2>
);

export const Footer = ({ onOpenSupportModal }) => (
  <footer id="app-footer" className="mos-k-footer nc-site-footer w-full">
    {/* Helpful links stay above the illustrated campus strip, as in a traditional site footer. */}
    <div className="nc-footer-main">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:gap-x-9">
          <section className="min-w-0" aria-label="About Naa College">
            <a href="/" aria-label="Naa College home" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6ad51]">
              <img
                src="/Naa%20College%20logo.webp"
                alt=""
                aria-hidden="true"
                width="56"
                height="56"
                className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
                loading="lazy"
                decoding="async"
              />
              <span className="min-w-0">
                <span className="block font-['Syne'] text-[21px] font-extrabold leading-tight tracking-[-0.045em] text-[#102f55] sm:text-2xl">Naa College</span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.17em] text-[#7388a0]">Student utility platform</span>
              </span>
            </a>

            <p className="nc-footer-brand-copy mt-5 max-w-sm text-[13px]">
              A student-first platform for admissions insights, counselling data, academic tools and career resources — helping students make more informed next steps.
            </p>

            <div className="nc-footer-disclaimer mt-5 flex max-w-sm items-start gap-2.5 rounded-xl px-3.5 py-3 text-[11px] leading-relaxed">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#9a782b]" aria-hidden="true" />
              <span>Independent educational resource. Not affiliated with any government body.</span>
            </div>
          </section>

          <nav aria-label="Admissions tools" className="nc-footer-links min-w-0">
            <FooterColumnTitle>Admissions</FooterColumnTitle>
            <div className="flex flex-col items-start gap-3">
              <FooterLink href="/#ap-allotments">AP EAPCET Allotments</FooterLink>
              <FooterLink href="/#ap-predictor">AP College Predictor</FooterLink>
              <FooterLink href="/#tg-allotments">TG EAPCET Allotments</FooterLink>
              <FooterLink href="/#tg-predictor">TG College Predictor</FooterLink>
              <FooterLink href="/#ap-top-colleges">AP B.Tech Colleges</FooterLink>
              <FooterLink href="/autonomous-colleges/">Autonomous Colleges</FooterLink>
            </div>
          </nav>

          <nav aria-label="Student resources" className="nc-footer-links min-w-0">
            <FooterColumnTitle>Student Hub</FooterColumnTitle>
            <div className="flex flex-col items-start gap-3">
              <FooterLink href="/#scholarships">Scholarships &amp; Grants</FooterLink>
              <FooterLink href="/#roadmaps">Engineering Roadmaps</FooterLink>
              <FooterLink href="/#internships">Internships Radar</FooterLink>
              <FooterLink href="/#guides">Study Guides</FooterLink>
              <FooterLink href="/#pdf-tools">PDF Tools</FooterLink>
              <FooterLink href="/#attendance">Attendance Defender</FooterLink>
              <FooterLink href="/#gpa">GPA &amp; CGPA Tools</FooterLink>
            </div>
          </nav>

          <nav aria-label="Information and help" className="nc-footer-links min-w-0">
            <FooterColumnTitle>About &amp; Help</FooterColumnTitle>
            <div className="flex flex-col items-start gap-3">
              <FooterLink href="/blog/">Student Blog</FooterLink>
              <FooterLink href="/about">About Naa College</FooterLink>
              <FooterLink href="/contact-us">Contact</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
              <FooterLink href="/legal-safe-harbor">Disclaimer</FooterLink>
            </div>
            {onOpenSupportModal && (
              <button
                type="button"
                onClick={onOpenSupportModal}
                className="nc-footer-support mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold"
              >
                <Heart size={14} aria-hidden="true" />
                Support Naa College
                <ArrowUpRight size={13} className="ml-0.5" aria-hidden="true" />
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>

    {/* Wide, responsive 2D campus illustration supplied in public/. */}
    <div className="nc-footer-artwork" aria-label="Illustrated student campus scene">
      <img
        src="/Aspiring%20University%20Campus%20Banner.webp"
        alt="A blue, white and gold illustrated university campus with cartoon students learning, walking and collaborating."
        width="2048"
        height="1024"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div className="nc-footer-bottom">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:gap-5 md:text-left lg:px-8">
        <div className="min-w-0">
          <div className="text-xs font-semibold">© {new Date().getFullYear()} Naa College. All rights reserved.</div>
          <div className="nc-footer-built mt-1 text-[10px] font-semibold tracking-[0.02em]">Built by Jagan Mohan Rao Dunna</div>
        </div>
        <nav aria-label="Footer legal links" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] md:justify-end">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
          <a href="/legal-safe-harbor">Disclaimer</a>
          <a href="/contact-us">Contact</a>
          <span className="nc-footer-muted hidden lg:inline">Made for students · Built to be useful</span>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
