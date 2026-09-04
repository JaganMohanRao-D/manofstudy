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
} from 'lucide-react';
import { ToolTab, WorkspaceView } from '../types';
import { LegalModalType } from './LegalModals';

export interface HeaderProps {
  activeWorkspace?: WorkspaceView;
  onSelectWorkspace?: (ws: WorkspaceView) => void;
  activeTab?: ToolTab;
  setActiveTab?: (tab: ToolTab) => void;
  onSelectEapcetPhase?: (phase: string) => void;
  onOpenLegal?: (type: LegalModalType) => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeWorkspace = 'hub',
  onSelectWorkspace,
  activeTab = 'eapcet-radar',
  setActiveTab,
  onSelectEapcetPhase,
  onOpenLegal,
  onOpenCommandPalette,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from localStorage or document class
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('studymacha_theme');
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
        localStorage.setItem('studymacha_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('studymacha_theme', 'light');
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
    setMobileMenuOpen(false);
  };

  interface HeaderNavItem {
    id: string;
    workspace: WorkspaceView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: HeaderNavItem[] = [
    {
      id: 'hub',
      workspace: 'hub',
      label: 'Feature Hub',
      icon: Home,
    },
    {
      id: 'academics',
      workspace: 'academics',
      label: 'Academics',
      icon: ShieldCheck,
    },
    {
      id: 'eapcet',
      workspace: 'eapcet',
      label: 'EAPCET Radar',
      icon: Flame,
    },
    {
      id: 'roadmaps',
      workspace: 'roadmaps',
      label: '24 Roadmaps',
      icon: Compass,
    },
    {
      id: 'scholarships',
      workspace: 'scholarships',
      label: 'Scholarships',
      icon: GraduationCap,
    },
    {
      id: 'utilities',
      workspace: 'utilities',
      label: 'PDF & Tools',
      icon: FileText,
    },
    {
      id: 'dsa',
      workspace: 'dsa',
      label: 'DSA & Coding',
      icon: Code2,
    },
  ];

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 shadow-xs w-full max-w-full overflow-hidden"
    >
      {/* Main Streamlined Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 w-full">
          
          {/* Brand Logo on Left: STUDYMACHA with PRO / Verified badge */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('hub')}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 cursor-pointer select-none group"
            title="Go to StudyMacha Feature Hub"
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950 dark:bg-sky-950 text-white shadow-md ring-1 ring-slate-800 dark:ring-sky-700 transition-transform duration-200 group-hover:scale-105">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-sky-500/20 via-teal-400/10 to-transparent pointer-events-none" />
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  STUDY<span className="text-sky-600 dark:text-sky-400">MACHA</span>
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-900 dark:bg-slate-800 text-slate-100 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 hidden sm:block">
                All-in-One Engineering &amp; Career Engine
              </p>
            </div>
          </div>

          {/* Desktop Direct Workspace Switchers (Zero Clutter) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeWorkspace === item.workspace ||
                (item.workspace === 'academics' && (activeWorkspace === 'attendance' || activeWorkspace === 'gpa')) ||
                (item.workspace === 'dsa' && activeWorkspace === 'compiler');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.workspace)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Navigation Controls: Search, Theme Toggle & Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Universal Search Bar / Command Palette Trigger */}
            <button
              type="button"
              id="header-command-palette-trigger"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Open Quick Search & Command Palette (Ctrl/Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
              <span className="hidden md:inline font-medium text-slate-500 dark:text-slate-400">
                Search tools...
              </span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Subtle Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200 w-full max-w-full overflow-hidden">
          {/* Quick Search Button in Drawer */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCommandPalette?.();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-600" />
              <span>Search StudyMacha Tools &amp; Roadmaps</span>
            </div>
            <kbd className="text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Workspaces List */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider px-2 block mb-1">
              Select Workspace
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeWorkspace === item.workspace ||
                (item.workspace === 'academics' && (activeWorkspace === 'attendance' || activeWorkspace === 'gpa')) ||
                (item.workspace === 'dsa' && activeWorkspace === 'compiler');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.workspace)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Legal / Policy Links */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLegal?.('about');
              }}
              className="hover:underline cursor-pointer"
            >
              About
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLegal?.('privacy');
              }}
              className="hover:underline cursor-pointer"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLegal?.('terms');
              }}
              className="hover:underline cursor-pointer"
            >
              Terms
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLegal?.('contact');
              }}
              className="hover:underline cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
