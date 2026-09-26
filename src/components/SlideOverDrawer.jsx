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
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-md border border-slate-700/60 bg-slate-900 flex items-center justify-center p-0.5 shrink-0">
                <img 
                  src="https://i.ibb.co/zHPk2tv4/Chat-GPT-Image-Sep-13-2026-08-04-48-PM.png" 
                  alt="MAN OF STUDY Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white uppercase font-mono group-hover:text-emerald-400 transition-colors">
                  MAN OF STUDY <span className="text-emerald-400">Hubs</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  Engineering &amp; Academic Launchpad
                </p>
              </div>
            </a>

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
                id="drawer-counseling-tg-predictor-btn"
                onClick={() => handleNavigate('tg-predictor')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800 bg-emerald-950/20"
              >
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>TG EAPCET College Predictor</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">2026 Live</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Admission probability &amp; web options buffer across 151 colleges
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-counseling-tg-allotments-btn"
                onClick={() => handleNavigate('tg-allotments')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                      <span>TG EAPCET 2026 Final Allotments</span>
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Official candidate allotments, cutoff ranks &amp; admission stats
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
                      <span>MOS Student Knowledge HUB</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">9 Chapters</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      OC quota math, reservation dynamics, Phase-2 &amp; college laws
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-campus-connect-btn"
                onClick={() => handleNavigate('campus-connect')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800 bg-emerald-950/20"
              >
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>MOS CampusConnect</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Real campus updates, senior guidance, and peer doubt resolution across colleges
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
                id="drawer-academics-backlog-btn"
                onClick={() => handleNavigate('backlog')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800 bg-rose-950/20"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                      <span>Smart Backlog Recovery Planner</span>
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Pass cutoff calculator &amp; 30-day revision blueprint
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

          {/* CATEGORY 3: CAREER & SKILLS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Career &amp; Skills</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-career-gap-analyzer-btn"
                onClick={() => handleNavigate('gap-analyzer')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/30"
              >
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>AI Student Gap Analyzer</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">AI Tool</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Where am I right now, what am I missing &amp; what should I do next?
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-vault-btn"
                onClick={() => handleNavigate('vault')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800 bg-emerald-950/20"
              >
                <div className="flex items-start gap-2.5">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>Placement Viva &amp; Code Vault</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">NEW</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Viva flashcards &amp; ready Python, C, C++ lab snippets
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                id="drawer-career-dsa-btn"
                onClick={() => handleNavigate('dsa')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Code2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                      <span>DSA &amp; Placement Tracker</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">450 Sheet</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Curated coding interview problem progress tracker
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
              </button>

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

          {/* CATEGORY 4: OFFLINE UTILITIES & TOOLS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Offline Utilities</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="drawer-tools-pdf-btn"
                onClick={() => handleNavigate('utilities', 'pdf-tools')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                      <span>free pdf tools for students</span>
                      <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">30+ Tools</span>
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
              MAN OF STUDY (MOS) Launchpad
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
