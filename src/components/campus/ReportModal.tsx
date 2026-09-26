import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X, AlertTriangle, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { submitCommunityReport } from '../../services/firebase';

export interface ReportTarget {
  type: 'post' | 'reply';
  id: string;
  postId: string;
  authorUid?: string;
  authorName?: string;
  titleSnippet?: string;
}

interface ReportModalProps {
  target: ReportTarget | null;
  onClose: () => void;
  onSuccess: (target: ReportTarget, isHidden: boolean, userBanned: boolean) => void;
}

const REPORT_REASONS = [
  { id: 'adult', label: 'Inappropriate or 18+ Adult Content', desc: 'Contains explicit, offensive, or NSFW material.' },
  { id: 'spam', label: 'Spam, Scam, or Self-Promotion', desc: 'Commercial ads, irrelevant links, or duplicate automated content.' },
  { id: 'academic', label: 'Misleading Academic Information', desc: 'Incorrect formulas, fake exam schedules, or fraudulent solutions.' },
  { id: 'harassment', label: 'Harassment, Hate Speech, or Bullying', desc: 'Targeted hostility or discriminatory behavior toward peers.' },
  { id: 'other', label: 'Other Guideline Violation', desc: 'Violates student community rules or academic integrity.' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ target, onClose, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].label);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await submitCommunityReport({
        targetType: target.type,
        targetId: target.id,
        postId: target.postId,
        authorUid: target.authorUid,
        reason: selectedReason,
        details: additionalDetails.trim(),
      });

      setIsDone(true);
      setTimeout(() => {
        onSuccess(target, result.isHidden, result.userBanned);
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error('[CampusConnect] Report submission error:', err);
      setErrorMsg(err?.message || 'Failed to submit report. Please check your internet connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md bg-white border border-pink-200 rounded-3xl p-5 text-slate-900 shadow-2xl shadow-pink-200/50 overflow-hidden"
        >
          {isDone ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Report Submitted</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you for keeping MAN OF STUDY safe. If this content receives 3 reports, it will be automatically hidden from all feeds.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Flag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Report {target.type === 'post' ? 'Question' : 'Solution'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Author: <span className="font-semibold text-slate-700">{target.authorName || 'Peer'}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Safety notice banner */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Community reports are processed automatically. Content with 3+ reports is auto-hidden; repeat offenders (5+ reports) are suspended.
                </p>
              </div>

              {/* Reasons */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Select Violation Reason *
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {REPORT_REASONS.map((r) => {
                    const isSelected = selectedReason === r.label;
                    return (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200 text-slate-900'
                            : 'bg-white border-pink-100 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="report-reason"
                          checked={isSelected}
                          onChange={() => setSelectedReason(r.label)}
                          className="w-3.5 h-3.5 mt-0.5 accent-rose-600 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold block text-[11px]">{r.label}</span>
                          <span className="text-[10px] text-slate-500 block leading-tight">{r.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Optional details */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Provide context or timestamp to help review..."
                  className="w-full text-xs p-2.5 rounded-xl border border-pink-200 focus:border-rose-500 bg-pink-50/30 focus:bg-white resize-none focus:outline-hidden"
                />
              </div>

              {errorMsg && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-pink-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm shadow-rose-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
