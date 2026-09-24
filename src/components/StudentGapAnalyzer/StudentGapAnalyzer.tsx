import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  GraduationCap,
  RotateCcw,
  Target,
  Sparkles,
  Printer,
  ChevronRight,
  BookOpen,
  Briefcase,
  Clock,
  Layers,
  Award,
  AlertTriangle,
  FolderGit2,
  FileText,
  Search,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ALL_BRANCHES,
  ACADEMIC_STAGES,
  ALL_CAREERS,
  AcademicStage,
  PERSONAL_QUESTIONS,
  getCareersForBranch,
  selectAdaptiveQuestions,
  AdaptiveQuestion,
  CareerOption,
} from '../../data/gapAnalyzerData';
import {
  calculateCareerGap,
  GapAnalysisResult,
  StudentProfile,
} from '../../utils/gapAnalyzer';
import { VisualGapComparison } from './VisualGapComparison';
import { TopPrioritiesCard } from './TopPrioritiesCard';
import { WhatIfSimulator } from './WhatIfSimulator';

interface Props {
  onNavigateToRoadmaps?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToDsa?: () => void;
  onNavigateToVault?: () => void;
}

export const StudentGapAnalyzer: React.FC<Props> = ({
  onNavigateToRoadmaps,
  onNavigateToProjects,
  onNavigateToDsa,
  onNavigateToVault,
}) => {
  // Step 1: Branch & Academic Stage
  // Step 2: Target Career
  // Step 3: Personal Profile (6 universal questions)
  // Step 4: Main Assessment (Adaptive 12–18 questions, 1-at-a-time)
  // Step 5: Final Comprehensive Report
  const [step, setStep] = useState<number>(1);

  // Active student profile state
  const [profile, setProfile] = useState<StudentProfile>({
    branch: 'cse',
    academicStage: '1st Year – Sem 2',
    targetCareerId: 'software-engineer',
    personalAnswers: {
      confidence: 'confident',
      time_weekly: 'balanced',
      project_experience: 'tutorials',
      internship_experience: 'none',
      independent_learning: 'courses',
      explaining_work: 'prompted',
    },
    competencyAnswers: {},
  });

  // Search filter states for dropdowns
  const [branchSearch, setBranchSearch] = useState('');
  const [careerSearch, setCareerSearch] = useState('');
  const [showAllCareersModal, setShowAllCareersModal] = useState(false);

  // Assessment Question index in Step 4
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Final calculated result
  const [result, setResult] = useState<GapAnalysisResult | null>(null);

  // Active tab in final report
  const [activeReportTab, setActiveReportTab] = useState<
    'priorities' | 'matrix' | 'transition' | 'projects' | 'milestones' | 'whatif'
  >('priorities');

  // AI Mentor Brief state
  const [aiMentorNote, setAiMentorNote] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return ALL_BRANCHES;
    const q = branchSearch.toLowerCase();
    return ALL_BRANCHES.filter(
      (b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
    );
  }, [branchSearch]);

  // Branch-specific careers
  const branchCareers = useMemo(() => {
    return getCareersForBranch(profile.branch);
  }, [profile.branch]);

  // Filtered careers
  const filteredCareers = useMemo(() => {
    const pool = showAllCareersModal ? ALL_CAREERS : branchCareers;
    if (!careerSearch.trim()) return pool;
    const q = careerSearch.toLowerCase();
    return pool.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [careerSearch, branchCareers, showAllCareersModal]);

  // Adaptive questions for Step 4
  const adaptiveQuestions: AdaptiveQuestion[] = useMemo(() => {
    return selectAdaptiveQuestions(profile.branch, profile.targetCareerId, profile.academicStage);
  }, [profile.branch, profile.targetCareerId, profile.academicStage]);

  // Current active question
  const currentQuestion = adaptiveQuestions[activeQuestionIdx] || adaptiveQuestions[0];

  // Selected branch & career objects
  const selectedBranchObj = useMemo(
    () => ALL_BRANCHES.find((b) => b.id === profile.branch) || ALL_BRANCHES[0],
    [profile.branch]
  );
  const selectedCareerObj = useMemo(
    () => ALL_CAREERS.find((c) => c.id === profile.targetCareerId) || ALL_CAREERS[0],
    [profile.targetCareerId]
  );

  // When branch changes, ensure targetCareerId is valid for the new branch
  const handleSelectBranch = (branchId: string) => {
    const validCareers = getCareersForBranch(branchId);
    const hasCurrent = validCareers.some((c) => c.id === profile.targetCareerId);
    setProfile((prev) => ({
      ...prev,
      branch: branchId,
      targetCareerId: hasCurrent ? prev.targetCareerId : validCareers[0]?.id || 'software-engineer',
      competencyAnswers: {}, // reset answers for fresh assessment
    }));
  };

  // Keyboard navigation for Step 4 (options 1 to 5)
  useEffect(() => {
    if (step !== 4 || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1 to 5 numeric keys
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= currentQuestion.options.length) {
        const option = currentQuestion.options[num - 1];
        if (option) {
          handleSelectOption(option.numericWeight);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, activeQuestionIdx, currentQuestion]);

  // Record an answer in Step 4
  const handleSelectOption = (numericWeight: number) => {
    if (!currentQuestion) return;

    setProfile((prev) => ({
      ...prev,
      competencyAnswers: {
        ...prev.competencyAnswers,
        [currentQuestion.competencyId]: numericWeight,
        [currentQuestion.id]: numericWeight,
      },
    }));

    // Auto-advance to next question after small visual confirmation
    setTimeout(() => {
      if (activeQuestionIdx < adaptiveQuestions.length - 1) {
        setActiveQuestionIdx((prev) => prev + 1);
      } else {
        // Completed all questions -> calculate and move to Step 5
        finishAssessment();
      }
    }, 180);
  };

  // Finish assessment & trigger AI brief
  const finishAssessment = () => {
    const analysis = calculateCareerGap(profile);
    setResult(analysis);
    setStep(5);
    setActiveReportTab('priorities');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch AI Placement Advisor note
    setIsAiLoading(true);
    fetch('/api/gemini/gap-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentProfile: profile,
        gapAnalysisResult: analysis,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.mentorNote) {
          setAiMentorNote(data.mentorNote);
        }
      })
      .catch((err) => {
        console.warn('AI Advisor call fallback:', err);
      })
      .finally(() => {
        setIsAiLoading(false);
      });
  };

  // Reset entire assessment
  const handleReset = () => {
    setStep(1);
    setActiveQuestionIdx(0);
    setResult(null);
    setAiMentorNote(null);
    setProfile({
      branch: 'cse',
      academicStage: '1st Year – Sem 2',
      targetCareerId: 'software-engineer',
      personalAnswers: {
        confidence: 'confident',
        time_weekly: 'balanced',
        project_experience: 'tutorials',
        internship_experience: 'none',
        independent_learning: 'courses',
        explaining_work: 'prompted',
      },
      competencyAnswers: {},
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              AI Student Gap Analyzer
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Telangana &amp; Pan-India B.Tech Standards
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Branch-Aware Competency &amp; Placement Diagnostic
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Empirical skills audit tailored to your branch, academic year, and target career.
            Identify exact capability gaps, verifiable project requirements, and action milestones.
          </p>
        </div>

        {step > 1 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </button>
        )}
      </div>

      {/* STEP PROGRESS BAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {step}
            </span>
            <span>
              {step === 1 && 'Step 1: Branch & Academic Stage'}
              {step === 2 && 'Step 2: Target Career Pathway'}
              {step === 3 && 'Step 3: Personal Engineering Profile'}
              {step === 4 && `Step 4: Adaptive Skill Assessment (${activeQuestionIdx + 1}/${adaptiveQuestions.length})`}
              {step === 5 && 'Step 5: AI Student Gap Analysis Report'}
            </span>
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {step === 5 ? '100% Complete' : `${Math.round(((step - 1) / 4) * 100)}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 rounded-full"
            style={{
              width:
                step === 1
                  ? '20%'
                  : step === 2
                  ? '40%'
                  : step === 3
                  ? '60%'
                  : step === 4
                  ? `${60 + Math.round(((activeQuestionIdx + 1) / adaptiveQuestions.length) * 35)}%`
                  : '100%',
            }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: BRANCH & ACADEMIC STAGE */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Select Your Engineering Branch &amp; Semester Stage</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Assessment expectations adapt dynamically to your academic year and specialization domain.
            </p>
          </div>

          {/* 1. Branch Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Engineering Branch (26 Options Available)
              </label>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                  placeholder="Filter branch..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredBranches.map((b) => {
                const isSelected = profile.branch === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBranch(b.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-sm">{b.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                        {b.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Academic Stage Selector */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              2. Academic Stage / Current Semester
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {ACADEMIC_STAGES.map((stage) => {
                const isSelected = profile.academicStage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, academicStage: stage }))}
                    className={`px-3 py-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Stage calibrates the benchmark: early semesters evaluate core syntax and problem solving; late semesters evaluate production architecture and interview readiness.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500">
              Selected: <strong className="text-slate-800 dark:text-slate-200">{selectedBranchObj.name}</strong> • <strong className="text-indigo-600 dark:text-indigo-400">{profile.academicStage}</strong>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Continue to Target Career</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: TARGET CAREER */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Choose Your Target Career for {selectedBranchObj.name}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The career options below are curated specifically for {selectedBranchObj.name} graduates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAllCareersModal(!showAllCareersModal)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{showAllCareersModal ? 'Show Branch-Native Roles' : 'Explore Cross-Branch Careers'}</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={careerSearch}
              onChange={(e) => setCareerSearch(e.target.value)}
              placeholder="Search career role (e.g., Software Engineer, Embedded, CAD, Structural, Data Analyst)..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Career Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredCareers.map((c) => {
              const isSelected = profile.targetCareerId === c.id;
              const isCrossBranch =
                (selectedBranchObj.category === 'mechanical_aero' ||
                  selectedBranchObj.category === 'civil_infra' ||
                  selectedBranchObj.category === 'chemical_bio' ||
                  selectedBranchObj.category === 'agri_food') &&
                (c.domain === 'software' || c.domain === 'data' || c.domain === 'cyber');

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setProfile((prev) => ({ ...prev, targetCareerId: c.id }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-extrabold text-sm">{c.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {c.category}
                      </span>
                      {isCrossBranch && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                          Branch Transition
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
                    {c.typicalTools.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Branch</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Continue to Profile Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: PERSONAL PROFILE (6 UNIVERSAL QUESTIONS) */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Personal Engineering Profile (6 Quick Questions)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select the option that best reflects your current practical circumstances.
            </p>
          </div>

          <div className="space-y-6">
            {PERSONAL_QUESTIONS.map((pq, qIdx) => {
              const currentVal = profile.personalAnswers?.[pq.id as keyof typeof profile.personalAnswers];

              return (
                <div key={pq.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {pq.label}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-7 mt-0.5">
                      {pq.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-7">
                    {pq.options.map((opt) => {
                      const isSelected = currentVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setProfile((prev) => ({
                              ...prev,
                              personalAnswers: {
                                ...prev.personalAnswers,
                                [pq.id]: opt.value,
                              },
                            }));
                          }}
                          className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Career</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveQuestionIdx(0);
                setStep(4);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Begin Adaptive Skill Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: MAIN ADAPTIVE ASSESSMENT (ONE QUESTION AT A TIME) */}
      {/* ========================================================================= */}
      {step === 4 && currentQuestion && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs space-y-6">
          {/* Question Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                {currentQuestion.category.toUpperCase()} COMPETENCY
              </span>
              <span className="text-xs text-slate-400">
                • {currentQuestion.competencyName}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Question {activeQuestionIdx + 1} of {adaptiveQuestions.length}
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {currentQuestion.prompt}
            </h3>
            {currentQuestion.helperText && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 {currentQuestion.helperText}
              </p>
            )}
          </div>

          {/* Options (Practical ability levels) */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, oIdx) => {
              const currentRecorded =
                profile.competencyAnswers[currentQuestion.competencyId] ??
                profile.competencyAnswers[currentQuestion.id];
              const isSelected = currentRecorded === opt.numericWeight;

              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(opt.numericWeight)}
                  className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950 group-hover:text-indigo-700">
                      {oIdx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {opt.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={activeQuestionIdx === 0}
              onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Tip: Press keyboard keys <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[10px]">1</kbd> - <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[10px]">{currentQuestion.options.length}</kbd> to select
            </span>

            {activeQuestionIdx < adaptiveQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveQuestionIdx((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishAssessment}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>Generate Diagnostic Report</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: FINAL COMPREHENSIVE REPORT */}
      {/* ========================================================================= */}
      {step === 5 && result && (
        <div className="space-y-6">
          {/* 1. REPORT HERO HEADER */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    AI STUDENT GAP ANALYSIS
                  </span>
                  <span className="text-xs text-slate-300">
                    Empirical Diagnostic
                  </span>
                  {result.isCareerTransition && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      Cross-Branch Career Transition
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {result.careerTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <span>Branch: <strong className="text-white">{result.branchName}</strong></span>
                  <span>•</span>
                  <span>Academic Stage: <strong className="text-white">{result.academicStage}</strong></span>
                  <span>•</span>
                  <span>Track: <strong className="text-indigo-300">{result.careerTagline}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* Career Readiness Snapshot (Transparent, qualitative - NO fake percentage) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 block">
                      Career Readiness Snapshot
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {result.readinessSnapshot.statusLabel}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-slate-300 block text-[11px]">Strong Foundations</span>
                    <strong className="text-emerald-400 font-extrabold text-sm">{result.readinessSnapshot.strengthsCount} Verified</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300 block text-[11px]">Priority Gaps</span>
                    <strong className="text-rose-400 font-extrabold text-sm">{result.readinessSnapshot.gapsCount} To Close</strong>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {result.readinessSnapshot.summary}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{result.readinessSnapshot.proofStatus}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{result.readinessSnapshot.timeCommitmentAdvice}</span>
                </span>
              </div>
            </div>

            {/* AI Placement Advisor Brief */}
            <div className="p-4 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Technical Placement Mentor Brief:</span>
                {isAiLoading && <span className="text-[10px] text-indigo-300 animate-pulse">(Generating personalized insights...)</span>}
              </div>
              <p className="text-indigo-100 leading-relaxed">
                {aiMentorNote || `As a ${result.academicStage} student in ${result.branchName} targeting ${result.careerTitle}, your foundations are forming cleanly. Focus your immediate effort on closing your #1 priority gap: ${result.priorityGaps[0]?.skillName || 'core algorithms'} with hands-on practice, and you will establish verifiable placement readiness ahead of schedule.`}
              </p>
            </div>
          </div>

          {/* 2. REPORT NAVIGATION TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveReportTab('priorities')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeReportTab === 'priorities'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <span>🔥 Priority Gaps ({result.priorityGaps.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeReportTab === 'matrix'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <span>📊 Competency Visual Matrix</span>
            </button>

            {result.isCareerTransition && (
              <button
                type="button"
                onClick={() => setActiveReportTab('transition')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeReportTab === 'transition'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900'
                }`}
              >
                <span>⚡ Career Transition Analysis</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveReportTab('projects')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeReportTab === 'projects'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <span>🛠️ Recommended Projects ({result.recommendedProjects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('milestones')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeReportTab === 'milestones'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <span>🗓️ Action Milestones (7/30/90 Days)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('whatif')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeReportTab === 'whatif'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900'
              }`}
            >
              <span>✨ What-If? Simulator</span>
            </button>
          </div>

          {/* 3. TAB CONTENT */}
          {/* TAB 1: PRIORITY GAPS */}
          {activeReportTab === 'priorities' && (
            <div className="space-y-6">
              <TopPrioritiesCard
                priorities={result.priorityGaps}
                nextActions={result.actionMilestones.next7Days}
                branchId={result.branchId}
                onNavigateToRoadmaps={onNavigateToRoadmaps}
                onNavigateToProjects={onNavigateToProjects}
                onNavigateToDsa={onNavigateToDsa}
                onNavigateToVault={onNavigateToVault}
              />

              {/* Categorized Gaps Diagnostics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Core Gaps */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>Academic &amp; Core Theoretical Gaps</span>
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                    {result.categorizedGaps.academicCoreGaps.length > 0 ? (
                      result.categorizedGaps.academicCoreGaps.map((g, idx) => <li key={idx}>{g}</li>)
                    ) : (
                      <li className="text-emerald-600 font-semibold">Core academic subjects meet stage expectations.</li>
                    )}
                  </ul>
                </div>

                {/* Project & Portfolio Gaps */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-purple-500" />
                    <span>Project &amp; Verifiable Proof Gaps</span>
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                    {result.categorizedGaps.projectGaps.length > 0 ? (
                      result.categorizedGaps.projectGaps.map((g, idx) => <li key={idx}>{g}</li>)
                    ) : (
                      <li className="text-emerald-600 font-semibold">Project proof meets current stage expectations.</li>
                    )}
                    {result.categorizedGaps.portfolioGaps.map((g, idx) => (
                      <li key={`p-${idx}`}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPETENCY VISUAL MATRIX */}
          {activeReportTab === 'matrix' && (
            <div className="space-y-6">
              <VisualGapComparison
                comparisons={result.comparisons}
                careerTitle={result.careerTitle}
              />
            </div>
          )}

          {/* TAB 3: CAREER TRANSITION ANALYSIS */}
          {activeReportTab === 'transition' && result.transitionDetails && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Cross-Branch Career Transition Blueprint
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transitioning from {result.transitionDetails.fromBranch} into {result.transitionDetails.toCareer}.
                  </p>
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
                <p className="font-bold mb-1">🧭 Strategic Transition Roadmap:</p>
                {result.transitionDetails.strategicAdvice}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transferable Strengths */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your Transferable Engineering Strengths</span>
                  </h4>
                  <ul className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 list-disc list-inside">
                    {result.transitionDetails.transferableStrengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Bridge Gaps */}
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Bridge Gaps to Overcome ATS Filter Bias</span>
                  </h4>
                  <ul className="text-xs text-rose-950 dark:text-rose-200 space-y-1.5 list-disc list-inside">
                    {result.transitionDetails.bridgeGaps.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECOMMENDED PROJECTS */}
          {activeReportTab === 'projects' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tailored Concrete Project Specs ({result.recommendedProjects.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Recruiters ignore tutorial to-do apps. Build these verified projects to provide empirical proof of mastery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {p.stageSuitability}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {p.shortSummary}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Key Tech / Tools:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {p.tools.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-[11px]">
                          Deliverable Proof for Resume/GitHub:
                        </span>
                        <p className="text-[11px] text-emerald-950 dark:text-emerald-200 mt-0.5">
                          {p.deliverableProof}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        💡 {p.whyThisMatters}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ACTION MILESTONES */}
          {activeReportTab === 'milestones' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Structured Milestone Action Plan</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Break down placement readiness into manageable 7, 30, and 90-day execution blocks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 7 Days */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      ⚡ Next 7 Days
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                      Immediate Quick Wins
                    </span>
                  </div>
                  <ul className="text-xs text-emerald-950 dark:text-emerald-200 space-y-2 list-disc list-inside">
                    {result.actionMilestones.next7Days.map((a, idx) => (
                      <li key={idx} className="leading-snug">{a}</li>
                    ))}
                  </ul>
                </div>

                {/* 30 Days */}
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                      🎯 Next 30 Days
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                      Core Foundations
                    </span>
                  </div>
                  <ul className="text-xs text-indigo-950 dark:text-indigo-200 space-y-2 list-disc list-inside">
                    {result.actionMilestones.next30Days.map((a, idx) => (
                      <li key={idx} className="leading-snug">{a}</li>
                    ))}
                  </ul>
                </div>

                {/* 90 Days */}
                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                      🏆 Next 90 Days
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                      Shipped Deliverable
                    </span>
                  </div>
                  <ul className="text-xs text-purple-950 dark:text-purple-200 space-y-2 list-disc list-inside">
                    {result.actionMilestones.next90Days.map((a, idx) => (
                      <li key={idx} className="leading-snug">{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Semester Holistic Goal */}
              <div className="p-4 rounded-xl bg-slate-900 text-white text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-indigo-300 font-extrabold uppercase text-[10px] block">
                    Semester Capstone Target:
                  </span>
                  <p className="font-bold text-slate-100 mt-0.5">
                    {result.actionMilestones.semesterGoal}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToRoadmaps}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Explore Full Curriculum
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: WHAT-IF SIMULATOR */}
          {activeReportTab === 'whatif' && (
            <WhatIfSimulator originalProfile={profile} />
          )}
        </div>
      )}
    </div>
  );
};

export default StudentGapAnalyzer;
