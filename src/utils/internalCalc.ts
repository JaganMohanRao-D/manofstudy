import { InternalCalcState, InternalCalcResult, GradeCutoffRow } from '../types';

export function calculateInternalCutoff(state: InternalCalcState): InternalCalcResult {
  const {
    mid1Scored,
    mid1Max,
    mid2Scored,
    mid2Max,
    calcMethod,
    assignmentScored,
    assignmentMax,
    attendanceScored,
    attendanceMax,
    externalMaxMarks,
    targetGradePercent,
    minPassingExternalPercent,
  } = state;

  // Normalized mid percentages
  const m1Pct = mid1Max > 0 ? (mid1Scored / mid1Max) * 100 : 0;
  const m2Pct = mid2Max > 0 ? (mid2Scored / mid2Max) * 100 : 0;

  const higherMid = Math.max(m1Pct, m2Pct);
  const lowerMid = Math.min(m1Pct, m2Pct);

  let consolidatedMidPct = 0;
  switch (calcMethod) {
    case 'best_of_2':
      consolidatedMidPct = higherMid;
      break;
    case 'weighted_80_20':
      consolidatedMidPct = (0.8 * higherMid) + (0.2 * lowerMid);
      break;
    case 'weighted_70_30':
      consolidatedMidPct = (0.7 * higherMid) + (0.3 * lowerMid);
      break;
    case 'average_50_50':
      consolidatedMidPct = (m1Pct + m2Pct) / 2;
      break;
  }

  // Base mid component max (standard 20 or scaled by user's mid1Max)
  const midComponentMax = Math.max(mid1Max, mid2Max) || 20;
  const calculatedMidMarks = Number(((consolidatedMidPct / 100) * midComponentMax).toFixed(2));

  // Consolidated internals
  const consolidatedInternalScored = Number(
    (calculatedMidMarks + assignmentScored + attendanceScored).toFixed(2)
  );
  const consolidatedInternalMax = midComponentMax + assignmentMax + attendanceMax;
  const consolidatedInternalPercent = consolidatedInternalMax > 0 
    ? Number(((consolidatedInternalScored / consolidatedInternalMax) * 100).toFixed(2)) 
    : 0;

  // Total Course Calculations
  const totalCourseMax = consolidatedInternalMax + externalMaxMarks;
  const targetTotalMarksRequired = Number(((targetGradePercent / 100) * totalCourseMax).toFixed(2));

  const rawRequiredExternal = targetTotalMarksRequired - consolidatedInternalScored;
  const minPassingExternalMarks = Math.ceil((minPassingExternalPercent / 100) * externalMaxMarks);

  const requiredExternalScore = Number(
    Math.max(rawRequiredExternal, minPassingExternalMarks).toFixed(2)
  );

  const isAchievable = rawRequiredExternal <= externalMaxMarks;
  const isAlreadyPassed = consolidatedInternalScored >= targetTotalMarksRequired;

  const maxPossibleTotalMarks = consolidatedInternalScored + externalMaxMarks;
  const maxAchievableTotalPercent = Number(
    ((maxPossibleTotalMarks / totalCourseMax) * 100).toFixed(1)
  );

  const shortfallMarks = !isAchievable 
    ? Number((rawRequiredExternal - externalMaxMarks).toFixed(2)) 
    : 0;

  const requiredExternalPercent = externalMaxMarks > 0 
    ? Number(((requiredExternalScore / externalMaxMarks) * 100).toFixed(1)) 
    : 0;

  // Generate Cutoff Breakdown for All Academic Milestones
  const gradeMilestones = [
    { gradeName: 'Pass Minimum', minPercent: 40 },
    { gradeName: 'Second Class', minPercent: 50 },
    { gradeName: 'First Class (FC)', minPercent: 60 },
    { gradeName: 'Distinction (FCD)', minPercent: 75 },
    { gradeName: 'Elite Exemplary', minPercent: 85 },
    { gradeName: 'Outstanding (O Grade)', minPercent: 90 },
  ];

  const cutoffBreakdown: GradeCutoffRow[] = gradeMilestones.map(milestone => {
    const neededTotal = (milestone.minPercent / 100) * totalCourseMax;
    const rawReq = neededTotal - consolidatedInternalScored;
    const reqScore = Number(Math.max(rawReq, minPassingExternalMarks).toFixed(1));
    const reqPct = Number(((reqScore / externalMaxMarks) * 100).toFixed(1));
    const achievable = rawReq <= externalMaxMarks;

    let status: GradeCutoffRow['status'] = 'safe';
    if (!achievable) {
      status = 'impossible';
    } else if (reqPct > 75) {
      status = 'warning';
    } else {
      status = 'safe';
    }

    return {
      gradeName: milestone.gradeName,
      minPercent: milestone.minPercent,
      targetTotalMarks: Number(neededTotal.toFixed(1)),
      requiredExternalMarks: reqScore,
      requiredExternalPercent: reqPct,
      isAchievable: achievable,
      status,
    };
  });

  return {
    calculatedMidMarks,
    consolidatedInternalScored,
    consolidatedInternalMax,
    consolidatedInternalPercent,
    totalCourseMax,
    targetTotalMarksRequired,
    requiredExternalScore,
    requiredExternalPercent,
    minPassingExternalMarks,
    isAchievable,
    isAlreadyPassed,
    maxAchievableTotalPercent,
    shortfallMarks,
    cutoffBreakdown,
  };
}
