import React from 'react';
import {
  Flame,
  Compass,
  GraduationCap,
  FileText,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
  ShoppingBag,
  BookOpen,
  Terminal,
  ShieldAlert,
  Users,
} from 'lucide-react';

/**
 * Pure, static lightweight configuration for the home workspace cards.
 * Compact horizontal anatomy cuts vertical mobile scroll depth by 50%.
 */
export const WORKSPACES = [
  {
    id: 'ws-tg-predictor',
    workspace: 'tg-predictor',
    title: 'TG EAPCET College Predictor',
    tag: 'NEW 2026',
    badge: '2026 Phase-3 Data',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Check admission chances across 151 colleges using 71,646 official 2026 allotment cutoffs.',
    actionText: 'Predict Chances',
    icon: Compass,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    id: 'ws-tg-allotments',
    workspace: 'tg-allotments',
    title: 'TG EAPCET 2026 Final Phase Allotments Name Wise',
    tag: 'Final Phase Live',
    badge: '100% Verified',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description: 'Official student allotment registers, category closing cutoffs & rank lookup.',
    actionText: 'Search Allotments',
    icon: Award,
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    hoverBorder: 'hover:border-rose-500/50',
  },
  {
    id: 'ws-campus-connect',
    workspace: 'campus-connect',
    title: 'MOS CampusConnect',
    tag: 'Community',
    badge: 'Student Network',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Real campus updates, senior guidance, and peer doubt resolution across colleges.',
    actionText: 'Join Network',
    icon: Users,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    id: 'ws-eapcet',
    workspace: 'eapcet',
    title: 'AP EAPCET College & Leftover Seat Matrix Radar',
    badge: 'Phase 2 Live',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Live college seat vacancy matrix, branch leftover seats & official tuition fees.',
    actionText: 'Launch Radar',
    icon: Flame,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    id: 'ws-vault',
    workspace: 'vault',
    title: 'Placement Viva & Practical Code Vault',
    badge: 'In-Browser',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: '3D interview flashcards with model answers + verified practical code snippets.',
    actionText: 'Open Vault',
    icon: Terminal,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    id: 'ws-backlog',
    workspace: 'backlog',
    title: 'Smart Backlog Recovery Planner',
    badge: '30-Day Blueprint',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description: 'Calculate external pass marks required and follow 30-day recovery blueprint.',
    actionText: 'Plan Recovery',
    icon: ShieldAlert,
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    hoverBorder: 'hover:border-rose-500/50',
  },
  {
    id: 'ws-attendance',
    workspace: 'attendance',
    title: 'Attendance Defender & Bunk Planner',
    badge: '75% Rule',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description: 'Calculate exact classes you can bunk or must attend to avoid detention risk.',
    actionText: 'Calculate Safe Bunks',
    icon: ShieldCheck,
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    hoverBorder: 'hover:border-rose-500/50',
  },
  {
    id: 'ws-gpa',
    workspace: 'gpa',
    title: 'GPA Hub & Internal Marks Cutoff Calculator',
    badge: 'JNTU / Auto',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    description: 'Calculate external marks needed based on mid-terms and estimate SGPA/CGPA.',
    actionText: 'Estimate GPA',
    icon: Award,
    iconBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    hoverBorder: 'hover:border-sky-500/50',
  },
  {
    id: 'ws-scholarships',
    workspace: 'scholarships',
    title: 'Verified 2026 Scholarships Hub (School to B.Tech)',
    badge: 'Govt & CSR',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    description: 'Reliance, SBI Asha, AICTE Pragati & Tata grants with direct official portals.',
    actionText: 'Explore Grants',
    icon: GraduationCap,
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    hoverBorder: 'hover:border-amber-500/50',
  },
  {
    id: 'ws-roadmaps',
    workspace: 'roadmaps',
    title: '24-Branch Engineering Career & Placement Roadmaps',
    badge: '24 Disciplines',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    description: 'Curriculum, modern tech stacks, projects, GATE prep & printable PDF roadmaps.',
    actionText: 'View Roadmaps',
    icon: Compass,
    iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    hoverBorder: 'hover:border-purple-500/50',
  },
  {
    id: 'ws-pdf',
    workspace: 'utilities',
    title: 'PDF Tools for Free & 20KB Photo Resizer',
    badge: '100% Free',
    badgeColor: 'bg-pink-500/15 text-pink-700 border-pink-500/30',
    description: 'Fast, in-browser PDF utilities. Zero uploads, zero tracking, completely free.',
    actionText: 'Open Tools',
    icon: FileText,
    iconBg: 'bg-pink-500/10 border-pink-500/30 text-pink-600',
    hoverBorder: 'hover:border-pink-500/50',
  },
  {
    id: 'ws-guides',
    workspace: 'hub',
    title: 'MOS Student Knowledge HUB (9 Chapters)',
    badge: '9 Chapters',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    description: 'Master OC quota dynamics, Phase-2 sliding rules, and attendance doctrine.',
    actionText: 'Read Guides',
    icon: BookOpen,
    iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    hoverBorder: 'hover:border-blue-500/50',
  },
  {
    id: 'ws-essentials',
    workspace: 'essentials',
    title: 'Student Essentials & Academic Gear Store',
    badge: 'Student Gear',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    description: 'Casio fx-991CW calculators, engineering laptops & silent study peripherals.',
    actionText: 'Browse Store',
    icon: ShoppingBag,
    iconBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    hoverBorder: 'hover:border-orange-500/50',
  },
];

/**
 * Compact Features Hub Component
 * Horizontal sleek rectangular list cards (grid-cols-1 md:grid-cols-2 gap-3.5)
 * Cuts vertical scroll depth on mobile viewports by 50% while preserving all features.
 */
export const FeaturesHub = ({
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
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Interactive Workspaces &amp; Engines
        </span>
        <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
          13 Free Student Engines
        </span>
      </div>

      {/* Compact horizontal/rectangular grid: 1-col on mobile, 2-col on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {WORKSPACES.map((item) => {
          const Icon = item.icon;
          const isActive = item.workspace === activeWorkspace && item.id !== 'ws-guides';

          return (
            <div
              key={item.id}
              id={item.id}
              onClick={() => handleLaunchWorkspace(item)}
              className={`flex items-start sm:items-center gap-3.5 min-h-[72px] h-auto py-3 px-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group active:scale-[0.99] select-none ${
                isActive ? 'ring-2 ring-emerald-400 border-emerald-400' : ''
              }`}
            >
              {/* Left: Compact icon badge (36px x 36px) */}
              <div
                className={`w-9 h-9 min-w-9 min-h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-transform duration-150 group-hover:scale-105 shadow-xs ${item.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Center: Title & multi-line flexible description without truncation */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 break-words group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  {item.tag && (
                    <span className="inline-block px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-rose-600/25 text-rose-300 border border-rose-500/40 rounded-xs shrink-0">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-0.5 break-words">
                  {item.description}
                </p>
              </div>

              {/* Right: Mini status pill + subtle chevron arrow */}
              <div className="flex items-center gap-2 shrink-0 mt-0.5 sm:mt-0">
                <span
                  className={`hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesHub;
