import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserRound, GraduationCap, MapPin, WalletCards, Database } from 'lucide-react';
import { AllotmentRecord, AllotmentYear } from '../../services/apEapcetAllotmentService';

interface APStudentDetailModalProps {
  student: AllotmentRecord | null;
  year: AllotmentYear;
  onClose: () => void;
}

const Detail = ({ label, value, icon: Icon }: { label: string; value?: React.ReactNode; icon?: React.ElementType }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5 text-cyan-500" />}
        {label}
      </div>
      <div className="mt-1.5 break-words text-sm font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
};

export const APStudentDetailModal: React.FC<APStudentDetailModalProps> = ({ student, year, onClose }) => {
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setPortalTarget(document.getElementById('modal-root'));
  }, []);

  useEffect(() => {
    if (!student) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [student, onClose]);

  if (!student || !portalTarget) return null;
  const fee = (value?: number) => value === undefined ? undefined : '₹' + value.toLocaleString('en-IN');

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button aria-label="Close student details" className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <section role="dialog" aria-modal="true" aria-labelledby="ap-student-detail-title" className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 bg-white dark:bg-slate-900 shadow-2xl mos-scale-in">
        <div className="relative overflow-hidden border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 p-5 sm:p-7">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-300">AP EAPCET {year}</span>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-600 dark:text-amber-300">{student.phase && student.phase > 0 ? `Phase ${student.phase}` : 'Phase: NA'}</span>
              </div>
              <h2 id="ap-student-detail-title" className="mt-3 truncate text-xl sm:text-2xl font-black text-slate-950 dark:text-white">{student.cand_name || 'Unnamed candidate'}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Complete allotment record available in the selected source dataset.</p>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 p-2 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2">
            <span className="rounded-xl bg-amber-500/10 px-3 py-2 font-mono text-sm font-black text-amber-600 dark:text-amber-300">
              {student.rank && student.rank > 0 ? `Rank #${student.rank.toLocaleString()}` : 'Rank: — (N/A)'}
            </span>
            <span className="rounded-xl bg-indigo-500/10 px-3 py-2 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">{student.alloted_category || 'Quota not listed'}</span>
          </div>
        </div>

        <div className="max-h-[calc(92vh-190px)] overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Detail label="Candidate category" value={student.category || '—'} icon={UserRound} />
            <Detail label="Gender" value={student.gender === 'M' ? 'Boys (M)' : student.gender === 'F' ? 'Girls (F)' : student.gender || '—'} icon={UserRound} />
            <Detail label="Region" value={student.region || '—'} icon={MapPin} />
            <Detail label="College" value={student.college_name + ' (' + student.college_code + ')'} icon={GraduationCap} />
            <Detail label="Branch" value={student.branch_name + ' (' + student.branch_code + ')'} icon={GraduationCap} />
            <Detail label="Course type" value={student.course_type} icon={GraduationCap} />
            <Detail label="District" value={student.district} icon={MapPin} />            <Detail label="With fee reimbursement" value={fee(student.fee_with_exemption)} icon={WalletCards} />
            <Detail label="Actual tuition fee" value={fee(student.fee_with_no_exemption)} icon={WalletCards} />
            <Detail label="Total seats" value={student.total_seats} icon={Database} />
            <Detail label="Left-over seats" value={student.left_over_seats} icon={Database} />
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            <strong className="text-cyan-600 dark:text-cyan-300">Source note:</strong> Values above are shown from the selected AP EAPCET {year} allotment record. Missing fields are omitted rather than invented.
          </div>
        </div>
      </section>
    </div>
  );
};

export default APStudentDetailModal;
