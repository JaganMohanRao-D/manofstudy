import React, { useEffect } from 'react';
import { ArrowLeft, FileText, ShieldCheck, Mail, Info, Scale } from 'lucide-react';
import { AboutUs } from './AboutUs';
import { ContactUs } from './ContactUs';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Disclaimer } from './Disclaimer';

export type StandaloneLegalPageType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer';

const PAGE_META: Record<StandaloneLegalPageType, { title: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  about: { title: 'About Naa College', description: 'Learn about the purpose and people behind Naa College.', icon: Info },
  contact: { title: 'Contact Developer', description: 'Contact the Naa College developer and support desk.', icon: Mail },
  privacy: { title: 'Privacy Policy', description: 'Review how Naa College describes data, browser storage and privacy.', icon: ShieldCheck },
  terms: { title: 'Terms of Service', description: 'Review the terms for using Naa College tools and resources.', icon: FileText },
  disclaimer: { title: 'Legal Safe Harbor & Disclaimer', description: 'Review important information about educational data, predictions and independent status.', icon: Scale },
};

const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: '/about', label: 'About Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/legal-safe-harbor', label: 'Legal Safe Harbor & Disclaimer' },
  { href: '/contact-us', label: 'Contact Developer' },
];

export const LegalPage: React.FC<{ type: StandaloneLegalPageType }> = ({ type }) => {
  const meta = PAGE_META[type];
  const Icon = meta.icon;
  useEffect(() => {
    document.title = meta.title + ' | Naa College';
    const description = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (description) description.content = meta.description;

    const canonicalByType: Record<StandaloneLegalPageType, string> = {
      about: 'https://naacollege.in/about',
      contact: 'https://naacollege.in/contact-us',
      privacy: 'https://naacollege.in/privacy-policy',
      terms: 'https://naacollege.in/terms-of-service',
      disclaimer: 'https://naacollege.in/legal-safe-harbor',
    };
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalByType[type];
  }, [meta.description, meta.title, type]);

  return (
    <div className="min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)] tech-grid-pattern-light">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="https://naacollege.in/" aria-label="Naa College home" className="flex min-w-0 shrink items-center">
            <img src="/Naacollege_fulllogo.webp" alt="Naa College home" width="320" height="180" className="block h-auto max-h-12 w-[min(44vw,220px)] object-contain sm:w-[220px]" decoding="async" />
          </a>
          <a href="/" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-200 dark:hover:text-cyan-300">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Naa College</span><span className="sm:hidden">Home</span>
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-300"><Icon className="h-5 w-5" /></span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{meta.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{meta.description}</p>
            </div>
          </div>
          <nav aria-label="Information pages" className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {LEGAL_LINKS.map((link) => {
              const selected = link.href === ({
                about: '/about',
                privacy: '/privacy-policy',
                terms: '/terms-of-service',
                disclaimer: '/legal-safe-harbor',
                contact: '/contact-us',
              } as Record<StandaloneLegalPageType, string>)[type];
              return <a key={link.href} href={link.href} aria-current={selected ? 'page' : undefined} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${selected ? 'border-cyan-600 bg-cyan-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'}`}>{link.label}</a>;
            })}
          </nav>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white px-5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-8">
          {type === 'about' && <AboutUs />}
          {type === 'contact' && <ContactUs />}
          {type === 'privacy' && <PrivacyPolicy />}
          {type === 'disclaimer' && <Disclaimer />}
          {type === 'terms' && (
            <div className="mx-auto max-w-4xl space-y-7 py-7 text-sm leading-7 text-slate-700 dark:text-slate-300">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <h2 className="font-bold text-slate-950 dark:text-white">Terms of Service &amp; Usage Framework</h2>
                <p className="mt-2 text-sm">By accessing Naa College, you agree to these educational terms. Tools and resources are provided for student use, subject to the limitations described below.</p>
              </section>
              <section><h2 className="font-bold text-slate-950 dark:text-white">1. Acceptable Educational &amp; Professional Use</h2><p className="mt-2">Naa College provides productivity, document manipulation, and calculation utilities for personal, educational, and non-commercial professional use. Do not use the service to process unlawful, defamatory, infringing, or malicious content.</p></section>
              <section><h2 className="font-bold text-slate-950 dark:text-white">2. Availability and No Warranty</h2><p className="mt-2">The website and its utilities are provided on an “as is” and “as available” basis without warranties of any kind, express or implied. Availability, features, data and calculations may change.</p></section>
              <section><h2 className="font-bold text-slate-950 dark:text-white">3. Intellectual Property and User Files</h2><p className="mt-2">Naa College branding, interface design and original platform content belong to their respective owners. You retain ownership of files and content you process using the tools. You are responsible for ensuring you have the rights to use any material you upload or process.</p></section>
              <section><h2 className="font-bold text-slate-950 dark:text-white">4. Educational Data and Admissions</h2><p className="mt-2">College, counselling, allotment, scholarship and predictor information is provided for general educational guidance. It is not an official admission decision or a guarantee of eligibility, seat availability, scholarship approval or future outcome. Verify important information with the relevant official authority.</p></section>
              <section><h2 className="font-bold text-slate-950 dark:text-white">5. Third-Party Services and Links</h2><p className="mt-2">The website may link to third-party websites and services. Naa College does not control their content, availability or policies. Review the applicable terms and privacy information of those providers before using them.</p></section>
              <section><h2 className="font-bold text-slate-950 dark:text-white">6. Limitation of Liability</h2><p className="mt-2">To the extent permitted by applicable law, Naa College and its contributors are not liable for indirect or consequential loss arising from use of, or inability to use, the website. Nothing in these terms excludes liability that cannot legally be excluded.</p></section>
              <p className="border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">Questions about these terms? Contact <a className="font-semibold text-cyan-700 underline dark:text-cyan-300" href="/contact-us">the Naa College developer desk</a>.</p>
            </div>
          )}
        </article>
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Naa College. All rights reserved.</span>
          <nav aria-label="Legal pages" className="flex flex-wrap gap-x-4 gap-y-2">{LEGAL_LINKS.map((link) => <a key={link.href} href={link.href} className="hover:text-cyan-700 dark:hover:text-cyan-300">{link.label}</a>)}</nav>
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
