import {
  CAREER_PROFILES,
  DEFAULT_TECHNICAL_SKILLS,
  SKILL_LEVEL_VALUES,
  CareerProfile,
  SkillLevel,
  RoadmapMilestone,
} from '../data/careerRequirementsData';

export interface StudentProfile {
  // Academic
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  branch: string;
  cgpa: string | number;
  semester?: string;

  // Technical skills
  skills: Record<string, SkillLevel>;
  customSkills: { id: string; name: string; level: SkillLevel }[];

  // Portfolio
  projectsCount: number;
  internshipsCount: number;
  hackathonsCount: number;
  certificationsCount: number;
  githubExperience: 'none' | 'basic' | 'active_repo' | 'frequent_contributor';
  openSourceExperience: 'none' | 'beginner' | 'contributed_prs';

  // Career Goal
  careerGoalId: string;
  customCareerGoalTitle?: string;
}

export interface SkillComparisonItem {
  skillId: string;
  name: string;
  currentLevel: SkillLevel;
  currentPercent: number;
  targetLevel: SkillLevel;
  targetPercent: number;
  gapPercent: number;
  weight: number;
  status: 'strength' | 'needs_improvement' | 'major_gap';
  whyReason: string;
  nextSteps: string[];
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

export interface GapAnalysisResult {
  careerTitle: string;
  careerTagline: string;
  careerDescription: string;
  matchScore: number; // 0 to 100
  disclaimer: string;

  strengths: {
    title: string;
    description: string;
    badge: string;
    type: 'skill' | 'portfolio' | 'academic';
  }[];

  needsImprovement: {
    title: string;
    description: string;
    badge: string;
    type: 'skill' | 'portfolio' | 'academic';
    why: string;
    nextStep: string;
  }[];

  majorGaps: {
    title: string;
    description: string;
    badge: string;
    type: 'skill' | 'portfolio' | 'academic';
    why: string;
    nextStep: string;
    priorityWeight: number;
  }[];

  comparisons: SkillComparisonItem[];
  topPriorities: TopPriorityItem[];
  nextActions: string[];
  roadmap: RoadmapMilestone[];
  generatedAt: string;
}

// Preset Expo Demo Profile
export const EXPO_DEMO_PROFILE: StudentProfile = {
  year: '1st Year',
  branch: 'CSE',
  cgpa: 8.2,
  semester: 'Sem 2',
  careerGoalId: 'software-developer',
  skills: {
    python: 'basic',
    java: 'none',
    html: 'intermediate',
    css: 'intermediate',
    javascript: 'basic',
    dsa: 'beginner',
    sql: 'none',
    git_github: 'basic',
    c: 'basic',
    cpp: 'none',
    oop: 'none',
    dbms: 'none',
    computer_networks: 'none',
    operating_systems: 'none',
    cloud: 'none',
    ai_ml: 'none',
    problem_solving: 'beginner',
    communication: 'basic',
  },
  customSkills: [],
  projectsCount: 2,
  internshipsCount: 0,
  hackathonsCount: 1,
  certificationsCount: 1,
  githubExperience: 'basic',
  openSourceExperience: 'none',
};

export const SAMPLE_PROFILES: { label: string; description: string; profile: StudentProfile }[] = [
  {
    label: '1st Year CSE — Software Developer (Sample Profile)',
    description: 'Python (Basic), HTML/CSS (Inter), DSA (Beginner), SQL (None), 2 Projects.',
    profile: EXPO_DEMO_PROFILE,
  },
  {
    label: '2nd Year IT — Full Stack Aspirant',
    description: 'JavaScript & React (Inter), Node.js (Basic), SQL (Basic), DSA (Beginner), 3 Projects.',
    profile: {
      year: '2nd Year',
      branch: 'IT',
      cgpa: 7.8,
      semester: 'Sem 4',
      careerGoalId: 'full-stack-developer',
      skills: {
        html: 'intermediate',
        css: 'intermediate',
        javascript: 'intermediate',
        python: 'beginner',
        java: 'basic',
        c: 'basic',
        cpp: 'none',
        dsa: 'beginner',
        sql: 'basic',
        dbms: 'basic',
        git_github: 'intermediate',
        oop: 'basic',
        computer_networks: 'beginner',
        operating_systems: 'beginner',
        cloud: 'beginner',
        ai_ml: 'none',
        problem_solving: 'basic',
        communication: 'intermediate',
      },
      customSkills: [{ id: 'react', name: 'React.js', level: 'intermediate' }],
      projectsCount: 3,
      internshipsCount: 0,
      hackathonsCount: 2,
      certificationsCount: 2,
      githubExperience: 'active_repo',
      openSourceExperience: 'beginner',
    },
  },
  {
    label: '3rd Year AI/DS — AI/ML Engineer Candidate',
    description: 'Python (Inter), NumPy/Pandas (Inter), ML (Basic), Deep Learning (None), 2 Projects.',
    profile: {
      year: '3rd Year',
      branch: 'AI & Data Science',
      cgpa: 8.5,
      semester: 'Sem 6',
      careerGoalId: 'ai-ml-engineer',
      skills: {
        python: 'intermediate',
        ai_ml: 'basic',
        dsa: 'basic',
        sql: 'basic',
        git_github: 'basic',
        c: 'beginner',
        cpp: 'none',
        java: 'none',
        html: 'beginner',
        css: 'beginner',
        javascript: 'none',
        oop: 'basic',
        dbms: 'basic',
        computer_networks: 'none',
        operating_systems: 'beginner',
        cloud: 'beginner',
        problem_solving: 'intermediate',
        communication: 'intermediate',
      },
      customSkills: [{ id: 'pandas', name: 'Pandas & NumPy', level: 'intermediate' }],
      projectsCount: 2,
      internshipsCount: 1,
      hackathonsCount: 2,
      certificationsCount: 3,
      githubExperience: 'active_repo',
      openSourceExperience: 'beginner',
    },
  },
];

/**
 * Deterministic Career Gap Calculator
 * Strictly calculates match score, categorizes strengths/needs-improvement/major-gaps,
 * prioritizes top 3 gaps mathematically, and generates targeted micro-actions.
 */
export function calculateCareerGap(profile: StudentProfile): GapAnalysisResult {
  // 1. Resolve career profile
  let career = CAREER_PROFILES.find((c) => c.id === profile.careerGoalId);
  if (!career) {
    // Default to software-developer or generic fallback
    career = CAREER_PROFILES[0];
  }

  const careerTitle = profile.careerGoalId === 'custom' && profile.customCareerGoalTitle
    ? profile.customCareerGoalTitle
    : career.title;

  const careerTagline = career.tagline;
  const careerDescription = career.description;

  // 2. Skill-by-skill evaluation
  const comparisons: SkillComparisonItem[] = [];
  let totalSkillScore = 0;
  let totalSkillWeight = 0;

  for (const req of career.requirements) {
    const currentLevel: SkillLevel = profile.skills[req.skillId] || 'none';
    const currentPercent = SKILL_LEVEL_VALUES[currentLevel];
    const targetPercent = SKILL_LEVEL_VALUES[req.targetLevel];
    const gapPercent = Math.max(0, targetPercent - currentPercent);

    // Skill definition name lookup
    const skillDef = DEFAULT_TECHNICAL_SKILLS.find((s) => s.id === req.skillId);
    const skillName = skillDef ? skillDef.name : req.skillId.toUpperCase();

    // Ratio capped at 100%
    const ratio = Math.min(100, Math.round((currentPercent / Math.max(targetPercent, 25)) * 100));
    totalSkillScore += ratio * req.weight;
    totalSkillWeight += req.weight;

    let status: 'strength' | 'needs_improvement' | 'major_gap' = 'needs_improvement';
    if (currentPercent >= targetPercent || (currentPercent >= 75 && gapPercent <= 25)) {
      status = 'strength';
    } else if (gapPercent >= 50 || (req.weight === 3 && currentPercent <= 25)) {
      status = 'major_gap';
    } else {
      status = 'needs_improvement';
    }

    comparisons.push({
      skillId: req.skillId,
      name: skillName,
      currentLevel,
      currentPercent,
      targetLevel: req.targetLevel,
      targetPercent,
      gapPercent,
      weight: req.weight,
      status,
      whyReason: req.whyReason,
      nextSteps: req.nextStepsIfWeak,
    });
  }

  // Include non-required skills that the student has high proficiency in as additional strengths!
  // e.g. If applying for Software Developer and has HTML/CSS Intermediate, recognize it.
  const extraStrengths: { title: string; description: string; badge: string; type: 'skill' | 'portfolio' | 'academic' }[] = [];
  
  Object.entries(profile.skills).forEach(([skillId, level]) => {
    const isRequired = career!.requirements.some((r) => r.skillId === skillId);
    if (!isRequired && (level === 'intermediate' || level === 'advanced')) {
      const def = DEFAULT_TECHNICAL_SKILLS.find((s) => s.id === skillId);
      const name = def ? def.name : skillId;
      extraStrengths.push({
        title: `${name} (${level.charAt(0).toUpperCase() + level.slice(1)})`,
        description: `Proficiency in ${name} adds versatility to your engineering profile and demonstrates self-driven learning.`,
        badge: 'Bonus Competency',
        type: 'skill',
      });
    }
  });

  // Custom skills that are intermediate or advanced
  profile.customSkills.forEach((cs) => {
    if (cs.level === 'intermediate' || cs.level === 'advanced') {
      extraStrengths.push({
        title: `${cs.name} (${cs.level.charAt(0).toUpperCase() + cs.level.slice(1)})`,
        description: `Specialized proficiency in ${cs.name} showcases distinct industry-ready capability.`,
        badge: 'Custom Specialization',
        type: 'skill',
      });
    }
  });

  // 3. Portfolio & Academic scoring
  const expectedProjects = career.benchmarks.recommendedProjectsByYear[profile.year] || 2;
  const projectRatio = Math.min(100, Math.round((profile.projectsCount / Math.max(expectedProjects, 1)) * 100));

  const expectedInternships = career.benchmarks.recommendedInternshipsByYear[profile.year] || 0;
  const internshipRatio = expectedInternships === 0
    ? (profile.internshipsCount > 0 ? 100 : 85)
    : Math.min(100, Math.round((profile.internshipsCount / expectedInternships) * 100));

  const expectedHackathons = career.benchmarks.recommendedHackathonsByYear[profile.year] || 1;
  const hackathonRatio = Math.min(100, Math.round((profile.hackathonsCount / Math.max(expectedHackathons, 1)) * 100));

  const parsedCgpa = typeof profile.cgpa === 'number' ? profile.cgpa : parseFloat(profile.cgpa) || 7.0;
  const normalizedCgpa = parsedCgpa > 10 ? parsedCgpa / 10 : parsedCgpa; // handle percentage e.g. 78% -> 7.8
  const cgpaRatio = Math.min(100, Math.round((normalizedCgpa / career.benchmarks.minCgpa) * 100));

  // Overall Match Calculation (70% Technical Skills, 30% Portfolio & Academic)
  const averageSkillRatio = totalSkillWeight > 0 ? Math.round(totalSkillScore / totalSkillWeight) : 50;
  const portfolioScore = Math.round((projectRatio * 0.4) + (internshipRatio * 0.25) + (hackathonRatio * 0.15) + (cgpaRatio * 0.2));
  const rawMatchScore = Math.round((averageSkillRatio * 0.7) + (portfolioScore * 0.3));
  const matchScore = Math.min(96, Math.max(12, rawMatchScore)); // bound realistically

  // 4. Categorize STRENGTHS, NEEDS IMPROVEMENT, and MAJOR GAPS
  const strengths: GapAnalysisResult['strengths'] = [];
  const needsImprovement: GapAnalysisResult['needsImprovement'] = [];
  const majorGaps: GapAnalysisResult['majorGaps'] = [];

  // Categorize evaluated requirements
  comparisons.forEach((comp) => {
    if (comp.status === 'strength') {
      strengths.push({
        title: comp.name,
        description: `Current level: ${comp.currentLevel.toUpperCase()} (Target: ${comp.targetLevel.toUpperCase()}). Meets or exceeds benchmark for ${careerTitle}.`,
        badge: 'Validated Level',
        type: 'skill',
      });
    } else if (comp.status === 'major_gap') {
      majorGaps.push({
        title: comp.name,
        description: `Currently ${comp.currentLevel.toUpperCase()} vs required ${comp.targetLevel.toUpperCase()} (${comp.gapPercent}% deficit). High-impact screening criterion.`,
        badge: comp.weight === 3 ? 'Critical Core Gap' : 'Major Gap',
        type: 'skill',
        why: comp.whyReason,
        nextStep: comp.nextSteps[0] || `Dedicate study time to ${comp.name} fundamentals.`,
        priorityWeight: comp.weight * (comp.gapPercent || 25),
      });
    } else {
      needsImprovement.push({
        title: comp.name,
        description: `Currently ${comp.currentLevel.toUpperCase()} vs required ${comp.targetLevel.toUpperCase()}. Foundation exists but needs practical elevation.`,
        badge: 'Intermediate Gap',
        type: 'skill',
        why: comp.whyReason,
        nextStep: comp.nextSteps[0] || `Build hands-on exercises in ${comp.name}.`,
      });
    }
  });

  // Append extra skills to strengths
  extraStrengths.forEach((es) => strengths.push(es));

  // Add portfolio strengths / gaps
  if (profile.projectsCount >= expectedProjects) {
    strengths.push({
      title: `${profile.projectsCount} Built Projects`,
      description: `Satisfies the benchmark for ${profile.year} candidates. Gives practical demonstration of software principles.`,
      badge: 'Portfolio Strong',
      type: 'portfolio',
    });
  } else {
    majorGaps.push({
      title: 'Project Portfolio Under-Indexed',
      description: `You have ${profile.projectsCount} project(s); ${profile.year} candidates are recommended to have at least ${expectedProjects} deployed projects.`,
      badge: 'Portfolio Gap',
      type: 'portfolio',
      why: 'Recruiters and campus interview panels inspect actual code repositories and deployed links to verify skills.',
      nextStep: 'Build 1 end-to-end project and publish it on GitHub with a clear README and live demo link.',
      priorityWeight: 60,
    });
  }

  if (profile.githubExperience === 'active_repo' || profile.githubExperience === 'frequent_contributor') {
    strengths.push({
      title: 'Active GitHub Portfolio',
      description: 'Regular commit history and clean repositories signal engineering discipline to tech recruiters.',
      badge: 'Verified Signal',
      type: 'portfolio',
    });
  }

  if (normalizedCgpa >= 8.0) {
    strengths.push({
      title: `Strong Academic CGPA (${normalizedCgpa.toFixed(1)})`,
      description: 'Easily clears standard campus placement eligibility cutoffs (usually 6.5 - 7.5 CGPA).',
      badge: 'Placement Eligible',
      type: 'academic',
    });
  } else if (normalizedCgpa < career.benchmarks.minCgpa) {
    needsImprovement.push({
      title: `Academic CGPA Cutoff Margin (${normalizedCgpa.toFixed(1)})`,
      description: `Target benchmark for top tier placement shortlists is ${career.benchmarks.minCgpa}+ CGPA. Maintain steady internal marks.`,
      badge: 'Cutoff Sensitivity',
      type: 'academic',
      why: 'Tier-1 and product recruitment portals use automated CGPA filters to eliminate bottom applicant percentiles.',
      nextStep: 'Use the MOS GPA Hub & Backlog Planner to target internal examination scores above 80%.',
    });
  }

  // 5. Determine 🔥 TOP 3 PRIORITIES
  // Rank major gaps and needs improvement by calculated impact weight (weight * gap)
  const prioritizedCandidates = [...comparisons]
    .filter((c) => c.status !== 'strength')
    .sort((a, b) => {
      const scoreA = a.weight * a.gapPercent;
      const scoreB = b.weight * b.gapPercent;
      return scoreB - scoreA;
    });

  const top3Candidates = prioritizedCandidates.slice(0, 3);
  const topPriorities: TopPriorityItem[] = top3Candidates.map((c, index) => ({
    rank: index + 1,
    skillId: c.skillId,
    skillName: c.name,
    currentLevelLabel: c.currentLevel.toUpperCase(),
    targetLevelLabel: c.targetLevel.toUpperCase(),
    currentPercent: c.currentPercent,
    targetPercent: c.targetPercent,
    whyItMatters: c.whyReason,
    suggestedNextStep: c.nextSteps[0] || `Focus on ${c.name} fundamental concepts first.`,
  }));

  // 6. Generate 🎯 YOUR NEXT 3 ACTIONS (Concrete, focused, micro-steps)
  const nextActions: string[] = [];
  if (topPriorities.length > 0 && topPriorities[0].suggestedNextStep) {
    nextActions.push(topPriorities[0].suggestedNextStep);
  }
  if (topPriorities.length > 1 && topPriorities[1].suggestedNextStep) {
    nextActions.push(topPriorities[1].suggestedNextStep);
  }
  if (topPriorities.length > 2 && topPriorities[2].suggestedNextStep) {
    nextActions.push(topPriorities[2].suggestedNextStep);
  }

  // Fallbacks if fewer than 3 actions
  if (nextActions.length < 1) nextActions.push('Solve 5 beginner DSA problems on LeetCode/HackerRank.');
  if (nextActions.length < 2) nextActions.push('Build and deploy 1 project repository with a clean README.');
  if (nextActions.length < 3) nextActions.push('Master SQL query fundamentals (SELECT, WHERE, GROUP BY, JOINs).');

  return {
    careerTitle,
    careerTagline,
    careerDescription,
    matchScore,
    disclaimer: 'Profile Match is an approximate analytical indicator comparing your self-reported inputs against target role benchmarks. It is an educational guide, not an employability prediction or hiring guarantee.',
    strengths,
    needsImprovement,
    majorGaps,
    comparisons,
    topPriorities,
    nextActions: nextActions.slice(0, 3),
    roadmap: career.roadmap,
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

/**
 * What-If Scenario Re-calculator
 * Takes the original profile and simulated overrides, and computes the updated score and gap deltas.
 */
export function simulateWhatIf(
  originalProfile: StudentProfile,
  overrides: {
    skills?: Record<string, SkillLevel>;
    projectsCount?: number;
    internshipsCount?: number;
    hackathonsCount?: number;
  }
): {
  originalScore: number;
  simulatedScore: number;
  scoreDelta: number;
  resolvedGaps: string[];
  newStrengthsCount: number;
} {
  const originalResult = calculateCareerGap(originalProfile);

  const simulatedProfile: StudentProfile = {
    ...originalProfile,
    skills: {
      ...originalProfile.skills,
      ...(overrides.skills || {}),
    },
    projectsCount: overrides.projectsCount !== undefined ? overrides.projectsCount : originalProfile.projectsCount,
    internshipsCount: overrides.internshipsCount !== undefined ? overrides.internshipsCount : originalProfile.internshipsCount,
    hackathonsCount: overrides.hackathonsCount !== undefined ? overrides.hackathonsCount : originalProfile.hackathonsCount,
  };

  const simulatedResult = calculateCareerGap(simulatedProfile);
  const scoreDelta = simulatedResult.matchScore - originalResult.matchScore;

  // Track which major gaps were reduced or resolved
  const resolvedGaps: string[] = [];
  originalResult.majorGaps.forEach((og) => {
    const isStillMajor = simulatedResult.majorGaps.some((sg) => sg.title === og.title);
    if (!isStillMajor) {
      resolvedGaps.push(og.title);
    }
  });

  return {
    originalScore: originalResult.matchScore,
    simulatedScore: simulatedResult.matchScore,
    scoreDelta,
    resolvedGaps,
    newStrengthsCount: simulatedResult.strengths.length - originalResult.strengths.length,
  };
}
