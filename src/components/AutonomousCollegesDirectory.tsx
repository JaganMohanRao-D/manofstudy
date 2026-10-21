import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal,
  ExternalLink, CalendarDays, Building2, MapPin, GraduationCap, X,
} from 'lucide-react';
import apDataRaw from '../data/ap-autonomous-colleges.json?raw';
import tgDataRaw from '../data/telangana-autonomous-colleges.json?raw';
import './AutonomousCollegesDirectory.css';

type College = {
  sr_no?: number | string;
  state?: string;
  college_name?: string;
  autonomy_from?: string;
  autonomy_valid_upto?: string;
  affiliated_to?: string;
};
type Dataset = { source?: string; state?: string; total?: number; colleges?: College[] };
type StateFilter = 'All states' | 'Andhra Pradesh' | 'Telangana';

// The supplied AP source contains a few bare NaN tokens. Parse a derived copy
// without modifying the original data file.
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
  })),
);
const stateOptions: StateFilter[] = ['All states', 'Andhra Pradesh', 'Telangana'];
const initials = (name: string) => {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((word) => word[0]).join('') || 'NC').toUpperCase();
};

export const AutonomousCollegesDirectory: React.FC = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<StateFilter>('All states');
  const [university, setUniversity] = useState('All universities');
  const [year, setYear] = useState('All years');
  const [sort, setSort] = useState('name-asc');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const previousDescription = description?.content;
    const meta = description || document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Search autonomous colleges in Andhra Pradesh and Telangana by college name, affiliating university and recorded autonomy year. Check official sources for current status.';
    if (!description) document.head.appendChild(meta);
    document.title = 'Autonomous Colleges in AP & Telangana | Naa College';
    return () => {
      document.title = previousTitle;
      if (previousDescription !== undefined) meta.content = previousDescription;
      else if (!description) meta.remove();
    };
  }, []);

  const universities = useMemo(
    () => [...new Set(sourceRecords.map((college) => clean(college.affiliated_to)).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [],
  );
  const years = useMemo(
    () => [...new Set(sourceRecords.map((college) => getYear(college.autonomy_from)).filter((value): value is number => value !== null))]
      .sort((a, b) => b - a),
    [],
  );

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
    const yearValue = (college: typeof sourceRecords[number]) => getYear(college.autonomy_from);
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
    <div className="naa-autonomous-page">
      <header className="naa-autonomous-header">
        <a href="/" className="naa-autonomous-brand" aria-label="Naa College home">
          <img src="/Naacollege_fulllogo.webp" alt="Naa College" width="320" height="180" />
        </a>
        <a href="/" className="naa-autonomous-home-link"><span>Back to Naa College</span><ExternalLink size={15} aria-hidden="true" /></a>
      </header>

      <main className="naa-autonomous-main">
        <section className="naa-autonomous-intro" aria-labelledby="autonomous-title">
          <div className="naa-autonomous-intro-copy">
            <p className="naa-autonomous-eyebrow"><span className="naa-autonomous-eyebrow-dot" /> COLLEGE DISCOVERY / AP + TELANGANA</p>
            <h1 id="autonomous-title">Find an <span>autonomous college.</span></h1>
            <p className="naa-autonomous-lede">A searchable directory of colleges in Andhra Pradesh and Telangana, with recorded autonomy dates and affiliating universities in one place.</p>
            <p className="naa-autonomous-source-note">Based on the supplied UGC-derived source records. The directory does not independently confirm current autonomous status.</p>
          </div>
          <div className="naa-autonomous-intro-mark" aria-hidden="true">
            <div className="naa-autonomous-mark-orbit naa-orbit-one" />
            <div className="naa-autonomous-mark-orbit naa-orbit-two" />
            <div className="naa-autonomous-mark-building"><span /><span /><span /><span /></div>
            <div className="naa-autonomous-mark-ground" />
            <span className="naa-autonomous-mark-label">AP <i>·</i> TG</span>
          </div>
        </section>

        <section className="naa-autonomous-stats" aria-label="Directory totals">
          <div className="naa-autonomous-stat naa-stat-total">
            <span className="naa-autonomous-stat-icon"><Building2 size={19} aria-hidden="true" /></span>
            <div><span className="naa-autonomous-stat-label">Source records</span><strong>{sourceRecords.length.toLocaleString('en-IN')}</strong><small>Across both states</small></div>
          </div>
          <button type="button" className={`naa-autonomous-stat naa-stat-ap ${state === 'Andhra Pradesh' ? 'is-selected' : ''}`} onClick={() => setState(state === 'Andhra Pradesh' ? 'All states' : 'Andhra Pradesh')} aria-pressed={state === 'Andhra Pradesh'}>
            <span className="naa-autonomous-stat-state">AP</span>
            <div><span className="naa-autonomous-stat-label">Andhra Pradesh</span><strong>{apCount.toLocaleString('en-IN')}</strong><small>Filter this state <span aria-hidden="true">↗</span></small></div>
          </button>
          <button type="button" className={`naa-autonomous-stat naa-stat-tg ${state === 'Telangana' ? 'is-selected' : ''}`} onClick={() => setState(state === 'Telangana' ? 'All states' : 'Telangana')} aria-pressed={state === 'Telangana'}>
            <span className="naa-autonomous-stat-state">TG</span>
            <div><span className="naa-autonomous-stat-label">Telangana</span><strong>{tgCount.toLocaleString('en-IN')}</strong><small>Filter this state <span aria-hidden="true">↗</span></small></div>
          </button>
        </section>

        <section className="naa-autonomous-explorer" aria-labelledby="autonomous-explorer-title">
          <div className="naa-autonomous-explorer-heading">
            <div><p className="naa-autonomous-section-kicker">THE DIRECTORY</p><h2 id="autonomous-explorer-title">Explore colleges</h2><p>Search by college, university or recorded autonomy year.</p></div>
            <span className="naa-autonomous-count-pill"><Building2 size={14} aria-hidden="true" /> {filtered.length.toLocaleString('en-IN')} matches</span>
          </div>

          <div className="naa-autonomous-search-row">
            <label className="naa-autonomous-search" htmlFor="autonomous-search">
              <Search size={19} aria-hidden="true" />
              <input id="autonomous-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a college name, university or year" autoComplete="off" />
              {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}
            </label>
            <label className="naa-autonomous-sort"><span>Sort by</span><select id="autonomous-sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="name-asc">Name: A–Z</option><option value="name-desc">Name: Z–A</option><option value="year-old">Oldest autonomy year</option><option value="year-new">Newest autonomy year</option></select></label>
          </div>

          <div className="naa-autonomous-filter-row">
            <div className="naa-autonomous-state-filter" role="group" aria-label="Filter by state">
              {stateOptions.map((option) => <button key={option} type="button" className={state === option ? 'is-active' : ''} onClick={() => setState(option)} aria-pressed={state === option}>{option}</button>)}
            </div>
            <label className="naa-autonomous-filter-select"><GraduationCap size={16} aria-hidden="true" /><span className="sr-only">Affiliated university</span><select id="autonomous-university" value={university} onChange={(event) => setUniversity(event.target.value)}><option>All universities</option>{universities.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
            <label className="naa-autonomous-filter-select"><CalendarDays size={16} aria-hidden="true" /><span className="sr-only">Autonomy start year</span><select id="autonomous-year" value={year} onChange={(event) => setYear(event.target.value)}><option value="All years">All years</option>{years.map((value) => <option key={value} value={String(value)}>{value}</option>)}</select></label>
            <button type="button" className="naa-autonomous-reset" onClick={reset} disabled={!hasFilters && sort === 'name-asc'}><RotateCcw size={15} aria-hidden="true" /> Reset</button>
          </div>

          <div className="naa-autonomous-results-bar" aria-live="polite" aria-atomic="true">
            <p>{filtered.length ? <><strong>{first}–{last}</strong> of {filtered.length.toLocaleString('en-IN')} colleges</> : 'No colleges match these filters'}</p>
            <span><SlidersHorizontal size={14} aria-hidden="true" /> {hasFilters ? 'Filters applied' : 'All source records'}</span>
          </div>

          {visible.length ? <section className="naa-autonomous-results" aria-label="College results">
            {visible.map((college) => {
              const name = clean(college.college_name) || 'College name not recorded';
              const from = clean(college.autonomy_from) || 'Not recorded';
              const upto = clean(college.autonomy_valid_upto) || 'Not recorded';
              return <article key={college._key} className="naa-autonomous-college-card">
                <div className="naa-autonomous-card-topline"><span className={`naa-autonomous-state-tag ${college._state === 'Telangana' ? 'is-tg' : 'is-ap'}`}><MapPin size={12} aria-hidden="true" /> {college._state}</span>{clean(college.sr_no) && <span className="naa-autonomous-serial">SOURCE NO. {clean(college.sr_no)}</span>}</div>
                <div className="naa-autonomous-card-title-row">
                  <span className={`naa-autonomous-college-monogram ${college._state === 'Telangana' ? 'is-tg' : 'is-ap'}`} aria-hidden="true">{initials(name)}</span>
                  <div className="naa-autonomous-college-title"><h3>{name}</h3><p>{clean(college.affiliated_to) || 'Affiliating university not recorded'}</p></div>
                </div>
                <div className="naa-autonomous-card-facts">
                  <div><span><CalendarDays size={13} aria-hidden="true" /> Autonomy commenced</span><strong>{from}</strong></div>
                  <div><span><CalendarDays size={13} aria-hidden="true" /> Recorded validity</span><strong>{upto}</strong></div>
                </div>
              </article>;
            })}
          </section> : <div className="naa-autonomous-empty"><span><Search size={22} aria-hidden="true" /></span><h3>No matching colleges</h3><p>Try a shorter college name, choose another university, or clear your filters.</p><button type="button" onClick={reset}>Clear all filters</button></div>}

          {filtered.length > 0 && <nav aria-label="College result pages" className="naa-autonomous-pagination">
            <button type="button" onClick={() => { setPage((current) => Math.max(1, current - 1)); document.getElementById('autonomous-explorer-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} disabled={page <= 1}><ChevronLeft size={16} aria-hidden="true" /> Previous</button>
            <span>Page <strong>{page}</strong> of {totalPages}</span>
            <button type="button" onClick={() => { setPage((current) => Math.min(totalPages, current + 1)); document.getElementById('autonomous-explorer-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} disabled={page >= totalPages}>Next <ChevronRight size={16} aria-hidden="true" /></button>
          </nav>}
        </section>

        <aside className="naa-autonomous-source-disclaimer">
          <span className="naa-autonomous-disclaimer-icon"><Building2 size={17} aria-hidden="true" /></span>
          <div><strong>Check current status before you decide.</strong><p>Names, affiliations and validity dates reflect the supplied source records. Autonomy status can change; confirm current details with UGC and the affiliating university before relying on this directory for admission decisions.</p></div>
        </aside>
      </main>
    </div>
  );
};

export default AutonomousCollegesDirectory;
