import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Flame,
  BookOpen,
  Calculator,
  ShieldCheck,
  ChevronRight,
  Briefcase,
  Star,
  Award,
  Cpu,
  Pill,
  Search,
  Wand2,
  FileText,
  ShoppingBag,
  Mail,
  Heart,
  Compass,
  GraduationCap,
} from 'lucide-react';

/**
 * SlideOverDrawer Component
 * 
 * Top-right hamburger slide-over drawer mounted into document.body using
 * a React Portal to ensure proper stacking context and avoid z-index trapping.
 * 
 * Categorized into 4 core hubs:
 * 1. Counseling
 * 2. Academics
 * 3. Career
 * 4. Tools
 */
export const SlideOverDrawer = ({
  isOpen,
  onClose,
  onSelectWorkspace,
  onOpenSupport,
  onOpenFeedback,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Escape key and disable background scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleNavigate = (workspace, subTab) => {
    if (onSelectWorkspace) {
      onSelectWorkspace(workspace, subTab);
    }
    onClose();
  };

  const drawerContent = (
    <div id="slide-over-portal-root">
      {/* Backdrop Overlay (z-[9998] with smooth backdrop blur) */}
      <div
        id="slideover-backdrop-overlay"
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm z-[9998] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel (z-[9999]) */}
      <aside
        id="slideover-drawer-panel"
        className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full bg-slate-900 dark:bg-slate-950 text-slate-100 border-l border-slate-800 z-[9999] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
      >
        <div className="p-6 space-y-6">
          {/* Header with Title and Prominent Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white uppercase">
                  Study<span className="text-cyan-400">Macha</span> Hubs
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  Telugu Student Academic OS
                </p>
              </div>
            </div>

            <button
              type="button"
              id="slideover-drawer-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 active:scale-95 shadow-sm"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Quick Search Shortcut */}
          <button
            type="button"
            onClick={() => {
              onClose();
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search tools, guides &amp; roadmaps...</span>
            </div>
            <kbd className="text-[9px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* CATEGORY 1: COUNSELING */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Counseling</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-counseling-eapcet-btn"
                onClick={() => handleNavigate('eapcet')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>EAPCET Phase-2 Seat Radar</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">LIVE</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      College branch cutoffs, vacant seat matrix &amp; fee tier checker
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-counseling-guides-btn"
                onClick={() => handleNavigate('guides')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                      <span>8-Chapter Survival Guides</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">RTF/MTF</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      B.Tech 1st Year, Jagananna reimbursement &amp; college laws
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* CATEGORY 2: ACADEMICS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academics</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-academics-attendance-btn"
                onClick={() => handleNavigate('attendance')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>Attendance Defender (75% Rule)</span>
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">JNTU</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Bunk margin &amp; condonation calculator for exam eligibility
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-academics-gpa-btn"
                onClick={() => handleNavigate('gpa')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      GPA &amp; Internal Cutoff Hub
                    </div>
                    <div className="text-[10px] text-slate-400">
                      VTU, JNTU, AU, AICTE GPA-to-% &amp; mid-exam target estimators
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-academics-roadmaps-btn"
                onClick={() => handleNavigate('roadmaps', 'engineering')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                      <span>4-Year Engineering Roadmaps</span>
                      <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded font-mono">24 Streams</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      CSE, AI/ML, ECE, EEE, Mech, Civil, Biotech &amp; EV semester syllabi
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-academics-bipc-btn"
                onClick={() => handleNavigate('roadmaps', 'bipc')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Pill className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      BiPC &amp; Healthcare Streams
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Pharm.D, Nursing, Clinical Research, Biotech, Agri career paths
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* CATEGORY 3: CAREER */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Career</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-career-projects-btn"
                onClick={() => handleNavigate('projects')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>Placement Major Projects Hub</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">15+ Models</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Distributed URL shortener, Blockchain, Mini OS, ER triage
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-internships-btn"
                onClick={() => handleNavigate('internships')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>Verified Student Internships Radar</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Vetted</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      100% non-scam: AICTE, Google Summer of Code, DRDO, LFX
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-scholarships-btn"
                onClick={() => handleNavigate('scholarships')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-yellow-300 transition-colors">
                      Verified Scholarships Hub
                    </div>
                    <div className="text-[10px] text-slate-400">
                      National &amp; state financial aid alerts with deadline tracker
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* CATEGORY 4: TOOLS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-400">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Tools</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-tools-humanizer-btn"
                onClick={() => handleNavigate('humanizer')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800 bg-slate-800/30"
              >
                <div className="flex items-start gap-2.5">
                  <Wand2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                      <span>AI Text Detector &amp; Humanizer</span>
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Scan robotic cliches &amp; rewrite with human cadence (Zero uploads)
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-tools-pdf-btn"
                onClick={() => handleNavigate('utilities', 'pdf-tools')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-red-300 transition-colors flex items-center gap-1.5">
                      <span>Client-Side PDF Suite (20KB Resizer)</span>
                      <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-mono">30+ Tools</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Merge, Split, Watermark, Compress &amp; Exam Photo Resizer
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-tools-essentials-btn"
                onClick={() => handleNavigate('essentials')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Student Essentials Store
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Calculators, lab coats, drawing kits &amp; exam stationery deals
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info & Support Desk */}
        <div className="p-6 border-t border-slate-800 space-y-3 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs">
            {onOpenSupport && (
              <button
                type="button"
                id="drawer-support-desk-btn"
                onClick={() => {
                  onClose();
                  onOpenSupport();
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Support Desk</span>
              </button>
            )}

            {onOpenFeedback && (
              <button
                type="button"
                id="drawer-feedback-btn"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Feedback &amp; Legal</span>
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">
              StudyMacha Telugu Academic OS
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              OF THE STUDENT, BY THE STUDENT, FOR THE STUDENT.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default SlideOverDrawer;
