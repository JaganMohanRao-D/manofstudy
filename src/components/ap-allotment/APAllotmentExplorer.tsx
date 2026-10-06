import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  AllotmentYear,
  AllotmentRecord,
  PhaseFilter,
  getAvailableBranches,
  getAvailableDistricts,
  getCollegeDetails,
  getCollegeList,
  getDatasetSummary,
  searchAllotments,
} from '../../services/apEapcetAllotmentService';
import APCollegeSelector from './APCollegeSelector';
import APBranchSelector, { BranchOption } from './APBranchSelector';
import ApTopColleges from '../ApTopColleges';
import ApOverallRankInsights from '../ApOverallRankInsights';

export interface APAllotmentExplorerProps {
  initialCollegeCode?: string;
  initialBranchCode?: string;
  initialTab?: 'college' | 'student-search' | 'rank-search';
  onNavigateToTab?: (tabId: string) => void;
}

const PHASE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '2026:ALL', label: '2026 All Phases' },
  { value: '2026:1', label: '2026 1st Phase' },
  { value: '2026:2', label: '2026 2nd Phase' },
  { value: '2026:3', label: '2026 3rd Phase' },
  { value: '2025:ALL', label: '2025 All Phases' },
  { value: '2025:1', label: '2025 1st Phase' },
  { value: '2025:2', label: '2025 2nd Phase' },
];

const SEAT_CATEGORY_OPTIONS = [
  'OC_GEN_UR', 'OC_GEN_OU', 'OC_GIRLS_UR', 'OC_GIRLS_OU',
  'BC_A_GEN_OU', 'BC_B_GEN_OU', 'BC_C_GEN_OU', 'BC_D_GEN_OU', 'BC_E_GEN_OU',
  'SC_GEN_OU', 'ST_GEN_OU', 'EWS_GEN_OU',
];

const PAGE_SIZE = 30;

function normalizeText(value: unknown) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatRank(value: number) {
  return value > 0 ? value.toLocaleString() : '—';
}

function ResultCard({ record, index }: { record: AllotmentRecord; index: number }) {
  const genderLabel = record.gender === 'F' ? 'Girls' : record.gender === 'M' ? 'Boys' : record.gender || '—';
  const genderClass = record.gender === 'F'
    ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:border-fuchsia-500/20'
    : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20';

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400">#{index}</span>
            <h3 className="truncate text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white" title={record.cand_name}>
              {record.cand_name || 'Unknown Candidate'}
            </h3>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">HT: {record.roll_no || '—'}</div>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-black text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          #{formatRank(record.rank)}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex items-start gap-2 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
          <span className="shrink-0 font-mono font-black text-sky-600 dark:text-sky-300">[{record.college_code}]</span>
          <span className="truncate" title={record.college_name}>{record.college_name || 'College unavailable'}</span>
        </div>
        <div className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400" title={record.branch_name}>
          {record.branch_code} · {record.branch_name || 'Branch unavailable'}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${genderClass}`}>{genderLabel}</span>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">{record.category || '—'}</span>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">{record.region || '—'}</span>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 font-mono text-[9px] font-bold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">{record.alloted_category || '—'}</span>
        <span className="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">Phase {record.phase || '—'}</span>
      </div>
    </article>
  );
}

export const APAllotmentExplorer: React.FC<APAllotmentExplorerProps> = ({
  initialCollegeCode = 'ALL',
  initialBranchCode = 'ALL',
}) => {
  const [activeExplorerTab, setActiveExplorerTab] = useState<'explorer' | 'top-colleges' | 'insights'>('explorer');
  const [selectedYear, setSelectedYear] = useState<AllotmentYear>('2026');
  const [selectedPhase, setSelectedPhase] = useState<PhaseFilter>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(initialCollegeCode || 'ALL');
  const [selectedBranchCode, setSelectedBranchCode] = useState(initialBranchCode || 'ALL');
  const [collegesList, setCollegesList] = useState<any[]>([]);
  const [collegeData, setCollegeData] = useState<any>(null);
  const [datasetSummary, setDatasetSummary] = useState<any>(null);
  const [datasetBranches, setDatasetBranches] = useState<BranchOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [casteFilter, setCasteFilter] = useState('ALL');
  const [seatCategoryFilter, setSeatCategoryFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [results, setResults] = useState<AllotmentRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const phaseValue = `${selectedYear}:${selectedPhase}`;
  const districtOptions = useMemo(() => getAvailableDistricts(collegesList), [collegesList]);

  const filteredColleges = useMemo(() => {
    if (selectedDistrict === 'ALL') return collegesList;
    return collegesList.filter((college) => normalizeText(college.district) === normalizeText(selectedDistrict));
  }, [collegesList, selectedDistrict]);

  const collegeSelectorItems = useMemo(() => filteredColleges.map((college) => ({
    collegeCode: college.collegeCode,
    collegeName: college.collegeName,
    file: college.file,
    hasData: true,
    recordCount: college.recordCount,
    minRank: 0,
    maxRank: 0,
    branchCount: 0,
    branches: [],
  })), [filteredColleges]);

  const resetSearch = useCallback(() => {
    setResults([]);
    setHasSearched(false);
    setSearchError(null);
    setCurrentPage(1);
  }, []);

  const loadDataset = useCallback(async (year: AllotmentYear) => {
    setIsLoading(true);
    setLoadError(null);
    setCollegeData(null);
    resetSearch();
    try {
      const [list, summary, branches] = await Promise.all([
        getCollegeList(year),
        getDatasetSummary(year),
        getAvailableBranches(year),
      ]);
      setCollegesList(list);
      setDatasetSummary(summary);
      setDatasetBranches(branches.map((branch) => ({ ...branch, recordCount: 0 })));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load AP EAPCET allotment data.');
      setCollegesList([]);
      setDatasetSummary(null);
      setDatasetBranches([]);
    } finally {
      setIsLoading(false);
    }
  }, [resetSearch]);

  useEffect(() => {
    void loadDataset(selectedYear);
  }, [loadDataset, selectedYear]);

  useEffect(() => {
    let cancelled = false;
    if (selectedCollegeCode === 'ALL') {
      setCollegeData(null);
      return () => { cancelled = true; };
    }

    setIsLoading(true);
    getCollegeDetails(selectedYear, selectedCollegeCode)
      .then((data) => {
        if (cancelled) return;
        setCollegeData(data);
        if (data && selectedBranchCode !== 'ALL' && !data.branches.some((branch: any) => branch.branch_code === selectedBranchCode)) {
          setSelectedBranchCode('ALL');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setCollegeData(null);
          setLoadError(error instanceof Error ? error.message : 'Unable to load selected AP college.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedYear, selectedCollegeCode]);

  const branchOptions = useMemo<BranchOption[]>(() => {
    if (selectedCollegeCode === 'ALL') return datasetBranches;
    return (collegeData?.branches ?? []).map((branch: any) => ({
      branchCode: branch.branch_code,
      branchName: branch.branch_name,
      recordCount: branch.recordCount,
    }));
  }, [collegeData, datasetBranches, selectedCollegeCode]);

  const categoryOptions = useMemo(() => {
    const categories = Array.isArray(datasetSummary?.categories) ? datasetSummary.categories.map(String) : [];
    return Array.from(new Set(categories)).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [datasetSummary]);

  const localRecords = useMemo(() => {
    if (!collegeData?.allRecords) return [] as AllotmentRecord[];
    return collegeData.allRecords.filter((record: AllotmentRecord) => {
      if (selectedPhase !== 'ALL' && record.phase !== Number(selectedPhase)) return false;
      if (selectedBranchCode !== 'ALL' && record.branch_code !== selectedBranchCode) return false;
      if (genderFilter !== 'ALL' && record.gender !== genderFilter) return false;
      if (casteFilter !== 'ALL' && record.category !== casteFilter) return false;
      if (seatCategoryFilter !== 'ALL' && record.alloted_category !== seatCategoryFilter) return false;
      return true;
    }).sort((a: AllotmentRecord, b: AllotmentRecord) => sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank);
  }, [collegeData, selectedPhase, selectedBranchCode, genderFilter, casteFilter, seatCategoryFilter, sortOrder]);

  const runGlobalSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      resetSearch();
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const numericQuery = /^\d+$/.test(trimmed.replace(/,/g, ''));
      const filtered = await searchAllotments(selectedYear, {
        nameQuery: numericQuery ? undefined : trimmed,
        exactRank: numericQuery ? Number(trimmed.replace(/,/g, '')) : undefined,
        collegeCode: 'ALL',
        branchCode: selectedBranchCode,
        category: casteFilter,
        allottedCategory: seatCategoryFilter,
        gender: genderFilter,
        phase: selectedPhase,
        limit: 1000,
      });
      const ordered = [...filtered].sort((a, b) => sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank);
      setResults(ordered);
      if (!ordered.length) setSearchError('No AP allotment records matched this search.');
    } catch (error) {
      setResults([]);
      setSearchError(error instanceof Error ? error.message : 'AP student search is temporarily unavailable.');
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedYear, selectedBranchCode, casteFilter, seatCategoryFilter, genderFilter, selectedPhase, sortOrder, resetSearch]);

  const displayRecords = useMemo(() => {
    if (hasSearched) return results;
    if (selectedCollegeCode !== 'ALL') return localRecords;
    return [] as AllotmentRecord[];
  }, [hasSearched, results, selectedCollegeCode, localRecords]);

  const totalPages = Math.max(1, Math.ceil(displayRecords.length / PAGE_SIZE));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return displayRecords.slice(start, start + PAGE_SIZE);
  }, [displayRecords, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const selectedCollegeName = selectedCollegeCode === 'ALL'
    ? 'All Colleges (Statewide)'
    : collegesList.find((college) => college.collegeCode === selectedCollegeCode)?.collegeName || selectedCollegeCode;

  const handleCollegeChange = (code: string) => {
    setSelectedCollegeCode(code);
    setSelectedBranchCode('ALL');
    resetSearch();
  };

  const handlePhaseChange = (value: string) => {
    const [year, phase] = value.split(':') as [AllotmentYear, PhaseFilter];
    setSelectedYear(year);
    setSelectedPhase(phase);
    setSelectedCollegeCode('ALL');
    setSelectedBranchCode('ALL');
    resetSearch();
  };

  const handleJumpToCollegeBranch = (collegeCode: string, branchCode?: string) => {
    setSelectedCollegeCode(collegeCode || 'ALL');
    setSelectedBranchCode(branchCode || 'ALL');
    setActiveExplorerTab('explorer');
    resetSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageStart = displayRecords.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, displayRecords.length);

  return (
    <div className="mos-ap-explorer min-h-screen bg-[var(--mos-page-bg)] px-3 py-5 font-sans text-[var(--mos-text-primary)] transition-colors duration-200 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div className="space-y-2 text-center sm:space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-sky-700 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
            <Flame className="h-4 w-4 fill-sky-500 text-sky-600" />
            <span>🔥 AP EAPCET 2026 Final Phase Seat Allotments Name Wise</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">AP EAPCET 2026 Final Phase Seat Allotments Name Wise</h1>
          <p className="mx-auto max-w-3xl px-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">ఆంధ్రప్రదేశ్ ఇంజనీరింగ్ కాలేజీల వారీగా, బ్రాంచ్ వారీగా విద్యార్థుల అలాట్‌మెంట్ జాబితా &amp; కట్-ఆఫ్ ర్యాంకులు (260+ కాలేజీలు, 1,00,000+ సీట్లు)</p>
        </div>

        <div className="flex justify-center pt-1">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <button type="button" onClick={() => setActiveExplorerTab('explorer')} className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${activeExplorerTab === 'explorer' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}><Building2 className="h-4 w-4" /><span>College &amp; Candidate Explorer</span></button>
            <button type="button" onClick={() => setActiveExplorerTab('top-colleges')} className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${activeExplorerTab === 'top-colleges' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}><Award className="h-4 w-4" /><span>Top B.Tech Colleges</span><span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">OC Ranks</span></button>
            <button type="button" onClick={() => setActiveExplorerTab('insights')} className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${activeExplorerTab === 'insights' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}><TrendingUp className="h-4 w-4" /><span>Overall Rank Insights</span><span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">NEW</span></button>
          </div>
        </div>

        {activeExplorerTab === 'top-colleges' ? <ApTopColleges onSelectCollegeBranch={handleJumpToCollegeBranch} /> : activeExplorerTab === 'insights' ? <ApOverallRankInsights /> : (
          <div className="space-y-5 sm:space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-sky-400/20 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-2xl shadow-sky-950/10 dark:from-slate-900 dark:via-slate-950 dark:to-sky-950/50 sm:p-8">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" /><div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300"><Sparkles className="h-3.5 w-3.5" /> AP EAPCET {selectedYear} · {selectedPhase === 'ALL' ? 'All phases' : `Phase ${selectedPhase}`}</div>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">AP Allotments <span className="text-sky-600 dark:text-sky-300">Explorer</span></h2>
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">Find colleges, branches and allotted students from the selected AP EAPCET source dataset — without mixing years.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3"><div className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Records</div><div className="mt-1 text-xl font-black text-slate-950 dark:text-white">{Number(datasetSummary?.totalRecords ?? 0).toLocaleString()}</div></div><div className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Colleges</div><div className="mt-1 text-xl font-black text-sky-600 dark:text-sky-300">{collegesList.length}</div></div></div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-3 shadow-2xl shadow-sky-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">Explore the dataset</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose college → branch, then search a student name or rank across AP.</p></div><div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live dataset view</div></div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <APCollegeSelector colleges={collegeSelectorItems} selectedCollegeCode={selectedCollegeCode} onSelectCollege={handleCollegeChange} isLoading={isLoading} />
                <APBranchSelector branches={branchOptions} selectedBranchCode={selectedBranchCode} onSelectBranch={(code) => { setSelectedBranchCode(code); resetSearch(); }} totalCollegeRecords={collegeData?.recordCount ?? 0} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_auto]">
                <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void runGlobalSearch(); }} placeholder="Search candidate name or rank..." className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div>
                <button type="button" onClick={() => void runGlobalSearch()} disabled={isSearching || !query.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50">{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Global Search</button>
                <button type="button" onClick={() => { setSortOrder((value) => value === 'ASC' ? 'DESC' : 'ASC'); setCurrentPage(1); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">↕ Rank: {sortOrder === 'ASC' ? 'Low-High' : 'High-Low'}</button>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <select value={genderFilter} onChange={(event) => { setGenderFilter(event.target.value); resetSearch(); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="ALL">All Genders</option><option value="M">Boys (M)</option><option value="F">Girls (F)</option></select>
                <select value={casteFilter} onChange={(event) => { setCasteFilter(event.target.value); resetSearch(); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="ALL">All Castes</option>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                <select value={seatCategoryFilter} onChange={(event) => { setSeatCategoryFilter(event.target.value); resetSearch(); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="ALL">All Seat Categories / Quotas</option>{SEAT_CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                <select value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.target.value); setSelectedCollegeCode('ALL'); setSelectedBranchCode('ALL'); resetSearch(); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="ALL">All Districts</option>{districtOptions.map((district) => <option key={district} value={district}>{district}</option>)}</select>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400"><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-white/10 dark:bg-slate-950/70">Dataset: AP EAPCET {selectedYear}</span><span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">{selectedCollegeName}</span><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-white/10 dark:bg-slate-950/70">{filteredColleges.length} colleges</span><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-white/10 dark:bg-slate-950/70">{branchOptions.length} branches</span></div>
            </section>

            <div className="flex justify-center"><div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <button type="button" onClick={() => { setHasSearched(false); setCurrentPage(1); }} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${!hasSearched ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Explore Colleges</button>
              <button type="button" onClick={() => { if (query.trim()) void runGlobalSearch(); }} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${hasSearched && !/^\d+$/.test(query.replace(/,/g, '')) ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Search Student Name</button>
              <button type="button" onClick={() => { if (query.trim()) void runGlobalSearch(); }} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${hasSearched && /^\d+$/.test(query.replace(/,/g, '')) ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Search by Rank</button>
            </div></div>

            {isLoading && !collegesList.length ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900/80"><Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-500" /><p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Loading AP EAPCET {selectedYear} allotments…</p></div>
            ) : hasSearched || selectedCollegeCode !== 'ALL' ? (
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"><div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">Showing {pageStart || 0} – {pageEnd || 0} of {displayRecords.length.toLocaleString()} students</p><p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{hasSearched ? 'Global AP student/rank search results' : `${selectedCollegeName} · ${selectedBranchCode === 'ALL' ? 'All branches' : selectedBranchCode}`}</p></div><div className="flex items-center gap-1"><button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button><span className="px-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">Page {currentPage} / {totalPages}</span><button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button></div></div>
                {searchError && hasSearched && <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">{searchError}</div>}
                {paginatedRecords.length > 0 ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{paginatedRecords.map((record, index) => <ResultCard key={`${record.college_code}-${record.branch_code}-${record.rank}-${record.cand_name}-${index}`} record={record} index={(currentPage - 1) * PAGE_SIZE + index + 1} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900/80"><Users className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No allotment records found</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try another student name, rank, college, branch or filter.</p></div>}
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-[1.5rem] border border-sky-400/15 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 dark:from-slate-900 dark:via-slate-950 dark:to-sky-950/50 sm:p-6"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-sky-500" /><div><h3 className="text-base font-black text-slate-950 dark:text-white">Statewide Student Search</h3><p className="text-[11px] text-slate-500 dark:text-slate-400">Search AP allotments across every available college.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{['CSE', 'ECE', 'VITAPU', 'RVRJC', 'SVCE', 'JNTUK'].map((quick) => <button key={quick} type="button" onClick={() => { setQuery(quick); setSelectedCollegeCode('ALL'); setSelectedBranchCode('ALL'); }} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-sky-700 shadow-sm transition hover:border-sky-400 dark:border-sky-500/20 dark:bg-slate-950 dark:text-sky-300"><Search className="h-3 w-3" /> {quick}</button>)}</div></div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/90 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400">Dataset snapshot</p><h3 className="mt-1 text-base font-black text-slate-950 dark:text-white">AP EAPCET {selectedYear}</h3></div><Target className="h-5 w-5 text-sky-500" /></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="text-[9px] uppercase text-slate-500">Colleges</div><div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{collegesList.length}</div></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="text-[9px] uppercase text-slate-500">Records</div><div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{Number(datasetSummary?.totalRecords ?? 0).toLocaleString()}</div></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="text-[9px] uppercase text-slate-500">Branches</div><div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{Number(datasetSummary?.branches ?? 0)}</div></div></div></div>
              </section>
            )}

            {loadError && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">{loadError}</div>}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-center text-[11px] leading-5 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"><strong className="text-slate-600 dark:text-slate-300">Data notice:</strong> This workspace displays observed AP EAPCET allotment records from the selected dataset. These records are informational and should not be treated as guaranteed cutoffs or admission predictions.</div>
      </div>
    </div>
  );
};

export default APAllotmentExplorer;
