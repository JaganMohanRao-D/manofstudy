import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Users,
  Award,
  Filter,
  X,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  Building2,
  GitBranch,
} from 'lucide-react';
import { searchAllotments, AllotmentYear, AllotmentRecord } from '../../services/apEapcetAllotmentService';
import APStudentDetailModal from './APStudentDetailModal';

interface APStudentSearchProps {
  onExploreCollegeBranch?: (collegeCode: string, branchCode?: string) => void;
  year?: AllotmentYear;
  collegeCode?: string;
  branchCode?: string;
  phase?: 'ALL'|'1'|'2'|'3';
  initialName?: string;
}

export const APStudentSearch: React.FC<APStudentSearchProps> = ({
  onExploreCollegeBranch,
  year = '2026',
  collegeCode = 'ALL',
  branchCode = 'ALL',
  phase = 'ALL',
  initialName = '',
}) => {
  // Search Mode: name, rank/range, or hall ticket
  const [searchMode, setSearchMode] = useState<'name' | 'rank' | 'hallticket'>('name');

  // Input states
  const [nameInput, setNameInput] = useState(initialName);
  const [exactRankInput, setExactRankInput] = useState('');
  const [minRankInput, setMinRankInput] = useState('');
  const [maxRankInput, setMaxRankInput] = useState('');

  // Secondary filter states
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [phaseFilter, setPhaseFilter] = useState(phase);

  // Results & Loading
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<AllotmentRecord | null>(null);
  const pageSize = 25;

  useEffect(() => {
    setPhaseFilter(phase);
    setNameInput(initialName);
    setSearchResults([]);
    setTotalMatches(0);
    setHasSearched(false);
    setCurrentPage(1);
  }, [year, collegeCode, branchCode, phase, initialName]);

  // Execute Search
  const executeSearch = useCallback(async () => {
    setIsSearching(true);
    setCurrentPage(1);

    const exactRank = exactRankInput.trim() ? parseInt(exactRankInput.replace(/[^0-9]/g, ''), 10) : null;
    const minRank = minRankInput.trim() ? parseInt(minRankInput.replace(/[^0-9]/g, ''), 10) : null;
    const maxRank = maxRankInput.trim() ? parseInt(maxRankInput.replace(/[^0-9]/g, ''), 10) : null;

    try {
      const records = await searchAllotments(year, {
        nameQuery: searchMode === 'name' ? nameInput : undefined,
        hallTicket: searchMode === 'hallticket' ? nameInput : undefined,
        exactRank: searchMode === 'rank' ? exactRank ?? undefined : undefined,
        minRank: searchMode === 'rank' ? minRank ?? undefined : undefined,
        maxRank: searchMode === 'rank' ? maxRank ?? undefined : undefined,
        collegeCode,
        branchCode,
        phase: phaseFilter !== 'ALL' ? phaseFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        gender: genderFilter !== 'ALL' ? genderFilter : undefined,
        region: regionFilter !== 'ALL' ? regionFilter : undefined,
        limit: 1000,
      });
      setSearchResults(records);
      setTotalMatches(records.length);
      setHasSearched(true);
    } catch (err) {
      console.warn('Search failed:', err);
      setSearchResults([]);
      setTotalMatches(0);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, [
    year,
    collegeCode,
    branchCode,
    phase,
    searchMode,
    nameInput,
    exactRankInput,
    minRankInput,
    maxRankInput,
    categoryFilter,
    genderFilter,
    regionFilter,
    phaseFilter,
  ]);

  // Debounced trigger for typing in name search
  useEffect(() => {
    if ((searchMode === 'name' || searchMode === 'hallticket') && nameInput.trim().length >= 2) {
      const timer = setTimeout(() => {
        executeSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nameInput, searchMode, executeSearch]);

  const totalPages = Math.ceil(searchResults.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchResults.slice(start, start + pageSize);
  }, [searchResults, currentPage, pageSize]);

  // Rank badge styling
  const getRankBadge = (rank: number) => {
    if (rank <= 5000) {
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40';
    } else if (rank <= 15000) {
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40';
    } else {
      return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar Container */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-xl space-y-4">
        {/* Search Mode Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => {
                setSearchMode('name');
                setExactRankInput('');
                setMinRankInput('');
                setMaxRankInput('');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                searchMode === 'name'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Search by Student Name
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode('rank');
                setNameInput('');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                searchMode === 'rank'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Search by Rank / Range
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode('hallticket');
                setExactRankInput('');
                setMinRankInput('');
                setMaxRankInput('');
                setNameInput('');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                searchMode === 'hallticket'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hall Ticket
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Dataset: AP EAPCET {year} allotments
          </span>
        </div>

        {/* Name Mode Inputs */}
        {searchMode === 'name' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') executeSearch();
                  }}
                  placeholder="Search candidate name (e.g. PEDDIBOYINA BHAVITHA, JAGAN, PREETHI)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
                />
                {nameInput && (
                  <button
                    type="button"
                    onClick={() => setNameInput('')}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={executeSearch}
                disabled={isSearching || !nameInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-cyan-600/20"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Search Student</span>
              </button>
            </div>
          </div>
        )}

        {/* Hall Ticket Mode */}
        {searchMode === 'hallticket' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') executeSearch(); }} placeholder="Enter hall ticket / roll number..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner" />
              </div>
              <button type="button" onClick={executeSearch} disabled={isSearching || !nameInput.trim()} className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Search Hall Ticket</span>
              </button>
            </div>
          </div>
        )}

        {/* Rank Mode Inputs */}
        {searchMode === 'rank' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Exact Rank */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Exact Rank
                </label>
                <input
                  type="number"
                  value={exactRankInput}
                  onChange={(e) => {
                    setExactRankInput(e.target.value);
                    setMinRankInput('');
                    setMaxRankInput('');
                  }}
                  placeholder="e.g. 3821"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              {/* Range: From Rank */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  From Rank (Range)
                </label>
                <input
                  type="number"
                  value={minRankInput}
                  onChange={(e) => {
                    setMinRankInput(e.target.value);
                    setExactRankInput('');
                  }}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              {/* Range: To Rank */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  To Rank (Range)
                </label>
                <input
                  type="number"
                  value={maxRankInput}
                  onChange={(e) => {
                    setMaxRankInput(e.target.value);
                    setExactRankInput('');
                  }}
                  placeholder="e.g. 10000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={executeSearch}
                disabled={isSearching || (!exactRankInput.trim() && !minRankInput.trim() && !maxRankInput.trim())}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-cyan-600/20"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Find Rank Allotments</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Refinement Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Candidate Categories</option>
            <option value="OC">OC</option>
            <option value="BC_A">BC_A</option>
            <option value="BC_B">BC_B</option>
            <option value="BC_C">BC_C</option>
            <option value="BC_D">BC_D</option>
            <option value="BC_E">BC_E</option>
            <option value="SC">SC (SC_I, II, III)</option>
            <option value="ST">ST</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Genders</option>
            <option value="M">Boys (M)</option>
            <option value="F">Girls (F)</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Regions</option>
            <option value="AU">AU Region</option>
            <option value="SVU">SVU Region</option>
            <option value="NL">Non-Local (NL)</option>
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Phases</option>
            <option value="1">Phase 1</option>
            <option value="2">Phase 2</option>{year === '2026' && <option value="3">Phase 3</option>}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Querying AP EAPCET ${year} allotment records across AP colleges...
          </p>
        </div>
      )}

      {/* Results Header */}
      {!isSearching && hasSearched && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-medium text-slate-900 dark:text-white">
            Found <strong className="text-cyan-600 dark:text-cyan-400">{totalMatches.toLocaleString()}</strong> matching allotment records
          </span>
          {searchResults.length > 0 && (
            <span className="font-mono text-[11px]">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isSearching && hasSearched && searchResults.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No matching allotment records found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please verify the candidate name spelling or widen the rank range.
          </p>
        </div>
      )}

      {/* Results List: Clean Student Result Cards */}
      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedRecords.map((r, idx) => (
              <div
                key={`res-${r.college_code}-${r.branch_code}-${r.rank}-${idx}`}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 space-y-2.5 shadow-sm transition-all"
              >
                {/* Header: Name & Rank */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <button type="button" onClick={() => setSelectedStudent(r)} className="block max-w-full truncate text-left font-bold text-slate-900 dark:text-white text-sm hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors" title="View complete student allotment details">
                      {r.cand_name}
                    </button>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                      Allotted Candidate
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs shrink-0 ${getRankBadge(r.rank)}`}>
                    #{r.rank.toLocaleString()}
                  </span>
                </div>

                {/* College & Branch Meta */}
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300 mr-1.5">
                        [{r.college_code}]
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate inline-block max-w-[180px]" title={r.college_name}>
                        {r.college_name}
                      </span>
                    </div>

                    {onExploreCollegeBranch && (
                      <button
                        type="button"
                        onClick={() => onExploreCollegeBranch(r.college_code, r.branch_code)}
                        className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                        title="Open this college & branch explorer"
                      >
                        <span>Explore</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <GitBranch className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                      {r.branch_code}
                    </span>
                    <span>-</span>
                    <span className="truncate">{r.branch_name}</span>
                  </div>
                </div>

                {/* Details Strip: Gender, Candidate Category, Region, Quota, Phase */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span
                    className={`px-1.5 py-0.5 rounded font-medium ${
                      r.gender === 'M'
                        ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {r.gender === 'M' ? 'Boys (M)' : r.gender === 'F' ? 'Girls (F)' : r.gender}
                  </span>

                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    Cat: {r.category}
                  </span>

                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {r.region}
                  </span>

                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium">
                    Phase {r.phase}
                  </span>

                  <span className="ml-auto px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono text-[10px] font-semibold truncate max-w-[130px]">
                    {r.alloted_category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-3 pb-2 px-1 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 250, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 250, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
      <APStudentDetailModal
        student={selectedStudent}
        year={year}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};
export default APStudentSearch;
