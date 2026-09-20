import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Target,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Info,
} from 'lucide-react';
import { InternalCalcState, MidCalcMethod } from '../types';
import { calculateInternalCutoff } from '../utils/internalCalc';
import { CasioCalculatorCard } from './CasioCalculatorCard';

export interface InternalExamEstimatorProps {
  onNavigateToStore?: () => void;
}

export const InternalExamEstimator: React.FC<InternalExamEstimatorProps> = ({ onNavigateToStore }) => {
  const [calcState, setCalcState] = useState<InternalCalcState>({
    mid1Scored: 24,
    mid1Max: 30,
    mid2Scored: 27,
    mid2Max: 30,
    calcMethod: 'weighted_80_20',
    assignmentScored: 9,
    assignmentMax: 10,
    attendanceScored: 5,
    attendanceMax: 5,
    internalMaxScale: 40,
    externalMaxMarks: 60,
    targetGradePercent: 75,
    minPassingExternalPercent: 35,
  });

  const result = useMemo(() => {
    return calculateInternalCutoff(calcState);
  }, [calcState]);

  const updateField = <K extends keyof InternalCalcState>(field: K, value: InternalCalcState[K]) => {
    setCalcState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Tool Header Banner: Indigo/Violet Academic Precision Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white border border-indigo-500/30 rounded-2xl p-5 sm:p-7 shadow-xl">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/4 w-64 h-64 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#818cf815_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1 bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>Internal Exam Cutoff Estimator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Internal Exam Cutoff &amp; External Marks Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Consolidate Mid-terms, Assignments, and Attendance marks using Best-of-2 or 80:20 weighted average formulas. Instantly calculates minimum external marks required to hit your target grade.
            </p>
          </div>

          {/* Quick Target Grade Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-xs">
            <span className="text-xs font-semibold text-indigo-300 px-2">Preset:</span>
            {[
              { label: 'Pass (40%)', val: 40 },
              { label: 'FC (60%)', val: 60 },
              { label: 'Distinction (75%)', val: 75 },
              { label: 'Elite (85%)', val: 85 },
              { label: 'O-Grade (90%)', val: 90 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => updateField('targetGradePercent', p.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                  calcState.targetGradePercent === p.val
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: Inputs + Dynamic Result Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Marks Configuration Form */}
        <div className="lg:col-span-7 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              Academic Internal Inputs
            </h3>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Course: {result.totalCourseMax} Marks</span>
          </div>

          {/* Mid Exam Weightage Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Mid Examination Evaluation Formula</span>
              <span className="text-sky-600 dark:text-sky-400 font-semibold">Current: {calcState.calcMethod.replace(/_/g, ' ').toUpperCase()}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'weighted_80_20', label: '80:20 Weighted', desc: '80% High + 20% Low' },
                { id: 'best_of_2', label: 'Best of 2', desc: '100% Best Mid' },
                { id: 'average_50_50', label: '50:50 Average', desc: 'Equal Mean' },
                { id: 'weighted_70_30', label: '70:30 Weighted', desc: '70% High + 30% Low' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateField('calcMethod', m.id as MidCalcMethod)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                    calcState.calcMethod === m.id
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-950 dark:text-sky-100 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:border-sky-300'
                  }`}
                >
                  <div className="text-xs font-semibold">{m.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mid 1 & Mid 2 Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mid 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-xs uppercase text-slate-700 dark:text-slate-300 font-semibold block">
                Mid Term 1 Examination
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Scored</label>
                  <input
                    type="number"
                    min="0"
                    max={calcState.mid1Max}
                    value={calcState.mid1Scored}
                    onChange={(e) => updateField('mid1Scored', Math.max(0, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={calcState.mid1Max}
                    onChange={(e) => updateField('mid1Max', Math.max(1, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Mid 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-xs uppercase text-slate-700 dark:text-slate-300 font-semibold block">
                Mid Term 2 Examination
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Scored</label>
                  <input
                    type="number"
                    min="0"
                    max={calcState.mid2Max}
                    value={calcState.mid2Scored}
                    onChange={(e) => updateField('mid2Scored', Math.max(0, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={calcState.mid2Max}
                    onChange={(e) => updateField('mid2Max', Math.max(1, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Assignments & Attendance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assignments */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-xs uppercase text-slate-700 dark:text-slate-300 font-semibold block">
                Assignments & Quizzes
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Scored</label>
                  <input
                    type="number"
                    min="0"
                    max={calcState.assignmentMax}
                    value={calcState.assignmentScored}
                    onChange={(e) => updateField('assignmentScored', Math.max(0, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={calcState.assignmentMax}
                    onChange={(e) => updateField('assignmentMax', Math.max(1, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Marks */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-xs uppercase text-slate-700 dark:text-slate-300 font-semibold block">
                Attendance Internal Marks
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Scored</label>
                  <input
                    type="number"
                    min="0"
                    max={calcState.attendanceMax}
                    value={calcState.attendanceScored}
                    onChange={(e) => updateField('attendanceScored', Math.max(0, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={calcState.attendanceMax}
                    onChange={(e) => updateField('attendanceMax', Math.max(1, Number(e.target.value)))}
                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* External Exam & Target Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Semester External Max
              </label>
              <select
                value={calcState.externalMaxMarks}
                onChange={(e) => updateField('externalMaxMarks', Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                <option value={60} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">60 Marks (JNTU / Anna Univ)</option>
                <option value={70} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">70 Marks (VTU / Autonomous)</option>
                <option value={75} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">75 Marks (State Universities)</option>
                <option value={100} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">100 Marks (Direct 100 Scale)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Min Passing External %
              </label>
              <select
                value={calcState.minPassingExternalPercent}
                onChange={(e) => updateField('minPassingExternalPercent', Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                <option value={35} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">35% (e.g. 21/60 or 25/70)</option>
                <option value={40} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">40% (e.g. 24/60 or 28/70)</option>
                <option value={45} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">45% Standard</option>
                <option value={50} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">50% Autonomous</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Target Desired Grade %
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={calcState.targetGradePercent}
                  onChange={(e) => updateField('targetGradePercent', Math.min(100, Math.max(35, Number(e.target.value))))}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-600 dark:text-sky-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Status Card & Target Outcome */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Status Result Card */}
          <div
            className={`rounded-2xl border p-5 sm:p-6 space-y-5 transition-all shadow-sm ${
              result.isAchievable
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70'
                : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70'
            }`}
          >
            {/* Header pill */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  result.isAchievable
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                }`}
              >
                {result.isAchievable ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Target Achievable</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Mathematically Impossible</span>
                  </>
                )}
              </span>

              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Target: {calcState.targetGradePercent}%
              </span>
            </div>

            {/* Score Showcase */}
            {result.isAchievable ? (
              <div className="space-y-2">
                <span className="text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-semibold">
                  Required in Final External Exam:
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {result.requiredExternalScore}
                  </span>
                  <span className="text-lg text-slate-500 dark:text-slate-400">
                    / {calcState.externalMaxMarks}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                    {result.requiredExternalPercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  You need a minimum of <strong className="text-slate-900 dark:text-white font-semibold">{result.requiredExternalScore} marks</strong> in the Semester External Exam (meeting min passing cutoff of {result.minPassingExternalMarks}) to secure {calcState.targetGradePercent}% overall.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs text-rose-700 dark:text-rose-300 uppercase tracking-wider block font-semibold">
                  External Exam Deficit:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-rose-700 dark:text-rose-400">
                    Short by {result.shortfallMarks} Marks
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed pt-1">
                  Even with 100% in the external exam ({calcState.externalMaxMarks}/{calcState.externalMaxMarks}), the maximum total course percentage you can attain is <strong className="font-semibold text-rose-950 dark:text-white">{result.maxAchievableTotalPercent}%</strong>.
                </p>
              </div>
            )}

            {/* Consolidated Internal Summary */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Consolidated Internals</span>
                <span className="text-base font-bold text-sky-600 dark:text-sky-400 mt-0.5 block">
                  {result.consolidatedInternalScored} / {result.consolidatedInternalMax}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  ({result.consolidatedInternalPercent}%)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Mid Exam Weight</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {result.calculatedMidMarks} Marks
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Via {calcState.calcMethod.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Universities enforce separate minimum cutoffs for external exams (usually 35% or 40%). Our engine guarantees you meet both overall grade and external minimum thresholds.
            </p>
          </div>
        </div>
      </section>

      {/* Target Milestone Breakdown Table */}
      <section className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              All Grades External Marks Cutoff Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact marks required in external exam to unlock each standard academic division
            </p>
          </div>
          <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
            Max External: {calcState.externalMaxMarks}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="pb-2.5">Academic Milestone</th>
                <th className="pb-2.5">Min Total Target</th>
                <th className="pb-2.5">Target Course Marks</th>
                <th className="pb-2.5">Required External Marks</th>
                <th className="pb-2.5">Required External %</th>
                <th className="pb-2.5 text-right">Feasibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {result.cutoffBreakdown.map((row) => (
                <tr key={row.gradeName} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 text-slate-900 dark:text-slate-100 font-semibold">{row.gradeName}</td>
                  <td className="py-2.5 text-slate-700 dark:text-slate-300">{row.minPercent}%</td>
                  <td className="py-2.5 text-slate-700 dark:text-slate-300">
                    {row.targetTotalMarks} / {result.totalCourseMax}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`font-semibold ${
                        row.isAchievable ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400 line-through'
                      }`}
                    >
                      {row.isAchievable ? `${row.requiredExternalMarks} / ${calcState.externalMaxMarks}` : 'Exceeds Max'}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-700 dark:text-slate-300">
                    {row.isAchievable ? `${row.requiredExternalPercent}%` : 'N/A'}
                  </td>
                  <td className="py-2.5 text-right">
                    {row.isAchievable ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.status === 'safe'
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{row.status === 'safe' ? 'Achievable' : 'High Effort'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Impossible</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mandatory Exam Scientific Calculator Recommendation */}
      <CasioCalculatorCard onNavigateToStore={onNavigateToStore} />
    </div>
  );
};
