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
  Users,
  Target,
} from 'lucide-react';
import { ToolTab, ToolMeta, WorkspaceView, LegalModalType } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';
import { LegalModals } from './components/LegalModals';
import { EducationalGuideAndSeo } from './components/EducationalGuideAndSeo';
import type { EapcetPhaseTab } from './components/ApEapcetRadar';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { GuidesHub } from './components/GuidesHub';
import { SeoLandingPage } from './components/SeoLandingPage';
import { useAuth } from './context/AuthContext';

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
const AtsResumeMatcher = lazyWithRetry(() =>
  import('./components/AtsResumeMatcher').then((m: any) => ({
    default: m.AtsResumeMatcher || m.default,
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
const StudentFaq = lazyWithRetry(() =>
  import('./components/StudentFaq').then((m: any) => ({
    default: m.StudentFaq || m.default,
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
    id: 'ap-top-colleges',
    name: 'AP EAPCET Top B.Tech Colleges',
    shortName: 'AP Top Colleges',
    category: 'counselling',
    description: 'Explore branch-wise observed 2026 allotment rank patterns using a consistent OC reference group.',
    badge: '2026 DATA',
  },
  {
    id: 'ap-allotments',
    name: 'AP Allotments (Namewise)',
    shortName: 'AP Allotments',
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
    name: 'free pdf tools for students',
    shortName: 'free pdf tools for students',
    category: 'document',
    description: 'Fast, in-browser PDF utilities. Zero uploads, zero tracking, completely free.',
    badge: '100% Free',
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

const SEO_LANDING_PATHS = {
  apAllotments: '/ap-eapcet/college-wise-allotments/',
  tgAllotments: '/tg-eapcet/name-wise-allotments/',
  apPredictor: '/ap-eapcet/college-predictor/',
  tgPredictor: '/tg-eapcet/college-predictor/',
} as const;

const getSeoLandingPath = () => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === SEO_LANDING_PATHS.apAllotments.replace(/\/+$/, '')) return 'apAllotments' as const;
  if (path === SEO_LANDING_PATHS.tgAllotments.replace(/\/+$/, '')) return 'tgAllotments' as const;
  if (path === SEO_LANDING_PATHS.apPredictor.replace(/\/+$/, '')) return 'apPredictor' as const;
  if (path === SEO_LANDING_PATHS.tgPredictor.replace(/\/+$/, '')) return 'tgPredictor' as const;
  return null;
};

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceView>(() => {
    const seoPath = getSeoLandingPath();
    if (seoPath === 'apAllotments') return 'ap-allotments';
    if (seoPath === 'tgAllotments') return 'tg-allotments';
    if (seoPath === 'apPredictor') return 'ap-predictor';
    if (seoPath === 'tgPredictor') return 'tg-predictor';
    return 'hub';
  });
  const [utilitySubTab, setUtilitySubTab] = useState<ToolTab>('pdf-tools');
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
  const { user, openAuthModal } = useAuth();

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
    if (getSeoLandingPath()) return;
    const handleHashChange = () => {
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
        hash === 'photo-resizer' ||
        hash === 'resume-checker'
      ) {
        setActiveWorkspace('utilities');
        if (hash === 'resizer' || hash === 'image-tools' || hash === 'photo-resizer') setUtilitySubTab('resizer');
        else if (hash === 'resume-checker') setUtilitySubTab('resume-checker');
        else setUtilitySubTab('pdf-tools');
      } else if (hash === 'guides' || hash === 'editorial' || hash === 'survival' || hash.startsWith('guide-')) {
        setActiveWorkspace('guides');
      } else if (hash === 'campus-connect' || hash === 'campus' || hash === 'community' || hash === 'connect') {
        setActiveWorkspace('hub');
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
        setActiveWorkspace('mock-tests');
      } else if (
        hash === 'eapcet-cbt' ||
        hash === 'ap-cbt' ||
        hash === 'tg-cbt' ||
        hash === 'eapcet-test'
      ) {
        setActiveWorkspace('eapcet-cbt');
      } else if (hash === 'hub' || hash === '') {
        setActiveWorkspace('hub');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const seoPath = getSeoLandingPath();
    if (!seoPath) return;

    const config = seoPath === 'apAllotments'
      ? {
          title: 'AP EAPCET 2026 College-Wise Allotments | Man of Study',
          description: 'Explore AP EAPCET 2026 engineering allotment records by college and branch with the Man of Study allotment explorer.',
          canonical: 'https://manofstudy.pages.dev/ap-eapcet/college-wise-allotments/',
        }
      : seoPath === 'tgAllotments'
        ? {
            title: 'TG EAPCET 2026 Name-Wise Seat Allotments | Man of Study',
            description: 'Search Telangana EAPCET 2026 final-phase engineering seat allotment records by student name, hall ticket, college and branch.',
            canonical: 'https://manofstudy.pages.dev/tg-eapcet/name-wise-allotments/',
          }
        : seoPath === 'apPredictor'
          ? {
              title: 'AP EAPCET College Predictor 2026 | Man of Study',
              description: 'Use the AP EAPCET 2026 College Predictor to explore college and branch options based on rank, category, gender, region and preferences.',
              canonical: 'https://manofstudy.pages.dev/ap-eapcet/college-predictor/',
            }
          : {
              title: 'TG EAPCET College Predictor 2026 | Man of Study',
              description: 'Use the Telangana EAPCET 2026 College Predictor to explore college and branch options based on rank, category, gender, branch and preferences.',
              canonical: 'https://manofstudy.pages.dev/tg-eapcet/college-predictor/',
            };

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
    if (seoPath) {
      history.replaceState(null, '', '/');
    }
    if (ws === 'eapcet-cbt' && targetSubTab) {
      setEapcetCbtSubTab(targetSubTab);
    } else if (targetSubTab) {
      setUtilitySubTab(targetSubTab as ToolTab);
    }
    if (ws === 'hub') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
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
    handleSelectWorkspace(pending.workspace, pending.subTab);
  }, [user, pendingProtectedWorkspace]);

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
    } else if (tab === 'campus-connect') {
      handleSelectWorkspace('campus-connect');
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
          title: 'AP Allotments (Namewise)',
          icon: <Building2 className="w-4 h-4 text-cyan-400" />,
        };
      case 'ap-predictor':
        return {
          title: 'AP EAPCET 2026 College Intelligence & Allotment Data',
          icon: <Compass className="w-4 h-4 text-rose-500" />,
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
          title: 'MOS Student Knowledge HUB (9 Chapters)',
          icon: <BookOpen className="w-4 h-4 text-sky-500" />,
        };
      case 'campus-connect':
        return {
          title: 'MOS CampusConnect — Student Network',
          icon: <Users className="w-4 h-4 text-emerald-500" />,
        };
      case 'gap-analyzer':
        return {
          title: 'AI Student Gap Analyzer (Where Am I, What Am I Missing, What Next?)',
          icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
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
    <div className="min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)] tech-grid-pattern-light flex flex-col justify-between transition-colors duration-200">
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
        
        {getSeoLandingPath() === 'apAllotments' ? (
          <SeoLandingPage
            eyebrow="AP EAPCET 2026 · Engineering Admissions"
            title="AP EAPCET 2026 College-Wise Allotments"
            description="Use the Man of Study AP allotment explorer to browse the available 2026 engineering allotment dataset by college, branch, rank and category. The page is built around the same interactive allotment tool available across Man of Study."
            tool={<ApEapcet2025AllotmentExplorer />}
            howTo={[
              'Open the college selector and choose a specific AP engineering college, or use the statewide view.',
              'Choose a branch to narrow the allotment records and observed rank information.',
              'Use the student search and filters inside the explorer when you need a candidate-level record.',
              'Treat observed allotment records as historical dataset information and verify current counselling notices with official AP admissions sources.'
            ]}
            faqs={[
              { question: 'What does this AP EAPCET page contain?', answer: 'It provides the Man of Study interactive explorer for the AP EAPCET engineering allotment dataset, including college, branch and candidate-level views available in the project data.' },
              { question: 'Can I search by college and branch?', answer: 'Yes. The explorer supports college and branch selection and exposes the available records for the selected context.' },
              { question: 'Are these guaranteed future cutoffs?', answer: 'No. Allotment records describe the dataset available to the tool. They should not be treated as a guarantee of a future allotment or admission outcome.' }
            ]}
            relatedLinks={[
              { href: '/ap-eapcet/college-wise-allotments/', label: 'AP College-Wise Allotments' },
              { href: '/tg-eapcet/name-wise-allotments/', label: 'TG Name-Wise Allotments' },
              { href: '/#ap-predictor', label: 'AP EAPCET College Predictor' }
            ]}
          />
        ) : getSeoLandingPath() === 'tgAllotments' ? (
          <SeoLandingPage
            eyebrow="TG EAPCET 2026 · Final Phase"
            title="TG EAPCET 2026 Name-Wise Seat Allotments"
            description="Search the Man of Study Telangana EAPCET 2026 final-phase allotment explorer by candidate name, hall ticket, college and branch, with available category and rank information."
            tool={<TgAllotmentExplorer initialCollegeCode="ALL" initialBranchCode="ALL" initialTab="explorer" />}
            howTo={[
              'Keep All Colleges selected for a statewide search, or choose a specific college first.',
              'Use the candidate search field for a student name, hall ticket or other supported search term.',
              'Open a result to view the available college, branch, category, gender, region and rank details.',
              'Use the displayed allotment data as a reference and verify official Telangana counselling information before making decisions.'
            ]}
            faqs={[
              { question: 'What is name-wise TG EAPCET allotment search?', answer: 'It is an interactive candidate search within the Telangana EAPCET 2026 final-phase allotment dataset available in Man of Study.' },
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
            description="Use the Man of Study AP EAPCET College Predictor to explore colleges and branches that match your entered rank, category, gender, region and preferences. It is designed to help students explore available options using the project's 2026 allotment data."
            tool={<ApCollegePredictor initialCollegeCode="ALL" initialBranchCode="ALL" />}
            toolIntro="Enter your AP EAPCET rank and preferences, then use the interactive predictor to explore matching college and branch options."
            howTo={[
              'Enter your AP EAPCET rank and select your category, gender and region.',
              'Choose a preferred branch or college, or keep the options broad to explore more matches.',
              'Run the prediction to review matching colleges, branches and the available rank-based information.',
              'Use the results as an exploration aid, not as a guarantee of future allotment or admission.'
            ]}
            faqs={[
              { question: 'What is the AP EAPCET College Predictor?', answer: 'It is an interactive Man of Study tool that uses the project’s available AP EAPCET allotment data to explore college and branch options for an entered rank and selected preferences.' },
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
            description="Use the Man of Study Telangana EAPCET College Predictor to explore college and branch options based on rank, category, gender, preferred branch, district and other supported preferences."
            tool={<TgCollegePredictor />}
            toolIntro="Enter your TG EAPCET rank and preferences, then use the interactive predictor to explore matching Telangana colleges and branches."
            howTo={[
              'Enter your TG EAPCET rank and select your category and gender.',
              'Choose a preferred branch and optionally narrow the results by district or college.',
              'Run the prediction to review matching Telangana colleges, branches and rank-based information.',
              'Use the results as an exploration aid and verify current counselling rules and official allotments before making decisions.'
            ]}
            faqs={[
              { question: 'What is the TG EAPCET College Predictor?', answer: 'It is an interactive Man of Study tool that uses the project’s available Telangana EAPCET allotment data to explore college and branch options for an entered rank and selected preferences.' },
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
        ) : activeWorkspace === 'hub' ? (
          <div className="space-y-8 animate-in fade-in duration-200">
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
                  title="Return to MAN OF STUDY Feature Hub"
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
              MAN OF STUDY — 100% Free &amp; Open-Source Educational Tooling for Students.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Zero Ads • Zero Data Collection • Direct Student Access</span>
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
