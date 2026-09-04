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
} from 'lucide-react';
import { BranchRoadmap } from '../types';
import { ENGINEERING_ROADMAPS } from '../data/engineeringRoadmapsData';
import { generateRoadmapPdf } from '../utils/roadmapPdfGenerator';
import { BranchCard } from './roadmaps/BranchCard';
import { RoadmapModal } from './roadmaps/RoadmapModal';
import { CleanAdBanner } from './CleanAdBanner';

export interface EngineeringRoadmapsProps {
  targetBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
}

const POPULAR_QUICK_SEARCHES = [
  'CSE',
  'AI & ML',
  'Data Science',
  'VLSI',
  'Embedded',
  'IoT',
  'Robotics',
  'Aerospace',
  'ECE',
  'Mechanical',
  'Civil',
  'Cybersecurity',
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Branches' },
  { id: 'computing', label: 'Computing & AI' },
  { id: 'electronics', label: 'Electronics & Hardware' },
  { id: 'mechanical', label: 'Mechanical & Aero' },
  { id: 'civil', label: 'Civil & Core' },
];

export const EngineeringRoadmaps: React.FC<EngineeringRoadmapsProps> = ({
  targetBranchId,
  onSelectBranch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalBranch, setActiveModalBranch] = useState<BranchRoadmap | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
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
          setActiveModalBranch(match);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filtered branches list based on search and category
  const filteredBranches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return ENGINEERING_ROADMAPS.filter((b) => {
      // Category filter
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
        }
      }

      // Query filter
      if (!q) return true;

      const inCode = b.code.toLowerCase().includes(q);
      const inName = b.name.toLowerCase().includes(q);
      const inAcronym = (b.acronym || '').toLowerCase().includes(q);
      const inId = b.id.toLowerCase().includes(q);
      const inTagline = b.tagline.toLowerCase().includes(q);
      const inRoles = b.strategicOverview.targetRoles.some((r) => r.toLowerCase().includes(q));
      const inTools = b.skillsMatrix.industryTools.some((t) => t.toLowerCase().includes(q));

      return inCode || inName || inAcronym || inId || inTagline || inRoles || inTools;
    });
  }, [searchQuery, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: ENGINEERING_ROADMAPS.length,
      computing: ENGINEERING_ROADMAPS.filter(
        (b) => b.category === 'computing' || b.bannerCategory === 'computing' || b.bannerCategory === 'security'
      ).length,
      electronics: ENGINEERING_ROADMAPS.filter(
        (b) => b.category === 'electronics' || b.bannerCategory === 'electronics'
      ).length,
      mechanical: ENGINEERING_ROADMAPS.filter(
        (b) => b.category === 'mechanical' || b.bannerCategory === 'mechanical'
      ).length,
      civil: ENGINEERING_ROADMAPS.filter(
        (b) => b.category === 'civil' || b.bannerCategory === 'civil'
      ).length,
    };
  }, []);

  const handleOpenBranchModal = (branch: BranchRoadmap) => {
    setActiveModalBranch(branch);
    if (onSelectBranch) {
      onSelectBranch(branch.id);
    }
  };

  const handleDownloadPdf = async (branch: BranchRoadmap) => {
    try {
      setIsExportingPdf(true);
      // Allow UI to render spinner
      await new Promise((resolve) => setTimeout(resolve, 60));
      generateRoadmapPdf(branch);
    } catch (err) {
      console.error('PDF export failed:', err);
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
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>24 B.TECH COUNSELING BLUEPRINTS • ZERO SERVER CALLS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Engineering Career &amp; Branch Roadmaps
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Actionable 4-year semester blueprints, essential industry tech stacks, Tier-1 vs Tier-3 recruitment reality, high-impact portfolio projects, and 1-click PDF downloads for all major engineering branches.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="roadmap-share-link"
              onClick={handleShareHub}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-slate-200 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Roadmaps Hub</span>
                </>
              )}
            </button>

            {/* SmartLink Educational Callout Pill */}
            <a
              id="roadmap-smartlink-banner"
              href="https://www.profitableratecpmnetwork.com/sb7m20ujb?key=eddca7b7e2f0ff83646873b5bc091020"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 active:scale-98 text-indigo-200 hover:text-white text-xs sm:text-sm font-semibold border border-indigo-400/30 transition-all shadow-xs group"
              title="Verified partner technical internships, free certifications & job drives"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Explore Top Tech Internships &amp; Certifications</span>
              <span className="font-bold text-indigo-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </a>
          </div>
        </div>

        {/* Decorative background grid effect */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Real-time Search & Navigation Bar */}
      <div className="bg-white rounded-2xl border-2 border-indigo-100 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Explore Visual Roadmap Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Search across branch titles, acronyms, career roles, tools, or competitive exams.
            </p>
          </div>

          {/* Stats Counter & SmartLink action pill */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              id="roadmap-smartlink-toolbar"
              href="https://www.profitableratecpmnetwork.com/sb7m20ujb?key=eddca7b7e2f0ff83646873b5bc091020"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-200/80 transition-all shadow-2xs group"
              title="Verified tech internships, free certifications & job drives"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explore Top Tech Internships &amp; Certifications</span>
              <span className="font-bold text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </a>

            <span
              id="roadmap-stats-counter"
              className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
            >
              Showing {filteredBranches.length} of {ENGINEERING_ROADMAPS.length} Engineering Branches
            </span>
          </div>
        </div>

        {/* Big Search Input with Autocomplete Preview */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none" />
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
              placeholder="Search by branch name, code, or role (e.g. CSE, AI & ML, Robotics, VLSI, Aerospace, Embedded, GATE)..."
              className="w-full pl-11 pr-24 py-3 text-xs sm:text-sm rounded-xl border-2 border-indigo-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all placeholder:text-slate-400 text-slate-900 font-medium"
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
          {/* Category Tabs */}
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

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Popular:
            </span>
            {POPULAR_QUICK_SEARCHES.map((query) => {
              const isActive = searchQuery.toLowerCase().trim() === query.toLowerCase();
              return (
                <button
                  key={query}
                  type="button"
                  onClick={() => setSearchQuery(isActive ? '' : query)}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600'
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
              No engineering branch matches &quot;<strong>{searchQuery}</strong>&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        )}
      </div>

      {/* Clean Iframe Adsterra Display Banner */}
      <CleanAdBanner />

      {/* Detailed Modal */}
      {activeModalBranch && (
        <RoadmapModal
          branch={activeModalBranch}
          isOpen={Boolean(activeModalBranch)}
          onClose={handleCloseBranchModal}
          onDownloadPdf={handleDownloadPdf}
          isExportingPdf={isExportingPdf}
        />
      )}
    </div>
  );
};
