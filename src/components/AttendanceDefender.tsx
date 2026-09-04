import React, { useState, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Plus, Minus, RefreshCw } from 'lucide-react';
import { SpeedometerGauge } from './SpeedometerGauge';
import { calculateAttendance } from '../utils/attendance';

export const AttendanceDefender: React.FC = () => {
  const [totalClasses, setTotalClasses] = useState<number>(40);
  const [attendedClasses, setAttendedClasses] = useState<number>(33);
  const [minRequiredPercent, setMinRequiredPercent] = useState<number>(75);

  // Instant calculation on every state change
  const result = useMemo(() => {
    return calculateAttendance(totalClasses, attendedClasses, minRequiredPercent);
  }, [totalClasses, attendedClasses, minRequiredPercent]);

  const presetPercentages = [65, 75, 80, 85, 90];

  const handleTotalChange = (val: number) => {
    const cleanVal = Math.max(0, val);
    setTotalClasses(cleanVal);
    if (attendedClasses > cleanVal) {
      setAttendedClasses(cleanVal);
    }
  };

  const handleAttendedChange = (val: number) => {
    const cleanVal = Math.max(0, Math.min(totalClasses, val));
    setAttendedClasses(cleanVal);
  };

  const handleBunkClass = () => {
    setTotalClasses((prev) => prev + 1);
  };

  const handleAttendClass = () => {
    setTotalClasses((prev) => prev + 1);
    setAttendedClasses((prev) => prev + 1);
  };

  const handleReset = () => {
    setTotalClasses(40);
    setAttendedClasses(33);
    setMinRequiredPercent(75);
  };

  return (
    <div id="attendance-defender-tool" className="space-y-6">
      
      {/* Tool Header Banner: Amber/Rose High-Stakes Ambient Aura */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-rose-950 to-slate-900 text-white border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Amber & Rose Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/4 w-64 h-64 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b15_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              HIGH-STAKES ATTENDANCE DEFENDER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Attendance Defender &amp; Bunk Forecaster
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Instant attendance computation with safe bunk limit forecasting, 75%/85% threshold protection, and deficit recovery paths.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="relative z-10 self-start sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs backdrop-blur-xs"
          title="Reset to default values"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid: Inputs on Left, Speedometer & Insights on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Class Parameters
            </h3>

            {/* Input 1: Total Classes Conducted */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="total-classes-input" className="text-xs sm:text-sm font-medium text-slate-700">
                  Total Classes Conducted
                </label>
                <span className="text-xs font-semibold text-slate-900">
                  {totalClasses} Classes
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  id="total-classes-input"
                  type="number"
                  min="1"
                  max="500"
                  value={totalClasses === 0 ? '' : totalClasses}
                  onChange={(e) => handleTotalChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="e.g. 40"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    onClick={() => handleTotalChange(Math.max(1, totalClasses - 1))}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer active:scale-90 transition-transform"
                    title="Decrement"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleTotalChange(totalClasses + 1)}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer active:scale-90 transition-transform"
                    title="Increment"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Input 2: Classes Attended */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="attended-classes-input" className="text-xs sm:text-sm font-medium text-slate-700">
                  Classes Attended
                </label>
                <span className="text-xs font-semibold text-emerald-600">
                  {attendedClasses} Attended
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  id="attended-classes-input"
                  type="number"
                  min="0"
                  max={totalClasses}
                  value={attendedClasses}
                  onChange={(e) => handleAttendedChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="e.g. 33"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    onClick={() => handleAttendedChange(Math.max(0, attendedClasses - 1))}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer active:scale-90 transition-transform"
                    title="Decrement"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAttendedChange(Math.min(totalClasses, attendedClasses + 1))}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer active:scale-90 transition-transform"
                    title="Increment"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Input 3: Min Required % */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <label htmlFor="min-req-slider" className="text-xs sm:text-sm font-medium text-slate-700">
                  Target Required Percentage
                </label>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  {minRequiredPercent}% Required
                </span>
              </div>

              <input
                id="min-req-slider"
                type="range"
                min="60"
                max="95"
                step="1"
                value={minRequiredPercent}
                onChange={(e) => setMinRequiredPercent(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />

              {/* Slider Preset Buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                {presetPercentages.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setMinRequiredPercent(pct)}
                    className={`flex-1 py-1.5 px-1 rounded-xl text-xs transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                      minRequiredPercent === pct
                        ? 'bg-sky-500 text-white font-semibold shadow-sm border border-sky-500'
                        : 'bg-white text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 border border-slate-200 font-medium'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Next-Class Action Buttons */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Simulate Next Session:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAttendClass}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all duration-200 ease-out active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Attended (+1)</span>
                </button>
                <button
                  onClick={handleBunkClass}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all duration-200 ease-out active:scale-95 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-600" />
                  <span>Missed (+0)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Speedometer Radial Card & Smart Insights */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Result Card with Speedometer */}
          <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Attendance Meter
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-xs ${
                  result.status === 'safe'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : result.status === 'warning'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {result.status === 'safe' ? 'Safe Status' : result.status === 'warning' ? 'Edge Warning' : 'Deficit Shortage'}
              </span>
            </div>

            {/* Speedometer Radial Gauge */}
            <SpeedometerGauge
              percentage={result.currentPercent}
              minRequired={minRequiredPercent}
              status={result.status}
            />

            {/* Quick Metrics Bar below Speedometer */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 font-medium">Conducted</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{result.totalConducted}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 font-medium">Attended</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{result.totalAttended}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 font-medium">Missed</div>
                <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {Math.max(0, result.totalConducted - result.totalAttended)}
                </div>
              </div>
            </div>
          </div>

          {/* Smart Insights Section */}
          <div
            id="attendance-smart-insights"
            className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              result.isSafe
                ? 'bg-amber-50/40 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-800/60 text-slate-800 dark:text-slate-100'
                : 'bg-rose-50/50 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-800/60 text-slate-800 dark:text-slate-100'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  result.isSafe
                    ? 'bg-sky-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {result.isSafe ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-4 h-4 ${result.isSafe ? 'text-sky-600' : 'text-rose-600'}`} />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Attendance Advisory
                  </h4>
                </div>

                <div className="text-sm font-normal leading-relaxed">
                  {result.isSafe ? (
                    <div>
                      <span className="font-bold text-sky-800 text-base block mb-0.5">
                        You are in the safe zone. You can miss up to {result.classesMissable} {result.classesMissable === 1 ? 'class' : 'classes'}.
                      </span>
                      Your current rate is <strong>{result.currentPercent}%</strong> (target is {minRequiredPercent}%). Skipping {result.classesMissable} session{result.classesMissable === 1 ? '' : 's'} keeps your rate at {Number(((result.totalAttended / (result.totalConducted + result.classesMissable)) * 100).toFixed(2))}%.
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-rose-700 text-base block mb-0.5">
                        Deficit Alert: Attend the next {result.classesRequired} consecutive {result.classesRequired === 1 ? 'class' : 'classes'} to reach {minRequiredPercent}%.
                      </span>
                      Your current rate is <strong>{result.currentPercent}%</strong>. Attending {result.classesRequired} future class{result.classesRequired === 1 ? '' : 'es'} consecutively will recover your attendance to {Number((((result.totalAttended + result.classesRequired) / (result.totalConducted + result.classesRequired)) * 100).toFixed(2))}%.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Projection Matrix */}
          <div className="p-4 sm:p-5 rounded-2xl border bg-white border-slate-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                Projection Matrix
              </span>
              <span className="text-[11px] text-slate-500">Future attendance trajectory</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.bunkImpacts.slice(0, 2).map((item, idx) => (
                <div
                  key={`bunk-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5"
                >
                  <div className="text-[11px] text-slate-500 font-medium">{item.scenario}</div>
                  <div
                    className={`text-sm font-bold ${
                      item.status === 'safe'
                        ? 'text-emerald-600'
                        : item.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {item.resultingPercent}%
                  </div>
                </div>
              ))}

              {result.attendanceImpacts.slice(1, 3).map((item, idx) => (
                <div
                  key={`attend-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5"
                >
                  <div className="text-[11px] text-slate-500 font-medium">{item.scenario}</div>
                  <div
                    className={`text-sm font-bold ${
                      item.status === 'safe'
                        ? 'text-sky-600'
                        : item.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {item.resultingPercent}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

