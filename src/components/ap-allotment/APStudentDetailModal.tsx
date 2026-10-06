import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserRound, GraduationCap, MapPin, WalletCards, Database } from 'lucide-react';
import { AllotmentRecord, AllotmentYear, getCollegeDetails } from '../../services/apEapcetAllotmentService';

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
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [resolvedStudent, setResolvedStudent] = useState<AllotmentRecord | null>(student);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setPortalTarget(document.getElementById('modal-root') || document.body);
  }, []);

  useEffect(() => {
    setResolvedStudent(student);
    if (!student) return;

    let cancelled = false;
    const hasFullRecord = Boolean(
      student.district ||
      student.course_type ||
      student.fee_with_exemption !== undefined ||
      student.total_seats !== undefined
    );

    if (hasFullRecord) return;

    void getCollegeDetails(year, student.college_code)
      .then((college) => {
        if (cancelled || !college) return;
        const hallTicket = student.roll_no || '';
        const match = college.allRecords.find((record) => {
          if (hallTicket && record.roll_no && record.roll_no === hallTicket) return true;
          return (
            record.rank === student.rank &&
            record.branch_code === student.branch_code &&
            record.cand_name === student.cand_name
          );
        });
        if (match) setResolvedStudent(match);
      })
      .catch((error) => {
        console.warn('AP student detail hydration failed:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [student, year]);

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

  const displayStudent = resolvedStudent || student;
  if (!displayStudent || !portalTarget) return null;

  const fee = (value?: number) => value === undefined ? undefined : '₹' + value.toLocaleString('en-IN');
  const hallTicket = displayStudent.roll_no || undefined;

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
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-600 dark:text-amber-300">{displayStudent.phase && displayStudent.phase > 0 ? `Phase ${displayStudent.phase}` : 'Phase: NA'}</span>
              </div>
              <h2 id="ap-student-detail-title" className="mt-3 truncate text-xl sm:text-2xl font-black text-slate-950 dark:text-white">{displayStudent.cand_name || 'Unnamed candidate'}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Complete allotment record available in the selected source dataset.</p>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 p-2 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2">
            <span className="rounded-xl bg-amber-500/10 px-3 py-2 font-mono text-sm font-black text-amber-600 dark:text-amber-300">
              {displayStudent.rank && displayStudent.rank > 0 ? `Rank #${displayStudent.rank.toLocaleString()}` : 'Rank: — (N/A)'}
            </span>
            <span className="rounded-xl bg-indigo-500/10 px-3 py-2 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">{displayStudent.alloted_category || 'Quota not listed'}</span>
            {hallTicket && (
              <span className="rounded-xl bg-cyan-500/10 px-3 py-2 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">HT: {hallTicket}</span>
            )}
          </div>
        </div>

        <div className="max-h-[calc(92vh-190px)] overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Detail label="Hall ticket number" value={hallTicket || '—'} icon={Database} />
            <Detail label="Candidate category" value={displayStudent.category || '—'} icon={UserRound} />
            <Detail label="Gender" value={displayStudent.gender === 'M' ? 'Boys (M)' : displayStudent.gender === 'F' ? 'Girls (F)' : displayStudent.gender || '—'} icon={UserRound} />
            <Detail label="Region" value={displayStudent.region || '—'} icon={MapPin} />
            <Detail label="College" value={displayStudent.college_name ? `${displayStudent.college_name} (${displayStudent.college_code})` : displayStudent.college_code} icon={GraduationCap} />
            <Detail label="Branch" value={displayStudent.branch_name ? `${displayStudent.branch_name} (${displayStudent.branch_code})` : displayStudent.branch_code} icon={GraduationCap} />
            <Detail label="Course type" value={displayStudent.course_type} icon={GraduationCap} />
            <Detail label="District" value={displayStudent.district} icon={MapPin} />
            <Detail label="With fee reimbursement" value={fee(displayStudent.fee_with_exemption)} icon={WalletCards} />
            <Detail label="Actual tuition fee" value={fee(displayStudent.fee_with_no_exemption)} icon={WalletCards} />
            <Detail label="Total seats" value={displayStudent.total_seats} icon={Database} />
            <Detail label="Left-over seats" value={displayStudent.left_over_seats} icon={Database} />
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            <strong className="text-cyan-600 dark:text-cyan-300">Source note:</strong> Values above are shown from the selected AP EAPCET {year} allotment record. Missing fields are omitted rather than invented.
          </div>
        </div>
      </section>
    </div>,
    portalTarget,
  );
};

export default APStudentDetailModal;
