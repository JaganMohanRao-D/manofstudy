import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, CheckCircle2, MapPin, Search, Sparkles, Target, TrendingUp } from 'lucide-react';
import { getAPTopCollegeBranches, getAPTopCollegeDistricts, getAPTopCollegeRows } from '../services/apTopCollegesService';

const formatRank = (value: number) => Number.isFinite(value) ? Math.round(value).toLocaleString('en-IN') : '—';

export default function ApTopColleges() {
  const [branch, setBranch] = useState('CSE');
  const [district, setDistrict] = useState('ALL');
  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getAPTopCollegeBranches(), getAPTopCollegeDistricts()]).then(([b, d]) => {
      if (!active) return;
      setBranches(b);
      setDistricts(d);
      if (!b.some((x) => x.code === branch) && b.length) setBranch(b[0].code);
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAPTopCollegeRows(branch, district, search).then((next) => {
      if (active) setRows(next);
    }).catch(() => {
      if (active) setRows([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [branch, district, search]);

  const selectedBranchName = useMemo(() => branches.find((x) => x.code === branch)?.name || branch, [branches, branch]);

  return (
    <div className="mos-ap-top min-h-screen py-5 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:border-cyan-400/10 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/50 p-5 sm:p-8 shadow-xl">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl mos-float" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-cyan-700 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> AP EAPCET 2026 · Observed allotment analysis
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-[-.04em] text-slate-950 dark:text-white">AP B.Tech College <span className="text-cyan-500 dark:text-cyan-300">Explorer</span></h1>
            <p className="mt-3 max-w-3xl text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300">
              Explore branch-wise observed rank patterns from the available AP EAPCET 2026 allotment records. Use the numbers as historical context, not as an official college ranking or a guarantee of admission.
            </p>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 p-4 sm:p-5 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Branch
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="mos-ap-control mt-1.5 w-full rounded-2xl px-3.5 py-3.5 text-sm font-bold outline-none">
                <option value="ALL">All branches</option>
                {branches.map((x) => <option key={x.code} value={x.code}>{x.code} · {x.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">District
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mos-ap-control mt-1.5 w-full rounded-2xl px-3.5 py-3.5 text-sm font-bold outline-none">
                <option value="ALL">All districts</option>
                {districts.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Search college
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="College name or code..." className="mos-ap-control w-full rounded-2xl pl-9 pr-3.5 py-3.5 text-sm font-semibold outline-none" />
              </div>
            </label>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[['Colleges shown', rows.length, Building2], ['Branch view', branch === 'ALL' ? 'All' : branch, Target], ['District', district === 'ALL' ? 'All' : district, MapPin], ['Data year', '2026', BarChart3]].map(([label, value, Icon]) => (
            <div key={String(label)} className="mos-stat-card rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 p-4 shadow-lg">
              <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.14em] text-slate-500 dark:text-slate-400">{label}</span>{React.createElement(Icon as React.ElementType, { className: 'h-4 w-4 text-cyan-500' })}</div>
              <div className="mt-2 text-lg sm:text-2xl font-black text-slate-950 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-cyan-600 dark:text-cyan-300">Observed rank patterns</p><h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{selectedBranchName}</h2></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{loading ? 'Analysing records…' : rows.length.toLocaleString() + ' colleges with usable OC records'}</span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? <div className="p-10 text-center text-sm text-slate-500">Loading 2026 allotment analysis…</div> :
             rows.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No matching OC allotment records were found.</div> :
             rows.slice(0, 100).map((row) => {
              const spread = Math.max(1, row.stats.lowestRank - row.stats.highestRank);
              const medianPosition = Math.max(4, Math.min(96, ((row.stats.medianRank - row.stats.highestRank) / spread) * 100));
              return (
                <article key={row.collegeCode + '-' + row.branchCode} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-3 min-w-0 lg:w-[34%]">
                      <div className="shrink-0 grid place-items-center h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-black text-xs">{row.rankPosition}</div>
                      <div className="min-w-0"><h3 className="font-black text-slate-900 dark:text-white leading-snug">{row.collegeName}</h3><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{row.collegeCode} · {row.district} · {row.branchCode}</p></div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {[
                        ['Highest observed', row.stats.highestRank, 'text-cyan-600 dark:text-cyan-300'],
                        ['Median', row.stats.medianRank, 'text-indigo-600 dark:text-indigo-300'],
                        ['Last observed', row.stats.lowestRank, 'text-amber-600 dark:text-amber-300'],
                      ].map(([label, value, color]) => <div key={String(label)} className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3"><div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div><div className={'mt-1 font-black ' + color}>#{formatRank(Number(value))}</div></div>)}
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-400 to-amber-400 opacity-80" />
                    <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 shadow-lg transition-all duration-700" style={{ left: 'calc(' + medianPosition + '% - 8px)' }} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{row.stats.validOcAllotments.toLocaleString()} OC candidate-category allotment records used</div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 sm:p-5 text-xs leading-6 text-slate-600 dark:text-slate-300">
          <div className="font-black text-cyan-700 dark:text-cyan-300">How this analysis is calculated</div>
          <p className="mt-1">Only records whose candidate category is OC are included for this comparison. We show the highest observed rank, mathematical median rank and last observed rank for the selected branch. OC is used as one consistent reference group so colleges can be compared on the same category basis; this does not mean OC is inherently more important than other categories. The results are based on the available 2026 source records and can change as datasets or counselling rules change.</p>
        </section>
        <div className="flex items-start gap-2 text-[10px] leading-5 text-slate-500 dark:text-slate-400"><TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>Context only: observed allotment ranks are not official cutoffs, admission guarantees, or a substitute for the current counselling authority's notices.</span></div>
      </div>
    </div>
  );
}
