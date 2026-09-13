import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Building2, 
  GitBranch, 
  Users, 
  Award, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Flame,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function TgAllotmentExplorer() {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Selector & Filter States
  const [selectedCollegeCode, setSelectedCollegeCode] = useState('');
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [casteFilter, setCasteFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC'); // ASC: Low to High (Rank 1 first)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [copiedTicket, setCopiedTicket] = useState(null);

  // 1. Fetching data from public directory
  useEffect(() => {
    setLoading(true);
    fetch('/tg_eapcet_allotment.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDataset(data);
          // Default selection to first college and its first branch
          setSelectedCollegeCode(data[0].collegeCode);
          setSelectedBranchCode(data[0].branchCode);
        } else {
          throw new Error("Dataset is empty or format invalid");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load TG Allotment dataset:", err);
        setLoadError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Extract unique colleges
  const colleges = useMemo(() => {
    const map = new Map();
    dataset.forEach((item) => {
      if (!map.has(item.collegeCode)) {
        map.set(item.collegeCode, {
          code: item.collegeCode,
          name: item.collegeName
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [dataset]);

  // 3. Extract branches available for the selected college
  const availableBranches = useMemo(() => {
    if (!selectedCollegeCode) return [];
    return dataset
      .filter((item) => item.collegeCode === selectedCollegeCode)
      .map((item) => ({
        code: item.branchCode,
        name: item.branchName,
        allottedCount: item.totalAllotted || item.records?.length || 0
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [dataset, selectedCollegeCode]);

  // Handle college change
  const handleCollegeChange = (e) => {
    const newCollege = e.target.value;
    setSelectedCollegeCode(newCollege);
    const branchesForNewCollege = dataset.filter((item) => item.collegeCode === newCollege);
    if (branchesForNewCollege.length > 0) {
      setSelectedBranchCode(branchesForNewCollege[0].branchCode);
    } else {
      setSelectedBranchCode('');
    }
    setCurrentPage(1);
    setSearchQuery('');
  };

  // Handle branch change
  const handleBranchChange = (e) => {
    setSelectedBranchCode(e.target.value);
    setCurrentPage(1);
    setSearchQuery('');
  };

  // 4. Current selected bundle
  const currentBundle = useMemo(() => {
    return dataset.find(
      (item) => item.collegeCode === selectedCollegeCode && item.branchCode === selectedBranchCode
    ) || null;
  }, [dataset, selectedCollegeCode, selectedBranchCode]);

  // 5. Dynamic Analytics derived strictly from records
  const analytics = useMemo(() => {
    if (!currentBundle || !currentBundle.records) {
      return {
        totalAllotted: 0,
        openingRank: 0,
        closingRank: 0,
        maleCount: 0,
        femaleCount: 0,
        malePct: 0,
        femalePct: 0,
        casteCounts: {},
        categoryClosingRanks: []
      };
    }

    const records = currentBundle.records;
    const total = records.length;
    let male = 0;
    let female = 0;
    const casteMap = {};
    const categoryCutoffMap = {};

    records.forEach((r) => {
      // Gender split
      if (r.gender === 'M') male++;
      if (r.gender === 'F') female++;

      // Caste split
      const c = r.caste || 'OTHER';
      casteMap[c] = (casteMap[c] || 0) + 1;

      // Category wise cutoff (Closing rank = max rank allotted in this category quota)
      const cat = r.seatCategory || 'OPEN';
      if (!categoryCutoffMap[cat]) {
        categoryCutoffMap[cat] = {
          quota: cat,
          openingRank: r.rank,
          closingRank: r.rank,
          count: 1
        };
      } else {
        categoryCutoffMap[cat].count++;
        if (r.rank < categoryCutoffMap[cat].openingRank) {
          categoryCutoffMap[cat].openingRank = r.rank;
        }
        if (r.rank > categoryCutoffMap[cat].closingRank) {
          categoryCutoffMap[cat].closingRank = r.rank;
        }
      }
    });

    const categoryClosingRanks = Object.values(categoryCutoffMap).sort(
      (a, b) => a.closingRank - b.closingRank
    );

    return {
      totalAllotted: total,
      openingRank: currentBundle.openingRank || (records[0] ? records[0].rank : 0),
      closingRank: currentBundle.closingRank || (records[total - 1] ? records[total - 1].rank : 0),
      maleCount: male,
      femaleCount: female,
      malePct: total > 0 ? ((male / total) * 100).toFixed(1) : 0,
      femalePct: total > 0 ? ((female / total) * 100).toFixed(1) : 0,
      casteCounts: casteMap,
      categoryClosingRanks
    };
  }, [currentBundle]);

  // 6. Filter & Search Records
  const filteredCandidates = useMemo(() => {
    if (!currentBundle || !currentBundle.records) return [];

    let list = [...currentBundle.records];

    // Search query: Case-insensitive name, roll/hallTicket, or exact rank
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => 
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.hallTicket && r.hallTicket.toLowerCase().includes(q)) ||
        (r.rank && r.rank.toString().includes(q)) ||
        (r.seatCategory && r.seatCategory.toLowerCase().includes(q))
      );
    }

    // Gender Filter
    if (genderFilter !== 'ALL') {
      list = list.filter((r) => r.gender === genderFilter);
    }

    // Caste Filter
    if (casteFilter !== 'ALL') {
      list = list.filter((r) => r.caste === casteFilter);
    }

    // Sort order
    list.sort((a, b) => {
      return sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank;
    });

    return list;
  }, [currentBundle, searchQuery, genderFilter, casteFilter, sortOrder]);

  // 7. Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const handleCopy = (ticket) => {
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 animate-ping absolute" />
          <div className="w-12 h-12 rounded-full border-2 border-t-emerald-500 border-slate-800 animate-spin" />
          <Flame className="w-6 h-6 text-emerald-400 absolute animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          Loading Official TG EAPCET 2026 Engine...
        </h3>
        <p className="text-sm text-slate-400 mt-2">
          Parsing counseling registers and category analytics client-side...
        </p>
      </div>
    );
  }

  // Error Screen
  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl max-w-md">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white">Dataset Loading Error</h4>
          <p className="text-xs text-rose-300/80 mt-1">
            Could not read `/tg_eapcet_allotment.json`. Verify the file is placed inside your repository's <code>public/</code> folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Pill Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider shadow-lg shadow-emerald-950/40">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>🔥 AP & TG FINAL PHASE ALLOTMENTS NAME WISE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            TG EAPCET 2026 Allotment & Cutoff Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Dynamic client-side analytical registers derived strictly from official final allotment returns.
          </p>
        </div>

        {/* Primary Controls: College & Branch Selectors */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* College Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Select Engineering Institution ({colleges.length} Available)
              </label>
              <select
                value={selectedCollegeCode}
                onChange={handleCollegeChange}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {colleges.map((c) => (
                  <option key={c.code} value={c.code}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                Select Branch Quota ({availableBranches.length} Branches)
              </label>
              <select
                value={selectedBranchCode}
                onChange={handleBranchChange}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {availableBranches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.name} ({b.allottedCount} Allotted)
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Real-time In-Dataset Candidate Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Candidate by Full Name, Hall Ticket No, or Exact Rank..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Bento KPI Metric Cards (Strictly Real Computed Data) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Seats Allotted</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {analytics.totalAllotted}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                Official
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              Final Phase admissions
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Opening Cutoff</span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                #{analytics.openingRank ? analytics.openingRank.toLocaleString() : '—'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              Minimum rank admitted
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Closing Cutoff</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                #{analytics.closingRank ? analytics.closingRank.toLocaleString() : '—'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              Final cutoff boundary
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Branches Offered</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {availableBranches.length}
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono">
                {selectedCollegeCode}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              Autonomous / University
            </span>
          </div>

        </div>

        {/* Demographics & Gender Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Gender Admission Distribution
            </span>
            <span className="text-slate-400 font-mono">{analytics.totalAllotted} Candidates</span>
          </div>

          {/* Stacked Percentage Bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 gap-0.5">
            <div 
              style={{ width: `${analytics.malePct}%` }}
              className="bg-cyan-500 h-full rounded-l-full transition-all duration-500"
              title={`Boys: ${analytics.malePct}%`}
            />
            <div 
              style={{ width: `${analytics.femalePct}%` }}
              className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
              title={`Girls: ${analytics.femalePct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span className="text-slate-300">Boys (M): <strong>{analytics.maleCount}</strong> ({analytics.malePct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-300">Girls (F): <strong>{analytics.femaleCount}</strong> ({analytics.femalePct}%)</span>
            </div>
          </div>
        </div>

        {/* Category-Wise Closing Ranks Reference Drawer/Table */}
        {analytics.categoryClosingRanks.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                Category-Wise Closing Cutoffs Reference Quota
              </h3>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {analytics.categoryClosingRanks.length} Categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Seat Category Quota</th>
                    <th className="py-2.5 px-3 text-center">Allotted</th>
                    <th className="py-2.5 px-3">Opening Rank</th>
                    <th className="py-2.5 px-3">Closing Cutoff Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {analytics.categoryClosingRanks.map((item) => (
                    <tr key={item.quota} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                          {item.quota}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400 font-sans">
                        {item.count}
                      </td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">
                        #{item.openingRank.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-rose-400 font-bold">
                        #{item.closingRank.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Candidate Allotment List Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredCandidates.length}</strong> matching candidate records
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* Sorting Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <span>{sortOrder === 'ASC' ? 'Rank: Low to High' : 'Rank: High to Low'}</span>
            </button>

            {/* Per Page Selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={filteredCandidates.length}>All</option>
            </select>

          </div>
        </div>

        {/* Mobile-First Candidate Cards Grid */}
        {paginatedCandidates.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl py-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">No candidates match your search query.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-emerald-400 hover:underline"
            >
              Reset Search Query
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {paginatedCandidates.map((candidate) => (
              <div
                key={candidate.hallTicket || candidate.rank}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all hover:shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  
                  {/* Candidate Name & Hall Ticket */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {candidate.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <span>HT: {candidate.hallTicket}</span>
                      <button
                        onClick={() => handleCopy(candidate.hallTicket)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        title="Copy Roll Number"
                      >
                        {copiedTicket === candidate.hallTicket ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono font-extrabold text-sm sm:text-base">
                    #{candidate.rank.toLocaleString()}
                  </div>
                </div>

                {/* Meta Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  
                  {/* Gender Badge */}
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    candidate.gender === 'F' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {candidate.gender === 'F' ? 'Female' : 'Male'}
                  </span>

                  {/* Caste Badge */}
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60">
                    {candidate.caste}
                  </span>

                  {/* Region Badge */}
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-medium border border-slate-700/60">
                    {candidate.region || 'OU'}
                  </span>

                  {/* Allotted Seat Category (Highlighted) */}
                  <span className="ml-auto px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-semibold">
                    {candidate.seatCategory}
                  </span>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fluid Pagination Strip */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-slate-400 px-3">
              Page <strong className="text-white">{currentPage}</strong> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}