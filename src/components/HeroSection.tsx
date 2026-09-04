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
} from 'lucide-react';
import { WorkspaceView } from '../types';

export interface HeroSectionProps {
  activeWorkspace?: WorkspaceView;
  onSelectWorkspace?: (ws: WorkspaceView) => void;
}

interface WorkspaceCardItem {
  id: string;
  workspace: WorkspaceView;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  iconBg: string;
  glowColor: string;
  hoverBorder: string;
  hoverShadow: string;
}

const WORKSPACES: WorkspaceCardItem[] = [
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
    glowColor: 'from-rose-500/20 via-rose-500/5 to-transparent',
    hoverBorder: 'hover:border-rose-500/60',
    hoverShadow: 'hover:shadow-rose-500/20',
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
    glowColor: 'from-sky-500/20 via-sky-500/5 to-transparent',
    hoverBorder: 'hover:border-sky-500/60',
    hoverShadow: 'hover:shadow-sky-500/20',
  },
  {
    id: 'ws-eapcet',
    workspace: 'eapcet',
    title: 'EAPCET College & Leftover Seat Matrix Radar',
    badge: 'Phase 2 Live',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description:
      'Live college-wise seat vacancy matrix, branch leftover seats & official tuition fees across AP colleges.',
    icon: Flame,
    accentColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    glowColor: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    hoverBorder: 'hover:border-emerald-500/60',
    hoverShadow: 'hover:shadow-emerald-500/20',
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
    glowColor: 'from-amber-500/20 via-amber-500/5 to-transparent',
    hoverBorder: 'hover:border-amber-500/60',
    hoverShadow: 'hover:shadow-amber-500/20',
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
    glowColor: 'from-purple-500/20 via-purple-500/5 to-transparent',
    hoverBorder: 'hover:border-purple-500/60',
    hoverShadow: 'hover:shadow-purple-500/20',
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
    glowColor: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    hoverBorder: 'hover:border-cyan-500/60',
    hoverShadow: 'hover:shadow-cyan-500/20',
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
    glowColor: 'from-blue-500/20 via-blue-500/5 to-transparent',
    hoverBorder: 'hover:border-blue-500/60',
    hoverShadow: 'hover:shadow-blue-500/20',
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
    glowColor: 'from-orange-500/20 via-orange-500/5 to-transparent',
    hoverBorder: 'hover:border-orange-500/60',
    hoverShadow: 'hover:shadow-orange-500/20',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
}) => {
  const handleLaunchWorkspace = (item: WorkspaceCardItem) => {
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
      className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-800 rounded-3xl shadow-2xl space-y-12"
    >
      {/* Dynamic Animated Ambient Radial Blurs (Deep Indigo, Cyan, and Emerald Glows) */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[110px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf812_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Hero Header & Value Proposition */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
        {/* Top Glassmorphic Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-slate-900/80 text-sky-300 border border-sky-500/30 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            🚀 2026 Academic Operating System
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-slate-900/80 text-emerald-300 border border-emerald-500/30 shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            🔒 100% Client-Side Private (Zero Data Tracking)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md bg-slate-900/80 text-amber-300 border border-amber-500/30 shadow-lg">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ⚡ EAPCET Live Seat Radar
          </span>
        </div>

        {/* Headline with Gradient Accent */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
          OF THE STUDENT, BY THE STUDENT,{' '}
          <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent font-black tracking-tight block sm:inline mt-1 sm:mt-0">
            FOR THE STUDENT
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          From Tier-3 hostel rooms to high-growth tech careers: Phase-2 Seat Radar, Attendance Defender, 24+ Multi-Discipline Roadmaps, and In-Browser Instant PDF/Photo Power Tools.
        </p>

        {/* Metrics Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>28+ Verified Scholarships</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>24+ Degree &amp; B.Tech Roadmaps</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>8+ Comprehensive Student Field Guides</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>100% Free Forever</span>
          </div>
        </div>
      </div>

      {/* Quick-Action Workspace Cards (Glassmorphic Bento Grid with Dedicated Micro-Glow Accents) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WORKSPACES.map((item) => {
            const Icon = item.icon;
            const isActive = item.workspace === activeWorkspace && item.id !== 'ws-guides';

            return (
              <div
                key={item.id}
                onClick={() => handleLaunchWorkspace(item)}
                className={`group relative overflow-hidden rounded-3xl p-6 backdrop-blur-md bg-slate-900/80 border border-slate-800 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${item.hoverBorder} ${item.hoverShadow} ${
                  isActive ? 'ring-2 ring-sky-400 border-sky-400' : ''
                }`}
              >
                {/* Dedicated Ambient Micro-Glow Gradient */}
                <div
                  className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${item.glowColor} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                />

                <div className="relative z-10 space-y-3">
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs ${item.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-xs ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Action Trigger */}
                <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-end text-xs font-semibold text-slate-300 group-hover:text-white">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:text-sky-300">
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
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
