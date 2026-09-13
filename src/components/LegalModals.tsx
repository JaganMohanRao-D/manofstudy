import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';
import { AboutUs } from './AboutUs';
import { ContactUs } from './ContactUs';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Disclaimer } from './Disclaimer';

export type LegalModalType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer';

interface LegalModalsProps {
  type: LegalModalType | null;
  onClose: () => void;
  onSwitchType?: (type: LegalModalType) => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  type,
  onClose,
  onSwitchType,
}) => {
  // Close on Escape key and clean up body scroll
  useEffect(() => {
    if (!type) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = '';
    };
  }, [type, onClose]);

  if (!type) return null;

  const supportEmail = 'support.jamord@gmail.com';

  return (
    <div
      id="legal-modal-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="region"
      aria-label="Legal compliance dialog"
    >
      {/* Background Dimmer Overlay */}
      <div
        id="legal-modal-dimmer"
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer z-0 transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          onClose();
        }}
        aria-label="Close dialog background"
      />

      {/* Modal Container */}
      <div
        className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
              {type === 'about' && <Sparkles className="w-5 h-5" />}
              {type === 'contact' && <Mail className="w-5 h-5" />}
              {type === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {type === 'terms' && <Scale className="w-5 h-5" />}
              {type === 'disclaimer' && <Info className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {type === 'about' && 'About MAN OF STUDY'}
                {type === 'contact' && 'Contact Support & Developer Desk'}
                {type === 'privacy' && 'Privacy Policy & Data Disclosures'}
                {type === 'terms' && 'Terms of Service'}
                {type === 'disclaimer' && 'Academic & Admissions Disclaimer'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official MAN OF STUDY Institutional, Grassroots &amp; Regulatory Information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Modal Switcher Tabs */}
        {onSwitchType && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0 border-b border-slate-100 dark:border-slate-800">
            {(
              [
                { id: 'about', label: 'About Us' },
                { id: 'privacy', label: 'Privacy Policy' },
                { id: 'disclaimer', label: 'Disclaimer' },
                { id: 'contact', label: 'Contact Us' },
                { id: 'terms', label: 'Terms of Service' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSwitchType(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  type === tab.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed overflow-y-auto pr-1 flex-1">
          {type === 'about' && <AboutUs />}
          {type === 'contact' && <ContactUs />}
          {type === 'privacy' && <PrivacyPolicy />}
          {type === 'disclaimer' && <Disclaimer />}
          {type === 'terms' && (
            <div className="space-y-6 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Terms of Service &amp; Usage Framework
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By accessing MAN OF STUDY, you agree to these transparent educational terms. All tools are offered free of charge.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Acceptable Educational &amp; Professional Use
                </h4>
                <p>
                  MAN OF STUDY provides productivity, document manipulation, and calculation utilities for personal, educational, and non-commercial professional use. You agree not to use the service to process unlawful, defamatory, infringing, or malicious content.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Client-Side Software Guarantee &amp; Availability
                </h4>
                <p>
                  While MAN OF STUDY strives for 99.9% platform uptime and tests algorithms against official university frameworks, all utilities are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Intellectual Property
                </h4>
                <p>
                  All platform interfaces, proprietary computation engines, brand styling, visual designs, and source code are the intellectual property of MAN OF STUDY. You retain complete ownership of all files, documents, and content processed using our client-side tools.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Safe Harbor, Admissions &amp; Scholarship Disclaimer
                </h4>
                <p>
                  MAN OF STUDY is an independent informational and utility platform. TG/AP EAPCET data, college vacancy counts, and scholarship listings are aggregated from publicly available official portals for educational guidance only. MAN OF STUDY is not affiliated with APSCHE, TSCHE, APCFSS, National Scholarship Portal (NSP), or any government body.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  5. Limitation of Liability
                </h4>
                <p>
                  Under no circumstances shall MAN OF STUDY, its operators, or contributors be liable for any direct, indirect, incidental, or consequential damages arising out of your use or inability to use the platform.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2 shrink-0">
          <span>Official Desk: <strong className="text-slate-700 dark:text-slate-300 font-mono select-all">{supportEmail}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModals;
