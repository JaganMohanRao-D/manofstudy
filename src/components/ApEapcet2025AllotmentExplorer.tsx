import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Building2,
  ChevronDown,
  Database,
  Filter,
  GitBranch,
  Loader2,
  Search,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';

type IndexCollege = { college_name: string; college_code: string; file: string };
type AllotmentRecord = {
  rank?: string | number;
  cand_name?: string;
  gender?: string;
  category?: string;
  region?: string;
  alloted_category?: string;
  phase?: number | string;
  college?: string;
  branch?: string;
  hall_ticket?: string;
  hallTicket?: string;
  hall_ticket_number?: string;
};
type BranchData = { branch_code: string; branch_name: string; records: AllotmentRecord[] };
type CollegeData = { college_name: string; college_code: string; branches: BranchData[] };
type DatasetIndex = {
  dataset: string;
  generated_at: string;
  total_colleges: number;
  colleges: IndexCollege[];
};

const BASE = '/AP_EAPCET_2025_ALLOTMENT_BY_COLLEGE';

const normalize = (value: unknown) =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const rankNumber = (value: unknown) => {
  const n = Number.parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

const formatRank = (value: unknown) => {
  const n = rankNumber(value);
  return n === null ? '—' : n.toLocaleString('en-IN');
};

const uniqueSorted = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const ApEapcet2025AllotmentExplorer: React.FC = () => {
  const [index, setIndex] = useState<DatasetIndex | null>(null);
  const [indexError, setIndexError] = useState('');
  const [loadingIndex, setLoadingIndex] = useState(true);

  const [collegeQuery, setCollegeQuery] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [collegeData, setCollegeData] = useState<CollegeData | null>(null);
  const [loadingCollege, setLoadingCollege] = useState(false);

  const [branchCode, setBranchCode] = useState('');
  const [branchQuery, setBranchQuery] = useState('');

  const [studentQuery, setStudentQuery] = useState('');
  const [rankQuery, setRankQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<AllotmentRecord[]>([]);
  const [globalSearchLabel, setGlobalSearchLabel] = useState('');
  const [globalSearching, setGlobalSearching] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [globalError, setGlobalError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [allottedCategoryFilter, setAllottedCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [phaseFilter, setPhaseFilter] = useState('ALL');
  const [rankMin, setRankMin] = useState('');
  const [rankMax, setRankMax] = useState('');
  const [tablePage, setTablePage] = useState(1);

  const [openCollegeMenu, setOpenCollegeMenu] = useState(false);
  const [openBranchMenu, setOpenBranchMenu] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/index.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unable to load dataset index (HTTP ${res.status}).`);
        return res.json();
      })
      .then((data: DatasetIndex) => {
        if (!cancelled) setIndex(data);
      })
      .catch((err) => {
        if (!cancelled) setIndexError(err?.message || 'Unable to load AP EAPCET 2025 data.');
      })
      .finally(() => {
        if (!cancelled) setLoadingIndex(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const collegeCache = useMemo(() => new Map<string, CollegeData>(), []);

  const loadCollege = async (code: string) => {
    if (!code) return null;
    const cached = collegeCache.get(code);
    if (cached) return cached;

    const item = index?.colleges.find((c) => c.college_code === code);
    if (!item) throw new Error('College not found in the AP EAPCET 2025 index.');

    const res = await fetch(`${BASE}/${encodeURIComponent(item.file)}`);
    if (!res.ok) throw new Error(`Unable to load ${item.college_name} data (HTTP ${res.status}).`);
    const data = (await res.json()) as CollegeData;
    collegeCache.set(code, data);
    return data;
  };

  const handleCollegeSelect = async (code: string) => {
    setCollegeCode(code);
    setBranchCode('');
    setBranchQuery('');
    setCategoryFilter('ALL');
    setAllottedCategoryFilter('ALL');
    setGenderFilter('ALL');
    setRegionFilter('ALL');
    setPhaseFilter('ALL');
    setRankMin('');
    setRankMax('');
    setTablePage(1);
    setOpenCollegeMenu(false);
    setGlobalResults([]);
    setGlobalSearchLabel('');
    setGlobalError('');

    if (!code) {
      setCollegeData(null);
      return;
    }

    setLoadingCollege(true);
    try {
      setCollegeData(await loadCollege(code));
    } catch (err: any) {
      setCollegeData(null);
      setGlobalError(err?.message || 'Unable to load college data.');
    } finally {
      setLoadingCollege(false);
    }
  };

  const selectedBranch = collegeData?.branches.find((b) => b.branch_code === branchCode) || null;

  const branchOptions = useMemo(() => {
    if (!collegeData) return [];
    const q = normalize(branchQuery);
    return collegeData.branches.filter((b) =>
      !q || normalize(`${b.branch_name} ${b.branch_code}`).includes(q)
    );
  }, [collegeData, branchQuery]);

  const branchRecords = selectedBranch?.records || [];

  const availableCategories = useMemo(() => uniqueSorted(branchRecords.map((r) => String(r.category || ''))), [branchRecords]);
  const availableAllottedCategories = useMemo(
    () => uniqueSorted(branchRecords.map((r) => String(r.alloted_category || ''))),
    [branchRecords]
  );
  const availableGenders = useMemo(() => uniqueSorted(branchRecords.map((r) => String(r.gender || ''))), [branchRecords]);
  const availableRegions = useMemo(() => uniqueSorted(branchRecords.map((r) => String(r.region || ''))), [branchRecords]);
  const availablePhases = useMemo(
    () => uniqueSorted(branchRecords.map((r) => String(r.phase ?? ''))),
    [branchRecords]
  );

  const filteredRecords = useMemo(() => {
    const min = rankNumber(rankMin);
    const max = rankNumber(rankMax);
    const q = normalize(studentQuery);

    return branchRecords
      .filter((r) => !q || normalize(r.cand_name).includes(q))
      .filter((r) => categoryFilter === 'ALL' || String(r.category || '') === categoryFilter)
      .filter((r) => allottedCategoryFilter === 'ALL' || String(r.alloted_category || '') === allottedCategoryFilter)
      .filter((r) => genderFilter === 'ALL' || String(r.gender || '') === genderFilter)
      .filter((r) => regionFilter === 'ALL' || String(r.region || '') === regionFilter)
      .filter((r) => phaseFilter === 'ALL' || String(r.phase ?? '') === phaseFilter)
      .filter((r) => {
        const rank = rankNumber(r.rank);
        if (rank === null) return false;
        return (min === null || rank >= min) && (max === null || rank <= max);
      })
      .sort((a, b) => (rankNumber(a.rank) ?? Infinity) - (rankNumber(b.rank) ?? Infinity));
  }, [
    branchRecords,
    studentQuery,
    categoryFilter,
    allottedCategoryFilter,
    genderFilter,
    regionFilter,
    phaseFilter,
    rankMin,
    rankMax,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const visibleRecords = filteredRecords.slice((tablePage - 1) * pageSize, tablePage * pageSize);

  useEffect(() => {
    setTablePage(1);
  }, [branchCode, studentQuery, categoryFilter, allottedCategoryFilter, genderFilter, regionFilter, phaseFilter, rankMin, rankMax]);

  const categoryInsights = useMemo(() => {
    const groups = new Map<string, { best: number; last: number; count: number }>();
    branchRecords.forEach((r) => {
      const category = String(r.category || '').trim();
      const rank = rankNumber(r.rank);
      if (!category || rank === null) return;
      const current = groups.get(category) || { best: rank, last: rank, count: 0 };
      current.best = Math.min(current.best, rank);
      current.last = Math.max(current.last, rank);
      current.count += 1;
      groups.set(category, current);
    });
    return [...groups.entries()]
      .map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => a.best - b.best);
  }, [branchRecords]);

  const genderCounts = useMemo(() => {
    const map = new Map<string, number>();
    branchRecords.forEach((r) => {
      const key = String(r.gender || 'Unknown');
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [branchRecords]);

  const resetFilters = () => {
    setStudentQuery('');
    setCategoryFilter('ALL');
    setAllottedCategoryFilter('ALL');
    setGenderFilter('ALL');
    setRegionFilter('ALL');
    setPhaseFilter('ALL');
    setRankMin('');
    setRankMax('');
  };

  const runGlobalSearch = async (kind: 'name' | 'rank') => {
    if (!index) return;
    const raw = kind === 'name' ? studentQuery.trim() : rankQuery.trim();
    if (!raw) return;

    setGlobalSearching(true);
    setGlobalProgress(0);
    setGlobalResults([]);
    setGlobalError('');
    setGlobalSearchLabel(kind === 'name' ? `Name: ${raw}` : `Rank: ${raw}`);

    const query = kind === 'name' ? normalize(raw) : raw.replace(/,/g, '');
    const colleges = index.colleges;
    const matches: AllotmentRecord[] = [];
    let next = 0;
    let completed = 0;

    const worker = async () => {
      while (true) {
        const current = next++;
        if (current >= colleges.length) return;
        try {
          const data = await loadCollege(colleges[current].college_code);
          for (const branch of data?.branches || []) {
            for (const record of branch.records || []) {
              const found =
                kind === 'name'
                  ? normalize(record.cand_name).includes(query)
                  : String(record.rank || '').replace(/,/g, '').replace(/\.0$/, '') === query.replace(/\.0$/, '');
              if (found) {
                matches.push({
                  ...record,
                  college: record.college || data.college_name,
                  branch: record.branch || branch.branch_name,
                });
              }
            }
          }
        } catch {
          // One broken college file should not prevent the remaining search.
        } finally {
          completed += 1;
          setGlobalProgress(Math.round((completed / colleges.length) * 100));
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(8, colleges.length) }, worker));

    matches.sort((a, b) => (rankNumber(a.rank) ?? Infinity) - (rankNumber(b.rank) ?? Infinity));
    setGlobalResults(matches);
    setGlobalSearching(false);
    if (!matches.length) setGlobalError('No matching allotment records were found in the loaded 2025 dataset.');
  };

  const selectedCollege = index?.colleges.find((c) => c.college_code === collegeCode);

  if (loadingIndex) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading AP EAPCET 2025 dataset...
        </div>
      </div>
    );
  }

  if (indexError || !index) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold">
          <AlertCircle className="w-5 h-5" /> AP EAPCET 2025 data could not be loaded.
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{indexError || 'Dataset index is unavailable.'}</p>
      </div>
    );
  }

  const filteredColleges = index.colleges.filter((c) =>
    !normalize(collegeQuery) || normalize(`${c.college_name} ${c.college_code}`).includes(normalize(collegeQuery))
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              <Database className="w-3.5 h-3.5" /> AP EAPCET 2025
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Allotment Explorer
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Search where a student was allotted, explore a college branch, and inspect observed rank ranges from the 2025 allotment records.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-[210px]">
            <Stat label="Colleges" value={index.total_colleges} icon={<Building2 className="w-4 h-4" />} />
            <Stat label="Dataset" value="2025" icon={<Database className="w-4 h-4" />} />
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <SearchPanel
            title="Search by student name"
            placeholder="e.g. PEDDIBOYINA BHAVITHA"
            value={studentQuery}
            onChange={setStudentQuery}
            onSearch={() => runGlobalSearch('name')}
            buttonLabel="Search all colleges"
            loading={globalSearching}
          />
          <SearchPanel
            title="Search by exact rank"
            placeholder="e.g. 3821"
            value={rankQuery}
            onChange={setRankQuery}
            onSearch={() => runGlobalSearch('rank')}
            buttonLabel="Find rank"
            loading={globalSearching}
          />
        </div>

        {globalSearching && (
          <div className="mt-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/20 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <span>Searching {index.total_colleges} college files...</span>
              <span>{globalProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${globalProgress}%` }} />
            </div>
          </div>
        )}

        {globalSearchLabel && !globalSearching && (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">Search results</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{globalSearchLabel} • {globalResults.length} allotment record(s)</p>
              </div>
            </div>
            {globalResults.length ? (
              <div className="grid gap-3">
                {globalResults.slice(0, 100).map((record, i) => (
                  <div key={`${record.rank}-${record.cand_name}-${record.college}-${record.branch}-${i}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <UserRound className="w-4 h-4 text-indigo-500 shrink-0" />
                          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">{record.cand_name || 'Unknown candidate'}</h3>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{record.college || 'College unavailable'}</p>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{record.branch || 'Branch unavailable'}</p>
                      </div>
                      <span className="inline-flex w-fit rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-black text-white">Rank {formatRank(record.rank)}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Mini label="Category" value={record.category || '—'} />
                      <Mini label="Allotted category" value={record.alloted_category || '—'} />
                      <Mini label="Gender" value={record.gender || '—'} />
                      <Mini label="Region" value={record.region || '—'} />
                      <Mini label="Phase" value={String(record.phase ?? '—')} />
                      {(record.hall_ticket || record.hallTicket || record.hall_ticket_number) && (
                        <Mini label="Hall Ticket" value={record.hall_ticket || record.hallTicket || record.hall_ticket_number || '—'} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text={globalError || 'No results found.'} />
            )}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Explore by college & branch</h2>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Select a college first; branch options are read directly from that college's JSON file.
        </p>

        <div className="mt-5 grid lg:grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">College</label>
            <button type="button" onClick={() => setOpenCollegeMenu((v) => !v)} className="mt-1 w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-left text-sm">
              <span className="truncate">{selectedCollege?.college_name || 'Select college'}</span>
              <ChevronDown className="w-4 h-4 shrink-0" />
            </button>
            {openCollegeMenu && (
              <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input value={collegeQuery} onChange={(e) => setCollegeQuery(e.target.value)} autoFocus placeholder="Search college or code..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2.5 text-sm outline-none" />
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto">
                  {filteredColleges.slice(0, 80).map((college) => (
                    <button key={college.college_code} type="button" onClick={() => handleCollegeSelect(college.college_code)} className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{college.college_name}</div>
                      <div className="text-[11px] text-slate-500">{college.college_code}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Branch</label>
            <button type="button" disabled={!collegeData} onClick={() => setOpenBranchMenu((v) => !v)} className="mt-1 w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-left text-sm disabled:opacity-50">
              <span className="truncate">{selectedBranch ? `${selectedBranch.branch_name} (${selectedBranch.branch_code})` : 'Select branch'}</span>
              <ChevronDown className="w-4 h-4 shrink-0" />
            </button>
            {openBranchMenu && collegeData && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input value={branchQuery} onChange={(e) => setBranchQuery(e.target.value)} autoFocus placeholder="Search branch..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2.5 text-sm outline-none" />
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto">
                  {branchOptions.map((branch) => (
                    <button key={branch.branch_code} type="button" onClick={() => { setBranchCode(branch.branch_code); setOpenBranchMenu(false); }} className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{branch.branch_name}</div>
                      <div className="text-[11px] text-slate-500">{branch.branch_code} • {branch.records.length} records</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {loadingCollege && (
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading college data...</div>
        )}

        {selectedBranch && (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Allotments" value={branchRecords.length} icon={<Users className="w-4 h-4" />} />
              <Stat label="Best observed rank" value={formatRank(Math.min(...branchRecords.map((r) => rankNumber(r.rank) ?? Infinity)))} icon={<Trophy className="w-4 h-4" />} />
              <Stat label="Last observed rank" value={formatRank(Math.max(...branchRecords.map((r) => rankNumber(r.rank) ?? -Infinity)))} icon={<BarChart3 className="w-4 h-4" />} />
              <Stat label="Categories" value={availableCategories.length} icon={<Filter className="w-4 h-4" />} />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">Category-wise observed ranks</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Based on candidate category in the available 2025 records.</p>
                </div>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500"><th className="py-2 pr-3">Category</th><th className="py-2 pr-3">Best rank</th><th className="py-2 pr-3">Last rank</th><th className="py-2 pr-3">Allotments</th></tr></thead>
                  <tbody>
                    {categoryInsights.map((row) => (
                      <tr key={row.category} className="border-b border-slate-100 dark:border-slate-800/70">
                        <td className="py-2.5 pr-3 font-black text-slate-800 dark:text-slate-200">{row.category}</td>
                        <td className="py-2.5 pr-3 font-semibold">{formatRank(row.best)}</td>
                        <td className="py-2.5 pr-3 font-semibold">{formatRank(row.last)}</td>
                        <td className="py-2.5 pr-3">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white"><Filter className="w-4 h-4" /> Student filters</div>
              <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
                <SelectFilter label="Category" value={categoryFilter} onChange={setCategoryFilter} options={availableCategories} />
                <SelectFilter label="Allotted category" value={allottedCategoryFilter} onChange={setAllottedCategoryFilter} options={availableAllottedCategories} />
                <SelectFilter label="Gender" value={genderFilter} onChange={setGenderFilter} options={availableGenders} />
                <SelectFilter label="Region" value={regionFilter} onChange={setRegionFilter} options={availableRegions} />
                <SelectFilter label="Phase" value={phaseFilter} onChange={setPhaseFilter} options={availablePhases} />
                <input value={rankMin} onChange={(e) => setRankMin(e.target.value)} inputMode="numeric" placeholder="Min rank" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs outline-none" />
                <input value={rankMax} onChange={(e) => setRankMax(e.target.value)} inputMode="numeric" placeholder="Max rank" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs outline-none" />
                <button type="button" onClick={resetFilters} className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Clear filters</button>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Search students in this branch..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2.5 text-xs outline-none" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">Allotted students</h3>
                  <p className="text-[11px] text-slate-500">{filteredRecords.length} matching record(s)</p>
                </div>
                <div className="text-[11px] text-slate-500">Page {tablePage} / {totalPages}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60">
                    <tr className="text-slate-500">
                      <th className="px-3 py-2.5">Rank</th><th className="px-3 py-2.5">Candidate</th><th className="px-3 py-2.5">Gender</th><th className="px-3 py-2.5">Category</th><th className="px-3 py-2.5">Allotted category</th><th className="px-3 py-2.5">Region</th><th className="px-3 py-2.5">Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRecords.map((r, i) => (
                      <tr key={`${r.rank}-${r.cand_name}-${i}`} className="border-t border-slate-100 dark:border-slate-800/70">
                        <td className="px-3 py-2.5 font-black text-indigo-600 dark:text-indigo-300">{formatRank(r.rank)}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200">{r.cand_name || '—'}</td>
                        <td className="px-3 py-2.5">{r.gender || '—'}</td>
                        <td className="px-3 py-2.5">{r.category || '—'}</td>
                        <td className="px-3 py-2.5">{r.alloted_category || '—'}</td>
                        <td className="px-3 py-2.5">{r.region || '—'}</td>
                        <td className="px-3 py-2.5">{String(r.phase ?? '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRecords.length === 0 && <div className="p-8 text-center text-xs text-slate-500">No records match the current filters.</div>}
              {filteredRecords.length > 0 && (
                <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" disabled={tablePage <= 1} onClick={() => setTablePage((p) => Math.max(1, p - 1))} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
                  <span className="text-[11px] text-slate-500">{filteredRecords.length.toLocaleString('en-IN')} records</span>
                  <button type="button" disabled={tablePage >= totalPages} onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Gender distribution</h3>
                <div className="mt-3 space-y-2">{genderCounts.map(([g, count]) => <div key={g} className="flex items-center justify-between text-xs"><span>{g}</span><span className="font-black">{count}</span></div>)}</div>
              </div>
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/10 p-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Important note</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  These are observed allotment records in the available AP EAPCET 2025 dataset, not guaranteed admission cutoffs or predictions. Candidate category and allotted category are separate fields.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchPanel = ({ title, placeholder, value, onChange, onSearch, buttonLabel, loading }: any) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
    <label className="text-xs font-black text-slate-700 dark:text-slate-200">{title}</label>
    <div className="mt-2 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSearch()} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2.5 text-sm outline-none" />
      </div>
      <button type="button" onClick={onSearch} disabled={loading || !value.trim()} className="rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-black text-white disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonLabel}
      </button>
    </div>
  </div>
);

const SelectFilter = ({ label, value, onChange, options }: any) => (
  <label className="text-[11px] font-bold text-slate-500">
    <span className="block mb-1">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2.5 text-xs text-slate-800 dark:text-slate-200">
      <option value="ALL">All</option>
      {options.map((option: string) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const Stat = ({ label, value, icon }: any) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{icon}{label}</div>
    <div className="mt-1 text-base sm:text-lg font-black text-slate-900 dark:text-white">{value}</div>
  </div>
);

const Mini = ({ label, value }: any) => (
  <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5">
    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 text-xs font-black text-slate-800 dark:text-slate-200 break-words">{value}</div>
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">{text}</div>
);

export default ApEapcet2025AllotmentExplorer;
