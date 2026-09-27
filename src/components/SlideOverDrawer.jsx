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
  FileText,
  ShoppingBag,
  Mail,
  Heart,
  Compass,
  GraduationCap,
  Code2,
  Terminal,
  ShieldAlert,
  Users,
} from 'lucide-react';

/**
 * SlideOverDrawer Component
 * 
 * Top-right hamburger slide-over drawer mounted into document.body using
 * a React Portal to ensure proper stacking context and avoid z-index trapping.
 * 
 * Fully responsive and theme-aware in both Light Mode and Dark Mode.
 * Categorized into 4 core hubs:
 * 1. Counseling
 * 2. Academics
 * 3. Career & Skills
 * 4. Offline Utilities
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
        className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 z-[9999] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
      >
        <div className="p-6 space-y-6">
          {/* Header with Title and Prominent Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <a
              href="https://manofstudy.com"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleNavigate('hub');
                }
              }}
              className="flex items-center gap-2.5 no-underline cursor-pointer group"
              title="MAN OF STUDY"
            >
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-0.5 shrink-0">
                <img 
                  src="https://i.ibb.co/zHPk2tv4/Chat-GPT-Image-Sep-13-2026-08-04-48-PM.png" 
                  alt="MAN OF STUDY Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  MAN OF STUDY <span className="text-emerald-600 dark:text-emerald-400">Hubs</span>
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Engineering &amp; Academic Launchpad
                </p>
              </div>
            </a>

            <button
              type="button"
              id="slideover-drawer-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-slate-700 active:scale-95 shadow-xs"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
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
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 text-slate-900 placeholder:text-slate-400 border border-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs transition-colors cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Search tools, guides &amp; roadmaps...</span>
            </div>
            <kbd className="text-[9px] font-mono bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* CATEGORY 1: COUNSELING */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Counseling</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-counseling-eapcet-btn"
                onClick={() => handleNavigate('eapcet')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>EAPCET Phase-2 Seat Radar</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">LIVE</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      College branch cutoffs, vacant seat matrix &amp; fee tier checker
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-counseling-ap-allotments-btn"
                onClick={() => handleNavigate('ap-allotments')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 dark:border-emerald-800/40 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>AP Allotments (Namewise)</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">Namewise</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Explore AP EAPCET allotments by student name, rank, college, branch and phase.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-counseling-ap-predictor-btn"
                onClick={() => handleNavigate('ap-predictor')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                      <span>AP College Predictor 2026</span>
                      <span className="text-[9px] bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">2026</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Deterministic admission estimates calculated from official 2026 AP EAPCET records
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-counseling-tg-predictor-btn"
                onClick={() => handleNavigate('tg-predictor')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 dark:border-emerald-800/40 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>TG EAPCET College Predictor</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">2026 Live</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Admission probability &amp; web options buffer across 151 colleges
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-counseling-tg-allotments-btn"
                onClick={() => handleNavigate('tg-allotments')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                      <span>TG EAPCET 2026 Final Allotments</span>
                      <span className="text-[9px] bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Official candidate allotments, cutoff ranks &amp; admission stats
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-counseling-guides-btn"
                onClick={() => handleNavigate('guides')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                      <span>MOS Student Knowledge HUB</span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">9 Chapters</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      OC quota math, reservation dynamics, Phase-2 &amp; college laws
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-campus-connect-btn"
                onClick={() => handleNavigate('campus-connect')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 dark:border-emerald-800/40 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>MOS CampusConnect</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Real campus updates, senior guidance, and peer doubt resolution across colleges
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* CATEGORY 2: ACADEMICS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Academics</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-academics-attendance-btn"
                onClick={() => handleNavigate('attendance')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>Attendance Defender (75% Rule)</span>
                      <span className="text-[9px] bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">JNTU</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Bunk margin &amp; condonation calculator for exam eligibility
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-academics-gpa-btn"
                onClick={() => handleNavigate('gpa')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                      GPA &amp; Internal Cutoff Hub
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      VTU, JNTU, AU, AICTE GPA-to-% &amp; mid-exam target estimators
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-academics-backlog-btn"
                onClick={() => handleNavigate('backlog')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/70 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 dark:border-rose-800/40 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                      <span>Smart Backlog Recovery Planner</span>
                      <span className="text-[9px] bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Pass cutoff calculator &amp; 30-day revision blueprint
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-academics-roadmaps-btn"
                onClick={() => handleNavigate('roadmaps', 'engineering')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                      <span>4-Year Engineering Roadmaps</span>
                      <span className="text-[9px] bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">24 Streams</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      CSE, AI/ML, ECE, EEE, Mech, Civil, Biotech &amp; EV semester syllabi
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-academics-bipc-btn"
                onClick={() => handleNavigate('roadmaps', 'bipc')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Pill className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                      BiPC &amp; Healthcare Streams
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Pharm.D, Nursing, Clinical Research, Biotech, Agri career paths
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* CATEGORY 3: CAREER & SKILLS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Career &amp; Skills</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-career-gap-analyzer-btn"
                onClick={() => handleNavigate('gap-analyzer')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-300/60 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:border-emerald-500/40 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>AI Student Gap Analyzer</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">AI Tool</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Where am I right now, what am I missing &amp; what should I do next?
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-vault-btn"
                onClick={() => handleNavigate('vault')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>Placement Viva &amp; Code Vault</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Viva flashcards &amp; ready Python, C, C++ lab snippets
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-dsa-btn"
                onClick={() => handleNavigate('dsa')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                      <span>DSA &amp; Placement Tracker</span>
                      <span className="text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">450 Sheet</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Curated coding interview problem progress tracker
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-projects-btn"
                onClick={() => handleNavigate('projects')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>Placement Major Projects Hub</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">15+ Models</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Distributed URL shortener, Blockchain, Mini OS, ER triage
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-internships-btn"
                onClick={() => handleNavigate('internships')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>Verified Student Internships Radar</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">Vetted</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      100% non-scam: AICTE, Google Summer of Code, DRDO, LFX
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-scholarships-btn"
                onClick={() => handleNavigate('scholarships')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-colors">
                      Verified Scholarships Hub
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      National &amp; state financial aid alerts with deadline tracker
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* CATEGORY 4: OFFLINE UTILITIES & TOOLS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Offline Utilities</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-tools-pdf-btn"
                onClick={() => handleNavigate('utilities', 'pdf-tools')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                      <span>free pdf tools for students</span>
                      <span className="text-[9px] bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">30+ Tools</span>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Merge, Split, Watermark, Compress &amp; Exam Photo Resizer
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-tools-essentials-btn"
                onClick={() => handleNavigate('essentials')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:border-slate-800 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                      Student Essentials Store
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                      Calculators, lab coats, drawing kits &amp; exam stationery deals
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info & Support Desk */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center justify-between text-xs">
            {onOpenSupport && (
              <button
                type="button"
                id="drawer-support-desk-btn"
                onClick={() => {
                  onClose();
                  onOpenSupport();
                }}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
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
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Feedback &amp; Legal</span>
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-2xs">
            <p className="font-semibold text-slate-800 dark:text-slate-300">
              MAN OF STUDY (MOS) Launchpad
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">
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
