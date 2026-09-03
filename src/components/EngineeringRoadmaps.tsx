import React, { useState, useMemo } from 'react';
import {
  Compass,
  Download,
  Share2,
  Check,
  Search,
  X,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Terminal,
  Cpu,
  Wrench,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Award,
  DollarSign,
  BookOpen,
  Filter,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import { BranchRoadmap } from '../types';
import { ENGINEERING_ROADMAPS } from '../data/engineeringRoadmapsData';
import { generateRoadmapPdf } from '../utils/roadmapPdfGenerator';

export interface EngineeringRoadmapsProps {
  targetBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
}

const POPULAR_QUICK_SEARCHES = [
  'CSE',
  'AI & ML',
  'Robotics',
  'ECE',
  'VLSI',
  'Cloud',
  'Aerospace',
  'Data Science',
  'Mechanical',
  'Cybersecurity',
  'Civil',
];

const QUICK_COURSE_SHORTCUTS: { label: string; branchId: string }[] = [
  { label: 'CSE Core', branchId: 'cse' },
  { label: 'AI & ML (CSM)', branchId: 'csm' },
  { label: 'Robotics & Automation', branchId: 'robotics' },
  { label: 'ECE', branchId: 'ece' },
  { label: 'VLSI Design', branchId: 'ece-vlsi' },
  { label: 'Data Science (CSD)', branchId: 'csd' },
  { label: 'Cloud & DevOps', branchId: 'cloud' },
  { label: 'Aerospace', branchId: 'aerospace' },
  { label: 'Mechanical', branchId: 'mech' },
  { label: 'Cybersecurity', branchId: 'cybersecurity' },
  { label: 'Civil', branchId: 'civil' },
  { label: 'Software Eng', branchId: 'se' },
];

export const EngineeringRoadmaps: React.FC<EngineeringRoadmapsProps> = ({
  targetBranchId,
  onSelectBranch,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(targetBranchId || 'cse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYearTab, setSelectedYearTab] = useState<number>(1);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [navFeedback, setNavFeedback] = useState<string | null>(null);

  // Sync when targetBranchId prop changes from parent or Command Palette
  React.useEffect(() => {
    if (targetBranchId && targetBranchId !== selectedBranchId) {
      const exists = ENGINEERING_ROADMAPS.some((b) => b.id === targetBranchId);
      if (exists) {
        setSelectedBranchId(targetBranchId);
        setSelectedYearTab(1);
        const match = ENGINEERING_ROADMAPS.find((b) => b.id === targetBranchId);
        if (match) {
          setNavFeedback(`Navigated to ${match.code} — ${match.name}`);
          setTimeout(() => setNavFeedback(null), 3000);
        }
        setTimeout(() => {
          const el = document.getElementById('active-roadmap-view');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [targetBranchId]);

  // Sync when URL hash has ?branch=...
  React.useEffect(() => {
    const handleHashBranch = () => {
      const hash = window.location.hash;
      const match = hash.match(/branch=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const bId = match[1].toLowerCase();
        if (ENGINEERING_ROADMAPS.some((b) => b.id === bId)) {
          setSelectedBranchId(bId);
          setSelectedYearTab(1);
        }
      }
    };
    handleHashBranch();
    window.addEventListener('hashchange', handleHashBranch);
    return () => window.removeEventListener('hashchange', handleHashBranch);
  }, []);

  // Direct navigation handler to a course roadmap
  const handleNavigateToBranch = (branchId: string, clearSearch = false) => {
    const match = ENGINEERING_ROADMAPS.find((b) => b.id === branchId);
    if (!match) return;

    setSelectedBranchId(match.id);
    setSelectedYearTab(1);
    if (clearSearch) {
      setSearchQuery('');
    }
    setIsSearchFocused(false);

    if (onSelectBranch) {
      onSelectBranch(match.id);
    }

    setNavFeedback(`Loaded ${match.code}: ${match.name} 4-Year Roadmap`);
    setTimeout(() => setNavFeedback(null), 3500);

    setTimeout(() => {
      const el = document.getElementById('active-roadmap-view');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Filtered branches for the selector
  const filteredBranches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ENGINEERING_ROADMAPS.filter((b) => {
      // If user is searching, match across all categories so branches like Robotics or ECE are always found
      const matchesCategory =
        q !== '' || selectedCategory === 'all' || b.category === selectedCategory;

      const matchesSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.categoryLabel.toLowerCase().includes(q) ||
        b.strategicOverview.targetRoles.some((r) => r.toLowerCase().includes(q)) ||
        b.strategicOverview.keyCompetitiveExams.some((e) => e.toLowerCase().includes(q)) ||
        b.skillsMatrix.industryTools.some((t) => t.toLowerCase().includes(q)) ||
        b.skillsMatrix.foundational.some((f) => f.toLowerCase().includes(q)) ||
        b.skillsMatrix.advanced.some((a) => a.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Current active roadmap
  const currentRoadmap = useMemo(() => {
    const found = ENGINEERING_ROADMAPS.find((b) => b.id === selectedBranchId);
    return found || ENGINEERING_ROADMAPS[0];
  }, [selectedBranchId]);

  const handleDownloadPdf = () => {
    try {
      setIsExportingPdf(true);
      generateRoadmapPdf(currentRoadmap);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 800);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}#roadmaps?branch=${currentRoadmap.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const categoryCounts = useMemo(() => {
    const counts = {
      all: ENGINEERING_ROADMAPS.length,
      computing: ENGINEERING_ROADMAPS.filter((b) => b.category === 'computing').length,
      electronics: ENGINEERING_ROADMAPS.filter((b) => b.category === 'electronics').length,
      mechanical: ENGINEERING_ROADMAPS.filter((b) => b.category === 'mechanical').length,
      civil: ENGINEERING_ROADMAPS.filter((b) => b.category === 'civil').length,
    };
    return counts;
  }, []);

  return (
    <div id="engineering-roadmaps-hub" className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>24 COUNSELING BRANCH BLUEPRINTS • ZERO SERVER CALLS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Engineering Career &amp; Branch Roadmaps
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Actionable 4-year semester-wise blueprints, essential industry software, high-impact portfolio projects, corporate vs. PSU benchmarks, and 1-click PDF export for all EAPCET &amp; engineering counseling branches.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="roadmap-quick-download-top"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {isExportingPdf ? 'Exporting PDF...' : `Download ${currentRoadmap.code} Roadmap (PDF)`}
            </button>

            <button
              id="roadmap-share-link"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-slate-200 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Roadmap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Decorative background grid effect */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Prominent Course Roadmap Search & Fast Navigator Bar */}
      <div className="relative bg-white rounded-2xl border-2 border-indigo-200/90 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Search className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Search &amp; Jump to Any Course Roadmap
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Type course name, branch code, software tool, or target job role to instantly load its complete 4-year curriculum.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              24 B.Tech Branches Ready
            </span>
          </div>
        </div>

        {/* Big Search Input with Autocomplete Dropdown */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none" />
            <input
              id="roadmap-course-search-bar"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredBranches.length > 0) {
                    handleNavigateToBranch(filteredBranches[0].id);
                  }
                } else if (e.key === 'Escape') {
                  setIsSearchFocused(false);
                }
              }}
              placeholder="Search course roadmap (e.g., Robotics, AI & ML, ECE, VLSI, Cloud, Mechanical, Python, GATE)..."
              className="w-full pl-11 pr-28 py-3 text-xs sm:text-sm rounded-xl border-2 border-indigo-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all placeholder:text-slate-400 text-slate-900 font-medium"
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
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100/70 text-[10px] font-mono font-bold text-indigo-800 pointer-events-none">
                <CornerDownLeft className="w-3 h-3" />
                <span>Jump</span>
              </div>
            </div>
          </div>

          {/* Live Search Autocomplete Dropdown Preview */}
          {searchQuery.trim().length > 0 && isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-indigo-100 p-2 z-30 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Matching Courses ({filteredBranches.length})</span>
                <span className="text-[10px] font-normal text-slate-400">Click to navigate immediately</span>
              </div>

              {filteredBranches.length > 0 ? (
                filteredBranches.slice(0, 8).map((b) => {
                  const isCurrent = b.id === currentRoadmap.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleNavigateToBranch(b.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50 text-indigo-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-600 text-white">
                            {b.code}
                          </span>
                          <span className="text-xs sm:text-sm font-bold truncate">
                            {b.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {b.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xl mt-0.5">
                          {b.strategicOverview.targetRoles.slice(0, 3).join(', ')} • {b.skillsMatrix.industryTools.slice(0, 3).join(', ')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToBranch(b.id);
                        }}
                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No engineering roadmap matching &quot;<strong>{searchQuery}</strong>&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Course Shortcut Buttons */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Popular Course Roadmaps (1-Click Jump):</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_COURSE_SHORTCUTS.map((item) => {
              const isSelected = item.branchId === currentRoadmap.id;
              return (
                <button
                  key={item.branchId}
                  type="button"
                  onClick={() => handleNavigateToBranch(item.branchId)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
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

      {/* Directory & Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              id="filter-category-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Branches ({categoryCounts.all})
            </button>
            <button
              id="filter-category-computing"
              onClick={() => setSelectedCategory('computing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'computing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Computing &amp; Tech ({categoryCounts.computing})
            </button>
            <button
              id="filter-category-electronics"
              onClick={() => setSelectedCategory('electronics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'electronics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Electronics &amp; Electrical ({categoryCounts.electronics})
            </button>
            <button
              id="filter-category-mechanical"
              onClick={() => setSelectedCategory('mechanical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'mechanical'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mechanical &amp; Aero ({categoryCounts.mechanical})
            </button>
            <button
              id="filter-category-civil"
              onClick={() => setSelectedCategory('civil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'civil'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Civil &amp; Infra ({categoryCounts.civil})
            </button>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="branch-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branch (CSE, Robotics, ECE, AI)..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[11px]">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Quick:
          </span>
          {POPULAR_QUICK_SEARCHES.map((query) => {
            const isActive = searchQuery.toLowerCase().trim() === query.toLowerCase();
            return (
              <button
                key={query}
                type="button"
                onClick={() => setSearchQuery(isActive ? '' : query)}
                className={`px-2 py-0.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
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

        {/* Search Results Feedback Bar if search is active */}
        {searchQuery && (
          <div className="flex items-center justify-between text-xs px-2 py-1 bg-indigo-50/60 border border-indigo-100 rounded-lg text-indigo-900">
            <span>
              Showing <strong>{filteredBranches.length}</strong> {filteredBranches.length === 1 ? 'branch' : 'branches'} matching &quot;{searchQuery}&quot;
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Branch Quick Selection Pills Grid */}
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {filteredBranches.map((b) => {
            const isSelected = b.id === currentRoadmap.id;
            return (
              <button
                key={b.id}
                id={`select-branch-${b.id}`}
                onClick={() => {
                  setSelectedBranchId(b.id);
                  setSelectedYearTab(1); // Reset to Year 1 when changing branch
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <span className="font-bold">{b.code}</span>
                <span className={`text-[11px] truncate max-w-[150px] ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {b.name}
                </span>
                {searchQuery && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200/80 text-slate-600'}`}>
                    {b.categoryLabel.split('&')[0].trim()}
                  </span>
                )}
              </button>
            );
          })}

          {filteredBranches.length === 0 && (
            <div className="py-6 text-center w-full space-y-2">
              <p className="text-xs text-slate-500">
                No engineering branch found matching &quot;<strong>{searchQuery}</strong>&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Search &amp; Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Branch Active Roadmap Card */}
      <div id="active-roadmap-view" className="space-y-6">
        {/* Branch Headline Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-indigo-100 text-indigo-800">
                  {currentRoadmap.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                  {currentRoadmap.categoryLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {currentRoadmap.badge}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {currentRoadmap.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                {currentRoadmap.tagline}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                id="download-pdf-button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4 text-indigo-300" />
                {isExportingPdf ? 'Exporting...' : 'Download PDF'}
              </button>
            </div>
          </div>

          {/* Salary Tiers Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Entry Tier (0–2 Yrs)
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900">
                {currentRoadmap.strategicOverview.salaryBrackets.entryTier}
              </div>
              <div className="text-[11px] text-slate-500">Day-1 Campus / Core hiring</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mid Tier (3–6 Yrs)
              </div>
              <div className="text-base sm:text-lg font-extrabold text-indigo-700">
                {currentRoadmap.strategicOverview.salaryBrackets.midTier}
              </div>
              <div className="text-[11px] text-slate-500">Lead engineer &amp; domain specialist</div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                Peak / Product Tier
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900">
                {currentRoadmap.strategicOverview.salaryBrackets.peakTier}
              </div>
              <div className="text-[11px] text-slate-600">Tier-1 Product / R&amp;D MNC / Remote US</div>
            </div>
          </div>
        </div>

        {/* Strategic Analysis & Viability Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Corporate vs Govt Viability */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Briefcase className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Industry Viability &amp; PSU Pathways
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Corporate Market:</span>
                  <span className="text-xs font-bold text-indigo-600">
                    {currentRoadmap.strategicOverview.corporateViability}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {currentRoadmap.strategicOverview.corporateSummary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Govt &amp; PSU Recruitment:</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {currentRoadmap.strategicOverview.govtPsuViability}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {currentRoadmap.strategicOverview.govtPsuSummary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="font-semibold text-slate-900 text-xs">Primary Target Roles:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoadmap.strategicOverview.targetRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="font-semibold text-slate-900 text-xs">Benchmark Competitive Exams:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoadmap.strategicOverview.keyCompetitiveExams.map((exam) => (
                    <span
                      key={exam}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                    >
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Platform Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Layers className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Skills &amp; Industry Platforms Matrix
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800">Foundational Core Disciplines:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoadmap.skillsMatrix.foundational.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Advanced &amp; Specialization Topics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoadmap.skillsMatrix.advanced.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 font-medium border border-indigo-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Essential Software, EDA, Simulators &amp; Platforms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRoadmap.skillsMatrix.industryTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 text-slate-100 font-mono font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Year Semester-Wise Action Plan */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <GraduationCap className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  4-Year Semester-Wise Action Plan
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive semester-by-semester technical curriculum, tools, projects, and placement milestones.
              </p>
            </div>

            {/* Year Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  id={`select-year-tab-${year}`}
                  onClick={() => setSelectedYearTab(year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedYearTab === year
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Year {year}
                </button>
              ))}
            </div>
          </div>

          {/* Active Year Content */}
          {(() => {
            const activeYearData =
              currentRoadmap.years.find((y) => y.yearNumber === selectedYearTab) ||
              currentRoadmap.years[0];

            return (
              <div className="space-y-5">
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5">
                  <div className="text-xs font-bold text-indigo-900">
                    {activeYearData.yearTitle}
                  </div>
                  <div className="text-xs text-indigo-700 mt-0.5">
                    Theme: {activeYearData.theme}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeYearData.semesters.map((sem) => (
                    <div
                      key={sem.semNumber}
                      className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {sem.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-100 text-indigo-800 shrink-0">
                          Sem {sem.semNumber}
                        </span>
                      </div>

                      {/* Core Subjects */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Core Subjects &amp; Mathematics:
                        </span>
                        <ul className="space-y-0.5 text-xs text-slate-700">
                          {sem.coreSubjects.map((sub, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Industry Skills */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Industry Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sem.industrySkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-white border border-slate-200 text-slate-700 font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tools & Platforms */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Platforms &amp; Software:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sem.toolsAndPlatforms.map((tool, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-slate-900 text-slate-100 font-mono"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio Projects */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                          Key Portfolio Projects:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-800">
                          {sem.keyProjects.map((proj, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="font-medium">{proj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Milestones & Placement */}
                      <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                        <div>
                          <span className="font-bold text-slate-900">Internship Milestone: </span>
                          <span className="text-slate-600">{sem.internshipOrMilestone}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">Placement / Exam Prep: </span>
                          <span className="text-slate-600">{sem.examOrPlacementPrep}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Pro Tips for Cracking Tier-1 Placements */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 text-white shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-300">
            <Award className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Insider Strategy: Cracking Tier-1 Placements &amp; Off-Campus Drives ({currentRoadmap.code})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-300">
            {currentRoadmap.proTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1.5"
              >
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 border border-indigo-400/30">
                    {idx + 1}
                  </span>
                  <span>Strategic Directives</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs text-slate-400">
            <span>
              Branded Document Export powered by{' '}
              <strong className="text-white">StudyMacha (studymacha.pages.dev)</strong>
            </span>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 active:scale-98 text-white font-semibold transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full {currentRoadmap.code} Blueprint (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
