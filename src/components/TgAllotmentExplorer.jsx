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
  AlertCircle,
  Filter,
  ExternalLink
} from 'lucide-react';
import { TG_EAPCET_COLLEGE_MANIFEST, TG_EAPCET_GLOBAL_STATS } from '../data/tgEapcetCollegeManifest';

// తెలంగాణలోని ప్రధాన ఇంజనీరింగ్ కాలేజీల ప్రాధాన్యత జాబితా
const FEATURED_COLLEGES = [
  { code: "CBIT", name: "CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY" },
  { code: "VJEC", name: "VNR VIGNANA JYOTHI INSTITUTE OF ENGG & TECH" },
  { code: "VASV", name: "VASAVI COLLEGE OF ENGINEERING" },
  { code: "CVRH", name: "CVR COLLEGE OF ENGINEERING" },
  { code: "GRET", name: "GOKARAJU RANGARAJU INSTITUTE OF ENGG & TECH" },
  { code: "MGIT", name: "MAHATMA GANDHI INSTITUTE OF TECHNOLOGY" },
  { code: "KMIT", name: "KESAV MEMORIAL INSTITUTE OF TECHNOLOGY" },
  { code: "OUCE", name: "OSMANIA UNIVERSITY COLLEGE OF ENGINEERING" },
  { code: "JNTH", name: "JNTUH COLLEGE OF ENGINEERING HYDERABAD" },
  { code: "ACEG", name: "A C E ENGINEERING COLLEGE" },
  { code: "VBIT", name: "VIGNAN BHARATI INSTITUTE OF TECHNOLOGY" },
  { code: "VMEG", name: "VARDHAMAN COLLEGE OF ENGINEERING" },
  { code: "TKRC", name: "T K R COLLEGE OF ENGINEERING AND TECHNOLOGY" },
  { code: "MLRD", name: "MALLA REDDY COLLEGE OF ENGG & TECHNOLOGY" },
  { code: "SNIS", name: "SREENIDHI INSTITUTE OF SCIENCE & TECHNOLOGY" }
];

export default function TgAllotmentExplorer() {
  const [selectedCollegeCode, setSelectedCollegeCode] = useState('CBIT');
  const [collegeData, setCollegeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [casteFilter, setCasteFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [copiedTicket, setCopiedTicket] = useState(null);

  // ఎంచుకున్న కాలేజీకి సంబంధించిన JSON ఫైల్‌ని ఆటోమేటిక్‌గా ఫెచ్ చేయడం
  useEffect(() => {
    if (!selectedCollegeCode) return;
    setLoading(true);
    setErrorMessage(null);

    // Resolve code alias if needed (e.g. VNRV -> VJEC)
    const normalizedCode = selectedCollegeCode === 'VNRV' ? 'VJEC' : selectedCollegeCode;

    // Find path in manifest or use direct URL
    const manifestEntry = TG_EAPCET_COLLEGE_MANIFEST.find(
      (c) => c.collegeCode.toUpperCase() === normalizedCode.toUpperCase()
    );
    const targetUrl = manifestEntry?.file || `/TG_EAPCET_2026_ALLOTMENT/${normalizedCode}.json`;

    fetch(targetUrl)
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        // If 404 or HTML response, do NOT parse as JSON
        if (!res.ok || contentType.includes('text/html')) {
          throw new Error(`Data file not available for [${normalizedCode}].`);
        }
        return res.json();
      })
      .then((data) => {
        // Handle both { collegeCode, collegeName, branches: [...] } and array formats
        const bundles = Array.isArray(data) ? data : (data.branches || [data]);
        setCollegeData(bundles);

        if (bundles.length > 0) {
          // Keep existing branch selection if valid for new college, else select first
          setSelectedBranchCode((prev) => {
            const hasBranch = bundles.some((b) => b.branchCode === prev);
            return hasBranch ? prev : (bundles[0].branchCode || '');
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Notice loading college JSON:', err.message);
        setCollegeData([]);
        setErrorMessage(
          `కాలేజీ [${normalizedCode}] అలాట్‌మెంట్ డేటా ప్రస్తుతం లోడ్ కాలేదు. దయచేసి క్రింది అందుబాటులో ఉన్న కాలేజీని ఎంచుకోండి.`
        );
        setLoading(false);
      });
  }, [selectedCollegeCode]);

  // బ్రాంచ్‌ల ఎంపిక జాబితా
  const availableBranches = useMemo(() => {
    return collegeData.map((item) => ({
      code: item.branchCode || '',
      name: item.branchName || item.branchCode || '',
      allottedCount: item.totalAllotted || item.records?.length || 0,
      openingRank: item.openingRank || 0,
      closingRank: item.closingRank || 0
    }));
  }, [collegeData]);

  // ప్రస్తుత బ్రాంచ్ బండిల్
  const currentBundle = useMemo(() => {
    if (!collegeData.length) return null;
    return collegeData.find((item) => item.branchCode === selectedBranchCode) || collegeData[0] || null;
  }, [collegeData, selectedBranchCode]);

  // లభ్యమయ్యే కేటగిరీలు/కులాల జాబితా
  const availableCastes = useMemo(() => {
    if (!currentBundle || !currentBundle.records) return [];
    const set = new Set();
    currentBundle.records.forEach((r) => {
      if (r.caste) set.add(r.caste);
    });
    return Array.from(set).sort();
  }, [currentBundle]);

  // అనలిటిక్స్ లెక్కలు
  const analytics = useMemo(() => {
    if (!currentBundle || !currentBundle.records || currentBundle.records.length === 0) {
      return { 
        totalAllotted: 0, 
        openingRank: 0, 
        closingRank: 0, 
        maleCount: 0, 
        femaleCount: 0, 
        malePct: 0, 
        femalePct: 0, 
        categoryClosingRanks: [] 
      };
    }

    const records = currentBundle.records;
    const total = records.length;
    let male = 0, female = 0;
    const categoryCutoffMap = {};

    records.forEach((r) => {
      if (r.gender === 'M') male++;
      if (r.gender === 'F') female++;

      const cat = r.seatCategory || 'OPEN';
      if (!categoryCutoffMap[cat]) {
        categoryCutoffMap[cat] = { quota: cat, openingRank: r.rank, closingRank: r.rank, count: 1 };
      } else {
        categoryCutoffMap[cat].count++;
        if (r.rank < categoryCutoffMap[cat].openingRank) categoryCutoffMap[cat].openingRank = r.rank;
        if (r.rank > categoryCutoffMap[cat].closingRank) categoryCutoffMap[cat].closingRank = r.rank;
      }
    });

    return {
      totalAllotted: total,
      openingRank: currentBundle.openingRank || records[0]?.rank || 0,
      closingRank: currentBundle.closingRank || records[total - 1]?.rank || 0,
      maleCount: male,
      femaleCount: female,
      malePct: total > 0 ? ((male / total) * 100).toFixed(1) : 0,
      femalePct: total > 0 ? ((female / total) * 100).toFixed(1) : 0,
      categoryClosingRanks: Object.values(categoryCutoffMap).sort((a, b) => a.closingRank - b.closingRank)
    };
  }, [currentBundle]);

  // అభ్యర్థుల ఫిల్టరింగ్ (పేరు, ర్యాంక్, హాల్ టికెట్, జెండర్, క్యాస్ట్)
  const filteredCandidates = useMemo(() => {
    if (!currentBundle || !currentBundle.records) return [];
    let list = [...currentBundle.records];

    // Gender filter
    if (genderFilter !== 'ALL') {
      list = list.filter((r) => r.gender === genderFilter);
    }

    // Caste filter
    if (casteFilter !== 'ALL') {
      list = list.filter((r) => r.caste === casteFilter);
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => 
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.hallTicket && r.hallTicket.toLowerCase().includes(q)) ||
        (r.rank && r.rank.toString().includes(q)) ||
        (r.seatCategory && r.seatCategory.toLowerCase().includes(q)) ||
        (r.caste && r.caste.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => (sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank));
    return list;
  }, [currentBundle, searchQuery, genderFilter, casteFilter, sortOrder]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const handleCopyTicket = (ticket) => {
    if (!ticket) return;
    navigator.clipboard?.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>🔥 AP & TG FINAL PHASE ALLOTMENTS NAME WISE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            TG EAPCET 2026 Allotment Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            తెలంగాణ ఇంజనీరింగ్ కాలేజీల వారీగా, బ్రాంచ్ వారీగా విద్యార్థుల అలాట్‌మెంట్ జాబితా & కట్-ఆఫ్ ర్యాంకులు (151+ కాలేజీలు, 71,600+ సీట్లు)
          </p>
        </div>

        {/* Institution & Branch Selectors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Select Institution / కళాశాల
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {TG_EAPCET_COLLEGE_MANIFEST.length} Colleges Available
                </span>
              </label>
              <select
                id="college-selector"
                value={selectedCollegeCode}
                onChange={(e) => {
                  setSelectedCollegeCode(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <optgroup label="🌟 Featured / ప్రముఖ ఇంజనీరింగ్ కాలేజీలు">
                  {FEATURED_COLLEGES.map((c) => (
                    <option key={`featured-${c.code}`} value={c.code}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={`🏛️ All Telangana Colleges (${TG_EAPCET_COLLEGE_MANIFEST.length})`}>
                  {TG_EAPCET_COLLEGE_MANIFEST.map((c) => (
                    <option key={`all-${c.collegeCode}`} value={c.collegeCode}>
                      [{c.collegeCode}] {c.collegeName} ({c.recordCount} Allotted)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Branch Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  Select Branch / ఇంజనీరింగ్ బ్రాంచ్
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {availableBranches.length} Branches
                </span>
              </label>
              <select
                id="branch-selector"
                value={selectedBranchCode}
                onChange={(e) => {
                  setSelectedBranchCode(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={availableBranches.length === 0}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
              >
                {availableBranches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.name} ({b.allottedCount} Seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                id="search-candidates"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Candidate Name, Hall Ticket, or Rank..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              />
            </div>

            {/* Gender Filter */}
            <div className="sm:col-span-2">
              <select
                id="gender-filter"
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Genders</option>
                <option value="M">Boys (M)</option>
                <option value="F">Girls (F)</option>
              </select>
            </div>

            {/* Caste Filter */}
            <div className="sm:col-span-2">
              <select
                id="caste-filter"
                value={casteFilter}
                onChange={(e) => {
                  setCasteFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Castes</option>
                {availableCastes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort Order Toggle */}
            <div className="sm:col-span-2">
              <button
                type="button"
                id="sort-toggle"
                onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 transition-colors font-medium"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>{sortOrder === 'ASC' ? 'Rank: Low-High' : 'Rank: High-Low'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Notification Card (Graceful) */}
        {errorMessage && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-amber-200 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-amber-300">
                {errorMessage}
              </h4>
              <p className="text-xs text-amber-200/80">
                క్రింద ఉన్న ప్రముఖ కాలేజీలలో ఒకదానిని తక్షణమే వీక్షించడానికి క్లిక్ చేయండి:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['CBIT', 'VJEC', 'VASV', 'CVRH', 'VBIT'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCollegeCode(c)}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold"
                  >
                    {c} వీక్షించండి
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-emerald-400 font-mono text-sm animate-pulse">
              [{selectedCollegeCode}] అలాట్‌మెంట్ డేటాను లోడ్ చేస్తోంది...
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-medium">Total Allotted Seats</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.totalAllotted}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  M: {analytics.maleCount} ({analytics.malePct}%) | F: {analytics.femaleCount} ({analytics.femalePct}%)
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-medium">Opening Cutoff Rank</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {analytics.openingRank > 0 ? `#${analytics.openingRank.toLocaleString()}` : '—'}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-0.5">First Allotted Rank</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-medium">Closing Cutoff Rank</span>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  {analytics.closingRank > 0 ? `#${analytics.closingRank.toLocaleString()}` : '—'}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-0.5">Last Allotted Rank</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 font-medium">College Branches</span>
                <div className="text-2xl font-black text-white mt-1">{availableBranches.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Current: {currentBundle?.branchCode || 'None'}
                </div>
              </div>
            </div>

            {/* Category Cutoffs Bar (if available) */}
            {analytics.categoryClosingRanks.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Category Cutoffs (Closing Ranks) for {currentBundle?.branchCode}
                </span>
                <div className="flex flex-wrap gap-2">
                  {analytics.categoryClosingRanks.slice(0, 10).map((cat) => (
                    <div
                      key={cat.quota}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <span className="text-slate-400 font-mono text-[11px]">{cat.quota}:</span>
                      <span className="text-emerald-400 font-mono font-bold">#{cat.closingRank}</span>
                      <span className="text-slate-500 text-[10px]">({cat.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Counter & Pagination Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-400">
              <div>
                Showing <span className="text-white font-semibold">{filteredCandidates.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> – <span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, filteredCandidates.length)}</span> of <span className="text-white font-semibold">{filteredCandidates.length}</span> candidates in {currentBundle?.branchCode || 'branch'}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Candidate List Cards */}
            {filteredCandidates.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm">No candidates match the selected filters or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paginatedCandidates.map((c) => (
                  <div 
                    key={`${c.hallTicket || ''}-${c.rank}`} 
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white tracking-tight">{c.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono">HT: {c.hallTicket}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTicket(c.hallTicket)}
                            title="Copy Hall Ticket"
                            className="text-slate-500 hover:text-emerald-400 transition-colors"
                          >
                            {copiedTicket === c.hallTicket ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono font-bold">
                        #{c.rank?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {c.gender === 'M' ? 'Boys (M)' : c.gender === 'F' ? 'Girls (F)' : c.gender}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {c.caste}
                      </span>
                      {c.region && (
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px]">
                          {c.region}
                        </span>
                      )}
                      <span className="ml-auto px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-semibold">
                        {c.seatCategory}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200"
                >
                  Previous Page
                </button>
                <span className="text-xs text-slate-400 font-mono px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-200"
                >
                  Next Page
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
