import React from 'react';
import { AlertCircle, ShieldAlert, BookOpen, ExternalLink, ArrowLeft, Mail } from 'lucide-react';

export interface DisclaimerProps {
  onBack?: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onBack }) => {
  const supportEmail = 'support.jamord@gmail.com';

  return (
    <div id="disclaimer-view" className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-200">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </button>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Statutory Safe Harbor &amp; Disclosures</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Academic, Admissions &amp; Legal Disclaimer
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Please review these statutory notices regarding data sources, independent status, algorithm estimations, and institutional verification before utilizing JAVISAK.
        </p>
      </div>

      {/* Primary Safe Harbor Box */}
      <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-sm text-amber-900 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="uppercase tracking-wider">Independent Educational Platform Notice</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed">
          <strong>JAVISAK is an independent informational and utility engine.</strong> AP EAPCET data, college vacancy counts, branch allotments, cutoffs, and scholarship listings displayed on this website are aggregated from publicly available government notifications, university circulars, and state counselling records for student guidance only. 
          JAVISAK is <strong>NOT affiliated with, authorized by, or associated with APSCHE (Andhra Pradesh State Council of Higher Education), APCFSS, TSCHE, National Scholarship Portal (NSP), JNTUK, JNTUA, Andhra University, or any governmental department</strong>.
        </p>
      </div>

      {/* Detailed Disclosures Sections */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            1. AP EAPCET Vacancy Radar &amp; Seat Allotments
          </h2>
          <p>
            Seat matrices, fee details, leftover category seat counts, and opening/closing ranks reflect public domain data released following state counselling phases. Because seat availability fluctuates dynamically during active sliding rounds and special category verifications, candidates must verify all choices directly on the official state counselling portal (<code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600">eapcet-sche.aptonline.in</code>) prior to submitting final web options. JAVISAK accepts no liability for admissions outcomes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            2. Attendance &amp; Internal Examination Estimations
          </h2>
          <p>
            The Attendance Defender and Internal Exam Cutoff Estimator apply standard mathematical formulas (e.g. 75% statutory criteria, 80:20 mid-term weighted averages). While these formulas align with general university guidelines:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Individual institutions, autonomous academic councils, and departmental heads maintain authority to enforce custom condonation fines, medical proof verifications, or lab attendance policies.</li>
            <li>Calculated bunk buffers and cutoff projections represent theoretical thresholds and must not replace official attendance registers maintained by your college exam branch.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            3. Scholarship Databases &amp; External Portals
          </h2>
          <p>
            Scholarship listings (such as Reliance Foundation, Tata Pankh, AICTE Pragati, and SBI Asha) are aggregated from publicly announced corporate CSR and government notices. Application deadlines, income thresholds, eligible categories, and grant disbursement schedules are governed solely by the respective granting foundations. JAVISAK never collects application fees, never processes grant payouts, and cannot guarantee scholarship selection.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            4. Client-Side Document Tools
          </h2>
          <p>
            The 30+ PDF Power Tools, 20KB Photo Resizer, and ATS Resume Analyzer operate 100% in your device's browser memory using WebAssembly. Users are responsible for verifying that converted document file formats, DPI resolutions, and file sizes comply with specific examination guidelines (such as UPSC, SSC, GATE, or university portal specifications) before submitting official examination registration forms.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>5. Institutional Data Corrections</span>
          </h2>
          <p>
            If you represent a university or engineering institution and notice an outdated tuition fee or updated seat distribution in our matrices, please email our verification team for prompt review and dataset synchronization:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{supportEmail}</span>
            <a
              href={`mailto:${supportEmail}?subject=Institutional%20Data%20Correction`}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold transition-colors"
            >
              Submit Notice
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Disclaimer;
