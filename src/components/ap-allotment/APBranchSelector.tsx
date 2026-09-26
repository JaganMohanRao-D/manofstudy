import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GitBranch, ChevronDown, Check, Search, X } from 'lucide-react';

export interface BranchOption {
  branchCode: string;
  branchName: string;
  recordCount: number;
}

interface APBranchSelectorProps {
  branches: BranchOption[];
  selectedBranchCode: string;
  onSelectBranch: (branchCode: string) => void;
  totalCollegeRecords: number;
}

export const APBranchSelector: React.FC<APBranchSelectorProps> = ({
  branches,
  selectedBranchCode,
  onSelectBranch,
  totalCollegeRecords,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBranch = useMemo(() => {
    if (selectedBranchCode === 'ALL') {
      return {
        branchCode: 'ALL',
        branchName: 'All Branches (College-wide)',
        recordCount: totalCollegeRecords,
      };
    }
    return branches.find((b) => b.branchCode === selectedBranchCode);
  }, [branches, selectedBranchCode, totalCollegeRecords]);

  const filteredBranches = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return branches;
    return branches.filter(
      (b) =>
        b.branchCode.toLowerCase().includes(term) ||
        b.branchName.toLowerCase().includes(term)
    );
  }, [branches, searchTerm]);

  return (
    <div className="space-y-2">
      <div className="relative" ref={dropdownRef}>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
            Select Branch / ఇంజనీరింగ్ బ్రాంచ్
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {branches.length} Branches in this College
          </span>
        </label>

        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setSearchTerm('');
          }}
          className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-left shadow-xs hover:border-slate-400 dark:hover:border-slate-700 cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="px-1.5 py-0.5 rounded font-mono text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shrink-0">
              {selectedBranch?.branchCode || 'ALL'}
            </span>
            <span className="truncate font-semibold text-slate-900 dark:text-white">
              {selectedBranch?.branchName || 'All Branches'}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-500' : ''
            }`}
          />
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 max-h-72 flex flex-col">
            {/* Search within branches if more than 5 */}
            {branches.length > 5 && (
              <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search branch code or name..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs flex-1">
              {/* Option 1: ALL Branches */}
              <button
                type="button"
                onClick={() => {
                  onSelectBranch('ALL');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  selectedBranchCode === 'ALL'
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    ALL
                  </span>
                  <span className="font-bold">All Branches in College</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalCollegeRecords} seats
                </span>
              </button>

              {filteredBranches.map((b) => {
                const isSelected = b.branchCode === selectedBranchCode;
                return (
                  <button
                    key={b.branchCode}
                    type="button"
                    onClick={() => {
                      onSelectBranch(b.branchCode);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-indigo-500/30 text-indigo-800 dark:text-indigo-200'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {b.branchCode}
                      </span>
                      <span className="truncate">{b.branchName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                      <span>{b.recordCount} seats</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Branch Chips */}
      {branches.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectBranch('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedBranchCode === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Branches ({totalCollegeRecords})
          </button>
          {branches.map((b) => (
            <button
              key={b.branchCode}
              type="button"
              onClick={() => onSelectBranch(b.branchCode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedBranchCode === b.branchCode
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={b.branchName}
            >
              {b.branchCode} ({b.recordCount})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default APBranchSelector;
