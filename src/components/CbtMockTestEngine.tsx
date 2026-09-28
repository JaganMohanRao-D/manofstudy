import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  ShieldCheck,
  Check,
  X,
  Menu,
  Sparkles,
  HelpCircle,
  Bookmark,
  ArrowRight,
  User,
  GraduationCap,
  Layers,
  FileCheck2,
  TrendingUp,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import {
  RELIANCE_SCHOLARSHIP_MOCK_TEST,
  MockQuestion,
} from '../data/cbtMockTestData';
import {
  CandidateOnboardingModal,
  CandidateProfile,
} from './CandidateOnboardingModal';
import { Maximize2, Minimize2, Printer, UserCheck } from 'lucide-react';

export type QuestionStatus =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_for_review'
  | 'answered_and_marked_for_review';

interface CbtMockTestEngineProps {
  onBackToHub?: () => void;
  onSwitchToEapcet?: () => void;
  onExamStatusChange?: (isActive: boolean) => void;
}

export const CbtMockTestEngine: React.FC<CbtMockTestEngineProps> = ({
  onBackToHub,
  onSwitchToEapcet,
  onExamStatusChange,
}) => {
  // Candidate Profile
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem('mos_cbt_candidate_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.fullName) return parsed;
      }
    } catch (e) {}
    return null;
  });
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Test Phase: 'instructions' | 'test' | 'scorecard'
  const [phase, setPhase] = useState<'instructions' | 'test' | 'scorecard'>('instructions');

  // Examination State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<Record<number, number>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Active section filter in question view
  const [activeSection, setActiveSection] = useState<'all' | 'verbal' | 'logical' | 'numerical'>('all');

  // Timer: 60 minutes = 3600 seconds
  const TOTAL_TIME_SECONDS = 3600;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_TIME_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Modals & Drawers
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showFiveMinWarning, setShowFiveMinWarning] = useState<boolean>(false);
  const [hasWarnedFiveMin, setHasWarnedFiveMin] = useState<boolean>(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);

  // Review Filters in Scorecard
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [reviewSectionFilter, setReviewSectionFilter] = useState<'all' | 'verbal' | 'logical' | 'numerical'>('all');

  const questions = RELIANCE_SCHOLARSHIP_MOCK_TEST;
  const currentQuestion = questions[currentQuestionIndex];

  // Prevent accidental tab closure or reload during active test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === 'test') {
        e.preventDefault();
        e.returnValue = 'Your exam is currently in progress. Any unsaved progress will be lost if you leave this page.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  // Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && phase === 'test') {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            handleAutoSubmitOnExpiry();
            return 0;
          }
          // 5-minute warning alert
          if (prev === 300 && !hasWarnedFiveMin) {
            setShowFiveMinWarning(true);
            setHasWarnedFiveMin(true);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, phase, hasWarnedFiveMin]);

  // Sync selectedOption state when currentQuestionIndex changes
  useEffect(() => {
    if (userResponses[currentQuestionIndex] !== undefined) {
      setSelectedOption(userResponses[currentQuestionIndex]);
    } else {
      setSelectedOption(null);
    }

    // If current question was 'not_visited', mark it as 'not_answered'
    if (
      phase === 'test' &&
      (!questionStatuses[currentQuestionIndex] || questionStatuses[currentQuestionIndex] === 'not_visited')
    ) {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'not_answered',
      }));
    }
  }, [currentQuestionIndex, phase]);

  // Notify App.tsx of active examination status
  useEffect(() => {
    if (onExamStatusChange) {
      onExamStatusChange(phase === 'test');
    }
  }, [phase, onExamStatusChange]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed', e);
    }
  };

  // Start Exam
  const handleStartExam = () => {
    if (!hasAcceptedTerms) return;
    if (!candidateProfile) {
      setIsOnboardingModalOpen(true);
      return;
    }
    executeStartExam();
  };

  const handleCandidateOnboardingConfirm = (profile: CandidateProfile) => {
    setCandidateProfile(profile);
    try {
      sessionStorage.setItem('mos_cbt_candidate_profile', JSON.stringify(profile));
    } catch (e) {}
    setIsOnboardingModalOpen(false);
    executeStartExam();
  };

  const executeStartExam = () => {
    // Initialize all statuses to 'not_visited', with question 0 as 'not_answered'
    const initialStatuses: Record<number, QuestionStatus> = {};
    for (let i = 0; i < questions.length; i++) {
      initialStatuses[i] = i === 0 ? 'not_answered' : 'not_visited';
    }

    setQuestionStatuses(initialStatuses);
    setUserResponses({});
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSecondsRemaining(TOTAL_TIME_SECONDS);
    setHasWarnedFiveMin(false);
    setIsTimerRunning(true);
    setPhase('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Save & Next
  const handleSaveAndNext = () => {
    if (selectedOption !== null) {
      // Save response
      setUserResponses((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedOption,
      }));
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'answered',
      }));
    } else {
      // No option selected
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'not_answered',
      }));
    }

    // Advance to next question if available
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Action: Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (selectedOption !== null) {
      setUserResponses((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedOption,
      }));
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'answered_and_marked_for_review',
      }));
    } else {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'marked_for_review',
      }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Action: Clear Response
  const handleClearResponse = () => {
    setSelectedOption(null);
    setUserResponses((prev) => {
      const next = { ...prev };
      delete next[currentQuestionIndex];
      return next;
    });

    const currentStatus = questionStatuses[currentQuestionIndex];
    if (currentStatus === 'answered_and_marked_for_review') {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'marked_for_review',
      }));
    } else {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'not_answered',
      }));
    }
  };

  // Action: Jump to Question from Palette
  const handleJumpToQuestion = (index: number) => {
    // If navigating away from unattempted current question, ensure it remains not_answered
    if (
      userResponses[currentQuestionIndex] === undefined &&
      questionStatuses[currentQuestionIndex] !== 'marked_for_review' &&
      questionStatuses[currentQuestionIndex] !== 'answered_and_marked_for_review'
    ) {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'not_answered',
      }));
    }

    setCurrentQuestionIndex(index);
    setIsMobilePaletteOpen(false);
  };

  // Action: Submit Examination
  const handleConfirmSubmit = () => {
    setIsTimerRunning(false);
    setShowSubmitModal(false);
    setPhase('scorecard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAutoSubmitOnExpiry = () => {
    setIsTimerRunning(false);
    setShowSubmitModal(false);
    setPhase('scorecard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake Examination
  const handleRetakeExam = () => {
    setPhase('instructions');
    setHasAcceptedTerms(false);
    setUserResponses({});
    setQuestionStatuses({});
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSecondsRemaining(TOTAL_TIME_SECONDS);
  };

  // Format Timer as HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Real-time Palette Counts
  const paletteCounts = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let markedForReview = 0;
    let answeredAndMarked = 0;

    for (let i = 0; i < questions.length; i++) {
      const status = questionStatuses[i] || 'not_visited';
      if (status === 'answered') answered++;
      else if (status === 'not_answered') notAnswered++;
      else if (status === 'marked_for_review') markedForReview++;
      else if (status === 'answered_and_marked_for_review') answeredAndMarked++;
      else notVisited++;
    }

    return {
      answered,
      notAnswered,
      notVisited,
      markedForReview,
      answeredAndMarked,
      totalAttempted: answered + answeredAndMarked,
    };
  }, [questionStatuses, questions.length]);

  // Performance Scorecard Metrics Calculation
  const scorecardMetrics = useMemo(() => {
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const sectionMetrics = {
      verbal: { total: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      logical: { total: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      numerical: { total: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
    };

    questions.forEach((q, idx) => {
      const userChoice = userResponses[idx];
      const isAttempted = userChoice !== undefined;
      const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

      sectionMetrics[q.section].total++;

      if (isAttempted) {
        if (isCorrect) {
          totalScore += 1;
          correctCount++;
          sectionMetrics[q.section].correct++;
          sectionMetrics[q.section].score += 1;
        } else {
          incorrectCount++;
          sectionMetrics[q.section].incorrect++;
        }
      } else {
        unattemptedCount++;
        sectionMetrics[q.section].unattempted++;
      }
    });

    const attemptedTotal = correctCount + incorrectCount;
    const accuracy = attemptedTotal > 0 ? (correctCount / attemptedTotal) * 100 : 0;
    const percentage = (totalScore / questions.length) * 100;
    const timeSpentSeconds = TOTAL_TIME_SECONDS - secondsRemaining;

    // Scholarship likelihood assessment based on official Reliance Foundation cutoffs
    let likelihood: { level: string; color: string; desc: string } = {
      level: 'Strong Selection Likelihood',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      desc: 'Your score of 45+ places you in the top 10th percentile, making you an exceptionally strong candidate for the ₹2,00,000 Reliance Foundation Undergraduate Scholarship.',
    };

    if (totalScore < 30) {
      likelihood = {
        level: 'Needs Targeted Revision',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
        desc: 'Reliance Foundation scholarships typically require scores of 40+ to make the shortlisted merit tier. Review the full explanations below to strengthen your fundamentals.',
      };
    } else if (totalScore < 42) {
      likelihood = {
        level: 'Competitive / Borderline Cutoff',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        desc: 'You have a solid foundation but may be close to the regional cutoff boundary. A brief review of the numerical & logical reasoning tricks below can push you comfortably above 48.',
      };
    }

    return {
      totalScore,
      percentage,
      accuracy,
      correctCount,
      incorrectCount,
      unattemptedCount,
      timeSpentSeconds,
      sectionMetrics,
      likelihood,
    };
  }, [questions, userResponses, secondsRemaining]);

  // Filtered Questions in Review View
  const reviewQuestions = useMemo(() => {
    return questions.filter((q, idx) => {
      const userChoice = userResponses[idx];
      const isAttempted = userChoice !== undefined;
      const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

      // Filter by correctness
      if (reviewFilter === 'correct' && !isCorrect) return false;
      if (reviewFilter === 'incorrect' && (!isAttempted || isCorrect)) return false;
      if (reviewFilter === 'unattempted' && isAttempted) return false;

      // Filter by section
      if (reviewSectionFilter !== 'all' && q.section !== reviewSectionFilter) return false;

      return true;
    });
  }, [questions, userResponses, reviewFilter, reviewSectionFilter]);

  // =========================================================================
  // VIEW 1: PRE-EXAM INSTRUCTIONS SCREEN
  // =========================================================================
  if (phase === 'instructions') {
    return (
      <div id="cbt-instructions-container" className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Exam Selection Switcher */}
        {onSwitchToEapcet && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
              Available CBT Examinations:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-default"
              >
                Reliance Foundation Scholarship (60 Qs)
              </button>
              <button
                type="button"
                onClick={onSwitchToEapcet}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>EAPCET Engineering Mock (AP &amp; TG - 80 Qs)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Exam Title Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>CBT-Style Practice Format</span>
            </div>
            <div className="text-xs font-mono font-semibold text-[var(--mos-text-muted)]">
              Paper Code: RF-UG-APT-2026
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--mos-text-primary)] tracking-tight">
              Reliance Foundation Undergraduate Scholarship Aptitude Test
            </h1>
            <p className="mt-1 text-sm sm:text-base text-[var(--mos-text-secondary)]">
              A 60-minute, 60-question computer-based practice test designed to help you experience a structured aptitude-test environment.
            </p>
          </div>

          {/* Key Exam Meta Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)] block">Duration</span>
              <span className="text-lg font-black text-[var(--mos-text-primary)]">60 Minutes</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)] block">Total Questions</span>
              <span className="text-lg font-black text-[var(--mos-text-primary)]">60 MCQs</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)] block">Maximum Marks</span>
              <span className="text-lg font-black text-[var(--mos-text-primary)]">60 Marks</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Marking Scheme</span>
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                +1 Mark, NO Negative
              </span>
            </div>
          </div>
        </div>

        {/* Sectional Breakdown & Question Palette Legend Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sectional Distribution */}
          <div className="p-6 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[var(--mos-text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Sectional Weightage (3 Core Sections)</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--mos-text-primary)]">Section 1: Verbal Ability</h3>
                  <p className="text-[11px] text-[var(--mos-text-muted)]">Grammar, comprehension, vocabulary, idioms</p>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[var(--mos-surface)] border border-[var(--mos-border)] text-[var(--mos-text-primary)]">
                  20 Qs (20 Marks)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--mos-text-primary)]">Section 2: Analytical &amp; Logical Ability</h3>
                  <p className="text-[11px] text-[var(--mos-text-muted)]">Puzzles, series, syllogisms, blood relations</p>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[var(--mos-surface)] border border-[var(--mos-border)] text-[var(--mos-text-primary)]">
                  20 Qs (20 Marks)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--mos-text-primary)]">Section 3: Numerical Ability</h3>
                  <p className="text-[11px] text-[var(--mos-text-muted)]">Arithmetic, percentages, ratios, probability, series</p>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[var(--mos-surface)] border border-[var(--mos-border)] text-[var(--mos-text-primary)]">
                  20 Qs (20 Marks)
                </span>
              </div>
            </div>
          </div>

          {/* CBT Question Status Legend */}
          <div className="p-6 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[var(--mos-text-primary)] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-500" />
              <span>CBT Palette Status Legend</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="w-6 h-6 rounded-md bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  01
                </div>
                <span className="text-[var(--mos-text-secondary)] font-medium">Answered</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="w-6 h-6 rounded-md bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  02
                </div>
                <span className="text-[var(--mos-text-secondary)] font-medium">Not Answered</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="w-6 h-6 rounded-md bg-slate-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  03
                </div>
                <span className="text-[var(--mos-text-secondary)] font-medium">Not Visited</span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  04
                </div>
                <span className="text-[var(--mos-text-secondary)] font-medium">Marked for Review</span>
              </div>

              <div className="col-span-1 sm:col-span-2 flex items-center gap-2.5 p-2 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="relative w-6 h-6 rounded-md bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  05
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[var(--mos-surface)] rounded-full" />
                </div>
                <span className="text-[var(--mos-text-secondary)] font-medium">Answered &amp; Marked for Review (Evaluated)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Declaration & Launch Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-5">
          <div className="flex items-start gap-3">
            <input
              id="cbt-declaration-checkbox"
              type="checkbox"
              checked={hasAcceptedTerms}
              onChange={(e) => setHasAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="cbt-declaration-checkbox" className="text-xs sm:text-sm text-[var(--mos-text-secondary)] leading-relaxed cursor-pointer select-none">
              I have read and understood the instructions for this Reliance Foundation scholarship practice mock test.
              I understand that the test has a strict 60-minute countdown, contains 60 questions, and has NO negative marking.
              I am ready to begin my mock examination.
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-xs font-bold text-[var(--mos-text-secondary)] transition-all cursor-pointer"
              >
                ← Return to Feature Hub
              </button>
            )}

            <button
              type="button"
              id="cbt-start-exam-btn"
              disabled={!hasAcceptedTerms}
              onClick={handleStartExam}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                hasAcceptedTerms
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                  : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-muted)] cursor-not-allowed border border-[var(--mos-border)]'
              }`}
            >
              <span>I am Ready to Begin Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Candidate Setup Modal */}
        <CandidateOnboardingModal
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          examType="reliance"
          onConfirm={handleCandidateOnboardingConfirm}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE CBT EXAMINATION ENVIRONMENT
  // =========================================================================
  if (phase === 'test') {
    const isTimerLow = secondsRemaining < 300; // < 5 mins
    const isTimerWarning = secondsRemaining < 600; // < 10 mins

    return (
      <div id="cbt-active-examination" className="space-y-4 animate-in fade-in duration-150">
        {/* Top CBT Bar (NTA / TCS iON style) */}
        <header className="sticky top-2 z-30 p-3 sm:p-4 rounded-2xl bg-[var(--mos-surface)]/95 backdrop-blur-xl border border-[var(--mos-border)] shadow-md flex flex-wrap items-center justify-between gap-3">
          {/* Exam Title & Active Section Indicators */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-[var(--mos-text-primary)] leading-tight">
                Reliance Foundation Scholarship Test
              </h2>
              <div className="text-[11px] text-[var(--mos-text-muted)] flex items-center gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {candidateProfile?.fullName || 'Candidate'}
                </span>
                <span>•</span>
                <span className="font-mono">{candidateProfile?.rollNumber || 'MOS-2026-RF-7842'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">60 MCQs / 60 Mins</span>
              </div>
            </div>
          </div>

          {/* Section Switcher Tabs in Header */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-xs">
            <button
              type="button"
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-[var(--mos-surface)] text-[var(--mos-text-primary)] shadow-xs'
                  : 'text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)]'
              }`}
            >
              All Sections (60)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('verbal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'verbal'
                  ? 'bg-[var(--mos-surface)] text-[var(--mos-text-primary)] shadow-xs'
                  : 'text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)]'
              }`}
            >
              Verbal (20)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('logical')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'logical'
                  ? 'bg-[var(--mos-surface)] text-[var(--mos-text-primary)] shadow-xs'
                  : 'text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)]'
              }`}
            >
              Logical (20)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('numerical')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'numerical'
                  ? 'bg-[var(--mos-surface)] text-[var(--mos-text-primary)] shadow-xs'
                  : 'text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)]'
              }`}
            >
              Numerical (20)
            </button>
          </div>

          {/* Live Countdown Timer & Submit Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] text-xs font-semibold cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen CBT Mode'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span className="text-[11px]">{isFullscreen ? 'Window' : 'Fullscreen'}</span>
            </button>

            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-black ${
                isTimerLow
                  ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
                  : isTimerWarning
                  ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-[var(--mos-surface-muted)] border-[var(--mos-border)] text-[var(--mos-text-primary)]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Mobile Palette Toggle */}
            <button
              type="button"
              onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}
              className="lg:hidden p-2 rounded-xl bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-primary)] border border-[var(--mos-border)] cursor-pointer"
              title="Toggle Question Palette"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Submit Test
            </button>
          </div>
        </header>

        {/* Main CBT Grid: Question Console (Left/Center) + Question Palette (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left/Center Pane: Question Area (8 columns on desktop) */}
          <main className="lg:col-span-8 flex flex-col space-y-4">
            <div className="flex-1 p-5 sm:p-7 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-6 flex flex-col justify-between">
              {/* Question Header Row */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--mos-border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-[var(--mos-text-primary)]">
                      Question No. {currentQuestion.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] border border-[var(--mos-border)]">
                      {currentQuestion.sectionName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      +1.00 Marks
                    </span>
                    <span className="text-[var(--mos-text-muted)] bg-[var(--mos-surface-muted)] px-2 py-0.5 rounded-md border border-[var(--mos-border)]">
                      0.00 Negative
                    </span>
                  </div>
                </div>

                {/* Optional Passage Box for Reading Comprehension */}
                {currentQuestion.passage && (
                  <div className="p-4 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-xs sm:text-sm text-[var(--mos-text-secondary)] leading-relaxed space-y-2">
                    <div className="font-bold text-[var(--mos-text-primary)] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Reading Comprehension Context</span>
                    </div>
                    <p className="whitespace-pre-line">{currentQuestion.passage}</p>
                  </div>
                )}

                {/* Question Text */}
                <div className="text-sm sm:text-base font-bold text-[var(--mos-text-primary)] leading-relaxed whitespace-pre-line">
                  {currentQuestion.questionText}
                </div>

                {/* 4 Interactive Option Cards */}
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((option, oIdx) => {
                    const optionLetter = String.fromCharCode(65 + oIdx); // 'A', 'B', 'C', 'D'
                    const isSelected = selectedOption === oIdx;

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setSelectedOption(oIdx)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-[var(--mos-text-primary)] ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-[var(--mos-surface)] hover:bg-[var(--mos-surface-muted)] border-[var(--mos-border)] text-[var(--mos-text-primary)] hover:border-[var(--mos-border-strong)]'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] border-[var(--mos-border)]'
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
                          {option}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-6 border-t border-[var(--mos-border)] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearResponse}
                    disabled={selectedOption === null}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface)] hover:bg-[var(--mos-surface-muted)] text-xs font-semibold text-[var(--mos-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Clear Response
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkForReviewAndNext}
                    className="px-3.5 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold text-purple-700 dark:text-purple-300 transition-all cursor-pointer"
                  >
                    Mark for Review &amp; Next
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex((prev) => prev - 1);
                      }
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="p-2.5 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface)] hover:bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Previous Question"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    id="cbt-save-next-btn"
                    onClick={handleSaveAndNext}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Save &amp; Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Right Pane: Question Palette (4 columns on desktop, drawer on mobile) */}
          <aside
            className={`fixed lg:static inset-y-0 right-0 z-40 lg:z-auto w-80 sm:w-96 lg:w-auto lg:col-span-4 bg-[var(--mos-surface)] lg:bg-transparent border-l lg:border-l-0 border-[var(--mos-border)] shadow-2xl lg:shadow-none transition-transform duration-200 ${
              isMobilePaletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="h-full p-5 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-5 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Palette Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--mos-border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--mos-text-primary)]">Candidate Palette</div>
                      <div className="text-[10px] text-[var(--mos-text-muted)]">Question Navigation Grid</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMobilePaletteOpen(false)}
                    className="lg:hidden p-1.5 rounded-lg text-[var(--mos-text-muted)] hover:text-[var(--mos-text-primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Real-Time Status Legend Counters */}
                <div className="grid grid-cols-2 gap-2 text-[11px] py-3 border-b border-[var(--mos-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {paletteCounts.answered}
                    </span>
                    <span className="text-[var(--mos-text-secondary)]">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {paletteCounts.notAnswered}
                    </span>
                    <span className="text-[var(--mos-text-secondary)]">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-400 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {paletteCounts.notVisited}
                    </span>
                    <span className="text-[var(--mos-text-secondary)]">Not Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {paletteCounts.markedForReview}
                    </span>
                    <span className="text-[var(--mos-text-secondary)]">Marked Review</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="relative w-5 h-5 rounded bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {paletteCounts.answeredAndMarked}
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>
                    <span className="text-[var(--mos-text-secondary)]">Ans. &amp; Marked for Review</span>
                  </div>
                </div>

                {/* 60 Questions Button Matrix */}
                <div className="pt-3 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--mos-text-muted)]">
                    Choose a Question:
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => {
                      const status = questionStatuses[idx] || 'not_visited';
                      const isCurrent = idx === currentQuestionIndex;

                      // Color based on status
                      let bgClass = 'bg-slate-400 text-white';
                      if (status === 'answered') bgClass = 'bg-emerald-500 text-white';
                      else if (status === 'not_answered') bgClass = 'bg-rose-500 text-white';
                      else if (status === 'marked_for_review') bgClass = 'bg-purple-600 text-white';
                      else if (status === 'answered_and_marked_for_review') bgClass = 'bg-purple-600 text-white';

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => handleJumpToQuestion(idx)}
                          className={`relative h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${bgClass} ${
                            isCurrent ? 'ring-2 ring-sky-400 ring-offset-2 scale-105 z-10' : 'hover:opacity-90'
                          }`}
                        >
                          <span>{q.id}</span>
                          {status === 'answered_and_marked_for_review' && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Button inside Palette */}
              <div className="pt-4 border-t border-[var(--mos-border)]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Full Examination</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* 5-Minute Warning Toast Modal */}
        {showFiveMinWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--mos-overlay)] backdrop-blur-xs animate-in fade-in">
            <div className="p-6 rounded-3xl bg-[var(--mos-surface)] border border-amber-500/40 shadow-2xl max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--mos-text-primary)]">5 Minutes Remaining!</h3>
                <p className="text-xs text-[var(--mos-text-secondary)] mt-1">
                  You have less than 5 minutes left before the test auto-submits. Review your marked questions now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFiveMinWarning(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Continue Examination
              </button>
            </div>
          </div>
        )}

        {/* Final Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--mos-overlay)] backdrop-blur-xs animate-in fade-in">
            <div className="p-6 sm:p-7 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-2xl max-w-md w-full space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--mos-border)]">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-[var(--mos-text-primary)]">Confirm Examination Submission</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="p-1 rounded-lg text-[var(--mos-text-muted)] hover:text-[var(--mos-text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Summary Table */}
              <div className="rounded-2xl border border-[var(--mos-border)] overflow-hidden text-xs">
                <div className="p-2.5 bg-[var(--mos-surface-muted)] font-bold text-[var(--mos-text-secondary)] flex justify-between">
                  <span>Candidate Response Summary</span>
                  <span>Count</span>
                </div>
                <div className="divide-y divide-[var(--mos-border)] bg-[var(--mos-surface)] text-[var(--mos-text-primary)]">
                  <div className="p-2.5 flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Total Answered
                    </span>
                    <span className="font-bold font-mono">{paletteCounts.answered}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Not Answered
                    </span>
                    <span className="font-bold font-mono">{paletteCounts.notAnswered}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Marked for Review
                    </span>
                    <span className="font-bold font-mono">{paletteCounts.markedForReview}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Answered &amp; Marked for Review
                    </span>
                    <span className="font-bold font-mono">{paletteCounts.answeredAndMarked}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Not Visited
                    </span>
                    <span className="font-bold font-mono">{paletteCounts.notVisited}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[var(--mos-text-muted)] leading-relaxed">
                Are you sure you want to end your test? Once confirmed, you will be directed to your practice scorecard and question-by-question solution explorer.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-xs font-bold text-[var(--mos-text-secondary)] transition-all cursor-pointer"
                >
                  Cancel &amp; Resume
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Yes, Submit Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: COMPREHENSIVE SCORECARD & SOLUTION EXPLORER
  // =========================================================================
  return (
    <div id="cbt-scorecard-container" className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Executive Performance Scorecard Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Practice Mock Test Scorecard</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs print:hidden"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print / Download PDF Scorecard</span>
            </button>
            <div className="text-xs font-mono text-[var(--mos-text-muted)]">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Candidate Information Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)]">Candidate Name</div>
            <div className="font-black text-[var(--mos-text-primary)] text-sm mt-0.5">
              {candidateProfile?.fullName || 'Verified Candidate'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)]">Candidate Roll No</div>
            <div className="font-mono font-bold text-[var(--mos-text-primary)] text-xs mt-0.5">
              {candidateProfile?.rollNumber || 'MOS-2026-RF-7842'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)]">Exam Pattern</div>
            <div className="font-semibold text-[var(--mos-text-primary)] text-xs mt-0.5">
              Reliance UG Scholarship (60 Qs)
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)]">Status</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
              Completed
            </div>
          </div>
        </div>

        {/* Score Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)] block">Total Marks</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {scorecardMetrics.totalScore} <span className="text-sm font-normal text-[var(--mos-text-muted)]">/ 60</span>
            </div>
            <span className="text-[11px] text-[var(--mos-text-muted)] mt-0.5 block">
              {scorecardMetrics.percentage.toFixed(1)}% Aggregate
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)] block">Accuracy</span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--mos-text-primary)] font-mono">
              {scorecardMetrics.accuracy.toFixed(1)}%
            </div>
            <span className="text-[11px] text-[var(--mos-text-muted)] mt-0.5 block">
              {scorecardMetrics.correctCount} correct of {scorecardMetrics.correctCount + scorecardMetrics.incorrectCount} tried
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)] block">Time Spent</span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--mos-text-primary)] font-mono">
              {Math.floor(scorecardMetrics.timeSpentSeconds / 60)}m {scorecardMetrics.timeSpentSeconds % 60}s
            </div>
            <span className="text-[11px] text-[var(--mos-text-muted)] mt-0.5 block">of 60m allotted</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--mos-text-muted)] block">Questions Attempted</span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--mos-text-primary)] font-mono">
              {scorecardMetrics.correctCount + scorecardMetrics.incorrectCount} <span className="text-sm font-normal text-[var(--mos-text-muted)]">/ 60</span>
            </div>
            <span className="text-[11px] text-[var(--mos-text-muted)] mt-0.5 block">
              {scorecardMetrics.unattemptedCount} unattempted
            </span>
          </div>
        </div>

        {/* Scholarship Qualification Assessment Banner */}
        <div className={`p-4 rounded-2xl border ${scorecardMetrics.likelihood.color} space-y-1`}>
          <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>{scorecardMetrics.likelihood.level}</span>
          </div>
          <p className="text-xs leading-relaxed">{scorecardMetrics.likelihood.desc}</p>
        </div>

        {/* Sectional Breakdown Cards */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--mos-text-muted)]">
            Section-Wise Performance Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Verbal */}
            <div className="p-3.5 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] space-y-1.5">
              <span className="text-xs font-bold text-[var(--mos-text-primary)] block">Verbal Ability</span>
              <div className="text-xl font-black text-[var(--mos-text-primary)] font-mono">
                {scorecardMetrics.sectionMetrics.verbal.score} / 20
              </div>
              <div className="flex justify-between text-[11px] text-[var(--mos-text-muted)]">
                <span>Correct: {scorecardMetrics.sectionMetrics.verbal.correct}</span>
                <span>Wrong: {scorecardMetrics.sectionMetrics.verbal.incorrect}</span>
                <span>Skipped: {scorecardMetrics.sectionMetrics.verbal.unattempted}</span>
              </div>
            </div>

            {/* Logical */}
            <div className="p-3.5 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] space-y-1.5">
              <span className="text-xs font-bold text-[var(--mos-text-primary)] block">Analytical &amp; Logical</span>
              <div className="text-xl font-black text-[var(--mos-text-primary)] font-mono">
                {scorecardMetrics.sectionMetrics.logical.score} / 20
              </div>
              <div className="flex justify-between text-[11px] text-[var(--mos-text-muted)]">
                <span>Correct: {scorecardMetrics.sectionMetrics.logical.correct}</span>
                <span>Wrong: {scorecardMetrics.sectionMetrics.logical.incorrect}</span>
                <span>Skipped: {scorecardMetrics.sectionMetrics.logical.unattempted}</span>
              </div>
            </div>

            {/* Numerical */}
            <div className="p-3.5 rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] space-y-1.5">
              <span className="text-xs font-bold text-[var(--mos-text-primary)] block">Numerical Ability</span>
              <div className="text-xl font-black text-[var(--mos-text-primary)] font-mono">
                {scorecardMetrics.sectionMetrics.numerical.score} / 20
              </div>
              <div className="flex justify-between text-[11px] text-[var(--mos-text-muted)]">
                <span>Correct: {scorecardMetrics.sectionMetrics.numerical.correct}</span>
                <span>Wrong: {scorecardMetrics.sectionMetrics.numerical.incorrect}</span>
                <span>Skipped: {scorecardMetrics.sectionMetrics.numerical.unattempted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Retake & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="px-5 py-2.5 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-xs font-bold text-[var(--mos-text-secondary)] transition-all cursor-pointer"
            >
              ← Back to Feature Hub
            </button>
          )}

          <button
            type="button"
            onClick={handleRetakeExam}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Mock Test</span>
          </button>
        </div>
      </div>

      {/* Deep Review & Solution Explorer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--mos-text-primary)]">
              Deep Review &amp; Solution Explorer
            </h2>
            <p className="text-xs text-[var(--mos-text-muted)] mt-0.5">
              Examine your answers against verified solutions with step-by-step mathematical and logical steps.
            </p>
          </div>

          {/* Correctness Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                reviewFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] hover:bg-[var(--mos-border)]'
              }`}
            >
              All (60)
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('correct')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                reviewFilter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[var(--mos-surface-muted)] text-emerald-600 dark:text-emerald-400 hover:bg-[var(--mos-border)]'
              }`}
            >
              Correct ({scorecardMetrics.correctCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('incorrect')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                reviewFilter === 'incorrect'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-[var(--mos-surface-muted)] text-rose-600 dark:text-rose-400 hover:bg-[var(--mos-border)]'
              }`}
            >
              Incorrect ({scorecardMetrics.incorrectCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('unattempted')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                reviewFilter === 'unattempted'
                  ? 'bg-slate-500 text-white shadow-xs'
                  : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] hover:bg-[var(--mos-border)]'
              }`}
            >
              Skipped ({scorecardMetrics.unattemptedCount})
            </button>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] uppercase font-bold text-[var(--mos-text-muted)] shrink-0">Section:</span>
          {(['all', 'verbal', 'logical', 'numerical'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setReviewSectionFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer shrink-0 ${
                reviewSectionFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] hover:bg-[var(--mos-border)]'
              }`}
            >
              {s === 'all' ? 'All Sections' : s}
            </button>
          ))}
        </div>

        {/* List of Solution Cards */}
        <div className="space-y-4">
          {reviewQuestions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-[var(--mos-text-muted)] text-xs">
              No questions found for the selected filter combination.
            </div>
          ) : (
            reviewQuestions.map((q) => {
              const qIndex = q.id - 1;
              const userChoice = userResponses[qIndex];
              const isAttempted = userChoice !== undefined;
              const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/[.03]'
                      : isAttempted
                      ? 'border-rose-500/30 bg-rose-500/[.03]'
                      : 'border-[var(--mos-border)] bg-[var(--mos-surface)]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--mos-border)]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] border border-[var(--mos-border)]">
                        Q{q.id}
                      </span>
                      <span className="text-xs font-bold text-[var(--mos-text-primary)]">
                        {q.sectionName}
                      </span>
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1.00)
                        </span>
                      ) : isAttempted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (0.00)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/30">
                          Unattempted (0.00)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passage if applicable */}
                  {q.passage && (
                    <div className="p-3.5 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-xs text-[var(--mos-text-secondary)] whitespace-pre-line leading-relaxed">
                      {q.passage}
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="text-sm font-bold text-[var(--mos-text-primary)] leading-relaxed whitespace-pre-line">
                    {q.questionText}
                  </div>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isOptionCorrect = oIdx === q.correctOptionIndex;
                      const isOptionUserChoice = userChoice === oIdx;

                      let optClass = 'bg-[var(--mos-surface)] border-[var(--mos-border)] text-[var(--mos-text-secondary)]';

                      if (isOptionCorrect) {
                        optClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/30';
                      } else if (isOptionUserChoice && !isCorrect) {
                        optClass = 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${optClass}`}
                        >
                          <span className="w-6 h-6 rounded-md font-mono font-bold text-[11px] flex items-center justify-center shrink-0 bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Correct Answer
                            </span>
                          )}
                          {isOptionUserChoice && !isCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation */}
                  <div className="p-4 rounded-xl bg-sky-500/[.06] border border-sky-500/20 text-xs text-[var(--mos-text-secondary)] space-y-1.5 leading-relaxed">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Step-by-Step Solution &amp; Concept Explanation</span>
                    </div>
                    <p className="whitespace-pre-line">{q.explanation}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZERO-FAIL DEDICATED PRINT SHEET (Visible ONLY during print via CSS)       */}
      {/* ========================================================================= */}
      <div id="certificate-print-sheet" className="p-8 bg-white text-slate-900 border-4 border-slate-900 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              MOS
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-950">
                MAN OF STUDY - CBT SIMULATION PERFORMANCE REPORT
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                Reliance Foundation Undergraduate Scholarship — Practice Mock Test
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-600">
            <div>Report ID: {candidateProfile?.rollNumber || 'MOS-2026-RF'}</div>
            <div>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-center space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            Practice Mock Test Performance Report
          </div>
          <div className="text-base text-slate-800 leading-relaxed">
            <span className="font-black text-slate-950 underline decoration-slate-400 underline-offset-4">{candidateProfile?.fullName || 'Candidate'}</span> completed this <span className="font-black text-slate-950 text-xl">{scorecardMetrics.totalScore}</span> / <span className="font-bold text-slate-700">60 Marks</span> practice mock test based on the selected scholarship aptitude format. This report is generated by Man of Study for practice and reference only.
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 rounded-xl p-3 bg-white">
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Candidate Name</span><div className="font-black mt-0.5">{candidateProfile?.fullName || 'Candidate'}</div></div>
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Roll Number</span><div className="font-mono font-bold mt-0.5">{candidateProfile?.rollNumber || 'MOS-RF-2026'}</div></div>
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Evaluation Scheme</span><div className="font-semibold mt-0.5">60 MCQs (Verbal + Logical + Numerical)</div></div>
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Result Status</span><div className="font-black mt-0.5 text-emerald-700">COMPLETED ({scorecardMetrics.percentage.toFixed(1)}%)</div></div>
        </div>

        <table className="w-full text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800">
              <th className="border border-slate-300 p-2 text-left">Section</th>
              <th className="border border-slate-300 p-2 text-center">Max Marks</th>
              <th className="border border-slate-300 p-2 text-center">Attempted</th>
              <th className="border border-slate-300 p-2 text-center">Correct</th>
              <th className="border border-slate-300 p-2 text-center">Wrong</th>
              <th className="border border-slate-300 p-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-bold">Verbal Ability (Q1 – Q20)</td>
              <td className="border border-slate-300 p-2 text-center font-mono">20</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scorecardMetrics.sectionMetrics.verbal.attempted}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-bold">{scorecardMetrics.sectionMetrics.verbal.correct}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scorecardMetrics.sectionMetrics.verbal.incorrect}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono">{scorecardMetrics.sectionMetrics.verbal.score} / 20</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-bold">Logical Reasoning (Q21 – Q40)</td>
              <td className="border border-slate-300 p-2 text-center font-mono">20</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scorecardMetrics.sectionMetrics.logical.attempted}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-bold">{scorecardMetrics.sectionMetrics.logical.correct}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scorecardMetrics.sectionMetrics.logical.incorrect}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono">{scorecardMetrics.sectionMetrics.logical.score} / 20</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-bold">Numerical Ability (Q41 – Q60)</td>
              <td className="border border-slate-300 p-2 text-center font-mono">20</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scorecardMetrics.sectionMetrics.numerical.attempted}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-bold">{scorecardMetrics.sectionMetrics.numerical.correct}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scorecardMetrics.sectionMetrics.numerical.incorrect}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono">{scorecardMetrics.sectionMetrics.numerical.score} / 20</td>
            </tr>
            <tr className="bg-slate-50 font-black">
              <td className="border border-slate-300 p-2 font-black">Grand Total Score</td>
              <td className="border border-slate-300 p-2 text-center font-mono">60</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scorecardMetrics.attemptedCount}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700">{scorecardMetrics.correctCount}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scorecardMetrics.incorrectCount}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono text-sm text-blue-900">{scorecardMetrics.totalScore} / 60</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Accuracy Rate</span>
            <div className="font-black text-sm text-slate-900 mt-0.5">{scorecardMetrics.accuracy.toFixed(1)}%</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Time Spent</span>
            <div className="font-black text-sm text-slate-900 mt-0.5">{formatTime(scorecardMetrics.timeSpentSeconds)}</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Scholarship Readiness</span>
            <div className="font-black text-sm text-emerald-700 mt-0.5">
              {scorecardMetrics.percentage >= 60 ? 'Strong Practice Performance' : 'Practice Foundation'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-[10px] leading-relaxed text-slate-700">
          <div className="font-bold text-slate-900 mb-1">Important Note</div>
          <p>This is an independent practice mock test created to help students experience a computer-based exam environment. It is not an official Reliance Foundation examination, scorecard, certificate, or selection document. The questions, difficulty level, scoring experience, and results are for practice purposes only and may not represent the actual examination's difficulty, pattern, or selection process.</p>
        </div>

        <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 flex items-center justify-center font-black text-emerald-700 text-xs">
              ✓
            </div>
            <div>
              <div className="font-bold text-slate-900">PRACTICE TEST RECORD</div>
              <div className="text-[9px] text-slate-500">Man of Study Mock Test</div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-semibold text-slate-700 text-sm">Practice Performance Report</div>
            <div className="text-[9px] text-slate-500">Not an official examination document</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CbtMockTestEngine;
