import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Search, X } from 'lucide-react';
import { searchAllotments, AllotmentYear, AllotmentRecord, PhaseFilter } from '../../services/apEapcetAllotmentService';
import APStudentDetailModal from './APStudentDetailModal';

interface APGlobalStudentSearchProps {
  year: AllotmentYear;
  phase: PhaseFilter;
}

const normalizeRank = (value: string) => value.replace(/[^0-9]/g, '').trim();

const getSearchMode = (value: string): 'name' | 'rank' => {
  const rank = normalizeRank(value);
  return Boolean(rank) && rank === value.trim() ? 'rank' : 'name';
};

export const APGlobalStudentSearch: React.FC<APGlobalStudentSearchProps> = ({ year, phase }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AllotmentRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<AllotmentRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuery('');
    setResults([]);
    setSelectedStudent(null);
    setHasSearched(false);
    setError('');
  }, [year, phase]);

  const executeSearch = async () => {
    const value = query.trim();
    if (!value) return;

    setIsSearching(true);
    setHasSearched(false);
    setError('');
    setSelectedStudent(null);

    try {
      const mode = getSearchMode(value);
      const rank = normalizeRank(value);
      const records = await searchAllotments(year, {
        nameQuery: mode === 'name' ? value : undefined,
        exactRank: mode === 'rank' ? Number(rank) : undefined,
        // Intentionally search the complete selected-year AP dataset.
        // The college and branch selectors above must not restrict this tool.
        collegeCode: 'ALL',
        branchCode: 'ALL',
        phase,
        limit: 1000,
      });
      setResults(records);
      setHasSearched(true);
    } catch (searchError) {
      console.warn('AP global student search failed:', searchError);
      setResults([]);
      setHasSearched(true);
      setError('Student search could not be completed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedStudent(null);
    setHasSearched(false);
    setError('');
  };

  return (
    <>
      <section className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 p-3 sm:p-4 shadow-lg shadow-cyan-950/10 backdrop-blur-xl">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-800 dark:text-slate-200">Search Student Name or Rank</p>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Search across all AP EAPCET colleges in the selected year.</p>
          </div>

          <div className="relative w-full sm:w-[min(100%,34rem)]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') void executeSearch(); }}
              placeholder="Enter student name or rank..."
              aria-label="Search student name or rank"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-24 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            {query && (
              <button type="button" onClick={clearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => void executeSearch()}
              disabled={!query.trim() || isSearching}
              className="absolute right-1 top-1 bottom-1 rounded-lg bg-cyan-600 px-3 text-xs font-black text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {isSearching && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            <span>Searching all AP colleges...</span>
          </div>
        )}

        {!isSearching && error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isSearching && hasSearched && !error && (
          <div className="mt-3">
            <div className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {results.length.toLocaleString()} matching allotment record{results.length === 1 ? '' : 's'} · Click a student name for full details
            </div>

            {results.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No student allotment found for this name or rank.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {results.slice(0, 12).map((record, index) => (
                  <article key={`${record.college_code}-${record.branch_code}-${record.rank}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(record)}
                          className="block max-w-full truncate text-left text-sm font-bold text-slate-900 underline-offset-2 hover:text-cyan-600 hover:underline dark:text-white dark:hover:text-cyan-300"
                          title="View full student details"
                        >
                          {record.cand_name || 'Student'}
                        </button>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{record.college_name || record.college_code}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-cyan-500/10 px-2 py-1 font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-300">#{record.rank.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <p className="truncate"><span className="font-semibold text-slate-700 dark:text-slate-300">Hall Ticket:</span> <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{record.hallTicket || '—'}</span></p>
                      <p className="truncate"><span className="font-semibold text-slate-700 dark:text-slate-300">Branch:</span> {record.branch_name || record.branch_code}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white px-1.5 py-1 dark:bg-slate-900">{record.category || '—'}</span>
                        <span className="rounded-md bg-white px-1.5 py-1 dark:bg-slate-900">{record.gender || '—'}</span>
                        <span className="rounded-md bg-white px-1.5 py-1 dark:bg-slate-900">{record.region || '—'}</span>
                        <span className="rounded-md bg-white px-1.5 py-1 dark:bg-slate-900">Phase {record.phase || '—'}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <APStudentDetailModal
        student={selectedStudent}
        year={year}
        onClose={() => setSelectedStudent(null)}
      />
    </>
  );
};

export default APGlobalStudentSearch;
