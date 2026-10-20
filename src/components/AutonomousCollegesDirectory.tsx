import React, { useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal, ExternalLink, CalendarDays, Building2 } from 'lucide-react';
import apDataRaw from '../data/ap-autonomous-colleges.json?raw';
import tgDataRaw from '../data/telangana-autonomous-colleges.json?raw';

type College = {
  sr_no?: number | string;
  state?: string;
  college_name?: string;
  autonomy_from?: string;
  autonomy_valid_upto?: string;
  affiliated_to?: string;
};
type Dataset = { source?: string; state?: string; total?: number; colleges?: College[] };
// The AP source contains a few bare NaN tokens, which are not valid JSON. Parse a derived copy safely without editing the original source file.
const parseDataset = (raw: string): Dataset => JSON.parse(raw.replace(/\bNaN\b/g, 'null')) as Dataset;
const datasets = [parseDataset(apDataRaw), parseDataset(tgDataRaw)];
const clean = (value: unknown) => String(value ?? '').trim();
const norm = (value: unknown) => clean(value).toLocaleLowerCase();
const getYear = (value: unknown): number | null => {
  const match = clean(value).match(/(?:19|20|21)\d{2}/);
  return match ? Number(match[0]) : null;
};
const stateLabel = (college: College, datasetState: string) => {
  const state = norm(college.state || datasetState);
  if (state.includes('telangana')) return 'Telangana';
  if (state.includes('andhra')) return 'Andhra Pradesh';
  return clean(college.state || datasetState) || 'State not recorded';
};
const sourceRecords = datasets.flatMap((dataset) =>
  (Array.isArray(dataset.colleges) ? dataset.colleges : []).map((college, index) => ({
    ...college,
    _state: stateLabel(college, clean(dataset.state)),
    _key: `${clean(dataset.state)}-${clean(college.sr_no) || index}-${clean(college.college_name)}`,
  }))
);
const stateOptions = ['All states', 'Andhra Pradesh', 'Telangana'] as const;
type StateFilter = typeof stateOptions[number];

export const AutonomousCollegesDirectory: React.FC = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<StateFilter>('All states');
  const [university, setUniversity] = useState('All universities');
  const [year, setYear] = useState('All years');
  const [sort, setSort] = useState('name-asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    document.title = 'Autonomous Colleges in Andhra Pradesh & Telangana | Naa College';
    let description = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = 'Search and filter the recorded autonomous college directory for Andhra Pradesh and Telangana, including affiliation and autonomy dates.';
    return () => { document.title = 'Naa College'; };
  }, []);

  const universities = useMemo(() => [...new Set(sourceRecords.map((college) => clean(college.affiliated_to)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b)), []);
  const years = useMemo(() => [...new Set(sourceRecords.map((college) => getYear(college.autonomy_from)).filter((value): value is number => value !== null))]
    .sort((a, b) => b - a), []);

  const filtered = useMemo(() => {
    const needle = norm(query);
    const rows = sourceRecords.filter((college) => {
      if (state !== 'All states' && college._state !== state) return false;
      if (university !== 'All universities' && clean(college.affiliated_to) !== university) return false;
      if (year !== 'All years' && getYear(college.autonomy_from) !== Number(year)) return false;
      if (!needle) return true;
      return [college.college_name, college.affiliated_to, college.autonomy_from, college.autonomy_valid_upto, college.sr_no, college._state]
        .some((value) => norm(value).includes(needle));
    });
    const yearValue = (college: College) => getYear(college.autonomy_from);
    return rows.sort((a, b) => {
      if (sort === 'name-desc') return clean(b.college_name).localeCompare(clean(a.college_name));
      if (sort === 'year-old') return (yearValue(a) ?? Number.POSITIVE_INFINITY) - (yearValue(b) ?? Number.POSITIVE_INFINITY);
      if (sort === 'year-new') return (yearValue(b) ?? Number.NEGATIVE_INFINITY) - (yearValue(a) ?? Number.NEGATIVE_INFINITY);
      return clean(a.college_name).localeCompare(clean(b.college_name));
    });
  }, [query, state, university, year, sort]);

  useEffect(() => setPage(1), [query, state, university, year, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const apCount = sourceRecords.filter((college) => college._state === 'Andhra Pradesh').length;
  const tgCount = sourceRecords.filter((college) => college._state === 'Telangana').length;
  const hasFilters = Boolean(query.trim()) || state !== 'All states' || university !== 'All universities' || year !== 'All years';

  const reset = () => { setQuery(''); setState('All states'); setUniversity('All universities'); setYear('All years'); setSort('name-asc'); setPage(1); };
  const first = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, filtered.length);

  return (
    <div className="min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2 font-bold text-slate-900" aria-label="Naa College home">
            <img src="/Naacollege_fulllogo.webp" alt="Naa College home" width="320" height="180" className="block h-auto max-h-11 w-[min(44vw,220px)] object-contain" decoding="async" />
          </a>
          <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to home <ExternalLink size={14} className="ml-1 inline"/></a>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="max-w-4xl border-b border-slate-200 pb-7 sm:pb-9">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-700">Admissions reference · AP & Telangana</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">Autonomous Colleges in Andhra Pradesh &amp; Telangana</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Search colleges listed in the supplied UGC-derived dataset and review their recorded autonomy dates and affiliating universities.</p>
          <p className="mt-2 text-xs text-slate-500">Source: records extracted from a UGC document. This directory does not independently verify current status.</p>
        </div>

        <section aria-label="Dataset totals" className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4 border-b border-slate-200 pb-5">
          {[{label:'Andhra Pradesh colleges',value:apCount},{label:'Telangana colleges',value:tgCount},{label:'Total source records',value:sourceRecords.length}].map((item) => (
            <div key={item.label} className="min-w-[110px]">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{item.value.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </section>

        <section aria-label="Search and filters" className="mt-6 border-y border-slate-200 bg-white/70 py-5 sm:py-6">
          <label htmlFor="autonomous-search" className="mb-2 block text-sm font-semibold text-slate-800">Search directory</label>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="autonomous-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search college name, affiliated university, or year..." className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="autonomous-state" className="mb-1.5 block text-xs font-semibold text-slate-600">State</label>
              <select id="autonomous-state" value={state} onChange={(event) => setState(event.target.value as StateFilter)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                {stateOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="autonomous-university" className="mb-1.5 block text-xs font-semibold text-slate-600">Affiliated university</label>
              <select id="autonomous-university" value={university} onChange={(event) => setUniversity(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option>All universities</option>{universities.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="autonomous-year" className="mb-1.5 block text-xs font-semibold text-slate-600">Autonomy start year</label>
              <select id="autonomous-year" value={year} onChange={(event) => setYear(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="All years">All years</option>{years.map((value) => <option key={value} value={String(value)}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="autonomous-sort" className="mb-1.5 block text-xs font-semibold text-slate-600">Sort results</label>
              <select id="autonomous-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="name-asc">College name A–Z</option><option value="name-desc">College name Z–A</option><option value="year-old">Autonomy year: oldest first</option><option value="year-new">Autonomy year: newest first</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600"><SlidersHorizontal size={15} className="mr-1.5 inline"/>Showing <strong className="text-slate-900">{filtered.length.toLocaleString('en-IN')}</strong> matching records</p>
            <button type="button" onClick={reset} disabled={!hasFilters && sort === 'name-asc'} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw size={15}/> Reset filters</button>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">{filtered.length ? `Showing ${first}–${last} of ${filtered.length.toLocaleString('en-IN')} colleges` : 'No matching colleges'}</p>
          <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
        </div>

        <section aria-label="College results" className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visible.length ? visible.map((college) => (
            <article key={college._key} className="group flex min-w-0 flex-col border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-blue-300 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-[17px] font-bold leading-6 tracking-[-0.02em] text-slate-950">{clean(college.college_name) || 'College name not recorded'}</h2>
                  <p className="mt-1 break-words text-sm leading-5 text-slate-600">{clean(college.affiliated_to) || 'Affiliated university not recorded'}</p>
                </div>
                <span className="w-fit shrink-0 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{college._state}</span>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3.5 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-slate-500">Autonomy commenced</dt><dd className="mt-1 font-medium text-slate-800">{clean(college.autonomy_from) || 'Not recorded'}</dd></div>
                <div><dt className="text-xs text-slate-500">Recorded validity period</dt><dd className="mt-1 font-medium text-slate-800">{clean(college.autonomy_valid_upto) || 'Not recorded'}</dd></div>
                {clean(college.sr_no) && <div><dt className="text-xs text-slate-500">Source serial number</dt><dd className="mt-1 font-medium text-slate-800">{clean(college.sr_no)}</dd></div>}
              </dl>
            </article>
          )) : (
            <div className="px-5 py-14 text-center">
              <Search size={26} className="mx-auto text-slate-300"/>
              <h2 className="mt-3 text-base font-semibold text-slate-900">No colleges match your current search or filters.</h2>
              <p className="mt-1 text-sm text-slate-500">Try a different name or university, or clear the filters.</p>
              <button type="button" onClick={reset} className="mt-4 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Clear filters</button>
            </div>
          )}
        </section>

        {filtered.length > 0 && <nav aria-label="College result pages" className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16}/> Previous</button>
          <span className="text-sm tabular-nums text-slate-600">{first}–{last} of {filtered.length.toLocaleString('en-IN')}</span>
          <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={16}/></button>
        </nav>}

        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">College details are based on the source document used for this directory. Autonomy validity dates reflect the recorded data and should be checked against the latest official UGC or affiliating-university information before making admission decisions.</p>
      </main>
    </div>
  );
};

export default AutonomousCollegesDirectory;
