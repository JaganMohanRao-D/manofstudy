import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

export interface FilterState {
  category: string;
  allottedCategory: string;
  gender: string;
  region: string;
  phase: string;
  minRank: string;
  maxRank: string;
}

interface APFiltersProps {
  filters: FilterState;
  onChangeFilter: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  availableCategories: string[];
  availableAllottedCategories: string[];
  availableRegions: string[];
  availablePhases: number[];
  activeFilterCount: number;
}

export const APFilters: React.FC<APFiltersProps> = ({
  filters,
  onChangeFilter,
  onResetFilters,
  availableCategories,
  availableAllottedCategories,
  availableRegions,
  availablePhases,
  activeFilterCount,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 sm:p-3.5 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-cyan-500" />
          <span>Refine Allotment Records</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {/* Candidate Category */}
        <div>
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Candidate Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChangeFilter('category', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Allotted Quota */}
        <div>
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Allotted Quota
          </label>
          <select
            value={filters.allottedCategory}
            onChange={(e) => onChangeFilter('allottedCategory', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Quotas</option>
            {availableAllottedCategories.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Gender
          </label>
          <select
            value={filters.gender}
            onChange={(e) => onChangeFilter('gender', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Genders</option>
            <option value="M">Boys (M)</option>
            <option value="F">Girls (F)</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => onChangeFilter('region', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Regions</option>
            {availableRegions.map((r) => (
              <option key={r} value={r}>
                {r} Region
              </option>
            ))}
          </select>
        </div>

        {/* Phase Filter */}
        <div>
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Counseling Phase
          </label>
          <select
            value={filters.phase}
            onChange={(e) => onChangeFilter('phase', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Phases</option>
            {availablePhases.map((p) => (
              <option key={p} value={String(p)}>
                Phase {p}
              </option>
            ))}
          </select>
        </div>

        {/* Rank Range */}
        <div>
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Rank Range
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={filters.minRank}
              onChange={(e) => onChangeFilter('minRank', e.target.value)}
              placeholder="Min"
              className="w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1.5 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              value={filters.maxRank}
              onChange={(e) => onChangeFilter('maxRank', e.target.value)}
              placeholder="Max"
              className="w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1.5 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default APFilters;
