import React from 'react';
import { Trophy, Award } from 'lucide-react';

interface ProblemSolverBadgeProps {
  solutionsCount?: number;
  className?: string;
  showCount?: boolean;
}

export const ProblemSolverBadge: React.FC<ProblemSolverBadgeProps> = ({
  solutionsCount = 0,
  className = '',
  showCount = false,
}) => {
  if (solutionsCount < 3) return null;

  const isTopSolver = solutionsCount >= 10;

  if (isTopSolver) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border border-amber-300 shadow-2xs select-none ${className}`}
        title={`Top Problem Solver (${solutionsCount} solutions provided)`}
      >
        <Trophy className="w-3 h-3 text-amber-900 shrink-0" />
        <span>Top Problem Solver</span>
        {showCount && <span className="opacity-80">({solutionsCount})</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-300 shadow-2xs select-none ${className}`}
      title={`Problem Solver (${solutionsCount} solutions provided)`}
    >
      <Award className="w-3 h-3 text-pink-600 shrink-0" />
      <span>Problem Solver</span>
      {showCount && <span className="opacity-80">({solutionsCount})</span>}
    </span>
  );
};
