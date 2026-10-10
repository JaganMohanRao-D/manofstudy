import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Share2,
  Building2,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { VacancyCollege } from '../types';
import rawVacanciesFallback from '../eapcet_vacancies.json';

const PUBLIC_DATA_URL = '/eapcet_vacancies.json';
const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/JaganMohanRao-D/studymacha/main/src/eapcet_vacancies.json';
const COLLEGES_PER_PAGE = 10;

export type EapcetPhaseTab = 'phase2';

interface ApEapcetRadarProps {
  initialTab?: string;
  onNavigateToCbt?: () => void;
}

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

export const ApEapcetRadar: React.FC<ApEapcetRadarProps> = ({ onNavigateToCbt }) => {
  const [colleges, setColleges] = useState<VacancyCollege[]>(() =>
    mapRawCollegeData(rawVacanciesFallback as any[])
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters for Phase 2 vacancy views
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hideZeroVacancy, setHideZeroVacancy] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load vacancy dataset from public root /eapcet_vacancies.json
  const loadVacancyData = async () => {
    setIsLoading(true);
    setError(null);

    try {
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
      console.warn('Public asset fetch failed, trying fallback CDN & bundled...', publicErr);
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
        console.warn('CDN fetch fallback:', cdnErr);
      }

      if (Array.isArray(rawVacanciesFallback) && rawVacanciesFallback.length > 0) {
        setColleges(mapRawCollegeData(rawVacanciesFallback as any[]));
        setIsLoading(false);
      } else {
        setError('Unable to load AP EAPCET vacancy dataset. Please verify network connection.');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadVacancyData();
  }, []);

  // Districts and Branch Codes
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

  // Filtered colleges list based strictly on Phase 2 leftovers
  const filteredColleges = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return colleges
      .map((college) => {
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

        // Branch-level filter based on exact left_over_seats from /eapcet_vacancies.json
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

  // Aggregate counts
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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredColleges.length / COLLEGES_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedColleges = useMemo(() => {
    const startIndex = (effectivePage - 1) * COLLEGES_PER_PAGE;
    return filteredColleges.slice(startIndex, startIndex + COLLEGES_PER_PAGE);
  }, [filteredColleges, effectivePage]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareCollegeWhatsApp = (college: (typeof filteredColleges)[0]) => {
    const branchesText = college.branches
      .map(
        (b) =>
          `• *${b.branch_code}* (${b.branch_name}): ${b.left_over_seats}/${b.total_seats} vacant (₹${b.fee.toLocaleString('en-IN')}/yr)`
      )
      .join('\n');

    const message = `🎓 *AP EAPCET Phase 2 Leftover Seat Vacancies*\n\n🏫 *${college.inst_name}* (Code: *${college.inst_code}*)\n📍 ${college.place}, ${college.district} (${college.affiliated_to})\n\n📊 *Branch Vacancies:*\n${branchesText}\n\n🔍 Check live AP EAPCET Phase 2 college vacancies on Naa College:\n${window.location.origin}/#eapcet-radar`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('all');
    setSelectedBranch('all');
    setSelectedCategory('all');
    setHideZeroVacancy(false);
    setCurrentPage(1);
  };

  return (
    <div id="eapcet-radar-container" className="space-y-4">
      {/* 1. Dedicated Header Banner for Phase 2 Left Over Seats */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                AP EAPCET Phase 2 Left Over Seats Radar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Phase 2 Vacancies
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              Live college seat vacancies and leftover branch seats across Andhra Pradesh institutions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-start md:self-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs">
          <div className="min-w-[72px]">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">TOTAL VACANT</div>
            <div className="text-sm sm:text-base font-extrabold text-blue-600 font-mono">{filteredTotalVacancies.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div className="min-w-[64px]">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">COLLEGES</div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">{filteredTotalColleges}</div>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div className="min-w-[78px]">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">TOTAL INTAKE</div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-700 font-mono">{totalSystemIntake.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* 2. Loading State */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto animate-spin">
            <Loader2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Loading AP EAPCET Vacancy Radar...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Extracting branch matrices, leftover seats, and official tuition fee schedules...
            </p>
          </div>
        </div>
      )}

      {/* 3. Error Alert */}
      {!isLoading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-rose-900">Failed to load real-time vacancies</h4>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={loadVacancyData}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Vacancy Data
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PHASE 2 VACANCY RADAR VIEW */}
      {/* ======================================================== */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {/* CBT Mock Test Promotion Banner */}
          {onNavigateToCbt && (
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
                  NEW: Exam Simulator
                </div>
                <h3 className="text-sm sm:text-base font-bold">
                  EAPCET Computer-Based Test (CBT) Mock Examination
                </h3>
                <p className="text-xs text-blue-100 max-w-xl">
                  Attempt an authentic 80-question test (Maths, Physics, Chem) with 90-minute live countdown timer, TCS iON palette, and step-by-step solutions.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToCbt}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <span>Launch Mock Exam</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            {/* Search Input & Metric Counters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search college name, code (e.g. VRSE, AUCE, JNTUK, VITAP) or city..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 shrink-0 overflow-x-auto">
                <span className="font-semibold text-slate-700">
                  <strong>{filteredTotalColleges}</strong> Colleges
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-blue-700">
                  <strong>{filteredTotalVacancies.toLocaleString('en-IN')}</strong> Phase 2 Leftover Seats
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-emerald-700">
                  <strong>{totalSystemIntake.toLocaleString('en-IN')}</strong> Total Intake
                </span>
              </div>
            </div>

            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center pt-2 border-t border-slate-100">
              {/* District Filter */}
              <div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="all">📍 All Districts ({districts.length})</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Filter */}
              <div>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="all">⚡ All Branches ({branchCodes.length})</option>
                  {branchCodes.map((b) => (
                    <option key={b} value={b}>
                      Branch: {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caste / Category Guidance Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="all">👥 Quota: All Categories</option>
                  <option value="OC">OC (Open Competition)</option>
                  <option value="EWS">EWS (Economically Weaker)</option>
                  <option value="BC-A">BC-A Category</option>
                  <option value="BC-B">BC-B Category</option>
                  <option value="BC-C">BC-C Category</option>
                  <option value="BC-D">BC-D Category</option>
                  <option value="BC-E">BC-E Category</option>
                  <option value="SC">SC Quota</option>
                  <option value="ST">ST Quota</option>
                </select>
              </div>

              {/* Hide 0 Vacancies & Reset */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors">
                  <input
                    type="checkbox"
                    checked={hideZeroVacancy}
                    onChange={(e) => {
                      setHideZeroVacancy(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Hide 0 Left</span>
                </label>

                {(searchQuery || selectedDistrict !== 'all' || selectedBranch !== 'all' || hideZeroVacancy) && (
                  <button
                    onClick={handleResetFilters}
                    className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {paginatedColleges.map((college) => (
              <div
                key={college.inst_code}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-colors space-y-4"
              >
                {/* College Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-900 text-white">
                        {college.inst_code}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {college.inst_name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{college.place}, {college.district}</span>
                      <span className="text-slate-300">•</span>
                      <span>Affiliated: {college.affiliated_to}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => handleCopyCode(college.inst_code)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy College Code"
                    >
                      {copiedCode === college.inst_code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Code</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleShareCollegeWhatsApp(college)}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Branches Vacancy Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {college.branches.map((b) => {
                    const seats = parseInt(String((b as any).leftSeats ?? (b as any).seats ?? b.left_over_seats ?? 0), 10);
                    const totalSeats = parseInt(String(b.total_seats ?? 0), 10);
                    const hasAvailableSeats = seats > 0;

                    return (
                      <div
                        key={b.branch_code}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                          hasAvailableSeats
                            ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs font-mono text-slate-900">
                              {b.branch_code}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate">
                              ({b.branch_name})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            ₹{b.fee.toLocaleString('en-IN')}/year
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block ${
                              hasAvailableSeats
                                ? 'bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-xs shadow-sm'
                                : 'bg-rose-600 text-white font-bold px-3 py-1 rounded-full text-xs shadow-sm'
                            }`}
                          >
                            {seats} / {totalSeats} Left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {paginatedColleges.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No colleges matched your filters</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or enabling branches with 0 vacancies.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs">
              <button
                disabled={effectivePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="text-slate-500 font-medium">
                Page {effectivePage} of {totalPages}
              </span>

              <button
                disabled={effectivePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
