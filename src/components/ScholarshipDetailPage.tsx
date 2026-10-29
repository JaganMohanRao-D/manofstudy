import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, ExternalLink, FileText, GraduationCap, Info, ShieldCheck } from 'lucide-react';

type ScholarshipRecord = {
  id: string;
  title: string;
  provider: string;
  category: string;
  target: string;
  eligibility: string;
  amount: string;
  deadline: string;
  apply_link: string;
  status?: string;
  source_note?: string;
  last_verified?: string;
  gender?: string;
  description?: string;
  documents?: string[];
  level?: string;
  state?: string;
  official_source_url?: string;
  guideline_url?: string;
};

const safeExternalUrl = (value: string) => { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } };

const slugify = (value: string) => value.toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function effectiveStatus(s: ScholarshipRecord): string {
  const explicitDate = s.deadline.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if (/open/i.test(s.status || '')) {
    if (!explicitDate) return 'Cycle status not confirmed';
    const monthIndex = ['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(explicitDate[2].toLowerCase());
    const deadline = new Date(Number(explicitDate[3]), monthIndex, Number(explicitDate[1]), 23, 59, 59);
    if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()) return 'Closed — listed deadline passed';
    return 'Listed as open — verify provider';
  }
  return s.status || 'Check official source';
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5 sm:p-6">
    <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[var(--mos-text-primary)]">{icon}{title}</h2>
    <div className="mt-4 text-sm leading-7 text-[var(--mos-text-secondary)]">{children}</div>
  </section>
);

export const ScholarshipDetailPage: React.FC = () => {
  const [records, setRecords] = useState<ScholarshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const pathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).slice(1).join('/') : '';
  const record = records.find(item => slugify(item.title) === pathSlug);
  const applicationUrl = record ? (record.official_source_url || record.apply_link) : '';
  const hasOfficialSource = Boolean(record?.official_source_url && safeExternalUrl(record.official_source_url));

  useEffect(() => {
    let alive = true;
    fetch('/indian_scholarships.json')
      .then(response => {
        if (!response.ok) throw new Error('Could not load scholarship data');
        return response.json();
      })
      .then(data => { if (alive && Array.isArray(data)) setRecords(data); else if (alive) setFailed(true); })
      .catch(() => { if (alive) setFailed(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!record) return;
    const canonical = 'https://naacollege.in/scholarships/' + slugify(record.title) + '/';
    document.title = record.title + ': Eligibility, Benefits & Application | Naa College';
    const description = (record.title + ' — review the listed benefit, eligibility summary, application timeline and source links on Naa College. Confirm current rules with the scheme provider.').slice(0, 158);
    const setMeta = (selector: string, content: string) => {
      const element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (element) element.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', document.title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonical);
    setMeta('meta[name="twitter:title"]', document.title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:url"]', canonical);
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = canonical;
  }, [record]);

  if (loading) return <main className="mx-auto max-w-5xl px-4 py-12" aria-busy="true"><div className="h-8 w-2/3 animate-pulse rounded bg-[var(--mos-surface-muted)]" /><div className="mt-5 h-40 animate-pulse rounded-2xl bg-[var(--mos-surface-muted)]" /></main>;
  if (failed || !record) return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--mos-text-primary)]"><GraduationCap className="mx-auto h-10 w-10 text-emerald-500" /><h1 className="mt-4 text-2xl font-black">Scholarship not found</h1><p className="mt-2 text-sm text-[var(--mos-text-secondary)]">This scholarship link may have changed or the record is temporarily unavailable.</p><a className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white" href="/scholarships/"><ArrowLeft className="h-4 w-4" /> Browse scholarships</a></main>;

  const status = effectiveStatus(record);
  const statusLower = status.toLowerCase();
  const isListedOpen = statusLower.startsWith('listed as open');
  const related = records.filter(item => item.id !== record.id && (item.category === record.category || /engineering|b\.tech|technical|diploma|undergraduate/i.test(item.target + ' ' + record.target))).slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-3 py-6 sm:px-5 sm:py-10 text-[var(--mos-text-primary)]">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[var(--mos-text-muted)]">
        <a className="hover:text-emerald-600" href="/">Home</a><span aria-hidden="true">/</span>
        <a className="hover:text-emerald-600" href="/scholarships/">Scholarships</a><span aria-hidden="true">/</span>
        <span aria-current="page" className="max-w-[60vw] truncate">{record.title}</span>
      </nav>

      <header className="overflow-hidden rounded-3xl border border-[var(--mos-border)] bg-[var(--mos-surface)]">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-3 py-1 text-xs font-semibold">{record.category}</span>
            <span className={'rounded-full border px-3 py-1 text-xs font-semibold ' + (isListedOpen ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-slate-400/30 bg-slate-400/10 text-[var(--mos-text-muted)]')}>{status}</span>
          </div>
          <h1 className="mt-4 max-w-4xl text-2xl font-black tracking-tight sm:text-4xl">{record.title}</h1>
          <p className="mt-3 text-sm text-[var(--mos-text-secondary)]">{record.provider}</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--mos-text-secondary)]">{record.description && !/review the current official scheme guidelines/i.test(record.description) ? record.description : (record.eligibility || record.target)}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.05] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"><GraduationCap className="h-4 w-4" /> Listed benefit</div>
              <p className="mt-2 text-base font-bold leading-6">{record.amount || 'Amount not confirmed from the available record'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--mos-text-muted)]"><CalendarDays className="h-4 w-4" /> Application timeline</div>
              <p className="mt-2 text-sm font-semibold">{record.deadline || 'Current deadline not confirmed'}</p>
              <p className="mt-1 text-xs text-[var(--mos-text-muted)]">Confirm the current cycle on the provider's page before applying.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {safeExternalUrl(applicationUrl) ? <a href={applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"><ExternalLink className="h-4 w-4" /> {hasOfficialSource ? 'Visit official source' : 'Open listed source'}</a> : <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--mos-surface-muted)] px-5 py-3 text-sm font-bold text-[var(--mos-text-muted)]">Application link unavailable</span>}
            <a href="/scholarships/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-5 py-3 text-sm font-bold"><ArrowLeft className="h-4 w-4" /> All scholarships</a>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <Section title="Eligibility summary" icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}>
            <p>{record.eligibility || 'Detailed eligibility has not been confirmed in the current record.'}</p>
            <p className="mt-3 text-xs">This is a summary, not an eligibility guarantee. Course, institution, income, category, marks and renewal conditions may depend on the current official scheme guidelines.</p>
          </Section>
          <Section title="How to apply" icon={<FileText className="h-5 w-5 text-emerald-500" />}>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Open the linked provider or application page and confirm that it covers the relevant academic year.</li>
              <li>Read the current scheme guidelines and verify all eligibility conditions.</li>
              <li>Prepare only the documents listed as required by the current official notification.</li>
              <li>Submit through the designated application channel, if the application window is open.</li>
              <li>Save the acknowledgement and use the provider's official process to track your application.</li>
            </ol>
            <p className="mt-3 text-xs">Steps are general guidance. The actual process varies by scholarship.</p>
          </Section>
          <Section title="Documents to check" icon={<FileText className="h-5 w-5 text-emerald-500" />}>
            The required documents have not been independently enumerated in this record. Check the latest official notification for the exact list; do not assume that Aadhaar, income, caste, bank or marks certificates are all mandatory for every scheme.
          </Section>
          <Section title="Renewal and other conditions" icon={<Info className="h-5 w-5 text-emerald-500" />}>
            Renewal rules, academic progression, attendance, minimum marks, institution restrictions and restrictions on combining awards are scheme-specific. Confirm these in the current guidelines before relying on this listing.
          </Section>
          <Section title="Sources and verification" icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}>
            {record.source_note && <p><strong>Source note:</strong> {record.source_note}</p>}
            {record.official_source_url && <p className="mt-2 break-words">Official source: <a className="font-semibold text-emerald-700 underline dark:text-emerald-300" href={record.official_source_url} target="_blank" rel="noopener noreferrer">{record.official_source_url}</a></p>}
            {record.guideline_url && record.guideline_url !== record.official_source_url && <p className="mt-2 break-words">Scheme guidelines: <a className="font-semibold text-emerald-700 underline dark:text-emerald-300" href={record.guideline_url} target="_blank" rel="noopener noreferrer">{record.guideline_url}</a></p>}
            {safeExternalUrl(record.apply_link) && record.apply_link !== record.official_source_url && <p className="mt-2 break-words">Listed application/source URL: <a className="font-semibold text-emerald-700 underline dark:text-emerald-300" href={record.apply_link} target="_blank" rel="noopener noreferrer">{record.apply_link}</a></p>}
            {!hasOfficialSource && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">An official provider URL is not recorded for this entry. Verify the scheme directly with its provider before submitting personal information.</p>}
            <p className="mt-2">Last verification recorded in the dataset: <strong>{record.last_verified || 'Not recorded'}</strong>.</p>
            <p className="mt-2 text-xs">A recorded verification date does not guarantee that the deadline or scheme rules remain current. Confirm directly with the scheme provider.</p>
          </Section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5">
            <h2 className="font-bold">Before you apply</h2>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--mos-text-secondary)]">
              <li>✓ Confirm the academic year.</li><li>✓ Recheck the final deadline.</li><li>✓ Verify your course and institution.</li><li>✓ Read the official eligibility rules.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[.05] p-5">
            <h2 className="font-bold">Important note</h2>
            <p className="mt-2 text-xs leading-6 text-[var(--mos-text-secondary)]">Naa College is an independent information platform and is not the scholarship awarding authority. Listing a scheme does not mean an application is open or that funding is guaranteed.</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && <section className="space-y-3"><h2 className="text-lg font-bold">Explore related scholarships</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{related.map(item => <a key={item.id} href={'/scholarships/' + slugify(item.title) + '/'} className="group rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-4 transition hover:border-emerald-500/40"><span className="text-xs text-[var(--mos-text-muted)]">{item.provider}</span><h3 className="mt-2 font-bold leading-6 group-hover:text-emerald-600">{item.title}</h3><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">View details <ArrowUpRight className="h-3.5 w-3.5" /></span></a>)}</div></section>}
      <p className="text-xs leading-6 text-[var(--mos-text-muted)]">Information is for student guidance. Verify the current notification and application details directly with the scheme provider.</p>
    </main>
  );
};

export const scholarshipSlug = slugify;
