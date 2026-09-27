import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Award,
  Flame,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Terminal,
  Layers,
  GraduationCap,
  FileText,
  Users,
  ShoppingBag,
  Database,
  ChevronRight,
  Briefcase,
  MapPin
} from 'lucide-react';

/**
 * Flagship Features (The Two Most Strategic Entry Points)
 * Highlighted with stronger visual prominence and outcome-oriented clarity.
 */
export const FLAGSHIP_FEATURES = [
  {
    id: 'ws-gap-analyzer',
    workspace: 'gap-analyzer',
    title: 'AI Student Gap Analyzer',
    badge: 'AI TOOL',
    badgeStyle: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    description: 'Understand where you are, identify your skill gaps, and see what to work on next.',
    actionText: 'Launch Gap Analysis',
    icon: Sparkles,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/60',
    bgGradient: 'from-emerald-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30',
    highlights: [
      'Personalized skill diagnostics',
      'High-priority action items',
      'Realistic semester milestones'
    ]
  },
  {
    id: 'ws-tg-top-colleges',
    workspace: 'tg-top-colleges',
    title: 'Top B.Tech Colleges in Telangana',
    badge: 'DATA ANALYSIS',
    badgeStyle: 'bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-500/30',
    description: 'Explore branch-specific Telangana EAPCET 2026 OC allotment analysis by district.',
    actionText: 'Explore College Analysis',
    icon: Award,
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30',
    borderColor: 'border-sky-200 dark:border-sky-500/30 hover:border-sky-400 dark:hover:border-sky-500/60',
    bgGradient: 'from-sky-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/30',
    highlights: [
      'Choose a branch before comparing colleges',
      'OC-only median, highest and lowest observed ranks',
      'Optional district-wise analysis'
    ]
  },
  {
    id: 'ws-tg-predictor',
    workspace: 'tg-predictor',
    title: 'TG EAPCET College Predictor',
    badge: 'ADMISSIONS',
    badgeStyle: 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
    description: 'Explore historical allotment data to find colleges matching your rank and preferences.',
    actionText: 'Predict College Chances',
    icon: Compass,
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30',
    borderColor: 'border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-500/60',
    bgGradient: 'from-cyan-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/30',
    highlights: [
      '151 Engineering colleges',
      '71,646 Allotment records',
      'Category-wise cutoff ranges'
    ]
  }
];

/**
 * Standard Student Tools Catalog
 * Categorized, outcome-oriented, and uncluttered.
 */
export const WORKSPACES = [
  {
    id: 'ws-tg-top-colleges',
    workspace: 'tg-top-colleges',
    category: 'admissions',
    title: 'Top B.Tech Colleges in Telangana',
    badge: 'RANKINGS',
    description: 'Branch-wise college rankings calculated strictly using valid OC-category allotment ranks across Telangana.',
    actionText: 'View Top Colleges',
    icon: Award,
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  {
    id: 'ws-tg-allotments',
    workspace: 'tg-allotments',
    category: 'admissions',
    title: 'TG EAPCET 2026 Seat Allotments',
    badge: 'ADMISSIONS',
    description: 'Search official candidate registers, category cutoffs, and seat distribution across 151 colleges.',
    actionText: 'Search Allotments',
    icon: Award,
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  },
  {
    id: 'ws-ap-allotments',
    workspace: 'ap-allotments',
    category: 'admissions',
    title: 'AP Allotments (Namewise)',
    badge: '2026 DATA',
    description: 'Search students by name or rank, explore any college and branch, and view observed category-wise rank ranges.',
    actionText: 'Explore Allotments',
    icon: Database,
    iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  },
  {
    id: 'ws-eapcet',
    workspace: 'eapcet',
    category: 'admissions',
    title: 'AP EAPCET Seat Radar',
    badge: 'ADMISSIONS',
    description: 'Track vacant leftover seats and tuition fees across engineering branches in real time.',
    actionText: 'Launch Radar',
    icon: Flame,
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  {
    id: 'ws-attendance',
    workspace: 'attendance',
    category: 'academics',
    title: 'Attendance Defender & Bunk Planner',
    badge: 'ACADEMICS',
    description: 'Calculate exactly how many classes you can afford to miss while maintaining safe attendance criteria.',
    actionText: 'Calculate Safe Bunks',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
  {
    id: 'ws-gpa',
    workspace: 'gpa',
    category: 'academics',
    title: 'GPA Hub & Internal Marks Cutoffs',
    badge: 'ACADEMICS',
    description: 'Determine minimum external marks required to pass or achieve your target SGPA/CGPA.',
    actionText: 'Estimate GPA',
    icon: Award,
    iconBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  },
  {
    id: 'ws-backlog',
    workspace: 'backlog',
    category: 'academics',
    title: 'Smart Backlog Recovery Planner',
    badge: 'ACADEMICS',
    description: 'Build a realistic 30-day recovery blueprint to clear backlogs with structured pass marks.',
    actionText: 'Plan Recovery',
    icon: ShieldAlert,
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  },
  {
    id: 'ws-guides',
    workspace: 'hub',
    category: 'academics',
    title: 'Student Knowledge Guides',
    badge: 'ACADEMICS',
    description: 'Read comprehensive student guides on counseling rules, academic policies, and campus life.',
    actionText: 'Read Guides',
    icon: BookOpen,
    iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  },
  {
    id: 'ws-roadmaps',
    workspace: 'roadmaps',
    category: 'career',
    title: '24-Branch Engineering Roadmaps',
    badge: 'CAREER',
    description: 'Follow semester-by-semester roadmaps, core tech stacks, and project guides for 24 branches.',
    actionText: 'View Roadmaps',
    icon: Compass,
    iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  },
  {
    id: 'ws-vault',
    workspace: 'vault',
    category: 'career',
    title: 'Placement Viva & Code Vault',
    badge: 'CAREER',
    description: 'Practice interview flashcards and explore verified code implementations for common lab tasks.',
    actionText: 'Open Vault',
    icon: Terminal,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
  {
    id: 'ws-projects',
    workspace: 'projects',
    category: 'career',
    title: 'Campus Major Projects Hub',
    badge: 'CAREER',
    description: 'Explore complete system architectures and sample implementations for resume-ready projects.',
    actionText: 'Explore Projects',
    icon: Layers,
    iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  },
  {
    id: 'ws-internships',
    workspace: 'internships',
    category: 'career',
    title: 'Verified Internships Radar',
    badge: 'CAREER',
    description: 'Explore verified non-scam internship listings across government and top industry portals.',
    actionText: 'Browse Internships',
    icon: Briefcase,
    iconBg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  },
  {
    id: 'ws-scholarships',
    workspace: 'scholarships',
    category: 'tools',
    title: 'Verified Scholarships Hub',
    badge: 'SCHOLARSHIPS',
    description: 'Find verified government, corporate, and merit scholarships with official application links.',
    actionText: 'Explore Grants',
    icon: GraduationCap,
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  {
    id: 'ws-pdf',
    workspace: 'utilities',
    category: 'tools',
    title: 'Free PDF & Document Utilities',
    badge: 'UTILITY',
    description: 'Merge, split, and optimize academic PDFs locally in your browser with zero file uploads.',
    actionText: 'Open Tools',
    icon: FileText,
    iconBg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
  },
  {
    id: 'ws-campus-connect',
    workspace: 'campus-connect',
    category: 'tools',
    title: 'MOS CampusConnect',
    badge: 'COMMUNITY',
    description: 'Connect with seniors and peers across colleges for academic guidance and campus updates.',
    actionText: 'Join Network',
    icon: Users,
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
  {
    id: 'ws-essentials',
    workspace: 'essentials',
    category: 'tools',
    title: 'Student Essentials & Academic Gear',
    badge: 'STUDENT GEAR',
    description: 'Curated calculators, study peripherals, and academic gear tailored for engineering students.',
    actionText: 'Browse Gear',
    icon: ShoppingBag,
    iconBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'academics', label: 'Academics' },
  { id: 'career', label: 'Career & Skills' },
  { id: 'tools', label: 'Student Tools' },
];

export const FeaturesHub = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const filteredWorkspaces = selectedCategory === 'all'
    ? WORKSPACES
    : WORKSPACES.filter((w) => w.category === selectedCategory);

  const regionalGroups = [
    {
      title: 'FOR TELANGANA STUDENTS',
      subtitle: 'EAPCET allotments, college discovery and rank-based context for Telangana.',
      tools: [
        { workspace: 'tg-allotments', title: 'TG Namewise Allotments', description: 'Search 2026 candidate allotments and inspect college, branch and category details.', icon: Database },
        { workspace: 'tg-predictor', title: 'TG College Predictor', description: 'Explore historical allotment patterns around your rank and preferences.', icon: Compass },
        { workspace: 'tg-top-colleges', title: 'Top B.Tech Colleges in Telangana', description: 'Compare observed 2026 branch-wise rank patterns with transparent methodology.', icon: Award },
      ],
    },
    {
      title: 'FOR AP STUDENTS',
      subtitle: 'AP EAPCET 2025 & 2026 allotment exploration and rank-based analysis.',
      tools: [
        { workspace: 'ap-allotments', title: 'AP Namewise Allotments', description: 'Choose 2025 or 2026, then explore districts, colleges, branches and candidates.', icon: Database },
        { workspace: 'ap-predictor', title: 'AP College Predictor', description: 'Match your rank against the available AP EAPCET 2026 allotment records.', icon: Compass },
        { workspace: 'ap-top-colleges', title: 'AP Top B.Tech Colleges — Observed Ranks', description: 'Explore 2026 branch-wise highest, median and last observed OC ranks.', icon: Award },
      ],
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Section Header: Human-oriented, non-technical */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Student Tools &amp; Workspaces</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Clear, outcome-focused tools built to solve practical college challenges.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
          14 Student Tools
        </span>
      </div>

      {/* AP & Telangana admission hubs — primary hero entry points */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {regionalGroups.map((group) => (
          <section key={group.title} className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-lg">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-600 dark:text-cyan-300">{group.title}</span>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{group.subtitle}</p>
                </div>
                <MapPin className="w-5 h-5 text-cyan-500 shrink-0" />
              </div>
              <div className="space-y-2.5">
                {group.tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button key={tool.workspace} type="button" onClick={() => onSelectWorkspace && onSelectWorkspace(tool.workspace)} className="w-full text-left group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-cyan-400/50 hover:bg-cyan-50/60 dark:hover:bg-cyan-500/5 p-3.5 transition-all duration-200 hover:-translate-y-0.5">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl grid place-items-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 shrink-0"><Icon className="w-4 h-4" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black text-slate-900 dark:text-white">{tool.title}</span>
                          <span className="block mt-0.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{tool.description}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </section>

      {/* 3. Category Filter Tabs */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Browse by Category
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 text-white border border-slate-800 dark:border-slate-700 shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Compact Secondary Tools Grid (Calm, scannable cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredWorkspaces.map((item) => {
          const Icon = item.icon;
          const isActive = item.workspace === activeWorkspace && item.id !== 'ws-guides';

          return (
            <div
              key={item.id}
              id={item.id}
              onClick={() => handleLaunchWorkspace(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLaunchWorkspace(item);
                }
              }}
              tabIndex={0}
              role="button"
              className={`flex items-start sm:items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900/75 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group shadow-2xs dark:shadow-xs active:scale-[0.99] select-none focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-700 ${
                isActive ? 'ring-1 ring-emerald-500 border-emerald-500/80 bg-slate-50 dark:bg-slate-900' : ''
              }`}
            >
              {/* Left: Purposeful Icon (36px x 36px) */}
              <div
                className={`w-9 h-9 min-w-9 min-h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-transform group-hover:scale-105 shadow-2xs ${item.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Center: Title & Outcome-oriented description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors truncate">
                    {item.title}
                  </h3>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 shrink-0">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              </div>

              {/* Right: Subtle navigation indicator */}
              <div className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default FeaturesHub;
