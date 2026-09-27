import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  MapPin,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import {
  getTgRankingBranches,
  getTgRankingDistricts,
  getTgTopCollegeRanking,
  type TgTopCollegeRow,
} from '../services/tgTopCollegeRankingService';

const PAGE_SIZE = 10;

const formatRank = (value: number) => (value != null ? value.toLocaleString('en-IN') : '—');

function SelectField({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <label className="group block">
      <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-900 outline-none transition-all hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-sky-500/50"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

function RankStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700/70 dark:bg-slate-950/50">
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-500">{label}</p>
      <p className={`mt-1 text-base font-black tracking-tight ${tone === 'accent' ? 'text-sky-600 dark:text-sky-300' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function CollegeCard({
  row,
  onOpen,
}: {
  row: TgTopCollegeRow;
  onOpen: () => void;
  key?: string;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="group relative overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/90 p-4 shadow-[0_14px_45px_-28px_rgba(15,23,42,.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_60px_-30px_rgba(14,165,233,.35)] dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-sky-500/40"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl transition-all duration-500 group-hover:bg-cyan-400/15" />
      <div className="relative flex gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
          {row.rank <= 3 ? <Trophy className="h-5 w-5" /> : <span className="text-sm font-black">#{String(row.rank).padStart(2, '0')}</span>}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
              Observed OC analysis
            </span>
            <span className="text-[10px] font-bold text-slate-400">{row.collegeCode}</span>
          </div>

          <h3 className="mt-2 text-[15px] font-black leading-snug text-slate-950 dark:text-white">
            {row.collegeName}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{row.district}</span>
            <span>{row.branchCode}</span>
          </div>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <RankStat label="Median OC rank" value={formatRank(row.medianOcRank)} tone="accent" />
        <RankStat label="Highest observed" value={formatRank(row.highestObservedRank)} />
        <RankStat label="Lowest observed" value={formatRank(row.lowestObservedRank)} />
      </div>

      <div className="relative mt-2 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/40">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500">Valid OC allotments</p>
          <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{formatRank(row.validOcAllotments)}</p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition-all hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500/40 dark:hover:text-sky-300"
        >
          View analysis
        </button>
      </div>
    </motion.article>
  );
}

function DetailsModal({ row, onClose }: { row: TgTopCollegeRow; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${row.collegeName} OC rank analysis`}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-950"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Man of Study • Data Analysis</span>
              <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{row.collegeName}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.collegeCode} • {row.branchName} • {row.district}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <RankStat label="Median OC rank" value={formatRank(row.medianOcRank)} tone="accent" />
            <RankStat label="Highest observed" value={formatRank(row.highestObservedRank)} />
            <RankStat label="Lowest observed" value={formatRank(row.lowestObservedRank)} />
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
              <Database className="h-4 w-4 text-sky-500" />
              Calculation basis
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
              {formatRank(row.validOcAllotments)} valid records were used. Only students whose candidate category is OC and whose allotment is a normal OC seat were included. Reserved-category student ranks are not included.
            </p>
          </div>

          <div className="mt-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Branches listed for this college</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {row.availableBranches.map((branch) => (
                <span key={branch} className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {branch}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export const TgTopColleges: React.FC = () => {
  const branches = getTgRankingBranches();
  const districts = getTgRankingDistricts();

  const [branchCode, setBranchCode] = useState('CSE');
  const [district, setDistrict] = useState('All Districts');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<TgTopCollegeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalOcAllotments, setTotalOcAllotments] = useState(0);
  const [rankFloor, setRankFloor] = useState(0);
  const [rankCeiling, setRankCeiling] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRow, setSelectedRow] = useState<TgTopCollegeRow | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPage(1);
  }, [branchCode, district]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getTgTopCollegeRanking({ branchCode, district, page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setRows(result.rows);
        setTotal(result.total);
        setTotalOcAllotments(result.totalOcAllotments);
        setRankFloor(result.rankFloor);
        setRankCeiling(result.rankCeiling);
      })
      .catch(() => {
        if (!cancelled) setError('College analysis could not be loaded. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [branchCode, district, page]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      row.collegeName.toLowerCase().includes(q) ||
      row.collegeCode.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeBranch = branches.find((branch) => branch.branchCode === branchCode);

  return (
    <div className="relative isolate overflow-hidden rounded-[32px] border border-[var(--mos-border)] bg-[var(--mos-surface)] text-[var(--mos-text-primary)] shadow-[0_30px_100px_-55px_rgba(2,132,199,.45)]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.7) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative border-b border-slate-200/80 px-4 py-7 sm:px-7 sm:py-9 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            TG EAPCET 2026
          </span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
            OC allotment analysis
          </span>
        </div>

        <div className="mt-5 max-w-4xl">
          <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Find colleges by your branch.
            <span className="block bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 bg-clip-text text-transparent">See the observed OC rank picture.</span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Compare Telangana colleges branch-by-branch using the median, highest observed and lowest observed OC-category allotment ranks in the available 2026 dataset.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <SelectField
            label="Choose branch"
            value={branchCode}
            onChange={setBranchCode}
            icon={<Award className="h-3.5 w-3.5 text-sky-500" />}
            options={[
              { value: 'ALL', label: 'All Branches — explore by branch' },
              ...branches.map((branch) => ({
                value: branch.branchCode,
                label: `${branch.branchCode} · ${branch.branchName}`,
              })),
            ]}
          />
          <SelectField
            label="Choose district"
            value={district}
            onChange={setDistrict}
            icon={<MapPin className="h-3.5 w-3.5 text-violet-500" />}
            options={[
              { value: 'All Districts', label: 'All Districts' },
              ...districts.map((value) => ({ value, label: value })),
            ]}
          />
          <label className="group block">
            <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <Search className="h-3.5 w-3.5 text-cyan-500" />
              Search
            </span>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="College name or code"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700/80 dark:bg-slate-900 dark:text-white"
              />
              {search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-4 w-4" /></button>}
            </div>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Selected:</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{branchCode === 'ALL' ? 'All branches' : activeBranch?.branchCode}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{district}</span>
          <span className="ml-auto">10 colleges per page</span>
        </div>
      </div>

      {branchCode === 'ALL' ? (
        <div className="px-4 py-8 sm:px-7">
          <div className="rounded-[26px] border border-sky-200 bg-sky-50/80 p-6 dark:border-sky-500/20 dark:bg-sky-500/5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-3 text-sky-600 shadow-sm dark:bg-slate-900 dark:text-sky-300"><BarChart3 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-black">Compare branches separately</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Different branches have different admission demand. Man of Study therefore does not mix CSE, ECE, Mechanical and other branches into one misleading median. Pick a branch above to see its college-by-college OC analysis.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {branches.map((branch) => (
                <button
                  key={branch.branchCode}
                  type="button"
                  onClick={() => setBranchCode(branch.branchCode)}
                  className="rounded-2xl border border-sky-100 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-sky-300 dark:border-sky-500/10 dark:bg-slate-900 dark:hover:border-sky-500/40"
                >
                  <span className="text-xs font-black text-sky-600 dark:text-sky-300">{branch.branchCode}</span>
                  <span className="mt-1 block line-clamp-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">{branch.branchName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 border-b border-slate-200/80 px-4 py-4 sm:grid-cols-4 sm:px-7 dark:border-slate-800">
            {[
              ['Eligible colleges', (total ?? 0).toLocaleString('en-IN'), Trophy],
              ['Valid OC allotments', (totalOcAllotments ?? 0).toLocaleString('en-IN'), Database],
              ['Observed rank floor', rankFloor ? formatRank(rankFloor) : '—', Award],
              ['Observed rank ceiling', rankCeiling ? formatRank(rankCeiling) : '—', BarChart3],
            ].map(([label, value, Icon]: any) => (
              <div key={String(label)} className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"><Icon className="h-3.5 w-3.5 text-sky-500" />{label}</div>
                <div className="mt-1 text-base font-black">{value}</div>
              </div>
            ))}
          </div>

          <div className="px-4 py-5 sm:px-7">
            {loading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-800/60" />)}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>
            ) : filteredRows.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                <Search className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-base font-black">No matching colleges</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try another branch, district or search term.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid gap-3 lg:grid-cols-2">
                  {filteredRows.map((row) => <CollegeCard key={row.collegeCode} row={row} onOpen={() => setSelectedRow(row)} />)}
                </div>
              </AnimatePresence>
            )}
          </div>

          {!loading && !error && total > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-4 sm:px-7 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-1.5">
                <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                <span className="min-w-14 text-center text-xs font-black">{page} / {totalPages}</span>
                <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-xl border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="border-t border-slate-200/80 px-4 py-6 sm:px-7 dark:border-slate-800">
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><ShieldCheck className="h-4 w-4" /></div>
            <div>
              <h2 className="text-sm font-black">How do we rank colleges?</h2>
              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                Man of Study does not publish an official or government college ranking. For a selected branch, colleges are ordered primarily by the median of valid OC-category allotment ranks in the available Telangana EAPCET 2026 dataset. The highest and lowest observed OC ranks are also shown. Reserved-category student ranks are not used in this analysis.
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Lower rank numbers represent stronger numerical ranks. These figures describe the available allotment records; they do not guarantee future cutoffs, admission chances, college quality, placements or student outcomes. Verify current official counselling information before making admission decisions.
              </p>
              <p className="mt-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Source context: Telangana EAPCET 2026 college-wise allotment records. The official TGEAPCET portal publishes college-wise allotment details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedRow && <DetailsModal row={selectedRow} onClose={() => setSelectedRow(null)} />}
    </div>
  );
};

export default TgTopColleges;
