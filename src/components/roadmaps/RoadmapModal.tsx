import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowLeft,
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { BranchRoadmap } from '../../types';
import { ShareRoadmapDialog } from './ShareRoadmapDialog';
import { BranchToolsBanner } from '../BranchToolsBanner';

export interface RoadmapModalProps {
  branch: BranchRoadmap;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: (branch: BranchRoadmap) => void;
  isExportingPdf: boolean;
  pdfExportStatus?: 'idle' | 'generating' | 'success' | 'error';
  pdfErrorMessage?: string | null;
  onNavigateToStore?: (category?: string) => void;
  fullPage?: boolean;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  branch,
  isOpen,
  onClose,
  onDownloadPdf,
  isExportingPdf,
  pdfExportStatus = 'idle',
  pdfErrorMessage,
  onNavigateToStore,
  fullPage = false,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);

  // Reset selected year when changing branch
  useEffect(() => {
    setSelectedYear(1);
  }, [branch.id]);

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
    if (!fullPage) document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (!fullPage) document.body.style.overflow = '';
    };
  }, [isOpen, showShareDialog, handleModalClose, fullPage]);

  if (!isOpen) return null;

  const currentYearData = branch.years.find((y) => y.yearNumber === selectedYear) || branch.years[0];
  const tr = branch.strategicOverview.tierReality;
  const techStack = branch.strategicOverview.standardTechStack;
  const higherStudies = branch.strategicOverview.higherStudiesGate;

  const getTierLabels = () => {
    if (tr?.tier1Label && tr?.tier3Label) {
      return {
        tier1Label: tr.tier1Label,
        tier3Label: tr.tier3Label,
      };
    }
    if (branch.category === 'pharma' || branch.id === 'b-pharmacy' || branch.id === 'pharma-d') {
      return {
        tier1Label: 'PREMIER HUBS (NIPER / ICT / CENTRAL UNIVERSITIES / TOP MNCs)',
        tier3Label: 'REGIONAL AFFILIATED PHARMA COLLEGES (LOCAL QC / PRODUCTION)',
      };
    }
    if (branch.category === 'agri' || branch.id === 'bsc-agri') {
      return {
        tier1Label: 'NATIONAL APEX (ICAR INSTITUTES / STATE AGRI UNIVERSITIES - ANGRAU)',
        tier3Label: 'PRIVATE AFFILIATED AGRI CAMPUSES (LOCAL RETAIL / FIELD MARKETING)',
      };
    }
    if (branch.category === 'nursing' || branch.id === 'bsc-nursing') {
      return {
        tier1Label: 'APEX CLINICAL HUBS (AIIMS / JIPMER / MULTI-SPECIALTY JCI HOSPITALS)',
        tier3Label: 'PRIVATE REGIONAL HOSPITALS / LOCAL NURSING CARE',
      };
    }
    if (branch.stream === 'commerce') {
      return {
        tier1Label: 'PREMIER HUBS (SRCC / TOP IIMs / BIG 4 ADVISORY)',
        tier3Label: 'REGIONAL DEGREE COLLEGES (LOCAL AUDITING / BACK-OFFICE)',
      };
    }
    if (branch.stream === 'humanities') {
      return {
        tier1Label: 'APEX HUBS (DU / JNU / TISS / CIVIL SERVICES ACADEMIES)',
        tier3Label: 'REGIONAL AFFILIATED ARTS COLLEGES',
      };
    }
    return {
      tier1Label: 'TIER-1 (IIT / NIT / IIIT / BITS / TOP DEEMED)',
      tier3Label: 'TIER-3 & REGIONAL AFFILIATED',
    };
  };
  const tierLabels = getTierLabels();

  const handleOpenShare = () => {
    setShowShareDialog(true);
  };

  const roadmapModalContent = (
    <div
      id="roadmap-modal-overlay"
      className={fullPage ? 'relative w-full overflow-visible' : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden'}
    >
      {!fullPage && <div
        id="roadmap-modal-dimmer"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer z-0 transition-opacity animate-in fade-in duration-200"
        onClick={handleModalClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleModalClose();
        }}
        aria-label="Close roadmap modal backdrop"
      />}

      <div
        id="roadmap-modal-container"
        className={fullPage
          ? 'relative z-10 mx-auto w-full max-w-6xl flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-visible'
          : 'relative z-10 w-full max-w-5xl max-h-[92dvh] flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200'}
        role={fullPage ? undefined : 'dialog'}
        aria-modal={fullPage ? undefined : true}
        aria-labelledby="modal-branch-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Executive Header */}
        <div className="shrink-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                {branch.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {branch.categoryLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                {branch.badge}
              </span>
            </div>

            <h2
              id="modal-branch-title"
              className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight"
            >
              {branch.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed line-clamp-2 max-w-3xl">
              {branch.tagline}
            </p>
          </div>

          {/* Action Buttons & Close */}
          <div className="shrink-0 flex items-center gap-2.5 self-start md:self-center">
            <button
              id="modal-download-pdf-btn"
              onClick={() => onDownloadPdf(branch)}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download Full PDF'}</span>
            </button>

            <button
              id="modal-share-btn"
              onClick={handleOpenShare}
              title="Share this Roadmap"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
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
              title={fullPage ? 'Back to all roadmaps' : 'Close modal (Esc)'}
              className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer min-h-[44px] min-w-[44px]"
              aria-label={fullPage ? 'Back to all roadmaps' : 'Close modal'}
            >
              {fullPage ? <><ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline text-xs font-semibold">All roadmaps</span></> : <X className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className={`${fullPage ? 'flex-none overflow-visible' : 'flex-1 overflow-y-auto'} p-5 sm:p-8 space-y-8 divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
          {/* SECTION 1: Industry Compensation & Corporate Matrix */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base tracking-tight">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Compensation Trajectory &amp; Employment Viability</span>
            </div>

            {/* Salary Bracket Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Entry Tier (0–2 Years)
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                  {branch.strategicOverview.salaryBrackets.entryTier}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                  Campus day-1 offers &amp; junior analyst roles.
                </p>
              </div>

              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Mid Career (3–6 Years)
                </div>
                <div className="text-base sm:text-lg font-black text-indigo-950 dark:text-indigo-100 font-mono">
                  {branch.strategicOverview.salaryBrackets.midTier}
                </div>
                <p className="text-[11px] text-indigo-900/80 dark:text-indigo-200/80 font-normal leading-relaxed">
                  Senior specialist, domain lead, or systems designer.
                </p>
              </div>

              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Peak / Product Tier
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-100 font-mono">
                  {branch.strategicOverview.salaryBrackets.peakTier}
                </div>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 font-normal leading-relaxed">
                  Staff architects, specialist leads, MNC R&amp;D.
                </p>
              </div>
            </div>

            {/* Corporate & PSU Viability Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Corporate &amp; Product Hiring
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    {branch.strategicOverview.corporateViability}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                  {branch.strategicOverview.corporateSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Government &amp; PSU Recruitment
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    {branch.strategicOverview.govtPsuViability}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                  {branch.strategicOverview.govtPsuSummary}
                </p>
              </div>
            </div>

            {/* Target Job Roles */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Primary Target Industry Roles:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {branch.strategicOverview.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: Ground Reality: Dynamic Tier Comparison & Off-Campus Blueprint */}
          {tr && (
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base tracking-tight">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Industry &amp; Campus Recruitment Reality (Apex vs. Regional Tiers)</span>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* High Tier Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-black uppercase bg-emerald-700 text-white tracking-wider">
                      {tierLabels.tier1Label}
                    </span>
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 font-mono shrink-0">
                      {tr.tier1Salary}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                    {tr.tier1Reality}
                  </p>
                </div>

                {/* Regional / Entry Tier Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-700/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-black uppercase bg-rose-700 text-white tracking-wider">
                      {tierLabels.tier3Label}
                    </span>
                    <span className="text-xs font-black text-rose-900 dark:text-rose-200 font-mono shrink-0">
                      {tr.tier3Salary}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-100 font-medium leading-relaxed">
                    {tr.tier3Reality}
                  </p>
                </div>
              </div>

              {/* Off-Campus Actionable Tactics */}
              {tr.offCampusTactics && tr.offCampusTactics.length > 0 && (
                <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-slate-900 dark:text-slate-100 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      Harsh Truth &amp; Actionable Off-Campus Survival Strategy:
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {tr.offCampusTactics.map((tactic, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed shadow-2xs"
                      >
                        <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center border border-blue-200 dark:border-blue-800">
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
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base tracking-tight">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Industry Standard Tech Stack &amp; Higher Studies Guide</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tech Stack Card */}
                {techStack && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Industry Standard Tooling Stack:</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {techStack.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Higher Studies Card */}
                {higherStudies && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>GATE &amp; Higher Studies Gateway</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                        {higherStudies.exam}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">Top Institutes: </span>
                        <span>{higherStudies.topInstitutes.join(', ')}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">M.Tech Specializations: </span>
                        <span>{higherStudies.mtechSpecializations.join(', ')}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">MS Abroad Scope: </span>
                        <span>{higherStudies.msAbroadScope}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: Semester-by-Semester Matrix */}
          <div className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base tracking-tight">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{branch.years ? branch.years.length : 4}-Year Semester-by-Semester Curriculum &amp; Milestones</span>
              </div>

              {/* Year Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                {(branch.years || []).map((y) => y.yearNumber).map((yearNum) => (
                  <button
                    key={yearNum}
                    type="button"
                    onClick={() => setSelectedYear(yearNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedYear === yearNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Year {yearNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Theme Card */}
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 dark:text-indigo-100">
                  {currentYearData.yearTitle}
                </h4>
                <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 mt-0.5">
                  {currentYearData.theme}
                </p>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                Year {selectedYear} of {branch.years ? branch.years.length : 4}
              </span>
            </div>

            {/* Semester Cards for Current Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentYearData.semesters.map((sem) => (
                <div
                  key={sem.semNumber}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
                      Sem {sem.semNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 text-right truncate max-w-[240px]">
                      {sem.title.split(':')[1]?.trim() || sem.title}
                    </span>
                  </div>

                  {/* Core Subjects */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Core Subjects
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sem.coreSubjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-600"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Industry Skills */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Industry Skills
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {sem.industrySkills.join(' • ')}
                    </p>
                  </div>

                  {/* Tools & Platforms */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Tools &amp; Software
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sem.toolsAndPlatforms.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/50"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Benchmark Project */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Key Portfolio Project
                    </span>
                    <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                      {sem.keyProjects.join('; ')}
                    </p>
                  </div>

                  {/* Internship & Exam Prep */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Milestone: </span>
                      <span>{sem.internshipOrMilestone}</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Placement Prep: </span>
                      <span>{sem.examOrPlacementPrep}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Strategic Career Advice & Pro Tips */}
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base tracking-tight">
              <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Naa College Strategic Placement Tips for {branch.code}</span>
            </div>

            <div className="space-y-2.5">
              {branch.proTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: In-Context Recommended Tools & Laptops */}
          <div className="pt-2">
            <BranchToolsBanner
              branchName={branch.name}
              branchCode={branch.code}
              onNavigateToStore={onNavigateToStore ? () => {
                handleModalClose();
                onNavigateToStore('Engineering & Laptops');
              } : undefined}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200">Official Naa College Blueprint</span>
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
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer min-h-[40px]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onDownloadPdf(branch)}
              disabled={isExportingPdf || pdfExportStatus === 'generating'}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl active:scale-98 font-bold text-xs shadow-xs transition-all cursor-pointer min-h-[40px] ${
                pdfExportStatus === 'success'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : pdfExportStatus === 'error'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'
              }`}
            >
              {isExportingPdf || pdfExportStatus === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : pdfExportStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                  <span>PDF downloaded successfully.</span>
                </>
              ) : pdfExportStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-100" />
                  <span>{pdfErrorMessage || 'PDF generation failed. Please try again.'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Career Roadmap PDF</span>
                </>
              )}
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

  if (fullPage) return roadmapModalContent;
  return createPortal(roadmapModalContent, document.body);
};
