import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Compass,
  Search,
  Building2,
  GitBranch,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileDown,
  ShieldCheck,
  Filter,
  CheckCheck,
  HelpCircle,
  Layers,
  Info,
  X,
  ExternalLink,
  Eye,
  Scale,
  ListOrdered,
  MapPin,
  Users
} from 'lucide-react';
import {
  runPredictorAnalysis,
  getPredictorIndex,
  CATEGORY_LABELS,
  DISTRICT_OPTIONS,
  CS_ALLIED_BRANCHES
} from '../services/tgCollegePredictorService';
import { TG_EAPCET_COLLEGE_MANIFEST } from '../data/tgEapcetCollegeManifest';

// All official TG EAPCET Social Categories
export const BASE_SOCIAL_CATEGORIES = [
  { id: 'OC', label: 'OC (Open Competition / General)' },
  { id: 'EWS', label: 'EWS (Economically Weaker Section - 10%)' },
  { id: 'BC_A', label: 'BC_A (Backward Class Group A - 7%)' },
  { id: 'BC_B', label: 'BC_B (Backward Class Group B - 10%)' },
  { id: 'BC_C', label: 'BC_C (Backward Class Group C - 1%)' },
  { id: 'BC_D', label: 'BC_D (Backward Class Group D - 7%)' },
  { id: 'BC_E', label: 'BC_E (Backward Class Group E - 4%)' },
  { id: 'SC_I', label: 'SC_I / SC-1 (Scheduled Caste Group 1)' },
  { id: 'SC_II', label: 'SC_II / SC-2 (Scheduled Caste Group 2)' },
  { id: 'SC_III', label: 'SC_III / SC-3 (Scheduled Caste Group 3)' },
  { id: 'SC', label: 'SC (General Scheduled Caste Pool)' },
  { id: 'ST', label: 'ST (Scheduled Tribe - 10%)' },
  { id: 'MUS', label: 'MUS (Muslim Minority Institutions Pool)' },
];

// Special Reservation Quotas
export const SPECIAL_RESERVATION_OPTIONS = [
  { id: 'NONE', label: 'None (Standard Category Seats)' },
  { id: 'NCC', label: 'NCC (National Cadet Corps)' },
  { id: 'SPORTS', label: 'SPORTS / SG (Sports & Games)' },
  { id: 'CAP', label: 'CAP (Children of Armed Personnel / Defense)' },
  { id: 'PHO', label: 'PHO (Orthopedically / Locomotor Impaired)' },
  { id: 'PHH', label: 'PHH (Hearing Impaired)' },
  { id: 'PHV', label: 'PHV (Visual Impaired)' },
  { id: 'PHC', label: 'PHC / PHA / PHM (Multiple / Autism / Speech)' },
];

// Curated list of all 37 branches in 2026 dataset
export const ALL_BRANCH_OPTIONS = [
  { code: 'ALL', name: 'All Branches (Show all matching disciplines)' },
  { code: 'ALL_CS', name: 'Any Computer Science & Allied (CSE, CSM, CSD, CSC, AID, etc.)' },
  { code: 'CSE', name: 'Computer Science and Engineering (CSE)' },
  { code: 'CSM', name: 'CSE - Artificial Intelligence & Machine Learning (CSM)' },
  { code: 'CSD', name: 'CSE - Data Science (CSD)' },
  { code: 'CSC', name: 'CSE - Cyber Security (CSC)' },
  { code: 'AID', name: 'Artificial Intelligence and Data Science (AID)' },
  { code: 'AIM', name: 'Artificial Intelligence and Machine Learning (AIM)' },
  { code: 'INF', name: 'Information Technology (INF)' },
  { code: 'CSB', name: 'Computer Science and Business Systems (CSB)' },
  { code: 'CSO', name: 'CSE - IoT and Cyber Security including Blockchain (CSO)' },
  { code: 'ECE', name: 'Electronics and Communication Engineering (ECE)' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering (EEE)' },
  { code: 'CIV', name: 'Civil Engineering (CIV)' },
  { code: 'MEC', name: 'Mechanical Engineering (MEC)' },
  { code: 'CHE', name: 'Chemical Engineering (CHE)' },
  { code: 'ANE', name: 'Aeronautical Engineering (ANE)' },
  { code: 'BME', name: 'Biomedical Engineering (BME)' },
  { code: 'BIO', name: 'Biotechnology (BIO)' },
  { code: 'MIN', name: 'Mining Engineering (MIN)' },
  { code: 'MET', name: 'Metallurgical Engineering (MET)' },
  { code: 'EIE', name: 'Electronics and Instrumentation Engineering (EIE)' },
  { code: 'CIC', name: 'Computer Science and Information Technology (CIC)' },
  { code: 'CSI', name: 'Computer Science and Information Technology (CSI)' },
  { code: 'CSA', name: 'CSE - IoT (CSA)' },
  { code: 'CSN', name: 'Computer Science and Network Engineering (CSN)' },
  { code: 'CSW', name: 'Computer Science and Engineering (Web Tech) (CSW)' },
  { code: 'CSG', name: 'Computer Science and Design (CSG)' },
  { code: 'ECM', name: 'Electronics and Computer Engineering (ECM)' },
  { code: 'ETM', name: 'Electronics and Telematics Engineering (ETM)' },
  { code: 'MCT', name: 'Mechatronics Engineering (MCT)' },
  { code: 'AUT', name: 'Automobile Engineering (AUT)' },
  { code: 'FDT', name: 'Food Technology (FDT)' },
  { code: 'TEX', name: 'Textile Technology (TEX)' },
  { code: 'CME', name: 'Chemical Engineering (CME)' },
  { code: 'MMS', name: 'Mechanical (Manufacturing) (MMS)' },
  { code: 'MTE', name: 'Materials Technology (MTE)' },
  { code: 'GEO', name: 'Geo-Informatics Engineering (GEO)' },
  { code: 'PHE', name: 'Pharmaceutical Engineering (PHE)' }
];

export default function TgCollegePredictor({ onNavigateToAllotment }) {
  // Navigation tabs: 'predictor' (primary) vs 'web-options' (strategy builder)
  const [activeTab, setActiveTab] = useState('predictor');

  // STEP 1: Rank
  const [rankInput, setRankInput] = useState('25000');
  const [rankError, setRankError] = useState('');

  // STEP 2: Category
  const [selectedCategory, setSelectedCategory] = useState('BC_B');

  // STEP 3: Gender
  const [selectedGender, setSelectedGender] = useState('M');

  // STEP 4: Preferred Branch
  const [selectedBranch, setSelectedBranch] = useState('CSE');

  // Optional "More filters"
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [selectedSpecialQuota, setSelectedSpecialQuota] = useState('NONE');

  // Predictor Execution State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('ALL'); // 'ALL' | 'WITHIN' | 'NEAR' | 'INSUFFICIENT'
  const [sortBy, setSortBy] = useState('SELECTIVE'); // 'SELECTIVE' | 'CLOSING_DESC' | 'CLOSEST_TO_RANK' | 'NAME_ASC'

  // Comparison State (Up to 4 colleges)
  const [comparedColleges, setComparedColleges] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Web Options List State (Preserved for Strategy Builder)
  const [webOptionsList, setWebOptionsList] = useState([]);
  const [hasCopiedList, setHasCopiedList] = useState(false);

  // Initial load of index & auto-run first analysis
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsAnalyzing(true);
      try {
        await getPredictorIndex();
        if (isMounted) {
          handleRunPrediction(25000, 'BC_B', 'M', 'CSE', 'All Districts', '', 'NONE');
        }
      } catch (err) {
        console.error('Failed to init predictor:', err);
      } finally {
        if (isMounted) setIsAnalyzing(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Validation & execution handler
  const handleRunPrediction = async (
    rankVal = rankInput,
    catVal = selectedCategory,
    genVal = selectedGender,
    branchVal = selectedBranch,
    distVal = selectedDistrict,
    colVal = collegeSearchQuery,
    specVal = selectedSpecialQuota
  ) => {
    const numRank = parseInt(rankVal, 10);
    if (isNaN(numRank) || numRank < 1 || numRank > 400000) {
      setRankError('Please enter a valid rank between 1 and 400,000');
      return;
    }
    setRankError('');
    setIsAnalyzing(true);

    try {
      const response = await runPredictorAnalysis({
        rank: numRank,
        category: catVal,
        gender: genVal,
        branch: branchVal,
        district: distVal,
        collegeQuery: colVal,
        specialQuota: specVal
      });
      setAnalysisResults(response);
    } catch (err) {
      console.error('Error during predictor analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleRunPrediction();
  };

  // Filtered and sorted matches
  const visibleMatches = useMemo(() => {
    if (!analysisResults || !analysisResults.matches) return [];
    let list = [...analysisResults.matches];

    // Status Tab Filter
    if (activeFilterTab === 'WITHIN') {
      list = list.filter(m => m.classification === 'WITHIN_RANGE');
    } else if (activeFilterTab === 'NEAR') {
      list = list.filter(m => m.classification === 'NEAR_RANGE');
    } else if (activeFilterTab === 'INSUFFICIENT') {
      list = list.filter(m => m.classification === 'INSUFFICIENT_DATA');
    }

    // Sort order
    if (sortBy === 'SELECTIVE') {
      list.sort((a, b) => a.minObservedRank - b.minObservedRank);
    } else if (sortBy === 'CLOSING_DESC') {
      list.sort((a, b) => b.maxObservedRank - a.maxObservedRank);
    } else if (sortBy === 'CLOSEST_TO_RANK') {
      const userR = analysisResults.appliedFilter.rank;
      list.sort((a, b) => Math.abs(a.maxObservedRank - userR) - Math.abs(b.maxObservedRank - userR));
    } else if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.collegeName.localeCompare(b.collegeName));
    }

    return list;
  }, [analysisResults, activeFilterTab, sortBy]);

  // Comparison toggle handler
  const toggleCompare = (match) => {
    setComparedColleges(prev => {
      const exists = prev.some(item => item.id === match.id);
      if (exists) {
        return prev.filter(item => item.id !== match.id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 colleges simultaneously.');
          return prev;
        }
        return [...prev, match];
      }
    });
  };

  // Add to Web Options list
  const addToWebOptions = (match) => {
    const exists = webOptionsList.some(item => item.id === match.id);
    if (!exists) {
      setWebOptionsList(prev => [...prev, { ...match, order: prev.length + 1 }]);
    }
  };

  const removeFromWebOptions = (id) => {
    setWebOptionsList(prev => prev.filter(item => item.id !== id).map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const exportWebOptionsCSV = () => {
    if (!webOptionsList.length) return;
    const headers = 'Preference No,College Code,College Name,Branch Code,Branch Name,Observed Min Rank,Observed Max Rank,Matching Records,Status\n';
    const rows = webOptionsList.map(item =>
      `"${item.order}","${item.collegeCode}","${item.collegeName.replace(/"/g, '""')}","${item.branchCode}","${item.branchName}","${item.minObservedRank}","${item.maxObservedRank}","${item.matchingRecordCount}","${item.classificationLabel}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TG_EAPCET_Web_Options_Rank_${rankInput}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28">
      {/* Top Breadcrumb & Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Telangana EAPCET 2026 College Predictor
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  71,646 Records
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  151 Colleges
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic historical allotment analysis based on official TS EAPCET 2026 round data
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('predictor')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'predictor'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>College Predictor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('web-options')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'web-options'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Web Options Builder</span>
              {webOptionsList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-blue-400 text-slate-950 rounded-full text-[10px] font-bold">
                  {webOptionsList.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Transparent Data Source Banner */}
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Data Source Transparency:</strong> Based on available TS EAPCET 2026 allotment records across 151 Telangana engineering colleges. This tool analyses historical allotment data and does not guarantee future seat allotment.
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-slate-400">Deterministic Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-medium">100% Real Records</span>
          </div>
        </div>

        {activeTab === 'predictor' ? (
          <>
            {/* 4-STEP INPUT FORM CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* STEP 1: TS EAPCET Rank */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px]">
                        1
                      </span>
                      TS EAPCET Rank
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="400000"
                        value={rankInput}
                        onChange={(e) => setRankInput(e.target.value)}
                        placeholder="e.g. 24500"
                        className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
                          rankError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
                        } rounded-xl text-white text-sm font-semibold placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                        Rank
                      </span>
                    </div>
                    {rankError ? (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {rankError}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">1 to 400,000</p>
                    )}
                  </div>

                  {/* STEP 2: Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px]">
                        2
                      </span>
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {BASE_SOCIAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">Includes SC 1/2/3 sub-categorization</p>
                  </div>

                  {/* STEP 3: Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px]">
                        3
                      </span>
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGender('M')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          selectedGender === 'M'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        Male (General Pool)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGender('F')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          selectedGender === 'F'
                            ? 'bg-pink-600 text-white border-pink-500 shadow-xs'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        Female (+Girls Quota)
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Girls quota + open general pool</p>
                  </div>

                  {/* STEP 4: Preferred Branch */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px]">
                        4
                      </span>
                      Preferred Branch
                    </label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {ALL_BRANCH_OPTIONS.map(b => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">37 official engineering branches</p>
                  </div>
                </div>

                {/* Collapsible "More filters" */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setShowMoreFilters(prev => !prev)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                    <span>{showMoreFilters ? 'Hide advanced filters' : 'More filters (District, Specific College, Special Quotas)'}</span>
                    {showMoreFilters ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  {showMoreFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 mt-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 animate-in fade-in duration-200">
                      {/* District / Location */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          District / Region
                        </label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        >
                          {DISTRICT_OPTIONS.map(dist => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Specific College Search */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Specific College Filter
                        </label>
                        <input
                          type="text"
                          value={collegeSearchQuery}
                          onChange={(e) => setCollegeSearchQuery(e.target.value)}
                          placeholder="e.g. CBIT, VNR, JNTU, OU"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500"
                        />
                      </div>

                      {/* Special Quota */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          Special Reservation Quota
                        </label>
                        <select
                          value={selectedSpecialQuota}
                          onChange={(e) => setSelectedSpecialQuota(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        >
                          {SPECIAL_RESERVATION_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400">
                    Calculated against 71,646 student allotment decisions
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Allotments...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Find My Colleges</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RESULTS SECTION */}
            {analysisResults && (
              <div className="space-y-4">
                {/* Result Summary Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>Your Historical College Matches</span>
                      <span className="text-xs font-normal text-slate-400">
                        (Rank #{analysisResults.appliedFilter.rank.toLocaleString()} | {analysisResults.appliedFilter.category} | {analysisResults.appliedFilter.gender === 'F' ? 'Female' : 'Male'} | {analysisResults.appliedFilter.branch})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evaluated across {analysisResults.summary.analyzedCollegesCount} colleges. Matching records reflect real candidate ranks from the 2026 allotment records.
                    </p>
                  </div>

                  {/* Quick Filter Tabs / Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeFilterTab === 'ALL'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      All Matches ({analysisResults.summary.totalMatches})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('WITHIN')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeFilterTab === 'WITHIN'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Within Range ({analysisResults.summary.withinRangeCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('NEAR')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeFilterTab === 'NEAR'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/40'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Near Range ({analysisResults.summary.nearRangeCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('INSUFFICIENT')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeFilterTab === 'INSUFFICIENT'
                          ? 'bg-zinc-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                      Insufficient Data ({analysisResults.summary.insufficientDataCount})
                    </button>
                  </div>
                </div>

                {/* Controls: Sort and Compare Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div className="text-xs text-slate-400">
                    Showing <strong className="text-white">{visibleMatches.length}</strong> college &amp; branch combinations
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        Sort by:
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden"
                      >
                        <option value="SELECTIVE">Lowest Opening Rank (Most Selective)</option>
                        <option value="CLOSING_DESC">Highest Closing Rank</option>
                        <option value="CLOSEST_TO_RANK">Closest to My Rank</option>
                        <option value="NAME_ASC">College Name (A to Z)</option>
                      </select>
                    </div>

                    {comparedColleges.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCompareModalOpen(true)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Compare ({comparedColleges.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* MATCH CARDS LIST */}
                {visibleMatches.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No Matching Historical Records Found</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      No colleges in the 2026 dataset matched the selected filters. Try broadening your branch selection (e.g. choose &ldquo;All Branches&rdquo; or &ldquo;Any CS &amp; Allied&rdquo;) or resetting district filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleMatches.map(match => {
                      const isCompared = comparedColleges.some(c => c.id === match.id);
                      const isAddedToOptions = webOptionsList.some(o => o.id === match.id);

                      return (
                        <div
                          key={match.id}
                          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between space-y-4"
                        >
                          {/* Header: College Name, Code, Branch */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold">
                                    {match.collegeCode}
                                  </span>
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    {match.district}
                                  </span>
                                </div>
                                <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                                  {match.collegeName}
                                </h3>
                              </div>

                              {/* Classification Badge */}
                              <div
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shrink-0 ${match.badgeStyle.bg} ${match.badgeStyle.text} ${match.badgeStyle.border}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${match.badgeStyle.indicator}`}></span>
                                <span>{match.classificationLabel}</span>
                              </div>
                            </div>

                            {/* Branch Info */}
                            <div className="flex items-center gap-2 p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                              <GitBranch className="w-4 h-4 text-indigo-400 shrink-0" />
                              <div className="text-xs font-semibold text-slate-200 truncate">
                                {match.branchName} <span className="text-slate-400">({match.branchCode})</span>
                              </div>
                            </div>
                          </div>

                          {/* Data Matrix */}
                          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-950/80 rounded-xl border border-slate-800/60 text-center">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Observed Range
                              </div>
                              <div className="text-xs font-bold text-white font-mono mt-0.5">
                                {match.minObservedRank.toLocaleString()} – {match.maxObservedRank.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Med: #{match.medianObservedRank.toLocaleString()}
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Your Rank
                              </div>
                              <div className="text-xs font-bold text-blue-400 font-mono mt-0.5">
                                #{match.studentRank.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {match.rankBuffer >= 0 ? (
                                  <span className="text-emerald-400">+{match.rankBuffer.toLocaleString()} buffer</span>
                                ) : (
                                  <span className="text-amber-400">{match.rankBuffer.toLocaleString()} ranks</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Matching Records
                              </div>
                              <div className="text-xs font-bold text-white font-mono mt-0.5">
                                {match.matchingRecordCount}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Real 2026 seats
                              </div>
                            </div>
                          </div>

                          {/* "WHY THIS COLLEGE?" - 100% Data Grounded Explanation */}
                          <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-1">
                            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
                              <Info className="w-3 h-3 text-blue-400" />
                              Why this college?
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {match.whyExplanation}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Compare toggle */}
                              <button
                                type="button"
                                onClick={() => toggleCompare(match)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                  isCompared
                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                                }`}
                              >
                                <Scale className="w-3.5 h-3.5" />
                                <span>{isCompared ? 'Comparing' : '+ Compare'}</span>
                              </button>

                              {/* Add to strategy builder */}
                              <button
                                type="button"
                                onClick={() => addToWebOptions(match)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                  isAddedToOptions
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                                }`}
                              >
                                {isAddedToOptions ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added to List</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Web Options</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Connection to Allotment Explorer */}
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToAllotment) {
                                  onNavigateToAllotment(match.collegeCode, match.branchCode);
                                }
                              }}
                              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-500/30"
                            >
                              <span>View allotment records</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* WEB OPTIONS STRATEGY BUILDER VIEW */
          <div className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-blue-400" />
                  <span>Web Options Preference List</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Organize, reorder, and export your preferred college &amp; branch priority list for official TG EAPCET counselling.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportWebOptionsCSV}
                  disabled={webOptionsList.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Export Official CSV</span>
                </button>
                {webOptionsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setWebOptionsList([])}
                    className="px-3 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold transition-all border border-slate-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {webOptionsList.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <Layers className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">Your Web Options List is Empty</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click &ldquo;+ Web Options&rdquo; on any predicted college card to add it to your strategy list.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('predictor')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                >
                  Back to College Predictor
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">College</th>
                        <th className="px-4 py-3">Branch</th>
                        <th className="px-4 py-3 text-center">Observed Range</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {webOptionsList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-bold font-mono text-blue-400">
                            #{idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">{item.collegeCode}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.collegeName}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-slate-950 rounded text-slate-200 font-mono">
                              {item.branchCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-slate-200">
                            {item.minObservedRank.toLocaleString()} – {item.maxObservedRank.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeStyle.bg} ${item.badgeStyle.text} ${item.badgeStyle.border}`}>
                              {item.classificationLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onNavigateToAllotment) onNavigateToAllotment(item.collegeCode, item.branchCode);
                                }}
                                className="p-1 text-slate-400 hover:text-white"
                                title="View Allotment Records"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFromWebOptions(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-400"
                                title="Remove from list"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING COMPARE BAR (When items are selected) */}
      {comparedColleges.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 z-40 bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2 pl-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">
              {comparedColleges.length} College{comparedColleges.length > 1 ? 's' : ''} Selected
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Compare Side-by-Side
          </button>
          <button
            type="button"
            onClick={() => setComparedColleges([])}
            className="p-1 text-slate-400 hover:text-white"
            title="Clear compare selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARE MODAL */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  College Comparison Matrix ({comparedColleges.length} Colleges)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {/* College Code & Name */}
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider w-40 bg-slate-950/60">
                      College
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4 min-w-[200px]">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold text-xs">
                          {c.collegeCode}
                        </span>
                        <div className="font-bold text-white mt-1 text-xs">{c.collegeName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {c.district}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Branch */}
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Branch
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4">
                        <span className="font-semibold text-slate-200">{c.branchName}</span>
                        <span className="text-slate-400 text-[11px] ml-1">({c.branchCode})</span>
                      </td>
                    ))}
                  </tr>

                  {/* Classification */}
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Status
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.badgeStyle.bg} ${c.badgeStyle.text} ${c.badgeStyle.border}`}>
                          {c.classificationLabel}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Observed 2026 Range */}
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Observed 2026 Range
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4 font-mono font-bold text-white text-xs">
                        #{c.minObservedRank.toLocaleString()} – #{c.maxObservedRank.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Median Observed Rank */}
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Median Rank
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4 font-mono text-slate-300">
                        #{c.medianObservedRank.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Matching Records */}
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Matching Allotments
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4 font-bold text-white">
                        {c.matchingRecordCount} records
                      </td>
                    ))}
                  </tr>

                  {/* Category & Gender Quota */}
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Evaluated Quota
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4 text-slate-300 text-[11px]">
                        {c.quotaDescription}
                      </td>
                    ))}
                  </tr>

                  {/* Direct Actions */}
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Allotment Explorer
                    </td>
                    {comparedColleges.map(c => (
                      <td key={c.id} className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            if (onNavigateToAllotment) onNavigateToAllotment(c.collegeCode, c.branchCode);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <span>View Records</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
