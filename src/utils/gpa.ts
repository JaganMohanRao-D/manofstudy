import { GpaFormula, GpaFormulaId, GpaConversionResult, FutureGpaState, FutureGpaResult } from '../types';

export const GPA_FORMULAS: GpaFormula[] = [
  {
    id: 'jntu',
    name: 'JNTU (JNTUK, JNTUH, JNTUA) & Affiliated Colleges',
    expression: '(CGPA - 0.75) * 10',
    description: 'Official academic conversion rule mandated by Jawaharlal Nehru Technological Universities.',
    regionTag: 'Andhra Pradesh & Telangana',
    calculate: (score: number) => Math.max(0, (score - 0.75) * 10),
  },
  {
    id: 'anna_univ',
    name: 'Anna University & Affiliated Colleges',
    expression: 'CGPA * 10',
    description: 'Direct 10x multiplier mandated in Anna University official academic regulations.',
    regionTag: 'Tamil Nadu',
    calculate: (score: number) => score * 10,
  },
  {
    id: 'vtu_karnataka',
    name: 'VTU Belagavi & Karnataka Autonomous Colleges',
    expression: '(CGPA - 0.75) * 10',
    description: 'Standard formula prescribed by Visvesvaraya Technological University (VTU).',
    regionTag: 'Karnataka',
    calculate: (score: number) => Math.max(0, (score - 0.75) * 10),
  },
  {
    id: 'osmania_ou',
    name: 'Osmania University (OU) & Telangana Colleges',
    expression: '(CGPA - 0.5) * 10',
    description: 'Standard formula adopted for conversion of CGPA in Osmania University guidelines.',
    regionTag: 'Telangana',
    calculate: (score: number) => Math.max(0, (score - 0.5) * 10),
  },
  {
    id: 'andhra_univ',
    name: 'Andhra University (AU) & AU Region Colleges',
    expression: 'CGPA * 10',
    description: 'Direct decimal conversion followed by Andhra University academic council.',
    regionTag: 'Andhra Pradesh',
    calculate: (score: number) => score * 10,
  },
  {
    id: 'vit',
    name: 'VIT (Vellore, Chennai, AP, Bhopal)',
    expression: 'CGPA * 10',
    description: 'Official conversion factor prescribed by Vellore Institute of Technology.',
    regionTag: 'National / Deemed',
    calculate: (score: number) => score * 10,
  },
  {
    id: 'srm',
    name: 'SRM Institute of Science & Technology',
    expression: 'CGPA * 10',
    description: 'Official conversion regulation followed across all SRM University campuses.',
    regionTag: 'National / Deemed',
    calculate: (score: number) => score * 10,
  },
  {
    id: 'amrita',
    name: 'Amrita Vishwa Vidyapeetham',
    expression: 'CGPA * 10',
    description: 'Standard percentage conversion mandated by Amrita University examination wing.',
    regionTag: 'National / Deemed',
    calculate: (score: number) => score * 10,
  },
  {
    id: 'cbse_standard',
    name: 'CBSE / Standard Multiplier (9.5x)',
    expression: 'CGPA * 9.5',
    description: 'Traditional standard conversion factor used by CBSE, Mumbai, and Pune Universities.',
    regionTag: 'National / State Boards',
    calculate: (score: number) => score * 9.5,
  },
  {
    id: 'aicte_standard',
    name: 'AICTE Standard (Autonomous Colleges)',
    expression: '(CGPA - 0.75) * 10',
    description: 'Standard conversion recommendation by the All India Council for Technical Education.',
    regionTag: 'All India AICTE',
    calculate: (score: number) => Math.max(0, (score - 0.75) * 10),
  },
  {
    id: 'custom',
    name: 'Custom Formula (User-Defined Multiplier & Offset)',
    expression: '(CGPA - Offset) * Multiplier',
    description: 'Configure your custom multiplier and deduction offset according to your university transcript.',
    regionTag: 'Custom Formula',
    calculate: (score: number, customMultiplier = 10, customOffset = 0.75) => 
      Math.max(0, (score - customOffset) * customMultiplier),
  },
];

export function convertGpaToPercentage(
  score: number, 
  formulaId: GpaFormulaId,
  customMultiplier = 10,
  customOffset = 0.75
): GpaConversionResult {
  const cleanScore = Math.max(0, Math.min(10, score));
  const formula = GPA_FORMULAS.find((f) => f.id === formulaId) || GPA_FORMULAS[0];
  
  const rawPercentage = formula.calculate(cleanScore, customMultiplier, customOffset);
  const percentage = Number(Math.min(100, Math.max(0, rawPercentage)).toFixed(2));

  // Determine Letter Grade & Classification based on UGC standard 10-point scale
  let grade = 'F';
  let gradePoint = 0;
  let classification = 'Fail';
  let statusColor = '#EF4444'; // Rose / Red

  if (cleanScore >= 9.0) {
    grade = 'O (Outstanding)';
    gradePoint = 10;
    classification = 'First Class with Distinction (Honours)';
    statusColor = '#4F46E5'; // Indigo-600
  } else if (cleanScore >= 8.0) {
    grade = 'A+ (Excellent)';
    gradePoint = 9;
    classification = 'First Class with Distinction';
    statusColor = '#059669'; // Emerald-600
  } else if (cleanScore >= 7.0) {
    grade = 'A (Very Good)';
    gradePoint = 8;
    classification = 'First Class';
    statusColor = '#2563EB'; // Blue-600
  } else if (cleanScore >= 6.0) {
    grade = 'B+ (Good)';
    gradePoint = 7;
    classification = 'Higher Second Class';
    statusColor = '#D97706'; // Amber-600
  } else if (cleanScore >= 5.5) {
    grade = 'B (Above Average)';
    gradePoint = 6;
    classification = 'Second Class';
    statusColor = '#EA580C'; // Orange-600
  } else if (cleanScore >= 5.0) {
    grade = 'C (Average)';
    gradePoint = 5;
    classification = 'Pass Class';
    statusColor = '#CA8A04'; // Yellow-600
  } else if (cleanScore >= 4.0) {
    grade = 'P (Pass)';
    gradePoint = 4;
    classification = 'Pass';
    statusColor = '#64748B'; // Slate-500
  } else {
    grade = 'F (Fail)';
    gradePoint = 0;
    classification = 'Fail / Re-appear Required';
    statusColor = '#E11D48'; // Rose-600
  }

  // Estimated 4.0 scale equivalent for international applications
  const usGpaEquivalent = Number(((cleanScore / 10) * 4.0).toFixed(2));

  return {
    score: cleanScore,
    percentage,
    grade,
    gradePoint,
    classification,
    usGpaEquivalent,
    statusColor,
  };
}

export function predictFutureGpa(params: FutureGpaState): FutureGpaResult {
  const { currentCgpa, completedSemesters, totalSemesters, targetCgpa } = params;

  const total = Math.max(1, totalSemesters);
  const done = Math.max(0, Math.min(total - 1, completedSemesters));
  const remaining = Math.max(1, total - done);

  // Maximum possible CGPA if student scores 10.0 in all remaining semesters
  const maxPossible = Number(
    (((currentCgpa * done) + (10.0 * remaining)) / total).toFixed(2)
  );

  // Formula: target = (current * done + req * remaining) / total
  // req * remaining = target * total - current * done
  const required = (targetCgpa * total - currentCgpa * done) / remaining;
  const roundedRequired = Number(required.toFixed(2));

  if (targetCgpa <= currentCgpa && done > 0) {
    return {
      requiredSgpa: Math.max(0, roundedRequired),
      remainingSemesters: remaining,
      isFeasible: true,
      maxPossibleCgpa: maxPossible,
      status: 'already_achieved',
      message: `Your current CGPA (${currentCgpa.toFixed(2)}) already meets or exceeds your target (${targetCgpa.toFixed(2)}).`,
    };
  }

  if (roundedRequired > 10.0) {
    return {
      requiredSgpa: roundedRequired,
      remainingSemesters: remaining,
      isFeasible: false,
      maxPossibleCgpa: maxPossible,
      status: 'impossible',
      message: `Mathematically unreachable. Even with a perfect 10.0 SGPA in all ${remaining} remaining semester(s), highest achievable CGPA is ${maxPossible.toFixed(2)}.`,
    };
  }

  if (roundedRequired <= 0) {
    return {
      requiredSgpa: 0,
      remainingSemesters: remaining,
      isFeasible: true,
      maxPossibleCgpa: maxPossible,
      status: 'easy',
      message: `Target achieved! You need just passing marks in the remaining semesters to sustain your goal.`,
    };
  }

  let status: 'easy' | 'moderate' | 'challenging' = 'moderate';
  let advice = '';

  if (roundedRequired <= 7.0) {
    status = 'easy';
    advice = `Easily reachable with regular preparation and attendance.`;
  } else if (roundedRequired <= 8.5) {
    status = 'moderate';
    advice = `Solid target. Aim for scoring in the 75–85% range in theory and lab exams.`;
  } else {
    status = 'challenging';
    advice = `Requires top-tier performance (A+ / O grades) across registered credit courses.`;
  }

  return {
    requiredSgpa: roundedRequired,
    remainingSemesters: remaining,
    isFeasible: true,
    maxPossibleCgpa: maxPossible,
    status,
    message: `You need an average SGPA of ${roundedRequired.toFixed(2)} across the next ${remaining} semester(s) to hit ${targetCgpa.toFixed(2)} CGPA. ${advice}`,
  };
}

