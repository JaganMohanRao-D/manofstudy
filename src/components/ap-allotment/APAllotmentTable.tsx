import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Users,
  AlertCircle,
  GraduationCap,
  Eye,
} from 'lucide-react';
import { AllotmentRecord, AllotmentYear } from '../../services/apEapcetAllotmentService';
import APStudentInlineDetails from './APStudentInlineDetails';

interface APAllotmentTableProps {
  records: AllotmentRecord[];
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  year?: AllotmentYear;
}

export const APAllotmentTable: React.FC<APAllotmentTableProps> = ({
  records,
  collegeCode,
  collegeName,
  branchCode,
  branchName,
  year = '2026',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'rank' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedStudentKey, setExpandedStudentKey] = useState<string | null>(null);
  const pageSize = 25;

  // Filter and sort records
  const processedRecords = useMemo(() => {
    let list = records;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.cand_name.toLowerCase().includes(q) ||
          (r.rank && String(r.rank).includes(q)) ||
          r.category.toLowerCase().includes(q) ||
          r.alloted_category.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortField === 'rank') {
        const rankA = a.rank && a.rank > 0 ? a.rank : (sortOrder === 'asc' ? Infinity : -Infinity);
        const rankB = b.rank && b.rank > 0 ? b.rank : (sortOrder === 'asc' ? Infinity : -Infinity);
        return sortOrder === 'asc' ? rankA - rankB : rankB - rankA;
      } else {
        const nameA = a.cand_name.toLowerCase();
        const nameB = b.cand_name.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
    });
  }, [records, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(processedRecords.length / pageSize) || 1;

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRecords.slice(start, start + pageSize);
  }, [processedRecords, currentPage, pageSize]);

  // Rank badge color
  const getRankBadge = (rank: number) => {
    if (!rank || rank <= 0) {
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30';
    } else if (rank <= 5000) {
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40';
    } else if (rank <= 15000) {
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40';
    } else {
      return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40';
    }
  };

  // Export CSV
  const handleExportCsv = useCallback(() => {
    if (processedRecords.length === 0) return;

    const headers = [
      'Rank',
      'Candidate Name',
      'Gender',
      'Candidate Category',
      'Region',
      'Allotted Category',
      'Phase',
      'College Code',
      'College Name',
      'Branch Code',
      'Branch Name',
    ];

    const rows = processedRecords.map((r) => [
      r.rank && r.rank > 0 ? r.rank : '-',
      `"${(r.cand_name || '').replace(/"/g, '""')}"`,
      r.gender,
      r.category,
      r.region,
      `"${(r.alloted_category || '').replace(/"/g, '""')}"`,
      r.phase && r.phase > 0 ? r.phase : 'NA',
      r.college_code,
      `"${(r.college_name || '').replace(/"/g, '""')}"`,
      r.branch_code,
      `"${(r.branch_name || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `AP_EAPCET_${year}_${collegeCode}_${branchCode}_Allotments.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedRecords, collegeCode, branchCode, year]);

  return (
    <div className="space-y-3">
      {/* Top Search & Actions Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search student name, rank, or category in this branch..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Selector */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                if (sortField === 'rank') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('rank');
                  setSortOrder('asc');
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                sortField === 'rank'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Rank {sortField === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <button
              type="button"
              onClick={() => {
                if (sortField === 'name') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('name');
                  setSortOrder('asc');
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                sortField === 'name'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Name {sortField === 'name' && (sortOrder === 'asc' ? 'A-Z' : 'Z-A')}
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={processedRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-xs"
            title="Download clean CSV file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="font-medium">
          Showing {processedRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(currentPage * pageSize, processedRecords.length)} of {processedRecords.length} Allotted Students
        </span>
        <span className="font-mono text-[11px]">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Empty State */}
      {processedRecords.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No matching allotment records found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting the active category/phase filters.
          </p>
        </div>
      )}

      {/* A. DESKTOP VIEW: CLEAN SORTABLE TABLE */}
      {processedRecords.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-28">Rank</th>
                  <th className="py-3 px-4 min-w-[220px]">Candidate Name</th>
                  <th className="py-3 px-4 w-24">Gender</th>
                  <th className="py-3 px-4 w-28">Category</th>
                  <th className="py-3 px-4 w-24">Region</th>
                  <th className="py-3 px-4 min-w-[160px]">Allotted Quota</th>
                  <th className="py-3 px-4 w-24">Phase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {paginatedRecords.map((r, idx) => (
                  <React.Fragment key={`row-${r.rank}-${r.cand_name}-${idx}`}>
                  <tr
                    key={`${r.rank}-${r.cand_name}-${idx}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Rank Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${getRankBadge(r.rank)}`}>
                        {r.rank && r.rank > 0 ? `#${r.rank.toLocaleString()}` : '—'}
                      </span>
                    </td>

                    {/* Candidate Name */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setExpandedStudentKey((current) => current === `desktop-${r.rank}-${r.cand_name}-${idx}` ? null : `desktop-${r.rank}-${r.cand_name}-${idx}`)}
                        className="group text-left"
                        title="Show student allotment details"
                      >
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors block">
                          {r.cand_name}
                        </span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-3 w-3" /> View details
                        </span>
                      </button>
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${
                          r.gender === 'M'
                            ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {r.gender === 'M' ? 'Boys (M)' : r.gender === 'F' ? 'Girls (F)' : r.gender}
                      </span>
                    </td>

                    {/* Candidate Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs">
                        {r.category || 'OC'}
                      </span>
                    </td>

                    {/* Region */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-xs">
                        {r.region || 'AU'}
                      </span>
                    </td>

                    {/* Allotted Quota */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono text-xs font-semibold">
                        {r.alloted_category}
                      </span>
                    </td>

                    {/* Phase */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold text-[11px]">
                        {r.phase && r.phase > 0 ? `Phase ${r.phase}` : 'Phase: NA'}
                      </span>
                    </td>
                  </tr>
                  {expandedStudentKey === `desktop-${r.rank}-${r.cand_name}-${idx}` && (
                    <tr className="bg-cyan-500/[0.03]">
                      <td colSpan={7} className="px-4 pb-4">
                        <APStudentInlineDetails student={r} year={year} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B. MOBILE CARD VIEW */}
      {processedRecords.length > 0 && (
        <div className="block md:hidden space-y-2.5">
          {paginatedRecords.map((r, idx) => (
            <div
              key={`mob-${r.rank}-${r.cand_name}-${idx}`}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedStudentKey((current) => current === `mobile-${r.rank}-${r.cand_name}-${idx}` ? null : `mobile-${r.rank}-${r.cand_name}-${idx}`)}
                  className="text-left font-bold text-slate-900 dark:text-white text-sm hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
                >
                  {r.cand_name}
                </button>
                <span className={`px-2 py-0.5 rounded-lg font-mono font-bold text-xs shrink-0 ${getRankBadge(r.rank)}`}>
                  {r.rank && r.rank > 0 ? `#${r.rank.toLocaleString()}` : '—'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
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
                  {r.category}
                </span>

                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {r.region}
                </span>

                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium">
                  Phase {r.phase}
                </span>

                <span className="ml-auto px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono text-[10px] font-semibold">
                  {r.alloted_category}
                </span>
              </div>

              {expandedStudentKey === `mobile-${r.rank}-${r.cand_name}-${idx}` && (
                <APStudentInlineDetails student={r} year={year} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 pt-3 pb-2 px-1 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 350, behavior: 'smooth' });
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
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )} 
    </div>
  );
};
export default APAllotmentTable;
