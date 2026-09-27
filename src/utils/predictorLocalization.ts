/**
 * AP & TG College Predictor Localization & Dynamic Salutation Engine
 * Strict native Telugu script (తెలుగు లిపి) with dynamic gender-based addressing (Bro vs Sister / బ్రో vs సిస్టర్).
 * Absolutely ZERO Teenglish / Latin transliteration allowed in Telugu text.
 */

export type GenderInput = 'Male' | 'Female' | 'M' | 'F' | string;

export interface PredictorVerdictResult {
  level: 'HIGH' | 'MODERATE' | 'LOW';
  badgeText: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    indicator: string;
  };
  cardStyle: {
    border: string;
    bg: string;
    shadow: string;
  };
  salutationEn: 'Bro' | 'Sister';
  salutationTe: 'బ్రో' | 'సిస్టర్';
  englishText: string;
  teluguText: string;
}

/**
 * Computes bilingual dynamic verdict based on eligibility margin and student gender.
 *
 * @param isEligible User rank <= last admitted/observed closing rank
 * @param isBorderline User rank within 10% cutoff margin
 * @param gender 'Male' | 'Female' | 'M' | 'F'
 */
export function getPredictorVerdict(
  isEligible: boolean,
  isBorderline: boolean,
  gender: GenderInput
): PredictorVerdictResult {
  const isFemale =
    String(gender).trim().toUpperCase() === 'FEMALE' ||
    String(gender).trim().toUpperCase() === 'F';

  const salutationEn: 'Bro' | 'Sister' = isFemale ? 'Sister' : 'Bro';
  const salutationTe: 'బ్రో' | 'సిస్టర్' = isFemale ? 'సిస్టర్' : 'బ్రో';

  // 1. High Probability (User Rank <= Observed Last Rank)
  if (isEligible) {
    return {
      level: 'HIGH',
      badgeText: 'HIGH PROBABILITY 😎🔥',
      badgeStyle: {
        bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-500/40 dark:border-emerald-400/30',
        indicator: 'bg-emerald-500',
      },
      cardStyle: {
        border: 'border-emerald-500/40 dark:border-emerald-500/40',
        bg: 'bg-emerald-50/80 dark:bg-emerald-950/20',
        shadow: 'shadow-emerald-500/10',
      },
      salutationEn,
      salutationTe,
      englishText: `Strong chance of seat allotment! All the best, ${salutationEn}! 😎✨`,
      teluguText: `సీటు వచ్చే అవకాశం ఖచ్చితంగా ఉంది ${salutationTe}! ఆల్ ది బెస్ట్ 😎✨`,
    };
  }

  // 2. Moderate / Borderline Chance (User Rank within 10% cutoff margin)
  if (isBorderline) {
    return {
      level: 'MODERATE',
      badgeText: 'BORDERLINE / SLIDING ROUND CHANCE ⚡',
      badgeStyle: {
        bg: 'bg-amber-500/15 dark:bg-amber-500/20',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-500/40 dark:border-amber-400/30',
        indicator: 'bg-amber-500',
      },
      cardStyle: {
        border: 'border-amber-500/40 dark:border-amber-500/40',
        bg: 'bg-amber-50/80 dark:bg-amber-950/20',
        shadow: 'shadow-amber-500/10',
      },
      salutationEn,
      salutationTe,
      englishText: `Competitive margin! Tough fight, try in sliding rounds, ${salutationEn}! ⚡`,
      teluguText: `పోటీ గట్టిగానే ఉంది ${salutationTe}! స్లైడింగ్ రౌండ్లలో ఖచ్చితంగా ప్రయత్నించండి ⚡`,
    };
  }

  // 3. Low / Unlikely Chance (User Rank significantly higher than Last Rank)
  return {
    level: 'LOW',
    badgeText: 'LOW PROBABILITY 🥺',
    badgeStyle: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30 dark:border-rose-500/20',
      indicator: 'bg-rose-500',
    },
    cardStyle: {
      border: 'border-rose-500/30 dark:border-rose-500/30',
      bg: 'bg-rose-50/80 dark:bg-rose-950/10',
      shadow: 'shadow-rose-500/5',
    },
    salutationEn,
    salutationTe,
    englishText: `Seat allotment unlikely. Don't lose hope, ${salutationEn}... let's explore other great colleges! 🫂`,
    teluguText: `ఈ కాలేజీలో సీటు రావడం కాస్త కష్టమే ${salutationTe}... బాధపడకండి, ఇతర మంచి ఆప్షన్లను చూద్దాం 🥺`,
  };
}
