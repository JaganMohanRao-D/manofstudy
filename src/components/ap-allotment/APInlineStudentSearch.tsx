import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Search, X } from 'lucide-react';
import { searchAllotments, AllotmentYear, AllotmentRecord } from '../../services/apEapcetAllotmentService';

interface APInlineStudentSearchProps {
  year: AllotmentYear;
  collegeCode: string;
  branchCode: string;
  phase: 'ALL' | '1' | '2' | '3';
}

const normalizeRankInput = (value: string) => value.replace(/[^0-9]/g, '').trim();

export default function APInlineStudentSearch({ year, collegeCode, branchCode, phase }: APInlineStudentSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AllotmentRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError('');
  }, [year, collegeCode, branchCode, phase]);

  const runSearch = async () => {
    const value = query.trim();
    if (!value) return;

    setIsSearching(true);
    setHasSearched(false);
    setError('');

    try {
      const rankText = normalizeRankInput(value);
      const looksLikeRank = rankText.length > 0 && rankText === value;
      const records = await searchAllotments(year, {
        nameQuery: looksLikeRank ? undefined : value,
        exactRank: looksLikeRank ? Number(rankText) : undefined,
        collegeCode,
        branchCode,
        phase,
        limit: 100,
      });
      setResults(records);
      setHasSearched(true);
    } catch (searchError) {
      console.warn('AP inline student search failed:', searchError);
      setResults([]);
      setHasSearched(true);
      setError('Student search could not be completed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="rounded-[1.5rem] border border-cyan-400/20 bg-white/95 dark:bg-slate-900/85 p-3 sm:p-4 shadow-lg shadow-cyan-950/10 backdrop-blur-xl">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-500" />
            <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Search student</p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Search by student name or exact rank within the selected college and branch.</p>
        </div>
        <div className="relative w-full sm:w-[min(100%,32rem)]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') runSearch(); }}
            placeholder="Search student name or rank..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-20 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); setHasSearched(false); setError(''); }} className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Clear student search">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={runSearch}
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
          <span>Hold on student, it's loading...</span>
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
            {results.length.toLocaleString()} matching allotment record{results.length === 1 ? '' : 's'}
          </div>
          {results.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              No student found for this name/rank with the current college, branch and phase filters.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {results.slice(0, 12).map((record, index) => (
                <div key={`${record.college_code}-${record.branch_code}-${record.rank}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{record.cand_name || 'Student'}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{record.college_code} · {record.branch_code}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-cyan-500/10 px-2 py-1 font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-300">#{record.rank.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="rounded-md bg-white px-1.5 py-1 dark:bg-slate-900">{record.category || '—'}</span>
                    <span className="rounded-md bg-white px-1.5 py-1 dark:bg-slate-900">{record.gender || '—'}</span>
                    <span className="rounded-md bg-white px-1.5 py-1 dark:bg-slate-900">Phase {record.phase || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
