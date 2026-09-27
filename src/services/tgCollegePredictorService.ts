/**
 * TG EAPCET 2026 Deterministic College Predictor Data Access & Evaluation Service
 *
 * Grounded in the official 71,646 candidate allotment records across 151 Telangana colleges.
 * Strictly deterministic: No LLM hallucination, no arbitrary probabilities, no fake cutoffs.
 */

import { TG_EAPCET_COLLEGE_MANIFEST } from '../data/tgEapcetCollegeManifest';

export interface PredictorStudentInput {
  rank: number;
  category: string; // 'OC' | 'EWS' | 'BC_A' | 'BC_B' | 'BC_C' | 'BC_D' | 'BC_E' | 'SC_I' | 'SC_II' | 'SC_III' | 'SC' | 'ST' | 'MUS'
  gender: string; // 'M' | 'F'
  branch: string; // Specific branch code (e.g. 'CSE') or 'ALL' or 'ALL_CS'
  district?: string; // Optional district filter or 'ALL'
  collegeQuery?: string; // Optional search term for specific college
  specialQuota?: string; // Optional special reservation tag: 'NCC' | 'CAP' | 'SPORTS' | 'PHO' | 'PHH' | 'PHV' | 'PHC' | 'NONE'
}

export type MatchClassification = 'WITHIN_RANGE' | 'NEAR_RANGE' | 'INSUFFICIENT_DATA' | 'OUTSIDE_RANGE';

export interface CollegeBranchMatch {
  id: string;
  collegeCode: string;
  collegeName: string;
  district: string;
  branchCode: string;
  branchName: string;
  studentRank: number;
  minObservedRank: number;
  maxObservedRank: number;
  medianObservedRank: number;
  matchingRecordCount: number;
  classification: MatchClassification;
  classificationLabel: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    indicator: string;
  };
  whyExplanation: string;
  rankBuffer: number; // maxObservedRank - studentRank (positive = rank is better/safer than last admitted student)
  percentDiffFromClosing: number;
  quotaDescription: string;
  file: string;
}

export interface PredictorResponse {
  summary: {
    totalMatches: number;
    withinRangeCount: number;
    nearRangeCount: number;
    insufficientDataCount: number;
    outsideRangeCount: number;
    analyzedCollegesCount: number;
    totalDatasetRecords: number;
  };
  matches: CollegeBranchMatch[];
  appliedFilter: PredictorStudentInput;
}

// In-memory cache for the compact predictor index
let cachedPredictorIndex: any = null;
let indexFetchPromise: Promise<any> | null = null;

/**
 * Load the precomputed 2026 allotment statistics index
 */
export async function getPredictorIndex(): Promise<any> {
  if (cachedPredictorIndex) {
    return cachedPredictorIndex;
  }
  if (indexFetchPromise) {
    return indexFetchPromise;
  }

  indexFetchPromise = (async () => {
    try {
      const res = await fetch('/TG_EAPCET_2026_ALLOTMENT/predictor_index.json');
      if (!res.ok) {
        throw new Error(`Failed to load predictor index: status ${res.status}`);
      }
      const data = await res.json();
      cachedPredictorIndex = data;
      return data;
    } catch (err: any) {
      console.warn('Could not load predictor_index.json, building fallback from manifest:', err.message);
      // Construct fallback from manifest if network issue
      const fallbackColleges = TG_EAPCET_COLLEGE_MANIFEST.map(c => ({
        code: c.collegeCode,
        name: c.collegeName,
        district: c.district || 'Telangana',
        file: c.file,
        branches: c.branches.reduce((acc: any, b) => {
          acc[b.branchCode] = {
            name: b.branchName,
            allotted: b.totalAllotted,
            stats: {
              OC_M: { min: b.openingRank, max: b.closingRank, cnt: b.totalAllotted, med: Math.round((b.openingRank + b.closingRank) / 2) }
            },
            specials: {}
          };
          return acc;
        }, {})
      }));
      cachedPredictorIndex = {
        totalColleges: fallbackColleges.length,
        totalRecords: 71646,
        colleges: fallbackColleges
      };
      return cachedPredictorIndex;
    } finally {
      indexFetchPromise = null;
    }
  })();

  return indexFetchPromise;
}

// Human-friendly category names
export const CATEGORY_LABELS: Record<string, string> = {
  OC: 'OC (Open Competition / General)',
  EWS: 'EWS (Economically Weaker Section - 10%)',
  BC_A: 'BC-A (Backward Class Group A - 7%)',
  BC_B: 'BC-B (Backward Class Group B - 10%)',
  BC_C: 'BC-C (Backward Class Group C - 1%)',
  BC_D: 'BC-D (Backward Class Group D - 7%)',
  BC_E: 'BC-E (Backward Class Group E - 4%)',
  SC_I: 'SC-I / SC_1 (Telangana SC Sub-Group 1)',
  SC_II: 'SC-II / SC_2 (Telangana SC Sub-Group 2)',
  SC_III: 'SC-III / SC_3 (Telangana SC Sub-Group 3)',
  SC: 'SC (General Scheduled Caste Pool)',
  ST: 'ST (Scheduled Tribe - 10%)',
  MUS: 'MUS (Muslim Minority Institutions Pool)',
};

// Computer science allied branches for quick grouped search
export const CS_ALLIED_BRANCHES = ['CSE', 'CSM', 'CSD', 'CSC', 'INF', 'AID', 'AIM', 'CSB', 'CSO', 'CSA', 'CIC', 'CSN', 'CSW', 'CSI', 'CSG'];

export const DISTRICT_OPTIONS = [
  'All Districts',
  'Hyderabad / Ranga Reddy / Medchal',
  'Warangal / Hanamkonda',
  'Karimnagar / Jagtial',
  'Khammam / Bhadradri',
  'Medak / Sangareddy',
  'Nalgonda / Suryapet',
  'Mahabubnagar / Wanaparthy',
  'Nizamabad / Kamareddy',
  'Peddapalli / Manthani',
  'Rajanna Siricilla'
];

/**
 * Deterministic Predictor Evaluation Algorithm
 */
export async function runPredictorAnalysis(input: PredictorStudentInput): Promise<PredictorResponse> {
  const index = await getPredictorIndex();
  const colleges = index.colleges || [];

  const userRank = Math.max(1, Math.min(400000, Number(input.rank) || 1));
  const category = input.category || 'OC';
  const gender = input.gender === 'F' ? 'F' : 'M';
  const branchFilter = input.branch || 'ALL';
  const districtFilter = input.district && input.district !== 'All Districts' && input.district !== 'ALL' ? input.district : null;
  const collegeSearch = (input.collegeQuery || '').trim().toLowerCase();
  const specialQuota = input.specialQuota && input.specialQuota !== 'NONE' ? input.specialQuota : null;

  const key = `${category}_${gender}`;
  const matches: CollegeBranchMatch[] = [];

  let withinRangeCount = 0;
  let nearRangeCount = 0;
  let insufficientDataCount = 0;
  let outsideRangeCount = 0;

  for (const college of colleges) {
    // College query filter
    if (collegeSearch) {
      const matchCode = college.code.toLowerCase().includes(collegeSearch);
      const matchName = college.name.toLowerCase().includes(collegeSearch);
      if (!matchCode && !matchName) {
        continue;
      }
    }

    // District filter
    if (districtFilter && college.district) {
      if (college.district !== districtFilter) {
        continue;
      }
    }

    const branches = college.branches || {};
    for (const [branchCode, branchData] of Object.entries<any>(branches)) {
      // Branch filter
      if (branchFilter !== 'ALL') {
        if (branchFilter === 'ALL_CS') {
          if (!CS_ALLIED_BRANCHES.includes(branchCode)) continue;
        } else if (branchCode !== branchFilter) {
          continue;
        }
      }

      // Check stats: either special quota or category + gender
      let statsObj: { min: number; max: number; cnt: number; med: number } | null = null;
      let quotaDesc = `${category} (${gender === 'F' ? 'Girls Quota + General' : 'General/Boys Pool'})`;

      if (specialQuota && branchData.specials && branchData.specials[specialQuota]) {
        statsObj = branchData.specials[specialQuota];
        quotaDesc = `${specialQuota} Special Reservation Quota`;
      } else if (branchData.stats && branchData.stats[key]) {
        statsObj = branchData.stats[key];
      }

      if (!statsObj || statsObj.cnt === 0) {
        // No matching records found for this category/gender in this college branch
        continue;
      }

      const minRank = statsObj.min;
      const maxRank = statsObj.max;
      const count = statsObj.cnt;
      const medianRank = statsObj.med || Math.round((minRank + maxRank) / 2);

      // Rank buffer = maxObservedRank - userRank
      // In EAPCET, smaller rank is better.
      // Positive buffer = user's rank is numerically lower (better) than the last admitted candidate.
      // Negative buffer = user's rank is numerically higher (worse) than the last admitted candidate.
      const buffer = maxRank - userRank;

      // Calculate near margin (12% of maxRank or at least 2,500 ranks)
      const nearThreshold = Math.max(2500, Math.round(maxRank * 0.12));

      let classification: MatchClassification = 'OUTSIDE_RANGE';
      let classificationLabel = 'Above observed rank range';
      let badgeStyle = {
        bg: 'bg-slate-800/80',
        text: 'text-slate-300',
        border: 'border-slate-700',
        indicator: 'bg-slate-500'
      };

      if (count < 3) {
        // Insufficient matching data (GRAY)
        classification = 'INSUFFICIENT_DATA';
        classificationLabel = 'Insufficient matching data';
        badgeStyle = {
          bg: 'bg-zinc-800/80',
          text: 'text-zinc-300',
          border: 'border-zinc-700',
          indicator: 'bg-zinc-400'
        };
        insufficientDataCount++;
      } else if (userRank <= maxRank) {
        // Within observed 2026 range (GREEN)
        classification = 'WITHIN_RANGE';
        classificationLabel = 'Within observed 2026 range';
        badgeStyle = {
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-300',
          border: 'border-emerald-500/30',
          indicator: 'bg-emerald-400'
        };
        withinRangeCount++;
      } else if (userRank <= maxRank + nearThreshold) {
        // Near observed 2026 range (YELLOW)
        classification = 'NEAR_RANGE';
        classificationLabel = 'Near observed 2026 range';
        badgeStyle = {
          bg: 'bg-amber-500/15',
          text: 'text-amber-300',
          border: 'border-amber-500/30',
          indicator: 'bg-amber-400'
        };
        nearRangeCount++;
      } else {
        // Outside / Above range
        classification = 'OUTSIDE_RANGE';
        classificationLabel = 'Above observed rank range';
        badgeStyle = {
          bg: 'bg-rose-500/10',
          text: 'text-rose-300',
          border: 'border-rose-500/25',
          indicator: 'bg-rose-500'
        };
        outsideRangeCount++;
      }

      // Percent difference relative to closing rank
      const percentDiff = maxRank > 0 ? Number(((Math.abs(userRank - maxRank) / maxRank) * 100).toFixed(1)) : 0;

      // Generate 100% data-grounded factual explanation
      let whyExplanation = '';
      if (classification === 'WITHIN_RANGE') {
        if (userRank < minRank) {
          whyExplanation = `Shown because matching 2026 allotment records for your category (${category}), gender (${gender === 'F' ? 'Female' : 'Male'}) and branch (${branchCode}) span from rank #${(minRank ?? 0).toLocaleString()} to #${(maxRank ?? 0).toLocaleString()} (${count} records). Your rank #${(userRank ?? 0).toLocaleString()} is ahead of the historical opening rank.`;
        } else {
          whyExplanation = `Shown because matching 2026 allotment records for your selected profile (${category}, ${gender === 'F' ? 'Female' : 'Male'}, ${branchCode}) include ranks from #${(minRank ?? 0).toLocaleString()} to #${(maxRank ?? 0).toLocaleString()} (median #${(medianRank ?? 0).toLocaleString()}, ${count} records). Your rank #${(userRank ?? 0).toLocaleString()} falls directly within this observed range.`;
        }
      } else if (classification === 'NEAR_RANGE') {
        const diffRanks = userRank - maxRank;
        whyExplanation = `Shown because the last observed admitted candidate for ${category} ${gender === 'F' ? 'Girls' : 'Boys'} in ${branchCode} held rank #${(maxRank ?? 0).toLocaleString()}. Your rank #${(userRank ?? 0).toLocaleString()} is within ${(diffRanks ?? 0).toLocaleString()} ranks (${percentDiff}%) of this historical boundary.`;
      } else if (classification === 'INSUFFICIENT_DATA') {
        whyExplanation = `Only ${count} allotment record was observed in the official 2026 dataset for ${category} in ${branchCode} (rank #${(maxRank ?? 0).toLocaleString()}). While data exists, fewer than 3 records were found, which is insufficient for statistical range estimation.`;
      } else {
        const diffRanks = userRank - maxRank;
        whyExplanation = `In the 2026 allotments, the last admitted candidate for ${category} in ${branchCode} was rank #${(maxRank ?? 0).toLocaleString()}. Your rank #${(userRank ?? 0).toLocaleString()} is ${(diffRanks ?? 0).toLocaleString()} ranks beyond the observed allotment records for this quota.`;
      }

      matches.push({
        id: `${college.code}_${branchCode}`,
        collegeCode: college.code,
        collegeName: college.name,
        district: college.district || 'Telangana',
        branchCode,
        branchName: branchData.name || branchCode,
        studentRank: userRank,
        minObservedRank: minRank,
        maxObservedRank: maxRank,
        medianObservedRank: medianRank,
        matchingRecordCount: count,
        classification,
        classificationLabel,
        badgeStyle,
        whyExplanation,
        rankBuffer: buffer,
        percentDiffFromClosing: percentDiff,
        quotaDescription: quotaDesc,
        file: college.file
      });
    }
  }

  // Default sorting:
  // 1. Within range (sorted by closest to student rank)
  // 2. Near range (sorted by lowest difference from maxRank)
  // 3. Insufficient data
  // 4. Outside range
  matches.sort((a, b) => {
    const priorityOrder: Record<MatchClassification, number> = {
      WITHIN_RANGE: 1,
      NEAR_RANGE: 2,
      INSUFFICIENT_DATA: 3,
      OUTSIDE_RANGE: 4
    };

    if (priorityOrder[a.classification] !== priorityOrder[b.classification]) {
      return priorityOrder[a.classification] - priorityOrder[b.classification];
    }

    if (a.classification === 'WITHIN_RANGE') {
      // Sort within range so highest tier / most selective colleges appear first (by minObservedRank ascending)
      return a.minObservedRank - b.minObservedRank;
    }

    if (a.classification === 'NEAR_RANGE') {
      // Sort near range by smallest buffer gap
      return Math.abs(a.rankBuffer) - Math.abs(b.rankBuffer);
    }

    return a.minObservedRank - b.minObservedRank;
  });

  return {
    summary: {
      totalMatches: matches.length,
      withinRangeCount,
      nearRangeCount,
      insufficientDataCount,
      outsideRangeCount,
      analyzedCollegesCount: colleges.length,
      totalDatasetRecords: 71646
    },
    matches,
    appliedFilter: input
  };
}
