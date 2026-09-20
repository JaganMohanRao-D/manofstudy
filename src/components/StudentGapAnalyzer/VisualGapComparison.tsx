import React, { useState } from 'react';
import { SkillComparisonItem } from '../../utils/gapAnalyzer';
import { BarChart3, Radar, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface VisualGapComparisonProps {
  comparisons: SkillComparisonItem[];
}

export const VisualGapComparison: React.FC<VisualGapComparisonProps> = ({ comparisons }) => {
  const [viewMode, setViewMode] = useState<'bars' | 'radar'>('bars');

  // Filter skills to display (max 10 for radar clarity)
  const radarSkills = comparisons.slice(0, 8);
  const numAxes = radarSkills.length;
  const radius = 110;
  const centerX = 160;
  const centerY = 150;

  // Radar points helper
  const getCoordinates = (index: number, percent: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (percent / 100) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon path strings
  const currentPoints = radarSkills
    .map((s, i) => {
      const { x, y } = getCoordinates(i, Math.max(s.currentPercent, 8));
      return `${x},${y}`;
    })
    .join(' ');

  const targetPoints = radarSkills
    .map((s, i) => {
      const { x, y } = getCoordinates(i, s.targetPercent);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>Visual Gap Comparison (Current vs Target)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare where you are today versus where the industry expects a candidate to be.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('bars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'bars'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Metric Bars</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'radar'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Radar Web</span>
          </button>
        </div>
      </div>

      {/* Legend Indicator */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Where You Are (Current Profile)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-indigo-500/30 border border-indigo-500 inline-block" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Where You Need To Be (Target Benchmark)</span>
        </div>
        <div className="flex items-center gap-2 ml-auto text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Scale: None (0%) • Beg (25%) • Basic (50%) • Inter (75%) • Adv (100%)</span>
        </div>
      </div>

      {viewMode === 'bars' ? (
        /* Progress Bar Breakdown */
        <div className="space-y-4 pt-1">
          {comparisons.map((item) => {
            const isMet = item.currentPercent >= item.targetPercent;
            const isCritical = item.status === 'major_gap';

            return (
              <div
                key={item.skillId}
                className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </span>
                    {item.weight === 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        Core Screening
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 dark:text-slate-300">
                      Current: <strong className="text-emerald-600 dark:text-emerald-400">{item.currentPercent}% ({item.currentLevel})</strong>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      Target: <strong className="text-indigo-600 dark:text-indigo-400">{item.targetPercent}% ({item.targetLevel})</strong>
                    </span>

                    {isMet ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Met
                      </span>
                    ) : isCritical ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full text-[11px]">
                        <AlertCircle className="w-3 h-3" /> -{item.gapPercent}% Gap
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-[11px]">
                        <AlertTriangle className="w-3 h-3" /> -{item.gapPercent}% Gap
                      </span>
                    )}
                  </div>
                </div>

                {/* Overlaid Target vs Current Progress Bar */}
                <div className="relative w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  {/* Target level ghost bar */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-indigo-200 dark:bg-indigo-900/60 border-r-2 border-indigo-500 transition-all duration-500"
                    style={{ width: `${item.targetPercent}%` }}
                    title={`Target: ${item.targetPercent}%`}
                  />

                  {/* Current level filled bar */}
                  <div
                    className={`absolute top-0 bottom-0 left-0 transition-all duration-700 rounded-full ${
                      isMet
                        ? 'bg-emerald-500'
                        : isCritical
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.currentPercent}%` }}
                    title={`Current: ${item.currentPercent}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Radar Chart SVG */
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
          <div className="w-full max-w-[340px] aspect-square flex items-center justify-center">
            <svg
              viewBox="0 0 320 300"
              className="w-full h-full overflow-visible"
              aria-label="Current vs Target Skills Radar Chart"
            >
              {/* Concentric webs (25%, 50%, 75%, 100%) */}
              {[25, 50, 75, 100].map((level) => {
                const points = radarSkills
                  .map((_, i) => {
                    const { x, y } = getCoordinates(i, level);
                    return `${x},${y}`;
                  })
                  .join(' ');

                return (
                  <polygon
                    key={level}
                    points={points}
                    className="fill-none stroke-slate-200 dark:stroke-slate-700 stroke-1"
                    strokeDasharray={level < 100 ? '2,2' : undefined}
                  />
                );
              })}

              {/* Radial spokes */}
              {radarSkills.map((s, i) => {
                const { x, y } = getCoordinates(i, 100);
                const labelCoords = getCoordinates(i, 118);
                return (
                  <g key={s.skillId}>
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      className="stroke-slate-200 dark:stroke-slate-700 stroke-1"
                    />
                    <text
                      x={labelCoords.x}
                      y={labelCoords.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300"
                    >
                      {s.name.length > 12 ? s.name.slice(0, 10) + '..' : s.name}
                    </text>
                  </g>
                );
              })}

              {/* Target Benchmark Polygon */}
              <polygon
                points={targetPoints}
                className="fill-indigo-500/20 stroke-indigo-500 stroke-2"
                strokeDasharray="4,2"
              />

              {/* Current Student Profile Polygon */}
              <polygon
                points={currentPoints}
                className="fill-emerald-500/35 stroke-emerald-500 stroke-2"
              />

              {/* Data points */}
              {radarSkills.map((s, i) => {
                const { x, y } = getCoordinates(i, Math.max(s.currentPercent, 8));
                return (
                  <circle
                    key={s.skillId}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-2"
                  />
                );
              })}
            </svg>
          </div>

          <div className="w-full md:w-64 space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Radar Interpretation:</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The <strong className="text-indigo-600 dark:text-indigo-400">purple dashed shape</strong> represents the expected industry benchmark polygon.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The <strong className="text-emerald-600 dark:text-emerald-400">green filled shape</strong> is your profile. Any area where green falls inside purple reveals a development gap.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
