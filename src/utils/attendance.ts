import { AttendanceResult } from '../types';

export function calculateAttendance(
  totalClasses: number,
  attendedClasses: number,
  minRequiredPercent: number
): AttendanceResult {
  const total = Math.max(0, Math.floor(totalClasses));
  const attended = Math.max(0, Math.min(total, Math.floor(attendedClasses)));
  const minReq = Math.max(1, Math.min(100, minRequiredPercent));

  if (total === 0) {
    return {
      currentPercent: 100,
      isSafe: true,
      status: 'safe',
      classesMissable: 0,
      classesRequired: 0,
      totalConducted: 0,
      totalAttended: 0,
      bunkImpacts: [],
      attendanceImpacts: [],
    };
  }

  const currentPercent = Number(((attended / total) * 100).toFixed(2));
  const isSafe = currentPercent >= minReq;
  
  let status: 'safe' | 'warning' | 'danger';
  if (currentPercent >= minReq + 5) {
    status = 'safe';
  } else if (currentPercent >= minReq) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  const reqRatio = minReq / 100;
  
  let classesMissable = 0;
  let classesRequired = 0;

  if (isSafe) {
    // Formula: (attended) / (total + X) >= reqRatio => total + X <= attended / reqRatio => X <= (attended / reqRatio) - total
    if (reqRatio > 0) {
      const maxMiss = Math.floor(attended / reqRatio - total);
      classesMissable = Math.max(0, maxMiss);
    }
  } else {
    // Formula: (attended + Y) / (total + Y) >= reqRatio => attended + Y >= reqRatio*total + reqRatio*Y
    // Y * (1 - reqRatio) >= reqRatio*total - attended => Y >= (reqRatio*total - attended) / (1 - reqRatio)
    if (reqRatio < 1) {
      const needed = Math.ceil((reqRatio * total - attended) / (1 - reqRatio));
      classesRequired = Math.max(1, needed);
    } else {
      classesRequired = 999;
    }
  }

  // Generate dynamic simulation matrices
  const bunkIncrements = [1, 2, 3, 5];
  const bunkImpacts = bunkIncrements.map((missCount) => {
    const newTotal = total + missCount;
    const newPercent = Number(((attended / newTotal) * 100).toFixed(2));
    let impactStatus: 'safe' | 'warning' | 'danger' = 'safe';
    if (newPercent < minReq) {
      impactStatus = 'danger';
    } else if (newPercent < minReq + 3) {
      impactStatus = 'warning';
    }
    return {
      scenario: `Miss next ${missCount} class${missCount > 1 ? 'es' : ''}`,
      classes: missCount,
      resultingPercent: newPercent,
      status: impactStatus,
    };
  });

  const attendIncrements = [1, 3, 5, 10];
  const attendanceImpacts = attendIncrements.map((attendCount) => {
    const newTotal = total + attendCount;
    const newAttended = attended + attendCount;
    const newPercent = Number(((newAttended / newTotal) * 100).toFixed(2));
    let impactStatus: 'safe' | 'warning' | 'danger' = 'safe';
    if (newPercent < minReq) {
      impactStatus = 'danger';
    } else if (newPercent < minReq + 3) {
      impactStatus = 'warning';
    }
    return {
      scenario: `Attend next ${attendCount} class${attendCount > 1 ? 'es' : ''}`,
      classes: attendCount,
      resultingPercent: newPercent,
      status: impactStatus,
    };
  });

  return {
    currentPercent,
    isSafe,
    status,
    classesMissable,
    classesRequired,
    totalConducted: total,
    totalAttended: attended,
    bunkImpacts,
    attendanceImpacts,
  };
}
