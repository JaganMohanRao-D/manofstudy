import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Copy,
  Check,
  AlertCircle,
  GraduationCap,
  FileText,
  Building2,
  Sparkles,
  ArrowLeft,
  Flame,
  Compass,
  Code2,
  Terminal,
  Layers,
  Image as ImageIcon,
  Calculator,
  Award,
  FileCheck,
  ShoppingBag,
  Heart,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';
import { ToolTab, ToolMeta, WorkspaceView } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import type { LegalModalType } from './components/LegalModals';
import type { EapcetPhaseTab } from './components/ApEapcetRadar';

// Dynamic code splitting / Lazy loading for heavy sub-pages, modals, and tools
const GuidesHub = lazy(() => import('./components/GuidesHub'));
const ScholarshipsHub = lazy(() =>
  import('./components/ScholarshipsHub').then((m: any) => ({
    default: m.ScholarshipsHub || m.default,
  }))
);
const EngineeringRoadmaps = lazy(() =>
  import('./components/EngineeringRoadmaps').then((m: any) => ({
    default: m.EngineeringRoadmaps || m.default,
  }))
);
const ApEapcetRadar = lazy(() =>
  import('./components/ApEapcetRadar').then((m: any) => ({
    default: m.ApEapcetRadar || m.default,
  }))
);
const TgAllotmentExplorer = lazy(() =>
  import('./components/TgAllotmentExplorer').then((m: any) => ({
    default: m.TgAllotmentExplorer || m.default,
  }))
);
const AttendanceDefender = lazy(() =>
  import('./components/AttendanceDefender').then((m: any) => ({
    default: m.AttendanceDefender || m.default,
  }))
);
const GlobalGpaHub = lazy(() =>
  import('./components/GlobalGpaHub').then((m: any) => ({
    default: m.GlobalGpaHub || m.default,
  }))
);
const InternalExamEstimator = lazy(() =>
  import('./components/InternalExamEstimator').then((m: any) => ({
    default: m.InternalExamEstimator || m.default,
  }))
);
const PdfPowerTools = lazy(() =>
  import('./components/PdfPowerTools').then((m: any) => ({
    default: m.PdfPowerTools || m.default,
  }))
);
const ImageResizer = lazy(() =>
  import('./components/ImageResizer').then((m: any) => ({
    default: m.ImageResizer || m.default,
  }))
);
const AtsResumeMatcher = lazy(() =>
  import('./components/AtsResumeMatcher').then((m: any) => ({
    default: m.AtsResumeMatcher || m.default,
  }))
);
const PlacementCodeVault = lazy(() =>
  import('./components/PlacementCodeVault').then((m: any) => ({
    default: m.PlacementCodeVault || m.default,
  }))
);
const BacklogPlanner = lazy(() =>
  import('./components/BacklogPlanner').then((m: any) => ({
    default: m.BacklogPlanner || m.default,
  }))
);
const DsaPlacementTracker = lazy(() =>
  import('./components/DsaPlacementTracker').then((m: any) => ({
    default: m.DsaPlacementTracker || m.default,
  }))
);
const StudentEssentialsStore = lazy(() =>
  import('./components/StudentEssentialsStore').then((m: any) => ({
    default: m.StudentEssentialsStore || m.default,
  }))
);
const MajorProjectsHub = lazy(() =>
  import('./components/MajorProjectsHub').then((m: any) => ({
    default: m.MajorProjectsHub || m.default,
  }))
);
const InternshipsRadar = lazy(() =>
  import('./components/InternshipsRadar').then((m: any) => ({
    default: m.InternshipsRadar || m.default,
  }))
);
const EducationalGuideAndSeo = lazy(() =>
  import('./components/EducationalGuideAndSeo').then((m: any) => ({
    default: m.EducationalGuideAndSeo || m.default,
  }))
);
const StudentFaq = lazy(() =>
  import('./components/StudentFaq').then((m: any) => ({
    default: m.StudentFaq || m.default,
  }))
);
const StudentTestimonials = lazy(() =>
  import('./components/StudentTestimonials').then((m: any) => ({
    default: m.StudentTestimonials || m.default,
  }))
);
const SupportModal = lazy(() =>
  import('./components/SupportModal').then((m: any) => ({
    default: m.SupportModal || m.default,
  }))
);
const LegalModals = lazy(() =>
  import('./components/LegalModals').then((m: any) => ({
    default: m.LegalModals || m.default,
  }))
);
const CommandPalette = lazy(() =>
  import('./components/CommandPalette').then((m: any) => ({
    default: m.CommandPalette || m.default,
  }))
);


const LoadingFallback: React.FC = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-sky-400 animate-spin" />
    <span className="text-xs font-semibold text-slate-400">Loading module...</span>
  </div>
);


export const TOOLS_CONFIG: ToolMeta[] = [
  {
    id: 'tg-allotments',
    name: 'TG EAPCET 2026 Final Phase Seat Allotments Name Wise',
    shortName: 'TG Allotments 2026',
    category: 'counselling',
    description: 'Official student allotment registers, category closing cutoffs, and real admission analytics',
    badge: '2026 Final Phase',
  },
  {
    id: 'eapcet-radar',
    name: 'AP EAPCET Phase 2 Vacancy Radar',
    shortName: 'EAPCET Phase 2',
    category: 'counselling',
    description: 'Live AP EAPCET Phase 2 leftover seats, college matrices & official branch fee schedules',
    badge: 'Phase 2 Live',
  },
  {
    id: 'projects',
    name: 'Campus Placement Major Projects Hub',
    shortName: 'Major Projects',
    category: 'academic',
    description: '15+ high-impact resume projects with architectural diagrams: Distributed URL shortener, Blockchain, Mini OS, ER Triage',
    badge: '⭐ 15+ Projects',
  },
  {
    id: 'internships',
    name: 'Verified Student Internships Radar',
    shortName: 'Internships Radar',
    category: 'academic',
    description: '100% verified non-scam internships: AICTE Portal, Google Summer of Code, DRDO/ISRO Trainees, LFX Mentorship',
    badge: '💼 Verified',
  },
  {
    id: 'roadmaps',
    name: 'Engineering Branch Roadmaps',
    shortName: 'Branch Roadmaps',
    category: 'counselling',
    description: '4-year semester-by-semester blueprints, software, projects & PDF exports for 24 counseling branches',
    badge: '24 Branches',
  },
  {
    id: 'scholarships',
    name: 'Scholarships Radar',
    shortName: 'Scholarships Radar',
    category: 'academic',
    description: 'Verified 2026 national, state & corporate scholarships with direct official apply links',
    badge: '22+ Live',
  },
  {
    id: 'pdf-tools',
    name: '30+ PDF Power Tools',
    shortName: '30+ PDF Tools',
    category: 'document',
    description: 'Zero-server WebAssembly PDF merge, split, compress, watermark, redact & convert',
    badge: '30 Tools',
  },
  {
    id: 'resume-checker',
    name: 'ATS Resume Matcher',
    shortName: 'ATS Matcher',
    category: 'document',
    description: 'Direct PDF/DOCX parsing, ATS diagnostics & 1-click builder',
    badge: 'Career • ATS',
  },
  {
    id: 'resizer',
    name: 'Exam Image Resizer',
    shortName: 'Image Resizer',
    category: 'document',
    description: 'Client-side photo/signature compression to exact 20KB–500KB',
    badge: 'Exact KB',
  },
  {
    id: 'attendance',
    name: 'Attendance Defender',
    shortName: 'Attendance',
    category: 'academic',
    description: 'Smart bunk & recovery margin calculator with 75% thresholds',
    badge: 'Academic 01',
  },
  {
    id: 'gpa',
    name: 'Global GPA Hub',
    shortName: 'GPA Hub',
    category: 'academic',
    description: 'VTU/AICTE percentage converter & future SGPA goal predictor',
    badge: 'Academic 02',
  },
  {
    id: 'internal-calc',
    name: 'Internal Cutoff Estimator',
    shortName: 'Internal Calc',
    category: 'academic',
    description: '80:20 mid evaluation & external semester target marks finder',
    badge: 'Academic 03',
  },
  {
    id: 'humanizer',
    name: 'AI Text Humanizer',
    shortName: 'AI Humanizer',
    category: 'writing',
    description: 'Real-feel AI pattern scanner & natural conversational rewriter',
    badge: 'AI Scanner',
  },
  {
    id: 'essentials',
    name: 'Student Essentials & Academic Gear Store',
    shortName: 'Student Gear',
    category: 'academic',
    description: 'Verified scientific calculators, coding laptops, PYQs, and study gear with direct Amazon links',
    badge: 'Amazon Store',
  },
];

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceView>('hub');
  const [utilitySubTab, setUtilitySubTab] = useState<ToolTab>('pdf-tools');
  const [eapcetPhase, setEapcetPhase] = useState<EapcetPhaseTab>('phase2');
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [targetRoadmapBranchId, setTargetRoadmapBranchId] = useState<string | undefined>(undefined);
  const [gpaSubTab, setGpaSubTab] = useState<'gpa' | 'internal'>('gpa');
  const [academicSubTab, setAcademicSubTab] = useState<'attendance' | 'gpa' | 'internal'>('attendance');

  const supportEmail = 'support.jamord@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Global Ctrl/Cmd + K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync activeWorkspace with URL hash for bookmarking and history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (
        hash === 'tg-allotments' ||
        hash === 'tg-allotment' ||
        hash === 'tg-cutoff' ||
        hash === 'tg-eapcet' ||
        hash === 'tgeapcet' ||
        hash.startsWith('tg-') ||
        hash.startsWith('tg_')
      ) {
        setActiveWorkspace('tg-allotments');
      } else if (
        hash === 'eapcet-radar' ||
        hash === 'eapcet' ||
        hash === 'phase1' ||
        hash === 'phase2' ||
        hash === 'radar' ||
        hash === 'vacancy' ||
        hash === 'predictor'
      ) {
        setActiveWorkspace('eapcet');
        setEapcetPhase('phase2');
      } else if (hash.startsWith('roadmap') || hash === 'curriculum' || hash === 'branch') {
        setActiveWorkspace('roadmaps');
      } else if (hash === 'projects' || hash === 'major-projects' || hash === 'majorprojects') {
        setActiveWorkspace('projects');
      } else if (hash === 'internships' || hash === 'internship' || hash === 'internships-radar') {
        setActiveWorkspace('internships');
      } else if (hash === 'scholarships' || hash === 'scholarship') {
        setActiveWorkspace('scholarships');
      } else if (hash === 'vault' || hash === 'code-vault' || hash === 'viva' || hash === 'compiler' || hash === 'code' || hash === 'codestudio') {
        setActiveWorkspace('vault');
      } else if (hash === 'backlog' || hash === 'backlogs' || hash === 'backlog-planner') {
        setActiveWorkspace('backlog');
      } else if (hash === 'dsa' || hash === 'tracker' || hash === 'placement') {
        setActiveWorkspace('dsa');
      } else if (hash === 'attendance' || hash === 'bunk' || hash === 'bunk-planner') {
        setActiveWorkspace('attendance');
      } else if (hash === 'gpa' || hash === 'cgpa' || hash === 'sgpa' || hash === 'gpa-hub') {
        setActiveWorkspace('gpa');
      } else if (hash === 'internal' || hash === 'internal-calc') {
        setActiveWorkspace('gpa');
        setGpaSubTab('internal');
      } else if (hash === 'academics') {
        setActiveWorkspace('academics');
      } else if (
        hash === 'essentials' ||
        hash === 'store' ||
        hash === 'gear' ||
        hash === 'academic-store' ||
        hash === 'student-gear'
      ) {
        setActiveWorkspace('essentials');
      } else if (
        hash === 'utilities' ||
        hash === 'pdf-tools' ||
        hash === 'pdf' ||
        hash === 'resizer' ||
        hash === 'resume-checker'
      ) {
        setActiveWorkspace('utilities');
        if (hash === 'resizer') setUtilitySubTab('resizer');
        else if (hash === 'resume-checker') setUtilitySubTab('resume-checker');
        else setUtilitySubTab('pdf-tools');
      } else if (hash === 'guides' || hash === 'editorial' || hash === 'survival' || hash.startsWith('guide-')) {
        setActiveWorkspace('guides');
      } else if (hash === 'privacy' || hash === 'privacy-policy') {
        setLegalModal('privacy');
      } else if (hash === 'about' || hash === 'about-us') {
        setLegalModal('about');
      } else if (hash === 'disclaimer') {
        setLegalModal('disclaimer');
      } else if (hash === 'contact' || hash === 'contact-us') {
        setLegalModal('contact');
      } else if (hash === 'terms') {
        setLegalModal('terms');
      } else if (hash === 'hub' || hash === '') {
        setActiveWorkspace('hub');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic Workspace Switcher Handler
  const handleSelectWorkspace = (ws: WorkspaceView, targetSubTab?: ToolTab) => {
    setActiveWorkspace(ws);
    if (targetSubTab) {
      setUtilitySubTab(targetSubTab);
    }
    if (ws === 'hub') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.location.hash = ws;
    }
    // Smooth scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEapcetPhase = () => {
    setEapcetPhase('phase2');
    handleSelectWorkspace('eapcet');
  };

  const handleSelectToolFromPalette = (tab: ToolTab) => {
    setIsCommandPaletteOpen(false);
    if (tab === 'eapcet-radar') {
      handleSelectWorkspace('eapcet');
    } else if (tab === 'tg-allotments') {
      handleSelectWorkspace('tg-allotments');
    } else if (tab === 'roadmaps') {
      handleSelectWorkspace('roadmaps');
    } else if (tab === 'scholarships') {
      handleSelectWorkspace('scholarships');
    } else if (tab === 'vault' || tab === 'compiler') {
      handleSelectWorkspace('vault');
    } else if (tab === 'backlog') {
      handleSelectWorkspace('backlog');
    } else if (tab === 'attendance') {
      handleSelectWorkspace('attendance');
    } else if (tab === 'essentials' || tab === 'store') {
      handleSelectWorkspace('essentials');
    } else if (tab === 'gpa' || tab === 'internal-calc') {
      handleSelectWorkspace('gpa');
      if (tab === 'internal-calc') setGpaSubTab('internal');
      else setGpaSubTab('gpa');
    } else {
      handleSelectWorkspace('utilities', tab);
    }
  };

  const handleSelectBranchRoadmapFromPalette = (branchId: string) => {
    setTargetRoadmapBranchId(branchId);
    handleSelectWorkspace('roadmaps');
    setIsCommandPaletteOpen(false);
  };

  // Workspace Titles & Details for Sticky Breadcrumbs
  const getWorkspaceDetails = () => {
    switch (activeWorkspace) {
      case 'attendance':
        return {
          title: 'Attendance Defender & Bunk Planner (75% Criteria)',
          icon: <ShieldCheck className="w-4 h-4 text-rose-500" />,
        };
      case 'gpa':
        return {
          title: 'GPA Hub & Internal Marks Cutoff Calculator',
          icon: <Award className="w-4 h-4 text-blue-500" />,
        };
      case 'academics':
        return {
          title: 'Daily Academic Suite: Attendance & GPA Calculators',
          icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
        };
      case 'eapcet':
        return {
          title: 'AP EAPCET Phase 2 Vacancy Radar & Fees',
          icon: <Flame className="w-4 h-4 text-rose-500" />,
        };
      case 'tg-allotments':
        return {
          title: 'TG EAPCET 2026 Final Phase Allotment & Cutoff Radar',
          icon: <Award className="w-4 h-4 text-indigo-500" />,
        };
      case 'roadmaps':
        return {
          title: '24-Branch Engineering Career & Placement Roadmaps',
          icon: <Compass className="w-4 h-4 text-indigo-500" />,
        };
      case 'scholarships':
        return {
          title: 'Verified 2026 Scholarships Hub (School to B.Tech)',
          icon: <GraduationCap className="w-4 h-4 text-emerald-500" />,
        };
      case 'utilities':
        return {
          title: 'Private Client-Side PDF Tools & 20KB Resizer',
          icon: <FileText className="w-4 h-4 text-sky-500" />,
        };
      case 'dsa':
        return {
          title: 'DSA & Coding Placement Tracker',
          icon: <Code2 className="w-4 h-4 text-purple-500" />,
        };
      case 'vault':
        return {
          title: 'Placement Viva Flashcards & Practical Code Vault',
          icon: <Terminal className="w-4 h-4 text-emerald-500" />,
        };
      case 'backlog':
        return {
          title: 'Smart Backlog Recovery Planner (Pass Cutoffs & 30-Day Strategy)',
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
        };
      case 'guides':
        return {
          title: 'Student & Tier-3 Survival Editorial Hub (8 Chapters)',
          icon: <BookOpen className="w-4 h-4 text-sky-500" />,
        };
      case 'essentials':
      case 'store':
        return {
          title: 'Verified Student Essentials & Academic Gear Store',
          icon: <ShoppingBag className="w-4 h-4 text-amber-500" />,
        };
      default:
        return {
          title: 'MAN OF STUDY Feature Hub',
          icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        };
    }
  };

  const currentDetails = getWorkspaceDetails();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 tech-grid-pattern-light flex flex-col justify-between transition-colors duration-200">
      {/* 1. Modern Streamlined Header (Zero Clutter, No Secondary Ribbon) */}
      <Header
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={(ws) => handleSelectWorkspace(ws)}
        onSelectEapcetPhase={handleSelectEapcetPhase}
        onOpenLegal={(type) => setLegalModal(type)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 flex-1 w-full max-w-full overflow-hidden">
        
        {/* WHEN ON FEATURE HUB: Clean, Modern Landing Experience */}
        {activeWorkspace === 'hub' ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Dynamic Feature Selector Hero & Bento Cards Showcase */}
            <HeroSection
              activeWorkspace={activeWorkspace}
              onSelectWorkspace={(ws) => handleSelectWorkspace(ws)}
            />

            <Suspense fallback={<LoadingFallback />}>
              {/* High-Trust Reviews: Continuous Horizontal Marquee Carousel */}
              <StudentTestimonials />

              {/* Authoritative 8-Chapter Student & Tier-3 Survival Editorial Hub */}
              <div className="content-visibility-auto">
                <GuidesHub
                  onSelectWorkspace={(ws) => handleSelectWorkspace(ws as WorkspaceView)}
                />
              </div>

              {/* Educational Guides & Transparent Methodology Documentation */}
              <div className="content-visibility-auto">
                <EducationalGuideAndSeo />
              </div>

              {/* Comprehensive Expandable Student FAQ */}
              <div className="content-visibility-auto">
                <StudentFaq
                  onSelectTab={(tab) => {
                    if (tab === 'eapcet-radar') handleSelectWorkspace('eapcet');
                    else if (tab === 'roadmaps') handleSelectWorkspace('roadmaps');
                    else if (tab === 'scholarships') handleSelectWorkspace('scholarships');
                    else handleSelectWorkspace('utilities', tab);
                  }}
                  onOpenLegal={(type) => setLegalModal(type)}
                />
              </div>
            </Suspense>
          </div>
        ) : (
          /* WHEN IN AN ACTIVE WORKSPACE: Focused, Single-Tool Workspace View */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Breadcrumb Navigation Header in Normal Document Flow */}
            <div className="relative w-full mb-4 px-4 py-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSelectWorkspace('hub')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs group shrink-0 self-start sm:self-auto"
                title="Return to MAN OF STUDY Feature Hub"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>← Back to Feature Hub</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-hidden">
                <span className="hidden sm:inline">Workspace</span>
                <span className="hidden sm:inline">/</span>
                <span className="text-slate-900 font-bold flex items-center gap-1.5 truncate">
                  {currentDetails.icon}
                  <span className="truncate">{currentDetails.title}</span>
                </span>
              </div>
            </div>

            {/* Specific Workspace Views */}
            <section id="workspace-viewport" className="relative min-h-[500px]">
              <Suspense fallback={<LoadingFallback />}>
                {activeWorkspace === 'attendance' && (
                  <AttendanceDefender />
                )}

                {activeWorkspace === 'gpa' && (
                  <div className="space-y-6">
                    {/* Dedicated GPA & Internal Exam Marks Estimator Switcher */}
                    <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-xs flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGpaSubTab('gpa')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gpaSubTab === 'gpa'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        <span>SGPA / CGPA Converter &amp; Future Predictor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGpaSubTab('internal')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gpaSubTab === 'internal'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Internal Marks &amp; External Cutoff Estimator</span>
                      </button>
                    </div>

                    {gpaSubTab === 'gpa' ? (
                      <GlobalGpaHub onNavigateToStore={() => handleSelectWorkspace('essentials')} />
                    ) : (
                      <InternalExamEstimator onNavigateToStore={() => handleSelectWorkspace('essentials')} />
                    )}
                  </div>
                )}

                {activeWorkspace === 'academics' && (
                  <div className="space-y-6">
                    {/* Daily Academic Tools Tab Switcher */}
                    <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-xs flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAcademicSubTab('attendance')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          academicSubTab === 'attendance'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Attendance Defender &amp; Bunk Planner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcademicSubTab('gpa')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          academicSubTab === 'gpa'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        <span>SGPA / CGPA Converter</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcademicSubTab('internal')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          academicSubTab === 'internal'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Internal Marks Cutoff</span>
                      </button>
                    </div>

                    {academicSubTab === 'attendance' && <AttendanceDefender />}
                    {academicSubTab === 'gpa' && (
                      <GlobalGpaHub onNavigateToStore={() => handleSelectWorkspace('essentials')} />
                    )}
                    {academicSubTab === 'internal' && (
                      <InternalExamEstimator onNavigateToStore={() => handleSelectWorkspace('essentials')} />
                    )}
                  </div>
                )}

                {activeWorkspace === 'eapcet' && (
                  <ApEapcetRadar initialTab={eapcetPhase} />
                )}

                {activeWorkspace === 'tg-allotments' && (
                  <TgAllotmentExplorer />
                )}

                {activeWorkspace === 'roadmaps' && (
                  <EngineeringRoadmaps
                    targetBranchId={targetRoadmapBranchId}
                    onSelectBranch={(branchId) => setTargetRoadmapBranchId(branchId)}
                    onNavigateToStore={() => handleSelectWorkspace('essentials')}
                  />
                )}

                {activeWorkspace === 'projects' && (
                  <MajorProjectsHub />
                )}

                {activeWorkspace === 'internships' && (
                  <InternshipsRadar />
                )}

                {activeWorkspace === 'scholarships' && (
                  <ScholarshipsHub />
                )}

                {activeWorkspace === 'dsa' && (
                  <DsaPlacementTracker
                    onOpenCompilerWithProblem={() => {
                      handleSelectWorkspace('vault');
                    }}
                  />
                )}

                {activeWorkspace === 'vault' && (
                  <PlacementCodeVault />
                )}

                {activeWorkspace === 'backlog' && (
                  <BacklogPlanner />
                )}

                {activeWorkspace === 'guides' && (
                  <GuidesHub
                    onSelectWorkspace={(ws) => handleSelectWorkspace(ws as WorkspaceView)}
                  />
                )}

                {(activeWorkspace === 'essentials' || activeWorkspace === 'store') && (
                  <StudentEssentialsStore
                    onNavigateToRoadmaps={() => handleSelectWorkspace('roadmaps')}
                  />
                )}

                {activeWorkspace === 'utilities' && (
                  <div className="space-y-6">
                    {/* Utility Sub-Tab Switcher */}
                    <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
                        {[
                          { id: 'pdf-tools' as ToolTab, label: '30+ PDF Tools', icon: FileText },
                          { id: 'vault' as ToolTab, label: 'Code & Viva Vault', icon: Terminal },
                          { id: 'resizer' as ToolTab, label: '20KB Image Resizer', icon: ImageIcon },
                          { id: 'resume-checker' as ToolTab, label: 'ATS Resume Matcher', icon: FileCheck },
                          { id: 'gpa' as ToolTab, label: 'Global GPA Hub', icon: Award },
                          { id: 'internal-calc' as ToolTab, label: 'Internal Cutoff', icon: Calculator },
                          { id: 'attendance' as ToolTab, label: 'Attendance Defender', icon: ShieldCheck },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isSubActive = utilitySubTab === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setUtilitySubTab(item.id)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sub-Utility Component View */}
                    <div>
                      {utilitySubTab === 'vault' && <PlacementCodeVault />}
                      {utilitySubTab === 'pdf-tools' && <PdfPowerTools />}
                      {utilitySubTab === 'resizer' && <ImageResizer />}
                      {utilitySubTab === 'resume-checker' && <AtsResumeMatcher />}
                      {utilitySubTab === 'gpa' && (
                        <GlobalGpaHub onNavigateToStore={() => handleSelectWorkspace('essentials')} />
                      )}
                      {utilitySubTab === 'internal-calc' && (
                        <InternalExamEstimator onNavigateToStore={() => handleSelectWorkspace('essentials')} />
                      )}
                      {utilitySubTab === 'attendance' && <AttendanceDefender />}
                    </div>
                  </div>
                )}
              </Suspense>
            </section>
          </div>
        )}
      </main>

      {/* Respectful Open-Source & Student Dedication Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-center shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-left">
              MAN OF STUDY — 100% Free &amp; Open-Source Educational Tooling for Students.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Zero Ads • Zero Data Collection • Direct Student Access</span>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive AdSense-Ready Footer */}
      <footer
        id="app-footer"
        className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-16 shadow-xs w-full max-w-full overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-9">
          {/* Identity & Support Email Desk */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-slate-700/60 bg-slate-900 flex items-center justify-center p-0.5 shrink-0">
                  <img 
                    src="https://i.ibb.co/zHPk2tv4/Chat-GPT-Image-Sep-13-2026-08-04-48-PM.png" 
                    alt="MAN OF STUDY Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <a
                  href="https://manofstudy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  MAN OF <span className="text-emerald-600 dark:text-emerald-400">STUDY</span>
                </a>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  VERIFIED STUDENT PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The Definitive Engineering &amp; Academic Launchpad for Pan-Indian Students. Providing verified TG/AP EAPCET leftover seat matrices and candidate allotments, national and corporate scholarship alerts, and 100% private in-browser document tools.
              </p>
            </div>

            {/* Official Support Email Desk */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 block tracking-wider">
                    Official Support &amp; Enquiries
                  </span>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors font-mono"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
                {/* High-visibility heart-themed Support Button in Footer */}
                <button
                  type="button"
                  id="footer-support-btn"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-semibold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Support the Developer / Keep MAN OF STUDY Free"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                  <span>☕ Support MOS</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy support email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModal('contact')}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-sky-600 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Contact Desk
                </button>
              </div>
            </div>
          </div>

          {/* 4-Column Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
            {/* Column 1: AP EAPCET Vacancies & Leftover Seats */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-rose-600" />
                AP EAPCET &amp; Admissions
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectEapcetPhase()}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400"
                  >
                    <span>🔥 Phase 2 Left Over Seats Matrix</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectEapcetPhase()}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer"
                  >
                    Top Engineering Colleges &amp; Fee Schedules
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectEapcetPhase()}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer"
                  >
                    Category Quota Guidance (OC/BC/SC/ST/EWS)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('roadmaps')}
                    className="hover:text-indigo-600 transition-colors text-left cursor-pointer font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5"
                  >
                    <span>🧭 24 Branch Career Roadmaps (4-Year Action Plans)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Free Utilities & Student Tools */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                Free Utilities &amp; Student Tools
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('utilities', 'pdf-tools')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    30+ WebAssembly PDF Tools (Merge, Split, Watermark)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('utilities', 'resizer')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Exam Image &amp; Signature Resizer (20KB–50KB)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('utilities', 'resume-checker')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    ATS Resume Keyword Matcher &amp; 1-Click Builder
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('utilities', 'attendance')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Attendance Defender (75% Minimum Rule Calculator)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('dsa')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer font-semibold text-purple-600"
                  >
                    DSA &amp; Placement Problem Tracker
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('compiler')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer font-semibold text-teal-600"
                  >
                    CodeStudio Multi-Language Compiler &amp; Sandbox
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Scholarships & Government Schemes */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Scholarships &amp; Grants
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer font-medium text-slate-800 dark:text-slate-200"
                  >
                    Reliance Foundation UG (₹2 Lakhs Grant)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    HDFC Bank Parivartan ECSS Support
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    LIC Golden Jubilee Scholarship Programme
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    Kotak Kanya Scholarship for Girl Engineers
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    AICTE Pragati &amp; Saksham Schemes (NSP)
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal, Compliance & Community */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                Legal &amp; Compliance
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('guides')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400"
                  >
                    <span>📖 Editorial Hub (8 Chapters)</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('about')}
                    className="hover:text-emerald-600 transition-colors text-left cursor-pointer"
                  >
                    About MAN OF STUDY
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="hover:text-emerald-600 transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy (100% In-Memory)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="hover:text-emerald-600 transition-colors text-left cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('disclaimer')}
                    className="hover:text-emerald-600 transition-colors text-left cursor-pointer"
                  >
                    Legal Disclaimers &amp; Attribution
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('contact')}
                    className="hover:text-emerald-600 transition-colors text-left cursor-pointer"
                  >
                    Contact Grievance Officer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsSupportModalOpen(true)}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                    <span>☕ Support MOS (Donation)</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectWorkspace('hub');
                      setTimeout(() => {
                        const el = document.getElementById('student-faq-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <span>❓ Student FAQs &amp; Knowledge Base</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectWorkspace('hub');
                      setTimeout(() => {
                        const el = document.getElementById('student-testimonials-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⭐ Student Reviews &amp; Feedback</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Prominent Legal Disclaimer & Safe Harbor Protection Zone */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/50 text-amber-950 dark:text-amber-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="uppercase tracking-wider">Independent Platform &amp; Legal Safe Harbor</span>
              </div>
              <button
                type="button"
                onClick={() => setLegalModal('disclaimer')}
                className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 underline cursor-pointer"
              >
                Read Full Disclosures →
              </button>
            </div>
            <p className="text-xs text-amber-900/90 dark:text-amber-200/80 leading-relaxed">
              <strong>Disclaimer:</strong> MAN OF STUDY is an independent informational and utility platform. TG/AP EAPCET data, college vacancy counts, and scholarship listings are aggregated from publicly available official portals for educational guidance only. MAN OF STUDY is <strong>NOT affiliated with APSCHE, TSCHE, APCFSS, National Scholarship Portal (NSP), or any government body</strong>. Official cutoffs, deadlines, and seat allotments are subject to change by respective authorities. Users must verify all critical details on official government portals.
            </p>
          </div>

          {/* Bottom Copyright & Security Statement */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% In-Memory Sandbox • No Personal Files or Resumes Stored on Remote Servers</span>
            </div>
            <div>
              <span>© 2026 </span>
              <a
                href="https://manofstudy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-800 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                MAN OF STUDY
              </a>
              <span> Platform. Official Support: </span>
              <a href={`mailto:${supportEmail}`} className="font-mono text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-semibold">
                {supportEmail}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 6. Legal & Contact Modal */}
      {legalModal && (
        <Suspense fallback={null}>
          <LegalModals
            type={legalModal}
            onClose={() => setLegalModal(null)}
            onSwitchType={(type) => setLegalModal(type)}
          />
        </Suspense>
      )}

      {/* Support & Keep MAN OF STUDY Free Modal */}
      {isSupportModalOpen && (
        <Suspense fallback={null}>
          <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setIsSupportModalOpen(false)}
          />
        </Suspense>
      )}

      {/* 7. Global Command Palette (Ctrl/Cmd + K) */}
      {isCommandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onSelectTool={handleSelectToolFromPalette}
            onSelectBranchRoadmap={handleSelectBranchRoadmapFromPalette}
            onOpenSupport={() => setIsSupportModalOpen(true)}
          />
        </Suspense>
      )}

    </div>
  );
}
