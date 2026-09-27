import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Building2, Search, ChevronDown, X, Check, ExternalLink } from 'lucide-react';
import { ApCollegeItem } from '../../data/apEapcetCollegeManifest';

interface APCollegeSelectorProps {
  colleges: ApCollegeItem[];
  selectedCollegeCode: string;
  onSelectCollege: (code: string) => void;
  isLoading?: boolean;
}

export const APCollegeSelector: React.FC<APCollegeSelectorProps> = ({
  colleges,
  selectedCollegeCode,
  onSelectCollege,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCollege = useMemo(() => {
    if (selectedCollegeCode.toUpperCase() === 'ALL') {
      return {
        collegeCode: 'ALL',
        collegeName: 'All Colleges (Statewide)',
      } as ApCollegeItem;
    }
    return colleges.find((c) => c.collegeCode.toUpperCase() === selectedCollegeCode.toUpperCase());
  }, [colleges, selectedCollegeCode]);

  const filteredColleges = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return colleges;
    return colleges.filter(
      (c) =>
        c.collegeCode.toLowerCase().includes(term) ||
        c.collegeName.toLowerCase().includes(term)
    );
  }, [colleges, searchTerm]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-cyan-500" />
          Select Institution / కళాశాల
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {colleges.length} Colleges Available
        </span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        disabled={isLoading}
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all text-left shadow-xs hover:border-slate-400 dark:hover:border-slate-700 cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedCollege ? (
            <>
              <span className="px-1.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shrink-0">
                {selectedCollege.collegeCode}
              </span>
              <span className="truncate font-semibold text-slate-900 dark:text-white">
                {selectedCollege.collegeName}
              </span>
            </>
          ) : (
            <span className="text-slate-400">Search &amp; select a college...</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-500' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 max-h-80 flex flex-col">
          {/* Live Search Input */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type college code (AUCE, VRSE) or name..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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

          {/* College Options List */}
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs flex-1">
            <button
              type="button"
              onClick={() => {
                onSelectCollege('ALL');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                selectedCollegeCode.toUpperCase() === 'ALL'
                  ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 font-bold'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  ALL
                </span>
                <div className="truncate">
                  <span className="block truncate">All Colleges (Statewide)</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">Search across every AP EAPCET college</span>
                </div>
              </div>
              {selectedCollegeCode.toUpperCase() === 'ALL' && <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
            </button>

            {filteredColleges.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                No colleges found matching "{searchTerm}"
              </div>
            ) : (
              filteredColleges.map((c) => {
                const isSelected = c.collegeCode.toUpperCase() === selectedCollegeCode.toUpperCase();
                return (
                  <button
                    key={c.collegeCode}
                    type="button"
                    onClick={() => {
                      onSelectCollege(c.collegeCode);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 font-bold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-cyan-500/30 text-cyan-800 dark:text-cyan-200'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {c.collegeCode}
                      </span>
                      <span className="truncate">{c.collegeName}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default APCollegeSelector;
