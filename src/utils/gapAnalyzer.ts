import { BRANCHES, CAREERS, CareerDirection, ENTREPRENEUR_QUESTIONS, ENTREPRENEUR_SKILLS, getBranch, getCareer, DIRECTION_LABELS, GapSkill, AssessmentQuestion } from '../data/gapAnalyzerData';

export type SkillLevel = 'none' | 'beginner' | 'basic' | 'intermediate' | 'advanced';

export interface StudentProfile {
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  branch: string;
  cgpa: string | number;
  semester?: string;
  direction: CareerDirection;
  careerGoalId?: string;
  skills: Record<string, SkillLevel>;
  customSkills: { id: string; name: string; level: SkillLevel }[];
  projectsCount: number;
  internshipsCount: number;
  hackathonsCount: number;
  certificationsCount: number;
  githubExperience: 'none' | 'basic' | 'active_repo' | 'frequent_contributor';
  openSourceExperience: 'none' | 'beginner' | 'contributed_prs';
}

export interface TopPriorityItem {
  rank: number;
  skillId: string;
  skillName: string;
  currentLevelLabel: string;
  targetLevelLabel: string;
  currentPercent: number;
  targetPercent: number;
  whyItMatters: string;
  suggestedNextStep: string;
}

export interface SkillComparisonItem {
  skillId: string;
  name: string;
  currentLevel: SkillLevel;
  currentWeight: number;
  currentPercent: number;
  targetLevel: SkillLevel;
  targetWeight: number;
  targetPercent: number;
  gapPercent: number;
  weight: number;
  status: 'strength' | 'needs_improvement' | 'major_gap';
  whyReason: string;
  nextSteps: string[];
}

export interface GapAnalysisResult {
  careerTitle: string;
  careerTagline: string;
  careerDescription: string;
  matchScore: number;
  skillsScore: number;
  projectScore: number;
  expScore: number;
  skillCoveragePercent: number;
  skillGapPercent: number;
  skillsAtTarget: number;
  skillsAssessed: number;
  disclaimer: string;
  strengths: { title: string; description: string; badge: string; type: 'skill' | 'portfolio' | 'academic' }[];
  needsImprovement: { title: string; description: string; badge: string; type: 'skill' | 'portfolio' | 'academic'; why: string; nextStep: string }[];
  majorGaps: { title: string; description: string; badge: string; type: 'skill' | 'portfolio' | 'academic'; why: string; nextStep: string; priorityWeight: number }[];
  comparisons: SkillComparisonItem[];
  topPriorities: { rank: number; skillId: string; skillName: string; currentLevelLabel: string; targetLevelLabel: string; currentPercent: number; targetPercent: number; whyItMatters: string; suggestedNextStep: string }[];
  nextActions: string[];
  roadmap: { stageNumber: number; title: string; focusArea: string; skills: string[]; deliverable: string; estimatedTime: string }[];
  generatedAt: string;
  direction: CareerDirection;
  branchName: string;
  careerName: string;
}

/** Strict 0 to 4 numeric scale */
export const LEVEL: Record<SkillLevel, number> = {
  none: 0,
  beginner: 1,
  basic: 2,
  intermediate: 3,
  advanced: 4,
};

export const SKILL_NUMERIC_WEIGHT = LEVEL;

export const label = (v: SkillLevel) => {
  switch (v) {
    case 'none': return 'None (Not learned)';
    case 'beginner': return 'Beginner (Theory only)';
    case 'basic': return 'Basic (Guided tutorials)';
    case 'intermediate': return 'Intermediate (Mini-projects)';
    case 'advanced': return 'Advanced (Independent mastery)';
    default: return 'None';
  }
};

function selectedSkills(profile: StudentProfile) {
  const branch = getBranch(profile.branch);
  if (profile.direction === 'entrepreneur') {
    return {
      skills: ENTREPRENEUR_SKILLS,
      questions: ENTREPRENEUR_QUESTIONS,
      requirements: ENTREPRENEUR_SKILLS.map((s, i) => ({
        skillId: s.id,
        target: (i < 2 ? 'intermediate' : 'basic') as SkillLevel,
        weight: i < 2 ? 3 : 2,
        why: s.description,
        next: `Practice ${s.name.toLowerCase()} through an empirical real-world experiment with customer interviews.`,
      })),
      careerTitle: 'Entrepreneur / Startup Founder',
      description: `Validate real problems and customers connected to ${branch.name.toLowerCase()} without requiring immediate venture capital.`,
      projects: ['Validate one real customer problem through 10+ user interviews', 'Build a lean MVP or service prototype and document user feedback'],
    };
  }

  const career = getCareer(profile.careerGoalId || '');
  if (career) {
    const skills = career.skills
      .map((x) => branch.domainSkills.find((s) => s.id === x.skillId))
      .filter(Boolean) as GapSkill[];
    return {
      skills,
      questions: career.questions,
      requirements: career.skills,
      careerTitle: career.title,
      description: career.shortDescription,
      projects: career.projects,
    };
  }

  return {
    skills: branch.domainSkills,
    questions: [],
    requirements: branch.domainSkills.slice(0, 5).map((s, i) => ({
      skillId: s.id,
      target: (i < 2 ? 'basic' : 'beginner') as SkillLevel,
      weight: 1,
      why: s.description,
      next: `Start with a structured practical exercise in ${s.name}.`,
    })),
    careerTitle: 'Branch Career Exploration',
    description: `Foundational readiness assessment for core ${branch.name} engineering roles.`,
    projects: ['Domain foundation repository with verifiable code/simulation proof'],
  };
}

export function calculateCareerGap(profile: StudentProfile): GapAnalysisResult {
  const branch = getBranch(profile.branch);
  const selected = selectedSkills(profile);

  // 1. Calculate Skill Comparisons with 0-4 weights
  const comparisons: SkillComparisonItem[] = selected.requirements.map((req) => {
    const current = profile.skills[req.skillId] || 'none';
    const target = req.target;
    const currentWeight = LEVEL[current];
    const targetWeight = LEVEL[target];
    const currentPercent = Math.round((currentWeight / 4) * 100);
    const targetPercent = Math.round((targetWeight / 4) * 100);
    const gapPercent = Math.max(0, targetPercent - currentPercent);

    let status: 'strength' | 'needs_improvement' | 'major_gap' = 'needs_improvement';
    if (currentWeight >= targetWeight) {
      status = 'strength';
    } else if (targetWeight - currentWeight >= 2 || currentWeight === 0) {
      status = 'major_gap';
    }

    const skill = selected.skills.find((s) => s.id === req.skillId);
    return {
      skillId: req.skillId,
      name: skill?.name || req.skillId,
      currentLevel: current,
      currentWeight,
      currentPercent,
      targetLevel: target,
      targetWeight,
      targetPercent,
      gapPercent,
      weight: req.weight,
      status,
      whyReason: req.why,
      nextSteps: [req.next],
    };
  });

  // 2. Strict Readiness Formula:
  // - skillsScore = (totalAcquiredWeight / totalRequiredWeight) * 70
  // - projectScore = Math.min((projectsCount / targetProjects) * 20, 20)
  // - expScore = Math.min((hackathons + internships) * 5, 10)
  // - finalReadiness = Math.round(skillsScore + projectScore + expScore)

  const totalRequiredWeight = comparisons.reduce((sum, c) => sum + (c.targetWeight * c.weight), 0) || 1;
  const totalAcquiredWeight = comparisons.reduce((sum, c) => {
    const effectiveWeight = Math.min(c.currentWeight, c.targetWeight);
    return sum + (effectiveWeight * c.weight);
  }, 0);

  const skillsScore = Math.min(70, Number(((totalAcquiredWeight / totalRequiredWeight) * 70).toFixed(1)));

  const targetProjects = profile.year === '1st Year' ? 1 : profile.year === '2nd Year' ? 2 : 3;
  const projectsCount = Math.max(0, Number(profile.projectsCount) || 0);
  const projectScore = Math.min(20, Number(((projectsCount / targetProjects) * 20).toFixed(1)));

  const internships = Math.max(0, Number(profile.internshipsCount) || 0);
  const hackathons = Math.max(0, Number(profile.hackathonsCount) || 0);
  const expScore = Math.min(10, (internships + hackathons) * 5);

  const finalReadiness = Math.min(100, Math.round(skillsScore + projectScore + expScore));
  const skillCoveragePercent = Math.round((totalAcquiredWeight / totalRequiredWeight) * 100);
  const skillGapPercent = Math.max(0, 100 - skillCoveragePercent);

  // 3. Categorize Strengths, Improvements, and Priority Gaps
  const strengths: { title: string; description: string; badge: string; type: 'skill' | 'portfolio' | 'academic' }[] =
    comparisons
      .filter((c) => c.status === 'strength')
      .map((c) => ({
        title: c.name,
        description: `Your level (${label(c.currentLevel)}) meets the role target of ${label(c.targetLevel)}.`,
        badge: 'Current Strength',
        type: 'skill' as const,
      }));

  if (projectsCount >= targetProjects) {
    strengths.push({
      title: `${projectsCount} Practical Project(s) Built`,
      description: `Solid portfolio evidence matching ${profile.year} engineering expectations.`,
      badge: 'Portfolio Strength',
      type: 'portfolio',
    });
  }

  if (internships > 0 || hackathons > 0) {
    strengths.push({
      title: `Active Experience (${internships} Internships, ${hackathons} Hackathons)`,
      description: 'Demonstrates competitive drive and real-world collaboration.',
      badge: 'Competitive Edge',
      type: 'portfolio',
    });
  }

  const needsImprovement = comparisons
    .filter((c) => c.status === 'needs_improvement')
    .map((c) => ({
      title: c.name,
      description: `Current: ${label(c.currentLevel)} • Target: ${label(c.targetLevel)}`,
      badge: 'Build Further',
      type: 'skill' as const,
      why: c.whyReason,
      nextStep: c.nextSteps[0],
    }));

  const majorGaps = comparisons
    .filter((c) => c.status === 'major_gap')
    .map((c) => ({
      title: c.name,
      description: `Current: ${label(c.currentLevel)} • Target: ${label(c.targetLevel)}`,
      badge: 'Priority Gap',
      type: 'skill' as const,
      why: c.whyReason,
      nextStep: c.nextSteps[0],
      priorityWeight: c.gapPercent * c.weight,
    }));

  const top = [...comparisons]
    .filter((c) => c.status !== 'strength')
    .sort((a, b) => (b.gapPercent * b.weight) - (a.gapPercent * a.weight))
    .slice(0, 3)
    .map((c, i) => ({
      rank: i + 1,
      skillId: c.skillId,
      skillName: c.name,
      currentLevelLabel: label(c.currentLevel),
      targetLevelLabel: label(c.targetLevel),
      currentPercent: c.currentPercent,
      targetPercent: c.targetPercent,
      whyItMatters: c.whyReason,
      suggestedNextStep: c.nextSteps[0],
    }));

  const nextActions = top.map((x) => x.suggestedNextStep);
  if (projectsCount === 0) {
    nextActions.push('Build and deploy at least 1 standalone project with a comprehensive README and code repository.');
  }
  while (nextActions.length < 3) {
    nextActions.push('Participate in an upcoming student technical hackathon or open source contribution to demonstrate applied competence.');
  }

  const skillsAtTarget = comparisons.filter((c) => c.status === 'strength').length;
  const skillsAssessed = comparisons.length;

  return {
    careerTitle: selected.careerTitle,
    careerTagline: DIRECTION_LABELS[profile.direction],
    careerDescription: selected.description,
    matchScore: finalReadiness,
    skillsScore,
    projectScore,
    expScore,
    skillCoveragePercent,
    skillGapPercent,
    skillsAtTarget,
    skillsAssessed,
    disclaimer:
      'This analysis is based on self-reported inputs and target industry benchmarks. It provides grounded educational guidance to pinpoint skill and portfolio deficiencies, without making predictive placement guarantees.',
    strengths,
    needsImprovement,
    majorGaps,
    comparisons,
    topPriorities: top,
    nextActions: nextActions.slice(0, 3),
    roadmap: selected.projects.map((p, i) => ({
      stageNumber: i + 1,
      title: p,
      focusArea: 'Build → Document → Verifiable Repo Proof',
      skills: top.slice(0, 2).map((x) => x.skillName),
      deliverable: p,
      estimatedTime: 'Next 3–6 weeks',
    })),
    generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    direction: profile.direction,
    branchName: branch.name,
    careerName: selected.careerTitle,
  };
}

export const EXPO_DEMO_PROFILE: StudentProfile = {
  year: '1st Year',
  branch: 'cse',
  cgpa: 8.2,
  semester: 'Sem 2',
  direction: 'industry',
  careerGoalId: 'cse-software',
  skills: { dsa: 'beginner', oop: 'beginner', dbms: 'none', git: 'basic', linux: 'beginner', web: 'basic' },
  customSkills: [],
  projectsCount: 1,
  internshipsCount: 0,
  hackathonsCount: 0,
  certificationsCount: 0,
  githubExperience: 'basic',
  openSourceExperience: 'none',
};

export const SAMPLE_PROFILES = [
  { label: '1st Year CSE', description: 'Software foundation sample', profile: EXPO_DEMO_PROFILE },
];

export function simulateWhatIf(
  originalProfile: StudentProfile,
  overrides: { skills?: Record<string, SkillLevel>; projectsCount?: number; internshipsCount?: number; hackathonsCount?: number }
) {
  const before = calculateCareerGap(originalProfile);
  const after = calculateCareerGap({
    ...originalProfile,
    skills: { ...originalProfile.skills, ...(overrides.skills || {}) },
    projectsCount: overrides.projectsCount ?? originalProfile.projectsCount,
    internshipsCount: overrides.internshipsCount ?? originalProfile.internshipsCount,
    hackathonsCount: overrides.hackathonsCount ?? originalProfile.hackathonsCount,
  });
  return {
    originalScore: before.matchScore,
    simulatedScore: after.matchScore,
    scoreDelta: after.matchScore - before.matchScore,
    resolvedGaps: before.majorGaps.filter((g) => !after.majorGaps.some((a) => a.title === g.title)).map((g) => g.title),
    newStrengthsCount: after.strengths.length - before.strengths.length,
  };
}
