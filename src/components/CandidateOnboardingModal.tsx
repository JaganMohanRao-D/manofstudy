import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Info,
  X,
} from 'lucide-react';

export type ExamType = 'ap-eapcet' | 'tg-eapcet' | 'reliance';

export interface CandidateProfile {
  fullName: string;
  rollNumber: string;
  examType: ExamType;
  examTitle: string;
  interMarksType?: 'total1000' | 'group600';
  interMarks?: number;
  maxInterMarks?: number;
  interWeightageScore?: number; // Out of 25 marks
  registeredAt: string;
}

interface CandidateOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  examType: ExamType;
  examMode?: 'full' | 'express';
  onConfirm: (profile: CandidateProfile) => void;
}

export const CandidateOnboardingModal: React.FC<CandidateOnboardingModalProps> = ({
  isOpen,
  onClose,
  examType,
  examMode = 'full',
  onConfirm,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [interMarksType, setInterMarksType] = useState<'total1000' | 'group600'>('total1000');
  const [interMarks, setInterMarks] = useState<string>('920');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isAp = examType === 'ap-eapcet';
  const isTg = examType === 'tg-eapcet';
  const isReliance = examType === 'reliance';

  const maxInter = interMarksType === 'total1000' ? 1000 : 600;
  const numericInterMarks = parseFloat(interMarks) || 0;
  const interWeightage = isAp && maxInter > 0 ? (numericInterMarks / maxInter) * 25 : 0;

  const examTitles: Record<ExamType, string> = {
    'ap-eapcet': `AP EAPCET 2026 Engineering Grand Test (${examMode === 'full' ? '160 Qs • 180 Mins' : '80 Qs • 90 Mins'})`,
    'tg-eapcet': `TG EAPCET 2026 Engineering Grand Test (${examMode === 'full' ? '160 Qs • 180 Mins' : '80 Qs • 90 Mins'})`,
    'reliance': 'Reliance Foundation UG Scholarship CBT Assessment (60 Qs • 60 Mins)',
  };

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }

    if (isAp) {
      const marks = parseFloat(interMarks);
      if (isNaN(marks) || marks < 150 || marks > maxInter) {
        setErrorMsg(`Please enter valid Class 12 / Inter marks between 150 and ${maxInter}.`);
        return;
      }
    }

    // Generate unique verifiable Roll Number
    const prefix = isAp ? 'AP' : isTg ? 'TG' : 'RF';
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const generatedRollNumber = `MOS-${prefix}-2026-${randomHex}`;

    const profile: CandidateProfile = {
      fullName: trimmedName,
      rollNumber: generatedRollNumber,
      examType,
      examTitle: examTitles[examType],
      registeredAt: new Date().toISOString(),
      ...(isAp
        ? {
            interMarksType,
            interMarks: numericInterMarks,
            maxInterMarks: maxInter,
            interWeightageScore: Math.round(interWeightage * 100) / 100,
          }
        : {}),
    };

    onConfirm(profile);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center overflow-y-auto p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
              Candidate Details
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight">{examTitles[examType]}</h3>
          <p className="text-xs text-blue-100 mt-1">
            Enter your name to personalize your practice test report. This mock test does not create an official examination certificate.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStartExam} className="p-6 space-y-5 overflow-y-auto overscroll-contain">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Universal Field: Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Candidate Full Name</span>
                <span className="text-rose-500 font-bold">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Appears on Practice Report</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. S. Sai Krishna Reddy"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all font-semibold"
            />
          </div>

          {/* AP EAPCET Specific Weightage Collection */}
          {isAp && (
            <div className="space-y-3 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Official AP EAPCET 25% Inter Weightage
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    As mandated by APSCHE, final ranks are determined by combining 75% Mock CBT score + 25% Class 12 / IPE marks.
                  </div>
                </div>
              </div>

              {/* Marks Format Switcher */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select Intermediate Marks Schema:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setInterMarksType('total1000');
                      if (numericInterMarks > 1000) setInterMarks('920');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                      interMarksType === 'total1000'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>Total Marks (/1000)</span>
                    <span className="block text-[10px] font-normal opacity-80">1st + 2nd Year Total</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInterMarksType('group600');
                      if (numericInterMarks > 600) setInterMarks('560');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                      interMarksType === 'group600'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>Group Marks (/600)</span>
                    <span className="block text-[10px] font-normal opacity-80">MPC Subject Marks</span>
                  </button>
                </div>
              </div>

              {/* Marks Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Your Class 12 / Inter Score (Out of {maxInter}):</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    Weightage: {interWeightage.toFixed(2)} / 25
                  </span>
                </label>
                <input
                  type="number"
                  min={150}
                  max={maxInter}
                  step="1"
                  required
                  value={interMarks}
                  onChange={(e) => setInterMarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* TG EAPCET / Reliance Explanatory Note */}
          {isTg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>TG EAPCET 100% CBT Pure Merit Evaluation</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                As per Telangana Council of Higher Education (TGCHE) guidelines, TG EAPCET ranks are calculated strictly on 100% CBT marks (no Intermediate weightage).
              </p>
            </div>
          )}

          {isReliance && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Merit-cum-Means Aptitude Assessment</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                60 Questions spanning Verbal Ability, Logical Reasoning, and Quantitative Aptitude.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Start Practice Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CandidateOnboardingModal;
