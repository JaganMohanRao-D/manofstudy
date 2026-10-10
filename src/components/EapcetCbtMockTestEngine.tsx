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
  Maximize2,
  Minimize2,
  Printer,
  FileDown,
  UserCheck,
} from 'lucide-react';
import {
  FULL_EAPCET_MOCK_QUESTIONS,
  FULL_EAPCET_EXAMS_CONFIG,
  EapcetFullQuestion,
} from '../data/eapcetFullMockTestData';
import { EAPCET_MOCK_QUESTIONS } from '../data/eapcetMockTestData';
import {
  CandidateOnboardingModal,
  CandidateProfile,
  ExamType,
} from './CandidateOnboardingModal';
import { useAuth } from '../context/AuthContext';

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
  onExamStatusChange?: (isActive: boolean) => void;
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
  onExamStatusChange,
}) => {
  const { user } = useAuth();

  // Test Mode: 'full' (160 Qs | 180 Mins) or 'express' (80 Qs | 90 Mins)
  const [testMode, setTestMode] = useState<'full' | 'express'>(initialMode);

  // Selected State: 'ap-eapcet' | 'tg-eapcet'
  const [selectedExamId, setSelectedExamId] = useState<'ap-eapcet' | 'tg-eapcet'>(initialState);
  const examConfig = FULL_EAPCET_EXAMS_CONFIG[selectedExamId];

  // Candidate Setup Profile
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

  // Test Phase: 'instructions' | 'test' | 'scorecard'
  const [phase, setPhase] = useState<'instructions' | 'test' | 'scorecard'>('instructions');

  // Fullscreen State & Warning
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFullscreenExitedWarning, setShowFullscreenExitedWarning] = useState<boolean>(false);

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

  // Notify App.tsx when active testing starts/stops for distraction-free header/footer hiding
  useEffect(() => {
    if (onExamStatusChange) {
      onExamStatusChange(phase === 'test');
    }
  }, [phase, onExamStatusChange]);

  // Fullscreen change listener & accidental tab switch detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && phase === 'test') {
        setShowFullscreenExitedWarning(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'test') {
        setShowFullscreenExitedWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [phase]);

  // Toggle Fullscreen Mode
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setShowFullscreenExitedWarning(false);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed', err);
    }
  };

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

  // Launch Candidate Onboarding or Start Exam
  const handleInitiateStartExam = () => {
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

  // Start the examination
  const executeStartExam = () => {
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
    setShowFullscreenExitedWarning(false);
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
      setQuestionStatuses((prev) => {
        const cur = prev[currentQuestion.id];
        if (cur !== 'marked_for_review' && cur !== 'answered_and_marked_for_review') {
          return { ...prev, [currentQuestion.id]: 'not_answered' };
        }
        return prev;
      });
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

  // Jump to Question
  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setIsMobilePaletteOpen(false);
    }
  };

  // Switch Subject Tabs (jumps to the first question of that subject)
  const handleSelectSubjectTab = (subject: 'math' | 'physics' | 'chemistry') => {
    setActiveSubjectTab(subject);
    const targetIdx = questions.findIndex((q) => q.subject === subject);
    if (targetIdx !== -1) {
      setCurrentQuestionIndex(targetIdx);
    }
  };

  // Retake exam
  const handleRetakeExam = () => {
    setPhase('instructions');
    setUserResponses({});
    setQuestionStatuses({});
    setSelectedOption(null);
    setCurrentQuestionIndex(0);
    setHasAcceptedTerms(false);
  };

  // Palette Statistics
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
  // Performance Scorecard & Official State Rank Predictor
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

    // Standardized 160-Marks Scale:
    // If Full: totalScore (out of 160). If Express: totalScore * 2 (normalized to 160).
    const normalizedScore = isFull ? totalScore : totalScore * 2;

    // QUALIFYING CUTOFF RULE: Total Marks: 160. Cutoff: 40 Marks (25%).
    const isQualified = normalizedScore >= 40;

    // AP vs TG Calculation
    const isAp = selectedExamId === 'ap-eapcet';
    const interMarks = candidateProfile?.interMarks || 920;
    const maxInter = candidateProfile?.maxInterMarks || 1000;
    const interWeightageScore = (interMarks / maxInter) * 25; // 25% weightage

    // Normalized Combined Score for AP: 75% CBT Mock + 25% Inter Marks
    const cbt75Score = (normalizedScore / 160) * 75;
    const combinedScoreAp = Math.round((cbt75Score + interWeightageScore) * 100) / 100;

    let estimatedRankRange: string | null = null;
    let competitiveTier = '';

    if (!isQualified) {
      estimatedRankRange = null;
      competitiveTier = 'Not Qualified (Under official APSCHE & TGCHE admission statutes, minimum 40/160 marks required for rank assignment).';
    } else {
      if (isAp) {
        // AP EAPCET Rank Bracket based on 75:25 Combined Score (/100)
        if (combinedScoreAp >= 92) {
          estimatedRankRange = 'Top 1 – 500';
          competitiveTier = 'Tier 1 Top Government AU / JNTUK / JNTUA CSE Guaranteed';
        } else if (combinedScoreAp >= 85) {
          estimatedRankRange = '501 – 2,200';
          competitiveTier = 'Top Autonomous Institutes (Gayatri, VR Siddhartha, SVU CSE/IT)';
        } else if (combinedScoreAp >= 75) {
          estimatedRankRange = '2,201 – 7,500';
          competitiveTier = 'High-Demand Core Branches in Top 15 AP Colleges (GMRIT, Vishnu, RVR & JC)';
        } else if (combinedScoreAp >= 65) {
          estimatedRankRange = '7,501 – 18,000';
          competitiveTier = 'Reputed Regional Colleges (CSE Specializations / ECE / EEE)';
        } else if (combinedScoreAp >= 55) {
          estimatedRankRange = '18,001 – 38,000';
          competitiveTier = 'Quality Autonomous & Recognized Engineering Colleges';
        } else if (combinedScoreAp >= 45) {
          estimatedRankRange = '38,001 – 70,000';
          competitiveTier = 'Qualified - Standard Regional Engineering Colleges';
        } else {
          estimatedRankRange = '70,001 – 1,15,000';
          competitiveTier = 'Qualified - Pass Category Counseling Tier';
        }
      } else {
        // TG EAPCET Rank Bracket based on 100% CBT Marks (/160)
        if (normalizedScore >= 140) {
          estimatedRankRange = 'Top 1 – 400';
          competitiveTier = 'Tier 1 Top Government JNTUH Campus / OU College of Engg CSE';
        } else if (normalizedScore >= 120) {
          estimatedRankRange = '401 – 2,200';
          competitiveTier = 'Premier Autonomous Institutes (CBIT, VNR VJIET, Vasavi CSE/IT)';
        } else if (normalizedScore >= 100) {
          estimatedRankRange = '2,201 – 7,500';
          competitiveTier = 'High-Demand Seats in CVR, Vardhaman, MGIT, CBIT ECE';
        } else if (normalizedScore >= 80) {
          estimatedRankRange = '7,501 – 18,000';
          competitiveTier = 'Reputed Hyderabad Colleges (Gokaraju Rangaraju, BVRIT, KMIT)';
        } else if (normalizedScore >= 65) {
          estimatedRankRange = '18,001 – 35,000';
          competitiveTier = 'CMR, MLR, Marri Laxman Reddy, St. Martin\'s, VBIT';
        } else if (normalizedScore >= 50) {
          estimatedRankRange = '35,001 – 60,000';
          competitiveTier = 'Standard Accredited Engineering Institutes in Telangana';
        } else {
          estimatedRankRange = '60,001 – 95,000';
          competitiveTier = 'Qualified Band - State Engineering Counseling Eligible';
        }
      }
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
      isQualified,
      isAp,
      cbt75Score: Math.round(cbt75Score * 100) / 100,
      interMarks,
      maxInter,
      interWeightageScore: Math.round(interWeightageScore * 100) / 100,
      combinedScoreAp,
      estimatedRankRange,
      competitiveTier,
      subjectBreakdown,
    };
  }, [userResponses, questions, testMode, timeTakenSeconds, selectedExamId, candidateProfile]);

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
            <div className="shrink-0 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 min-w-[260px]">
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
                      75:25 Inter Weightage
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
                      100% Pure CBT Marks
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

        {/* Candidate Profile Verification Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Candidate Profile
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{candidateProfile?.fullName || 'Not Configured (Required for Scorecard & Certificate)'}</span>
                {candidateProfile && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {candidateProfile.rollNumber}
                  </span>
                )}
              </div>
              {selectedExamId === 'ap-eapcet' && candidateProfile?.interMarks && (
                <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                  AP Inter Marks: {candidateProfile.interMarks}/{candidateProfile.maxInterMarks} (25% Weightage: {candidateProfile.interWeightageScore?.toFixed(2)}/25)
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            {candidateProfile ? 'Edit Candidate Details' : 'Configure Candidate Details'}
          </button>
        </div>

        {/* Exam Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Duration</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {testMode === 'full' ? '180 Mins' : '90 Mins'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Live Countdown Timer
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Total Questions</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {testMode === 'full' ? '160 MCQs' : '80 MCQs'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {testMode === 'full' ? '80 M + 40 P + 40 C' : '40 M + 20 P + 20 C'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Marking Scheme</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              +1 / 0
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              NO Negative Marking
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Qualifying Cutoff</span>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              40 / 160
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              25% Minimum Required
            </div>
          </div>
        </div>

        {/* Official TCS iON CBT Instructions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>Official Examination Guidelines &amp; Question Palette Protocol</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please read the instructions carefully before entering the examination workspace.
            </p>
          </div>

          {/* Palette Color Codes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Question Palette Color Coding Scheme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Answered: Response saved successfully
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="w-7 h-7 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Not Answered: Visited but no option chosen
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Marked for Review: Flagged for rechecking
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 relative">
                  4
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Answered &amp; Marked for Review: Evaluated in final score
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 sm:col-span-2 lg:col-span-2">
                <span className="w-7 h-7 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Not Visited: You have not yet viewed this question
                </div>
              </div>
            </div>
          </div>

          {/* Test Regulations */}
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Key Instructions for Candidates:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Click on <strong>Save &amp; Next</strong> to lock in your answer and proceed to the next question.
              </li>
              <li>
                Click on <strong>Mark for Review &amp; Next</strong> if you want to flag the question for later verification.
              </li>
              <li>
                Click on <strong>Clear Response</strong> to deselect an answered option.
              </li>
              <li>
                You can switch between Mathematics, Physics, and Chemistry freely using the subject header tabs.
              </li>
              <li>
                The countdown timer in the top-right corner indicates remaining exam time. When it reaches 00:00:00, your test auto-submits.
              </li>
              <li>
                Click <strong>Fullscreen CBT Mode</strong> to lock out distractions and simulate real test center conditions.
              </li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAcceptedTerms}
                onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded mt-0.5 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                I have read, understood, and agreed to all examination instructions, qualifying cutoff criteria, and ranking rules. I confirm my candidate profile details are correct.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back to Mock Test Series
              </button>
            )}

            <button
              type="button"
              disabled={!hasAcceptedTerms}
              onClick={handleInitiateStartExam}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasAcceptedTerms
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Start Examination Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Candidate Intake Modal */}
        <CandidateOnboardingModal
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          examType={selectedExamId}
          examMode={testMode}
          onConfirm={handleCandidateOnboardingConfirm}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE TCS iON CBT EXAMINATION ROOM
  // =========================================================================
  if (phase === 'test') {
    return (
      <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white select-none relative flex flex-col justify-between">
        {/* Fullscreen Exited Warning Toast */}
        {showFullscreenExitedWarning && (
          <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Fullscreen exited. To maintain realistic exam proctoring conditions, please re-enter Fullscreen mode.</span>
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Enter Fullscreen
            </button>
          </div>
        )}

        {/* 1. Top Real CBT Header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="/Naa%20College%20logo.webp"
                alt="Naa College logo"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {selectedExamId === 'ap-eapcet' ? 'AP EAPCET 2026' : 'TG EAPCET 2026'}{' '}
                {testMode === 'full' ? 'Grand Test (160 Qs)' : 'Express Mock (80 Qs)'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <User className="w-3 h-3 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {user?.displayName || candidateProfile?.fullName || 'Candidate'}
                </span>
                <span>•</span>
                <span className="font-mono">{candidateProfile?.rollNumber || 'NC-CBT-2026'}</span>
              </div>
            </div>
          </div>

          {/* Right Header: Fullscreen Button, Live Countdown Timer, and Submit Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0"><div className="flex items-center gap-2 px-1.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Signed-in Google profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <span className="hidden sm:block max-w-[130px] truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">{user?.displayName || 'Google User'}</span>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen CBT Mode'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Windowed</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[11px]">Fullscreen Mode</span>
                </>
              )}
            </button>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm shadow-2xs border ${
                secondsRemaining <= 300
                  ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Submit Test Trigger */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              Submit Test
            </button>
          </div>
        </header>

        {/* 2. Subject Switcher Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Subjects:
            </span>

            <button
              type="button"
              onClick={() => handleSelectSubjectTab('math')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubjectTab === 'math'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <span>Mathematics</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                {subjectStats.math.answered}/{subjectStats.math.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubjectTab('physics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubjectTab === 'physics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <span>Physics</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                {subjectStats.physics.answered}/{subjectStats.physics.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubjectTab('chemistry')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubjectTab === 'chemistry'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <span>Chemistry</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                {subjectStats.chemistry.answered}/{subjectStats.chemistry.total}
              </span>
            </button>
          </div>

          {/* Mobile Palette Trigger */}
          <button
            type="button"
            onClick={() => setIsMobilePaletteOpen(true)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Palette ({paletteStats.totalAttempted}/{questions.length})</span>
          </button>
        </div>

        {/* 3. Main Split View: Question Area (Left/Center) + Question Palette (Right) */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Active Question Workspace (8 or 9 Cols on Desktop - 75% width) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Question {currentQuestion.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wider">
                    {currentQuestion.subjectName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {currentQuestion.topic}
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  +1.00 Mark | -0.00
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                <FormattedMathText text={currentQuestion.questionText} />
              </div>

              {/* 4 Radio Option Cards */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((optionText, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const optionLabel = ['A', 'B', 'C', 'D'][optIdx];

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleOptionSelect(optIdx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 dark:bg-blue-950/40 dark:border-blue-500 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {optionLabel}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 pt-0.5 flex-1">
                        <FormattedMathText text={optionText} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearResponse}
                    disabled={selectedOption === null && userResponses[currentQuestion.id] === undefined}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Clear Response
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkForReviewAndNext}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-200 transition-colors cursor-pointer"
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

              {/* Numbered Questions Grid Scroll Container */}
              <div className="max-h-[380px] overflow-y-auto pr-1">
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    if (paletteFilter !== 'all' && q.subject !== paletteFilter) return null;

                    const status = questionStatuses[q.id] || 'not_visited';
                    const isCurrent = idx === currentQuestionIndex;

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
                        className={`h-8 rounded-lg text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${btnStyle} ${
                          isCurrent ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 scale-105' : 'hover:opacity-90'
                        }`}
                        title={`Q${q.id} - ${q.subjectName}`}
                      >
                        {q.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sticky Submit Trigger inside Palette */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Conclude &amp; Submit
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile Slide-Over Question Palette Drawer */}
        {isMobilePaletteOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden animate-in fade-in">
            <div className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  Question Palette ({questions.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobilePaletteOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid inside Mobile Drawer */}
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
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
                Once submitted, you will immediately receive your official scorecard, state qualification evaluation, dynamic rank range prediction, and step-by-step solutions for all {questions.length} questions.
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
      {/* Printable Scorecard Section (Visible on screen and optimized for CSS print) */}
      <div id="cbt-printable-certificate" className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Official Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                Official Examination Scorecard
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Verifiable Assessment ID: {candidateProfile?.rollNumber || 'NC-CBT-2026-891042'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedExamId === 'ap-eapcet' ? 'AP EAPCET 2026' : 'TG EAPCET 2026'} Computer-Based Grand Test
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conducted in accordance with {selectedExamId === 'ap-eapcet' ? 'APSCHE (Andhra Pradesh)' : 'TGCHE (Telangana)'} engineering examination standards.
            </p>
          </div>

          {/* Action Buttons: Print PDF & Retake */}
          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Print official scorecard or save as PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print / Download PDF Scorecard</span>
            </button>

            <button
              type="button"
              onClick={handleRetakeExam}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>
        </div>

        {/* Candidate Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Candidate Name</div>
            <div className="font-black text-slate-900 dark:text-white text-sm mt-0.5">
              {candidateProfile?.fullName || 'Verified Candidate'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Hall Ticket / Roll No</div>
            <div className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5">
              {candidateProfile?.rollNumber || 'MOS-EAPCET-2026'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Exam Date</div>
            <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs mt-0.5">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Evaluation Scheme</div>
            <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs mt-0.5">
              {selectedExamId === 'ap-eapcet' ? '75% CBT + 25% Inter' : '100% CBT Merit'}
            </div>
          </div>
        </div>

        {/* Highlighted Aptitude Celebration Banner (if score > 50) */}
        {scoreReport.normalizedScore > 50 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-blue-500/15 to-emerald-500/15 border-2 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in">
            <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-black text-sm text-emerald-900 dark:text-emerald-100">
                🎉 Congratulations {candidateProfile?.fullName || 'Candidate'}! You demonstrated strong competitive aptitude.
              </div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Your score places you above the statewide competitive median for {selectedExamId === 'ap-eapcet' ? 'AP EAPCET' : 'TG EAPCET'} engineering aspirants.
              </div>
            </div>
          </div>
        )}

        {/* Qualification & State Rank Range Banner */}
        <div className="space-y-3">
          {scoreReport.isQualified ? (
            <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                      Result: QUALIFIED
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                      (Minimum qualifying mark 40/160 achieved)
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Estimated {selectedExamId === 'ap-eapcet' ? 'AP' : 'TG'} Rank Range: {scoreReport.estimatedRankRange}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {scoreReport.competitiveTier}
                  </div>
                </div>
              </div>

              {/* Action: Open College Predictor */}
              {onNavigateToPredictor && (
                <button
                  type="button"
                  onClick={() => onNavigateToPredictor(selectedExamId === 'ap-eapcet' ? 'ap' : 'tg', 5000)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 print:hidden cursor-pointer"
                >
                  Match Colleges with this Rank →
                </button>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100">
                    Result: Not Qualified
                  </span>
                  <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                    (Minimum qualifying mark is 40/160)
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Rank Range is NOT estimated for scores below the official 40-mark qualifying cutoff.
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  As per official APSCHE &amp; TGCHE admission regulations, candidates must score at least 40 out of 160 marks (25%) in the EAPCET exam to qualify for rank generation and state counseling allotments. Use the solution review below to identify topic gaps and retake the test.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AP 75:25 Weightage Matrix Breakdown (Shown specifically for AP EAPCET) */}
        {selectedExamId === 'ap-eapcet' && (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                AP EAPCET Official Weightage Calculation Breakdown
              </span>
              <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                Formula: (CBT Marks / 160 × 75) + (Inter Marks / Max Inter × 25)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold">1. CBT Mock Score</span>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {scoreReport.normalizedScore} / 160
                </div>
                <span className="text-blue-600 text-[10px] font-bold">75% Component: {scoreReport.cbt75Score} / 75</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold">2. Class 12 / Inter Score</span>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {scoreReport.interMarks} / {scoreReport.maxInter}
                </div>
                <span className="text-blue-600 text-[10px] font-bold">25% Component: {scoreReport.interWeightageScore} / 25</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold">3. Normalized Total</span>
                <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {scoreReport.combinedScoreAp} / 100
                </div>
                <span className="text-slate-500 text-[10px]">Combined Weightage</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold">4. State Rank Projection</span>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {scoreReport.isQualified ? scoreReport.estimatedRankRange : 'Not Qualified'}
                </div>
                <span className="text-slate-500 text-[10px]">Based on Combined Total</span>
              </div>
            </div>
          </div>
        )}

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Raw Score</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {scoreReport.totalScore} <span className="text-xs text-slate-400 font-semibold">/ {questions.length}</span>
            </div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">
              {scoreReport.percentage}% ({scoreReport.normalizedScore}/160 Scaled)
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Accuracy</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              {scoreReport.accuracy}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {scoreReport.correctCountCount} of {scoreReport.attemptedTotal} attempted
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Time Taken</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {Math.floor(timeTakenSeconds / 60)}m {timeTakenSeconds % 60}s
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ~{scoreReport.avgSecondsPerQuestion}s avg per attempted
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Questions Attempted</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {scoreReport.attemptedTotal} <span className="text-xs text-slate-400 font-semibold">/ {questions.length}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Skipped: {scoreReport.unattemptedCount}
            </div>
          </div>
        </div>

        {/* Subject-Wise Performance Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Math */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Mathematics
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {scoreReport.subjectBreakdown.math.score} / {scoreReport.subjectBreakdown.math.total} Marks
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(scoreReport.subjectBreakdown.math.score / scoreReport.subjectBreakdown.math.total) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Correct: {scoreReport.subjectBreakdown.math.correct}</span>
              <span>Incorrect: {scoreReport.subjectBreakdown.math.incorrect}</span>
              <span>Skipped: {scoreReport.subjectBreakdown.math.unattempted}</span>
            </div>
          </div>

          {/* Physics */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Physics
              </span>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                {scoreReport.subjectBreakdown.physics.score} / {scoreReport.subjectBreakdown.physics.total} Marks
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(scoreReport.subjectBreakdown.physics.score / scoreReport.subjectBreakdown.physics.total) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Correct: {scoreReport.subjectBreakdown.physics.correct}</span>
              <span>Incorrect: {scoreReport.subjectBreakdown.physics.incorrect}</span>
              <span>Skipped: {scoreReport.subjectBreakdown.physics.unattempted}</span>
            </div>
          </div>

          {/* Chemistry */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Chemistry
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {scoreReport.subjectBreakdown.chemistry.score} / {scoreReport.subjectBreakdown.chemistry.total} Marks
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(scoreReport.subjectBreakdown.chemistry.score / scoreReport.subjectBreakdown.chemistry.total) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Correct: {scoreReport.subjectBreakdown.chemistry.correct}</span>
              <span>Incorrect: {scoreReport.subjectBreakdown.chemistry.incorrect}</span>
              <span>Skipped: {scoreReport.subjectBreakdown.chemistry.unattempted}</span>
            </div>
          </div>
        </div>

        {/* Verification Footer (Certificate Footer) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Digital Certificate Verification Code: NC-CBT-CERT-{Date.now().toString(36).toUpperCase()}</span>
          </div>
          <div>Naa College AI Curriculum &amp; Examination Division</div>
        </div>
      </div>

      {/* 2. Detailed 160-Question Solution Review Engine (Hidden in Print) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>Step-by-Step Solutions &amp; Analytical Explanations</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review every problem with verified mathematical derivations and chemical formulas.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            Showing {filteredReviewQuestions.length} of {questions.length} Questions
          </div>
        </div>

        {/* Filter Chips & Subject Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('correct')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                reviewFilter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}
            >
              Correct ({scoreReport.correctCountCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('incorrect')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                reviewFilter === 'incorrect'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              Incorrect ({scoreReport.incorrectCountCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('unattempted')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                reviewFilter === 'unattempted'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
              }`}
            >
              Skipped ({scoreReport.unattemptedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={reviewSubjectFilter}
              onChange={(e) => setReviewSubjectFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                placeholder="Search topic or formula..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-5">
          {filteredReviewQuestions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No questions match the selected filter criteria.
            </div>
          ) : (
            filteredReviewQuestions.map((q) => {
              const userChoice = userResponses[q.id];
              const isAttempted = userChoice !== undefined;
              const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        Question {q.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wider">
                        {q.subjectName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {q.topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isAttempted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Unattempted (0 Marks)
                        </span>
                      ) : isCorrect ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct (+1.00 Mark)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect (0 Marks)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                    <FormattedMathText text={q.questionText} />
                  </div>

                  {/* Options Matrix with Visual Highlighting */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((optText, optIdx) => {
                      const isCorrectAnswer = optIdx === q.correctOptionIndex;
                      const isUserSelected = optIdx === userChoice;
                      const optionLabel = ['A', 'B', 'C', 'D'][optIdx];

                      let borderClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                      let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                      if (isCorrectAnswer) {
                        borderClass = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200';
                        badgeStyle = 'bg-emerald-600 text-white';
                      } else if (isUserSelected && !isCorrectAnswer) {
                        borderClass = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200';
                        badgeStyle = 'bg-rose-600 text-white';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${borderClass}`}
                        >
                          <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}>
                            {optionLabel}
                          </span>
                          <div className="flex-1 font-medium leading-relaxed">
                            <FormattedMathText text={optText} />
                          </div>
                          {isCorrectAnswer && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              ✓ Correct
                            </span>
                          )}
                          {isUserSelected && !isCorrectAnswer && (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 shrink-0">
                              ✗ Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step-by-Step Verified Solution Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Step-by-Step Verified Solution:</span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      <FormattedMathText text={q.explanation} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZERO-FAIL DEDICATED PRINT SHEET (Visible ONLY during print via CSS)       */}
      {/* Target of window.print() ensuring 100% clean export with zero blank pages */}
      {/* ========================================================================= */}
      <div id="certificate-print-sheet" className="p-8 bg-white text-slate-900 border-4 border-slate-900 rounded-3xl space-y-6">
        {/* Official Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img src="/Naa%20College%20logo.webp" alt="Naa College logo" width="48" height="48" className="h-12 w-12 rounded-xl object-contain" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-950">
                NAA COLLEGE - CBT SIMULATION PERFORMANCE REPORT
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                State-Level Engineering Entrance Computer-Based Test Simulation (APSCHE / TGCHE Standards)
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-600">
            <div>Report ID: {candidateProfile?.rollNumber || 'NC-2026-CBT'}</div>
            <div>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Certification Text */}
        <div className="p-5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-center space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            Official Assessment Certificate
          </div>
          <div className="text-base text-slate-800 leading-relaxed">
            This is to certify that <span className="font-black text-slate-950 underline decoration-slate-400 underline-offset-4">{candidateProfile?.fullName || 'Verified Candidate'}</span> has achieved <span className="font-black text-slate-950 text-xl">{scoreReport.totalScore}</span> / <span className="font-bold text-slate-700">{160} Marks</span> in the <span className="font-extrabold text-blue-900">{selectedExamId === 'ap-eapcet' ? 'AP EAPCET 2026' : 'TG EAPCET 2026'} Full-Length Grand Test</span> conducted by Man of Study.
          </div>
        </div>

        {/* Candidate & Exam Metadata Grid */}
        <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 rounded-xl p-3 bg-white">
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Candidate Name</span><div className="font-black mt-0.5">{candidateProfile?.fullName || 'Candidate'}</div></div>
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Roll Number</span><div className="font-mono font-bold mt-0.5">{candidateProfile?.rollNumber || 'NC-CBT-2026'}</div></div>
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Evaluation Scheme</span><div className="font-semibold mt-0.5">{selectedExamId === 'ap-eapcet' ? '75% CBT + 25% Inter IPE' : '100% CBT Merit'}</div></div>
          <div><span className="font-bold text-slate-500 uppercase text-[10px] block">Result Status</span><div className={`font-black mt-0.5 ${scoreReport.isQualified ? 'text-emerald-700' : 'text-rose-700'}`}>{scoreReport.isQualified ? 'QUALIFIED (≥40/160)' : 'NOT QUALIFIED (<40/160)'}</div></div>
        </div>

        {/* Metric Table */}
        <table className="w-full text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800">
              <th className="border border-slate-300 p-2 text-left">Subject / Section</th>
              <th className="border border-slate-300 p-2 text-center">Max Marks</th>
              <th className="border border-slate-300 p-2 text-center">Attempted</th>
              <th className="border border-slate-300 p-2 text-center">Correct</th>
              <th className="border border-slate-300 p-2 text-center">Wrong</th>
              <th className="border border-slate-300 p-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-bold">Mathematics (Q1 – Q80)</td>
              <td className="border border-slate-300 p-2 text-center font-mono">80</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scoreReport.subjectBreakdown.math.attempted}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-bold">{scoreReport.subjectBreakdown.math.correct}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scoreReport.subjectBreakdown.math.incorrect}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono">{scoreReport.subjectBreakdown.math.score} / 80</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-bold">Physics (Q81 – Q120)</td>
              <td className="border border-slate-300 p-2 text-center font-mono">40</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scoreReport.subjectBreakdown.physics.attempted}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-bold">{scoreReport.subjectBreakdown.physics.correct}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scoreReport.subjectBreakdown.physics.incorrect}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono">{scoreReport.subjectBreakdown.physics.score} / 40</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-bold">Chemistry (Q121 – Q160)</td>
              <td className="border border-slate-300 p-2 text-center font-mono">40</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scoreReport.subjectBreakdown.chemistry.attempted}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-bold">{scoreReport.subjectBreakdown.chemistry.correct}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scoreReport.subjectBreakdown.chemistry.incorrect}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono">{scoreReport.subjectBreakdown.chemistry.score} / 40</td>
            </tr>
            <tr className="bg-slate-50 font-black">
              <td className="border border-slate-300 p-2 font-black">Grand Total / CBT Score</td>
              <td className="border border-slate-300 p-2 text-center font-mono">160</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{scoreReport.attemptedTotal}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700">{scoreReport.correctCount}</td>
              <td className="border border-slate-300 p-2 text-center font-mono text-rose-700">{scoreReport.incorrectCount}</td>
              <td className="border border-slate-300 p-2 text-right font-black font-mono text-sm text-blue-900">{scoreReport.totalScore} / 160</td>
            </tr>
          </tbody>
        </table>

        {/* Overall Analytics & Rank Range */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Accuracy Rate</span>
            <div className="font-black text-sm text-slate-900 mt-0.5">{scoreReport.accuracy}%</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Time Elapsed</span>
            <div className="font-black text-sm text-slate-900 mt-0.5">{formatTime(timeTakenSeconds)}</div>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Estimated State Rank Range</span>
            <div className="font-black text-sm text-blue-900 mt-0.5">
              {scoreReport.isQualified ? (scoreReport.estimatedRankRange || 'N/A') : 'Not Qualified (<40 Cutoff)'}
            </div>
          </div>
        </div>

        {/* Footer: Verified Badge + Signature Watermark + Legal Disclaimer */}
        <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 flex items-center justify-center font-black text-emerald-700 text-xs">
              ✓
            </div>
            <div>
              <div className="font-bold text-slate-900">VERIFIED ASSESSMENT RECORD</div>
              <div className="text-[9px] text-slate-500">Naa College Evaluation System (APSCHE & TGCHE Compliant)</div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-serif italic font-bold text-slate-800 text-sm">Controller of Examinations</div>
            <div className="text-[9px] text-slate-500">Naa College CBT Simulation Council</div>
          </div>
        </div>

        <div className="text-[8px] text-slate-400 text-center pt-1">
          Disclaimer: This performance report is generated for self-assessment under historical cutoffs. Final admissions and seat allocations are subject to official APSCHE / TGCHE state counseling.
        </div>
      </div>
    </div>
  );
};

export default EapcetCbtMockTestEngine;
