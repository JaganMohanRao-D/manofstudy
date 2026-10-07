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
 * Computes a descriptive bilingual verdict from observed 2026 cutoff position and student gender.\n * This is historical classification only; it is not a probability or admission guarantee.
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

  // 1. Within the observed 2026 range
  if (isEligible) {
    return {
      level: 'HIGH',
      badgeText: 'WITHIN OBSERVED RANGE',
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
      englishText: `Your rank is within the observed 2026 closing-rank range for this option, ${salutationEn}. Treat this as historical guidance, not a guarantee.`,
      teluguText: `ఈ ఎంపికకు సంబంధించిన 2026లో కనిపించిన క్లోజింగ్ ర్యాంక్ పరిధిలో మీ ర్యాంక్ ఉంది ${salutationTe}. ఇది చారిత్రక సమాచారం మాత్రమే, హామీ కాదు.`,
    };
  }

  // 2. Near the observed range
  if (isBorderline) {
    return {
      level: 'MODERATE',
      badgeText: 'NEAR OBSERVED RANGE',
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
      englishText: `Your rank is close to the observed 2026 closing rank, ${salutationEn}. Consider it a borderline historical match.`,
      teluguText: `మీ ర్యాంక్ 2026లో కనిపించిన క్లోజింగ్ ర్యాంక్‌కు దగ్గరగా ఉంది ${salutationTe}. దీన్ని బోర్డర్‌లైన్ చారిత్రక మ్యాచ్‌గా మాత్రమే చూడండి.`,
    };
  }

  // 3. Outside the observed range
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
    englishText: `Seat allotment unlikely. Don't lose hope, ${salutationEn}... let's explore other options! 🥺`,
    teluguText: `ఈ కాలేజీలో సీటు రావడం కాస్త కష్టమే ${salutationTe}... బాధపడకండి, ఇతర మంచి ఆప్షన్లను చూద్దాం 🥺`,
  };
}
