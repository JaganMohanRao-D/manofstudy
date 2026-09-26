import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Building2,
  Search,
  Award,
  Sparkles,
  TrendingUp,
  Flame,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { AP_EAPCET_COLLEGES } from '../data/apEapcetCollegeManifest';
import APAllotmentExplorer from './ap-allotment/APAllotmentExplorer';

export const POPULAR_BRANCHES = [
  { code: 'ALL', label: 'All Branches' },
  { code: 'CSE', label: 'CSE (Computer Science)' },
  { code: 'CSM', label: 'CSM (AI & ML)' },
  { code: 'CSD', label: 'CSD (Data Science)' },
  { code: 'CSC', label: 'CSC (Cyber Security)' },
  { code: 'AID', label: 'AID (AI & DS)' },
  { code: 'INF', label: 'INF (Information Tech)' },
  { code: 'ECE', label: 'ECE (Electronics)' },
  { code: 'EEE', label: 'EEE (Electrical)' },
  { code: 'MEC', label: 'Mechanical Engineering' },
  { code: 'CIV', label: 'Civil Engineering' },
];

export default function ApCollegePredictor({
  initialCollegeCode = 'AUCE',
  initialBranchCode = 'ALL',
  initialTab = 'intelligence',
  onNavigateToTab,
}) {
  const [activeTab, setActiveTab] = useState(
    initialTab === 'predictor' ? 'predictor' : 'intelligence'
  );

  // Predictor state
  const [userRank, setUserRank] = useState('14500');
  const [userCategory, setUserCategory] = useState('OC');
  const [userGender, setUserGender] = useState('M');
  const [userRegion, setUserRegion] = useState('AU');
  const [predictorBranchFilter, setPredictorBranchFilter] = useState('ALL');
  const [predictorChanceFilter, setPredictorChanceFilter] = useState('ALL');
  const [predictorSearchTerm, setPredictorSearchTerm] = useState('');
  const [selectedCollegeForExplorer, setSelectedCollegeForExplorer] = useState(initialCollegeCode);
  const [selectedBranchForExplorer, setSelectedBranchForExplorer] = useState(initialBranchCode);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab === 'predictor' ? 'predictor' : 'intelligence');
    }
  }, [initialTab]);

  // Predictor Calculation
  const predictorResults = useMemo(() => {
    const numRank = parseInt(userRank.replace(/,/g, ''), 10);
    if (isNaN(numRank) || numRank <= 0) return [];

    const results = [];

    AP_EAPCET_COLLEGES.forEach((col) => {
      if (!col.hasData || !col.branches) return;

      col.branches.forEach((br) => {
        if (predictorBranchFilter !== 'ALL' && br.branchCode !== predictorBranchFilter) {
          return;
        }

        const closingRank = br.maxRank || 0;
        const minRank = br.minRank || 0;
        if (closingRank === 0) return;

        let factor = 1.0;
        if (userCategory === 'EWS') factor = 1.08;
        else if (userCategory === 'BC_A') factor = 1.15;
        else if (userCategory === 'BC_B') factor = 1.12;
        else if (userCategory === 'BC_C') factor = 1.18;
        else if (userCategory === 'BC_D') factor = 1.14;
        else if (userCategory === 'BC_E') factor = 1.25;
        else if (userCategory === 'SC') factor = 1.45;
        else if (userCategory === 'ST') factor = 1.65;

        if (userGender === 'F') factor *= 1.08;

        const effectiveClosingRank = Math.round(closingRank * factor);
        const safeRankThreshold = Math.round(effectiveClosingRank * 0.82);

        let chance = 'AMBITIOUS';
        let chanceScore = 20;

        if (numRank <= safeRankThreshold) {
          chance = 'SAFE';
          chanceScore = 90;
        } else if (numRank <= effectiveClosingRank) {
          chance = 'MODERATE';
          chanceScore = 65;
        } else if (numRank <= Math.round(effectiveClosingRank * 1.18)) {
          chance = 'AMBITIOUS';
          chanceScore = 35;
        } else {
          return;
        }

        results.push({
          collegeCode: col.collegeCode,
          collegeName: col.collegeName,
          branchCode: br.branchCode,
          branchName: br.branchName,
          closingRank,
          minRank,
          effectiveClosingRank,
          chance,
          chanceScore,
          diff: effectiveClosingRank - numRank,
        });
      });
    });

    let filtered = results;
    if (predictorChanceFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.chance === predictorChanceFilter);
    }

    if (predictorSearchTerm.trim()) {
      const q = predictorSearchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.collegeCode.toLowerCase().includes(q) ||
          r.collegeName.toLowerCase().includes(q) ||
          r.branchCode.toLowerCase().includes(q) ||
          r.branchName.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      const chanceOrder = { SAFE: 1, MODERATE: 2, AMBITIOUS: 3 };
      if (chanceOrder[a.chance] !== chanceOrder[b.chance]) {
        return chanceOrder[a.chance] - chanceOrder[b.chance];
      }
      return b.diff - a.diff;
    });
  }, [
    userRank,
    userCategory,
    userGender,
    predictorBranchFilter,
    predictorChanceFilter,
    predictorSearchTerm,
  ]);

  return (
    <div>
      {/* Top Main Mode Switcher */}
      <div className="bg-slate-950 pt-4 pb-2 px-3 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('intelligence')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'intelligence'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Allotment Explorer (255 Colleges)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('predictor')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'predictor'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Rank Predictor</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'intelligence' ? (
        <APAllotmentExplorer
          initialCollegeCode={selectedCollegeForExplorer}
          initialBranchCode={selectedBranchForExplorer}
        />
      ) : (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6 lg:px-8 font-sans">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Predictor Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>AP EAPCET 2025 Rank Predictor</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Admission Probability Predictor
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Deterministic estimation of Safe, Target, and Reach colleges calculated from official AP counseling cutoffs.
              </p>
            </div>

            {/* Predictor Input Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Your AP EAPCET Rank
                  </label>
                  <input
                    type="number"
                    value={userRank}
                    onChange={(e) => setUserRank(e.target.value)}
                    placeholder="e.g. 14500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Social Category
                  </label>
                  <select
                    value={userCategory}
                    onChange={(e) => setUserCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="OC">OC (General)</option>
                    <option value="EWS">EWS (10% Quota)</option>
                    <option value="BC_A">BC-A</option>
                    <option value="BC_B">BC-B</option>
                    <option value="BC_C">BC-C</option>
                    <option value="BC_D">BC-D</option>
                    <option value="BC_E">BC-E</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Gender</label>
                  <select
                    value={userGender}
                    onChange={(e) => setUserGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="M">Male (Boys)</option>
                    <option value="F">Female (Girls Quota 33%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Target Branch
                  </label>
                  <select
                    value={predictorBranchFilter}
                    onChange={(e) => setPredictorBranchFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {POPULAR_BRANCHES.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['ALL', 'SAFE', 'MODERATE', 'AMBITIOUS'].map((chance) => (
                    <button
                      key={chance}
                      type="button"
                      onClick={() => setPredictorChanceFilter(chance)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        predictorChanceFilter === chance
                          ? chance === 'SAFE'
                            ? 'bg-emerald-500 text-slate-950'
                            : chance === 'MODERATE'
                            ? 'bg-amber-500 text-slate-950'
                            : chance === 'AMBITIOUS'
                            ? 'bg-rose-500 text-white'
                            : 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {chance === 'ALL' ? 'All Chances' : chance}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={predictorSearchTerm}
                    onChange={(e) => setPredictorSearchTerm(e.target.value)}
                    placeholder="Filter college or branch..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-bold text-white">
                  Found <strong className="text-amber-400">{predictorResults.length}</strong> college &amp; branch matches
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {predictorResults.slice(0, 48).map((res, idx) => (
                  <div
                    key={`pred-${res.collegeCode}-${res.branchCode}-${idx}`}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-2.5 transition-all shadow-md backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300 mr-1.5">
                          {res.collegeCode}
                        </span>
                        <span className="font-bold text-white text-xs truncate inline-block max-w-[160px]">
                          {res.collegeName}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide shrink-0 ${
                          res.chance === 'SAFE'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : res.chance === 'MODERATE'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {res.chance} ({res.chanceScore}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {res.branchCode}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {res.branchName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>
                        Estimated Cutoff: <strong className="text-slate-200">#{res.effectiveClosingRank.toLocaleString()}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollegeForExplorer(res.collegeCode);
                          setSelectedBranchForExplorer(res.branchCode);
                          setActiveTab('intelligence');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <span>Explore</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-center text-[11px] text-slate-500">
              Disclaimer: Prediction chances are mathematical models based on historical cutoff datasets and do not guarantee admission.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
