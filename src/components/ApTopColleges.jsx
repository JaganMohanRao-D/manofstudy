import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, CheckCircle2, MapPin, Search, Sparkles, Target, TrendingUp } from 'lucide-react';
import { getAPTopCollegeBranches, getAPTopCollegeDistricts, getAPTopCollegeRows } from '../services/apTopCollegesService';

const formatRank = (value) => Number.isFinite(value) ? Math.round(value).toLocaleString('en-IN') : '—';

export default function ApTopColleges() {
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
    if (!rows.length) return { median: 0, opening: 0, closing: 0, records: 0, seats: 0, filled: 0, remaining: 0, top25: 0 };
    const medians = rows.map((row) => row.stats.medianRank).filter((value) => value > 0).sort((a, b) => a - b);
    const openings = rows.map((row) => row.stats.openingRank).filter((value) => value > 0);
    const closings = rows.map((row) => row.stats.closingRank).filter((value) => value > 0);
    const median = medians.length % 2
      ? medians[Math.floor(medians.length / 2)]
      : medians.length
        ? (medians[medians.length / 2 - 1] + medians[medians.length / 2]) / 2
        : 0;
    return {
      median,
      opening: openings.length ? Math.min(...openings) : 0,
      closing: closings.length ? Math.max(...closings) : 0,
      records: rows.reduce((sum, row) => sum + row.stats.validOcAllotments, 0),
      seats: rows.reduce((sum, row) => sum + (row.stats.seatStats?.totalSeats || 0), 0),
      filled: rows.reduce((sum, row) => sum + (row.stats.seatStats?.filledSeats || 0), 0),
      remaining: rows.reduce((sum, row) => sum + (row.stats.seatStats?.remainingSeats || 0), 0),
      top25: rows.reduce((sum, row) => sum + row.stats.top25kAllotments, 0),
    };
  }, [rows]);

  return (
    <div className="mos-ap-top min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)] py-5 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:border-cyan-400/10 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/50 p-5 sm:p-8 shadow-xl">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl mos-float" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-cyan-700 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> AP EAPCET 2026 · Observed allotment analysis
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-[-.04em] text-slate-950 dark:text-white">
              AP B.Tech College <span className="text-cyan-600 dark:text-cyan-300">Explorer</span>
            </h1>
            <p className="mt-3 max-w-3xl text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300">
              Compare observed 2026 AP EAPCET college and branch demand using rank patterns, total seats, filled seats, seats remaining, seat fill rate and transparent rank-threshold allotment counts. This is historical context from the available allotment records, not an official ranking or admission guarantee.
            </p>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 p-4 sm:p-5 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Engineering branch
              <select value={branch} onChange={(event) => setBranch(event.target.value)} className="mos-ap-control mt-1.5 w-full rounded-2xl px-3.5 py-3.5 text-sm font-bold outline-none">
                <option value="ALL">All engineering branches</option>
                {branches.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              District / region
              <select value={district} onChange={(event) => setDistrict(event.target.value)} className="mos-ap-control mt-1.5 w-full rounded-2xl px-3.5 py-3.5 text-sm font-bold outline-none">
                <option value="ALL">All Andhra Pradesh</option>
                {districts.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Search college
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="College name or code..."
                  className="mos-ap-control w-full rounded-2xl pl-9 pr-3.5 py-3.5 text-sm font-semibold outline-none"
                />
              </div>
            </label>

            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sort observed ranks
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="mos-ap-control mt-1.5 w-full rounded-2xl px-3.5 py-3.5 text-sm font-bold outline-none">
                <option value="fill_desc">Seat fill rate · high first</option>
                <option value="top25_desc">Rank ≤25,000 allotments · high first</option>
                <option value="top25share_desc">Rank ≤25,000 share · high first</option>
                <option value="filled_desc">Filled seats · high first</option>
                <option value="remaining_asc">Remaining seats · low first</option>
                <option value="median_asc">Median OC rank · low first</option>
                <option value="opening_asc">Opening OC rank · low first</option>
                <option value="closing_asc">Closing OC rank · low first</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-slate-950/70 px-2.5 py-1">
              Statewide or district-specific view
            </span>
            <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-slate-950/70 px-2.5 py-1">
              Sort: {sortBy === 'fill_desc'
                ? 'highest seat fill rate first'
                : sortBy === 'top25_desc'
                  ? 'most allotments with rank ≤25,000 first'
                  : sortBy === 'top25share_desc'
                    ? 'highest rank ≤25,000 share first'
                    : sortBy === 'filled_desc'
                      ? 'most filled seats first'
                      : sortBy === 'remaining_asc'
                        ? 'fewest remaining seats first'
                        : sortBy === 'opening_asc'
                          ? 'lowest opening OC rank first'
                          : sortBy === 'closing_asc'
                            ? 'lowest closing OC rank first'
                            : 'lowest median OC rank first'}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Colleges in this view', rows.length, Building2, rows.length ? rows.length.toLocaleString('en-IN') : '—'],
            ['Total seats in view', summary.seats, Target, summary.seats ? summary.seats.toLocaleString('en-IN') : '—'],
            ['Filled seats in view', summary.filled, CheckCircle2, summary.filled ? summary.filled.toLocaleString('en-IN') : '—'],
            ['Rank ≤25,000 allotments', summary.top25, TrendingUp, summary.top25 ? summary.top25.toLocaleString('en-IN') : '—'],
          ].map(([label, value, Icon, displayValue]) => (
            <div key={String(label)} className="mos-stat-card rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[.14em] text-slate-500 dark:text-slate-400">{label}</span>
                {React.createElement(Icon, { className: 'h-4 w-4 text-cyan-600 dark:text-cyan-300' })}
              </div>
              <div className="mt-2 text-lg sm:text-2xl font-black text-slate-950 dark:text-white">
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

        <section className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-cyan-700 dark:text-cyan-300">Observed college comparison</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{selectedBranchName}</h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? 'Analysing 2026 allotment records…' : rows.length.toLocaleString() + ' colleges with usable OC records'}
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
                      <div className="shrink-0 grid place-items-center h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-black text-xs">
                        {row.rankPosition}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white leading-snug">{row.collegeName}</h3>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {row.collegeCode} · {row.district} · {row.branchCode === 'ALL' ? 'All branches' : row.branchCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {[
                        ['Opening rank', row.stats.openingRank, 'text-emerald-700 dark:text-emerald-300'],
                        ['Median rank', row.stats.medianRank, 'text-indigo-700 dark:text-indigo-300'],
                        ['Closing rank', row.stats.closingRank, 'text-amber-700 dark:text-amber-300'],
                      ].map(([label, value, className]) => (
                        <div key={String(label)} className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3">
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
                          <div className={'mt-1 font-black ' + className}>#{formatRank(Number(value))}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Total seats</div>
                      <div className="mt-1 font-black text-slate-900 dark:text-white">{row.stats.seatStats ? row.stats.seatStats.totalSeats.toLocaleString('en-IN') : '—'}</div>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Filled</div>
                      <div className="mt-1 font-black text-emerald-800 dark:text-emerald-200">{row.stats.seatStats ? row.stats.seatStats.filledSeats.toLocaleString('en-IN') : '—'}</div>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-300">Seats left</div>
                      <div className="mt-1 font-black text-amber-800 dark:text-amber-200">{row.stats.seatStats ? row.stats.seatStats.remainingSeats.toLocaleString('en-IN') : '—'}</div>
                    </div>
                    <div className="rounded-xl bg-cyan-500/10 p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Fill rate</div>
                      <div className="mt-1 font-black text-cyan-800 dark:text-cyan-200">{row.stats.seatStats ? row.stats.seatStats.fillRatePercent.toFixed(1) + '%' : '—'}</div>
                    </div>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                      style={{ width: Math.min(100, Math.max(0, row.stats.seatStats?.fillRatePercent || 0)) + '%' }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {row.stats.top25kAllotments.toLocaleString('en-IN')} allotments with rank ≤25,000
                    <span className="hidden sm:inline">·</span>
                    {row.stats.top25kSharePercent.toFixed(1)}% of observed allotments in this branch
                    <span className="hidden sm:inline">·</span>
                    {row.stats.validOcAllotments.toLocaleString('en-IN')} OC records used for rank metrics
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 sm:p-5 text-xs leading-6 text-slate-700 dark:text-slate-300">
          <div className="font-black text-cyan-800 dark:text-cyan-300">How this comparison is calculated</div>
          <p className="mt-1">
            The dataset is grouped by college and engineering branch. OC records are used for opening/median/closing rank metrics. Seat capacity and remaining seats come directly from the 2026 allotment records; the latest available counselling phase snapshot is used for each branch, and filled seats are calculated as total seats minus seats remaining. “Rank ≤25,000 allotments” is an absolute-rank demand indicator, not a claim that those candidates are inherently “good” or that the college is objectively better. There is no hidden weighted college score.
          </p>
        </section>
      </div>
    </div>
  );
}
