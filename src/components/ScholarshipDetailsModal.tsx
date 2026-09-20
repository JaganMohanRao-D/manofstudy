import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  IndianRupee,
  Calendar,
  Building2,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Users,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { IndianScholarship } from './ScholarshipsHub';

interface ScholarshipDetailsModalProps {
  scholarship: IndianScholarship | null;
  onClose: () => void;
}

export const ScholarshipDetailsModal: React.FC<ScholarshipDetailsModalProps> = ({
  scholarship,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Lock body scroll & listen for Escape key
  useEffect(() => {
    if (!scholarship) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scholarship, onClose]);

  if (!scholarship) return null;

  const isExclusiveGirls = (() => {
    const exclusiveGirlIds = [
      'aicte-pragati-scholarship-2026',
      'kotak-kanya-scholarship-2026',
      'amazon-future-engineer-2026',
      'loreal-for-young-women-2026',
      'begum-hazrat-mahal-2026',
      'dr-reddy-sashakt-scholarship-2026',
      'adobe-women-in-tech-2026',
    ];
    if (exclusiveGirlIds.includes(scholarship.id)) return true;
    const text = (scholarship.title + ' ' + scholarship.target).toLowerCase();
    return (
      text.includes('for girls') ||
      text.includes('kanya') ||
      text.includes('female engineering')
    );
  })();

  const genderTag = isExclusiveGirls
    ? 'Female / Girl Students Only'
    : 'All Genders (Boys & Girls)';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scholarship.apply_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🎓 *${scholarship.title}*\n🏛️ *Provider:* ${scholarship.provider}\n💰 *Benefit:* ${scholarship.amount}\n🎯 *Target:* ${scholarship.target}\n📋 *Eligibility:* ${scholarship.eligibility}\n📅 *Deadline:* ${scholarship.deadline}\n\n🔗 *Direct Apply Official Link:*\n${scholarship.apply_link}\n\n✨ Verified on MAN OF STUDY Scholarships Hub`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const mandatoryDocuments = [
    'Aadhaar Card (Applicant & Parent / Guardian)',
    'Current Year Family Income Certificate (Issued by Tahsildar / MeeSeva / competent authority)',
    'Previous Qualifying Examination Marks Memo / Transcript (Class 10 / 12 / Degree Semester)',
    'Current Admission Proof (College ID Card, Admission Allotment Order, or College Fee Receipt)',
    'Student Bank Passbook or Cancelled Cheque (Active account linked to Aadhaar for DBT transfer)',
    'Recent Passport Size Photograph of the Applicant',
    'Category / Caste Certificate (SC/ST/OBC/EWS) or PwBD Certificate (if applicable)',
  ];

  return (
    <div
      id="scholarship-details-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scholarship-modal-title"
    >
      <div
        id="scholarship-details-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                <Building2 className="w-3 h-3 text-emerald-400" />
                {scholarship.provider}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {scholarship.category}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                  isExclusiveGirls
                    ? 'bg-pink-950/40 text-pink-300 border-pink-800/60'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                }`}
              >
                {genderTag}
              </span>
            </div>

            <h2
              id="scholarship-modal-title"
              className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug"
            >
              {scholarship.title}
            </h2>
          </div>

          <button
            id="close-scholarship-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer border border-slate-700"
            aria-label="Close scholarship details modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Highlighted Grant / Reward Pill */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Scholarship Reward / Financial Grant
                </span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  {scholarship.amount}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Bank DBT Transfer</span>
            </div>
          </div>

          {/* Target Audience & Eligible Courses */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Target Candidates &amp; Eligible Courses</span>
            </div>
            <p className="font-semibold text-white text-sm">
              {scholarship.target}
            </p>
          </div>

          {/* Complete Eligibility Criteria */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Complete Eligibility Criteria</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {scholarship.eligibility}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-medium text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                👥 <strong>Gender:</strong> {genderTag}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                🇮🇳 <strong>Nationality:</strong> Indian Citizen
              </span>
            </div>
          </div>

          {/* Mandatory Documents Checklist */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Mandatory Documents Required to Apply</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {mandatoryDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deadline & Safety Advisory Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Application Deadline:</strong> <span className="text-amber-300 font-semibold">{scholarship.deadline}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free Government / Corporate CSR Application</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
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
