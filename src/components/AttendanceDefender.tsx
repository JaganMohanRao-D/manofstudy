import React, { useState, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Plus, Minus, RefreshCw, SlidersHorizontal } from 'lucide-react';
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

  const missedClasses = Math.max(0, result.totalConducted - result.totalAttended);
  const safeFutureRate = Number(
    ((result.totalAttended / (result.totalConducted + result.classesMissable)) * 100).toFixed(2)
  );
  const recoveredFutureRate = Number(
    (((result.totalAttended + result.classesRequired) / (result.totalConducted + result.classesRequired)) * 100).toFixed(2)
  );

  return (
    <div id="attendance-defender-tool" className="space-y-6">
      
      {/* 1. Header: Semantic theme-aware surface */}
      <div className="relative overflow-hidden bg-[var(--mos-surface)] border border-[var(--mos-border)] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              ATTENDANCE DEFENDER
            </span>
            <span className="text-xs text-[var(--mos-text-muted)] hidden sm:inline">• Academic Defense Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--mos-text-primary)] tracking-tight">
            Attendance Defender &amp; Bunk Forecaster
          </h2>
          <p className="text-xs sm:text-sm text-[var(--mos-text-secondary)] max-w-2xl leading-relaxed">
            Instant attendance computation with safe bunk limit forecasting, 75%/85% threshold protection, and deficit recovery paths.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="relative z-10 self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--mos-text-primary)] hover:bg-[var(--mos-surface-muted)] bg-[var(--mos-surface-muted)]/70 border border-[var(--mos-border)] transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs shrink-0"
          title="Reset to default values (40 Conducted, 33 Attended, 75% Target)"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 2. Main Grid: Class Parameters on Left, Attendance Overview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Class Parameters Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--mos-border)] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--mos-text-primary)] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                Class Parameters
              </h3>
              <span className="text-[11px] text-[var(--mos-text-muted)] font-medium">Session Inputs</span>
            </div>

            {/* Input 1: Total Classes Conducted */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="total-classes-input" className="text-xs sm:text-sm font-semibold text-[var(--mos-text-primary)]">
                  Total Classes Conducted
                </label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--mos-surface-muted)] text-cyan-600 dark:text-cyan-300 border border-[var(--mos-border)]">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] text-[var(--mos-text-primary)] font-mono text-sm font-semibold focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-[var(--mos-text-muted)]"
                  placeholder="e.g. 40"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    onClick={() => handleTotalChange(Math.max(1, totalClasses - 1))}
                    className="p-1.5 rounded-lg bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-primary)] cursor-pointer active:scale-95 transition-transform"
                    title="Decrement conducted"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleTotalChange(totalClasses + 1)}
                    className="p-1.5 rounded-lg bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-primary)] cursor-pointer active:scale-95 transition-transform"
                    title="Increment conducted"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Input 2: Classes Attended */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="attended-classes-input" className="text-xs sm:text-sm font-semibold text-[var(--mos-text-primary)]">
                  Classes Attended
                </label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] text-[var(--mos-text-primary)] font-mono text-sm font-semibold focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-[var(--mos-text-muted)]"
                  placeholder="e.g. 33"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    onClick={() => handleAttendedChange(Math.max(0, attendedClasses - 1))}
                    className="p-1.5 rounded-lg bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-primary)] cursor-pointer active:scale-95 transition-transform"
                    title="Decrement attended"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAttendedChange(Math.min(totalClasses, attendedClasses + 1))}
                    className="p-1.5 rounded-lg bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-primary)] cursor-pointer active:scale-95 transition-transform"
                    title="Increment attended"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Input 3: Target Required % */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="min-req-slider" className="text-xs sm:text-sm font-semibold text-[var(--mos-text-primary)]">
                  Target Required Percentage
                </label>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
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
                className="w-full h-2 bg-[var(--mos-surface-muted)] rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-[var(--mos-border)]"
              />

              {/* Slider Preset Buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                {presetPercentages.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setMinRequiredPercent(pct)}
                    className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer font-mono ${
                      minRequiredPercent === pct
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm border border-cyan-400'
                        : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] hover:bg-[var(--mos-border)] border border-[var(--mos-border)]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Next-Class Action Buttons */}
            <div className="pt-4 border-t border-[var(--mos-border)] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mos-text-muted)] block">
                Simulate Next Session:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleAttendClass}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Attended (+1)</span>
                </button>
                <button
                  onClick={handleBunkClass}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  <span>Missed (+0)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Attendance Overview, Advisory, Projection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Result Card with Speedometer & Breakdown */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--mos-text-muted)] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                Attendance Overview
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                  result.status === 'safe'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : result.status === 'warning'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
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
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--mos-border)] text-center">
              <div className="p-3 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="text-xs text-[var(--mos-text-muted)] font-medium">Conducted</div>
                <div className="text-lg sm:text-xl font-bold font-mono text-[var(--mos-text-primary)] mt-0.5">{result.totalConducted}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="text-xs text-[var(--mos-text-muted)] font-medium">Attended</div>
                <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{result.totalAttended}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)]">
                <div className="text-xs text-[var(--mos-text-muted)] font-medium">Missed</div>
                <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">{missedClasses}</div>
              </div>
            </div>
          </div>

          {/* Attendance Advisory */}
          <div
            id="attendance-smart-advisory"
            className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${
              result.isSafe
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30 text-[var(--mos-text-secondary)]'
                : 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30 text-[var(--mos-text-secondary)]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  result.isSafe
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}
              >
                {result.isSafe ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-4 h-4 ${result.isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${result.isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    ATTENDANCE ADVISORY
                  </h4>
                </div>

                <div className="text-sm leading-relaxed text-[var(--mos-text-secondary)]">
                  {result.isSafe ? (
                    <div>
                      <span className="font-bold text-[var(--mos-text-primary)] text-base block mb-1">
                        You are in the safe zone. You can miss up to{' '}
                        <span className="text-emerald-600 dark:text-emerald-300 font-mono underline decoration-emerald-400/50">
                          {result.classesMissable} {result.classesMissable === 1 ? 'class' : 'classes'}
                        </span>.
                      </span>
                      Your current rate is <strong className="text-[var(--mos-text-primary)] font-mono">{result.currentPercent}%</strong> (target is <span className="text-cyan-600 dark:text-cyan-300 font-mono font-semibold">{minRequiredPercent}%</span>). Skipping {result.classesMissable} session{result.classesMissable === 1 ? '' : 's'} keeps your rate at <strong className="text-emerald-600 dark:text-emerald-300 font-mono">{safeFutureRate}%</strong>.
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-[var(--mos-text-primary)] text-base block mb-1">
                        Deficit Alert: Attend the next{' '}
                        <span className="text-rose-600 dark:text-rose-300 font-mono underline decoration-rose-400/50">
                          {result.classesRequired} consecutive {result.classesRequired === 1 ? 'class' : 'classes'}
                        </span>{' '}
                        to reach {minRequiredPercent}%.
                      </span>
                      Your current rate is <strong className="text-[var(--mos-text-primary)] font-mono">{result.currentPercent}%</strong>. Attending {result.classesRequired} future class{result.classesRequired === 1 ? '' : 'es'} consecutively will recover your attendance to <strong className="text-emerald-600 dark:text-emerald-300 font-mono">{recoveredFutureRate}%</strong>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Projection Matrix */}
          <div className="p-5 rounded-2xl bg-[var(--mos-surface)] border border-[var(--mos-border)] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--mos-text-primary)] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                Future Attendance Trajectory
              </span>
              <span className="text-[11px] text-[var(--mos-text-muted)]">Projection Matrix</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {result.bunkImpacts.slice(0, 2).map((item, idx) => (
                <div
                  key={`bunk-${idx}`}
                  className="p-3 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-center space-y-1"
                >
                  <div className="text-[11px] text-[var(--mos-text-muted)] font-medium truncate">{item.scenario}</div>
                  <div
                    className={`text-base sm:text-lg font-black font-mono ${
                      item.status === 'safe'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.status === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.resultingPercent}%
                  </div>
                </div>
              ))}

              {result.attendanceImpacts.slice(1, 3).map((item, idx) => (
                <div
                  key={`attend-${idx}`}
                  className="p-3 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-center space-y-1"
                >
                  <div className="text-[11px] text-[var(--mos-text-muted)] font-medium truncate">{item.scenario}</div>
                  <div
                    className={`text-base sm:text-lg font-black font-mono ${
                      item.status === 'safe'
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : item.status === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
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


