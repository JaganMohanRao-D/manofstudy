import React, { useState, useMemo } from 'react';
import { GraduationCap, Calculator, Target, BookOpen, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { GpaFormulaId, FutureGpaState } from '../types';
import { GPA_FORMULAS, convertGpaToPercentage, predictFutureGpa } from '../utils/gpa';
import { CasioCalculatorCard } from './CasioCalculatorCard';

export interface GlobalGpaHubProps {
  onNavigateToStore?: () => void;
}

export const GlobalGpaHub: React.FC<GlobalGpaHubProps> = ({ onNavigateToStore }) => {
  // Feature 1: SGPA / CGPA Converter State
  const [scoreInput, setScoreInput] = useState<number>(8.5);
  const [selectedFormula, setSelectedFormula] = useState<GpaFormulaId>('jntu_standard');
  const [customMultiplier, setCustomMultiplier] = useState<number>(9.5);
  const [customOffset, setCustomOffset] = useState<number>(0);

  // Feature 2: Future GPA Predictor State
  const [futureState, setFutureState] = useState<FutureGpaState>({
    currentCgpa: 7.8,
    completedSemesters: 4,
    totalSemesters: 8,
    targetCgpa: 8.5,
  });

  // Feature 3: Subject Course GPA builder
  const [courses, setCourses] = useState([
    { id: 1, name: 'Computer Networks', credits: 4, gradePoint: 9 },
    { id: 2, name: 'Algorithms & Data Structures', credits: 4, gradePoint: 10 },
    { id: 3, name: 'Database Management Systems', credits: 3, gradePoint: 9 },
    { id: 4, name: 'Operating Systems Lab', credits: 2, gradePoint: 8 },
    { id: 5, name: 'Professional Ethics & Seminars', credits: 1, gradePoint: 10 },
  ]);

  // Instant dynamic conversion result
  const conversionResult = useMemo(() => {
    return convertGpaToPercentage(scoreInput, selectedFormula, customMultiplier, customOffset);
  }, [scoreInput, selectedFormula, customMultiplier, customOffset]);

  // Instant dynamic future prediction result
  const predictionResult = useMemo(() => {
    return predictFutureGpa(futureState);
  }, [futureState]);

  // Course SGPA calculation
  const courseSgpa = useMemo(() => {
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const totalWeightedPoints = courses.reduce((sum, c) => sum + (c.credits * c.gradePoint), 0);
    return totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
  }, [courses]);

  const activeFormulaObj = GPA_FORMULAS.find((f) => f.id === selectedFormula) || GPA_FORMULAS[0];

  return (
    <div id="global-gpa-hub-tool" className="space-y-6">
      
      {/* Tool Header Banner: Indigo Academic Precision Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-500/30 rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Subtle Indigo Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/4 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#818cf815_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-xs">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              ACADEMIC PRECISION ENGINE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Global GPA &amp; Academic Grade Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Convert CGPA/SGPA with university formula presets and model target graduation GPA milestone trajectories.
          </p>
        </div>
      </div>

      {/* Main Grid: Feature 1 (Converter) & Feature 2 (Predictor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FEATURE 1: SGPA / CGPA CONVERTER */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  SGPA / CGPA Converter
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 backdrop-blur-xs">
                  Instant Output
                </span>
              </div>

              {/* Score Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="gpa-score-input" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Input GPA Score (1.00 - 10.00 Scale)
                  </label>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                    {scoreInput.toFixed(2)} / 10.0
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="gpa-score-input"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={scoreInput === 0 ? '' : scoreInput}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setScoreInput(isNaN(val) ? 0 : Math.min(10, Math.max(0, val)));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    placeholder="e.g. 8.50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                    CGPA / SGPA
                  </span>
                </div>

                {/* Range Slider for Score */}
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.05"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 mt-1"
                />
              </div>

              {/* Dropdown for University Formula */}
              <div className="space-y-2">
                <label htmlFor="gpa-formula-select" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Select University / Regulatory Formula Preset
                </label>
                <select
                  id="gpa-formula-select"
                  value={selectedFormula}
                  onChange={(e) => setSelectedFormula(e.target.value as GpaFormulaId)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                >
                  {GPA_FORMULAS.map((f) => (
                    <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {f.name} — [{f.expression}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  {activeFormulaObj.description}
                </p>

                {/* If Custom formula selected, allow multiplier & offset tuning */}
                {selectedFormula === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Multiplier (Default: 9.5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={customMultiplier}
                        onChange={(e) => setCustomMultiplier(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Offset Subtracted (Default: 0)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={customOffset}
                        onChange={(e) => setCustomOffset(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Results Card */}
              <div className="p-4 sm:p-5 rounded-xl border bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 space-y-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Calculated Percentage
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {activeFormulaObj.expression}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {conversionResult.percentage.toFixed(2)}
                  </span>
                  <span className="text-2xl font-semibold text-slate-500 dark:text-slate-400">%</span>
                </div>

                {/* Progress bar visual for percentage */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, conversionResult.percentage))}%` }}
                  />
                </div>

                {/* Grade & Classification Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Letter Grade</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{conversionResult.grade}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">US 4.0 Equiv</div>
                    <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">{conversionResult.usGpaEquivalent} / 4.0</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Division</div>
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate" title={conversionResult.classification}>
                      {conversionResult.classification}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {[9.0, 8.5, 8.0, 7.5, 7.0, 6.5].map((quickScore) => (
                <button
                  key={quickScore}
                  onClick={() => setScoreInput(quickScore)}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 hover:border-sky-300 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out active:scale-95 cursor-pointer shadow-xs"
                >
                  {quickScore.toFixed(1)} CGPA
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURE 2: FUTURE GPA PREDICTOR */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Target Milestone Predictor
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800 backdrop-blur-xs">
                  Target Forecaster
                </span>
              </div>

              {/* Inputs Grid for Predictor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Current CGPA */}
                <div className="space-y-1">
                  <label htmlFor="current-cgpa-input" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Current CGPA
                  </label>
                  <input
                    id="current-cgpa-input"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={futureState.currentCgpa}
                    onChange={(e) =>
                      setFutureState({
                        ...futureState,
                        currentCgpa: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    placeholder="7.80"
                  />
                </div>

                {/* Target CGPA */}
                <div className="space-y-1">
                  <label htmlFor="target-cgpa-input" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Target Final CGPA
                  </label>
                  <input
                    id="target-cgpa-input"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={futureState.targetCgpa}
                    onChange={(e) =>
                      setFutureState({
                        ...futureState,
                        targetCgpa: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    placeholder="8.50"
                  />
                </div>

                {/* Completed Semesters */}
                <div className="space-y-1">
                  <label htmlFor="completed-sems-select" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Semesters Completed
                  </label>
                  <select
                    id="completed-sems-select"
                    value={futureState.completedSemesters}
                    onChange={(e) =>
                      setFutureState({
                        ...futureState,
                        completedSemesters: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                      <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {s} Semester{s > 1 ? 's' : ''} Done
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total Program Semesters */}
                <div className="space-y-1">
                  <label htmlFor="total-sems-select" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Total Degree Semesters
                  </label>
                  <select
                    id="total-sems-select"
                    value={futureState.totalSemesters}
                    onChange={(e) =>
                      setFutureState({
                        ...futureState,
                        totalSemesters: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                  >
                    {[4, 6, 8, 10].map((t) => (
                      <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {t} Semesters ({t === 8 ? 'B.Tech / B.E' : t === 4 ? 'M.Tech / MBA' : t === 6 ? 'B.Sc / BCA' : 'Dual Degree'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Predictor Result Card */}
              {futureState.targetCgpa <= 0 || futureState.currentCgpa <= 0 ? (
                <div className="p-4 sm:p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-center space-y-1.5 py-6">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Enter your CGPA criteria to see your projection
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Provide current score and target CGPA to calculate required semester grade points.
                  </p>
                </div>
              ) : (
                <div
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 space-y-3 ${
                    predictionResult.isFeasible
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70'
                      : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Required Upcoming SGPA
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        predictionResult.isFeasible
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      {predictionResult.status === 'already_achieved'
                        ? 'Target Achieved'
                        : predictionResult.isFeasible
                        ? 'Mathematically Feasible'
                        : 'Unattainable (Exceeds 10.0 Cap)'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-bold tracking-tight ${
                        predictionResult.isFeasible ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {predictionResult.requiredSgpa.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      SGPA / Sem ({predictionResult.remainingSemesters} Left)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {predictionResult.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <span>Max Possible: <strong className="text-slate-900 dark:text-white font-semibold">{predictionResult.maxPossibleCgpa.toFixed(2)}</strong></span>
                    <span>Semesters Remaining: <strong className="text-slate-900 dark:text-white font-semibold">{predictionResult.remainingSemesters}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick target buttons */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {[8.0, 8.5, 9.0, 9.5].map((target) => (
                <button
                  key={target}
                  onClick={() => setFutureState({ ...futureState, targetCgpa: target })}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 hover:border-sky-300 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out active:scale-95 cursor-pointer shadow-xs"
                >
                  Target {target.toFixed(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Semester Subject-wise Credit SGPA Builder */}
      <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Semester Course Credit Calculator
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Calculate semester SGPA weighted by individual course credits and awarded grade points.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Semester SGPA:</span>
            <span className="text-base font-bold text-sky-600 dark:text-sky-400">{courseSgpa} / 10.0</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px] bg-slate-50 dark:bg-slate-800/60">
                <th className="py-2.5 px-3">Subject / Course Name</th>
                <th className="py-2.5 px-3">Credits</th>
                <th className="py-2.5 px-3">Grade Point (0-10)</th>
                <th className="py-2.5 px-3 text-right">Weighted Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((course, idx) => (
                <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => {
                        const next = [...courses];
                        next[idx].name = e.target.value;
                        setCourses(next);
                      }}
                      className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 focus:outline-none w-full text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={course.credits}
                      onChange={(e) => {
                        const next = [...courses];
                        next[idx].credits = parseInt(e.target.value, 10);
                        setCourses(next);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map((cr) => (
                        <option key={cr} value={cr} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                          {cr} Credits
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={course.gradePoint}
                      onChange={(e) => {
                        const next = [...courses];
                        next[idx].gradePoint = parseInt(e.target.value, 10);
                        setCourses(next);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                    >
                      {[10, 9, 8, 7, 6, 5, 4, 0].map((gp) => (
                        <option key={gp} value={gp} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                          {gp === 10 ? '10 (O / Outstanding)' : gp === 9 ? '9 (A+ / Excellent)' : gp === 8 ? '8 (A / Very Good)' : gp === 7 ? '7 (B+ / Good)' : gp === 6 ? '6 (B / Above Avg)' : gp === 5 ? '5 (C / Pass)' : gp === 4 ? '4 (P / Pass)' : '0 (F / Fail)'}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-sky-600 dark:text-sky-400">
                    {course.credits * course.gradePoint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Engineering Exam Equipment Card */}
      <CasioCalculatorCard onNavigateToStore={onNavigateToStore} />
    </div>
  );
};

