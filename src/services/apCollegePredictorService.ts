/**
 * AP EAPCET 2026 Hyper-Accurate Deterministic College Predictor Engine
 * Grounded strictly in official 2026 AP EAPCET allotment JSON datasets (100,621+ records across 262 colleges).
 * Strict quota matching rules: gender isolation, regional reservation (AU / SVU / UR), and special quota filters.
 */

export interface ApPredictorInput {
  rank: number;
  category: 'OC' | 'BC_A' | 'BC_B' | 'BC_C' | 'BC_D' | 'BC_E' | 'SC' | 'ST' | 'EWS' | string;
  gender: 'M' | 'F' | string;
  region: 'AU' | 'SVU' | 'UR' | string;
  specialCategory: 'NONE' | 'PWD' | 'NCC' | 'CAP' | 'SPORTS' | string;
  collegeCode?: string; // 'ALL' or specific college code
  branch: string; // 'ALL', 'ALL_CS', 'CSE', 'CSM', 'CSD', 'INF', 'ECE', 'EEE', 'MEC', 'CIV', etc.
  collegeQuery?: string;
  sortBy?: 'SELECTIVE' | 'CLOSING_DESC' | 'CLOSEST_TO_RANK' | 'NAME_ASC';
}

export type VerdictClassification =
  | 'HIGH_CHANCE'
  | 'COMPETITIVE'
  | 'DREAM'
  | 'STEEP_REACH'
  | 'INSUFFICIENT_DATA';

// Backward compatibility alias
export type MatchClassification =
  | 'WITHIN_RANGE'
  | 'NEAR_RANGE'
  | 'OUTSIDE_RANGE'
  | 'INSUFFICIENT_DATA';

export interface ApCollegeBranchMatch {
  id: string;
  collegeCode: string;
  collegeName: string;
  district: string;
  branchCode: string;
  branchName: string;
  studentRank: number;
  minObservedRank: number;
  maxObservedRank: number; // For compatibility
  closingRank: number;
  medianObservedRank: number;
  matchingRecordCount: number;
  classification: MatchClassification;
  verdict: VerdictClassification;
  verdictLabel: string;
  classificationLabel: string;
  probabilityPercent: number;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    indicator: string;
  };
  whyExplanation: string;
  rankBuffer: number;
  percentDiffFromClosing: number;
  matchedQuotaCode: string;
  quotaDescription: string;
  categoryQuotaClosing?: number;
  openQuotaClosing?: number;
  dataBasis: string;
}

export interface ApPredictorResponse {
  summary: {
    totalMatches: number;
    highChanceCount: number;
    competitiveCount: number;
    dreamCount: number;
    steepReachCount: number;
    insufficientDataCount: number;
    analyzedCollegesCount: number;
    totalDatasetRecords: number;
    // Backward compatibility counts
    withinRangeCount: number;
    nearRangeCount: number;
    outsideRangeCount: number;
  };
  matches: ApCollegeBranchMatch[];
  appliedFilter: ApPredictorInput;
}

export interface CollegeOption {
  code: string;
  name: string;
  district?: string;
}

export const AP_SOCIAL_CATEGORIES = [
  { id: 'OC', label: 'OC (Open Competition / General Merit)' },
  { id: 'EWS', label: 'EWS (Economically Weaker Section - 10%)' },
  { id: 'BC_A', label: 'BC-A (Backward Class Group A - 7%)' },
  { id: 'BC_B', label: 'BC-B (Backward Class Group B - 10%)' },
  { id: 'BC_C', label: 'BC-C (Backward Class Group C - 1%)' },
  { id: 'BC_D', label: 'BC-D (Backward Class Group D - 7%)' },
  { id: 'BC_E', label: 'BC-E (Backward Class Group E - 4%)' },
  { id: 'SC', label: 'SC (Scheduled Caste - 15%)' },
  { id: 'ST', label: 'ST (Scheduled Tribe - 6%)' },
];

export const AP_REGION_OPTIONS = [
  { id: 'AU', label: 'AU (Andhra University Region)' },
  { id: 'SVU', label: 'SVU (Sri Venkateswara University Region)' },
  { id: 'UR', label: 'Non-Local / Statewide Unreserved (UR)' },
];

export const AP_SPECIAL_CATEGORIES = [
  { id: 'NONE', label: 'None (General Standard Quota)' },
  { id: 'PWD', label: 'PWD / PH (Persons with Disabilities)' },
  { id: 'NCC', label: 'NCC (National Cadet Corps)' },
  { id: 'CAP', label: 'CAP (Children of Armed Personnel)' },
  { id: 'SPORTS', label: 'Sports & Games Quota' },
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
  'CAD',
  'CCC',
];

export const AP_BRANCH_OPTIONS = [
  { code: 'ALL', name: 'All Branches (Show all engineering disciplines)' },
  { code: 'ALL_CS', name: 'Computer Science & Allied (CSE, CSM, CSD, CSC, AID, etc.)' },
  { code: 'CSE', name: 'Computer Science and Engineering (CSE)' },
  { code: 'CSM', name: 'CSE - Artificial Intelligence & ML (CSM)' },
  { code: 'CSD', name: 'CSE - Data Science (CSD)' },
  { code: 'INF', name: 'Information Technology (INF)' },
  { code: 'ECE', name: 'Electronics and Communication Engineering (ECE)' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering (EEE)' },
  { code: 'MEC', name: 'Mechanical Engineering (MEC)' },
  { code: 'CIV', name: 'Civil Engineering (CIV)' },
  { code: 'AID', name: 'Artificial Intelligence and Data Science (AID)' },
  { code: 'CSC', name: 'CSE - Cyber Security (CSC)' },
  { code: 'CAI', name: 'CSE - Artificial Intelligence (CAI)' },
  { code: 'AIM', name: 'Artificial Intelligence & Machine Learning (AIM)' },
  { code: 'CHE', name: 'Chemical Engineering (CHE)' },
  { code: 'BIO', name: 'Biotechnology (BIO)' },
  { code: 'AGR', name: 'Agricultural Engineering (AGR)' },
];

let cachedQuotaData: Record<string, any> | null = null;
let quotaDataPromise: Promise<Record<string, any> | null> | null = null;
let cachedCollegeList: CollegeOption[] | null = null;

export async function getApQuotaClosingRanks(): Promise<Record<string, any> | null> {
  if (cachedQuotaData) return cachedQuotaData;
  if (quotaDataPromise) return quotaDataPromise;

  quotaDataPromise = (async () => {
    try {
      const res = await fetch('/AP_EAPCET_2026_ALLOTMENT_BY_COLLEGE/quota_closing_ranks_2026.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedQuotaData = data;
      return data;
    } catch (err) {
      console.warn('Failed to load AP quota closing ranks:', err);
      return null;
    } finally {
      quotaDataPromise = null;
    }
  })();

  return quotaDataPromise;
}

export async function getApCollegeDropdownList(): Promise<CollegeOption[]> {
  if (cachedCollegeList) return cachedCollegeList;

  try {
    const quotaData = await getApQuotaClosingRanks();
    if (quotaData) {
      const list: CollegeOption[] = Object.values(quotaData).map((col: any) => ({
        code: col.code,
        name: col.name || col.code,
        district: col.district || '',
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      cachedCollegeList = list;
      return list;
    }
  } catch (err) {
    console.warn('Failed to load college dropdown list:', err);
  }

  return [];
}

// Backward compatibility function
export async function getApPredictorIndex(): Promise<any> {
  return getApQuotaClosingRanks();
}

/**
 * Strict Quota Categorization & Filter Evaluator
 */
function isQuotaEligible(
  quotaKey: string,
  userCat: string,
  userGender: string,
  userRegion: string,
  userSpecial: string
): { isEligible: boolean; isDirectCategory: boolean; isOpenMerit: boolean } {
  const q = quotaKey.toLowerCase();

  // 1. Special Category Isolation Check
  const hasPwd = q.includes('_pwd_') || q.includes('_ph_');
  const hasNcc = q.includes('_ncc_');
  const hasCap = q.includes('_cap_');
  const hasSports = q.includes('_sports_') || q.includes('_scg_') || q.includes('_sg_');
  const hasAnySpecial = hasPwd || hasNcc || hasCap || hasSports;

  if (userSpecial === 'NONE' && hasAnySpecial) {
    return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
  }
  if (userSpecial === 'PWD' && !hasPwd) {
    return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
  }
  if (userSpecial === 'NCC' && !hasNcc) {
    return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
  }
  if (userSpecial === 'CAP' && !hasCap) {
    return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
  }
  if (userSpecial === 'SPORTS' && !hasSports) {
    return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
  }

  // 2. Gender Quota Isolation Check
  // Female can take both _girls_ and _gen_ seats.
  // Male can NEVER take _girls_ seats.
  const isGirlsQuota = q.includes('_girls_');
  if (userGender === 'M' && isGirlsQuota) {
    return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
  }

  // 3. Regional Reservation Check
  // AU candidate: matches _au and _ur
  // SVU candidate: matches _svu and _ur
  // UR (Non-local): matches _ur
  const isAuQuota = q.endsWith('_au');
  const isSvuQuota = q.endsWith('_svu');
  const isUrQuota = q.endsWith('_ur');

  if (userRegion === 'AU') {
    if (!isAuQuota && !isUrQuota) {
      return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
    }
  } else if (userRegion === 'SVU') {
    if (!isSvuQuota && !isUrQuota) {
      return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
    }
  } else if (userRegion === 'UR') {
    if (!isUrQuota) {
      return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
    }
  }

  // 4. Caste Community Matching
  let matchesDirectCat = false;
  const userCatLower = (userCat || 'OC').toLowerCase();

  if (userCatLower === 'sc') {
    matchesDirectCat = q.startsWith('sc_') || q.startsWith('sc_i_') || q.startsWith('sc_ii_') || q.startsWith('sc_iii_');
  } else if (userCatLower.startsWith('bc_')) {
    matchesDirectCat = q.startsWith(userCatLower + '_');
  } else {
    matchesDirectCat = q.startsWith(userCatLower + '_');
  }

  // Open Merit (OC) eligibility: all students regardless of category are eligible for OC open seats!
  const isOpenMerit = q.startsWith('oc_');

  if (matchesDirectCat || isOpenMerit) {
    return {
      isEligible: true,
      isDirectCategory: matchesDirectCat,
      isOpenMerit: isOpenMerit,
    };
  }

  return { isEligible: false, isDirectCategory: false, isOpenMerit: false };
}

export async function runApPredictorAnalysis(
  input: ApPredictorInput
): Promise<ApPredictorResponse> {
  const quotaData = await getApQuotaClosingRanks();

  if (!quotaData) {
    return {
      summary: {
        totalMatches: 0,
        highChanceCount: 0,
        competitiveCount: 0,
        dreamCount: 0,
        steepReachCount: 0,
        insufficientDataCount: 0,
        analyzedCollegesCount: 0,
        totalDatasetRecords: 0,
        withinRangeCount: 0,
        nearRangeCount: 0,
        outsideRangeCount: 0,
      },
      matches: [],
      appliedFilter: input,
    };
  }

  const {
    rank: studentRank,
    category = 'OC',
    gender = 'M',
    region = 'AU',
    specialCategory = 'NONE',
    collegeCode = 'ALL',
    branch = 'ALL',
    collegeQuery = '',
    sortBy = 'SELECTIVE',
  } = input;

  const queryNormalized = (collegeQuery || '').toLowerCase().trim();
  const matches: ApCollegeBranchMatch[] = [];

  let highChanceCount = 0;
  let competitiveCount = 0;
  let dreamCount = 0;
  let steepReachCount = 0;
  let insufficientDataCount = 0;
  let totalRecords = 0;

  for (const [cCode, college] of Object.entries(quotaData) as [string, any][]) {
    // Target college filter
    if (collegeCode && collegeCode !== 'ALL') {
      if (cCode.toUpperCase() !== collegeCode.toUpperCase()) continue;
    }

    // Search query filter
    if (queryNormalized) {
      const cName = (college.name || '').toLowerCase();
      const codeStr = cCode.toLowerCase();
      const dist = (college.district || '').toLowerCase();
      if (!cName.includes(queryNormalized) && !codeStr.includes(queryNormalized) && !dist.includes(queryNormalized)) {
        continue;
      }
    }

    const branches = college.branches || {};

    for (const [bCode, bData] of Object.entries(branches) as [string, any][]) {
      // Branch filter
      if (branch === 'ALL_CS') {
        if (!AP_CS_ALLIED_BRANCHES.includes(bCode)) continue;
      } else if (branch !== 'ALL' && bCode !== branch) {
        continue;
      }

      const quotas = bData.quotas || {};
      let bestClosingRank = 0;
      let minObservedRank = 0;
      let totalMatchingRecords = 0;
      let primaryMatchedQuota = '';
      let bestCategoryClosing = 0;
      let bestOpenClosing = 0;

      for (const [quotaKey, qStats] of Object.entries(quotas) as [string, any][]) {
        totalRecords += qStats.count || 1;
        const evalResult = isQuotaEligible(quotaKey, category, gender, region, specialCategory);

        if (evalResult.isEligible) {
          const closing = qStats.max || qStats.min || 0;
          const minR = qStats.min || closing;
          totalMatchingRecords += qStats.count || 1;

          if (evalResult.isDirectCategory) {
            if (closing > bestCategoryClosing) {
              bestCategoryClosing = closing;
            }
          }
          if (evalResult.isOpenMerit) {
            if (closing > bestOpenClosing) {
              bestOpenClosing = closing;
            }
          }

          // Candidate gets the most advantageous eligible closing rank
          if (closing > bestClosingRank) {
            bestClosingRank = closing;
            minObservedRank = minR;
            primaryMatchedQuota = quotaKey.toUpperCase();
          }
        }
      }

      let verdict: VerdictClassification = 'INSUFFICIENT_DATA';
      let classification: MatchClassification = 'INSUFFICIENT_DATA';
      let verdictLabel = 'Insufficient Data';
      let classificationLabel = 'Insufficient 2026 Data';
      let probabilityPercent = 0;
      let badgeStyle = {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-700',
        indicator: 'bg-slate-400',
      };
      let whyExplanation = '';

      const rankBuffer = bestClosingRank > 0 ? bestClosingRank - studentRank : 0;
      const percentDiffFromClosing =
        bestClosingRank > 0 ? Math.round(((studentRank - bestClosingRank) / bestClosingRank) * 100) : 0;

      if (totalMatchingRecords === 0 || bestClosingRank === 0) {
        verdict = 'INSUFFICIENT_DATA';
        classification = 'INSUFFICIENT_DATA';
        verdictLabel = 'Insufficient 2026 Data';
        classificationLabel = 'Insufficient 2026 Data';
        probabilityPercent = 0;
        badgeStyle = {
          bg: 'bg-slate-100 dark:bg-slate-800/80',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-300 dark:border-slate-700',
          indicator: 'bg-slate-400',
        };
        whyExplanation = `No verified 2026 allotment records were observed for this discipline matching ${category} (${gender}) in ${region} region.`;
        insufficientDataCount++;
      } else if (studentRank <= bestClosingRank) {
        // High Chance: Student rank is strictly within or better than last allotted rank
        verdict = 'HIGH_CHANCE';
        classification = 'WITHIN_RANGE';
        verdictLabel = '🔥 Safe Bet / Top Shot!';
        classificationLabel = 'Within Observed Range';
        probabilityPercent = Math.min(98, Math.max(88, Math.round(98 - Math.abs(percentDiffFromClosing) * 0.2)));
        badgeStyle = {
          bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-500/40 dark:border-emerald-400/30',
          indicator: 'bg-emerald-500',
        };
        const bufferStr = Math.abs(rankBuffer).toLocaleString('en-IN');
        whyExplanation = `Your rank ${studentRank.toLocaleString('en-IN')} is comfortably within the 2026 closing rank of ${bestClosingRank.toLocaleString('en-IN')} (+${bufferStr} rank security cushion). High probability of allotment in early counseling rounds.`;
        highChanceCount++;
      } else if (studentRank <= Math.round(bestClosingRank * 1.15)) {
        // Medium / Competitive Chance (within 10-15% above closing rank)
        verdict = 'COMPETITIVE';
        classification = 'NEAR_RANGE';
        verdictLabel = '⚡ Target Reachable';
        classificationLabel = 'Borderline (Near Range)';
        probabilityPercent = Math.max(50, Math.round(75 - (percentDiffFromClosing * 1.5)));
        badgeStyle = {
          bg: 'bg-amber-500/15 dark:bg-amber-500/20',
          text: 'text-amber-800 dark:text-amber-300',
          border: 'border-amber-500/40 dark:border-amber-400/30',
          indicator: 'bg-amber-500',
        };
        const diffStr = Math.abs(rankBuffer).toLocaleString('en-IN');
        whyExplanation = `Your rank is within ${Math.abs(percentDiffFromClosing)}% of the 2026 closing rank (${diffStr} ranks above last allotted ${bestClosingRank.toLocaleString('en-IN')}). Very viable in Round 2 / Round 3 sliding rounds.`;
        competitiveCount++;
      } else if (studentRank <= Math.round(bestClosingRank * 1.35)) {
        // Ambitious / Dream Shot
        verdict = 'DREAM';
        classification = 'OUTSIDE_RANGE';
        verdictLabel = '🚀 Dream Shot';
        classificationLabel = 'Outside Observed Range';
        probabilityPercent = Math.max(20, Math.round(45 - (percentDiffFromClosing * 0.8)));
        badgeStyle = {
          bg: 'bg-violet-500/15 dark:bg-violet-500/20',
          text: 'text-violet-700 dark:text-violet-300',
          border: 'border-violet-500/40 dark:border-violet-400/30',
          indicator: 'bg-violet-500',
        };
        whyExplanation = `Aspirational option (${percentDiffFromClosing}% higher than 2026 cutoff). Recommended to place in top web options in case of sliding seat vacancies.`;
        dreamCount++;
      } else {
        // Steep Reach
        verdict = 'STEEP_REACH';
        classification = 'OUTSIDE_RANGE';
        verdictLabel = '🏔️ Steep Reach';
        classificationLabel = 'Outside Observed Range';
        probabilityPercent = Math.max(5, Math.round(15 - Math.min(10, percentDiffFromClosing * 0.1)));
        badgeStyle = {
          bg: 'bg-slate-200/80 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-300 dark:border-slate-700',
          indicator: 'bg-slate-400',
        };
        whyExplanation = `Your rank (${studentRank.toLocaleString('en-IN')}) is substantially above the 2026 closing rank (${bestClosingRank.toLocaleString('en-IN')}). High competition observed.`;
        steepReachCount++;
      }

      let quotaDescription = `Matched ${primaryMatchedQuota || 'General Quota'} (${totalMatchingRecords} allotments)`;
      if (bestCategoryClosing > 0 && bestOpenClosing > 0 && category !== 'OC') {
        quotaDescription = `${category} Quota: ${bestCategoryClosing.toLocaleString('en-IN')} | Open Competition: ${bestOpenClosing.toLocaleString('en-IN')}`;
      }

      matches.push({
        id: `${cCode}_${bCode}`,
        collegeCode: cCode,
        collegeName: college.name || cCode,
        district: college.district || '',
        branchCode: bCode,
        branchName: bData.name || bCode,
        studentRank,
        minObservedRank,
        maxObservedRank: bestClosingRank,
        closingRank: bestClosingRank,
        medianObservedRank: Math.round((minObservedRank + bestClosingRank) / 2),
        matchingRecordCount: totalMatchingRecords,
        classification,
        verdict,
        verdictLabel,
        classificationLabel,
        probabilityPercent,
        badgeStyle,
        whyExplanation,
        rankBuffer,
        percentDiffFromClosing,
        matchedQuotaCode: primaryMatchedQuota,
        quotaDescription,
        categoryQuotaClosing: bestCategoryClosing || undefined,
        openQuotaClosing: bestOpenClosing || undefined,
        dataBasis: 'Strict 2026 APSCHE Allotment Quota Engine',
      });
    }
  }

  // Sorting
  if (sortBy === 'SELECTIVE') {
    const priority: Record<VerdictClassification, number> = {
      HIGH_CHANCE: 1,
      COMPETITIVE: 2,
      DREAM: 3,
      STEEP_REACH: 4,
      INSUFFICIENT_DATA: 5,
    };
    matches.sort((a, b) => {
      if (priority[a.verdict] !== priority[b.verdict]) {
        return priority[a.verdict] - priority[b.verdict];
      }
      return b.closingRank - a.closingRank;
    });
  } else if (sortBy === 'CLOSING_DESC') {
    matches.sort((a, b) => b.closingRank - a.closingRank);
  } else if (sortBy === 'CLOSEST_TO_RANK') {
    matches.sort((a, b) => Math.abs(a.closingRank - studentRank) - Math.abs(b.closingRank - studentRank));
  } else if (sortBy === 'NAME_ASC') {
    matches.sort((a, b) => a.collegeName.localeCompare(b.collegeName));
  }

  return {
    summary: {
      totalMatches: matches.length,
      highChanceCount,
      competitiveCount,
      dreamCount,
      steepReachCount,
      insufficientDataCount,
      analyzedCollegesCount: Object.keys(quotaData).length,
      totalDatasetRecords: totalRecords || 100621,
      withinRangeCount: highChanceCount,
      nearRangeCount: competitiveCount,
      outsideRangeCount: dreamCount + steepReachCount,
    },
    matches,
    appliedFilter: input,
  };
}
