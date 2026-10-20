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
  ShoppingBag,
  Heart,
  BookOpen,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { ToolTab, ToolMeta, WorkspaceView, LegalModalType } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';
import { LegalModals } from './components/LegalModals';
import { LegalPage, type StandaloneLegalPageType } from './components/LegalPage';
import { EducationalGuideAndSeo } from './components/EducationalGuideAndSeo';
import type { EapcetPhaseTab } from './components/ApEapcetRadar';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { GuidesHub } from './components/GuidesHub';
import { SeoLandingPage } from './components/SeoLandingPage';
import { BlogPage, isBlogPath } from './components/BlogPage';
import { useAuth } from './context/AuthContext';
import { AutonomousCollegesDirectory } from './components/AutonomousCollegesDirectory';
import { RoadmapFullPage } from './components/RoadmapFullPage';

// Resilient dynamic code splitting with retry logic for network or stale bundle resilience
const lazyWithRetry = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>,
  retries = 2
): React.LazyExoticComponent<T> => {
  return lazy(async () => {
    let lastError: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const m = await factory();
        return { default: m.default || m[Object.keys(m)[0]] };
      } catch (err: any) {
        lastError = err;
        console.warn(`[LazyRetry] Dynamic chunk import failed (attempt ${attempt + 1}/${retries + 1}):`, err);
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        }
      }
    }
    const isModuleError =
      lastError?.message?.includes('dynamically imported module') ||
      lastError?.message?.includes('Failed to fetch') ||
      lastError?.name === 'TypeError';

    if (isModuleError && typeof window !== 'undefined') {
      const reloadKey = 'mos_chunk_reload_' + window.location.pathname;
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
      }
    }
    throw lastError;
  });
};

const ScholarshipsHub = lazyWithRetry(() =>
  import('./components/ScholarshipsHub').then((m: any) => ({
    default: m.ScholarshipsHub || m.default,
  }))
);
const EngineeringRoadmaps = lazyWithRetry(() =>
  import('./components/EngineeringRoadmaps').then((m: any) => ({
    default: m.EngineeringRoadmaps || m.default,
  }))
);
const ApEapcetRadar = lazyWithRetry(() =>
  import('./components/ApEapcetRadar').then((m: any) => ({
    default: m.ApEapcetRadar || m.default,
  }))
);
const ApCollegePredictor = lazyWithRetry(() =>
  import('./components/ApCollegePredictor').then((m: any) => ({
    default: m.ApCollegePredictor || m.default,
  }))
);
const ApTopColleges = lazyWithRetry(() => import('./components/ApTopColleges'));
const ApEapcetRankPredictor = lazyWithRetry(() => import('./components/ApEapcetRankPredictor'));
const ApEapcet2025AllotmentExplorer = lazyWithRetry(() =>
  import('./components/ApEapcet2025AllotmentExplorer').then((m: any) => ({
    default: m.ApEapcet2025AllotmentExplorer || m.default,
  }))
);
const TgAllotmentExplorer = lazyWithRetry(() =>
  import('./components/TgAllotmentExplorer').then((m: any) => ({
    default: m.TgAllotmentExplorer || m.default,
  }))
);
const TgTopColleges = lazyWithRetry(() =>
  import('./components/TgTopColleges').then((m: any) => ({
    default: m.TgTopColleges || m.default,
  }))
);
const TgCollegePredictor = lazyWithRetry(() =>
  import('./components/TgCollegePredictor').then((m: any) => ({
    default: m.TgCollegePredictor || m.default,
  }))
);
const AttendanceDefender = lazyWithRetry(() =>
  import('./components/AttendanceDefender').then((m: any) => ({
    default: m.AttendanceDefender || m.default,
  }))
);
const GlobalGpaHub = lazyWithRetry(() =>
  import('./components/GlobalGpaHub').then((m: any) => ({
    default: m.GlobalGpaHub || m.default,
  }))
);
const InternalExamEstimator = lazyWithRetry(() =>
  import('./components/InternalExamEstimator').then((m: any) => ({
    default: m.InternalExamEstimator || m.default,
  }))
);
const PdfPowerTools = lazyWithRetry(() =>
  import('./components/PdfPowerTools').then((m: any) => ({
    default: m.PdfPowerTools || m.default,
  }))
);
const ImageResizer = lazyWithRetry(() =>
  import('./components/ImageResizer').then((m: any) => ({
    default: m.ImageResizer || m.default,
  }))
);
const PlacementCodeVault = lazyWithRetry(() =>
  import('./components/PlacementCodeVault').then((m: any) => ({
    default: m.PlacementCodeVault || m.default,
  }))
);
const BacklogPlanner = lazyWithRetry(() =>
  import('./components/BacklogPlanner').then((m: any) => ({
    default: m.BacklogPlanner || m.default,
  }))
);
const DsaPlacementTracker = lazyWithRetry(() =>
  import('./components/DsaPlacementTracker').then((m: any) => ({
    default: m.DsaPlacementTracker || m.default,
  }))
);
const StudentEssentialsStore = lazyWithRetry(() =>
  import('./components/StudentEssentialsStore').then((m: any) => ({
    default: m.StudentEssentialsStore || m.default,
  }))
);
const MajorProjectsHub = lazyWithRetry(() =>
  import('./components/MajorProjectsHub').then((m: any) => ({
    default: m.MajorProjectsHub || m.default,
  }))
);
const InternshipsRadar = lazyWithRetry(() =>
  import('./components/InternshipsRadar').then((m: any) => ({
    default: m.InternshipsRadar || m.default,
  }))
);
const StudentGapAnalyzer = lazyWithRetry(() =>
  import('./components/StudentGapAnalyzer/StudentGapAnalyzer').then((m: any) => ({
    default: m.StudentGapAnalyzer || m.default,
  }))
);
const StudentTestimonials = lazyWithRetry(() =>
  import('./components/StudentTestimonials').then((m: any) => ({
    default: m.StudentTestimonials || m.default,
  }))
);
const CbtMockTestEngine = lazyWithRetry(() =>
  import('./components/CbtMockTestEngine').then((m: any) => ({
    default: m.CbtMockTestEngine || m.default,
  }))
);
const EapcetCbtMockTestEngine = lazyWithRetry(() =>
  import('./components/EapcetCbtMockTestEngine').then((m: any) => ({
    default: m.EapcetCbtMockTestEngine || m.default,
  }))
);
const MockTestSeriesHub = lazyWithRetry(() =>
  import('./components/MockTestSeriesHub').then((m: any) => ({
    default: m.MockTestSeriesHub || m.default,
  }))
);
const SupportModal = lazyWithRetry(() =>
  import('./components/SupportModal').then((m: any) => ({
    default: m.SupportModal || m.default,
  }))
);
const CommandPalette = lazyWithRetry(() =>
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
    id: 'gap-analyzer',
    name: 'AI Student Gap Analyzer',
    shortName: 'AI Gap Analyzer',
    category: 'academic',
    description: 'Understand where you are, identify your skill gaps, and see what to work on next.',
    badge: 'AI Tool',
  },
  {
    id: 'tg-top-colleges',
    name: 'Top B.Tech Colleges in Telangana',
    shortName: 'Top Colleges',
    category: 'counselling',
    description: 'Data-driven college rankings based on valid OC allotment ranks for every engineering branch.',
    badge: 'OC Rankings',
  },
  {
    id: 'tg-predictor',
    name: 'TG EAPCET College Predictor',
    shortName: 'TG Predictor',
    category: 'counselling',
    description: 'Explore historical allotment data to find colleges matching your rank and preferences.',
    badge: 'Admissions',
  },
  {
    id: 'tg-allotments',
    name: 'TG EAPCET 2026 Final Phase Seat Allotments Name Wise',
    shortName: 'TG Allotments 2026',
    category: 'counselling',
    description: 'Search official candidate registers, category cutoffs, and seat distribution across 151 colleges.',
    badge: 'Admissions',
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
    id: 'ap-predictor',
    name: 'AP EAPCET 2026 College Intelligence & Predictor',
    shortName: 'AP Predictor 2026',
    category: 'counselling',
    description: 'Match AP EAPCET 2026 allotment records deterministically by rank, category, gender, region and branch.',
    badge: 'AI Intelligence',
  },
  {
    id: 'ap-rank-predictor',
    name: 'AP EAPCET Rank Predictor',
    shortName: 'AP Rank Predictor',
    category: 'counselling',
    description: 'Estimate an AP EAPCET engineering rank range from subject and board marks using the supplied 75:25 weighting and anchor interpolation.',
    badge: 'Rank Estimate',
  },
  {
    id: 'ap-top-colleges',
    name: 'AP EAPCET Top B.Tech Colleges',
    shortName: 'AP Top Colleges',
    category: 'counselling',
    description: 'Explore branch-wise observed 2026 allotment rank patterns using a consistent OC reference group.',
    badge: '2026 DATA',
  },
  {
    id: 'ap-allotments',
    name: 'AP EAPCET 2026 College-Wise Allotments',
    shortName: 'AP EAPCET Allotments',
    category: 'counselling',
    description: 'Search student allotments, explore colleges and branches, and inspect observed category-wise rank ranges.',
    badge: '2026 DATA',
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
    name: 'Student Internship Resources',
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
    name: 'free pdf tools for students',
    shortName: 'free pdf tools for students',
    category: 'document',
    description: 'Student PDF utilities for merging, splitting, and converting documents. Most file operations run in your browser.',
    badge: '100% Free',
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
    id: 'essentials',
    name: 'Student Essentials & Academic Gear Store',
    shortName: 'Student Gear',
    category: 'academic',
    description: 'Verified scientific calculators, coding laptops, PYQs, and study gear with direct Amazon links',
    badge: 'Amazon Store',
  },
];

const SEO_LANDING_PATHS = {
  apAllotments: '/ap-eapcet/college-wise-allotments/',
  tgAllotments: '/tg-eapcet/name-wise-allotments/',
  apPredictor: '/ap-eapcet/college-predictor/',
  tgPredictor: '/tg-eapcet/college-predictor/',
  attendanceCalculator: '/tools/attendance-calculator/',
  gpaCalculator: '/tools/gpa-calculator/',
  roadmaps: '/engineering-roadmaps/',
} as const;

const getRoadmapDetailId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.replace(/\/+$/, '').match(/^\/engineering-roadmaps\/([^/]+)$/i);
  return match ? match[1].toLowerCase() : null;
};

const getStandaloneLegalPage = (): StandaloneLegalPageType | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  const routes: Record<string, StandaloneLegalPageType> = {
    '/about': 'about', '/about-us': 'about',
    '/contact': 'contact', '/contact-us': 'contact',
    '/privacy': 'privacy', '/privacy-policy': 'privacy',
    '/terms': 'terms', '/terms-of-service': 'terms',
    '/disclaimer': 'disclaimer', '/legal-safe-harbor': 'disclaimer',
  };
  return routes[path] || null;
};

const getSeoLandingPath = () => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === SEO_LANDING_PATHS.apAllotments.replace(/\/+$/, '')) return 'apAllotments' as const;
  if (path === SEO_LANDING_PATHS.tgAllotments.replace(/\/+$/, '')) return 'tgAllotments' as const;
  if (path === SEO_LANDING_PATHS.apPredictor.replace(/\/+$/, '')) return 'apPredictor' as const;
  if (path === SEO_LANDING_PATHS.tgPredictor.replace(/\/+$/, '')) return 'tgPredictor' as const;
  if (path === SEO_LANDING_PATHS.attendanceCalculator.replace(/\/+$/, '')) return 'attendanceCalculator' as const;
  if (path === SEO_LANDING_PATHS.gpaCalculator.replace(/\/+$/, '')) return 'gpaCalculator' as const;
  if (path === SEO_LANDING_PATHS.roadmaps.replace(/\/+$/, '')) return 'roadmaps' as const;
  return null;
};

// Resolve clean pathname URLs directly. The legacy route bridge can remove a
// temporary hash before React effects run, so direct loads must not depend
// exclusively on observing a hashchange event.
const getWorkspaceFromPath = (): WorkspaceView | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  const routes: Record<string, WorkspaceView> = {
    '/ap-eapcet/phase-2-vacancy-radar': 'eapcet',
    '/ap-eapcet/college-wise-allotments': 'ap-allotments',
    '/ap-eapcet/college-predictor': 'ap-predictor',
    '/ap-eapcet/rank-predictor': 'ap-rank-predictor',
    '/ap-eapcet/top-colleges': 'ap-top-colleges',
    '/tg-eapcet/name-wise-allotments': 'tg-allotments',
    '/tg-eapcet/top-colleges': 'tg-top-colleges',
    '/tg-eapcet/college-predictor': 'tg-predictor',
    '/roadmaps': 'roadmaps',
    '/scholarships': 'scholarships',
    '/pdftools': 'utilities',
    '/imagecompressor': 'utilities',
    '/placement-code-vault': 'vault',
    '/backlog-planner': 'backlog',
    '/code-studio': 'compiler',
    '/dsa-placement-tracker': 'dsa',
    '/academics': 'academics',
    '/attendancedefender': 'attendance',
    '/gpa-hub': 'gpa',
    '/student-essentials': 'essentials',
    '/student-store': 'essentials',
    '/study-guides': 'guides',
    '/major-projects': 'projects',
    '/internships': 'internships',
    '/mocktests': 'mock-tests',
    '/mocktest': 'mock-tests',
    '/mock-tests': 'mock-tests',
    '/mock-test': 'cbt-mock-test',
    '/eapcet-mock-test': 'eapcet-cbt',
    '/ai-gap-analyzer': 'gap-analyzer',
  };
  return routes[path] || null;
};

const isUnknownAppPath = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (path === '/' || getSeoLandingPath() || getStandaloneLegalPage() || isBlogPath(path)) return false;
  if (path === '/scholarships' || path.startsWith('/scholarships/')) return false;
  return getWorkspaceFromPath() === null;
};

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceView>(() => {
    const seoPath = getSeoLandingPath();
    if (seoPath === 'apAllotments') return 'ap-allotments';
    if (seoPath === 'tgAllotments') return 'tg-allotments';
    if (seoPath === 'apPredictor') return 'ap-predictor';
    if (seoPath === 'tgPredictor') return 'tg-predictor';
    if (seoPath === 'attendanceCalculator') return 'attendance';
    if (seoPath === 'gpaCalculator') return 'gpa';
    if (seoPath === 'roadmaps') return 'roadmaps';
    const pathWorkspace = getWorkspaceFromPath();
    // Resolve protected destinations after authentication has initialized.
    if (pathWorkspace === 'mock-tests' || pathWorkspace === 'cbt-mock-test' || pathWorkspace === 'eapcet-cbt') return 'hub';
    return pathWorkspace || 'hub';
  });
  const [utilitySubTab, setUtilitySubTab] = useState<ToolTab>(() =>
    typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/imagecompressor'
      ? 'resizer'
      : 'pdf-tools'
  );
  const [eapcetPhase, setEapcetPhase] = useState<EapcetPhaseTab>('phase2');
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [targetRoadmapBranchId, setTargetRoadmapBranchId] = useState<string | undefined>(undefined);
  const [targetAllotmentCollege, setTargetAllotmentCollege] = useState<string>('CBIT');
  const [targetAllotmentBranch, setTargetAllotmentBranch] = useState<string>('');
  const [gpaSubTab, setGpaSubTab] = useState<'gpa' | 'internal'>('gpa');
  const [academicSubTab, setAcademicSubTab] = useState<'attendance' | 'gpa' | 'internal'>('attendance');
  const [eapcetCbtSubTab, setEapcetCbtSubTab] = useState<string>('ap-full');
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [pendingProtectedWorkspace, setPendingProtectedWorkspace] = useState<{
    workspace: WorkspaceView;
    subTab?: string;
  } | null>(null);
  const { user, loading: authLoading, openAuthModal, closeAuthModal } = useAuth();

  // Show one respectful support prompt only after a real search result is produced.
  useEffect(() => {
    const handleToolResultReady = () => {
      try {
        if (sessionStorage.getItem('mos_support_prompt_v1') === 'shown') return;
        sessionStorage.setItem('mos_support_prompt_v1', 'shown');
      } catch {
        // Storage restrictions must never break the application.
      }
      setIsSupportModalOpen(true);
    };

    window.addEventListener('mos:tool-result-ready', handleToolResultReady);
    return () => window.removeEventListener('mos:tool-result-ready', handleToolResultReady);
  }, [user, openAuthModal]);
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
    if (getSeoLandingPath() || authLoading) return;
    const handleHashChange = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      if (!window.location.hash) {
        const pathWorkspace = getWorkspaceFromPath();
        if (pathWorkspace) {
          if (pathWorkspace === 'mock-tests' || pathWorkspace === 'cbt-mock-test' || pathWorkspace === 'eapcet-cbt') {
            if (user) {
              setActiveWorkspace(pathWorkspace);
            } else {
              setPendingProtectedWorkspace({ workspace: pathWorkspace });
              openAuthModal({ type: 'mock-test' });
            }
          } else {
            setActiveWorkspace(pathWorkspace);
            if (pathWorkspace === 'utilities') {
              setUtilitySubTab(pathname.toLowerCase() === '/imagecompressor' ? 'resizer' : 'pdf-tools');
            }
          }
          return;
        }
        if (pathname.startsWith('/scholarships/')) {
          setActiveWorkspace('scholarships');
          return;
        }
      }
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (
        hash === 'tg-predictor' ||
        hash === 'tg-college-predictor' ||
        hash === 'college-predictor' ||
        hash === 'rank-predictor' ||
        hash === 'buffer-radar'
      ) {
        setActiveWorkspace('tg-predictor');
      } else if (
        hash === 'tg-top-colleges' ||
        hash === 'top-colleges' ||
        hash === 'telangana-top-colleges' ||
        hash === 'rankings' ||
        hash === 'top-btech'
      ) {
        setActiveWorkspace('tg-top-colleges');
      } else if (
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
        hash === 'ap-predictor' ||
        hash === 'ap-college-predictor' ||
        hash === 'ap-intelligence' ||
        hash === 'ap-cutoff'
      ) {
        setActiveWorkspace('ap-predictor');
      } else if (
        hash === 'ap-top-colleges' ||
        hash === 'ap-top-btech' ||
        hash === 'ap-rankings'
      ) {
        setActiveWorkspace('ap-top-colleges');
      } else if (
        hash === 'ap-allotments' ||
        hash === 'ap-eapcet-2025' ||
        hash === 'ap-allotment-explorer'
      ) {
        setActiveWorkspace('ap-allotments');
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
        hash === 'image-tools' ||
        hash === 'photo-resizer'
      ) {
        setActiveWorkspace('utilities');
        if (hash === 'resizer' || hash === 'image-tools' || hash === 'photo-resizer') setUtilitySubTab('resizer');
        else setUtilitySubTab('pdf-tools');
      } else if (hash === 'guides' || hash === 'editorial' || hash === 'survival' || hash.startsWith('guide-')) {
        setActiveWorkspace('guides');
      } else if (
        hash === 'gap-analyzer' ||
        hash === 'gap' ||
        hash === 'analyzer' ||
        hash === 'student-gap' ||
        hash === 'career-gap'
      ) {
        setActiveWorkspace('gap-analyzer');
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
      } else if (
        hash === 'mock-test-series' ||
        hash === 'mock-tests' ||
        hash === 'mock-test' ||
        hash === 'test-series' ||
        hash === 'cbt-series'
      ) {
        if (user) {
          setActiveWorkspace('mock-tests');
        } else {
          setPendingProtectedWorkspace({ workspace: 'mock-tests' });
          openAuthModal({ type: 'mock-test' });
        }
      } else if (
        hash === 'eapcet-cbt' ||
        hash === 'ap-cbt' ||
        hash === 'tg-cbt' ||
        hash === 'eapcet-test'
      ) {
        if (user) {
          setActiveWorkspace('eapcet-cbt');
        } else {
          setPendingProtectedWorkspace({ workspace: 'eapcet-cbt' });
          openAuthModal({ type: 'mock-test' });
        }
      } else if (hash === 'hub' || hash === '') {
        setActiveWorkspace('hub');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [authLoading, user, openAuthModal]);

  useEffect(() => {
    const seoPath = getSeoLandingPath();
    if (!seoPath) return;

    const metadata: Record<string, { title: string; description: string; canonical: string }> = {
      apAllotments: {
        title: 'AP EAPCET 2026 College-Wise Allotments | Naa College',
        description: 'Explore AP EAPCET 2026 allotment records by college, branch, rank and available category filters. Review the dataset on Naa College and verify current counselling decisions with the official AP EAPCET portal.',
        canonical: 'https://naacollege.in/ap-eapcet/college-wise-allotments/',
      },
      tgAllotments: {
        title: 'TG EAPCET 2026 Name-Wise Seat Allotments | Naa College',
        description: 'Search Telangana EAPCET 2026 final-phase engineering seat allotment records by student name, hall ticket, college and branch.',
        canonical: 'https://naacollege.in/tg-eapcet/name-wise-allotments/',
      },
      apPredictor: {
        title: 'AP EAPCET College Predictor 2026 | Naa College',
        description: 'Use the AP EAPCET 2026 College Predictor to explore college and branch options based on rank, category, gender, region and preferences.',
        canonical: 'https://naacollege.in/ap-eapcet/college-predictor/',
      },
      tgPredictor: {
        title: 'TG EAPCET College Predictor 2026 | Naa College',
        description: 'Use the Telangana EAPCET 2026 College Predictor to explore college and branch options based on rank, category, gender, branch and preferences.',
        canonical: 'https://naacollege.in/tg-eapcet/college-predictor/',
      },
      attendanceCalculator: {
        title: 'Attendance Calculator & Bunk Planner | Naa College',
        description: 'Calculate your current attendance, estimate how many classes you can miss, and find how many classes you need to attend to reach your target.',
        canonical: 'https://naacollege.in/tools/attendance-calculator/',
      },
      gpaCalculator: {
        title: 'CGPA, SGPA & Percentage Calculator | Naa College',
        description: 'Use the Naa College GPA Hub to explore CGPA and percentage conversions and plan a target SGPA. Check your university rules before using results officially.',
        canonical: 'https://naacollege.in/tools/gpa-calculator/',
      },
      roadmaps: {
        title: 'Engineering Branch Roadmaps for B.Tech Students | Naa College',
        description: 'Explore semester-by-semester engineering branch roadmaps with learning topics, project direction and career preparation guidance for B.Tech students.',
        canonical: 'https://naacollege.in/engineering-roadmaps/',
      },
    };
    const config = metadata[seoPath];
    if (!config) return;

    document.title = config.title;
    const setMeta = (selector: string, content: string) => {
      const el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (el) el.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', config.description);
    setMeta('meta[property="og:title"]', config.title);
    setMeta('meta[property="og:description"]', config.description);
    setMeta('meta[property="og:url"]', config.canonical);
    setMeta('meta[name="twitter:title"]', config.title);
    setMeta('meta[name="twitter:description"]', config.description);
    setMeta('meta[name="twitter:url"]', config.canonical);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = config.canonical;
  }, []);

  // Dynamic Workspace Switcher Handler
  const handleSelectWorkspace = (ws: WorkspaceView, targetSubTab?: string) => {
    const requiresMockAuth = ws === 'mock-tests' || ws === 'cbt-mock-test' || ws === 'eapcet-cbt';
    if (requiresMockAuth && !user) {
      setPendingProtectedWorkspace({ workspace: ws, subTab: targetSubTab });
      openAuthModal({ type: 'mock-test' });
      return;
    }
    setActiveWorkspace(ws);
    const seoPath = getSeoLandingPath();
    if (seoPath || isBlogPath(window.location.pathname)) {
      history.replaceState(null, '', '/');
    }
    if (ws === 'eapcet-cbt' && targetSubTab) {
      setEapcetCbtSubTab(targetSubTab);
    } else if (targetSubTab) {
      setUtilitySubTab(targetSubTab as ToolTab);
    }
    if (ws === 'hub') {
      // The home workspace must always have the root URL, even when returning
      // from a clean-path page such as /scholarships or a nested tool route.
      // Keeping the previous pathname here desynchronizes the address bar
      // from the workspace rendered by React.
      history.replaceState(null, '', '/' + window.location.search);
    } else {
      window.location.hash = ws;
    }
    // Smooth scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user || !pendingProtectedWorkspace) return;
    const pending = pendingProtectedWorkspace;
    setPendingProtectedWorkspace(null);
    closeAuthModal();
    setActiveWorkspace(pending.workspace);
    if (pending.workspace === 'eapcet-cbt' && pending.subTab) {
      setEapcetCbtSubTab(pending.subTab);
    } else if (pending.subTab) {
      setUtilitySubTab(pending.subTab as ToolTab);
    }
    window.location.hash = pending.workspace;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user, pendingProtectedWorkspace, closeAuthModal]);

  const handleSelectEapcetPhase = () => {
    setEapcetPhase('phase2');
    handleSelectWorkspace('eapcet');
  };

  const handleSelectToolFromPalette = (tab: ToolTab) => {
    setIsCommandPaletteOpen(false);
    if (tab === 'mock-tests') {
      handleSelectWorkspace('mock-tests');
    } else if (tab === 'eapcet-cbt') {
      handleSelectWorkspace('eapcet-cbt');
    } else if (tab === 'cbt-mock-test') {
      handleSelectWorkspace('cbt-mock-test');
    } else if (tab === 'gap-analyzer') {
      handleSelectWorkspace('gap-analyzer');
    } else if (tab === 'tg-top-colleges') {
      handleSelectWorkspace('tg-top-colleges');
    } else if (tab === 'tg-predictor') {
      handleSelectWorkspace('tg-predictor');
    } else if (tab === 'ap-allotments') {
      handleSelectWorkspace('ap-allotments');
    } else if (tab === 'ap-predictor') {
      handleSelectWorkspace('ap-predictor');
    } else if (tab === 'eapcet-radar') {
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
    } else if (tab === 'guides' || tab === 'hub') {
      handleSelectWorkspace('guides');
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
      case 'ap-allotments':
        return {
          title: 'AP EAPCET 2026 College-Wise Allotments',
          icon: <Building2 className="w-4 h-4 text-cyan-400" />,
        };
      case 'ap-predictor':
        return {
          title: 'AP EAPCET 2026 College Intelligence & Allotment Data',
          icon: <Compass className="w-4 h-4 text-rose-500" />,
        };
      case 'ap-rank-predictor':
        return {
          title: 'AP EAPCET Rank Predictor — Estimated Rank Range',
          icon: <Calculator className="w-4 h-4 text-cyan-500" />,
        };
      case 'ap-top-colleges':
        return {
          title: 'AP EAPCET Top B.Tech Colleges — Observed 2026 Ranks',
          icon: <Award className="w-4 h-4 text-cyan-500" />,
        };
      case 'tg-allotments':
        return {
          title: 'TG EAPCET 2026 Final Phase Allotment & Cutoff Radar',
          icon: <Award className="w-4 h-4 text-indigo-500" />,
        };
      case 'tg-top-colleges':
        return {
          title: 'Top B.Tech Colleges in Telangana (Observed OC Ranks)',
          icon: <Award className="w-4 h-4 text-amber-500" />,
        };
      case 'tg-predictor':
        return {
          title: 'TG EAPCET College Predictor',
          icon: <Compass className="w-4 h-4 text-emerald-500" />,
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
      case 'cbt-mock-test':
        return {
          title: 'Reliance Foundation Scholarship CBT Mock Test Engine',
          icon: <Award className="w-4 h-4 text-emerald-500" />,
        };
      case 'mock-tests':
        return {
          title: '🎯 Mock Test Series — Real-Time CBT Simulation Hub',
          icon: <Target className="w-4 h-4 text-blue-500" />,
        };
      case 'eapcet-cbt':
        return {
          title: 'EAPCET Computer-Based Test (CBT) Mock Exam Engine (AP & TG)',
          icon: <Award className="w-4 h-4 text-blue-500" />,
        };
      case 'utilities':
        return {
          title: 'free pdf tools for students',
          icon: <FileText className="w-4 h-4 text-pink-500" />,
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
          title: 'Naa College Student Knowledge Hub (9 Chapters)',
          icon: <BookOpen className="w-4 h-4 text-sky-500" />,
        };
      case 'gap-analyzer':
        return {
          title: 'AI Student Gap Analyzer (Where Am I, What Am I Missing, What Next?)',
          icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        };
      case 'essentials':
      case 'store':
        return {
          title: 'Student Essentials & Academic Gear Store',
          icon: <ShoppingBag className="w-4 h-4 text-amber-500" />,
        };
      default:
        return {
          title: 'NAA COLLEGE Feature Hub',
          icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        };
    }
  };

  const currentDetails = getWorkspaceDetails();

  const standaloneLegalPage = getStandaloneLegalPage();
  if (standaloneLegalPage) return <LegalPage type={standaloneLegalPage} />;
  const requestedPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/' : '/';
  if (requestedPath === '/autonomous-colleges') return <AutonomousCollegesDirectory />;

  const currentPath = typeof window !== "undefined"
    ? window.location.pathname.replace(/\/+$/, "").toLowerCase() || "/"
    : "/";
  const isAmazonOrEssentialsPage =
    activeWorkspace === "essentials" ||
    activeWorkspace === "store" ||
    currentPath.includes("amazon") ||
    currentPath.includes("student-store") ||
    currentPath.includes("student-essentials");
  const showPageWatermark = currentPath !== "/" && !isAmazonOrEssentialsPage && !isExamActive;

  return (
    <div className={`min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)] tech-grid-pattern-light flex flex-col justify-between transition-colors duration-200${showPageWatermark ? " naa-watermark-page" : ""}`}>
      {/* 1. Modern Streamlined Header (Zero Clutter, No Secondary Ribbon) */}
      {!isExamActive && (
        <Header
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={(ws) => handleSelectWorkspace(ws)}
          onSelectEapcetPhase={handleSelectEapcetPhase}
          onOpenLegal={(type) => setLegalModal(type)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSupport={() => setIsSupportModalOpen(true)}
        />
      )}

      {/* 2. Main Content Container */}
      <main className={`flex-1 w-full max-w-full overflow-hidden ${
        isExamActive
          ? 'p-0 max-w-full'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6'
      }`}>
        
        {getRoadmapDetailId() ? (
          <RoadmapFullPage
            branchId={getRoadmapDetailId() as string}
            onNavigateToStore={() => handleSelectWorkspace('essentials')}
          />
        ) : isBlogPath(window.location.pathname) ? (
          <BlogPage />
        ) : isUnknownAppPath() ? (
          <section className="mx-auto flex min-h-[55vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center" role="status">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">404 · Page not found</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">We couldn’t find that page</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">This link may be outdated or the address may be incorrect. Use the home page to explore Naa College.</p>
            <a href="/" className="mt-7 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-500">Go to Naa College Home</a>
          </section>
        ) : getSeoLandingPath() === 'apAllotments' ? (
          <SeoLandingPage
            eyebrow="AP EAPCET 2026 · Engineering Admissions"
            title="AP EAPCET 2026 College-Wise Allotments"
            description="Explore AP EAPCET 2026 allotment records by college, branch, rank and available category filters. Review the dataset shown on this page; it does not guarantee a future seat and does not replace an official counselling result."
            tool={<ApEapcet2025AllotmentExplorer />}
            howTo={[
              'Open the college selector and choose a specific AP engineering college, or use the statewide view.',
              'Choose a branch to narrow the allotment records and observed rank information.',
              'Use the student search and filters inside the explorer when you need a candidate-level record.',
              'Treat observed allotment records as historical dataset information and verify current counselling notices with official AP admissions sources.'
            ]}
            faqs={[
              { question: 'What does this AP EAPCET page contain?', answer: 'It provides the Naa College interactive explorer for the AP EAPCET engineering allotment dataset, including college, branch and candidate-level views available in the project data.' },
              { question: 'Can I search by college and branch?', answer: 'Yes. The explorer supports college and branch selection and exposes the available records for the selected context.' },
              { question: 'Are these guaranteed future cutoffs?', answer: 'No. Allotment records describe the dataset available to the tool. They should not be treated as a guarantee of a future allotment or admission outcome.' }
            ]}
            relatedLinks={[
              { href: '/ap-eapcet/college-wise-allotments/', label: 'AP EAPCET 2026 College-Wise Allotments' },
              { href: '/tg-eapcet/name-wise-allotments/', label: 'TG Name-Wise Allotments' },
              { href: '/#ap-predictor', label: 'AP EAPCET College Predictor' }
            ]}
          />
        ) : getSeoLandingPath() === 'tgAllotments' ? (
          <SeoLandingPage
            eyebrow="TG EAPCET 2026 · Final Phase"
            title="TG EAPCET 2026 Name-Wise Seat Allotments"
            description="Search the Naa College Telangana EAPCET 2026 final-phase allotment explorer by candidate name, hall ticket, college and branch, with available category and rank information."
            tool={<TgAllotmentExplorer initialCollegeCode="ALL" initialBranchCode="ALL" initialTab="explorer" />}
            howTo={[
              'Keep All Colleges selected for a statewide search, or choose a specific college first.',
              'Use the candidate search field for a student name, hall ticket or other supported search term.',
              'Open a result to view the available college, branch, category, gender, region and rank details.',
              'Use the displayed allotment data as a reference and verify official Telangana counselling information before making decisions.'
            ]}
            faqs={[
              { question: 'What is name-wise TG EAPCET allotment search?', answer: 'It is an interactive candidate search within the Telangana EAPCET 2026 final-phase allotment dataset available in Naa College.' },
              { question: 'Can I search across colleges?', answer: 'Yes. The statewide explorer supports an All Colleges context, while individual college views can load the corresponding allotment data.' },
              { question: 'Does an allotment record guarantee admission?', answer: 'No. A dataset record is informational. Current counselling instructions, reporting requirements and official allotment notices remain authoritative.' }
            ]}
            relatedLinks={[
              { href: '/tg-eapcet/name-wise-allotments/', label: 'TG Name-Wise Allotments' },
              { href: '/ap-eapcet/college-wise-allotments/', label: 'AP College-Wise Allotments' },
              { href: '/#tg-predictor', label: 'TG EAPCET College Predictor' }
            ]}
          />
        ) : getSeoLandingPath() === 'apPredictor' ? (
          <SeoLandingPage
            eyebrow="AP EAPCET 2026 · College Prediction"
            title="AP EAPCET College Predictor 2026"
            description="Use the Naa College AP EAPCET College Predictor to explore colleges and branches that match your entered rank, category, gender, region and preferences. It is designed to help students explore available options using the project's 2026 allotment data."
            tool={<ApCollegePredictor initialCollegeCode="ALL" initialBranchCode="ALL" />}
            toolIntro="Enter your AP EAPCET rank and preferences, then use the interactive predictor to explore matching college and branch options."
            howTo={[
              'Enter your AP EAPCET rank and select your category, gender and region.',
              'Choose a preferred branch or college, or keep the options broad to explore more matches.',
              'Run the prediction to review matching colleges, branches and the available rank-based information.',
              'Use the results as an exploration aid, not as a guarantee of future allotment or admission.'
            ]}
            faqs={[
              { question: 'What is the AP EAPCET College Predictor?', answer: 'It is an interactive Naa College tool that uses the project’s available AP EAPCET allotment data to explore college and branch options for an entered rank and selected preferences.' },
              { question: 'Can I predict colleges based on my AP EAPCET rank?', answer: 'Yes. Enter your rank and relevant preferences to explore the college and branch matches returned by the predictor.' },
              { question: 'Can I check AP EAPCET colleges and branches?', answer: 'Yes. The predictor lets you narrow results by college and branch while considering the supported candidate preferences.' },
              { question: 'Is the AP EAPCET College Predictor a guaranteed allotment?', answer: 'No. Predictions are informational and based on the available dataset and selected inputs. Actual counselling rules, seat availability and official allotments determine admission.' }
            ]}
            relatedLinks={[
              { href: '/ap-eapcet/college-predictor/', label: 'AP EAPCET College Predictor' },
              { href: '/ap-eapcet/college-wise-allotments/', label: 'AP College-Wise Allotments' },
              { href: '/tg-eapcet/college-predictor/', label: 'TG EAPCET College Predictor' },
              { href: '/tg-eapcet/name-wise-allotments/', label: 'TG Name-Wise Allotments' }
            ]}
          />
        ) : getSeoLandingPath() === 'tgPredictor' ? (
          <SeoLandingPage
            eyebrow="TG EAPCET 2026 · College Prediction"
            title="TG EAPCET College Predictor 2026"
            description="Use the Naa College Telangana EAPCET College Predictor to explore college and branch options based on rank, category, gender, preferred branch, district and other supported preferences."
            tool={<TgCollegePredictor />}
            toolIntro="Enter your TG EAPCET rank and preferences, then use the interactive predictor to explore matching Telangana colleges and branches."
            howTo={[
              'Enter your TG EAPCET rank and select your category and gender.',
              'Choose a preferred branch and optionally narrow the results by district or college.',
              'Run the prediction to review matching Telangana colleges, branches and rank-based information.',
              'Use the results as an exploration aid and verify current counselling rules and official allotments before making decisions.'
            ]}
            faqs={[
              { question: 'What is the TG EAPCET College Predictor?', answer: 'It is an interactive Naa College tool that uses the project’s available Telangana EAPCET allotment data to explore college and branch options for an entered rank and selected preferences.' },
              { question: 'Can I predict Telangana colleges based on my TG EAPCET rank?', answer: 'Yes. Enter your rank, category, gender and preferred branch to explore the matching colleges returned by the predictor.' },
              { question: 'Can I filter TG EAPCET college predictions by branch or district?', answer: 'Yes. The predictor supports branch selection and additional filters such as district and college search where available in the tool.' },
              { question: 'Is the TG EAPCET College Predictor a guaranteed allotment?', answer: 'No. Predictions are informational and based on the available dataset and selected inputs. Actual counselling rules, seat availability and official allotments determine admission.' }
            ]}
            relatedLinks={[
              { href: '/tg-eapcet/college-predictor/', label: 'TG EAPCET College Predictor' },
              { href: '/tg-eapcet/name-wise-allotments/', label: 'TG Name-Wise Allotments' },
              { href: '/ap-eapcet/college-predictor/', label: 'AP EAPCET College Predictor' },
              { href: '/ap-eapcet/college-wise-allotments/', label: 'AP College-Wise Allotments' }
            ]}
          />
        ) : getSeoLandingPath() === 'attendanceCalculator' ? (
          <SeoLandingPage
            eyebrow="Free Student Utility · Attendance"
            title="Attendance Calculator & Bunk Planner"
            description="Check your current attendance and explore how upcoming classes affect your percentage. Use the planner to estimate classes you may miss or classes you need to attend to reach your target, based on the values you enter."
            tool={<AttendanceDefender />}
            toolIntro="Enter your class totals and attendance details in the calculator below. Confirm your college's attendance policy before relying on a target."
            howTo={[
              'Enter the classes held and the classes you have attended, using the fields provided by the tool.',
              'Review your current attendance percentage and the calculator’s estimate for your chosen target.',
              'Use the result to plan ahead; class schedules and attendance rules can change.',
              'Confirm the minimum attendance requirement with your own college before making attendance decisions.'
            ]}
            faqs={[
              { question: 'Can this attendance calculator tell me how many classes I can miss?', answer: 'The tool estimates your attendance position from the inputs you provide and the target you select. Check your college’s attendance policy and actual attendance records before deciding to miss a class.' },
              { question: 'Can I calculate how many classes I need to attend to reach 75%?', answer: 'You can use the calculator to explore a target percentage such as 75%, provided the required class totals are entered correctly. Your college may apply additional rules.' },
              { question: 'Is the result an official attendance record?', answer: 'No. It is a planning estimate, not an official college attendance record.' }
            ]}
            relatedLinks={[
              { href: '/tools/gpa-calculator/', label: 'CGPA & SGPA Calculator' },
              { href: '/engineering-roadmaps/', label: 'Engineering Roadmaps' },
              { href: '/#attendance', label: 'Attendance Tool in Feature Hub' }
            ]}
          />
        ) : getSeoLandingPath() === 'gpaCalculator' ? (
          <SeoLandingPage
            eyebrow="Free Student Utility · Marks & GPA"
            title="CGPA, SGPA & Percentage Calculator"
            description="Use the Naa College GPA Hub to explore CGPA-to-percentage conversions and plan future SGPA targets. Conversion rules differ between universities, so check your institution's official formula before using a result in an application."
            tool={<GlobalGpaHub onNavigateToStore={() => handleSelectWorkspace('essentials')} />}
            toolIntro="Choose the relevant GPA function and enter your values to explore the result."
            howTo={[
              'Choose the conversion or target-planning option that matches your task.',
              'Enter your CGPA, SGPA or other requested values in the calculator.',
              'Review the displayed result and the formula shown by the tool where available.',
              'Verify the applicable conversion formula with your university before using a result officially.'
            ]}
            faqs={[
              { question: 'Can I convert CGPA into percentage?', answer: 'The GPA Hub supports selected conversion formulas. The correct formula depends on your university or board, so confirm the applicable rule before using the result officially.' },
              { question: 'Can I plan a target SGPA for a future semester?', answer: 'The GPA Hub includes target-planning functionality intended to help you explore the score needed for a selected academic goal.' },
              { question: 'Is one CGPA conversion formula valid for every university?', answer: 'No. Institutions may prescribe different conversion rules. Use the official formula applicable to your course and university.' }
            ]}
            relatedLinks={[
              { href: '/tools/attendance-calculator/', label: 'Attendance Calculator' },
              { href: '/engineering-roadmaps/', label: 'Engineering Roadmaps' },
              { href: '/#gpa', label: 'GPA Hub in Feature Hub' }
            ]}
          />
        ) : getSeoLandingPath() === 'roadmaps' ? (
          <SeoLandingPage
            eyebrow="B.Tech Learning Guide · Branch Roadmaps"
            title="Engineering Branch Roadmaps for B.Tech Students"
            description="Explore semester-by-semester engineering branch roadmaps in Naa College. Use the available branch plans to organise learning topics, projects and career preparation alongside your college syllabus."
            tool={<EngineeringRoadmaps />}
            toolIntro="Select your engineering branch and explore the roadmap content available in the tool."
            howTo={[
              'Open the roadmap tool and select the engineering branch relevant to you.',
              'Review the semester-wise topics and suggested learning sequence available for that branch.',
              'Use project and skill suggestions to plan practical work alongside your college subjects.',
              'Adapt the roadmap to your curriculum, available time and goals instead of treating it as a fixed guarantee.'
            ]}
            faqs={[
              { question: 'Are the roadmaps suitable for B.Tech students?', answer: 'The roadmap hub is designed to help engineering students organise learning topics, projects and career preparation across their degree.' },
              { question: 'Do all engineering branches use the same roadmap?', answer: 'No. The tool is organised around branch-specific roadmap options, so the available topics can differ by branch.' },
              { question: 'Does following a roadmap guarantee an internship or placement?', answer: 'No. A roadmap is a planning aid. Outcomes depend on many factors, including practice, projects, eligibility, opportunities and hiring conditions.' }
            ]}
            relatedLinks={[
              { href: '/tools/gpa-calculator/', label: 'CGPA & SGPA Calculator' },
              { href: '/tools/attendance-calculator/', label: 'Attendance Calculator' },
              { href: '/#roadmaps', label: 'Roadmaps in Feature Hub' }
            ]}
          />
        ) : activeWorkspace === 'hub' ? (
          <div className="mos-k-homepage-flow mos-kinetic-home space-y-8 animate-in fade-in duration-200">
            {/* Dynamic Feature Selector Hero & Bento Cards Showcase */}
            <HeroSection
              activeWorkspace={activeWorkspace}
              onSelectWorkspace={(ws) => handleSelectWorkspace(ws)}
            />

            <ChunkErrorBoundary fallbackTitle="Unable to load interactive sections">
              <Suspense fallback={<LoadingFallback />}>
                {/* High-Trust Reviews: Continuous Horizontal Marquee Carousel */}
                <StudentTestimonials />

                {/* Educational Guides & Transparent Methodology Documentation */}
                <div className="content-visibility-auto">
                  <EducationalGuideAndSeo />
                </div>

              </Suspense>
            </ChunkErrorBoundary>
          </div>
        ) : (
          /* WHEN IN AN ACTIVE WORKSPACE: Focused, Single-Tool Workspace View */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Breadcrumb Navigation Header in Normal Document Flow (hidden during active CBT testing) */}
            {!isExamActive && (
              <div className="relative w-full mb-4 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                <button
                  type="button"
                  onClick={() => handleSelectWorkspace('hub')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group shrink-0 self-start sm:self-auto"
                  title="Return to NAA COLLEGE Feature Hub"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  <span>← Back to Feature Hub</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-hidden">
                  <span className="hidden sm:inline">Workspace</span>
                  <span className="hidden sm:inline">/</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1.5 truncate">
                    {currentDetails.icon}
                    <span className="truncate">{currentDetails.title}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Specific Workspace Views */}
            <section id="workspace-viewport" className="relative min-h-[500px]">
              <ChunkErrorBoundary fallbackTitle="Unable to load tool workspace">
                <Suspense fallback={<LoadingFallback />}>
                {activeWorkspace === 'attendance' && (
                  <AttendanceDefender />
                )}

                {activeWorkspace === 'gpa' && (
                  <div className="space-y-6">
                    {/* Dedicated GPA & Internal Exam Marks Estimator Switcher */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs flex flex-wrap items-center gap-2 transition-colors">
                      <button
                        type="button"
                        onClick={() => setGpaSubTab('gpa')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gpaSubTab === 'gpa'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs flex flex-wrap items-center gap-2 transition-colors">
                      <button
                        type="button"
                        onClick={() => setAcademicSubTab('attendance')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          academicSubTab === 'attendance'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                  <ApEapcetRadar
                    initialTab={eapcetPhase}
                    onNavigateToCbt={() => handleSelectWorkspace('eapcet-cbt')}
                  />
                )}

                {activeWorkspace === 'ap-allotments' && (
                  <ApEapcet2025AllotmentExplorer />
                )}

                {activeWorkspace === 'ap-predictor' && (
                  <ApCollegePredictor initialCollegeCode="ALL" initialBranchCode="ALL" />
                )}

                {activeWorkspace === 'ap-top-colleges' && (
                  <ApTopColleges />
                )}

                {activeWorkspace === 'ap-rank-predictor' && (
                  <ApEapcetRankPredictor />
                )}

                {activeWorkspace === 'tg-allotments' && (
                  <TgAllotmentExplorer
                    initialCollegeCode={targetAllotmentCollege}
                    initialBranchCode={targetAllotmentBranch}
                  />
                )}

                {activeWorkspace === 'tg-top-colleges' && (
                  <TgTopColleges
                    onSelectCollegeBranch={(collegeCode: string, branchCode?: string) => {
                      if (collegeCode) setTargetAllotmentCollege(collegeCode);
                      if (branchCode) setTargetAllotmentBranch(branchCode);
                      setActiveWorkspace('tg-allotments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {activeWorkspace === 'tg-predictor' && (
                  <TgCollegePredictor
                    onNavigateToAllotment={(collegeCode: string, branchCode?: string) => {
                      if (collegeCode) setTargetAllotmentCollege(collegeCode);
                      if (branchCode) setTargetAllotmentBranch(branchCode);
                      setActiveWorkspace('tg-allotments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
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
                  <ScholarshipsHub onNavigateToCbt={() => handleSelectWorkspace('cbt-mock-test')} />
                )}

                {activeWorkspace === 'cbt-mock-test' && (
                  <CbtMockTestEngine
                    onBackToHub={() => handleSelectWorkspace('hub')}
                    onSwitchToEapcet={() => handleSelectWorkspace('eapcet-cbt')}
                    onExamStatusChange={setIsExamActive}
                  />
                )}

                {activeWorkspace === 'mock-tests' && (
                  <MockTestSeriesHub
                    onSelectWorkspace={(ws, subTab) => handleSelectWorkspace(ws, subTab)}
                  />
                )}

                {activeWorkspace === 'eapcet-cbt' && (
                  <EapcetCbtMockTestEngine
                    key={eapcetCbtSubTab}
                    initialState={eapcetCbtSubTab?.startsWith('tg') ? 'tg-eapcet' : 'ap-eapcet'}
                    initialMode={eapcetCbtSubTab?.includes('express') ? 'express' : 'full'}
                    onBackToHub={() => handleSelectWorkspace('hub')}
                    onNavigateToPredictor={(examType) => {
                      handleSelectWorkspace(examType === 'ap' ? 'ap-predictor' : 'tg-predictor');
                    }}
                    onExamStatusChange={setIsExamActive}
                  />
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

                {activeWorkspace === 'gap-analyzer' && (
                  <StudentGapAnalyzer
                    onNavigateToRoadmaps={() => handleSelectWorkspace('roadmaps')}
                    onNavigateToProjects={() => handleSelectWorkspace('projects')}
                    onNavigateToDsa={() => handleSelectWorkspace('dsa')}
                    onNavigateToVault={() => handleSelectWorkspace('vault')}
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
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs transition-colors">
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
                        {[
                          { id: 'pdf-tools' as ToolTab, label: 'free pdf tools for students', icon: FileText },
                          { id: 'vault' as ToolTab, label: 'Code & Viva Vault', icon: Terminal },
                          { id: 'resizer' as ToolTab, label: '20KB Image Resizer', icon: ImageIcon },
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
                                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
            </ChunkErrorBoundary>
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
              NAA COLLEGE — 100% Free &amp; Open-Source Educational Tooling for Students.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Student Resources • Direct Student Access</span>
          </div>
        </div>
      </div>

      {/* Minimalist High-Performance Footer (hidden during active CBT testing) */}
      {!isExamActive && (
        <Footer
          onOpenLegalModal={(type) => setLegalModal(type)}
          onOpenSupportModal={() => setIsSupportModalOpen(true)}
        />
      )}

      {/* 6. Legal & Contact Modal */}
      {legalModal && (
        <LegalModals
          type={legalModal}
          onClose={() => setLegalModal(null)}
          onSwitchType={(type) => setLegalModal(type)}
        />
      )}

      {/* Support & Keep NAA COLLEGE Free Modal */}
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