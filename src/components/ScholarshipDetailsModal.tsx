import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck,
  Share2,
  Copy,
  Check,
  GraduationCap,
  IndianRupee,
} from 'lucide-react';
import { IndianScholarship as Scholarship } from './ScholarshipsHub';

interface ScholarshipDetailsModalProps {
  scholarship: Scholarship | null;
  onClose: () => void;
}

const SCHOLARSHIPS_URL = 'https://manofstudy.pages.dev/scholarships';

export const ScholarshipDetailsModal: React.FC<ScholarshipDetailsModalProps> = ({
  scholarship,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!scholarship) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [scholarship, onClose]);

  if (!scholarship || typeof document === 'undefined') return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(SCHOLARSHIPS_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be unavailable in some browsers; keep the modal usable.
    }
  };

  const handleShareWhatsApp = () => {
    const text = [
      'NAA COLLEGE | SCHOLARSHIP UPDATE',
      '',
      `🎓 ${scholarship.title}`,
      `💰 ${scholarship.amount}`,
      `🎯 ${scholarship.target}`,
      `📅 ${scholarship.deadline}`,
      '',
      `Apply: ${SCHOLARSHIPS_URL}`,
    ].join('\n');

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const isExclusiveGirls = scholarship.gender === 'Female Only';
  const genderTag = isExclusiveGirls ? 'Female Candidates Only' : 'All Eligible Genders';

  const mandatoryDocuments = [
    'Recent Passport Size Photograph & Signature',
    'Previous Academic Marksheets & Passing Certificates (10th / 12th / Diploma / Degree)',
    'Current College Admission Offer Letter & Bonafide / Study Certificate',
    'Official Fee Receipt / Fee Structure of the Current Academic Year',
    'Family Annual Income Certificate (issued by competent authority / MeeSeva / Tahsildar)',
    'Active Bank Account Passbook Copy (Student’s name with IFSC code & Aadhaar linked)',
    'Aadhaar Card (Student & Parents)',
    'Category / Caste Certificate (SC/ST/OBC/EWS) or PwBD Certificate (if applicable)',
  ];

  return createPortal(
    <div
      id="scholarship-details-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-lg flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scholarship-modal-title"
    >
      <div
        id="scholarship-details-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[calc(100dvh-1rem)] sm:max-h-[92dvh] bg-[var(--mos-surface)] rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,.35)] border border-emerald-500/20 overflow-hidden flex flex-col text-[var(--mos-text-primary)]"
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500" />
        <div className="p-4 sm:p-6 border-b border-[var(--mos-border)] bg-[var(--mos-surface)]/95 backdrop-blur-xl flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                <Building2 className="w-3 h-3" /> {scholarship.provider}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] border border-[var(--mos-border)]">
                {scholarship.category}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${isExclusiveGirls ? 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/30' : 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30'}`}>
                {genderTag}
              </span>
            </div>
            <h2 id="scholarship-modal-title" className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              {scholarship.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] transition-colors shrink-0 cursor-pointer border border-[var(--mos-border)]" aria-label="Close scholarship details modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain space-y-4 text-[var(--mos-text-secondary)] text-xs sm:text-sm leading-relaxed">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/12 via-cyan-500/8 to-transparent border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25"><IndianRupee className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Scholarship Reward / Financial Grant</span>
                <span className="text-base sm:text-xl font-black text-[var(--mos-text-primary)]">{scholarship.amount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{/government|state government/i.test(scholarship.category) ? 'Government scheme' : 'Programme award'}</span>
            </div>
          </div>

          {scholarship.source_note && (
            <div className="bg-sky-500/10 rounded-2xl p-4 border border-sky-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wider"><ShieldCheck className="w-4 h-4" /><span>Source & verification</span></div>
              <p className="text-xs text-[var(--mos-text-secondary)] leading-relaxed">{scholarship.source_note}</p>
              {scholarship.last_verified && <p className="text-[10px] text-[var(--mos-text-muted)]">Directory verification date: {scholarship.last_verified}</p>}
            </div>
          )}

          <div className="bg-[var(--mos-surface-muted)] rounded-2xl p-4 border border-[var(--mos-border)] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider"><GraduationCap className="w-4 h-4 text-sky-500 dark:text-sky-400" /><span>Target Candidates & Eligible Courses</span></div>
            <p className="font-semibold text-[var(--mos-text-primary)] text-sm">{scholarship.target}</p>
          </div>

          <div className="bg-[var(--mos-surface-muted)] rounded-2xl p-4 border border-[var(--mos-border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /><span>Complete Eligibility Criteria</span></div>
            <p className="text-xs sm:text-sm text-[var(--mos-text-secondary)] leading-relaxed">{scholarship.eligibility}</p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-medium text-[var(--mos-text-secondary)]">
              <span className="px-2.5 py-1 rounded-lg bg-[var(--mos-surface)] border border-[var(--mos-border)]">Gender: <strong>{genderTag}</strong></span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--mos-surface)] border border-[var(--mos-border)]">Nationality: <strong>Indian Citizen</strong></span>
            </div>
          </div>

          <div className="bg-[var(--mos-surface-muted)] rounded-2xl p-4 border border-[var(--mos-border)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider"><FileCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" /><span>Mandatory Documents Required to Apply</span></div>
            <ul className="space-y-1.5 text-xs text-[var(--mos-text-secondary)]">
              {mandatoryDocuments.map((doc, idx) => <li key={idx} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" /><span>{doc}</span></li>)}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[var(--mos-text-secondary)] text-xs">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500 shrink-0" /><span><strong>Application Deadline:</strong> <span className="text-amber-600 dark:text-amber-300 font-semibold">{scholarship.deadline}</span></span></div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /><span>Verify details on the application source</span></div>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 border-t border-[var(--mos-border)] bg-[var(--mos-surface)]/95 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={handleShareWhatsApp} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-xs transition-colors cursor-pointer"><Share2 className="w-3.5 h-3.5 text-emerald-500" /><span>Share</span></button>
            <button onClick={handleCopyLink} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] font-bold text-xs transition-colors cursor-pointer">
              {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span></> : <><Copy className="w-3.5 h-3.5 text-[var(--mos-text-muted)]" /><span>Copy Scholarship Link</span></>}
            </button>
          </div>
          <a href={scholarship.apply_link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"><span>Apply on Official Portal</span><ExternalLink className="w-4 h-4" /></a>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ScholarshipDetailsModal;
