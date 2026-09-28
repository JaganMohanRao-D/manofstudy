import React from 'react';

type SeoLandingPageProps = {
  title: string;
  description: string;
  eyebrow: string;
  tool: React.ReactNode;
  howTo: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ href: string; label: string }>;
};

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({
  title,
  description,
  eyebrow,
  tool,
  howTo,
  faqs,
  relatedLinks,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <header className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
      </header>

      <section aria-labelledby="mos-live-tool" className="space-y-4">
        <div>
          <h2 id="mos-live-tool" className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">Use the Man of Study tool</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search the available allotment dataset directly below.</p>
        </div>
        {tool}
      </section>

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

      <nav aria-label="Related Man of Study pages" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">Related EAPCET tools</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};
