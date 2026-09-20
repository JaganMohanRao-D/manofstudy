import React, { useState } from 'react';
import { TopPriorityItem } from '../../utils/gapAnalyzer';
import { Flame, Target, ChevronDown, ChevronUp, ArrowRight, BookOpen, Terminal, Code2 } from 'lucide-react';

interface TopPrioritiesCardProps {
  priorities: TopPriorityItem[];
  nextActions: string[];
  onNavigateToRoadmaps?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToDsa?: () => void;
  onNavigateToVault?: () => void;
}

export const TopPrioritiesCard: React.FC<TopPrioritiesCardProps> = ({
  priorities,
  nextActions,
  onNavigateToRoadmaps,
  onNavigateToDsa,
  onNavigateToVault,
}) => {
  const [expandedWhy, setExpandedWhy] = useState<Record<number, boolean>>({
    1: true, // open first priority by default
  });

  const toggleWhy = (rank: number) => {
    setExpandedWhy((prev) => ({ ...prev, [rank]: !prev[rank] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP 3 PRIORITIES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🔥 TOP 3 PRIORITIES</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  Highest Return on Effort
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Targeting these three gaps first delivers maximum improvement to your candidate profile.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {priorities.map((item) => {
            const isExpanded = !!expandedWhy[item.rank];

            return (
              <div
                key={item.rank}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      #{item.rank}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        {item.skillName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>Current: <strong className="text-slate-700 dark:text-slate-200">{item.currentLevelLabel}</strong></span>
                        <span>→</span>
                        <span>Target: <strong className="text-indigo-600 dark:text-indigo-400">{item.targetLevelLabel}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWhy(item.rank)}
                    className="self-start sm:self-auto flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Why' : 'Why This Matters?'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Suggested Next Step Banner */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Recommended Next Step: </span>
                    <span className="text-slate-600 dark:text-slate-300">{item.suggestedNextStep}</span>
                  </div>
                </div>

                {/* Expandable "Why?" Rationale */}
                {isExpanded && (
                  <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1.5 animate-in fade-in duration-150">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      💡 Why this is a priority for your career goal:
                    </span>
                    <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed">
                      "{item.whyItMatters}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. YOUR NEXT 3 ACTIONS */}
      <div className="bg-gradient-to-br from-emerald-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900/90 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-emerald-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🎯 YOUR NEXT 3 ACTIONS</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Execute This Week
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Skip the overwhelm. Start with these three concrete micro-tasks today.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nextActions.map((action, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-3 group hover:border-emerald-500 dark:hover:border-emerald-400 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Micro Task
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {action}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Immediate Priority</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Launchpad to MOS Tools */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Quick Resources on MOS:</span>
          {onNavigateToDsa && (
            <button
              type="button"
              onClick={onNavigateToDsa}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-500" />
              <span>DSA Placement Tracker (450 Sheet)</span>
            </button>
          )}
          {onNavigateToVault && (
            <button
              type="button"
              onClick={onNavigateToVault}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>Code Vault &amp; Viva Flashcards</span>
            </button>
          )}
          {onNavigateToRoadmaps && (
            <button
              type="button"
              onClick={onNavigateToRoadmaps}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Full Semester Curriculum Roadmaps</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
