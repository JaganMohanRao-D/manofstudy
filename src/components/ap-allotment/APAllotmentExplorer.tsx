import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Users, Search, Award, BookOpen, SlidersHorizontal, AlertCircle, GraduationCap, Sparkles, Loader2, Database, ChevronRight } from 'lucide-react';
import {
  AllotmentYear,
  PhaseFilter,
  CollegeDetailData,
  CollegeListItem,
  AllotmentRecord,
  getCollegeList,
  getCollegeDetails,
  loadAllColleges,
  searchAllotments,
  getDatasetSummary,
} from '../../services/apEapcetAllotmentService';
import APAllotmentTable from './APAllotmentTable';
import APStudentSearch from './APStudentSearch';
import APCollegeSelector from './APCollegeSelector';
import APBranchSelector, { BranchOption } from './APBranchSelector';

interface APAllotmentExplorerProps {
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

export const APAllotmentExplorer: React.FC<APAllotmentExplorerProps> = ({
  initialCollegeCode = 'ALL',
  initialBranchCode = 'ALL',
  initialTab = 'college',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedYear, setSelectedYear] = useState<AllotmentYear>('2026');
  const [selectedPhase, setSelectedPhase] = useState<PhaseFilter>('ALL');
  const [selectedCollegeCode, setSelectedCollegeCode] = useState('ALL');
  const [selectedBranchCode, setSelectedBranchCode] = useState('ALL');
  const [collegesList, setCollegesList] = useState<CollegeListItem[]>([]);
  const [collegeData, setCollegeData] = useState<CollegeDetailData | null>(null);
  const [allColleges, setAllColleges] = useState<CollegeDetailData[]>([]);
  const [datasetSummary, setDatasetSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [filters, setFilters] = useState({
    category: 'ALL',
    allottedCategory: 'ALL',
    gender: 'ALL',
    region: 'ALL',
    minRank: '',
    maxRank: '',
  });

  const phaseValue = selectedYear + ':' + selectedPhase;

  const resetFilters = useCallback(() => {
    setFilters({ category: 'ALL', allottedCategory: 'ALL', gender: 'ALL', region: 'ALL', minRank: '', maxRank: '' });
  }, []);

  const applyYearPhase = useCallback((value: string) => {
    const [year, phase] = value.split(':') as [AllotmentYear, PhaseFilter];
    setSelectedYear(year);
    setSelectedPhase(phase);
    setSelectedCollegeCode('ALL');
    setSelectedBranchCode('ALL');
    setStudentSearch('');
    resetFilters();
  }, [resetFilters]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([getCollegeList(selectedYear), getDatasetSummary(selectedYear)])
      .then(([list, summary]) => {
        if (cancelled) return;
        setCollegesList(list);
        setDatasetSummary(summary);
      })
      .catch((error) => {
        if (cancelled) return;
        setCollegesList([]);
        setDatasetSummary(null);
        setLoadError(error instanceof Error ? error.message : 'Unable to load AP allotment data.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedYear]);

  useEffect(() => {
    if (!initialCollegeCode || initialCollegeCode === 'ALL') return;
    // External navigation can request a college, but never override the clean default.
    const exists = collegesList.some((c) => c.collegeCode === initialCollegeCode);
    if (exists && selectedCollegeCode === 'ALL') setSelectedCollegeCode(initialCollegeCode);
  }, [initialCollegeCode, collegesList, selectedCollegeCode]);

  useEffect(() => {
    let cancelled = false;
    if (selectedCollegeCode === 'ALL') {
      setCollegeData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getCollegeDetails(selectedYear, selectedCollegeCode)
      .then((data) => { if (!cancelled) setCollegeData(data); })
      .catch((error) => {
        if (!cancelled) {
          setCollegeData(null);
          setLoadError(error instanceof Error ? error.message : 'Unable to load selected college.');
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedYear, selectedCollegeCode]);

  const visibleRecords = useMemo(() => {
    const source = selectedCollegeCode === 'ALL'
      ? allColleges.flatMap((college) => college.allRecords)
      : (collegeData?.allRecords ?? []);

    return source.filter((record) => {
      if (selectedPhase !== 'ALL' && record.phase !== Number(selectedPhase)) return false;
      if (selectedBranchCode !== 'ALL' && record.branch_code !== selectedBranchCode) return false;
      if (filters.category !== 'ALL' && record.category !== filters.category) return false;
      if (filters.allottedCategory !== 'ALL' && record.alloted_category !== filters.allottedCategory) return false;
      if (filters.gender !== 'ALL' && record.gender !== filters.gender) return false;
      if (filters.region !== 'ALL' && record.region !== filters.region) return false;
      if (filters.minRank && record.rank < Number(filters.minRank)) return false;
      if (filters.maxRank && record.rank > Number(filters.maxRank)) return false;
      return true;
    });
  }, [allColleges, collegeData, selectedCollegeCode, selectedPhase, selectedBranchCode, filters]);

  useEffect(() => {
    if (selectedCollegeCode !== 'ALL') return;
    let cancelled = false;
    setIsLoading(true);
    loadAllColleges(selectedYear)
      .then((data) => { if (!cancelled) setAllColleges(data); })
      .catch((error) => { if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load AP allotment records.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedYear, selectedCollegeCode]);

  useEffect(() => {
    const available = new Set((collegeData?.branches ?? []).map((branch) => branch.branch_code));
    if (selectedBranchCode !== 'ALL' && !available.has(selectedBranchCode)) setSelectedBranchCode('ALL');
  }, [collegeData, selectedBranchCode]);

  const branchOptions: BranchOption[] = useMemo(() =>
    (collegeData?.branches ?? []).map((branch) => ({
      branchCode: branch.branch_code,
      branchName: branch.branch_name,
      recordCount: branch.recordCount,
    })), [collegeData]);

  const filteredCollegeBranches = useMemo(() => {
    if (!collegeData) return [];
    return collegeData.branches.map((branch) => ({
      ...branch,
      records: branch.records.filter((record) => selectedPhase === 'ALL' || record.phase === Number(selectedPhase)),
    }));
  }, [collegeData, selectedPhase]);

  const phaseDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleRecords.forEach((record) => { if (record.phase) counts[String(record.phase)] = (counts[String(record.phase)] || 0) + 1; });
    return counts;
  }, [visibleRecords]);

  const categoryInsights = useMemo(() => {
    const map = new Map<string, { min: number; max: number; count: number }>();
    visibleRecords.forEach((record) => {
      const key = record.category || 'Unknown';
      const item = map.get(key) || { min: Infinity, max: 0, count: 0 };
      item.min = Math.min(item.min, record.rank);
      item.max = Math.max(item.max, record.rank);
      item.count += 1;
      map.set(key, item);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleRecords]);

  const bestRank = visibleRecords.length ? Math.min(...visibleRecords.map((r) => r.rank)) : 0;
  const lastRank = visibleRecords.length ? Math.max(...visibleRecords.map((r) => r.rank)) : 0;

  const currentCollege = selectedCollegeCode !== 'ALL' ? collegeData : null;
  const branchLabel = selectedBranchCode === 'ALL'
    ? 'All Branches'
    : branchOptions.find((branch) => branch.branchCode === selectedBranchCode)?.branchName || selectedBranchCode;

  const runStudentSearch = useCallback(async () => {
    if (!studentSearch.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchAllotments(selectedYear, {
        nameQuery: studentSearch.trim(),
        collegeCode: selectedCollegeCode,
        branchCode: selectedBranchCode,
        phase: selectedPhase,
        limit: 500,
      });
      setStudentSearch(studentSearch);
      setActiveTab('student-search');
      // The dedicated search tab is rendered below and owns its detailed result state.
      return results;
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedCollegeCode, selectedBranchCode, selectedPhase, studentSearch]);

  const onCollegeChange = (code: string) => {
    setSelectedCollegeCode(code);
    setSelectedBranchCode('ALL');
    setAllColleges([]);
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-5 sm:py-8 px-3 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-7">
        <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 p-5 sm:p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              AP EAPCET {selectedYear} Allotment Records
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-white">AP Allotments (Namewise)</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Explore AP EAPCET allotments by student name, rank, college, branch and phase.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <label className="text-xs font-bold text-slate-300">
              Allotment Year
              <select value={phaseValue} onChange={(e) => applyYearPhase(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400">
                {PHASE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-300">
              College
              <select value={selectedCollegeCode} onChange={(e) => onCollegeChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400">
                <option value="ALL">All Colleges</option>
                {collegesList.map((college) => <option key={college.collegeCode} value={college.collegeCode}>{college.collegeName} ({college.collegeCode})</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-300">
              Branch
              <select value={selectedBranchCode} onChange={(e) => { setSelectedBranchCode(e.target.value); resetFilters(); }} disabled={selectedCollegeCode === 'ALL'} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="ALL">All Branches</option>
                {branchOptions.map((branch) => <option key={branch.branchCode} value={branch.branchCode}>{branch.branchName} ({branch.branchCode})</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-300">
              Search Student Name
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void runStudentSearch(); }} placeholder="Enter student name…" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400" />
              </div>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1">Dataset: AP EAPCET {selectedYear}</span>
            {selectedPhase !== 'ALL' && <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">Phase {selectedPhase}</span>}
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1">{collegesList.length} AP colleges</span>
          </div>
        </section>

        <nav className="flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-800 bg-slate-900 p-1 shadow-xl">
            {[
              ['college', 'Explore Colleges'],
              ['student-search', 'Search Student Name'],
              ['rank-search', 'Search by Rank'],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setActiveTab(id as typeof activeTab)} className={'rounded-xl px-4 py-2 text-xs font-bold transition-all ' + (activeTab === id ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white')}>{label}</button>
            ))}
          </div>
        </nav>

        {activeTab === 'student-search' || activeTab === 'rank-search' ? (
          <APStudentSearch year={selectedYear} collegeCode={selectedCollegeCode} branchCode={selectedBranchCode} phase={selectedPhase} initialName={studentSearch} />
        ) : selectedCollegeCode === 'ALL' ? (
          <section className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['Colleges', allColleges.length || collegesList.length],
                ['Allotments', visibleRecords.length || (datasetSummary?.totalRecords ?? 0)],
                ['Branches', datasetSummary?.branches ?? '—'],
                ['Phases', (datasetSummary?.phases ?? []).join(' · ') || '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
                  <div className="mt-1 text-xl font-black text-white">{value}</div>
                </div>
              ))}
            </div>
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300"><Database className="h-5 w-5" /></div>
                <div><h2 className="font-bold text-white">All Colleges</h2><p className="text-xs text-slate-400">Dataset overview for AP EAPCET {selectedYear}</p></div>
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><div className="text-xs text-slate-500">Observed best rank</div><div className="mt-1 text-lg font-black text-cyan-300">{bestRank || '—'}</div></div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><div className="text-xs text-slate-500">Observed last rank</div><div className="mt-1 text-lg font-black text-cyan-300">{lastRank || '—'}</div></div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><div className="text-xs text-slate-500">Phase distribution</div><div className="mt-1 text-sm font-bold text-white">{Object.entries(phaseDistribution).map(([phase,count]) => 'P' + phase + ': ' + count).join(' · ') || '—'}</div></div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">All Colleges is the default state. No college-specific dashboard is shown until an AP college is selected.</p>
            </section>
          </section>
        ) : (
          <section className="space-y-5">
            {isLoading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" /><p className="mt-3 text-sm text-slate-400">Loading AP EAPCET {selectedYear} allotments…</p></div>
            ) : currentCollege ? (
              <>
                <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><div className="text-xs font-bold uppercase tracking-wider text-cyan-400">AP College</div><h2 className="mt-1 text-xl sm:text-2xl font-black text-white">{currentCollege.college_name}</h2><p className="mt-1 text-xs text-slate-500">College code: {currentCollege.college_code} · {currentCollege.recordCount.toLocaleString()} allotments</p></div>
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-right"><div className="text-[10px] uppercase tracking-wider text-cyan-300">Selected view</div><div className="text-sm font-black text-white">{branchLabel}</div></div>
                  </div>
                </section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    ['Allotments', visibleRecords.length],
                    ['Branches', currentCollege.branchCount],
                    ['Observed best rank', bestRank || '—'],
                    ['Observed last rank', lastRank || '—'],
                  ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg"><div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 text-xl font-black text-white">{value}</div></div>)}
                </div>
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><h3 className="font-bold text-white">Category insights</h3><div className="mt-4 space-y-2">{categoryInsights.map(([category, insight]) => <div key={category} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs"><span className="font-bold text-slate-200">{category}</span><span className="text-slate-400">best {insight.min.toLocaleString()} · last {insight.max.toLocaleString()} · {insight.count} records</span></div>)}</div></div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><h3 className="font-bold text-white">Phase distribution</h3><div className="mt-4 space-y-2">{Object.entries(phaseDistribution).map(([phase,count]) => <div key={phase} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs"><span className="font-bold text-slate-200">Phase {phase}</span><span className="text-slate-400">{count} records</span></div>)}</div></div>
                </section>
                <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between"><div><h3 className="font-bold text-white">Allotted students</h3><p className="text-xs text-slate-500">{visibleRecords.length.toLocaleString()} records after active filters</p></div><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">AP EAPCET {selectedYear}</span></div>
                  <APAllotmentTable records={visibleRecords} collegeCode={currentCollege.college_code} collegeName={currentCollege.college_name} branchCode={selectedBranchCode} branchName={branchLabel} year={selectedYear} />
                </section>
              </>
            ) : (
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 text-center text-sm text-amber-200">Unable to load the selected AP college.</div>
            )}
          </section>
        )}

        {loadError && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">{loadError}</div>}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center text-[11px] leading-5 text-slate-500">
          <strong className="text-slate-400">Data notice:</strong> This workspace displays observed AP EAPCET allotment records from the selected dataset. These records are informational and should not be treated as guaranteed cutoffs or admission predictions.
        </div>
      </div>
    </div>
  );
};

export default APAllotmentExplorer;
