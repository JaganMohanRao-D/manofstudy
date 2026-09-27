import React, { useState } from 'react';
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

export const ScholarshipDetailsModal: React.FC<ScholarshipDetailsModalProps> = ({
  scholarship,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!scholarship) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(scholarship.apply_link || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Check out this verified scholarship: *${scholarship.title}* offering *${scholarship.amount}*.\n\nTarget: ${scholarship.target}\nDeadline: ${scholarship.deadline}\nApply here: ${scholarship.apply_link}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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

  return (
    <div
      id="scholarship-details-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[var(--mos-overlay)] backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scholarship-modal-title"
    >
      <div
        id="scholarship-details-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--mos-surface)] rounded-3xl shadow-2xl border border-[var(--mos-border)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-[var(--mos-text-primary)]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--mos-border)] bg-[var(--mos-surface)] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[var(--mos-surface-muted)] text-emerald-600 dark:text-emerald-400 border border-[var(--mos-border)]">
                <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {scholarship.provider}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] border border-[var(--mos-border)]">
                {scholarship.category}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                  isExclusiveGirls
                    ? 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                }`}
              >
                {genderTag}
              </span>
            </div>

            <h2
              id="scholarship-modal-title"
              className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--mos-text-primary)] tracking-tight leading-snug"
            >
              {scholarship.title}
            </h2>
          </div>

          <button
            id="close-scholarship-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] transition-colors shrink-0 cursor-pointer border border-[var(--mos-border)]"
            aria-label="Close scholarship details modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-[var(--mos-text-secondary)] text-xs sm:text-sm leading-relaxed">
          {/* Highlighted Grant / Reward Pill */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Scholarship Reward / Financial Grant
                </span>
                <span className="text-base sm:text-lg font-black text-[var(--mos-text-primary)] font-mono">
                  {scholarship.amount}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{/government|state government/i.test(scholarship.category) ? 'Government scheme' : 'Programme award'}</span>
            </div>
          </div>

          {scholarship.source_note && (
            <div className="bg-sky-500/10 rounded-2xl p-4 border border-sky-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Source & verification</span>
              </div>
              <p className="text-xs text-[var(--mos-text-secondary)] leading-relaxed">{scholarship.source_note}</p>
              {scholarship.last_verified && (
                <p className="text-[10px] text-[var(--mos-text-muted)]">Directory verification date: {scholarship.last_verified}</p>
              )}
            </div>
          )}

          {/* Target Audience & Eligible Courses */}
          <div className="bg-[var(--mos-surface-muted)] rounded-2xl p-4 border border-[var(--mos-border)] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Target Candidates &amp; Eligible Courses</span>
            </div>
            <p className="font-semibold text-[var(--mos-text-primary)] text-sm">
              {scholarship.target}
            </p>
          </div>

          {/* Complete Eligibility Criteria */}
          <div className="bg-[var(--mos-surface-muted)] rounded-2xl p-4 border border-[var(--mos-border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Complete Eligibility Criteria</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--mos-text-secondary)] leading-relaxed">
              {scholarship.eligibility}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-medium text-[var(--mos-text-secondary)]">
              <span className="px-2.5 py-1 rounded-lg bg-[var(--mos-surface)] border border-[var(--mos-border)]">
                👥 <strong>Gender:</strong> {genderTag}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--mos-surface)] border border-[var(--mos-border)]">
                🇮🇳 <strong>Nationality:</strong> Indian Citizen
              </span>
            </div>
          </div>

          {/* Mandatory Documents Checklist */}
          <div className="bg-[var(--mos-surface-muted)] rounded-2xl p-4 border border-[var(--mos-border)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Mandatory Documents Required to Apply</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[var(--mos-text-secondary)]">
              {mandatoryDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deadline & Safety Advisory Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[var(--mos-text-secondary)] text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Application Deadline:</strong> <span className="text-amber-600 dark:text-amber-300 font-semibold">{scholarship.deadline}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Free Government / Corporate CSR Application</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--mos-border)] bg-[var(--mos-surface)] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Share WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--mos-text-muted)]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <a
            id="apply-official-portal-btn"
            href={scholarship.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Apply on Official Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailsModal;
