import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  FileText,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  LockKeyhole,
  Map,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wrench,
} from 'lucide-react';

const TOOLKIT = [
  {
    icon: GraduationCap,
    title: 'AP & TG Admissions',
    text: 'Explore EAPCET allotments, college predictors, top-college views and counselling data in one place.',
    tag: 'Admissions',
  },
  {
    icon: Trophy,
    title: 'College & Rank Insights',
    text: 'Compare observed allotment patterns and understand what the available counselling data actually shows.',
    tag: 'Data',
  },
  {
    icon: HeartHandshake,
    title: 'Scholarships',
    text: 'Browse government, state, PM, AICTE and corporate scholarship opportunities with eligibility and source details.',
    tag: 'Funding',
  },
  {
    icon: BookOpen,
    title: 'Mock Tests & Academics',
    text: 'Practice through mock-test series and use everyday academic utilities for attendance, GPA and internal planning.',
    tag: 'Study',
  },
  {
    icon: Map,
    title: 'Roadmaps & Career Prep',
    text: 'Follow branch roadmaps, explore internships, projects and placement-focused resources from a single student hub.',
    tag: 'Career',
  },
  {
    icon: Wrench,
    title: 'Private Student Utilities',
    text: 'Use browser-based PDF, image and document utilities designed to keep routine student tasks simple and fast.',
    tag: 'Utilities',
  },
];

const FAQS = [
  {
    q: 'Is MAN OF STUDY an official counselling website?',
    a: 'No. MAN OF STUDY is an independent student utility platform. Official counselling portals and published authorities remain the final source for applications, eligibility, seat allotment and admission decisions.',
  },
  {
    q: 'How should I use the AP or TG college predictor?',
    a: 'Enter the details requested by the relevant predictor and use the returned colleges as a planning shortlist. Historical allotment data can guide comparison, but future cutoffs and allotments can change with ranks, choices, seats and counselling rules.',
  },
  {
    q: 'What does the college-wise allotment data show?',
    a: 'The allotment explorers let students inspect the available counselling records by college, branch and relevant category fields. The exact coverage and year are shown inside each tool so students can understand what dataset they are viewing.',
  },
  {
    q: 'What are the AP and TG Top B.Tech Colleges sections based on?',
    a: 'They are derived from the counselling/allotment data available to MAN OF STUDY for the respective state and reference group. They are not a universal ranking of every engineering institution. Deemed universities and institutions outside the respective EAPCET counselling/allotment data are excluded.',
  },
  {
    q: 'Can scholarship information change?',
    a: 'Yes. Deadlines, eligibility, award amounts and application windows can change. Use the source/application link shown for a scholarship and verify the latest conditions before applying.',
  },
  {
    q: 'Are the PDF and image utilities designed to upload my files to MAN OF STUDY servers?',
    a: 'The private browser utilities are designed for client-side processing wherever the individual tool supports it. Always read the tool-specific privacy note before processing a sensitive document.',
  },
  {
    q: 'What is the purpose of the mock-test login?',
    a: 'Google sign-in is used to identify a student for the mock-test experience. The interface can use the signed-in Google profile name and profile image for the test session instead of asking students to create another account.',
  },
  {
    q: 'Can I rely on MAN OF STUDY alone for an admission decision?',
    a: 'Use it as a planning and learning companion, not as a substitute for official notifications. Always verify final dates, eligibility, reservation rules, fees and allotment instructions with the relevant official authority.',
  },
];

const makeAnchor = (parent: Element, before?: Element | null) => {
  const node = document.createElement('div');
  node.setAttribute('data-mos-enhancement-anchor', 'true');
  if (before && before.parentElement === parent) parent.insertBefore(node, before);
  else parent.appendChild(node);
  return node;
};

const SectionShell: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <section className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </section>
);

const ToolkitCard: React.FC<{ item: (typeof TOOLKIT)[number] }> = ({ item }) => {
  const Icon = item.icon;
  return (
    <article className="group rounded-3xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="rounded-full border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--mos-text-muted)]">
          {item.tag}
        </span>
      </div>
      <h3 className="mt-5 text-base sm:text-lg font-extrabold text-[var(--mos-text-primary)]">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--mos-text-secondary)]">{item.text}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
        Explore from Feature Hub <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </article>
  );
};

const GuidanceBlock: React.FC = () => (
  <>
    <SectionShell className="pt-14 sm:pt-20">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--mos-border)] bg-[var(--mos-surface)] shadow-sm">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:p-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Student-first platform
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--mos-text-primary)] sm:text-4xl">
              Why <span className="text-blue-600 dark:text-blue-400">MAN OF STUDY</span>?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--mos-text-secondary)] sm:text-lg">
              Engineering students often have to jump between counselling pages, scholarship portals, study resources and small everyday utilities. MAN OF STUDY brings those student tasks into one focused workspace — built around practical use rather than a wall of information.
            </p>
            <p className="mt-4 text-sm font-bold leading-6 text-[var(--mos-text-primary)] sm:text-base">
              Come with a question, a rank, a deadline or a study task. Leave with clearer next steps.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ['Clear', 'Short explanations before deeper data.'],
              ['Practical', 'Tools for real student workflows, not just articles.'],
              ['Transparent', 'Data scope, limitations and official-source reminders are shown where they matter.'],
              ['Student-built', 'The platform grows from real problems students face during college and counselling.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--mos-text-primary)]">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  {title}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm leading-5 text-[var(--mos-text-secondary)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>

    <SectionShell className="pt-14 sm:pt-20">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">The student toolkit</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--mos-text-primary)] sm:text-4xl">More than one predictor.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mos-text-secondary)] sm:text-base">
            Admissions, scholarships, mock tests, academic planning, career preparation and private utilities — organized so students can find the right workspace quickly.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 rounded-full border border-[var(--mos-border)] bg-[var(--mos-surface)] px-3 py-2 text-xs font-bold text-[var(--mos-text-secondary)] sm:inline-flex">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Start from the Feature Hub
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLKIT.map((item) => <ToolkitCard key={item.title} item={item} />)}
      </div>
    </SectionShell>

    <SectionShell className="pt-14 sm:pt-20">
      <div className="rounded-[2rem] border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-6 sm:p-10">
        <div className="text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">A simple workflow</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--mos-text-primary)] sm:text-3xl">Find. Understand. Plan.</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--mos-text-secondary)]">
            You do not need to understand every tool before starting. Pick the task you have right now and work outward from there.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [Search, '1', 'Find the right workspace', 'Use the Feature Hub or Quick Search to locate the admission, academic, scholarship or career tool you need.'],
            [Lightbulb, '2', 'Understand the result', 'Read the short guidance, data scope and notes before acting on a prediction, cutoff or scholarship listing.'],
            [Target, '3', 'Make your plan', 'Use the information to prepare options, compare possibilities and then verify final decisions with official sources.'],
          ].map(([Icon, number, title, text]) => {
            const StepIcon = Icon as typeof Search;
            return (
              <div key={String(number)} className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">{number}</span>
                  <StepIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-extrabold text-[var(--mos-text-primary)]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--mos-text-secondary)]">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>

    <SectionShell className="pt-14 sm:pt-20">
      <div className="rounded-[2rem] border border-[var(--mos-border)] bg-[var(--mos-surface)] p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <CircleHelp className="h-4 w-4" aria-hidden="true" />
              Student FAQs
            </div>
            <h2 className="mt-2 text-2xl font-black text-[var(--mos-text-primary)] sm:text-3xl">Before you use a tool, know what it means.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mos-text-secondary)]">
              Quick answers about admissions data, predictors, scholarships, privacy and how to use MAN OF STUDY responsibly.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-[var(--mos-text-muted)] sm:flex">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Clear scope. No hidden promises.
          </div>
        </div>

        <div className="mt-7 divide-y divide-[var(--mos-border)] border-y border-[var(--mos-border)]">
          <FaqList />
        </div>
      </div>
    </SectionShell>
  </>
);

const FaqList: React.FC = () => {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {FAQS.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? -1 : index)}
              aria-expanded={expanded}
              className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="text-sm font-extrabold leading-6 text-[var(--mos-text-primary)] sm:text-base">{item.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--mos-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {expanded && (
              <div className="pb-5 pr-7 text-sm leading-6 text-[var(--mos-text-secondary)]">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const MosStudentExperience: React.FC = () => {
  const [faqTarget, setFaqTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let faqAnchor: HTMLDivElement | null = null;
    let observer: MutationObserver | null = null;
    let attempts = 0;

    const mount = () => {
      const faq = document.getElementById('student-faq-section');
      if (faq && !faqAnchor) {
        faqAnchor = makeAnchor(faq.parentElement || document.body, faq);
        setFaqTarget(faqAnchor);
      }

      attempts += 1;
      if (faqAnchor && observer) observer.disconnect();
    };

    mount();
    observer = new MutationObserver(mount);
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer?.disconnect(), 15000);

    return () => {
      observer?.disconnect();
      window.clearTimeout(timeout);
      faqAnchor?.remove();
      setFaqTarget(null);
    };
  }, []);

  return (
    <>
      {faqTarget && createPortal(<GuidanceBlock />, faqTarget)}
    </>
  );
};

export default MosStudentExperience;
