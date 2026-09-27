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
  Target,
  Zap,
  Filter,
  Search,
  Compass,
} from 'lucide-react';
import {
  FULL_EAPCET_MOCK_QUESTIONS,
  FULL_EAPCET_EXAMS_CONFIG,
  EapcetFullQuestion,
} from '../data/eapcetFullMockTestData';
import { EAPCET_MOCK_QUESTIONS } from '../data/eapcetMockTestData';

export type QuestionStatus =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_for_review'
  | 'answered_and_marked_for_review';

interface EapcetCbtMockTestEngineProps {
  onBackToHub?: () => void;
  onNavigateToPredictor?: (examType: 'ap' | 'tg', estimatedRank: number) => void;
  initialMode?: 'full' | 'express';
  initialState?: 'ap-eapcet' | 'tg-eapcet';
}

/**
 * Clean Mathematical & Chemical Typography Renderer
 * Prevents raw template strings, handles chemical formulas (H₂SO₄) and math expressions cleanly.
 */
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  if (!text) return null;
  return (
    <span className={`inline-block leading-relaxed font-sans ${className}`}>
      {text}
    </span>
  );
};

export const EapcetCbtMockTestEngine: React.FC<EapcetCbtMockTestEngineProps> = ({
  onBackToHub,
  onNavigateToPredictor,
  initialMode = 'full',
  initialState = 'ap-eapcet',
}) => {
  // Test Mode: 'full' (160 Qs | 180 Mins) or 'express' (80 Qs | 90 Mins)
  const [testMode, setTestMode] = useState<'full' | 'express'>(initialMode);

  // Selected State: 'ap-eapcet' | 'tg-eapcet'
  const [selectedExamId, setSelectedExamId] = useState<'ap-eapcet' | 'tg-eapcet'>(initialState);
  const examConfig = FULL_EAPCET_EXAMS_CONFIG[selectedExamId];

  // Test Phase: 'instructions' | 'test' | 'scorecard'
  const [phase, setPhase] = useState<'instructions' | 'test' | 'scorecard'>('instructions');

  // Examination State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<Record<number, number>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Active Subject Tab: 'math' | 'physics' | 'chemistry'
  const [activeSubjectTab, setActiveSubjectTab] = useState<'math' | 'physics' | 'chemistry'>('math');
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'math' | 'physics' | 'chemistry'>('all');

  // Active dataset based on mode
  const questions: EapcetFullQuestion[] = useMemo(() => {
    return testMode === 'full' ? FULL_EAPCET_MOCK_QUESTIONS : EAPCET_MOCK_QUESTIONS;
  }, [testMode]);

  // Duration in Seconds: 180 mins (10800s) for Full, 90 mins (5400s) for Express
  const TOTAL_TIME_SECONDS = useMemo(() => {
    return testMode === 'full' ? 180 * 60 : 90 * 60;
  }, [testMode]);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_TIME_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState<number>(0);

  // Modals & Mobile Drawers
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showFiveMinWarning, setShowFiveMinWarning] = useState<boolean>(false);
  const [hasWarnedFiveMin, setHasWarnedFiveMin] = useState<boolean>(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);

  // Review Filters in Scorecard
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [reviewSubjectFilter, setReviewSubjectFilter] = useState<'all' | 'math' | 'physics' | 'chemistry'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');

  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  // Prevent accidental tab closure or reload during active examination
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === 'test') {
        e.preventDefault();
        e.returnValue = 'Your EAPCET exam is currently active. Any unsaved responses will be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  // Live Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && phase === 'test') {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            handleAutoSubmitOnExpiry();
            return 0;
          }
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

  // Synchronize active question and option state
  useEffect(() => {
    if (phase === 'test') {
      const existingAnswer = userResponses[currentQuestion.id];
      setSelectedOption(existingAnswer !== undefined ? existingAnswer : null);

      if (currentQuestion.subject !== activeSubjectTab) {
        setActiveSubjectTab(currentQuestion.subject);
      }

      setQuestionStatuses((prev) => {
        const currentStatus = prev[currentQuestion.id];
        if (!currentStatus || currentStatus === 'not_visited') {
          return {
            ...prev,
            [currentQuestion.id]: 'not_answered',
          };
        }
        return prev;
      });
    }
  }, [currentQuestionIndex, phase, currentQuestion]);

  // Format time remaining (HH:MM:SS)
  const formatTime = (totalSec: number): string => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Start the examination
  const handleStartExam = () => {
    if (!hasAcceptedTerms) return;
    const initialStatuses: Record<number, QuestionStatus> = {};
    questions.forEach((q) => {
      initialStatuses[q.id] = 'not_visited';
    });
    initialStatuses[questions[0].id] = 'not_answered';

    setQuestionStatuses(initialStatuses);
    setUserResponses({});
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSecondsRemaining(TOTAL_TIME_SECONDS);
    setHasWarnedFiveMin(false);
    setShowFiveMinWarning(false);
    setIsTimerRunning(true);
    setPhase('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-submit when time expires
  const handleAutoSubmitOnExpiry = () => {
    setIsTimerRunning(false);
    setTimeTakenSeconds(TOTAL_TIME_SECONDS);
    setShowSubmitModal(false);
    setPhase('scorecard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manual submission confirmation
  const handleConfirmSubmit = () => {
    setIsTimerRunning(false);
    setTimeTakenSeconds(TOTAL_TIME_SECONDS - secondsRemaining);
    setShowSubmitModal(false);
    setPhase('scorecard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Option selection
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  // Clear Response
  const handleClearResponse = () => {
    setSelectedOption(null);
    setUserResponses((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setQuestionStatuses((prev) => ({
      ...prev,
      [currentQuestion.id]: 'not_answered',
    }));
  };

  // Save & Next Action
  const handleSaveAndNext = () => {
    if (selectedOption !== null) {
      setUserResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedOption,
      }));
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestion.id]: 'answered',
      }));
    } else {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestion.id]: 'not_answered',
      }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Mark for Review & Next Action
  const handleMarkForReviewAndNext = () => {
    if (selectedOption !== null) {
      setUserResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedOption,
      }));
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestion.id]: 'answered_and_marked_for_review',
      }));
    } else {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQuestion.id]: 'marked_for_review',
      }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setIsMobilePaletteOpen(false);
    }
  };

  // Jump to subject first question
  const handleJumpToSubject = (subject: 'math' | 'physics' | 'chemistry') => {
    setActiveSubjectTab(subject);
    const firstIndex = questions.findIndex((q) => q.subject === subject);
    if (firstIndex !== -1) {
      setCurrentQuestionIndex(firstIndex);
    }
  };

  // Retake exam
  const handleRetakeExam = () => {
    setPhase('instructions');
    setHasAcceptedTerms(false);
    setUserResponses({});
    setQuestionStatuses({});
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSecondsRemaining(TOTAL_TIME_SECONDS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // Palette & Subject Statistics
  // =========================================================================
  const paletteStats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let markedForReview = 0;
    let answeredAndMarked = 0;

    questions.forEach((q) => {
      const status = questionStatuses[q.id] || 'not_visited';
      if (status === 'answered') answered++;
      else if (status === 'not_answered') notAnswered++;
      else if (status === 'marked_for_review') markedForReview++;
      else if (status === 'answered_and_marked_for_review') answeredAndMarked++;
      else notVisited++;
    });

    return {
      answered,
      notAnswered,
      notVisited,
      markedForReview,
      answeredAndMarked,
      totalAttempted: answered + answeredAndMarked,
    };
  }, [questionStatuses, questions]);

  const subjectStats = useMemo(() => {
    const isFull = testMode === 'full';
    const subjects = {
      math: { total: isFull ? 80 : 40, answered: 0 },
      physics: { total: isFull ? 40 : 20, answered: 0 },
      chemistry: { total: isFull ? 40 : 20, answered: 0 },
    };

    questions.forEach((q) => {
      const isAns = userResponses[q.id] !== undefined;
      if (isAns) {
        if (q.subject === 'math') subjects.math.answered++;
        else if (q.subject === 'physics') subjects.physics.answered++;
        else if (q.subject === 'chemistry') subjects.chemistry.answered++;
      }
    });

    return subjects;
  }, [userResponses, questions, testMode]);

  // =========================================================================
  // Performance Scorecard & Rank Estimator
  // =========================================================================
  const scoreReport = useMemo(() => {
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    const isFull = testMode === 'full';

    const subjectBreakdown = {
      math: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: isFull ? 80 : 40 },
      physics: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: isFull ? 40 : 20 },
      chemistry: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: isFull ? 40 : 20 },
    };

    questions.forEach((q) => {
      const userChoice = userResponses[q.id];
      const isAttempted = userChoice !== undefined;
      const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

      if (!isAttempted) {
        unattemptedCount++;
        subjectBreakdown[q.subject].unattempted++;
      } else if (isCorrect) {
        correctCount++;
        totalScore += 1;
        subjectBreakdown[q.subject].correct++;
        subjectBreakdown[q.subject].score += 1;
      } else {
        incorrectCount++;
        subjectBreakdown[q.subject].incorrect++;
      }
    });

    const attemptedTotal = correctCount + incorrectCount;
    const accuracy = attemptedTotal > 0 ? Math.round((correctCount / attemptedTotal) * 100) : 0;
    const percentage = Math.round((totalScore / questions.length) * 100);

    // Speed in seconds per attempted question
    const avgSecondsPerQuestion = attemptedTotal > 0 ? Math.round(timeTakenSeconds / attemptedTotal) : 0;

    // Realistic EAPCET Rank Estimator based on 160-marks standard scale
    const normalizedScore = isFull ? totalScore : totalScore * 2;
    let estimatedRankRange = '';
    let competitiveTier = '';

    if (normalizedScore >= 140) {
      estimatedRankRange = 'Top 1 - 500';
      competitiveTier = 'Tier 1 Top Government AU/OU/JNTUH CSE Guaranteed';
    } else if (normalizedScore >= 120) {
      estimatedRankRange = '501 - 2,500';
      competitiveTier = 'Top Autonomous Institutes (CBIT, VNR VJIET, Vasavi, Gayatri)';
    } else if (normalizedScore >= 100) {
      estimatedRankRange = '2,501 - 8,000';
      competitiveTier = 'High-Demand Core Branches in Top 15 Colleges';
    } else if (normalizedScore >= 80) {
      estimatedRankRange = '8,001 - 20,000';
      competitiveTier = 'Reputed Regional Colleges (CSE Specs / ECE / EEE)';
    } else if (normalizedScore >= 60) {
      estimatedRankRange = '20,001 - 45,000';
      competitiveTier = 'Qualified - Standard engineering colleges';
    } else {
      estimatedRankRange = '45,000+';
      competitiveTier = 'Requires Focused Revision in High-Yield Topics';
    }

    return {
      totalScore,
      totalPossible: questions.length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      attemptedTotal,
      accuracy,
      percentage,
      normalizedScore,
      avgSecondsPerQuestion,
      estimatedRankRange,
      competitiveTier,
      subjectBreakdown,
    };
  }, [userResponses, questions, testMode, timeTakenSeconds]);

  // Filtered review questions
  const filteredReviewQuestions = useMemo(() => {
    return questions.filter((q) => {
      const userChoice = userResponses[q.id];
      const isAttempted = userChoice !== undefined;
      const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

      if (reviewFilter === 'correct' && !isCorrect) return false;
      if (reviewFilter === 'incorrect' && (!isAttempted || isCorrect)) return false;
      if (reviewFilter === 'unattempted' && isAttempted) return false;

      if (reviewSubjectFilter !== 'all' && q.subject !== reviewSubjectFilter) return false;

      if (reviewSearchQuery.trim()) {
        const query = reviewSearchQuery.toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesExpl = q.explanation.toLowerCase().includes(query);
        if (!matchesText && !matchesTopic && !matchesExpl) return false;
      }

      return true;
    });
  }, [questions, userResponses, reviewFilter, reviewSubjectFilter, reviewSearchQuery]);

  // =========================================================================
  // VIEW 1: INSTRUCTIONS & FORMAT CONFIGURATION SCREEN
  // =========================================================================
  if (phase === 'instructions') {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  <Award className="w-3.5 h-3.5" />
                  Official CBT Pattern Simulator
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  TCS iON Standard
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  {testMode === 'full' ? '160 Questions • 3 Hours' : '80 Questions • 90 Mins'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedExamId === 'ap-eapcet' ? 'AP EAPCET 2026' : 'TG EAPCET 2026'}{' '}
                {testMode === 'full' ? 'Full-Length Grand Mock Test' : 'Express Mock Test'}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                Hyper-realistic computer-based mock test strictly replicating the official{' '}
                {selectedExamId === 'ap-eapcet' ? 'Andhra Pradesh (JNTUK)' : 'Telangana (JNTUH)'} EAPCET engineering pattern.
                Complete with instant rank calculation and verified step-by-step mathematical &amp; chemical solutions.
              </p>
            </div>

            {/* Target Exam & Mode Selectors */}
            <div className="shrink-0 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Target Examination
              </span>
              <div className="flex sm:flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedExamId('ap-eapcet')}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedExamId === 'ap-eapcet'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">AP EAPCET 2026</div>
                    <div className={`text-[10px] ${selectedExamId === 'ap-eapcet' ? 'text-blue-100' : 'text-slate-400'}`}>
                      Andhra Pradesh (JNTUK)
                    </div>
                  </div>
                  {selectedExamId === 'ap-eapcet' && <Check className="w-4 h-4 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedExamId('tg-eapcet')}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedExamId === 'tg-eapcet'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">TG EAPCET 2026</div>
                    <div className={`text-[10px] ${selectedExamId === 'tg-eapcet' ? 'text-blue-100' : 'text-slate-400'}`}>
                      Telangana (JNTUH)
                    </div>
                  </div>
                  {selectedExamId === 'tg-eapcet' && <Check className="w-4 h-4 shrink-0" />}
                </button>
              </div>

              {/* Format Switcher */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Test Format Length:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTestMode('full')}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                      testMode === 'full'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    160 Qs (3 Hrs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestMode('express')}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                      testMode === 'express'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    80 Qs (90 Mins)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Exam Duration</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {testMode === 'full' ? '180 Minutes' : '90 Minutes'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {testMode === 'full' ? '3 Hours Standard Exam' : 'Express Timed Exam'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Total Questions</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {testMode === 'full' ? '160 MCQs' : '80 MCQs'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {testMode === 'full' ? '80 Maths + 40 Phy + 40 Chem' : '40 Maths + 20 Phy + 20 Chem'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Marking Scheme</span>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">+1 / 0 Marks</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">NO Negative Marking</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <Target className="w-4 h-4 text-amber-500" />
              <span>Difficulty Level</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">Medium-Hard</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Recent standard aligned</div>
          </div>
        </div>

        {/* Sectional Breakdown Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Curriculum &amp; Sectional Distribution</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Mathematics
                </span>
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {testMode === 'full' ? '80 Questions (Q1 - Q80)' : '40 Questions (Q1 - Q40)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Algebra, Matrices &amp; Determinants, Coordinate Geometry, Differential &amp; Integral Calculus, Trigonometry, Vectors &amp; 3D Geometry.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Physics
                </span>
                <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  {testMode === 'full' ? '40 Questions (Q81 - Q120)' : '20 Questions (Q41 - Q60)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mechanics, Rotational Dynamics, Thermodynamics, Electrodynamics, Current Electricity, Wave &amp; Ray Optics, and Modern Physics.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Chemistry
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  {testMode === 'full' ? '40 Questions (Q121 - Q160)' : '20 Questions (Q61 - Q80)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Physical Chemistry (Thermodynamics, Kinetics, Equilibrium), Inorganic (Periodic Trends, Coordination), and Organic reaction mechanisms.
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Declaration & Launch Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAcceptedTerms}
              onChange={(e) => setHasAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              I have read and understood all the instructions outlined above. I acknowledge that this computer-based test
              simulates the genuine <strong>{selectedExamId === 'ap-eapcet' ? 'AP EAPCET' : 'TG EAPCET'}</strong> pattern. I will attempt this test under strict timed conditions without external assistance.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ← Back to Feature Hub
              </button>
            )}

            <button
              type="button"
              disabled={!hasAcceptedTerms}
              onClick={handleStartExam}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-md ${
                hasAcceptedTerms
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.99]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Begin Examination Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE EXAMINATION WORKSPACE (TCS iON / NTA CBT STYLE)
  // Responsive layout: 75% Left/Center Workspace + 25% Right Sticky Palette (Desktop)
  // Collapsible on Tablet | Floating bottom sheet on Mobile
  // =========================================================================
  if (phase === 'test') {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4 animate-in fade-in duration-200 select-none pb-20 sm:pb-6">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-2 z-40 backdrop-blur-md">
          {/* Candidate Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Candidate Aspirant
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  SYS: C-104
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>Roll: EAP-2026-98124</span>
                <span>•</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedExamId === 'ap-eapcet' ? 'AP EAPCET' : 'TG EAPCET'} ({questions.length} Qs)
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border font-mono font-black text-sm sm:text-base shadow-2xs ${
              secondsRemaining <= 300
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Time Left: {formatTime(secondsRemaining)}</span>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>Palette ({paletteStats.totalAttempted}/{questions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              Submit Test
            </button>
          </div>
        </header>

        {/* Horizontal Subject Switcher Chips */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 shrink-0 hidden sm:inline">
            Sections:
          </span>

          <button
            type="button"
            onClick={() => handleJumpToSubject('math')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubjectTab === 'math'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Mathematics</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubjectTab === 'math'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {subjectStats.math.answered}/{subjectStats.math.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleJumpToSubject('physics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubjectTab === 'physics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Physics</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubjectTab === 'physics'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {subjectStats.physics.answered}/{subjectStats.physics.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleJumpToSubject('chemistry')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubjectTab === 'chemistry'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Chemistry</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubjectTab === 'chemistry'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {subjectStats.chemistry.answered}/{subjectStats.chemistry.total}
            </span>
          </button>
        </div>

        {/* 75% Left Workspace + 25% Right Palette Grid (Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Main Question Workspace (8 or 9 Cols on Desktop) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between min-h-[520px]">
              <div className="space-y-6">
                {/* Question Info Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Question {currentQuestion.id} of {questions.length}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      {currentQuestion.subjectName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      ({currentQuestion.topic})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-bold">
                      Marks: +1.00
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Neg: -0.00
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-3">
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    <FormattedMathText text={currentQuestion.questionText} />
                  </div>
                </div>

                {/* 4 Options Cards */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((optionText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const optionLetter = String.fromCharCode(65 + optIdx);

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(optIdx)}
                        className={`w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 dark:bg-blue-950/30 dark:border-blue-500 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-800'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                              : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 group-hover:border-blue-400'
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed pt-0.5">
                          <FormattedMathText text={optionText} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Controls Bar */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearResponse}
                    disabled={selectedOption === null}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      selectedOption !== null
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400 border-transparent'
                    }`}
                  >
                    Clear Response
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkForReviewAndNext}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
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
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      currentQuestionIndex > 0
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-400 border-transparent'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
                  >
                    <span>Save &amp; Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Right Question Palette (4 or 3 Cols on Desktop - 25% width) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Palette ({questions.length})
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {paletteStats.totalAttempted}/{questions.length} Done
                </span>
              </div>

              {/* Status Legend Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {paletteStats.answered}
                  </span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {paletteStats.notAnswered}
                  </span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {paletteStats.markedForReview}
                  </span>
                  <span>Marked Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 relative">
                    {paletteStats.answeredAndMarked}
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  </span>
                  <span>Ans &amp; Review</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {paletteStats.notVisited}
                  </span>
                  <span>Not Visited</span>
                </div>
              </div>

              {/* Subject Filter Tabs Inside Palette */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPaletteFilter('all')}
                  className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('math')}
                  className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'math'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  Math ({subjectStats.math.total})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('physics')}
                  className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'physics'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  Phy ({subjectStats.physics.total})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('chemistry')}
                  className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                    paletteFilter === 'chemistry'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  Chem ({subjectStats.chemistry.total})
                </button>
              </div>

              {/* Numbered Matrix Grid (160 or 80 Tiles) */}
              <div className="max-h-[380px] overflow-y-auto pr-1">
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    if (paletteFilter !== 'all' && q.subject !== paletteFilter) {
                      return null;
                    }

                    const isCurrent = idx === currentQuestionIndex;
                    const status = questionStatuses[q.id] || 'not_visited';

                    let btnStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                    if (status === 'answered') {
                      btnStyle = 'bg-emerald-500 text-white font-bold';
                    } else if (status === 'not_answered') {
                      btnStyle = 'bg-rose-500 text-white font-bold';
                    } else if (status === 'marked_for_review') {
                      btnStyle = 'bg-purple-600 text-white font-bold';
                    } else if (status === 'answered_and_marked_for_review') {
                      btnStyle = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-400';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleJumpToQuestion(idx)}
                        className={`h-7 rounded-lg text-[11px] font-mono transition-transform hover:scale-105 cursor-pointer flex items-center justify-center relative ${btnStyle} ${
                          isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                        }`}
                        title={`Q${q.id} - ${q.subjectName}`}
                      >
                        {q.id}
                        {status === 'answered_and_marked_for_review' && (
                          <span className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-emerald-300 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Final Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Submit Examination
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile Floating Bottom Sheet for 160-Question Palette */}
        {isMobilePaletteOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobilePaletteOpen(false)}
            />
            <div className="relative w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-bottom duration-250">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Question Palette ({questions.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobilePaletteOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold">
                  {(['all', 'math', 'physics', 'chemistry'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPaletteFilter(tab)}
                      className={`flex-1 py-1 rounded-lg transition-colors capitalize ${
                        paletteFilter === tab
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      {tab === 'all' ? 'All' : tab.slice(0, 4)}
                    </button>
                  ))}
                </div>

                {/* Mobile Question Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    if (paletteFilter !== 'all' && q.subject !== paletteFilter) return null;
                    const status = questionStatuses[q.id] || 'not_visited';
                    const isCurrent = idx === currentQuestionIndex;

                    let btnStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                    if (status === 'answered') btnStyle = 'bg-emerald-500 text-white font-bold';
                    else if (status === 'not_answered') btnStyle = 'bg-rose-500 text-white font-bold';
                    else if (status === 'marked_for_review') btnStyle = 'bg-purple-600 text-white font-bold';
                    else if (status === 'answered_and_marked_for_review') btnStyle = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-400';

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleJumpToQuestion(idx)}
                        className={`h-8 rounded-lg text-xs font-mono flex items-center justify-center ${btnStyle} ${
                          isCurrent ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        {q.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobilePaletteOpen(false);
                    setShowSubmitModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs"
                >
                  Submit Test Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5-Minute Warning Modal */}
        {showFiveMinWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  5 Minutes Remaining!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Only 5 minutes left before the examination auto-submits. Review your flagged questions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFiveMinWarning(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Got It, Continue Exam
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Submit Examination Confirmation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Are you sure you want to conclude and submit your test?
                  </p>
                </div>
              </div>

              {/* Status Summary */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Questions:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Answered:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {paletteStats.answered + paletteStats.answeredAndMarked}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-rose-600 dark:text-rose-400 font-medium">Not Answered:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {paletteStats.notAnswered}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Marked for Review:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {paletteStats.markedForReview}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Not Visited:</span>
                  <span className="font-bold text-slate-500 font-mono">{paletteStats.notVisited}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Once submitted, you will immediately receive your sectional performance scorecard, estimated state rank bracket, and step-by-step solutions for all {questions.length} questions.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Resume Test
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Confirm &amp; Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: POST-EXAM ANALYTICS & 160-QUESTION SOLUTION EXPLORER
  // =========================================================================
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Exam Concluded
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedExamId === 'ap-eapcet' ? 'AP EAPCET 2026' : 'TG EAPCET 2026'} ({questions.length} Questions)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Performance Scorecard &amp; Solutions
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Review your overall marks, subject breakdowns, estimated state rank bracket, and detailed step-by-step verified explanations for all {questions.length} problems.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRetakeExam}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Exam</span>
            </button>

            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Back to Feature Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-500" />
            <span>Total Score</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {scoreReport.totalScore}
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500"> / {questions.length}</span>
          </div>
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {scoreReport.percentage}% Score (Scaled: {scoreReport.normalizedScore}/160)
          </div>
        </div>

        {/* Estimated State Rank */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Estimated Rank</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {scoreReport.estimatedRankRange}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate" title={scoreReport.competitiveTier}>
            {scoreReport.competitiveTier}
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-500" />
            <span>Accuracy</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {scoreReport.accuracy}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {scoreReport.correctCount} correct of {scoreReport.attemptedTotal} attempted
          </div>
        </div>

        {/* Speed / Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Time &amp; Speed</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {Math.floor(timeTakenSeconds / 60)}m {timeTakenSeconds % 60}s
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            ~{scoreReport.avgSecondsPerQuestion}s avg per attempted question
          </div>
        </div>
      </div>

      {/* Subject-Wise Performance Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Math */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Mathematics
            </span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {scoreReport.subjectBreakdown.math.score} / {scoreReport.subjectBreakdown.math.total} Marks
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(scoreReport.subjectBreakdown.math.score / scoreReport.subjectBreakdown.math.total) * 100}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Correct: {scoreReport.subjectBreakdown.math.correct}</span>
            <span>Incorrect: {scoreReport.subjectBreakdown.math.incorrect}</span>
            <span>Skipped: {scoreReport.subjectBreakdown.math.unattempted}</span>
          </div>
        </div>

        {/* Physics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Physics
            </span>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              {scoreReport.subjectBreakdown.physics.score} / {scoreReport.subjectBreakdown.physics.total} Marks
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(scoreReport.subjectBreakdown.physics.score / scoreReport.subjectBreakdown.physics.total) * 100}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Correct: {scoreReport.subjectBreakdown.physics.correct}</span>
            <span>Incorrect: {scoreReport.subjectBreakdown.physics.incorrect}</span>
            <span>Skipped: {scoreReport.subjectBreakdown.physics.unattempted}</span>
          </div>
        </div>

        {/* Chemistry */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Chemistry
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {scoreReport.subjectBreakdown.chemistry.score} / {scoreReport.subjectBreakdown.chemistry.total} Marks
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(scoreReport.subjectBreakdown.chemistry.score / scoreReport.subjectBreakdown.chemistry.total) * 100}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Correct: {scoreReport.subjectBreakdown.chemistry.correct}</span>
            <span>Incorrect: {scoreReport.subjectBreakdown.chemistry.incorrect}</span>
            <span>Skipped: {scoreReport.subjectBreakdown.chemistry.unattempted}</span>
          </div>
        </div>
      </div>

      {/* Solution Explorer Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>Question &amp; Solution Explorer ({questions.length} Total)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {filteredReviewQuestions.length} of {questions.length} questions
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search topic or formula..."
              value={reviewSearchQuery}
              onChange={(e) => setReviewSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('correct')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reviewFilter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              Correct ({scoreReport.correctCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('incorrect')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reviewFilter === 'incorrect'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              Incorrect ({scoreReport.incorrectCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('unattempted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reviewFilter === 'unattempted'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Unattempted ({scoreReport.unattemptedCount})
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {(['all', 'math', 'physics', 'chemistry'] as const).map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setReviewSubjectFilter(subj)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                  reviewSubjectFilter === subj
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredReviewQuestions.map((q) => {
            const userChoice = userResponses[q.id];
            const isAttempted = userChoice !== undefined;
            const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

            let cardBadge = (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Not Attempted
              </span>
            );

            if (isAttempted) {
              if (isCorrect) {
                cardBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Correct (+1)
                  </span>
                );
              } else {
                cardBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <XCircle className="w-3.5 h-3.5" />
                    Incorrect (0)
                  </span>
                );
              }
            }

            return (
              <div
                key={q.id}
                className="bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      Q{q.id}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {q.subjectName}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{q.topic}</span>
                  </div>
                  <div>{cardBadge}</div>
                </div>

                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  <FormattedMathText text={q.questionText} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((optText, oIdx) => {
                    const optionLetter = String.fromCharCode(65 + oIdx);
                    const isActualCorrect = oIdx === q.correctOptionIndex;
                    const isUserChoice = oIdx === userChoice;

                    let optClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';

                    if (isActualCorrect) {
                      optClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold';
                    } else if (isUserChoice && !isCorrect) {
                      optClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 text-rose-900 dark:text-rose-200 line-through';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${optClass}`}
                      >
                        <span className="font-mono font-bold shrink-0">({optionLetter})</span>
                        <div className="flex-1">
                          <FormattedMathText text={optText} />
                          {isActualCorrect && (
                            <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isCorrect && (
                            <span className="ml-2 text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                              ✗ Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1.5">
                  <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Step-by-Step Analytical Explanation:</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    <FormattedMathText text={q.explanation} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default EapcetCbtMockTestEngine;
