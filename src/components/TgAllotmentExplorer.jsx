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

// తెలంగాణలోని ప్రధాన ఇంజనీరింగ్ కాలేజీల కోడ్స్ లిస్ట్ (public folder లోని ఫైల్స్ తో మ్యాచ్ అవుతాయి)
const COLLEGE_LIST = [
  { code: "ACEG", name: "A C E ENGINEERING COLLEGE" },
  { code: "AARM", name: "AAR MAHAVEER ENGINEERING COLLEGE" },
  { code: "AKIT", name: "ABDULKALAM INSTITUTE OF TECHNOLOGY AND SCIENCE" },
  { code: "CBIT", name: "CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY" },
  { code: "VNRV", name: "VNR VJIET HYDERABAD" },
  { code: "VASV", name: "VASAVI COLLEGE OF ENGINEERING" },
  { code: "CVRH", name: "CVR COLLEGE OF ENGINEERING" },
  { code: "GRET", name: "GOKARAJU RANGARAJU INSTITUTE OF ENGG AND TECH" },
  { code: "MGIT", name: "MAHATMA GANDHI INSTITUTE OF TECHNOLOGY" },
  { code: "KMIT", name: "KESAV MEMORIAL INSTITUTE OF TECHNOLOGY" },
  { code: "OUCE", name: "OSMANIA UNIVERSITY COLLEGE OF ENGINEERING" },
  { code: "JNTH", name: "JNTUH COLLEGE OF ENGINEERING HYDERABAD" }
  // అవసరమైతే మిగతా కాలేజీ కోడ్స్ ఇక్కడ యాడ్ చేసుకోవచ్చు
];

export default function TgAllotmentExplorer() {
  const [selectedCollegeCode, setSelectedCollegeCode] = useState('CBIT');
  const [collegeData, setCollegeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [casteFilter, setCasteFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [copiedTicket, setCopiedTicket] = useState(null);

  // ఎంచుకున్న కాలేజీకి సంబంధించిన JSON ఫైల్‌ని ఆటోమేటిక్‌గా ఫెచ్ చేయడం
  useEffect(() => {
    if (!selectedCollegeCode) return;
    setLoading(true);

    // పబ్లిక్ ఫోల్డర్ లోని ఆయా కాలేజీ ఫైల్‌ని లోడ్ చేయడం
    fetch(`/TG_EAPCET_2026_ALLOTMENT/${selectedCollegeCode}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("College data not found");
        return res.json();
      })
      .then((data) => {
        const bundles = Array.isArray(data) ? data : [data];
        setCollegeData(bundles);
        if (bundles.length > 0) {
          setSelectedBranchCode(bundles[0].branchCode);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading college JSON:", err);
        setCollegeData([]);
        setLoading(false);
      });
  }, [selectedCollegeCode]);

  // బ్రాంచ్‌ల ఎంపిక
  const availableBranches = useMemo(() => {
    return collegeData.map((item) => ({
      code: item.branchCode,
      name: item.branchName,
      allottedCount: item.totalAllotted || item.records?.length || 0
    }));
  }, [collegeData]);

  // ప్రస్తుత బ్రాంచ్ బండిల్
  const currentBundle = useMemo(() => {
    return collegeData.find((item) => item.branchCode === selectedBranchCode) || collegeData[0] || null;
  }, [collegeData, selectedBranchCode]);

  // అనలిటిక్స్ లెక్కలు
  const analytics = useMemo(() => {
    if (!currentBundle || !currentBundle.records) {
      return { totalAllotted: 0, openingRank: 0, closingRank: 0, maleCount: 0, femaleCount: 0, malePct: 0, femalePct: 0, categoryClosingRanks: [] };
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

  // అభ్యర్థుల ఫిల్టరింగ్
  const filteredCandidates = useMemo(() => {
    if (!currentBundle || !currentBundle.records) return [];
    let list = [...currentBundle.records];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => 
        r.name?.toLowerCase().includes(q) ||
        r.hallTicket?.toLowerCase().includes(q) ||
        r.rank?.toString().includes(q) ||
        r.seatCategory?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => (sortOrder === 'ASC' ? a.rank - b.rank : b.rank - a.rank));
    return list;
  }, [currentBundle, searchQuery, sortOrder]);

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>🔥 AP & TG FINAL PHASE ALLOTMENTS NAME WISE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">TG EAPCET 2026 Allotment Radar</h1>
        </div>

        {/* Selectors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Select Institution</label>
              <select
                value={selectedCollegeCode}
                onChange={(e) => setSelectedCollegeCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {COLLEGE_LIST.map((c) => (
                  <option key={c.code} value={c.code}>[{c.code}] {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Select Branch</label>
              <select
                value={selectedBranchCode}
                onChange={(e) => { setSelectedBranchCode(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {availableBranches.map((b) => (
                  <option key={b.code} value={b.code}>{b.code} — {b.name} ({b.allottedCount} Seats)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search Candidate Name, Hall Ticket, or Rank..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-emerald-400 font-mono animate-pulse">Loading College Allotment Data...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Total Allotted</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.totalAllotted}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Opening Cutoff</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">#{analytics.openingRank}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Closing Cutoff</span>
                <div className="text-2xl font-black text-rose-400 mt-1">#{analytics.closingRank}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Branches</span>
                <div className="text-2xl font-black text-white mt-1">{availableBranches.length}</div>
              </div>
            </div>

            {/* Candidate List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paginatedCandidates.map((c) => (
                <div key={c.hallTicket || c.rank} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">HT: {c.hallTicket}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono font-bold">
                      #{c.rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{c.gender}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{c.caste}</span>
                    <span className="ml-auto px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-semibold">{c.seatCategory}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
