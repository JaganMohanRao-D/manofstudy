import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Users,
  Search,
  Flame,
  Award,
  BookOpen,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { getCollegeList, getCollegeDetails, AllotmentYear, CollegeDetailData } from '../../services/apEapcetAllotmentService';
import { computeBranchAnalytics } from '../../services/apEapcet2025AllotmentService';
import APDatasetStats from './APDatasetStats';
import APCollegeSelector from './APCollegeSelector';
import APBranchSelector, { BranchOption } from './APBranchSelector';
import APCategoryInsights from './APCategoryInsights';
import APFilters, { FilterState } from './APFilters';
import APAllotmentTable from './APAllotmentTable';
import APStudentSearch from './APStudentSearch';

interface APAllotmentExplorerProps {
  initialCollegeCode?: string;
  initialBranchCode?: string;
  initialTab?: 'college' | 'student-search' | 'rank-search';
  onNavigateToTab?: (tabId: string) => void;
}

export const APAllotmentExplorer: React.FC<APAllotmentExplorerProps> = ({
  initialCollegeCode = 'ALL',
  initialBranchCode = 'ALL',
  initialTab = 'college',
}) => {
  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'college' | 'student-search' | 'rank-search'>(
    initialTab
  );

  const [selectedYear, setSelectedYear] = useState<AllotmentYear>('2026');

  // College & Branch Selection State
  const [selectedCollegeCode, setSelectedCollegeCode] = useState<string>('ALL');
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>(initialBranchCode);

  const [collegesList, setCollegesList] = useState<any[]>([]);

  // Data Loading States
  const [collegeData, setCollegeData] = useState<CollegeDetailData | null>(null);
  const [isLoadingCollege, setIsLoadingCollege] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Advanced Filters State
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    allottedCategory: 'ALL',
    gender: 'ALL',
    region: 'ALL',
    phase: 'ALL',
    minRank: '',
    maxRank: '',
  });

  useEffect(() => {
    getCollegeList(selectedYear).then(setCollegesList).catch(() => setCollegesList([]));
    setSelectedCollegeCode('ALL');
    setSelectedBranchCode('ALL');
    setCollegeData(null);
    setFilters({ category:'ALL', allottedCategory:'ALL', gender:'ALL', region:'ALL', phase:'ALL', minRank:'', maxRank:'' });
  }, [selectedYear]);

  // Sync prop changes
  useEffect(() => {
    if (initialCollegeCode && initialCollegeCode !== selectedCollegeCode) {
      setSelectedCollegeCode(initialCollegeCode);
    }
  }, [initialCollegeCode]);

  useEffect(() => {
    if (initialBranchCode && initialBranchCode !== selectedBranchCode) {
      setSelectedBranchCode(initialBranchCode);
    }
  }, [initialBranchCode]);

  // Load college data whenever selectedCollegeCode changes
  const loadCollege = useCallback(async (code: string) => {
    if (!code || code === 'ALL') return;
    setIsLoadingCollege(true);
    setLoadError(null);

    try {
      const data = await getCollegeDetails(selectedYear, code);
      if (!data) {
        setCollegeData(null);
        setLoadError(
          `College [${code}] allotment data could not be loaded or is compiling for this counseling phase.`
        );
      } else {
        setCollegeData(data);
        setLoadError(null);
      }
    } catch (err) {
      console.warn(`Error loading college ${code}:`, err);
      setCollegeData(null);
      setLoadError(`Unable to load data for college [${code}].`);
    } finally {
      setIsLoadingCollege(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    loadCollege(selectedCollegeCode);
  }, [selectedCollegeCode, loadCollege]);

  // Available branches inside this college
  const branchOptions: BranchOption[] = useMemo(() => {
    if (!collegeData || !collegeData.branches) return [];
    return collegeData.branches.map((b) => ({
      branchCode: b.branch_code,
      branchName: b.branch_name,
      recordCount: b.recordCount,
    }));
  }, [collegeData]);

  // If selected branch does not exist in the newly selected college, fallback to 'ALL'
  useEffect(() => {
    if (selectedBranchCode !== 'ALL' && branchOptions.length > 0) {
      const exists = branchOptions.some((b) => b.branchCode === selectedBranchCode);
      if (!exists) {
        setSelectedBranchCode('ALL');
      }
    }
  }, [branchOptions, selectedBranchCode]);

  // Selected Branch Name
  const currentBranchName = useMemo(() => {
    if (selectedBranchCode === 'ALL') return 'All Branches (College-wide)';
    const found = branchOptions.find((b) => b.branchCode === selectedBranchCode);
    return found ? found.branchName : selectedBranchCode;
  }, [selectedBranchCode, branchOptions]);

  // Base raw records for the selected branch/college
  const baseRecords = useMemo(() => {
    if (!collegeData) return [];
    if (selectedBranchCode === 'ALL') {
      return collegeData.allRecords;
    }
    const branch = collegeData.branches.find((b) => b.branch_code === selectedBranchCode);
    return branch ? branch.records : [];
  }, [collegeData, selectedBranchCode]);

  // Compute available filter options that actually occur in the base records
  const availableFilterOptions = useMemo(() => {
    const cats = new Set<string>();
    const alloted = new Set<string>();
    const regions = new Set<string>();
    const phases = new Set<number>();

    baseRecords.forEach((r) => {
      if (r.category) cats.add(r.category);
      if (r.alloted_category) alloted.add(r.alloted_category);
      if (r.region) regions.add(r.region);
      if (r.phase) phases.add(r.phase);
    });

    return {
      categories: Array.from(cats).sort(),
      allottedCategories: Array.from(alloted).sort(),
      regions: Array.from(regions).sort(),
      phases: Array.from(phases).sort((a, b) => a - b),
    };
  }, [baseRecords]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'ALL') count++;
    if (filters.allottedCategory !== 'ALL') count++;
    if (filters.gender !== 'ALL') count++;
    if (filters.region !== 'ALL') count++;
    if (filters.phase !== 'ALL') count++;
    if (filters.minRank.trim() !== '') count++;
    if (filters.maxRank.trim() !== '') count++;
    return count;
  }, [filters]);

  // Filtered records based on advanced filters
  const filteredRecords = useMemo(() => {
    let list = baseRecords;

    if (filters.category !== 'ALL') {
      list = list.filter((r) => r.category === filters.category);
    }

    if (filters.allottedCategory !== 'ALL') {
      list = list.filter((r) => r.alloted_category === filters.allottedCategory);
    }

    if (filters.gender !== 'ALL') {
      list = list.filter((r) => r.gender === filters.gender);
    }

    if (filters.region !== 'ALL') {
      list = list.filter((r) => r.region === filters.region);
    }

    if (filters.phase !== 'ALL') {
      const p = Number(filters.phase);
      list = list.filter((r) => r.phase === p);
    }

    if (filters.minRank.trim() !== '') {
      const min = parseInt(filters.minRank, 10);
      if (!isNaN(min)) {
        list = list.filter((r) => r.rank >= min);
      }
    }

    if (filters.maxRank.trim() !== '') {
      const max = parseInt(filters.maxRank, 10);
      if (!isNaN(max)) {
        list = list.filter((r) => r.rank <= max);
      }
    }

    return list;
  }, [baseRecords, filters]);

  // Analytics calculated dynamically from filtered records
  const branchAnalytics = useMemo(() => {
    return computeBranchAnalytics(filteredRecords);
  }, [filteredRecords]);

  // Reset filters handler
  const handleResetFilters = () => {
    setFilters({
      category: 'ALL',
      allottedCategory: 'ALL',
      gender: 'ALL',
      region: 'ALL',
      phase: 'ALL',
      minRank: '',
      maxRank: '',
    });
  };

  // Change single filter handler
  const handleChangeFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handler for jumping directly to explore a specific college + branch from search
  const handleJumpToCollegeBranch = (collegeCode: string, branchCode?: string) => {
    if (collegeCode) setSelectedCollegeCode(collegeCode);
    if (branchCode) setSelectedBranchCode(branchCode);
    setActiveTab('college');
    handleResetFilters();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* 1. BRANDING & HEADER */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide shadow-sm">
            <Flame className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-pulse" />
            <span>AP EAPCET Allotment Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            AP Allotments (Namewise)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed px-1">
            Search AP EAPCET allotments by student name, rank, college, branch and phase.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-300">Choose Allotment Year
              <select value={selectedYear} onChange={e=>setSelectedYear(e.target.value as AllotmentYear)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                <option value="2026">2026 All Phases</option>
                <option value="2025">2025 All Phases</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-300">College
              <select value={selectedCollegeCode} onChange={e=>{setSelectedCollegeCode(e.target.value);setSelectedBranchCode('ALL');handleResetFilters();}} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                <option value="ALL">All Colleges</option>
                {collegesList.map(c=><option key={c.collegeCode} value={c.collegeCode}>{c.collegeName} ({c.collegeCode})</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* 3. MAIN NAVIGATION TABS */}
        <div className="flex justify-center pt-1">
          <div className="inline-flex flex-wrap justify-center p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('college')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'college'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Explore by College &amp; Branch</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('student-search')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student-search'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Student Name</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rank-search')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'rank-search'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Explore a Rank / Range</span>
            </button>
          </div>
        </div>

        {/* 4. TAB 1: EXPLORE BY COLLEGE & BRANCH */}
        {activeTab === 'college' && (
          <div className="space-y-4 sm:space-y-6">

            {/* Selectors Card (College + Branch) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* College Combobox */}
                <APCollegeSelector
                  colleges={collegesList}
                  selectedCollegeCode={selectedCollegeCode}
                  onSelectCollege={(code) => {
                    setSelectedCollegeCode(code);
                    setSelectedBranchCode('ALL');
                    handleResetFilters();
                  }}
                  isLoading={isLoadingCollege}
                />

                {/* Branch Selector */}
                <APBranchSelector
                  branches={branchOptions}
                  selectedBranchCode={selectedBranchCode}
                  onSelectBranch={(code) => {
                    setSelectedBranchCode(code);
                    handleResetFilters();
                  }}
                  totalCollegeRecords={collegeData?.recordCount || 0}
                />
              </div>

              {/* Advanced Filter Strip */}
              <APFilters
                filters={filters}
                onChangeFilter={handleChangeFilter}
                onResetFilters={handleResetFilters}
                availableCategories={availableFilterOptions.categories}
                availableAllottedCategories={availableFilterOptions.allottedCategories}
                availableRegions={availableFilterOptions.regions}
                availablePhases={availableFilterOptions.phases}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Loading Indicator */}
            {isLoadingCollege && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  Loading allotment data for [{selectedCollegeCode}]...
                </p>
              </div>
            )}

            {/* Error State */}
            {loadError && !isLoadingCollege && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-amber-300">{loadError}</h4>
                  <p className="text-slate-400">Please choose another institution from the selector.</p>
                </div>
              </div>
            )}

            {/* College & Branch Content */}
            {!isLoadingCollege && collegeData && (
              <div className="space-y-4 sm:space-y-6">
                {/* Category-Wise Best & Last Ranks + Gender Distribution */}
                <APCategoryInsights
                  analytics={branchAnalytics}
                  collegeName={collegeData.college_name}
                  collegeCode={collegeData.college_code}
                  branchName={currentBranchName}
                  branchCode={selectedBranchCode}
                  selectedCategoryFilter={filters.category}
                  onSelectCategoryFilter={(cat) => handleChangeFilter('category', cat)}
                />

                {/* Allotted Students Sortable Table */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        Allotted Students [{selectedCollegeCode} — {selectedBranchCode}]
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {filteredRecords.length.toLocaleString()} verified student allotments in this selection
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {filteredRecords.length} Seats
                    </span>
                  </div>

                  <APAllotmentTable
                    records={filteredRecords}
                    collegeCode={selectedCollegeCode}
                    collegeName={collegeData.college_name}
                    branchCode={selectedBranchCode}
                    branchName={currentBranchName}
                  />
                </div>
              </div>
            )}

          </div>
        )}

        {/* 5. TAB 2: SEARCH STUDENT BY NAME */}
        {activeTab === 'student-search' && (
          <APStudentSearch onExploreCollegeBranch={handleJumpToCollegeBranch} />
        )}

        {/* 6. TAB 3: SEARCH BY RANK / RANK RANGE */}
        {activeTab === 'rank-search' && (
          <APStudentSearch onExploreCollegeBranch={handleJumpToCollegeBranch} />
        )}

        {/* 7. MANDATORY DISCLAIMER */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-center text-[11px] text-slate-500 max-w-4xl mx-auto leading-relaxed">
          <p>
            <strong className="text-slate-400">Disclaimer:</strong> These insights are based on the selected AP EAPCET allotment dataset and are for reference only.</p>
        </div>

      </div>
    </div>
  );
};
export default APAllotmentExplorer;
