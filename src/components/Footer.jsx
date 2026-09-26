import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = ({
  onOpenLegalModal,
  onOpenSupportModal,
}) => {
  return (
    <footer
      id="app-footer"
      className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Top Section: Dual-Column Hero Showcase */}
        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-6 md:gap-8">
          {/* Left Column: Medium-Sized Brand Identity Card */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-inner flex items-center justify-center w-fit shrink-0">
            <img
              src="https://i.ibb.co/zHPk2tv4/Chat-GPT-Image-Sep-13-2026-08-04-48-PM.png"
              alt="MAN OF STUDY (MOS) Logo"
              width="96"
              height="96"
              loading="lazy"
              fetchPriority="auto"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover ring-2 ring-emerald-500/30 shadow-lg"
            />
          </div>

          {/* Right Column: Brand Statement & Data Transparency Box */}
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                MAN OF STUDY
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold tracking-wide">
                MOS • 100% FREE &amp; OPEN
              </span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-200">
              Your complete education &amp; study companion for Pan-Indian students.
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              MAN OF STUDY provides direct, verified, and instant access to TG &amp; AP EAPCET counseling datasets, cutoffs, engineering career roadmaps, and student-first productivity engines. Zero paywalls, zero tracking, engineered strictly for student clarity.
            </p>
          </div>
        </div>

        {/* Bottom Section: Legal, Safe Harbor & Compliance Strip */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 space-y-4">
          {/* Quick Links Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
            <button
              type="button"
              id="footer-privacy-link"
              onClick={() => onOpenLegalModal?.('privacy')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              id="footer-terms-link"
              onClick={() => onOpenLegalModal?.('terms')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              id="footer-disclaimer-link"
              onClick={() => onOpenLegalModal?.('disclaimer')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Legal Safe Harbor &amp; Disclaimers
            </button>
            <button
              type="button"
              id="footer-attribution-link"
              onClick={() => onOpenLegalModal?.('about')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Attribution
            </button>
            <button
              type="button"
              id="footer-contact-link"
              onClick={() => onOpenLegalModal?.('contact')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            {onOpenSupportModal && (
              <button
                type="button"
                id="footer-support-pill"
                onClick={onOpenSupportModal}
                className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Support MOS</span>
              </button>
            )}
          </div>

          {/* Disclaimer & Safe Harbor Statement */}
          <p className="text-[11px] text-slate-500 leading-relaxed text-center md:text-left max-w-4xl">
            Disclaimer: MAN OF STUDY (MOS) is an independent open educational and analytical resource. Seat allotment records, ranks, and cutoff matrices are compiled from publicly accessible state counseling portals for informational use only. MAN OF STUDY is not affiliated with APSCHE, TSCHE, or any government body.
          </p>

          {/* Copyright & Version Stamp */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
            <p className="text-center sm:text-left">
              © 2026 MAN OF STUDY (MOS). Engineered with zero bloat for Pan-Indian students.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-slate-400">100% In-Memory • Zero Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
