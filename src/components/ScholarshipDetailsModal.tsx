import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ExternalLink, ShieldCheck, CheckCircle2, CalendarDays, Building2,
  FileCheck2, Share2, Copy, Check, GraduationCap, Wallet, ArrowUpRight,
  ClipboardList, Info, MapPin, Users
} from 'lucide-react';
import { IndianScholarship as Scholarship } from './ScholarshipsHub';
import { scholarshipSlug } from './ScholarshipDetailPage';

interface ScholarshipDetailsModalProps {
  scholarship: Scholarship | null;
  onClose: () => void;
}

function safeExternalUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function dateLabel(s: Scholarship): string {
  return s.deadline || 'Not announced / not confirmed';
}

export const ScholarshipDetailsModal: React.FC<ScholarshipDetailsModalProps> = ({ scholarship, onClose }) => {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const detailUrl = useMemo(() => scholarship ? 'https://naacollege.in/scholarships/' + scholarshipSlug(scholarship.title) + '/' : '', [scholarship]);

  useEffect(() => {
    if (!scholarship) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [scholarship, onClose]);

  if (!scholarship || typeof document === 'undefined') return null;

  const copyDetailLink = async () => {
    try {
      await navigator.clipboard.writeText(detailUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: scholarship.title, text: 'Scholarship details on Naa College', url: detailUrl });
      else await navigator.clipboard.writeText(detailUrl);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        try { await navigator.clipboard.writeText(detailUrl); setCopied(true); } catch { /* Keep the detail panel usable if sharing is unavailable. */ }
      }
    }
  };

  const docs = Array.isArray(scholarship.documents) ? scholarship.documents.filter(Boolean) : [];
  const steps = Array.isArray(scholarship.application_steps) && scholarship.application_steps.length
    ? scholarship.application_steps
    : ['Read the current scheme guidelines and confirm every eligibility condition.', 'Prepare only the documents requested by the scheme or application portal.', 'Submit through the designated provider portal before the confirmed deadline.', 'Save the acknowledgement and follow any institute or authority verification steps.'];
  const isGirlOnly = /female only|girls only|girl students only/i.test(scholarship.gender || '') || /girl students only|female students only|for young women/i.test(scholarship.target + ' ' + scholarship.eligibility);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="scholarship-modal-title" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-[var(--mos-border)] bg-[var(--mos-surface)] text-[var(--mos-text-primary)] shadow-2xl sm:rounded-3xl">
        <div className="h-1 shrink-0 bg-emerald-500" />
        <header className="flex items-start justify-between gap-4 border-b border-[var(--mos-border)] p-4 sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"><Building2 className="h-3 w-3" /> {scholarship.provider}</span>
              <span className="rounded-full border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--mos-text-secondary)]">{scholarship.category}</span>
            </div>
            <h2 id="scholarship-modal-title" className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl">{scholarship.title}</h2>
            <p className="mt-2 text-xs leading-5 text-[var(--mos-text-muted)]">Review the summary below, then confirm current-cycle rules with the scheme provider.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close scholarship details" className="shrink-0 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-2.5 transition hover:bg-[var(--mos-border)] focus-visible:outline-2 focus-visible:outline-emerald-500"><X className="h-4 w-4" /></button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:space-y-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.06] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-emerald-700 dark:text-emerald-300"><Wallet className="h-4 w-4" /> Published benefit</div>
              <p className="mt-2 break-words text-base font-black leading-6">{scholarship.amount || 'Amount not confirmed from an official source'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--mos-text-muted)]"><CalendarDays className="h-4 w-4" /> Application timeline</div>
              <p className="mt-2 text-sm font-bold">{dateLabel(scholarship)}</p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--mos-text-muted)]">{scholarship.status || 'Current cycle status not confirmed'}</p>
            </div>
          </div>

          <section className="rounded-2xl border border-[var(--mos-border)] p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold"><GraduationCap className="h-4 w-4 text-emerald-600" /> Who this may be for</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--mos-text-secondary)]">{scholarship.description || scholarship.target || 'Review the official scheme guidelines for the intended student group.'}</p>
            <div className="mt-3 rounded-xl bg-[var(--mos-surface-muted)] p-3 text-xs leading-5 text-[var(--mos-text-secondary)]"><strong className="text-[var(--mos-text-primary)]">Eligibility summary:</strong> {scholarship.eligibility || 'The full eligibility criteria are not confirmed in this directory record.'}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {scholarship.level && <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mos-border)] px-2.5 py-1.5 text-[11px]"><GraduationCap className="h-3 w-3" /> {scholarship.level}</span>}
              {scholarship.state && <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mos-border)] px-2.5 py-1.5 text-[11px]"><MapPin className="h-3 w-3" /> {scholarship.state}</span>}
              {scholarship.gender && <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mos-border)] px-2.5 py-1.5 text-[11px]"><Users className="h-3 w-3" /> {scholarship.gender}</span>}
              {isGirlOnly && <span className="rounded-lg border border-pink-500/20 bg-pink-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-pink-700 dark:text-pink-300">Girls / women-specific</span>}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--mos-border)] p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold"><FileCheck2 className="h-4 w-4 text-emerald-600" /> Documents</h3>
            {docs.length > 0 ? <ul className="mt-3 space-y-2">{docs.map((doc, index) => <li key={doc + index} className="flex items-start gap-2 text-sm leading-5 text-[var(--mos-text-secondary)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{doc}</li>)}</ul> : <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs leading-5 text-[var(--mos-text-secondary)]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p>The scheme-specific required document list has not been verified in this directory record. Do not assume that common documents are mandatory; use the official notification or application portal.</p></div>}
          </section>

          <section className="rounded-2xl border border-[var(--mos-border)] p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold"><ClipboardList className="h-4 w-4 text-emerald-600" /> Application steps</h3>
            <ol className="mt-3 space-y-3">{steps.map((step, index) => <li key={step + index} className="flex items-start gap-3 text-sm leading-5 text-[var(--mos-text-secondary)]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[11px] font-black text-emerald-700 dark:text-emerald-300">{index + 1}</span><span>{step}</span></li>)}</ol>
            <p className="mt-3 text-[11px] leading-5 text-[var(--mos-text-muted)]">These are general navigation steps unless a scheme-specific procedure is explicitly listed. Submitting an application does not guarantee selection or payment.</p>
          </section>

          <section className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Source and verification</h3>
            <p className="mt-2 text-xs leading-5 text-[var(--mos-text-secondary)]">{scholarship.source_note || 'This listing has not been independently verified for the current application cycle.'}</p>
            {scholarship.last_verified && <p className="mt-2 text-[11px] text-[var(--mos-text-muted)]">Record verification note: {scholarship.last_verified}</p>}
            {scholarship.guideline_url && safeExternalUrl(scholarship.guideline_url) && <a href={scholarship.guideline_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 underline underline-offset-4 dark:text-emerald-300">Read scheme guidelines <ExternalLink className="h-3 w-3" /></a>}
          </section>
        </div>

        <footer className="flex flex-col gap-2 border-t border-[var(--mos-border)] bg-[var(--mos-surface)] p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={share} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--mos-border)] px-3 py-2.5 text-xs font-bold transition hover:bg-[var(--mos-surface-muted)] focus-visible:outline-2 focus-visible:outline-emerald-500"><Share2 className="h-3.5 w-3.5" /> Share</button>
            <button type="button" onClick={copyDetailLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--mos-border)] px-3 py-2.5 text-xs font-bold transition hover:bg-[var(--mos-surface-muted)] focus-visible:outline-2 focus-visible:outline-emerald-500">{copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy details link'}</button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <a href={detailUrl} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--mos-border)] px-3 py-2.5 text-xs font-bold transition hover:border-emerald-500/40 focus-visible:outline-2 focus-visible:outline-emerald-500">Full page <ArrowUpRight className="h-3.5 w-3.5" /></a>
            {safeExternalUrl(scholarship.apply_link) ? <a href={scholarship.apply_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">Apply now <ExternalLink className="h-3.5 w-3.5" /></a> : <button disabled className="rounded-xl bg-[var(--mos-surface-muted)] px-4 py-2.5 text-xs font-bold text-[var(--mos-text-muted)]">Application link unavailable</button>}
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default ScholarshipDetailsModal;
