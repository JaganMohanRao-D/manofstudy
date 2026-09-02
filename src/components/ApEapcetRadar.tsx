import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Share2,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  TrendingUp,
  Landmark,
  IndianRupee,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { VacancyCollege } from '../types';
import rawVacanciesFallback from '../eapcet_vacancies.json';

const PUBLIC_DATA_URL = '/eapcet_vacancies.json';
const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/JaganMohanRao-D/studymacha/main/src/eapcet_vacancies.json';
const COLLEGES_PER_PAGE = 10;

// Helper to sanitize and map raw JSON records into strongly-typed VacancyCollege models
function mapRawCollegeData(rawData: any[]): VacancyCollege[] {
  if (!Array.isArray(rawData)) return [];
  return rawData.map((item: any) => ({
    inst_code: String(item.inst_code || '').trim(),
    inst_name: String(item.inst_name || '').trim(),
    district: String(item.district || '').trim(),
    place: String(item.place || '').trim(),
    region: item.region ? String(item.region).trim() : undefined,
    affiliated_to: String(
      item.affiliated_to || item.college_type || 'State Autonomous'
    ).trim(),
    branches: Array.isArray(item.branches)
      ? item.branches.map((b: any) => ({
          branch_code: String(b.branch_code || '').trim(),
          branch_name: String(b.branch_name || b.branch_code || '').trim(),
          total_seats: Number(b.total_seats) || 0,
          left_over_seats: Number(b.left_over_seats) || 0,
          fee: Number(b.fee) || 0,
        }))
      : [],
  }));
}

export const ApEapcetRadar: React.FC = () => {
  // Initialize with fallback data or empty until fetched from public root
  const [colleges, setColleges] = useState<VacancyCollege[]>(() =>
    mapRawCollegeData(rawVacanciesFallback as any[])
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [hideZeroVacancy, setHideZeroVacancy] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load vacancy dataset from public root /eapcet_vacancies.json
  const loadVacancyData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Primary: Fetch from public assets root
      const response = await fetch(PUBLIC_DATA_URL);
      if (response.ok) {
        const rawData = await response.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          setColleges(mapRawCollegeData(rawData));
          setIsLoading(false);
          return;
        }
      }
      throw new Error(`HTTP ${response.status}: Failed to load from ${PUBLIC_DATA_URL}`);
    } catch (publicErr) {
      console.warn('Public asset fetch failed, attempting CDN & bundled fallback...', publicErr);
      
      // Secondary: Try GitHub Raw CDN
      try {
        const cdnRes = await fetch(GITHUB_RAW_URL);
        if (cdnRes.ok) {
          const cdnData = await cdnRes.json();
          if (Array.isArray(cdnData) && cdnData.length > 0) {
            setColleges(mapRawCollegeData(cdnData));
            setIsLoading(false);
            return;
          }
        }
      } catch (cdnErr) {
        console.warn('CDN fetch failed, using local module fallback:', cdnErr);
      }

      // Tertiary: Fallback to bundled module
      if (Array.isArray(rawVacanciesFallback) && rawVacanciesFallback.length > 0) {
        setColleges(mapRawCollegeData(rawVacanciesFallback as any[]));
        setIsLoading(false);
      } else {
        setError('Unable to load AP EAPCET vacancy dataset. Please verify internet connection.');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadVacancyData();
  }, []);

  // Dynamic dropdown extractions and global aggregates
  const { districts, branchCodes, totalSystemVacancies, totalSystemIntake } = useMemo(() => {
    const districtSet = new Set<string>();
    const branchSet = new Set<string>();
    let totalVac = 0;
    let totalInt = 0;

    colleges.forEach((col) => {
      if (col.district) districtSet.add(col.district.trim().toUpperCase());
      col.branches.forEach((b) => {
        if (b.branch_code) branchSet.add(b.branch_code.trim().toUpperCase());
        totalVac += b.left_over_seats || 0;
        totalInt += b.total_seats || 0;
      });
    });

    return {
      districts: Array.from(districtSet).sort(),
      branchCodes: Array.from(branchSet).sort(),
      totalSystemVacancies: totalVac,
      totalSystemIntake: totalInt,
    };
  }, [colleges]);

  // Memoized multi-field filtering
  const filteredColleges = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return colleges
      .map((college) => {
        // College-level search match (name, code, place, district, or affiliated university)
        const matchesQuery =
          !q ||
          college.inst_code.toLowerCase().includes(q) ||
          college.inst_name.toLowerCase().includes(q) ||
          college.place.toLowerCase().includes(q) ||
          college.district.toLowerCase().includes(q) ||
          college.affiliated_to.toLowerCase().includes(q) ||
          college.branches.some(
            (b) =>
              b.branch_code.toLowerCase().includes(q) ||
              b.branch_name.toLowerCase().includes(q)
          );

        const matchesDistrict =
          selectedDistrict === 'all' ||
          college.district.toUpperCase() === selectedDistrict.toUpperCase();

        if (!matchesQuery || !matchesDistrict) {
          return null;
        }

        // Branch-level filter
        const matchedBranches = college.branches.filter((b) => {
          const matchesBranchCode =
            selectedBranch === 'all' ||
            b.branch_code.toUpperCase() === selectedBranch.toUpperCase();

          const matchesZeroFilter = !hideZeroVacancy || b.left_over_seats > 0;

          return matchesBranchCode && matchesZeroFilter;
        });

        if (matchedBranches.length === 0) {
          return null;
        }

        // Calculate college filtered sums
        const totalMatchingSeats = matchedBranches.reduce(
          (acc, b) => acc + (b.total_seats || 0),
          0
        );
        const totalMatchingVacant = matchedBranches.reduce(
          (acc, b) => acc + (b.left_over_seats || 0),
          0
        );

        return {
          ...college,
          branches: matchedBranches,
          totalMatchingSeats,
          totalMatchingVacant,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [colleges, searchQuery, selectedDistrict, selectedBranch, hideZeroVacancy]);

  // Summary counts for currently filtered results
  const { filteredTotalColleges, filteredTotalVacancies } = useMemo(() => {
    let totalVac = 0;
    filteredColleges.forEach((c) => {
      totalVac += c.totalMatchingVacant;
    });
    return {
      filteredTotalColleges: filteredColleges.length,
      filteredTotalVacancies: totalVac,
    };
  }, [filteredColleges]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredColleges.length / COLLEGES_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedColleges = useMemo(() => {
    const startIndex = (effectivePage - 1) * COLLEGES_PER_PAGE;
    return filteredColleges.slice(startIndex, startIndex + COLLEGES_PER_PAGE);
  }, [filteredColleges, effectivePage]);

  // Copy college code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Pre-formatted WhatsApp share message
  const handleShareToWhatsApp = (college: (typeof filteredColleges)[0]) => {
    const availableBranches = college.branches
      .map(
        (b) =>
          `• *${b.branch_code}* (${b.branch_name}): ${b.left_over_seats}/${b.total_seats} vacant (₹${b.fee.toLocaleString('en-IN')}/yr)`
      )
      .join('\n');

    const message = `🎓 *AP EAPCET Phase 2 Vacancy Alert*\n\n🏫 *${college.inst_name}* (Code: *${college.inst_code}*)\n📍 ${college.place}, ${college.district} (${college.affiliated_to})\n\n📊 *Branch Vacancies & Intake:*\n${availableBranches}\n\n🔍 Check live AP EAPCET college matrix on StudyMacha:\n${window.location.href}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('all');
    setSelectedBranch('all');
    setHideZeroVacancy(false);
    setCurrentPage(1);
  };

  return (
    <div id="eapcet-radar-container" className="space-y-6">
      {/* Tool Header & Live Stat Summary */}
      <div
        id="eapcet-banner"
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                Live AP EAPCET Phase 2 Matrix
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Official Institutional Fee & Intake Data
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              AP EAPCET College Vacancy Radar
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time engineering seat scanner for Andhra Pradesh university campuses, autonomous colleges, and private institutions. Filter leftover seats across CSE, CSM, CSD, ECE, and more to plan your Phase 2 web options.
            </p>
          </div>

          {/* Aggregate Stat Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center">
              <span className="text-xs font-medium text-slate-500 block">Colleges Loaded</span>
              <span className="text-xl font-bold text-slate-900">
                {isLoading ? '...' : colleges.length}
              </span>
              <span className="text-[10px] text-slate-400 block">AP Institutes</span>
            </div>
            <div className="bg-sky-50/70 border border-sky-200/70 rounded-lg p-3 text-center">
              <span className="text-xs font-medium text-sky-700 block">Total Vacancies</span>
              <span className="text-xl font-bold text-sky-900">
                {isLoading ? '...' : totalSystemVacancies.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-sky-600 block">Leftover Seats</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-emerald-50/70 border border-emerald-200/70 rounded-lg p-3 text-center">
              <span className="text-xs font-medium text-emerald-700 block">Total Capacity</span>
              <span className="text-xl font-bold text-emerald-900">
                {isLoading ? '...' : totalSystemIntake.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 block">Sanctioned Intake</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State Banner */}
      {isLoading && (
        <div
          id="eapcet-loading-indicator"
          className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm space-y-4"
        >
          <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto animate-spin">
            <Loader2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Loading Live AP EAPCET Vacancy Radar...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Fetching engineering branch leftover seats, sanctioned intake, and annual tuition fees...
            </p>
          </div>
        </div>
      )}

      {/* Error / Offline Alert */}
      {!isLoading && error && (
        <div
          id="eapcet-error-indicator"
          className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center shadow-sm space-y-3"
        >
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-rose-900">Failed to load real-time vacancies</h4>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={loadVacancyData}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Vacancy Data
          </button>
        </div>
      )}

      {/* Sticky Top Filter Control Bar (rendered when data exists) */}
      {!isLoading && !error && (
        <div
          id="sticky-filter-bar"
          className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-md transition-all space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input Bar */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="college-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Code (e.g. VRSE, VITAPU) or Name..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>

            {/* District Dropdown Selector */}
            <div className="lg:col-span-3">
              <select
                id="district-filter-select"
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all cursor-pointer font-medium"
              >
                <option value="all">📍 All Districts ({districts.length})</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Code Dropdown Selector */}
            <div className="lg:col-span-3">
              <select
                id="branch-filter-select"
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all cursor-pointer font-medium"
              >
                <option value="all">⚡ All Branches ({branchCodes.length})</option>
                {branchCodes.map((b) => (
                  <option key={b} value={b}>
                    Branch: {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Hide 0 Vacancy Branches Checkbox & Reset */}
            <div className="lg:col-span-2 flex items-center justify-between sm:justify-end gap-3">
              <label
                id="hide-zero-checkbox-label"
                className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-2 rounded-lg transition-colors"
              >
                <input
                  id="hide-zero-vacancy-checkbox"
                  type="checkbox"
                  checked={hideZeroVacancy}
                  onChange={(e) => {
                    setHideZeroVacancy(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="whitespace-nowrap">Hide 0 Left</span>
              </label>

              {(searchQuery || selectedDistrict !== 'all' || selectedBranch !== 'all' || hideZeroVacancy) && (
                <button
                  id="reset-filter-btn"
                  onClick={handleResetFilters}
                  className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Filter Status Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-slate-900 font-semibold">{filteredTotalColleges}</strong> colleges
              </span>
              <span>•</span>
              <span>
                <strong className="text-sky-700 font-semibold">{filteredTotalVacancies.toLocaleString('en-IN')}</strong> vacant seats matched
              </span>
            </div>

            {totalPages > 1 && (
              <div className="text-slate-500">
                Page {effectivePage} of {totalPages}
              </div>
            )}
          </div>
        </div>
      )}

      {/* College Results Viewport */}
      {!isLoading && !error && paginatedColleges.length === 0 && (
        <div
          id="no-eapcet-results-card"
          className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">No colleges matched your filters</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Try clearing the branch or district filter, or searching for another keyword or college code.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All Active Filters
          </button>
        </div>
      )}

      {!isLoading && !error && paginatedColleges.length > 0 && (
        <div id="colleges-list" className="space-y-4">
          {paginatedColleges.map((college) => {
            const hasAvailableSeats = college.totalMatchingVacant > 0;

            return (
              <div
                key={college.inst_code}
                id={`college-card-${college.inst_code}`}
                className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all space-y-5"
              >
                {/* College Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* inst_code Pill */}
                      <div className="inline-flex items-center gap-1.5 bg-sky-500 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-sm">
                        <span>{college.inst_code}</span>
                        <button
                          onClick={() => handleCopyCode(college.inst_code)}
                          title="Copy College Code"
                          className="hover:text-sky-100 focus:outline-none"
                        >
                          {copiedCode === college.inst_code ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Region Badge */}
                      {college.region && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {college.region} Region
                        </span>
                      )}

                      {/* Affiliation */}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-slate-400" />
                        {college.affiliated_to}
                      </span>
                    </div>

                    {/* inst_name */}
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {college.inst_name}
                    </h2>

                    {/* Place and District */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {college.place}, <strong className="text-slate-700">{college.district}</strong> District
                      </span>
                    </div>
                  </div>

                  {/* Summary Badges & WhatsApp Share */}
                  <div className="flex items-center gap-2.5 flex-wrap md:flex-nowrap">
                    {/* Total Seats & Total Vacant Pill */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-right">
                      <div className="text-[11px] font-medium text-slate-500">Matching Vacancy</div>
                      <div className="text-sm font-bold text-slate-900">
                        <span className={hasAvailableSeats ? 'text-emerald-600' : 'text-rose-600'}>
                          {college.totalMatchingVacant}
                        </span>
                        <span className="text-slate-400 font-normal"> / {college.totalMatchingSeats} seats</span>
                      </div>
                    </div>

                    {/* Share to WhatsApp Button */}
                    <button
                      id={`share-whatsapp-${college.inst_code}`}
                      onClick={() => handleShareToWhatsApp(college)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                      title="Share vacancy details to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Share to WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Courses & Vacancies Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th scope="col" className="px-3.5 py-2.5 w-24">
                          Code
                        </th>
                        <th scope="col" className="px-3.5 py-2.5">
                          Course Specialization
                        </th>
                        <th scope="col" className="px-3.5 py-2.5 text-center w-36">
                          Intake vs Available
                        </th>
                        <th scope="col" className="px-3.5 py-2.5 text-right w-32">
                          Annual Tuition
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {college.branches.map((b) => {
                        const isVacant = b.left_over_seats > 0;

                        return (
                          <tr
                            key={b.branch_code}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            {/* Branch Code Badge */}
                            <td className="px-3.5 py-2.5 font-mono font-bold text-xs text-slate-900">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                                {b.branch_code}
                              </span>
                            </td>

                            {/* Full Branch Name */}
                            <td className="px-3.5 py-2.5 font-medium text-slate-800">
                              {b.branch_name}
                            </td>

                            {/* Intake vs Available */}
                            <td className="px-3.5 py-2.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isVacant
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {isVacant ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-rose-500" />
                                )}
                                <span>
                                  {b.left_over_seats} / {b.total_seats} Left
                                </span>
                              </span>
                            </td>

                            {/* Annual Tuition Fee formatted as ₹X,XX,XXX */}
                            <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-700">
                              ₹{b.fee.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <div
          id="eapcet-pagination-bar"
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="text-xs text-slate-500">
            Showing Page <strong className="text-slate-900 font-semibold">{effectivePage}</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{totalPages}</strong> ({filteredTotalColleges} total colleges)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="prev-page-btn"
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={effectivePage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none border border-slate-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (effectivePage <= 3) {
                  pageNum = i + 1;
                } else if (effectivePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = effectivePage - 2 + i;
                }

                const isActive = pageNum === effectivePage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              id="next-page-btn"
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={effectivePage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none border border-slate-200 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Advisory & Help Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          AP EAPCET Phase 2 Web Option Advisory
        </p>
        <p className="leading-relaxed">
          Seat counts indicate leftover vacancies post Phase-1 physical reporting. Annual tuition fees are as notified by the AP Higher Education Regulatory and Monitoring Commission (APHERMC). Ensure you prioritize your choices based on branch preference and fee structure before submitting final web options.
        </p>
      </div>
    </div>
  );
};
