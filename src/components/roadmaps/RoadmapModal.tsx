import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  Share2,
  Check,
  Compass,
  Calendar,
  Layers,
  Briefcase,
  TrendingUp,
  Award,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Cpu,
  Shield,
  Building2,
  Wrench,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { BranchRoadmap } from '../../types';
import { ShareRoadmapDialog } from './ShareRoadmapDialog';

export interface RoadmapModalProps {
  branch: BranchRoadmap;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: (branch: BranchRoadmap) => void;
  isExportingPdf: boolean;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  branch,
  isOpen,
  onClose,
  onDownloadPdf,
  isExportingPdf,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);

  // Safe modal close handler with residual dimmer DOM cleanup
  const handleModalClose = useCallback(() => {
    setShowShareDialog(false);
    document.body.style.overflow = '';
    onClose();

    // DOM cleanup safeguard to prevent any orphaned dimmer loops
    setTimeout(() => {
      const strayDimmers = document.querySelectorAll('#roadmap-modal-dimmer, #share-dialog-dimmer');
      strayDimmers.forEach((el) => {
        if (el.parentNode && el.parentNode.childNodes.length === 1) {
          el.parentNode.removeChild(el);
        }
      });
    }, 50);
  }, [onClose]);

  // Global keydown listener for immediate Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (showShareDialog) {
          setShowShareDialog(false);
        } else {
          handleModalClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = '';
    };
  }, [isOpen, showShareDialog, handleModalClose]);

  if (!isOpen) return null;

  const currentYearData = branch.years.find((y) => y.yearNumber === selectedYear) || branch.years[0];
  const tr = branch.strategicOverview.tierReality;
  const techStack = branch.strategicOverview.standardTechStack;
  const higherStudies = branch.strategicOverview.higherStudiesGate;

  const handleOpenShare = () => {
    setShowShareDialog(true);
  };

  return (
    <div
      id="roadmap-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
    >
      {/* 1. Strict Background Dimmer Overlay with direct Click & TouchEnd listeners */}
      <div
        id="roadmap-modal-dimmer"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer z-0 transition-opacity animate-in fade-in duration-200"
        onClick={handleModalClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleModalClose();
        }}
        aria-label="Close roadmap modal backdrop"
      />

      {/* 2. Modal Content Container */}
      <div
        id="roadmap-modal-container"
        className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-branch-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Executive Header */}
        <div className="shrink-0 bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {branch.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/10 text-slate-300">
                {branch.categoryLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {branch.badge}
              </span>
            </div>

            <h2
              id="modal-branch-title"
              className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight"
            >
              {branch.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
              {branch.tagline}
            </p>
          </div>

          {/* Action Buttons & Close */}
          <div className="shrink-0 flex items-center gap-2.5 self-start md:self-center">
            <button
              id="modal-download-pdf-btn"
              onClick={() => onDownloadPdf(branch)}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download Full PDF'}</span>
            </button>

            <button
              id="modal-share-btn"
              onClick={handleOpenShare}
              title="Share this Roadmap"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-slate-200 hover:text-white transition-colors border border-white/10 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Share this Roadmap"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              id="modal-close-btn"
              onClick={handleModalClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleModalClose();
              }}
              title="Close modal (Esc)"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600 active:scale-98 text-slate-200 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 divide-y divide-slate-100">
          {/* SECTION 1: Industry Compensation & Corporate Matrix */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Compensation Trajectory &amp; Employment Viability</span>
            </div>

            {/* Salary Bracket Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Entry Tier (0–2 Years)
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {branch.strategicOverview.salaryBrackets.entryTier}
                </div>
                <p className="text-[11px] text-slate-500">
                  Campus day-1 offers &amp; junior analyst roles.
                </p>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  Mid Career (3–6 Years)
                </div>
                <div className="text-base sm:text-lg font-black text-indigo-950 font-mono">
                  {branch.strategicOverview.salaryBrackets.midTier}
                </div>
                <p className="text-[11px] text-indigo-800/80">
                  Senior engineer, domain lead, or systems designer.
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Peak / Product Tier
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-950 font-mono">
                  {branch.strategicOverview.salaryBrackets.peakTier}
                </div>
                <p className="text-[11px] text-emerald-800">
                  Staff architects, specialist leads, MNC R&amp;D.
                </p>
              </div>
            </div>

            {/* Corporate & PSU Viability Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Corporate &amp; Product Hiring
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700">
                    {branch.strategicOverview.corporateViability}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {branch.strategicOverview.corporateSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Government &amp; PSU Recruitment
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">
                    {branch.strategicOverview.govtPsuViability}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {branch.strategicOverview.govtPsuSummary}
                </p>
              </div>
            </div>

            {/* Target Job Roles */}
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100/80 space-y-2">
              <div className="text-xs font-bold text-indigo-900">
                Primary Target Industry Roles:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {branch.strategicOverview.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-indigo-200 text-indigo-950 shadow-2xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: Ground Reality: Tier-1 vs Tier-3 & Off-Campus Blueprint */}
          {tr && (
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Industry &amp; Campus Recruitment Reality (Tier-1 vs. Tier-3)</span>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tier 1 Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-emerald-700 text-white tracking-wider">
                      Tier-1 (IIT / NIT / BITS)
                    </span>
                    <span className="text-xs font-black text-emerald-900 font-mono">
                      {tr.tier1Salary}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                    {tr.tier1Reality}
                  </p>
                </div>

                {/* Tier 3 Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border-2 border-rose-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-rose-700 text-white tracking-wider">
                      Tier-3 (State Affiliated / Local)
                    </span>
                    <span className="text-xs font-black text-rose-900 font-mono">
                      {tr.tier3Salary}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-950 font-medium leading-relaxed">
                    {tr.tier3Reality}
                  </p>
                </div>
              </div>

              {/* Off-Campus Actionable Tactics */}
              {tr.offCampusTactics && tr.offCampusTactics.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                      Harsh Truth &amp; 4-Point Off-Campus Survival Strategy for Tier-3 Engineers:
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {tr.offCampusTactics.map((tactic, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 leading-relaxed"
                      >
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[11px] flex items-center justify-center border border-indigo-400/30">
                          {idx + 1}
                        </span>
                        <span>{tactic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: Standard Tech Stack & Higher Studies / GATE Gateway */}
          {(techStack || higherStudies) && (
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Industry Standard Tech Stack &amp; Higher Studies Guide</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tech Stack Card */}
                {techStack && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-600" />
                      <span>Industry Standard Tooling Stack:</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {techStack.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Higher Studies Card */}
                {higherStudies && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>GATE &amp; Higher Studies Gateway</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800">
                        {higherStudies.exam}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">Top Institutes: </span>
                        <span>{higherStudies.topInstitutes.join(', ')}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">M.Tech Specializations: </span>
                        <span>{higherStudies.mtechSpecializations.join(', ')}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">MS Abroad Scope: </span>
                        <span>{higherStudies.msAbroadScope}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: 4-Year Semester-by-Semester Matrix */}
          <div className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>4-Year Semester-by-Semester Curriculum &amp; Milestones</span>
              </div>

              {/* Year Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {[1, 2, 3, 4].map((yearNum) => (
                  <button
                    key={yearNum}
                    type="button"
                    onClick={() => setSelectedYear(yearNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedYear === yearNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Year {yearNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Theme Card */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950">
                  {currentYearData.yearTitle}
                </h4>
                <p className="text-xs text-indigo-800/80 mt-0.5">
                  {currentYearData.theme}
                </p>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                Year {selectedYear} of 4
              </span>
            </div>

            {/* Semester Cards for Current Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentYearData.semesters.map((sem) => (
                <div
                  key={sem.semNumber}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-slate-900 text-white">
                      Sem {sem.semNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800 text-right truncate max-w-[240px]">
                      {sem.title.split(':')[1]?.trim() || sem.title}
                    </span>
                  </div>

                  {/* Core Subjects */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Core Subjects
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sem.coreSubjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Industry Skills */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                      Industry Skills
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {sem.industrySkills.join(' • ')}
                    </p>
                  </div>

                  {/* Tools & Platforms */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Tools &amp; Software
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sem.toolsAndPlatforms.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Benchmark Project */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Key Portfolio Project
                    </span>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {sem.keyProjects.join('; ')}
                    </p>
                  </div>

                  {/* Internship & Exam Prep */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="text-slate-600">
                      <span className="font-bold text-slate-800">Milestone: </span>
                      <span>{sem.internshipOrMilestone}</span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-bold text-slate-800">Placement Prep: </span>
                      <span>{sem.examOrPlacementPrep}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Strategic Career Advice & Pro Tips */}
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>StudyMacha Strategic Placement Tips for {branch.code}</span>
            </div>

            <div className="space-y-2.5">
              {branch.proTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700">Official StudyMacha Blueprint</span>
            <span>•</span>
            <span>Zero server calls • 100% Client-side export</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleModalClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleModalClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer min-h-[40px]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onDownloadPdf(branch)}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60 min-h-[40px]"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Roadmap'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Share this Roadmap Dialog */}
      {showShareDialog && (
        <ShareRoadmapDialog
          branch={branch}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};
