import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

/**
 * Reusable searchable branch picker.
 * Options are supplied from the real 2026 allotment dataset by the build-time
 * branch catalog generator; this component never invents branch codes.
 */
export default function SearchableBranchSelect({
  options = [],
  value = 'ALL',
  onChange,
  className = '',
  placeholder = 'Search branch name or code...',
  emptyLabel = 'No matching branches found',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const selected = useMemo(
    () => options.find((option) => option.code === value) || options.find((option) => option.code === 'ALL') || options[0],
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      String(option.code || '').toLowerCase().includes(q) ||
      String(option.name || '').toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const choose = (next) => {
    onChange?.(next.code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="w-full min-h-[42px] flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-white outline-none transition-colors hover:border-cyan-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 rounded-md bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-black text-cyan-700 dark:text-cyan-300">
            {selected?.code || 'ALL'}
          </span>
          <span className="truncate">{selected?.name || 'All Branches'}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[80] mt-2 overflow-hidden rounded-2xl border border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-200 dark:border-slate-800 p-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setOpen(false);
                    setQuery('');
                  }
                }}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-9 text-xs font-medium text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear branch search"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div role="listbox" className="max-h-72 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <div className="px-3 py-7 text-center text-xs text-slate-500 dark:text-slate-400">{emptyLabel}</div>
            ) : (
              filtered.map((option) => {
                const active = option.code === value;
                return (
                  <button
                    key={option.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(option)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {option.code}
                      </span>
                      <span className="truncate text-xs font-semibold">{option.name}</span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-cyan-500" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {filtered.length.toLocaleString()} of {options.length.toLocaleString()} branches
          </div>
        </div>
      )}
    </div>
  );
}
