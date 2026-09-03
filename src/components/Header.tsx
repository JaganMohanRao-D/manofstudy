import React, { useState, useRef, useEffect } from 'react';
import {
  Radar,
  ShieldCheck,
  GraduationCap,
  Image as ImageIcon,
  FileSearch,
  FileText,
  Calculator,
  Bot,
  Menu,
  X,
  Sparkles,
  Award,
  Search,
  ChevronDown,
  MessageCircle,
  Flame,
  Target,
  Layers,
  CheckCircle2,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { ToolTab } from '../types';
import { LegalModalType } from './LegalModals';

interface HeaderProps {
  activeTab: ToolTab;
  setActiveTab: (tab: ToolTab) => void;
  onSelectEapcetPhase?: (phase: string) => void;
  onOpenLegal?: (type: LegalModalType) => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectEapcetPhase,
  onOpenLegal,
  onOpenCommandPalette,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [academicsOpen, setAcademicsOpen] = useState<boolean>(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState<boolean>(false);

  const academicsRef = useRef<HTMLDivElement>(null);
  const utilitiesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        academicsRef.current &&
        !academicsRef.current.contains(event.target as Node)
      ) {
        setAcademicsOpen(false);
      }
      if (
        utilitiesRef.current &&
        !utilitiesRef.current.contains(event.target as Node)
      ) {
        setUtilitiesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTab = (tab: ToolTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setAcademicsOpen(false);
    setUtilitiesOpen(false);
  };

  const handleSelectPhase = () => {
    setActiveTab('eapcet-radar');
    if (onSelectEapcetPhase) {
      onSelectEapcetPhase('phase2');
    }
    setMobileMenuOpen(false);
    setAcademicsOpen(false);
  };

  // Universal Search Handler: intelligently switches to relevant tool
  const handleUniversalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    if (
      q.includes('eapcet') ||
      q.includes('seat') ||
      q.includes('phase') ||
      q.includes('college') ||
      q.includes('counsel') ||
      q.includes('vrse') ||
      q.includes('auce') ||
      q.includes('jntu')
    ) {
      handleSelectPhase();
    } else if (
      q.includes('roadmap') ||
      q.includes('branch') ||
      q.includes('curriculum') ||
      q.includes('syllabus') ||
      q.includes('action plan')
    ) {
      handleSelectTab('roadmaps');
    } else if (
      q.includes('scholarship') ||
      q.includes('reliance') ||
      q.includes('hdfc') ||
      q.includes('lic') ||
      q.includes('kotak') ||
      q.includes('grant') ||
      q.includes('pragati') ||
      q.includes('nsp')
    ) {
      handleSelectTab('scholarships');
    } else if (
      q.includes('pdf') ||
      q.includes('merge') ||
      q.includes('split') ||
      q.includes('watermark') ||
      q.includes('compress pdf')
    ) {
      handleSelectTab('pdf-tools');
    } else if (
      q.includes('image') ||
      q.includes('resiz') ||
      q.includes('photo') ||
      q.includes('20kb') ||
      q.includes('50kb') ||
      q.includes('crop')
    ) {
      handleSelectTab('resizer');
    } else if (
      q.includes('resume') ||
      q.includes('ats') ||
      q.includes('cv') ||
      q.includes('job')
    ) {
      handleSelectTab('resume-checker');
    } else if (
      q.includes('gpa') ||
      q.includes('cgpa') ||
      q.includes('grade') ||
      q.includes('percentage')
    ) {
      handleSelectTab('gpa');
    } else if (
      q.includes('attendance') ||
      q.includes('bunk') ||
      q.includes('absent')
    ) {
      handleSelectTab('attendance');
    } else if (
      q.includes('internal') ||
      q.includes('mid') ||
      q.includes('cutoff')
    ) {
      handleSelectTab('internal-calc');
    } else if (
      q.includes('human') ||
      q.includes('ai') ||
      q.includes('paraphrase')
    ) {
      handleSelectTab('humanizer');
    } else {
      // Default search opens AP EAPCET Radar or Scholarships depending on keywords
      handleSelectTab('eapcet-radar');
    }
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 border-slate-200 bg-white/95 text-slate-900 shadow-xs"
    >
      {/* 1. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Modern Sleek StudyMacha Logo */}
          <div
            id="brand-logo"
            onClick={() => handleSelectTab('eapcet-radar')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 text-white shadow-md ring-1 ring-slate-800/80 transition-transform duration-200 group-hover:scale-105">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-sky-500/20 via-teal-400/10 to-transparent pointer-events-none" />
              <Sparkles className="w-5 h-5 text-sky-400 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900 font-sans">
                  STUDY<span className="text-sky-600">MACHA</span>
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-900 text-slate-100 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 hidden sm:block">
                All-in-One Student &amp; Career Portal
              </p>
            </div>
          </div>

          {/* Universal Search Bar / Command Palette Trigger */}
          <button
            type="button"
            id="header-command-palette-trigger"
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center justify-between relative flex-1 max-w-sm lg:max-w-md mx-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-all cursor-pointer group shadow-2xs"
            title="Open Quick Search & Command Palette (Ctrl/Cmd+K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
              <span className="truncate text-slate-500 group-hover:text-slate-800 font-medium">
                Search tools, roadmaps, PDF suite...
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-300 rounded shadow-2xs group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors">
                ⌘K
              </kbd>
            </div>
          </button>

          {/* Desktop Nav Items with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
            {/* Academics Dropdown */}
            <div className="relative" ref={academicsRef}>
              <button
                onClick={() => {
                  setAcademicsOpen(!academicsOpen);
                  setUtilitiesOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'eapcet-radar' ||
                  activeTab === 'gpa' ||
                  activeTab === 'internal-calc' ||
                  activeTab === 'attendance'
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>Academics</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    academicsOpen ? 'rotate-180 text-sky-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {academicsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    EAPCET Counselling &amp; Vacancies
                  </div>
                  <button
                    onClick={() => handleSelectPhase()}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50 text-left text-slate-800 hover:text-rose-900 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="text-xs font-bold">Phase 2 Left Over Seats</div>
                        <div className="text-[10px] text-slate-500">Live Vacancy Matrix &amp; Fees</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full">
                      LIVE
                    </span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 my-1" />
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    University Scoring Tools
                  </div>

                  <button
                    onClick={() => handleSelectTab('gpa')}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-left text-xs text-slate-700 transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    <span>Global GPA &amp; CGPA Converter</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('internal-calc')}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-left text-xs text-slate-700 transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-slate-500" />
                    <span>Internal Exam Cutoff Estimator</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('attendance')}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-left text-xs text-slate-700 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Attendance Defender (75% Rule)</span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 my-1" />
                  <button
                    onClick={() => handleSelectTab('roadmaps')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-left text-indigo-900 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="text-xs font-bold">24 Branch Career Roadmaps</div>
                        <div className="text-[10px] text-indigo-600">4-Year Curriculum &amp; Software</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full">
                      24 B.TECH
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Branch Roadmaps Direct Tab */}
            <button
              onClick={() => handleSelectTab('roadmaps')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'roadmaps'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Branch Roadmaps</span>
              <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full">
                24 Branches
              </span>
            </button>

            {/* Scholarships Radar Direct Tab */}
            <button
              onClick={() => handleSelectTab('scholarships')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'scholarships'
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Scholarships Radar</span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                22+ Live
              </span>
            </button>

            {/* Utilities & Tools Dropdown */}
            <div className="relative" ref={utilitiesRef}>
              <button
                onClick={() => {
                  setUtilitiesOpen(!utilitiesOpen);
                  setAcademicsOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'pdf-tools' ||
                  activeTab === 'resizer' ||
                  activeTab === 'resume-checker' ||
                  activeTab === 'humanizer'
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Utilities &amp; Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    utilitiesOpen ? 'rotate-180 text-sky-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {utilitiesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handleSelectTab('pdf-tools')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="text-xs font-bold">30+ PDF Power Suite</div>
                        <div className="text-[10px] text-slate-500">Merge, Split, Watermark, OCR</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectTab('resizer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-sky-500" />
                      <div>
                        <div className="text-xs font-bold">Image Resizer (20KB–50KB)</div>
                        <div className="text-[10px] text-slate-500">Counselling &amp; Exam Uploads</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectTab('resume-checker')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="text-xs font-bold">ATS Resume Matcher</div>
                        <div className="text-[10px] text-slate-500">Score &amp; 1-Click Builder</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectTab('humanizer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <div>
                        <div className="text-xs font-bold">AI Text Humanizer</div>
                        <div className="text-[10px] text-slate-500">Bypass AI Detection</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Top Action Button: "Phase 2 Vacancies" */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectTab('eapcet-radar')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer group"
            >
              <Flame className="w-4 h-4 text-white fill-white transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Phase 2 Vacancies</span>
              <span className="sm:hidden">Phase 2</span>
            </button>

            {/* Mobile Quick Search / Palette Button */}
            <button
              id="mobile-search-command-btn"
              onClick={onOpenCommandPalette}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Open Command Palette"
              title="Quick Search & Command Palette (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-slate-700" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Highlighted Quick-Access Pills/Badges (Header Sub-Bar) */}
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectPhase()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] bg-rose-100/90 text-rose-900 border border-rose-300/80 hover:bg-rose-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>🔥 AP EAPCET Phase 2 Left Over Seats</span>
            </button>

            <button
              onClick={() => handleSelectTab('roadmaps')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] bg-indigo-100/90 text-indigo-900 border border-indigo-300/80 hover:bg-indigo-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>🧭 24 Branch Career Roadmaps</span>
            </button>

            <button
              onClick={() => handleSelectTab('scholarships')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 hover:bg-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>🎓 2026 Scholarships (Up to ₹2 Lakhs)</span>
            </button>

            <button
              onClick={() => handleSelectTab('resizer')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-[11px] bg-sky-100/80 text-sky-900 border border-sky-200 hover:bg-sky-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ImageIcon className="w-3 h-3 text-sky-600" />
              <span>⚡ 20KB Photo Resizer</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% In-Browser &amp; Zero Uploads
            </span>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          {/* Mobile Command Palette Trigger Button */}
          <button
            type="button"
            id="mobile-drawer-command-palette-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCommandPalette?.();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span>Command Palette / Quick Navigator</span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700 font-bold">
              ⌘K
            </span>
          </button>

          {/* Quick Actions */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              AP EAPCET Vacancies
            </div>
            <button
              onClick={() => handleSelectPhase()}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-900 font-bold text-xs"
            >
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                Phase 2 Left Over Seats
              </span>
              <span className="text-[10px] bg-rose-200 px-2 py-0.5 rounded-full font-bold">Final Phase</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Engineering &amp; Career Roadmaps
            </div>
            <button
              onClick={() => handleSelectTab('roadmaps')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 text-indigo-900 font-bold text-xs"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                24 Branch Career Roadmaps
              </span>
              <span className="text-[10px] bg-indigo-200 px-2 py-0.5 rounded-full font-bold">24 Branches</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              All StudyMacha Tools
            </div>
            <button
              onClick={() => handleSelectTab('scholarships')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Scholarships Radar (Reliance, HDFC, AICTE, SBI)</span>
            </button>

            <button
              onClick={() => handleSelectTab('pdf-tools')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <FileText className="w-4 h-4 text-red-500" />
              <span>30+ PDF Power Suite</span>
            </button>

            <button
              onClick={() => handleSelectTab('resizer')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <ImageIcon className="w-4 h-4 text-sky-500" />
              <span>Image Resizer &amp; Compressor (20KB–50KB)</span>
            </button>

            <button
              onClick={() => handleSelectTab('resume-checker')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <FileSearch className="w-4 h-4 text-emerald-500" />
              <span>ATS Resume Checker &amp; 1-Click Builder</span>
            </button>

            <button
              onClick={() => handleSelectTab('gpa')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Award className="w-4 h-4 text-purple-500" />
              <span>Global GPA Hub</span>
            </button>

            <button
              onClick={() => handleSelectTab('attendance')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Attendance Defender</span>
            </button>

            <button
              onClick={() => handleSelectTab('humanizer')}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Bot className="w-4 h-4 text-indigo-500" />
              <span>AI Text Humanizer</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                handleSelectTab('eapcet-radar');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Explore Phase 2 Vacancies</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
