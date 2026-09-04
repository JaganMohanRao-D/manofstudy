import React from 'react';
import {
  Flame,
  Compass,
  GraduationCap,
  FileText,
  Code2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  ShoppingBag,
} from 'lucide-react';
import { WorkspaceView } from '../types';

export interface HeroSectionProps {
  activeWorkspace?: WorkspaceView;
  onSelectWorkspace?: (ws: WorkspaceView) => void;
}

interface WorkspaceItem {
  id: string;
  workspace: WorkspaceView;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  hoverRing: string;
}

const WORKSPACES: WorkspaceItem[] = [
  {
    id: 'ws-attendance',
    workspace: 'attendance',
    title: 'Attendance Defender & Bunk Planner',
    badge: '75% Mandatory',
    badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
    description: 'Calculate exact classes you can safely bunk or must attend to maintain 75% or 85% college criteria with zero detention risk.',
    icon: ShieldCheck,
    accentColor: 'text-rose-600 bg-rose-50 border-rose-100',
    hoverRing: 'hover:border-rose-300 hover:shadow-rose-100/50',
  },
  {
    id: 'ws-gpa',
    workspace: 'gpa',
    title: 'GPA Hub & Internal Marks Cutoff Calculator',
    badge: 'JNTU / Autonomous',
    badgeColor: 'bg-blue-50 text-blue-600 border-blue-200',
    description: 'Calculate exact external exam marks needed based on mid-term internals and estimate SGPA/CGPA with official grading scales.',
    icon: Award,
    accentColor: 'text-blue-600 bg-blue-50 border-blue-100',
    hoverRing: 'hover:border-blue-300 hover:shadow-blue-100/50',
  },
  {
    id: 'ws-eapcet',
    workspace: 'eapcet',
    title: 'EAPCET College & Leftover Seat Matrix Radar',
    badge: 'Phase 2 Live',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    description: 'Live college-wise seat vacancy matrix, branch leftover seats & official tuition fees across AP colleges.',
    icon: Flame,
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    hoverRing: 'hover:border-emerald-300 hover:shadow-emerald-100/50',
  },
  {
    id: 'ws-roadmaps',
    workspace: 'roadmaps',
    title: '24-Branch Engineering Career & Placement Roadmaps',
    badge: '24 Disciplines',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Semester curriculum, essential modern tech stacks, projects, GATE prep & printable PDF roadmaps.',
    icon: Compass,
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    hoverRing: 'hover:border-indigo-300 hover:shadow-indigo-100/50',
  },
  {
    id: 'ws-scholarships',
    workspace: 'scholarships',
    title: 'Verified 2026 Scholarships Hub (School to B.Tech)',
    badge: 'Govt & CSR',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Reliance, SBI Asha, AICTE Pragati, Tata Pankh & HDFC grants with direct official application portals.',
    icon: GraduationCap,
    accentColor: 'text-amber-600 bg-amber-50 border-amber-100',
    hoverRing: 'hover:border-amber-300 hover:shadow-amber-100/50',
  },
  {
    id: 'ws-pdf',
    workspace: 'utilities',
    title: 'Private Client-Side PDF Tools & 20KB Photo Resizer',
    badge: '100% In-Browser',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Merge, split, protect PDFs and resize ID photos to strict 20KB–50KB exam specs with zero server uploads.',
    icon: FileText,
    accentColor: 'text-sky-600 bg-sky-50 border-sky-100',
    hoverRing: 'hover:border-sky-300 hover:shadow-sky-100/50',
  },
  {
    id: 'ws-essentials',
    workspace: 'essentials',
    title: '🛍️ Student Essentials & Academic Gear Store',
    badge: 'Amazon Verified',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Casio fx-991CW calculators, engineering laptops, EAPCET/NEET PYQ bundles, and silent study peripherals.',
    icon: ShoppingBag,
    accentColor: 'text-amber-600 bg-amber-50 border-amber-100',
    hoverRing: 'hover:border-amber-300 hover:shadow-amber-100/50',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
}) => {
  const handleLaunchWorkspace = (ws: WorkspaceView) => {
    if (onSelectWorkspace) {
      onSelectWorkspace(ws);
    }
  };

  return (
    <section
      id="hero-banner"
      className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-7 lg:p-8 space-y-6"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-r from-sky-400/10 via-indigo-500/10 to-teal-400/10 blur-3xl pointer-events-none -mt-16" />

      {/* Prominent Brand Presentation */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              StudyMacha 2026 Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% In-Browser Privacy
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            StudyMacha — All-in-One Telugu Engineering &amp; Career Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
            The high-performance workspace designed for Telugu &amp; Indian students: AP EAPCET counselling analytics, 24 engineering branch career roadmaps, verified scholarships radar, client-side PDF power tools, and placement coding sandboxes.
          </p>
        </div>

        {/* Quick Highlights / Stats Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start md:self-center">
          <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Workspaces
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
              6 Workspaces
            </span>
          </div>
          <div className="px-3.5 py-2.5 rounded-2xl bg-sky-50/80 border border-sky-200/90 text-center">
            <span className="text-[10px] uppercase font-bold text-sky-600 block tracking-wider">
              Student Access
            </span>
            <span className="text-base sm:text-lg font-black text-sky-900 font-mono">
              Free &amp; Open
            </span>
          </div>
        </div>
      </div>

      {/* Action Directive Banner */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-slate-50 border border-sky-200/70 text-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base animate-bounce" role="img" aria-label="point-right">
            👉
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            Select a tool below to launch workspace instantly.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 hidden sm:flex">
          <span>Click any card to enter full workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Modern 6 Bento Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {WORKSPACES.map((item) => {
          const Icon = item.icon;
          const isActive = item.workspace === activeWorkspace;

          return (
            <div
              key={item.id}
              onClick={() => handleLaunchWorkspace(item.workspace)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ease-out flex flex-col justify-between space-y-3 cursor-pointer group relative overflow-hidden bg-white hover:-translate-y-1 hover:shadow-xl ${
                isActive
                  ? 'border-sky-500 shadow-md ring-2 ring-sky-400/20'
                  : `border-slate-200/90 ${item.hoverRing}`
              }`}
            >
              {/* Header with Icon and Badge */}
              <div className="flex items-start justify-between gap-2 w-full">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${item.accentColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Footer Indicator / Direct Button Trigger */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-sky-700">
                <span className="flex items-center gap-1">
                  Launch Workspace
                </span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HeroSection;
