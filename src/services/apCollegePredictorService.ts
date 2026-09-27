/**
 * AP EAPCET 2026 Deterministic College Predictor Service
 * Grounded strictly in official 2026 AP EAPCET allotment records (102K+ records).
 * Strictly data-driven: no arbitrary mock factors, no AI guesses.
 */

export interface ApPredictorInput {
  rank: number;
  category: string; // 'OC' | 'EWS' | 'BC_A' | 'BC_B' | 'BC_C' | 'BC_D' | 'BC_E' | 'SC' | 'SC_I' | 'SC_II' | 'SC_III' | 'ST'
  gender: string; // 'M' | 'F' | 'ALL'
  branch: string; // 'ALL' | 'ALL_CS' | specific code e.g. 'CSE'
  region?: string; // 'AU' | 'SVU' | 'UR' | 'ALL'
  collegeQuery?: string;
  sortBy?: 'SELECTIVE' | 'CLOSING_DESC' | 'CLOSEST_TO_RANK' | 'NAME_ASC';
}

export type MatchClassification =
  | 'WITHIN_RANGE'
  | 'NEAR_RANGE'
  | 'OUTSIDE_RANGE'
  | 'INSUFFICIENT_DATA';

export interface ApCollegeBranchMatch {
  id: string;
  collegeCode: string;
  collegeName: string;
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
  rankBuffer: number; // positive = student rank is better than closing
  percentDiffFromClosing: number;
  quotaDescription: string;
  dataBasis: string;
}

export interface ApPredictorResponse {
  summary: {
    totalMatches: number;
    withinRangeCount: number;
    nearRangeCount: number;
    outsideRangeCount: number;
    insufficientDataCount: number;
    analyzedCollegesCount: number;
    totalDatasetRecords: number;
  };
  matches: ApCollegeBranchMatch[];
  appliedFilter: ApPredictorInput;
}

let cachedPredictorIndex: any = null;
let predictorIndexPromise: Promise<any> | null = null;

export const AP_SOCIAL_CATEGORIES = [
  { id: 'OC', label: 'OC (Open Competition / General)' },
  { id: 'EWS', label: 'EWS (Economically Weaker Section)' },
  { id: 'BC_A', label: 'BC_A (Backward Class Group A)' },
  { id: 'BC_B', label: 'BC_B (Backward Class Group B)' },
  { id: 'BC_C', label: 'BC_C (Backward Class Group C)' },
  { id: 'BC_D', label: 'BC_D (Backward Class Group D)' },
  { id: 'BC_E', label: 'BC_E (Backward Class Group E)' },
  { id: 'SC', label: 'SC (Scheduled Caste Pool)' },
  { id: 'SC_I', label: 'SC_I (Scheduled Caste Group 1)' },
  { id: 'SC_II', label: 'SC_II (Scheduled Caste Group 2)' },
  { id: 'SC_III', label: 'SC_III (Scheduled Caste Group 3)' },
  { id: 'ST', label: 'ST (Scheduled Tribe)' },
];

export const AP_CS_ALLIED_BRANCHES = [
  'CSE',
  'CSM',
  'CSD',
  'CSC',
  'AID',
  'AIM',
  'CAI',
  'INF',
  'CSB',
  'CSO',
  'CIC',
  'CIT',
];

export const AP_BRANCH_OPTIONS = [
  { code: 'ALL', name: 'All Branches (Show all disciplines)' },
  { code: 'ALL_CS', name: 'Computer Science & Allied (CSE, CSM, CSD, CSC, AID, etc.)' },
  { code: 'CSE', name: 'Computer Science and Engineering (CSE)' },
  { code: 'CSM', name: 'CSE - Artificial Intelligence & ML (CSM)' },
  { code: 'CSD', name: 'CSE - Data Science (CSD)' },
  { code: 'CSC', name: 'CSE - Cyber Security (CSC)' },
  { code: 'AID', name: 'Artificial Intelligence and Data Science (AID)' },
  { code: 'AIM', name: 'Artificial Intelligence and Machine Learning (AIM)' },
  { code: 'CAI', name: 'CSE (Artificial Intelligence) (CAI)' },
  { code: 'INF', name: 'Information Technology (INF)' },
  { code: 'ECE', name: 'Electronics and Communication Engineering (ECE)' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering (EEE)' },
  { code: 'CIV', name: 'Civil Engineering (CIV)' },
  { code: 'MEC', name: 'Mechanical Engineering (MEC)' },
  { code: 'AGR', name: 'Agricultural Engineering (AGR)' },
  { code: 'CHE', name: 'Chemical Engineering (CHE)' },
  { code: 'BIO', name: 'Biotechnology (BIO)' },
  { code: 'PHM', name: 'B.Pharmacy (PHM)' },
  { code: 'PHD', name: 'Pharm.D (PHD)' },
];

export async function getApPredictorIndex(): Promise<any> {
  if (cachedPredictorIndex) return cachedPredictorIndex;
  if (predictorIndexPromise) return predictorIndexPromise;

  predictorIndexPromise = (async () => {
    try {
      const res = await fetch('/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/predictor_index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedPredictorIndex = data;
      return data;
    } catch (err) {
      console.warn('Failed to load AP predictor index:', err);
      return null;
    } finally {
      predictorIndexPromise = null;
    }
  })();

  return predictorIndexPromise;
}

export async function runApPredictorAnalysis(
  input: ApPredictorInput
): Promise<ApPredictorResponse> {
  const index = await getApPredictorIndex();

  if (!index || !index.colleges) {
    return {
      summary: {
        totalMatches: 0,
        withinRangeCount: 0,
        nearRangeCount: 0,
        outsideRangeCount: 0,
        insufficientDataCount: 0,
        analyzedCollegesCount: 0,
        totalDatasetRecords: 0,
      },
      matches: [],
      appliedFilter: input,
    };
  }

  const {
    rank: studentRank,
    category = 'OC',
    branch = 'ALL',
    collegeQuery = '',
    sortBy = 'SELECTIVE',
  } = input;

  const queryNormalized = (collegeQuery || '').toLowerCase().trim();
  const matches: ApCollegeBranchMatch[] = [];

  let withinRangeCount = 0;
  let nearRangeCount = 0;
  let outsideRangeCount = 0;
  let insufficientDataCount = 0;

  for (const college of index.colleges) {
    if (queryNormalized) {
      const cName = (college.name || '').toLowerCase();
      const cCode = (college.code || '').toLowerCase();
      if (!cName.includes(queryNormalized) && !cCode.includes(queryNormalized)) {
        continue;
      }
    }

    const branches = college.branches || {};

    for (const [branchCode, bData] of Object.entries(branches) as [string, any][]) {
      // Branch filter
      if (branch === 'ALL_CS') {
        if (!AP_CS_ALLIED_BRANCHES.includes(branchCode)) continue;
      } else if (branch !== 'ALL' && branchCode !== branch) {
        continue;
      }

      // Look for category-specific observed stats
      const catStats = bData.categories ? bData.categories[category] : null;

      let minObservedRank = 0;
      let maxObservedRank = 0;
      let medianObservedRank = 0;
      let matchingRecordCount = 0;
      let quotaDescription = '';
      let isCategoryExact = false;

      if (catStats && catStats.count > 0) {
        minObservedRank = catStats.min;
        maxObservedRank = catStats.max;
        medianObservedRank = catStats.median || Math.round((catStats.min + catStats.max) / 2);
        matchingRecordCount = catStats.count;
        quotaDescription = `${category} Category (${matchingRecordCount} observed 2026 allotments)`;
        isCategoryExact = true;
      } else if (bData.categories && bData.categories['OC']) {
        // Fallback to OC if category has no specific records for this branch
        const oc = bData.categories['OC'];
        minObservedRank = oc.min;
        maxObservedRank = oc.max;
        medianObservedRank = oc.median || Math.round((oc.min + oc.max) / 2);
        matchingRecordCount = oc.count;
        quotaDescription = `OC Baseline Pool (No direct ${category} records observed)`;
      } else {
        minObservedRank = bData.minRank || 0;
        maxObservedRank = bData.maxRank || 0;
        medianObservedRank = Math.round((minObservedRank + maxObservedRank) / 2);
        matchingRecordCount = bData.count || 0;
        quotaDescription = `Overall Branch Range (${matchingRecordCount} records)`;
      }

      let classification: MatchClassification = 'INSUFFICIENT_DATA';
      let classificationLabel = 'Insufficient Data';
      let badgeStyle = {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-300 dark:border-slate-700',
        indicator: 'bg-slate-400',
      };
      let whyExplanation = '';

      const rankBuffer = maxObservedRank > 0 ? maxObservedRank - studentRank : 0;
      const percentDiffFromClosing =
        maxObservedRank > 0 ? Math.round(((studentRank - maxObservedRank) / maxObservedRank) * 100) : 0;

      if (matchingRecordCount === 0 || maxObservedRank === 0) {
        classification = 'INSUFFICIENT_DATA';
        classificationLabel = 'Insufficient 2026 Data';
        badgeStyle = {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-300/40 dark:border-amber-500/30',
          indicator: 'bg-amber-500',
        };
        whyExplanation = `No verified 2026 allotment records were recorded for this branch under ${category}.`;
        insufficientDataCount++;
      } else if (studentRank <= maxObservedRank) {
        classification = 'WITHIN_RANGE';
        classificationLabel = 'Within Observed Range';
        badgeStyle = {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-300/50 dark:border-emerald-500/30',
          indicator: 'bg-emerald-500',
        };
        const bufferStr = Math.abs(rankBuffer || 0).toLocaleString('en-IN');
        whyExplanation = `Your rank ${(studentRank ?? 0).toLocaleString('en-IN')} is within the observed closing rank of ${(maxObservedRank ?? 0).toLocaleString('en-IN')} (+${bufferStr} rank buffer).`;
        withinRangeCount++;
      } else if (studentRank <= Math.round(maxObservedRank * 1.15)) {
        classification = 'NEAR_RANGE';
        classificationLabel = 'Borderline (Near Range)';
        badgeStyle = {
          bg: 'bg-blue-500/10 dark:bg-blue-500/15',
          text: 'text-blue-700 dark:text-blue-400',
          border: 'border-blue-300/50 dark:border-blue-500/30',
          indicator: 'bg-blue-500',
        };
        const diffStr = Math.abs(rankBuffer || 0).toLocaleString('en-IN');
        whyExplanation = `Your rank is within 15% of the 2026 closing rank (${diffStr} ranks above observed closing of ${(maxObservedRank ?? 0).toLocaleString('en-IN')}).`;
        nearRangeCount++;
      } else {
        classification = 'OUTSIDE_RANGE';
        classificationLabel = 'Outside Observed Range';
        badgeStyle = {
          bg: 'bg-rose-500/10 dark:bg-rose-500/15',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-300/50 dark:border-rose-500/30',
          indicator: 'bg-rose-500',
        };
        whyExplanation = `Your rank is beyond the last observed 2026 allotment rank (${(maxObservedRank ?? 0).toLocaleString('en-IN')}).`;
        outsideRangeCount++;
      }

      matches.push({
        id: `${college.code}_${branchCode}`,
        collegeCode: college.code,
        collegeName: college.name,
        branchCode,
        branchName: bData.name || branchCode,
        studentRank,
        minObservedRank,
        maxObservedRank,
        medianObservedRank,
        matchingRecordCount,
        classification,
        classificationLabel,
        badgeStyle,
        whyExplanation,
        rankBuffer,
        percentDiffFromClosing,
        quotaDescription,
        dataBasis: 'Data-based estimate using 2026 allotment records',
      });
    }
  }

  // Sorting
  if (sortBy === 'SELECTIVE') {
    // Sort by best min rank (most competitive colleges first)
    matches.sort((a, b) => {
      // Prioritize within range, then near range
      const priority = { WITHIN_RANGE: 1, NEAR_RANGE: 2, OUTSIDE_RANGE: 3, INSUFFICIENT_DATA: 4 };
      if (priority[a.classification] !== priority[b.classification]) {
        return priority[a.classification] - priority[b.classification];
      }
      return a.minObservedRank - b.minObservedRank;
    });
  } else if (sortBy === 'CLOSING_DESC') {
    matches.sort((a, b) => b.maxObservedRank - a.maxObservedRank);
  } else if (sortBy === 'CLOSEST_TO_RANK') {
    matches.sort((a, b) => Math.abs(a.maxObservedRank - studentRank) - Math.abs(b.maxObservedRank - studentRank));
  } else if (sortBy === 'NAME_ASC') {
    matches.sort((a, b) => a.collegeName.localeCompare(b.collegeName));
  }

  return {
    summary: {
      totalMatches: matches.length,
      withinRangeCount,
      nearRangeCount,
      outsideRangeCount,
      insufficientDataCount,
      analyzedCollegesCount: index.colleges.length,
      totalDatasetRecords: index.totalRecords || 102671,
    },
    matches,
    appliedFilter: input,
  };
}
