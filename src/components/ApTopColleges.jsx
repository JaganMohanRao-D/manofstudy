import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  CheckCircle2, 
  MapPin, 
  Search, 
  Sparkles, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { getAPTopCollegeBranches, getAPTopCollegeDistricts, getAPTopCollegeRows } from '../services/apTopCollegesService';

const formatRank = (value) => (Number.isFinite(value) && value > 0 ? Math.round(value).toLocaleString('en-IN') : '—');

export default function ApTopColleges({ onSelectCollegeBranch }) {
  const [branch, setBranch] = useState('CSE');
  const [district, setDistrict] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('fill_desc');
  const [branches, setBranches] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([getAPTopCollegeBranches(), getAPTopCollegeDistricts()])
      .then(([nextBranches, nextDistricts]) => {
        if (!active) return;
        setBranches(nextBranches);
        setDistricts(nextDistricts);
        if (nextBranches.length && !nextBranches.some((item) => item.code === branch)) {
          setBranch(nextBranches.some((item) => item.code === 'CSE') ? 'CSE' : nextBranches[0].code);
        }
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load AP college analysis.');
        setRows([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getAPTopCollegeRows(branch, district, search, sortBy)
      .then((next) => {
        if (active) {
          setRows(next);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (active) {
          setRows([]);
          setLoadError(error instanceof Error ? error.message : 'Unable to load AP college analysis.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [branch, district, search, sortBy]);

  const selectedBranchName = useMemo(
    () => branches.find((item) => item.code === branch)?.name || (branch === 'ALL' ? 'All Engineering Branches' : branch),
    [branches, branch]
  );

  const summary = useMemo(() => {
    if (!rows.length) return { median: 0, opening: 0, closing: 0, records: 0, seats: 0, filled: 0, remaining: 0, top25: 0, fillRate: '—' };
    const medians = rows.map((row) => row.stats.medianRank).filter((value) => value > 0).sort((a, b) => a - b);
    const openings = rows.map((row) => row.stats.openingRank).filter((value) => value > 0);
    const closings = rows.map((row) => row.stats.closingRank).filter((value) => value > 0);
    const median = medians.length % 2
      ? medians[Math.floor(medians.length / 2)]
      : medians.length
        ? (medians[medians.length / 2 - 1] + medians[medians.length / 2]) / 2
        : 0;
    const totalSeats = rows.reduce((sum, row) => sum + (row.stats.seatStats?.totalSeats || 0), 0);
    const filledSeats = rows.reduce((sum, row) => sum + (row.stats.seatStats?.filledSeats || 0), 0);
    const remainingSeats = rows.reduce((sum, row) => sum + (row.stats.seatStats?.remainingSeats || 0), 0);
    const fillRate = totalSeats > 0 ? ((filledSeats / totalSeats) * 100).toFixed(1) + '%' : '—';
    return {
      median,
      opening: openings.length ? Math.min(...openings) : 0,
      closing: closings.length ? Math.max(...closings) : 0,
      records: rows.reduce((sum, row) => sum + row.stats.validOcAllotments, 0),
      seats: totalSeats,
      filled: filledSeats,
      remaining: remainingSeats,
      fillRate,
      top25: rows.reduce((sum, row) => sum + (row.stats.top25kAllotments || 0), 0),
    };
  }, [rows]);

  return (
    <div className="mos-ap-top min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Top Header matching TG */}
        <header className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:border-cyan-500/10 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40 p-5 sm:p-7 shadow-xl">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> Grounded in Official AP EAPCET 2026 Allotment Dataset
            </span>
            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Top B.Tech Colleges in <span className="text-cyan-600 dark:text-cyan-400">Andhra Pradesh</span>
            </h1>
            <p className="mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Compare observed 2026 AP EAPCET college and branch rank patterns using opening rank, median rank, closing rank, seat capacity, seats filled, and transparent rank-threshold allotment counts.
            </p>
          </div>
        </header>

        {/* Filter Controls Panel */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Engineering branch
              <select 
                value={branch} 
                onChange={(event) => setBranch(event.target.value)} 
                className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Engineering Branches (Combined View)</option>
                {branches.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} · {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              District / Location
              <select 
                value={district} 
                onChange={(event) => setDistrict(event.target.value)} 
                className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Andhra Pradesh Districts ({districts.length})</option>
                {districts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Filter by college name / code
              <div className="relative mt-1.5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search college name or code..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </label>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Sort colleges by:</span>
              <select 
                value={sortBy} 
                onChange={(event) => setSortBy(event.target.value)} 
                className="rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="fill_desc">Seat fill rate · Highest first</option>
                <option value="top25_desc">Rank ≤25,000 allotments · Most first</option>
                <option value="top25share_desc">Rank ≤25,000 share · Highest first</option>
                <option value="filled_desc">Filled seats · Most first</option>
                <option value="remaining_asc">Remaining seats · Fewest first</option>
                <option value="median_asc">Median OC rank · Lowest first</option>
                <option value="opening_asc">Opening OC rank · Lowest first</option>
                <option value="closing_asc">Closing OC rank · Lowest first</option>
              </select>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-slate-200">{rows.length}</strong> matching institutions
            </span>
          </div>
        </section>

        {/* Summary Metric Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {[
            ['Colleges in view', rows.length, Building2, rows.length ? rows.length.toLocaleString('en-IN') : '—'],
            ['Total seats', summary.seats, Target, summary.seats ? summary.seats.toLocaleString('en-IN') : '—'],
            ['Filled seats', summary.filled, CheckCircle2, summary.filled ? summary.filled.toLocaleString('en-IN') : '—'],
            ['Seats left', summary.remaining, BarChart3, summary.remaining ? summary.remaining.toLocaleString('en-IN') : '—'],
            ['Fill rate', summary.fillRate, Sparkles, summary.fillRate],
            ['Rank ≤25k allotments', summary.top25, TrendingUp, summary.top25 ? summary.top25.toLocaleString('en-IN') : '—'],
          ].map(([label, value, Icon, displayValue]) => (
            <div key={String(label)} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase tracking-[.14em] text-slate-500 dark:text-slate-400 font-bold truncate">{label}</span>
                {React.createElement(Icon, { className: 'h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0' })}
              </div>
              <div className="mt-1.5 text-base sm:text-xl font-black text-slate-950 dark:text-white">
                {displayValue}
              </div>
            </div>
          ))}
        </section>

        {loadError && (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
            {loadError}
          </section>
        )}

        {/* Results List */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-cyan-700 dark:text-cyan-300">Observed college comparison</p>
              <h2 className="mt-0.5 text-lg sm:text-xl font-black text-slate-950 dark:text-white">{selectedBranchName}</h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? 'Analysing 2026 allotment records…' : `${rows.length.toLocaleString()} colleges with observed OC records`}
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading observed AP college data…</div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No matching OC allotment records were found for this branch and district.
              </div>
            ) : (
              rows.slice(0, 100).map((row) => (
                <article key={row.collegeCode + '-' + row.branchCode} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-3 min-w-0 lg:w-[34%]">
                      <div className="shrink-0 grid place-items-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-black text-xs">
                        #{row.rankPosition}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">{row.collegeName}</h3>
                          {row.stats.isLimitedData && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              Limited observed data
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{row.collegeCode}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> {row.district}</span>
                          <span>·</span>
                          <span>{row.branchCode === 'ALL' ? 'All branches combined' : row.branchCode}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {[
                        ['Opening OC', row.stats.openingRank, 'text-emerald-700 dark:text-emerald-400'],
                        ['Median OC', row.stats.medianRank, 'text-indigo-700 dark:text-indigo-400'],
                        ['Closing OC', row.stats.closingRank, 'text-amber-700 dark:text-amber-400'],
                      ].map(([label, value, colorClass]) => (
                        <div key={String(label)} className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5 sm:p-3 text-center sm:text-left">
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">{label}</div>
                          <div className={'mt-1 font-mono font-bold text-xs sm:text-sm ' + colorClass}>#{formatRank(Number(value))}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seat Insights row */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2 sm:p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">Total seats</div>
                      <div className="mt-0.5 font-bold font-mono text-xs sm:text-sm text-slate-900 dark:text-white">{row.stats.seatStats ? row.stats.seatStats.totalSeats.toLocaleString('en-IN') : '—'}</div>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 p-2 sm:p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-medium">Filled</div>
                      <div className="mt-0.5 font-bold font-mono text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">{row.stats.seatStats ? row.stats.seatStats.filledSeats.toLocaleString('en-IN') : '—'}</div>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-2 sm:p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-medium">Seats left</div>
                      <div className="mt-0.5 font-bold font-mono text-xs sm:text-sm text-amber-800 dark:text-amber-200">{row.stats.seatStats ? row.stats.seatStats.remainingSeats.toLocaleString('en-IN') : '—'}</div>
                    </div>
                    <div className="rounded-xl bg-cyan-500/10 p-2 sm:p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-medium">Fill rate</div>
                      <div className="mt-0.5 font-bold font-mono text-xs sm:text-sm text-cyan-800 dark:text-cyan-200">{row.stats.seatStats ? row.stats.seatStats.fillRatePercent.toFixed(1) + '%' : '—'}</div>
                    </div>
                  </div>

                  {/* Seat fill progress bar */}
                  <div className="mt-2.5 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                      style={{ width: Math.min(100, Math.max(0, row.stats.seatStats?.fillRatePercent || 0)) + '%' }}
                    />
                  </div>

                  {/* Footer demand insights */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {row.stats.top25kAllotments.toLocaleString('en-IN')} allotments with rank ≤25,000
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span>{row.stats.top25kSharePercent.toFixed(1)}% of observed branch allotments</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{row.stats.validOcAllotments.toLocaleString('en-IN')} valid OC records used</span>
                    </div>

                    {onSelectCollegeBranch && (
                      <button
                        type="button"
                        onClick={() => onSelectCollegeBranch(row.collegeCode, row.branchCode !== 'ALL' ? row.branchCode : undefined)}
                        className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold hover:underline cursor-pointer"
                      >
                        <span>Explore College</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Methodology Note & Category Safety Disclaimer */}
        <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 sm:p-5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
          <div className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Methodology &amp; Data Provenance Notice
          </div>
          <p>
            Methodology note: College-level rank comparisons use observed OC-category allotment ranks as a standardized comparison cohort. This does not indicate that any category or community is better or worse than another. Category-specific allotment information remains available separately in the College Predictor using the category selected by the user. All figures are historical observations from the available 2026 allotment dataset and are not guarantees of future admission.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Data source: AP EAPCET 2026 allotment records available in the Naa College dataset, based on official AP EAPCET/APSHE counselling information. An allotment record represents an observed allotment in the dataset and should not automatically be interpreted as confirmed joining/reporting.
          </p>
        </section>
      </div>
    </div>
  );
}
