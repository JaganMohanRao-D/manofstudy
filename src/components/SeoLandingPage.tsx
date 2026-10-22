import React from 'react';
import { ArrowLeft } from 'lucide-react';

type SeoLandingPageProps = {
  title: string;
  description: string;
  eyebrow: string;
  tool: React.ReactNode;
  howTo: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ href: string; label: string }>;
  toolIntro?: string;
  guideSections?: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
};

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({
  title,
  description,
  eyebrow,
  tool,
  howTo,
  faqs,
  relatedLinks,
  toolIntro,
  guideSections = [],
}) => {
  const goToFeatureHub = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // The allotment landing pages are search-first pages. Keep the live explorer
  // immediately visible so users can search colleges/candidates without first
  // scrolling through SEO copy. Other landing pages keep the normal structure.
  const searchFirst = /allotments/i.test(title);

  const header = (
    <header className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{eyebrow}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        <button
          type="button"
          onClick={goToFeatureHub}
          className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Return to NAA COLLEGE Feature Hub"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Feature Hub
        </button>
      </div>
    </header>
  );

  const liveTool = (
    <section aria-labelledby="mos-live-tool" className="space-y-4">
      {!searchFirst && (
        <div>
          <h2 id="mos-live-tool" className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">Use the Naa College tool</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toolIntro || 'Use the interactive Naa College tool directly below.'}</p>
        </div>
      )}
      {searchFirst && (
        <div className="sr-only" aria-hidden="true">
          <h2 id="mos-live-tool">Live allotment explorer</h2>
        </div>
      )}
      {tool}
    </section>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {searchFirst ? liveTool : header}
      {searchFirst ? header : liveTool}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">How to use it</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {howTo.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-black">{index + 1}</span>
              <span className="leading-6">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {guideSections.length > 0 && (
        <section aria-label="Detailed tool guide" className="space-y-5">
          <header className="max-w-4xl space-y-2 px-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Student guide · AP EAPCET</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">Understand the tool before you make a decision</h2>
            <p className="text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300">This guide explains the purpose, workflow, data context and limitations of the tool. Use it as an educational aid and verify important admission decisions with the official counselling authority.</p>
          </header>
          <div className="grid gap-4">
            {guideSections.map((section) => (
              <article key={section.heading} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">{section.heading}</h3>
                <div className="mt-3 space-y-3">{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="text-sm leading-7 text-slate-600 dark:text-slate-300">{paragraph}</p>)}</div>
                {section.bullets && section.bullets.length > 0 && <ul className="mt-4 space-y-2 list-disc pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <summary className="cursor-pointer list-none pr-6 text-sm font-bold text-slate-900 dark:text-slate-100">{faq.question}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <nav aria-label="Related Naa College pages" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Related EAPCET tools</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {relatedLinks.map((link) => (
            <a key={link.href} href={link.href} className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};
