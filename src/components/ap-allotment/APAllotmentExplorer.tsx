import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Search, Award, BookOpen, SlidersHorizontal, AlertCircle, GraduationCap, Sparkles, Loader2, Database, ChevronRight, TrendingUp, BarChart3, Target } from 'lucide-react';
import {
  AllotmentYear,
  PhaseFilter,
  CollegeDetailData,
  CollegeListItem,
  AllotmentRecord,
  getCollegeList,
  getCollegeDetails,
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
    // Hard year boundary: never render records cached from the previous dataset.
    setAllColleges([]);
    setCollegeData(null);
    setDatasetSummary(null);
    setCollegesList([]);
    setLoadError(null);
    setIsLoading(true);
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
    const source = selectedCollegeCode === 'ALL' ? [] : (collegeData?.allRecords ?? []);

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

  const bestRank = selectedCollegeCode === 'ALL' ? Number(datasetSummary?.minRank ?? 0) : (visibleRecords.length ? Math.min(...visibleRecords.map((r) => r.rank)) : 0);
  const lastRank = selectedCollegeCode === 'ALL' ? Number(datasetSummary?.maxRank ?? 0) : (visibleRecords.length ? Math.max(...visibleRecords.map((r) => r.rank)) : 0);

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
        <header className="mos-ap-hero relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/50 p-5 sm:p-8 shadow-2xl shadow-cyan-950/20">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl mos-float" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" /> AP EAPCET {selectedYear} · {selectedPhase === 'ALL' ? 'All phases' : 'Phase ' + selectedPhase}
              </div>
              <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-[-0.04em] text-white">AP Allotments <span className="text-cyan-300">Explorer</span></h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-slate-400">Find colleges, branches and allotted students from the selected AP EAPCET source dataset — without mixing years.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="mos-stat-card rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500">Records</div><div className="mt-1 text-xl sm:text-2xl font-black text-white">{(datasetSummary?.totalRecords ?? 0).toLocaleString()}</div></div>
              <div className="mos-stat-card rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500">Colleges</div><div className="mt-1 text-xl sm:text-2xl font-black text-cyan-300">{collegesList.length}</div></div>
            </div>
          </div>
        </header>

        <section className="mos-ap-controls mos-fade-up rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-3 sm:p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">Explore the dataset</p>
              <p className="mt-1 text-xs text-slate-500">Year, college and branch stay locked to the same AP dataset.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live dataset view
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.25fr_1.25fr]">
            <label className="text-xs font-bold text-slate-300">
              Allotment year & phase
              <select value={phaseValue} onChange={(e) => applyYearPhase(e.target.value)} className="mos-ap-control mt-1.5 w-full rounded-2xl px-3.5 py-3.5 text-sm font-bold text-white outline-none">
                {PHASE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <APCollegeSelector
              colleges={collegesList.map((college) => ({ collegeCode: college.collegeCode, collegeName: college.collegeName }))}
              selectedCollegeCode={selectedCollegeCode}
              onSelectCollege={onCollegeChange}
              isLoading={isLoading}
            />
            <APBranchSelector
              branches={branchOptions}
              selectedBranchCode={selectedBranchCode}
              onSelectBranch={(code) => { setSelectedBranchCode(code); resetFilters(); }}
              totalCollegeRecords={collegeData?.recordCount ?? 0}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1">Dataset: AP EAPCET {selectedYear}</span>
            {selectedPhase !== 'ALL' && <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">Phase {selectedPhase}</span>}
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1">{collegesList.length} AP colleges</span>
            {selectedCollegeCode !== 'ALL' && <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-indigo-300">{branchOptions.length} branches</span>}
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
          <section className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['Total allotments', datasetSummary?.totalRecords ?? 0, Database],
                ['AP colleges', collegesList.length, GraduationCap],
                ['Branches', datasetSummary?.branches ?? 0, BookOpen],
                ['Observed rank span', bestRank && lastRank ? bestRank.toLocaleString() + ' – ' + lastRank.toLocaleString() : '—', Target],
              ].map(([label, value, Icon]) => (
                <div key={String(label)} className="mos-fade-up mos-stat-card rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</span><Icon className="h-4 w-4 text-cyan-400" /></div>
                  <div className="mt-2 text-lg sm:text-2xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                </div>
              ))}
            </div>
            <section className="mos-fade-up rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-400">Dataset intelligence</p><h2 className="mt-1 text-xl sm:text-2xl font-black text-white">Understand the allotment landscape</h2><p className="mt-1 text-xs sm:text-sm text-slate-500">Quick signals from the {selectedYear} source without loading every college file.</p></div>
                <BarChart3 className="hidden sm:block h-7 w-7 text-indigo-400" />
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500">Best observed rank</div><div className="mt-2 text-2xl font-black text-cyan-300">{bestRank ? bestRank.toLocaleString() : '—'}</div><div className="mt-1 text-[11px] text-slate-500">Across the selected year</div></div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500">Last observed rank</div><div className="mt-2 text-2xl font-black text-indigo-300">{lastRank ? lastRank.toLocaleString() : '—'}</div><div className="mt-1 text-[11px] text-slate-500">Observed in source records</div></div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><div className="text-[10px] uppercase tracking-wider text-slate-500">Available phases</div><div className="mt-2 flex flex-wrap gap-1.5">{(datasetSummary?.phases ?? []).map((p:number) => <span key={p} className="rounded-lg bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">Phase {p}</span>)}</div></div>
              </div>
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
                  <div className="mos-fade-up rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl">
                    <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-400">Category mix</p><h3 className="mt-1 font-black text-white">Candidate categories</h3></div><Users className="h-5 w-5 text-cyan-400" /></div>
                    <div className="mt-4 space-y-3">{categoryInsights.map(([category, insight]) => {
                      const pct = visibleRecords.length ? Math.round((insight.count / visibleRecords.length) * 100) : 0;
                      return <div key={category}><div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-200">{category}</span><span className="font-mono text-slate-500">{insight.count.toLocaleString()} · {pct}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700" style={{width: pct + '%'}} /></div><div className="mt-1 text-[10px] text-slate-500">Rank {insight.min.toLocaleString()} → {insight.max.toLocaleString()}</div></div>;
                    })}</div>
                  </div>
                  <div className="mos-fade-up rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl">
                    <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-400">Phase activity</p><h3 className="mt-1 font-black text-white">Allotment distribution</h3></div><TrendingUp className="h-5 w-5 text-indigo-400" /></div>
                    <div className="mt-5 space-y-4">{Object.entries(phaseDistribution).map(([phase,count]) => {
                      const max = Math.max(...Object.values(phaseDistribution), 1);
                      const pct = Math.round((Number(count) / max) * 100);
                      return <div key={phase}><div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-200">Phase {phase}</span><span className="font-mono text-slate-400">{Number(count).toLocaleString()}</span></div><div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700" style={{width: pct + '%'}} /></div></div>;
                    })}</div>
                  </div>
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
