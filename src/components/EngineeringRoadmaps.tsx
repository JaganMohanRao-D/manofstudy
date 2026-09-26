import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Compass,
  Download,
  Share2,
  Check,
  Search,
  X,
  Briefcase,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  CornerDownLeft,
  Cpu,
  Binary,
  Coins,
  Landmark,
  FlaskConical,
  GraduationCap,
  Dna,
  Pill,
  Sprout,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';
import { BranchRoadmap } from '../types';
import { ENGINEERING_ROADMAPS } from '../data/engineeringRoadmapsData';
import { generateRoadmapPdf } from '../utils/roadmapPdfGenerator';
import { BranchCard } from './roadmaps/BranchCard';
import { RoadmapModal } from './roadmaps/RoadmapModal';
import { BranchToolsBanner } from './BranchToolsBanner';

export interface EngineeringRoadmapsProps {
  targetBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
  onNavigateToStore?: (category?: string) => void;
}

const POPULAR_QUICK_SEARCHES_MPC = [
  'CSE',
  'AI & ML',
  'Data Science',
  'Biotech',
  'VLSI',
  'Embedded',
  'IoT',
  'Robotics',
  'Mechanical',
  'Civil',
  'B.Sc CS',
  'B.Com Fintech',
  'B.A. Public Admin',
];

const POPULAR_QUICK_SEARCHES_BIPC = [
  'B.Pharmacy',
  'Pharma.D',
  'B.Sc Agri',
  'B.Sc Nursing',
  'GPAT',
  'NIPER',
  'Clinical Pharmacist',
  'IBPS AFO',
  'AIIMS NORCET',
  'NCLEX-RN',
  'Drug Inspector',
  'Pharmacovigilance',
];

const STREAM_TABS = [
  { id: 'all', label: 'All Streams', icon: Compass },
  { id: 'engineering', label: 'Engineering & Tech', icon: Cpu },
  { id: 'science', label: 'Science (B.Sc)', icon: Binary },
  { id: 'commerce', label: 'Commerce (B.Com)', icon: Coins },
  { id: 'humanities', label: 'Humanities (B.A.)', icon: Landmark },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Disciplines' },
  { id: 'computing', label: 'Computing & AI' },
  { id: 'electronics', label: 'Electronics & Hardware' },
  { id: 'mechanical', label: 'Mechanical & Aero' },
  { id: 'civil', label: 'Civil & Core' },
  { id: 'biotech', label: 'Biotechnology' },
];

const BIPC_CATEGORY_TABS = [
  { id: 'all', label: 'All Healthcare & Allied', icon: Dna },
  { id: 'pharma', label: 'Pharmacy (B.Pharm & Pharm.D)', icon: Pill },
  { id: 'agri', label: 'Agri & Allied Sciences', icon: Sprout },
  { id: 'nursing', label: 'Nursing & Critical Care', icon: HeartPulse },
];

export const EngineeringRoadmaps: React.FC<EngineeringRoadmapsProps> = ({
  targetBranchId,
  onSelectBranch,
  onNavigateToStore,
}) => {
  const [majorTrack, setMajorTrack] = useState<'mpc' | 'bipc'>('mpc');
  const [bipcCategory, setBipcCategory] = useState<string>('all');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalBranch, setActiveModalBranch] = useState<BranchRoadmap | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfExportStatus, setPdfExportStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [navFeedback, setNavFeedback] = useState<string | null>(null);

  // Clean dismissal handler that clears modal state and URL hash without looping
  const handleCloseBranchModal = useCallback(() => {
    setActiveModalBranch(null);
    document.body.style.overflow = '';
    if (typeof window !== 'undefined' && window.location.hash.includes('branch=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Sync when targetBranchId prop changes from parent or Command Palette
  useEffect(() => {
    if (targetBranchId) {
      const match = ENGINEERING_ROADMAPS.find((b) => b.id === targetBranchId);
      if (match) {
        if (match.stream === 'bipc') {
          setMajorTrack('bipc');
        } else {
          setMajorTrack('mpc');
        }
        setActiveModalBranch(match);
        setNavFeedback(`Opened ${match.code} — ${match.name}`);
        setTimeout(() => setNavFeedback(null), 3500);
      }
    }
  }, [targetBranchId]);

  // Sync with URL hash if present on load or change (e.g. #branch=cse)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('branch=')) {
        const branchId = hash.split('branch=')[1]?.split('&')[0];
        const match = ENGINEERING_ROADMAPS.find((b) => b.id === branchId);
        if (match) {
          if (match.stream === 'bipc') {
            setMajorTrack('bipc');
          } else {
            setMajorTrack('mpc');
          }
          setActiveModalBranch(match);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Total counts by primary track
  const mpcCount = useMemo(() => ENGINEERING_ROADMAPS.filter((b) => b.stream !== 'bipc').length, []);
  const bipcCount = useMemo(() => ENGINEERING_ROADMAPS.filter((b) => b.stream === 'bipc').length, []);

  // BiPC category counts
  const bipcCategoryCounts = useMemo(() => {
    const bipcRoadmaps = ENGINEERING_ROADMAPS.filter((b) => b.stream === 'bipc');
    return {
      all: bipcRoadmaps.length,
      pharma: bipcRoadmaps.filter((b) => b.category === 'pharma').length,
      agri: bipcRoadmaps.filter((b) => b.category === 'agri').length,
      nursing: bipcRoadmaps.filter((b) => b.category === 'nursing').length,
    };
  }, []);

  // Filtered branches list based on search, majorTrack, stream, and category
  const filteredBranches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return ENGINEERING_ROADMAPS.filter((b) => {
      // 1. Major Track Separation
      if (majorTrack === 'bipc') {
        if (b.stream !== 'bipc') return false;
        if (bipcCategory !== 'all' && b.category !== bipcCategory) {
          return false;
        }
      } else {
        // MPC & Degree streams
        if (b.stream === 'bipc') return false;

        // Stream filter
        if (selectedStream !== 'all') {
          const bStream = b.stream || 'engineering';
          if (bStream !== selectedStream) {
            return false;
          }
        }

        // Category filter (applies when engineering or all is active)
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'computing') {
            if (b.category !== 'computing' && b.bannerCategory !== 'computing' && b.bannerCategory !== 'security') {
              return false;
            }
          } else if (selectedCategory === 'electronics') {
            if (b.category !== 'electronics' && b.bannerCategory !== 'electronics') {
              return false;
            }
          } else if (selectedCategory === 'mechanical') {
            if (b.category !== 'mechanical' && b.bannerCategory !== 'mechanical') {
              return false;
            }
          } else if (selectedCategory === 'civil') {
            if (b.category !== 'civil' && b.bannerCategory !== 'civil') {
              return false;
            }
          } else if (selectedCategory === 'biotech') {
            if (b.category !== 'biotech' && b.bannerCategory !== 'biotech') {
              return false;
            }
          }
        }
      }

      // Query filter
      if (!q) return true;

      const inCode = b.code.toLowerCase().includes(q);
      const inName = b.name.toLowerCase().includes(q);
      const inAcronym = (b.acronym || '').toLowerCase().includes(q);
      const inId = b.id.toLowerCase().includes(q);
      const inTagline = b.tagline.toLowerCase().includes(q);
      const inDegree = (b.degreeType || '').toLowerCase().includes(q);
      const inRoles = b.strategicOverview?.targetRoles?.some((r) => r.toLowerCase().includes(q)) ?? false;
      const inTools = b.skillsMatrix?.industryTools?.some((t) => t.toLowerCase().includes(q)) ?? false;

      return inCode || inName || inAcronym || inId || inTagline || inDegree || inRoles || inTools;
    });
  }, [searchQuery, majorTrack, bipcCategory, selectedStream, selectedCategory]);

  // Stream counts for MPC track
  const streamCounts = useMemo(() => {
    const mpcList = ENGINEERING_ROADMAPS.filter((b) => b.stream !== 'bipc');
    return {
      all: mpcList.length,
      engineering: mpcList.filter((b) => !b.stream || b.stream === 'engineering').length,
      science: mpcList.filter((b) => b.stream === 'science').length,
      commerce: mpcList.filter((b) => b.stream === 'commerce').length,
      humanities: mpcList.filter((b) => b.stream === 'humanities').length,
    };
  }, []);

  // Category counts (scoped to current stream if engineering or all)
  const categoryCounts = useMemo(() => {
    const scope = ENGINEERING_ROADMAPS.filter((b) => {
      if (b.stream === 'bipc') return false;
      if (selectedStream === 'all') return true;
      return (b.stream || 'engineering') === selectedStream;
    });

    return {
      all: scope.length,
      computing: scope.filter(
        (b) => b.category === 'computing' || b.bannerCategory === 'computing' || b.bannerCategory === 'security'
      ).length,
      electronics: scope.filter(
        (b) => b.category === 'electronics' || b.bannerCategory === 'electronics'
      ).length,
      mechanical: scope.filter(
        (b) => b.category === 'mechanical' || b.bannerCategory === 'mechanical'
      ).length,
      civil: scope.filter(
        (b) => b.category === 'civil' || b.bannerCategory === 'civil'
      ).length,
      biotech: scope.filter(
        (b) => b.category === 'biotech' || b.bannerCategory === 'biotech'
      ).length,
    };
  }, [selectedStream]);

  const handleOpenBranchModal = (branch: BranchRoadmap) => {
    setActiveModalBranch(branch);
    if (onSelectBranch) {
      onSelectBranch(branch.id);
    }
  };

  const handleDownloadPdf = async (branch: BranchRoadmap) => {
    if (isExportingPdf || pdfExportStatus === 'generating') return;
    try {
      setIsExportingPdf(true);
      setPdfExportStatus('generating');
      setPdfErrorMessage(null);
      // Allow UI to render spinner
      await new Promise((resolve) => setTimeout(resolve, 80));
      generateRoadmapPdf(branch);
      setPdfExportStatus('success');
      setTimeout(() => {
        setPdfExportStatus('idle');
      }, 3000);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('PDF export failed:', err);
      }
      setPdfExportStatus('error');
      setPdfErrorMessage('PDF generation failed. Please try again.');
      setTimeout(() => {
        setPdfExportStatus('idle');
        setPdfErrorMessage(null);
      }, 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCardDownloadPdf = (e: React.MouseEvent, branch: BranchRoadmap) => {
    e.stopPropagation();
    handleDownloadPdf(branch);
  };

  const handleShareHub = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div id="engineering-roadmaps-hub" className="space-y-6">
      {/* Top Banner Header: Futuristic Slate/Indigo Tech Grid */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-indigo-500/25 p-5 sm:p-7 shadow-xl">
        {/* Subtle Tech Grid Lines */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#6366f118_1px,transparent_1px),linear-gradient(to_bottom,#6366f118_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Indigo Glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>20+ DEGREE &amp; CAREER BLUEPRINTS • ZERO SERVER CALLS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Curriculum, Engineering &amp; Degree Roadmaps
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Actionable semester blueprints, essential tech stacks, and career roadmaps for students.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="roadmap-share-link"
              onClick={handleShareHub}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold border border-indigo-500/30 transition-all cursor-pointer shadow-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Share Roadmaps Hub</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Search & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-5">
        
        {/* Prominent Stream Selector Toggle (MPC vs BiPC) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Select Academic Gateway</span>
            </label>
            <span className="text-[11px] font-bold text-indigo-600">
              {filteredBranches.length} {filteredBranches.length === 1 ? 'Curriculum Track' : 'Curriculum Tracks'} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              id="track-toggle-mpc"
              onClick={() => {
                setMajorTrack('mpc');
                setSelectedStream('all');
                setSelectedCategory('all');
              }}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                majorTrack === 'mpc'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>💻 MPC &amp; Engineering Streams</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  majorTrack === 'mpc' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {mpcCount}
              </span>
            </button>

            <button
              id="track-toggle-bipc"
              onClick={() => {
                setMajorTrack('bipc');
                setBipcCategory('all');
              }}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                majorTrack === 'bipc'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md ring-2 ring-emerald-400/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Dna className="w-4 h-4" />
              <span>🧬 BiPC &amp; Healthcare / Allied Sciences</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  majorTrack === 'bipc' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {bipcCount}
              </span>
            </button>
          </div>
        </div>

        {/* BiPC Career Hub Informational Spotlight Banner */}
        {majorTrack === 'bipc' && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200/80 text-teal-950 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm tracking-tight text-teal-900">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>BiPC &amp; Healthcare Sciences Career Hub</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-300/60">
                EAPCET BiPC &bull; PCI &bull; ICAR &bull; INC
              </span>
            </div>
            <p className="text-xs text-teal-800/90 leading-relaxed">
              Transparent curriculum blueprints for Andhra Pradesh &amp; Telangana BiPC graduates. Covers 4-Year B.Pharmacy (Formulation &amp; QA/QC), 6-Year Clinical Pharma.D (Hospital Ward Rounds &amp; Pharmacovigilance), ICAR-accredited B.Sc Agriculture (Agri Inputs &amp; IBPS AFO), and INC-registered B.Sc Nursing (Critical Care, AIIMS NORCET &amp; NCLEX-RN).
            </p>
          </div>
        )}

        {/* Stream Switcher Bar (MPC Only: Multi-Discipline Selector) */}
        {majorTrack === 'mpc' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filter by MPC Degree Stream</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              {STREAM_TABS.map((tab) => {
                const count = streamCounts[tab.id as keyof typeof streamCounts] || 0;
                const isSelected = selectedStream === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`stream-tab-${tab.id}`}
                    onClick={() => {
                      setSelectedStream(tab.id);
                      if (tab.id !== 'all' && tab.id !== 'engineering') {
                        setSelectedCategory('all');
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BiPC Category Filter Tabs */}
        {majorTrack === 'bipc' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span>Filter by Healthcare Discipline</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              {BIPC_CATEGORY_TABS.map((tab) => {
                const count = bipcCategoryCounts[tab.id as keyof typeof bipcCategoryCounts] || 0;
                const isSelected = bipcCategory === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`bipc-tab-${tab.id}`}
                    onClick={() => setBipcCategory(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & Counter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Search className={`w-4 h-4 ${majorTrack === 'bipc' ? 'text-teal-600' : 'text-indigo-600'}`} />
              <span>
                {majorTrack === 'bipc'
                  ? 'Filter BiPC & Healthcare Blueprints'
                  : 'Filter Visual Roadmap Directory'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {majorTrack === 'bipc'
                ? 'Search across clinical roles, pharmaceutical tools, ICAR/PCI accreditations, and licensure exams.'
                : 'Search across branch titles, acronyms, career roles, tools, or competitive exams.'}
            </p>
          </div>

          {/* Stats Counter */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="roadmap-stats-counter"
              className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
            >
              Showing {filteredBranches.length} of {majorTrack === 'bipc' ? bipcCount : mpcCount} Blueprints
            </span>
          </div>
        </div>

        {/* Big Search Input with Autocomplete Preview */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${majorTrack === 'bipc' ? 'text-teal-500' : 'text-indigo-500'}`} />
            <input
              id="roadmap-branch-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredBranches.length > 0) {
                    handleOpenBranchModal(filteredBranches[0]);
                    setIsSearchFocused(false);
                  }
                } else if (e.key === 'Escape') {
                  setIsSearchFocused(false);
                }
              }}
              placeholder={
                majorTrack === 'bipc'
                  ? 'Search by program (B.Pharmacy, Pharma.D, B.Sc Agri, Nursing), role (Drug Inspector, Pharmacovigilance, AFO, NORCET)...'
                  : 'Search by branch name, degree (B.Tech, B.Sc, B.Com, B.A.), or role (e.g. CSE, VLSI, Embedded, Robotics)...'
              }
              className={`w-full pl-11 pr-24 py-3 text-xs sm:text-sm rounded-xl border-2 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-900 font-medium ${
                majorTrack === 'bipc'
                  ? 'border-teal-100 focus:ring-teal-500/10 focus:border-teal-600'
                  : 'border-indigo-100 focus:ring-indigo-500/10 focus:border-indigo-600'
              }`}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills & Quick Filter Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Category Tabs for MPC (Shown when All or Engineering is selected) */}
          {majorTrack === 'mpc' && (selectedStream === 'all' || selectedStream === 'engineering') ? (
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {CATEGORY_TABS.map((tab) => {
                const count = categoryCounts[tab.id as keyof typeof categoryCounts] || 0;
                const isSelected = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`filter-tab-${tab.id}`}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>
          ) : majorTrack === 'mpc' ? (
            <div className="text-xs text-slate-500 font-medium py-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <span>Showing dedicated {STREAM_TABS.find((s) => s.id === selectedStream)?.label} career blueprints</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium py-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>EAPCET BiPC &bull; Direct Convener Quota &amp; Licensure Blueprints</span>
            </div>
          )}

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className={`w-3 h-3 ${majorTrack === 'bipc' ? 'text-teal-500' : 'text-indigo-500'}`} />
              Popular:
            </span>
            {(majorTrack === 'bipc' ? POPULAR_QUICK_SEARCHES_BIPC : POPULAR_QUICK_SEARCHES_MPC).map((query) => {
              const isActive = searchQuery.toLowerCase().trim() === query.toLowerCase();
              return (
                <button
                  key={query}
                  type="button"
                  onClick={() => setSearchQuery(isActive ? '' : query)}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? majorTrack === 'bipc'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {query}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Feedback Toast / Banner */}
        {navFeedback && (
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{navFeedback}</span>
            </div>
            <button
              onClick={() => setNavFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* In-Context Recommended Tools & Laptops Banner */}
      <BranchToolsBanner
        onNavigateToStore={onNavigateToStore}
      />

      {/* Visual Directory: 3-Column / 4-Column Grid of Branch Cards */}
      <div className="space-y-4">
        {filteredBranches.length > 0 ? (
          <div
            id="roadmap-cards-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onOpenModal={handleOpenBranchModal}
                onDownloadPdf={handleCardDownloadPdf}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-600">
              No career roadmap matches &quot;<strong>{searchQuery}</strong>&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStream('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {activeModalBranch && (
        <RoadmapModal
          branch={activeModalBranch}
          isOpen={Boolean(activeModalBranch)}
          onClose={handleCloseBranchModal}
          onDownloadPdf={handleDownloadPdf}
          isExportingPdf={isExportingPdf}
          pdfExportStatus={pdfExportStatus}
          pdfErrorMessage={pdfErrorMessage}
          onNavigateToStore={onNavigateToStore}
        />
      )}
    </div>
  );
};
