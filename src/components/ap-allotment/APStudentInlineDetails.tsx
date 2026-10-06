import React from 'react';
import { UserRound, GraduationCap, MapPin, WalletCards, Database } from 'lucide-react';
import { AllotmentRecord, AllotmentYear } from '../../services/apEapcetAllotmentService';

interface APStudentInlineDetailsProps {
  student: AllotmentRecord;
  year: AllotmentYear;
}

const Detail = ({ label, value, icon: Icon }: { label: string; value?: React.ReactNode; icon?: React.ElementType }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5 text-cyan-500" />}
        {label}
      </div>
      <div className="mt-1.5 break-words text-sm font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
};

export const APStudentInlineDetails: React.FC<APStudentInlineDetailsProps> = ({ student, year }) => {
  const fee = (value?: number) => value === undefined ? undefined : '₹' + value.toLocaleString('en-IN');
  const hallTicket = student.roll_no || undefined;

  return (
    <div className="mt-3 border-t border-cyan-500/20 pt-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-300">Student allotment details</p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Complete details from AP EAPCET {year} selected dataset</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className="shrink-0 rounded-lg bg-amber-500/10 px-2 py-1 font-mono text-xs font-black text-amber-600 dark:text-amber-300">
            {student.rank && student.rank > 0 ? `#${student.rank.toLocaleString()}` : 'Rank —'}
          </span>
          {hallTicket && (
            <span className="shrink-0 rounded-lg bg-cyan-500/10 px-2 py-1 font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
              HT: {hallTicket}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Detail label="Hall ticket number" value={hallTicket || '—'} icon={Database} />
        <Detail label="Candidate category" value={student.category || '—'} icon={UserRound} />
        <Detail label="Gender" value={student.gender === 'M' ? 'Boys (M)' : student.gender === 'F' ? 'Girls (F)' : student.gender || '—'} icon={UserRound} />
        <Detail label="Region" value={student.region || '—'} icon={MapPin} />
        <Detail label="College" value={student.college_name ? `${student.college_name}${student.college_code ? ` (${student.college_code})` : ''}` : '—'} icon={GraduationCap} />
        <Detail label="Branch" value={student.branch_name ? `${student.branch_name}${student.branch_code ? ` (${student.branch_code})` : ''}` : '—'} icon={GraduationCap} />
        <Detail label="Course type" value={student.course_type} icon={GraduationCap} />
        <Detail label="District" value={student.district} icon={MapPin} />
        <Detail label="Allotted category / quota" value={student.alloted_category || '—'} icon={Database} />
        <Detail label="Phase" value={student.phase && student.phase > 0 ? `Phase ${student.phase}` : 'Phase: NA'} icon={Database} />
        <Detail label="With fee reimbursement" value={fee(student.fee_with_exemption)} icon={WalletCards} />
        <Detail label="Actual tuition fee" value={fee(student.fee_with_no_exemption)} icon={WalletCards} />
        <Detail label="Total seats" value={student.total_seats} icon={Database} />
        <Detail label="Left-over seats" value={student.left_over_seats} icon={Database} />
      </div>

      <p className="mt-2 rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        <strong className="text-cyan-600 dark:text-cyan-300">Source note:</strong> Values shown here come from the selected AP EAPCET {year} allotment record. Missing fields are not invented.
      </p>
    </div>
  );
};

export default APStudentInlineDetails;
