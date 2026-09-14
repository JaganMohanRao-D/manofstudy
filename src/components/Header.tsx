import React, { useState, useEffect } from 'react';
import {
  Flame,
  Compass,
  GraduationCap,
  FileText,
  Code2,
  Sparkles,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  ShieldCheck,
  ChevronRight,
  Terminal,
  ShoppingBag,
  Heart,
  BookOpen,
  Award,
} from 'lucide-react';
import { ToolTab, WorkspaceView } from '../types';
import { LegalModalType } from './LegalModals';
import { NavigationDrawer } from './NavigationDrawer';

export interface HeaderProps {
  activeWorkspace?: WorkspaceView;
  onSelectWorkspace?: (ws: WorkspaceView) => void;
  activeTab?: ToolTab;
  setActiveTab?: (tab: ToolTab) => void;
  onSelectEapcetPhase?: (phase: string) => void;
  onOpenLegal?: (type: LegalModalType) => void;
  onOpenCommandPalette?: () => void;
  onOpenSupport?: () => void;
}

interface NavModuleItem {
  id: string;
  workspace: WorkspaceView;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  matchWorkspaces?: WorkspaceView[];
}

export const Header: React.FC<HeaderProps> = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
  activeTab = 'eapcet-radar',
  setActiveTab,
  onSelectEapcetPhase,
  onOpenLegal,
  onOpenCommandPalette,
  onOpenSupport,
}) => {
  const [isMegaDrawerOpen, setIsMegaDrawerOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from localStorage or document class
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('javisak_theme') || localStorage.getItem('studymacha_theme');
      if (savedTheme === 'dark' || document.documentElement.classList.contains('dark')) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    try {
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('javisak_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('javisak_theme', 'light');
      }
    } catch {
      // ignore
    }
  };

  const handleNavClick = (ws: WorkspaceView, tabFallback?: ToolTab) => {
    if (onSelectWorkspace) {
      onSelectWorkspace(ws);
    }
    if (tabFallback && setActiveTab) {
      setActiveTab(tabFallback);
    }
  };

  /**
   * High-contrast secondary strip navigation items:
   * 1. Feature Hub
   * 2. Academics
   * 3. Code Vault
   * 4. TG Allotments (Name Wise)
   * 5. AP EAPCET Matrix
   * 6. Attendance Defender
   * 7. Study Guides
   */
  const primaryModules: NavModuleItem[] = [
    {
      id: 'tier2-hub',
      workspace: 'hub',
      label: 'Feature Hub',
      icon: Home,
    },
    {
      id: 'tier2-academics',
      workspace: 'academics',
      label: 'Academics',
      icon: ShieldCheck,
      matchWorkspaces: ['academics', 'gpa', 'backlog'],
    },
    {
      id: 'tier2-vault',
      workspace: 'vault',
      label: 'Code Vault',
      icon: Terminal,
      badge: 'Viva',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'tier2-tg-allotments',
      workspace: 'tg-allotments',
      label: 'TG Allotments (Name Wise)',
      shortLabel: 'TG Allotments',
      icon: Award,
      badge: '2026',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'tier2-eapcet',
      workspace: 'eapcet',
      label: 'AP EAPCET Matrix',
      icon: Flame,
    },
    {
      id: 'tier2-attendance',
      workspace: 'attendance',
      label: 'Attendance Defender',
      icon: ShieldCheck,
      badge: '75%',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'tier2-guides',
      workspace: 'guides',
      label: 'Study Guides',
      icon: BookOpen,
      badge: '8 Ch',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
  ];

  const isModuleActive = (item: NavModuleItem) => {
    if (item.matchWorkspaces && activeWorkspace) {
      if (item.matchWorkspaces.some((ws) => ws === activeWorkspace)) {
        return true;
      }
    }
    return activeWorkspace === item.workspace;
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 bg-slate-950/95 text-slate-100 shadow-md w-full border-b border-slate-800/80"
    >
      {/* ========================================================================= */}
      {/* TIER 1: Top Primary Bar                                                  */}
      {/* Left: Brand Logo + MAN OF STUDY                                          */}
      {/* Right: Quick Search, Support MOS, Theme Toggle, Hamburger Drawer Trigger */}
      {/* ========================================================================= */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 h-16">
        {/* Brand Logo & Platform Title (Zero truncation, No PRO badge) */}
        <a
          href="https://manofstudy.com"
          id="brand-logo"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              handleNavClick('hub');
              window.history.pushState(null, '', '/');
            }
          }}
          className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0 cursor-pointer group no-underline min-w-0"
          title="MAN OF STUDY — The Definitive Engineering & Academic Launchpad for Pan-Indian Students"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-md border border-slate-700/60 bg-slate-900 flex items-center justify-center p-0.5 shrink-0">
            <img
              src="https://i.ibb.co/zHPk2tv4/Chat-GPT-Image-Sep-13-2026-08-04-48-PM.png"
              alt="MAN OF STUDY Logo"
              width="40"
              height="40"
              className="w-full h-full object-contain transform scale-95 transition-transform duration-200 group-hover:scale-105"
              loading="eager"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white uppercase font-mono drop-shadow-sm group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              MAN OF STUDY
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block truncate">
              Engineering &amp; Academic Launchpad
            </span>
          </div>
        </a>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Universal Search Bar / Command Palette Trigger */}
          <button
            type="button"
            id="header-command-palette-trigger"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs transition-all cursor-pointer shadow-2xs shrink-0"
            title="Open Quick Search & Command Palette (Ctrl/Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden md:inline font-medium text-slate-300">
              Quick Search...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded">
              ⌘K
            </kbd>
          </button>

          {/* High-Visibility Heart-Themed Support Button */}
          <button
            type="button"
            id="header-support-btn"
            onClick={onOpenSupport}
            className="bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 hover:border-rose-700 font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
            title="Support MAN OF STUDY & Keep It 100% Free Forever"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
            <span className="hidden sm:inline font-bold">☕ Support MOS</span>
            <span className="sm:hidden font-bold text-[11px]">Support</span>
          </button>

          {/* Subtle Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Top-Right Hamburger Slide-Over Mega Drawer Trigger */}
          <div className="shrink-0 z-50">
            <button
              type="button"
              id="header-hamburger-drawer-btn"
              onClick={() => setIsMegaDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title="Open MAN OF STUDY Mega Menu & All Hubs"
              aria-label="Open Navigation Mega Drawer"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: Secondary Feature Strip (Desktop & Tablet)                        */}
      {/* Renders all key tools as sleek interactive pills with zero horizontal     */}
      {/* scrolling, wrapping naturally into a centered row.                         */}
      {/* On mobile screens, hidden to preserve screen real estate for the drawer.  */}
      {/* ========================================================================= */}
      <div
        id="tier2-secondary-feature-strip"
        className="hidden md:block border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-start lg:justify-center gap-1 sm:gap-2 flex-wrap">
          {primaryModules.map((item) => {
            const Icon = item.icon;
            const active = isModuleActive(item);

            return (
              <button
                key={item.id}
                type="button"
                id={item.id}
                onClick={() => handleNavClick(item.workspace)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap select-none ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-500/10 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
                title={`Open ${item.label}`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                    active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      active
                        ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                        : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top-Right Hamburger Slide-Over Mega Drawer for Mobile & Full Workspace Hierarchy */}
      <NavigationDrawer
        isOpen={isMegaDrawerOpen}
        onClose={() => setIsMegaDrawerOpen(false)}
        onSelectWorkspace={(ws: WorkspaceView, subTab?: string) => {
          handleNavClick(ws, subTab as ToolTab);
        }}
        onOpenSupport={onOpenSupport}
        onOpenFeedback={() => onOpenLegal?.('contact')}
      />
    </header>
  );
};

export default Header;
