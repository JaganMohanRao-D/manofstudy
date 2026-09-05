import React, { useEffect } from 'react';
import {
  X,
  Compass,
  GraduationCap,
  FileText,
  Code2,
  Sparkles,
  Flame,
  BookOpen,
  Calculator,
  ShieldCheck,
  Building2,
  ExternalLink,
  Heart,
  Mail,
  ChevronRight,
  Briefcase,
  Star,
  Award,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Terminal,
  Cpu,
  Pill,
  Coins,
  Search,
} from 'lucide-react';
import { WorkspaceView } from '../types';

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (ws: WorkspaceView, subTab?: string) => void;
  onOpenSupport?: () => void;
  onOpenFeedback?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectWorkspace,
  onOpenSupport,
  onOpenFeedback,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (ws: WorkspaceView, subTab?: string) => {
    onSelectWorkspace(ws, subTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" id="hamburger-slideover-drawer">
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative z-10 w-full sm:w-96 bg-slate-950/95 text-white border-l border-slate-800 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 flex flex-col justify-between overflow-y-auto h-full"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Mega Drawer"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white uppercase">
                  Study<span className="text-cyan-400">Macha</span> Menu
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  Student Operating System • All Hubs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
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
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search tools, roadmaps &amp; guides...</span>
            </div>
            <kbd className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* 1. 🎯 Counseling & Admissions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <span>🎯 Counseling &amp; Admissions</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavigate('eapcet')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      AP EAPCET Phase-2 Seat Radar
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Live vacant seat matrix &amp; fee filter
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  Live
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('guides')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      8-Chapter Student Survival Guides
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Autonomous vs Deemed, RTF/MTF, tier-3 playbooks
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                  8 Ch
                </span>
              </button>
            </div>
          </div>

          {/* 2. 📊 Academic Survival Tools */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-400">
              <span>📊 Academic Survival Tools</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavigate('academics', 'attendance')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Attendance Defender &amp; Bunk Planner
                    </div>
                    <div className="text-[10px] text-slate-400">
                      75% / 85% rule bunk &amp; recovery optimizer
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('academics', 'gpa')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Calculator className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      GPA &amp; Internal Marks Cutoff Calculator
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Mid-exam to semester target predictor
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </button>
            </div>
          </div>

          {/* 3. 🚀 Career & Skills Blueprints */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              <span>🚀 Career &amp; Skills Blueprints</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavigate('roadmaps')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      24+ Engineering &amp; Tech Roadmaps
                    </div>
                    <div className="text-[10px] text-slate-400">
                      CSE, AI/ML, ECE, Mech, Civil, Biotech
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  24 Streams
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('roadmaps')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Pill className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      Healthcare &amp; BiPC Sciences Hub
                    </div>
                    <div className="text-[10px] text-slate-400">
                      B.Pharm, Pharma.D, Agri, Nursing
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('roadmaps')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Coins className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Degree &amp; Commerce Roadmaps
                    </div>
                    <div className="text-[10px] text-slate-400">
                      B.Sc CS/Data, B.Com Fintech, B.A.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </button>
            </div>
          </div>

          {/* 4. 💡 BRAND NEW VALUABLE STUDENT HUBS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Brand New Student Hubs</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavigate('projects')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 text-left transition-colors cursor-pointer group border border-purple-500/30"
              >
                <div className="flex items-start gap-2.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      Campus Placement Major Projects Hub
                    </div>
                    <div className="text-[10px] text-slate-300">
                      15+ Architecture Diagrams (URL Shortener, Blockchain, OS)
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 shrink-0">
                  ⭐ New
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('internships')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Verified Student Internships Radar
                    </div>
                    <div className="text-[10px] text-slate-400">
                      AICTE Portal, GSoC, DRDO/ISRO Trainees, LFX
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  💼 Vetted
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('scholarships')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      Verified 2026 Scholarships Hub
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Reliance, Tata Pankh, SBI Asha, AICTE Pragati
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('utilities', 'pdf-tools')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-800"
              >
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      Private In-Browser PDF &amp; Photo Resizers
                    </div>
                    <div className="text-[10px] text-slate-400">
                      30+ zero-server 20KB client-side WebAssembly tools
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Drawer Footer: Support & Feedback */}
        <div className="pt-5 mt-6 border-t border-slate-800 space-y-3">
          {/* Direct Support Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSupport?.();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
          >
            <Heart className="w-4 h-4 text-rose-200 fill-white" />
            <span>❤️ Support StudyMacha (Keep it 100% Free)</span>
          </button>

          {/* Feedback and Contact Links */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFeedback?.();
              }}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Mail className="w-3 h-3 text-cyan-400" />
              <span>Feedback &amp; Feature Request</span>
            </button>
            <span>•</span>
            <span className="text-[10px] text-slate-500">v2.8 Production</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NavigationDrawer;
