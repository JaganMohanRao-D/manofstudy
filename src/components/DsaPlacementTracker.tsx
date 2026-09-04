import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Search,
  Filter,
  Trophy,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export interface DsaProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  companyTags: string[];
  leetCodeUrl?: string;
  keyPattern: string;
}

const DSA_PROBLEMS: DsaProblem[] = [
  // Arrays & Hashing
  {
    id: 'p1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    companyTags: ['TCS Digital', 'Infosys SP', 'Amazon'],
    leetCodeUrl: 'https://leetcode.com/problems/two-sum/',
    keyPattern: 'Hash Map Lookup (O(N) time)',
  },
  {
    id: 'p2',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    companyTags: ['Cognizant GenC', 'Wipro Turbo'],
    leetCodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
    keyPattern: 'Hash Set / Sorting',
  },
  {
    id: 'p3',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    companyTags: ['TCS Digital', 'Capgemini'],
    leetCodeUrl: 'https://leetcode.com/problems/valid-anagram/',
    keyPattern: 'Frequency Counting Array (26 letters)',
  },
  {
    id: 'p4',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    companyTags: ['Amazon', 'Microsoft'],
    leetCodeUrl: 'https://leetcode.com/problems/group-anagrams/',
    keyPattern: 'Sorted String / Char Count as Hash Key',
  },
  {
    id: 'p5',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    companyTags: ['Amazon', 'Goldman Sachs'],
    leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
    keyPattern: 'Bucket Sort / Min-Heap',
  },
  {
    id: 'p6',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    companyTags: ['Amazon', 'Infosys SP', 'Microsoft'],
    leetCodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
    keyPattern: 'Prefix & Suffix Multiplication',
  },

  // Two Pointers
  {
    id: 'p7',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'Two Pointers',
    companyTags: ['TCS Ninja', 'Wipro Turbo'],
    leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
    keyPattern: 'Left & Right Pointers moving inward',
  },
  {
    id: 'p8',
    title: 'Two Sum II (Sorted Array)',
    difficulty: 'Medium',
    category: 'Two Pointers',
    companyTags: ['Amazon', 'Paytm'],
    leetCodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    keyPattern: 'Opposite Ends Two Pointers',
  },
  {
    id: 'p9',
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Two Pointers',
    companyTags: ['Amazon', 'Microsoft', 'Google'],
    leetCodeUrl: 'https://leetcode.com/problems/3sum/',
    keyPattern: 'Sort Array + Fixed Anchor + Two Pointers',
  },
  {
    id: 'p10',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    companyTags: ['TCS Digital', 'Infosys SP', 'Amazon'],
    leetCodeUrl: 'https://leetcode.com/problems/container-with-most-water/',
    keyPattern: 'Greedy Two Pointers (Shrink shorter line)',
  },

  // Sliding Window
  {
    id: 'p11',
    title: 'Best Time to Buy & Sell Stock',
    difficulty: 'Easy',
    category: 'Sliding Window',
    companyTags: ['TCS Digital', 'Infosys', 'Wipro'],
    leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    keyPattern: 'Track Minimum Price + Max Profit Window',
  },
  {
    id: 'p12',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    companyTags: ['Amazon', 'Microsoft', 'Adobe'],
    leetCodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    keyPattern: 'Dynamic Sliding Window + Last Seen Index Map',
  },
  {
    id: 'p13',
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    category: 'Sliding Window',
    companyTags: ['Google', 'Amazon'],
    leetCodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
    keyPattern: 'Window Length - Max Frequency <= K',
  },

  // Stack
  {
    id: 'p14',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    companyTags: ['TCS Digital', 'Cognizant', 'Infosys SP'],
    leetCodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
    keyPattern: 'LIFO Stack Matching Closing Bracket',
  },
  {
    id: 'p15',
    title: 'Min Stack',
    difficulty: 'Medium',
    category: 'Stack',
    companyTags: ['Amazon', 'Goldman Sachs'],
    leetCodeUrl: 'https://leetcode.com/problems/min-stack/',
    keyPattern: 'Auxiliary Stack or Pair <Val, CurrentMin>',
  },
  {
    id: 'p16',
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    category: 'Stack',
    companyTags: ['Amazon', 'Meta'],
    leetCodeUrl: 'https://leetcode.com/problems/daily-temperatures/',
    keyPattern: 'Monotonic Decreasing Stack',
  },

  // Binary Search
  {
    id: 'p17',
    title: 'Binary Search (Core Pattern)',
    difficulty: 'Easy',
    category: 'Binary Search',
    companyTags: ['All Tech Interviews'],
    leetCodeUrl: 'https://leetcode.com/problems/binary-search/',
    keyPattern: 'Mid = Left + (Right - Left) / 2',
  },
  {
    id: 'p18',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    companyTags: ['Microsoft', 'Amazon', 'TCS Digital'],
    leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    keyPattern: 'Identify Sorted Half first',
  },
  {
    id: 'p19',
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    companyTags: ['Amazon', 'Microsoft'],
    leetCodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    keyPattern: 'Compare Mid with Right pointer',
  },

  // Trees & Binary Search Trees
  {
    id: 'p20',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    category: 'Trees',
    companyTags: ['Google', 'Amazon'],
    leetCodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    keyPattern: 'DFS Post-Order / BFS Swap Children',
  },
  {
    id: 'p21',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    category: 'Trees',
    companyTags: ['Infosys', 'TCS Digital'],
    leetCodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    keyPattern: '1 + Max(LeftDepth, RightDepth)',
  },
  {
    id: 'p22',
    title: 'Lowest Common Ancestor of BST',
    difficulty: 'Medium',
    category: 'Trees',
    companyTags: ['Amazon', 'Microsoft'],
    leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    keyPattern: 'BST Property Directional Traversal',
  },

  // Dynamic Programming & Graphs
  {
    id: 'p23',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    companyTags: ['TCS Digital', 'Infosys SP', 'Cognizant'],
    leetCodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
    keyPattern: 'Fibonacci DP (dp[i] = dp[i-1] + dp[i-2])',
  },
  {
    id: 'p24',
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companyTags: ['Amazon', 'Goldman Sachs', 'Microsoft'],
    leetCodeUrl: 'https://leetcode.com/problems/coin-change/',
    keyPattern: 'Unbounded Knapsack Bottom-Up DP',
  },
  {
    id: 'p25',
    title: 'Number of Islands',
    difficulty: 'Medium',
    category: 'Graphs',
    companyTags: ['Amazon', 'Google', 'Microsoft'],
    leetCodeUrl: 'https://leetcode.com/problems/number-of-islands/',
    keyPattern: 'Grid BFS / DFS Flood Fill with Visited Set',
  },
];

const CATEGORIES = [
  'All',
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Trees',
  'Dynamic Programming',
  'Graphs',
];

const STORAGE_SOLVED = 'studymacha_dsa_solved_v1';
const STORAGE_BOOKMARKED = 'studymacha_dsa_bookmarked_v1';

export interface DsaPlacementTrackerProps {
  onOpenCompilerWithProblem?: (title: string, pattern: string) => void;
}

export const DsaPlacementTracker: React.FC<DsaPlacementTrackerProps> = ({
  onOpenCompilerWithProblem,
}) => {
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // Load from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_SOLVED);
      if (s) setSolvedIds(JSON.parse(s));
      const b = localStorage.getItem(STORAGE_BOOKMARKED);
      if (b) setBookmarkedIds(JSON.parse(b));
    } catch {
      // ignore
    }
  }, []);

  const toggleSolved = (id: string) => {
    const next = solvedIds.includes(id)
      ? solvedIds.filter((item) => item !== id)
      : [...solvedIds, id];
    setSolvedIds(next);
    try {
      localStorage.setItem(STORAGE_SOLVED, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const toggleBookmarked = (id: string) => {
    const next = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    try {
      localStorage.setItem(STORAGE_BOOKMARKED, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const filteredProblems = useMemo(() => {
    return DSA_PROBLEMS.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchPattern = p.keyPattern.toLowerCase().includes(q);
        const matchCompany = p.companyTags.some((c) => c.toLowerCase().includes(q));
        if (!matchTitle && !matchPattern && !matchCompany) return false;
      }
      return true;
    });
  }, [selectedCategory, difficultyFilter, searchQuery]);

  const solvedCount = solvedIds.length;
  const progressPercent = Math.round((solvedCount / DSA_PROBLEMS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>TCS Digital, Infosys SP, Amazon &amp; Product Company Prep</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              DSA &amp; Placement Problem Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Curated essential algorithmic patterns required for high-paying campus placements (6 LPA – 24 LPA). Track solved questions, bookmark tricky patterns, and run code in our in-browser compiler.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[240px] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Solved Progress
              </span>
              <span className="text-sky-700 font-mono">
                {solvedCount} / {DSA_PROBLEMS.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Bookmarked: {bookmarkedIds.length}</span>
              <button
                onClick={() => {
                  if (confirm('Reset solved progress?')) {
                    setSolvedIds([]);
                    localStorage.removeItem(STORAGE_SOLVED);
                  }
                }}
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[10px]"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem name, algorithmic pattern, or company (e.g. TCS Digital)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    difficultyFilter === diff
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-2.5">
        {filteredProblems.map((problem) => {
          const isSolved = solvedIds.includes(problem.id);
          const isBookmarked = bookmarkedIds.includes(problem.id);

          const diffBadge =
            problem.difficulty === 'Easy'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : problem.difficulty === 'Medium'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200';

          return (
            <div
              key={problem.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSolved
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleSolved(problem.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors cursor-pointer ${
                    isSolved
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-300 hover:border-emerald-500 text-transparent'
                  }`}
                  title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isSolved ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {problem.title}
                    </span>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffBadge}`}>
                      {problem.difficulty}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                      {problem.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      Pattern: {problem.keyPattern}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="truncate">
                      Asked in: {problem.companyTags.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => toggleBookmarked(problem.id)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                  title={isBookmarked ? 'Bookmarked' : 'Bookmark problem'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                </button>

                {onOpenCompilerWithProblem && (
                  <button
                    type="button"
                    onClick={() => onOpenCompilerWithProblem(problem.title, problem.keyPattern)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Open template in CodeStudio Compiler"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Practice</span>
                  </button>
                )}

                {problem.leetCodeUrl && (
                  <a
                    href={problem.leetCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Open on LeetCode"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DsaPlacementTracker;
