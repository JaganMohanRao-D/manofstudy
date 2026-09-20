import React, { useState } from 'react';
import { StudentProfile, simulateWhatIf } from '../../utils/gapAnalyzer';
import { Sparkles, ArrowUpRight, CheckCircle2, RotateCcw, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { SkillLevel } from '../../data/careerRequirementsData';

interface WhatIfSimulatorProps {
  originalProfile: StudentProfile;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ originalProfile }) => {
  // State for simulated modifications
  const [improvedDsa, setImprovedDsa] = useState<boolean>(false);
  const [improvedSql, setImprovedSql] = useState<boolean>(false);
  const [improvedOop, setImprovedOop] = useState<boolean>(false);
  const [extraProjects, setExtraProjects] = useState<number>(0);
  const [extraInternships, setExtraInternships] = useState<number>(0);

  // Compute what-if simulation dynamically
  const skillOverrides: Record<string, SkillLevel> = {};
  if (improvedDsa) skillOverrides['dsa'] = 'intermediate';
  if (improvedSql) skillOverrides['sql'] = 'basic';
  if (improvedOop) skillOverrides['oop'] = 'intermediate';

  const simulation = simulateWhatIf(originalProfile, {
    skills: skillOverrides,
    projectsCount: originalProfile.projectsCount + extraProjects,
    internshipsCount: originalProfile.internshipsCount + extraInternships,
  });

  const resetSimulation = () => {
    setImprovedDsa(false);
    setImprovedSql(false);
    setImprovedOop(false);
    setExtraProjects(0);
    setExtraInternships(0);
  };

  const hasChanges = improvedDsa || improvedSql || improvedOop || extraProjects > 0 || extraInternships > 0;

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive "What-If?" Scenario Simulator</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulate your growth: see how learning target skills or shipping projects instantly boosts your profile readiness.
          </p>
        </div>

        {hasChanges && (
          <button
            type="button"
            onClick={resetSimulation}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer self-start sm:self-auto px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive Controls */}
        <div className="lg:col-span-7 space-y-3.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Toggle Hypothetical Milestones:
          </span>

          {/* DSA Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={improvedDsa}
                onChange={(e) => setImprovedDsa(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Improve DSA to Intermediate (75%)
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Solve 60+ LeetCode problems (Arrays, LinkedLists, Trees)
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              +High Impact
            </span>
          </label>

          {/* SQL Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={improvedSql}
                onChange={(e) => setImprovedSql(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Learn SQL Database Basics (50%)
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Master SELECT, WHERE, JOINs, and write 15 practical queries
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              +Core Weight
            </span>
          </label>

          {/* OOP Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={improvedOop}
                onChange={(e) => setImprovedOop(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Master OOP Principles in Java/C++ (75%)
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Implement class hierarchies, polymorphism & design patterns
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              +Viva Core
            </span>
          </label>

          {/* Steppers for Projects & Internships */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Build Extra Projects</span>
                <span className="text-slate-500 text-[11px]">Deploy to GitHub</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExtraProjects((prev) => Math.max(0, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer text-sm"
                >
                  -
                </button>
                <span className="text-xs font-extrabold w-5 text-center text-slate-900 dark:text-slate-100">
                  +{extraProjects}
                </span>
                <button
                  type="button"
                  onClick={() => setExtraProjects((prev) => Math.min(4, prev + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Complete Internship</span>
                <span className="text-slate-500 text-[11px]">AICTE / Tech Role</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExtraInternships((prev) => Math.max(0, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer text-sm"
                >
                  -
                </button>
                <span className="text-xs font-extrabold w-5 text-center text-slate-900 dark:text-slate-100">
                  +{extraInternships}
                </span>
                <button
                  type="button"
                  onClick={() => setExtraInternships((prev) => Math.min(2, prev + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Output Card */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-700/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Simulated Outcome
            </span>
            {simulation.scoreDelta > 0 && (
              <span className="flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{simulation.scoreDelta}% Match Boost
              </span>
            )}
          </div>

          {/* Meter Comparison */}
          <div className="flex items-center justify-around py-2">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">Current Score</span>
              <span className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">
                {simulation.originalScore}%
              </span>
            </div>
            <span className="text-xl font-bold text-slate-300 dark:text-slate-600">→</span>
            <div className="text-center">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase block">
                Simulated Score
              </span>
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {simulation.simulatedScore}%
              </span>
            </div>
          </div>

          {/* Resolved Gaps Preview */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Gaps Resolved / Reduced:
            </span>
            {simulation.resolvedGaps.length > 0 ? (
              <div className="space-y-1.5">
                {simulation.resolvedGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{gap} addressed &amp; elevated</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Toggle options above to see how target milestones eliminate specific recruitment gaps.
              </p>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              This simulation proves that by tackling just 2-3 target priorities, your candidate profile can leap into top placement readiness.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
