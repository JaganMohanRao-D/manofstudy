import React from 'react';
import {
  Flame,
  Compass,
  GraduationCap,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  ShoppingBag,
  Zap,
  BookOpen,
  Terminal,
  ShieldAlert,
  Code2,
} from 'lucide-react';

/**
 * Pure, static lightweight configuration for the home workspace cards.
 * Prevents parsing large JSON files during homepage mounting to ensure
 * instantaneous render without freezing main thread on mobile.
 */
const WORKSPACES = [
  {
    id: 'ws-tg-allotments',
    workspace: 'tg-allotments',
    title: 'TG EAPCET 2026 Final Phase Seat Allotments Name Wise',
    tag: 'Final Phase Live',
    badge: '100% Verified Records',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description:
      'Official student allotment registers, category closing cutoffs, and name-wise rank lookup with zero latency.',
    actionText: 'Search Allotments',
    icon: Award,
    accentColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    hoverBorder: 'hover:border-rose-500/60',
  },
  {
    id: 'ws-eapcet',
    workspace: 'eapcet',
    title: 'AP EAPCET College & Leftover Seat Matrix Radar',
    badge: 'Phase 2 Live',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description:
      'Live college-wise seat vacancy matrix, branch leftover seats & official tuition fees across AP colleges.',
    actionText: 'Launch Radar',
    icon: Flame,
    accentColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/60',
  },
  {
    id: 'ws-vault',
    workspace: 'vault',
    title: 'Placement Viva & Practical Code Vault',
    badge: '100% In-Browser',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description:
      '3D interview flashcards with model answers + verified practical code snippets (Python, C, C++) with 1-click clipboard copy.',
    icon: Terminal,
    accentColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/60',
  },
  {
    id: 'ws-backlog',
    workspace: 'backlog',
    title: 'Smart Backlog Recovery Planner',
    badge: '30-Day Blueprint',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description:
      'Calculate external pass marks required from mid-term scores and follow an interactive 30-day recovery checklist saved to local storage.',
    icon: ShieldAlert,
    accentColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    hoverBorder: 'hover:border-rose-500/60',
  },
  {
    id: 'ws-attendance',
    workspace: 'attendance',
    title: 'Attendance Defender & Bunk Planner',
    badge: '75% Mandatory',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description:
      'Calculate exact classes you can safely bunk or must attend to maintain 75% or 85% college criteria with zero detention risk.',
    icon: ShieldCheck,
    accentColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    hoverBorder: 'hover:border-rose-500/60',
  },
  {
    id: 'ws-gpa',
    workspace: 'gpa',
    title: 'GPA Hub & Internal Marks Cutoff Calculator',
    badge: 'JNTU / Autonomous',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    description:
      'Calculate exact external exam marks needed based on mid-term internals and estimate SGPA/CGPA with official grading scales.',
    icon: Award,
    accentColor: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    hoverBorder: 'hover:border-sky-500/60',
  },
  {
    id: 'ws-scholarships',
    workspace: 'scholarships',
    title: 'Verified 2026 Scholarships Hub (School to B.Tech)',
    badge: 'Govt & CSR',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    description:
      'Reliance, SBI Asha, AICTE Pragati, Tata Pankh & HDFC grants with direct official application portals.',
    icon: GraduationCap,
    accentColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    hoverBorder: 'hover:border-amber-500/60',
  },
  {
    id: 'ws-roadmaps',
    workspace: 'roadmaps',
    title: '24-Branch Engineering Career & Placement Roadmaps',
    badge: '24 Disciplines',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    description:
      'Semester curriculum, essential modern tech stacks, projects, GATE prep & printable PDF roadmaps.',
    icon: Compass,
    accentColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    hoverBorder: 'hover:border-purple-500/60',
  },
  {
    id: 'ws-pdf',
    workspace: 'utilities',
    title: 'Private Client-Side PDF Tools & 20KB Photo Resizer',
    badge: '100% In-Browser',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    description:
      'Merge, split, protect PDFs and resize ID photos to strict 20KB–50KB exam specs with zero server uploads.',
    icon: FileText,
    accentColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/60',
  },
  {
    id: 'ws-guides',
    workspace: 'hub',
    title: '8-Chapter Student & Tier-3 Survival Editorial Hub',
    badge: '8 In-Depth Chapters',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    description:
      'Master Phase-2 sliding rules, the 75% attendance condonation doctrine, backlog recovery, and budget developer gear.',
    icon: BookOpen,
    accentColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    hoverBorder: 'hover:border-blue-500/60',
  },
  {
    id: 'ws-essentials',
    workspace: 'essentials',
    title: 'Student Essentials & Academic Gear Store',
    badge: 'Amazon Verified',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    description:
      'Casio fx-991CW calculators, engineering laptops, EAPCET/NEET PYQ bundles, and silent study peripherals.',
    icon: ShoppingBag,
    accentColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    hoverBorder: 'hover:border-orange-500/60',
  },
];

export const HeroSection = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
}) => {
  const handleLaunchWorkspace = (item) => {
    if (item.id === 'ws-guides') {
      const el = document.getElementById('guides-hub');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (onSelectWorkspace) {
      onSelectWorkspace(item.workspace);
    }
  };

  return (
    <section
      id="hero-banner"
      className="relative overflow-hidden bg-slate-950 text-white py-12 sm:py-20 lg:py-24 px-4 sm:px-8 border-b border-slate-800 rounded-3xl shadow-2xl space-y-10 sm:space-y-12 min-h-fit break-words"
    >
      {/* Background Ambience:
          Heavy radial-blur layers are disabled on mobile (<640px) to prevent
          render-blocking composite stalls and GPU memory exhaustion */}
      <div className="hidden sm:block absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[110px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      
      {/* Lightweight subtle gradient overlay for mobile */}
      <div className="block sm:hidden absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="hidden sm:block absolute inset-0 bg-[radial-gradient(#38bdf812_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Hero Header & Value Proposition */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            🔥 AP &amp; TG FINAL PHASE ALLOTMENTS NAME WISE
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-900/90 text-emerald-300 border border-emerald-500/30 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Client-Side Private
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-slate-900/90 text-amber-300 border border-amber-500/30 shadow-md">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            EAPCET Seat Radar
          </span>
        </div>

        {/* Clean Headline: Structured without overlapping wrapping spans to prevent mobile cutoff */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight text-center px-2 break-words">
          OF THE STUDENT, BY THE STUDENT,<br />
          <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            FOR THE STUDENT
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal px-2">
          From Tier-3 hostel rooms to high-growth tech careers: Phase-2 Seat Radar, Attendance Defender, 24+ Multi-Discipline Roadmaps, and In-Browser Instant PDF/Photo Power Tools.
        </p>

        {/* Metrics Strip: High-performance mobile tags */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>28+ Verified Scholarships</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>24+ Degree &amp; B.Tech Roadmaps</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>8+ Survival Guides</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>100% Free Forever</span>
          </div>
        </div>
      </div>

      {/* Quick-Action Workspace Cards:
          High-performance CSS (bg-slate-900 border border-slate-800)
          avoiding heavy backdrop-filter blur on mobile devices */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Interactive Workspaces &amp; Engines
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click any card to launch workspace instantly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {WORKSPACES.map((item) => {
            const Icon = item.icon;
            const isActive = item.workspace === activeWorkspace && item.id !== 'ws-guides';

            return (
              <div
                key={item.id}
                id={item.id}
                onClick={() => handleLaunchWorkspace(item)}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-slate-900 border border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 active:scale-[0.99] ${item.hoverBorder} ${
                  isActive ? 'ring-2 ring-sky-400 border-sky-400' : ''
                }`}
              >
                <div className="relative z-10 space-y-3">
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-xs ${item.iconBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {item.tag && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white shadow-xs border border-rose-400/40">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Action Trigger */}
                <div className="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-end text-xs font-semibold text-slate-300 group-hover:text-white">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:text-sky-300">
                    <span>{item.actionText || 'Launch'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
