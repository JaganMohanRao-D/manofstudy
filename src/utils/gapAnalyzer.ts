import {
  AcademicStage,
  ALL_BRANCHES,
  ALL_CAREERS,
  CareerDirection,
  AdaptiveQuestion,
  getYearExpectedLevel,
  selectAdaptiveQuestions,
  getRecommendedProjects,
  RecommendedProject,
  SkillLevel,
} from '../data/gapAnalyzerData';

export type { SkillLevel, AcademicStage, CareerDirection };

export interface StudentProfile {
  branch: string;
  academicStage: AcademicStage;
  targetCareerId: string;
  // Personal profile answers
  personalAnswers: {
    confidence?: string;
    time_weekly?: string;
    project_experience?: string;
    internship_experience?: string;
    independent_learning?: string;
    explaining_work?: string;
  };
  // Competency question answers: questionId/competencyId -> 0 to 4
  competencyAnswers: Record<string, number>;

  // Legacy optional fields for backward compatibility
  year?: string;
  cgpa?: string | number;
  semester?: string;
  direction?: CareerDirection;
  careerGoalId?: string;
  skills?: Record<string, SkillLevel>;
  customSkills?: { id: string; name: string; level: SkillLevel }[];
  projectsCount?: number;
  internshipsCount?: number;
  hackathonsCount?: number;
  certificationsCount?: number;
  githubExperience?: string;
  openSourceExperience?: string;
}

export interface CompetencyAnalysisItem {
  competencyId: string;
  competencyName: string;
  category: 'core' | 'tools' | 'systems' | 'applied' | 'communication';
  currentNumeric: number;
  targetNumeric: number;
  gapNumeric: number;
  currentLevelLabel: string;
  targetLevelLabel: string;
  status: 'strong_foundation' | 'developing' | 'needs_improvement' | 'major_gap';
  importance: 'Core' | 'High' | 'Medium';
  priorityOrder: number;
  whatIsMissing: string;
  whyItMatters: string;
  whatToDo: string;
  howToProve: string;
  // Legacy fields
  skillId: string;
  name: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  currentWeight: number;
  targetWeight: number;
  currentPercent: number;
  targetPercent: number;
  gapPercent: number;
  weight: number;
  whyReason: string;
  nextSteps: string[];
}

export type SkillComparisonItem = CompetencyAnalysisItem;

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
  whatIsMissing?: string;
  whatToDo?: string;
  howToProve?: string;
}

export interface CareerTransitionDetails {
  fromBranch: string;
  toCareer: string;
  isTransition: boolean;
  transferableStrengths: string[];
  bridgeGaps: string[];
  strategicAdvice: string;
}

export interface GapAnalysisResult {
  careerTitle: string;
  careerTagline: string;
  careerDescription: string;
  branchName: string;
  branchId: string;
  academicStage: AcademicStage;

  isCareerTransition: boolean;
  transitionDetails?: CareerTransitionDetails;

  readinessSnapshot: {
    statusLabel: string;
    headline: string;
    summary: string;
    strengthsCount: number;
    developingCount: number;
    gapsCount: number;
    proofStatus: string;
    timeCommitmentAdvice: string;
  };

  priorityGaps: TopPriorityItem[];
  comparisons: CompetencyAnalysisItem[];

  categorizedGaps: {
    skillGaps: string[];
    academicCoreGaps: string[];
    projectGaps: string[];
    experienceGaps: string[];
    portfolioGaps: string[];
    interviewReadinessGaps: string[];
  };

  recommendedProjects: RecommendedProject[];

  actionMilestones: {
    next7Days: string[];
    next30Days: string[];
    next90Days: string[];
    semesterGoal: string;
  };

  aiMentorBrief?: string;

  // Legacy fields for backward compatibility
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
  topPriorities: TopPriorityItem[];
  nextActions: string[];
  roadmap: { stageNumber: number; title: string; focusArea: string; skills: string[]; deliverable: string; estimatedTime: string }[];
  generatedAt: string;
  direction: CareerDirection;
  careerName: string;
}

export const LEVEL: Record<SkillLevel, number> = {
  none: 0,
  beginner: 1,
  basic: 2,
  intermediate: 3,
  advanced: 4,
};

export function label(level: SkillLevel): string {
  switch (level) {
    case 'none':
      return 'Not Started (0)';
    case 'beginner':
      return 'Beginner (1)';
    case 'basic':
      return 'Developing (2)';
    case 'intermediate':
      return 'Proficient (3)';
    case 'advanced':
      return 'Advanced (4)';
    default:
      return 'None';
  }
}

export function numericToSkillLevel(score: number): SkillLevel {
  if (score >= 3.5) return 'advanced';
  if (score >= 2.5) return 'intermediate';
  if (score >= 1.5) return 'basic';
  if (score >= 0.5) return 'beginner';
  return 'none';
}

export function numericToReadableLabel(score: number): string {
  if (score >= 3.5) return 'Advanced Mastery (4)';
  if (score >= 2.5) return 'Proficient / Industry Standard (3)';
  if (score >= 1.5) return 'Developing / Guided (2)';
  if (score >= 0.5) return 'Beginner / Syntax Awareness (1)';
  return 'Not Started (0)';
}

/**
 * Deterministic Gap Calculation Engine
 */
export function calculateCareerGap(profile: StudentProfile): GapAnalysisResult {
  const branch = ALL_BRANCHES.find((b) => b.id === profile.branch) || ALL_BRANCHES[0];
  const career = ALL_CAREERS.find((c) => c.id === profile.targetCareerId) || ALL_CAREERS[0];
  const stage = profile.academicStage || '1st Year – Sem 1';

  // 1. Resolve relevant questions for this branch + career + academic stage
  const questions: AdaptiveQuestion[] = selectAdaptiveQuestions(branch.id, career.id, stage);

  // 2. Evaluate each competency
  const comparisons: CompetencyAnalysisItem[] = questions.map((q) => {
    // Current score from student's answers (0 to 4)
    const currentScore =
      profile.competencyAnswers[q.competencyId] ??
      profile.competencyAnswers[q.id] ??
      (profile.skills && profile.skills[q.competencyId] ? LEVEL[profile.skills[q.competencyId]] : 0);

    const expectedScore = getYearExpectedLevel(stage, q.category);
    const gap = Math.max(0, expectedScore - currentScore);

    let status: 'strong_foundation' | 'developing' | 'needs_improvement' | 'major_gap' = 'strong_foundation';
    if (currentScore >= expectedScore) {
      status = 'strong_foundation';
    } else if (gap <= 1) {
      status = 'developing';
    } else if (gap <= 2) {
      status = 'needs_improvement';
    } else {
      status = 'major_gap';
    }

    const importance: 'Core' | 'High' | 'Medium' =
      q.category === 'core' ? 'Core' : q.category === 'tools' || q.category === 'applied' ? 'High' : 'Medium';

    // Tailor specific What/Why/How to Do/Proof based on competency
    const explanations = generateCompetencyGuidance(q.competencyId, q.competencyName, currentScore, expectedScore, career.title);

    return {
      competencyId: q.competencyId,
      competencyName: q.competencyName,
      category: q.category,
      currentNumeric: currentScore,
      targetNumeric: expectedScore,
      gapNumeric: gap,
      currentLevelLabel: numericToReadableLabel(currentScore),
      targetLevelLabel: numericToReadableLabel(expectedScore),
      status,
      importance,
      priorityOrder: gap * (importance === 'Core' ? 3 : importance === 'High' ? 2 : 1),
      whatIsMissing: explanations.whatIsMissing,
      whyItMatters: explanations.whyItMatters,
      whatToDo: explanations.whatToDo,
      howToProve: explanations.howToProve,

      // Legacy compatibility
      skillId: q.competencyId,
      name: q.competencyName,
      currentLevel: numericToSkillLevel(currentScore),
      targetLevel: numericToSkillLevel(expectedScore),
      currentWeight: currentScore,
      targetWeight: expectedScore,
      currentPercent: Math.round((currentScore / 4) * 100),
      targetPercent: Math.round((expectedScore / 4) * 100),
      gapPercent: Math.round((gap / 4) * 100),
      weight: importance === 'Core' ? 3 : 2,
      whyReason: explanations.whyItMatters,
      nextSteps: [explanations.whatToDo, explanations.howToProve],
    };
  });

  // Sort comparisons by priority (highest gap & highest importance first)
  comparisons.sort((a, b) => b.priorityOrder - a.priorityOrder);

  // 3. Extract Top Priorities (Top 3-4 gaps)
  const gapsOnly = comparisons.filter((c) => c.status !== 'strong_foundation');
  const topPriorityList = gapsOnly.slice(0, 4);

  const topPriorities: TopPriorityItem[] = topPriorityList.map((item, index) => ({
    rank: index + 1,
    skillId: item.competencyId,
    skillName: item.competencyName,
    currentLevelLabel: item.currentLevelLabel,
    targetLevelLabel: item.targetLevelLabel,
    currentPercent: item.currentPercent,
    targetPercent: item.targetPercent,
    whyItMatters: item.whyItMatters,
    suggestedNextStep: item.whatToDo,
    whatIsMissing: item.whatIsMissing,
    whatToDo: item.whatToDo,
    howToProve: item.howToProve,
  }));

  // 4. Check for Cross-Branch Career Transition
  const isCareerTransition =
    (branch.category === 'mechanical_aero' ||
      branch.category === 'civil_infra' ||
      branch.category === 'chemical_bio' ||
      branch.category === 'agri_food') &&
    (career.domain === 'software' || career.domain === 'data' || career.domain === 'cyber');

  let transitionDetails: CareerTransitionDetails | undefined = undefined;
  if (isCareerTransition) {
    transitionDetails = {
      fromBranch: branch.name,
      toCareer: career.title,
      isTransition: true,
      transferableStrengths: [
        `Strong mathematical and physical systems modeling from ${branch.name}.`,
        'Disciplined analytical problem breakdown, root-cause troubleshooting, and engineering rigor.',
        'Proven capability to tackle complex multi-variable engineering constraints under pressure.',
      ],
      bridgeGaps: [
        'Overcoming non-CS automated ATS resume screens through verifiable public GitHub repositories.',
        'Establishing consistent daily coding fluency outside standard college syllabus lectures.',
        'Building 2 multi-tier software projects to demonstrate practical domain independence.',
      ],
      strategicAdvice: `Transitioning from ${branch.name} into ${career.title} is a proven, highly rewarding pathway. Because college campus drives may initially favor CS/IT branches, your primary strategy must be empirical proof: deploy public applications, write clear technical READMEs, and showcase your problem-solving frequency on GitHub and LeetCode.`,
    };
  }

  // 5. Categorized Gaps Analysis
  const personal = profile.personalAnswers || {};
  const projectExp = personal.project_experience || 'none';
  const internExp = personal.internship_experience || 'none';
  const weeklyTime = personal.time_weekly || 'balanced';

  const skillGaps: string[] = topPriorityList.map(
    (g) => `${g.competencyName}: Currently at ${g.currentLevelLabel}, target is ${g.targetLevelLabel}.`
  );

  const academicCoreGaps: string[] = comparisons
    .filter((c) => c.category === 'core' && c.status !== 'strong_foundation')
    .map((c) => `${c.competencyName}: Needs deeper conceptual and algorithmic grounding.`);

  const projectGaps: string[] = [];
  if (projectExp === 'none' || projectExp === 'tutorials') {
    projectGaps.push('Lacks an independent, verifiable project built without tutorial hand-holding.');
    projectGaps.push('Needs a public GitHub or technical repository with architectural documentation.');
  } else if (projectExp === 'standalone') {
    projectGaps.push('Needs a multi-component, deployed application with persistent database/hardware proof.');
  }

  const experienceGaps: string[] = [];
  if (internExp === 'none') {
    experienceGaps.push('No formal technical internship or campus club leadership role recorded yet.');
    experienceGaps.push('Recommended: target a remote/virtual internship or college research project this semester.');
  }

  const portfolioGaps: string[] = [];
  const gitComp = comparisons.find((c) => c.competencyId === 'git');
  if (!gitComp || gitComp.currentNumeric < 2) {
    portfolioGaps.push('GitHub commit frequency is inactive or unorganized — recruiters look for a green commit calendar.');
  }
  portfolioGaps.push('Resume lacks quantified project bullet points (e.g. "reduced latency by 20%", "handled 500+ records").');

  const interviewReadinessGaps: string[] = [];
  const commComp = comparisons.find((c) => c.competencyId === 'interview_readiness' || c.competencyId === 'data_storytelling');
  if (!commComp || commComp.currentNumeric < 2.5) {
    interviewReadinessGaps.push('Technical articulation: practice walking through problem trade-offs and complexity aloud.');
  }

  // 6. Readiness Snapshot (Qualitative, transparent scoring — NO fake percentages)
  const strongCount = comparisons.filter((c) => c.status === 'strong_foundation').length;
  const devCount = comparisons.filter((c) => c.status === 'developing').length;
  const majorGapCount = comparisons.filter((c) => c.status === 'major_gap' || c.status === 'needs_improvement').length;

  let statusLabel = 'Early Stage Exploration';
  let headline = 'Laying Foundational Groundwork';
  let summary = 'You are in the early exploration phase. Focus on fundamental problem solving and establishing your technical toolchain.';

  if (strongCount >= comparisons.length * 0.7 && majorGapCount === 0) {
    statusLabel = 'Competitive Placement Profile';
    headline = 'Ahead of Academic Year Expectations';
    summary = 'Your verified technical foundations and tooling meet or exceed industry expectations for your current semester. Prioritize mock interviews and competitive portfolio polish.';
  } else if (strongCount >= comparisons.length * 0.45) {
    statusLabel = 'Approaching Industry Internship Ready';
    headline = 'Solid Core with Focused Gaps to Close';
    summary = 'You have established reliable core fundamentals. Closing the top 2 priority gaps will place you firmly in the competitive top quartile for off-campus and on-campus internships.';
  } else if (strongCount >= 2) {
    statusLabel = 'Active Foundation Building';
    headline = 'Steady Momentum in Progress';
    summary = 'You have initiated your core learning journey. Converting tutorial knowledge into independent project implementations is your primary growth lever.';
  }

  const proofStatus =
    projectExp === 'advanced' || projectExp === 'deployed'
      ? 'High Verifiable Proof'
      : projectExp === 'standalone'
      ? 'Moderate Proof (1 standalone repo)'
      : 'Low Verifiable Proof (Needs immediate public project)';

  const timeCommitmentAdvice =
    weeklyTime === 'intensive'
      ? '16+ hrs/week allows rapid gap closure within 4–6 weeks.'
      : weeklyTime === 'focused'
      ? '11–15 hrs/week provides the optimal balance between semester exams and placement prep.'
      : weeklyTime === 'light'
      ? '3–5 hrs/week is light; protect a non-negotiable 45-minute daily coding block to maintain momentum.'
      : '6–10 hrs/week provides steady, sustainable progress over a 12-week semester.';

  // 7. Recommended Concrete Projects
  const recommendedProjects = getRecommendedProjects(branch.id, career.id, stage);

  // 8. Action Milestones (Next 7, 30, 90 Days + Semester Goal)
  const top1 = topPriorities[0];
  const top2 = topPriorities[1];

  const actionMilestones = {
    next7Days: [
      `Set up your dedicated local engineering environment for ${career.title} (install IDE, Git CLI, and compiler/runtimes).`,
      top1 ? `Spend 45 minutes daily addressing ${top1.skillName}: ${top1.suggestedNextStep}` : 'Solve 5 fundamental problems independently.',
      'Initialize a clean, public GitHub repository with a detailed README specifying your semester goals.',
    ],
    next30Days: [
      `Complete the first milestone of "${recommendedProjects[0]?.title || 'your foundational domain project'}".`,
      top2 ? `Deep dive into ${top2.skillName}: establish practical muscle memory without tutorial copying.` : 'Build and test your project data models.',
      'Conduct 1 mock technical walkthrough with a peer or professor explaining your code/design choices.',
    ],
    next90Days: [
      `Fully ship and document "${recommendedProjects[0]?.title || 'your core project'}" with live deployment or video proof.`,
      'Achieve verifiable proficiency across all identified Core and High importance competencies.',
      'Update your technical resume with quantified project accomplishments and begin target company bookmarking.',
    ],
    semesterGoal: `Elevate your candidate status from "${statusLabel}" to an undisputed competitive contender for ${career.title} opportunities.`,
  };

  // 9. Legacy format bridges for backwards compatibility
  const strengths = comparisons
    .filter((c) => c.status === 'strong_foundation')
    .map((c) => ({
      title: c.competencyName,
      description: `Proficient at ${c.currentLevelLabel}. Meets or exceeds the expected benchmark (${c.targetLevelLabel}) for your stage.`,
      badge: 'Verified Foundation',
      type: 'skill' as const,
    }));

  const needsImprovement = comparisons
    .filter((c) => c.status === 'developing')
    .map((c) => ({
      title: c.competencyName,
      description: c.whatIsMissing,
      badge: 'Developing',
      type: 'skill' as const,
      why: c.whyItMatters,
      nextStep: c.whatToDo,
    }));

  const majorGaps = comparisons
    .filter((c) => c.status === 'needs_improvement' || c.status === 'major_gap')
    .map((c) => ({
      title: c.competencyName,
      description: c.whatIsMissing,
      badge: c.status === 'major_gap' ? 'Major Gap' : 'Needs Improvement',
      type: 'skill' as const,
      why: c.whyItMatters,
      nextStep: c.whatToDo,
      priorityWeight: c.priorityOrder,
    }));

  // Synthetic deterministic match score for legacy bars (0–100)
  const matchScore = Math.min(
    100,
    Math.round(
      (comparisons.reduce((acc, c) => acc + Math.min(c.currentNumeric, c.targetNumeric), 0) /
        comparisons.reduce((acc, c) => acc + c.targetNumeric, 0)) *
        80 +
        (projectExp === 'deployed' || projectExp === 'advanced' ? 15 : projectExp === 'standalone' ? 10 : 3) +
        (internExp === 'industry' ? 5 : 2)
    )
  );

  return {
    careerTitle: career.title,
    careerTagline: career.category,
    careerDescription: career.description,
    branchName: branch.name,
    branchId: branch.id,
    academicStage: stage,

    isCareerTransition,
    transitionDetails,

    readinessSnapshot: {
      statusLabel,
      headline,
      summary,
      strengthsCount: strongCount,
      developingCount: devCount,
      gapsCount: majorGapCount,
      proofStatus,
      timeCommitmentAdvice,
    },

    priorityGaps: topPriorities,
    comparisons,

    categorizedGaps: {
      skillGaps,
      academicCoreGaps,
      projectGaps,
      experienceGaps,
      portfolioGaps,
      interviewReadinessGaps,
    },

    recommendedProjects,
    actionMilestones,

    // Legacy fields
    matchScore,
    skillsScore: Math.round((strongCount / comparisons.length) * 70),
    projectScore: projectExp === 'advanced' ? 20 : projectExp === 'deployed' ? 16 : projectExp === 'standalone' ? 10 : 3,
    expScore: internExp === 'industry' ? 10 : internExp === 'virtual' ? 6 : 2,
    skillCoveragePercent: Math.round((strongCount / comparisons.length) * 100),
    skillGapPercent: Math.round((majorGapCount / comparisons.length) * 100),
    skillsAtTarget: strongCount,
    skillsAssessed: comparisons.length,
    disclaimer:
      'This analysis is calculated from empirical competency benchmarks, Indian engineering semester standards, and target job role profiles. It provides grounded educational diagnostics without making speculative hiring guarantees.',
    strengths,
    needsImprovement,
    majorGaps,
    topPriorities,
    nextActions: actionMilestones.next7Days,
    roadmap: recommendedProjects.map((p, i) => ({
      stageNumber: i + 1,
      title: p.title,
      focusArea: p.category,
      skills: p.tools,
      deliverable: p.deliverableProof,
      estimatedTime: p.stageSuitability,
    })),
    generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    direction: (profile.direction as CareerDirection) || 'industry',
    careerName: career.title,
  };
}

/**
 * Generates specific, high-signal explanations for every competency
 */
function generateCompetencyGuidance(
  competencyId: string,
  competencyName: string,
  current: number,
  target: number,
  careerTitle: string
) {
  switch (competencyId) {
    case 'programming':
      return {
        whatIsMissing: 'Inability to write clean logic, loops, and custom classes from scratch without following a tutorial.',
        whyItMatters: `Every technical interview for ${careerTitle} begins with live problem solving in a code editor without internet lookups.`,
        whatToDo: 'Practice writing standard functions (string manipulation, matrix operations, sorting) from an empty editor file daily.',
        howToProve: 'Maintain a clean GitHub repository containing original solved problems and small console utilities.',
      };
    case 'dsa':
      return {
        whatIsMissing: 'Struggling with time/space complexity analysis and choosing optimal data structures for non-trivial inputs.',
        whyItMatters: 'Top software and tech hiring filters out 80%+ of applicants during online algorithmic assessment rounds.',
        whatToDo: 'Solve 2 problems daily on LeetCode/CodeStudio starting with Arrays, Two Pointers, and HashMaps before moving to Trees.',
        howToProve: 'Link an active LeetCode or GeeksforGeeks profile with 50+ verified solved problems on your resume.',
      };
    case 'oop':
      return {
        whatIsMissing: 'Theoretical knowledge of OOP concepts without practical experience structuring modular, reusable classes.',
        whyItMatters: 'Enterprise codebases require maintainability, clean interfaces, and separation of concerns.',
        whatToDo: 'Refactor a monolithic script into a clean Object-Oriented design with encapsulation, inheritance, and clean interfaces.',
        howToProve: 'Share a GitHub repository showcasing clean modular classes with docstrings and unit tests.',
      };
    case 'git':
      return {
        whatIsMissing: 'Lack of practical terminal Git workflow (branching, resolving merge conflicts, and structured commit messages).',
        whyItMatters: 'Every software engineering team collaborates through Pull Requests, code reviews, and Git histories.',
        whatToDo: 'Cease using web drag-and-drop; manage all code versioning via command-line git commands (git branch, rebase, pr).',
        howToProve: 'A public GitHub profile showing consistent commit activity and well-documented Pull Requests.',
      };
    case 'dbms':
      return {
        whatIsMissing: 'Unfamiliarity with multi-table relational queries, joins, indexes, and normalized database schemas.',
        whyItMatters: `Modern ${careerTitle} applications require persistent data modeling, ACID transactions, and optimized querying.`,
        whatToDo: 'Install PostgreSQL or MySQL locally and practice writing complex JOINs, GROUP BY, and indexing queries.',
        howToProve: 'Include a clean database schema diagram (ERD) and SQL migration scripts in your project repository.',
      };
    case 'apis':
      return {
        whatIsMissing: 'Limited experience architecting and securing RESTful endpoints with input validation and authentication.',
        whyItMatters: 'Microservices and web applications rely entirely on HTTP APIs to communicate between services.',
        whatToDo: 'Build a CRUD REST API with JWT authentication, error handling middleware, and test it via Postman.',
        howToProve: 'Provide a live API endpoint documentation page (Swagger/Postman collection) in your GitHub README.',
      };
    case 'cad_modeling':
      return {
        whatIsMissing: 'Lack of parametric modeling constraint discipline and manufacturing drawing standards (GD&T).',
        whyItMatters: '3D parts cannot be manufactured accurately on shop floors without proper geometric tolerances and mates.',
        whatToDo: 'Design fully constrained multi-part assemblies in SolidWorks/Fusion 360 and produce 2D production drawings.',
        howToProve: 'Portfolio with exploded 3D CAD renders, bill of materials, and manufacturing drawing PDFs.',
      };
    case 'embedded_c':
      return {
        whatIsMissing: 'Lack of low-level pointer manipulation, bitwise register masks, and memory-mapped peripheral programming.',
        whyItMatters: 'Firmware engineers must interface directly with hardware registers without high-level library overhead.',
        whatToDo: 'Write bare-metal C code to configure microcontroller GPIOs, timers, and UART using register pointers.',
        howToProve: 'GitHub repository with clean C firmware and an oscilloscope or logic analyzer trace screenshot.',
      };
    case 'structural_analysis':
      return {
        whatIsMissing: 'Struggling with indeterminate frame analysis, load combinations, and Indian Standard design clauses.',
        whyItMatters: 'Structural consulting firms require sound analytical competence to ensure building safety and code compliance.',
        whatToDo: 'Model a multi-story building in ETABS/STAAD.Pro and verify manual beam bending moment calculations.',
        howToProve: 'Detailed structural design calculation report with AutoCAD reinforcement detailing drawings.',
      };
    case 'transition_coding':
      return {
        whatIsMissing: 'Inconsistent coding schedule outside college lectures, leading to branch bias during resume screens.',
        whyItMatters: 'Non-CS students must demonstrate equivalent or superior practical coding skill to compete on merit.',
        whatToDo: 'Establish an unbroken 45-minute daily programming habit focusing on core data structures and 1 full-stack app.',
        howToProve: 'A public GitHub profile demonstrating consistent weekly commits and an original deployed project.',
      };
    default:
      return {
        whatIsMissing: `Experience implementing ${competencyName} independently in hands-on scenarios.`,
        whyItMatters: `Crucial foundation for professional readiness and technical interview evaluations in ${careerTitle}.`,
        whatToDo: `Dedicate focused study sessions to ${competencyName} and build a concrete mini-project demonstrating mastery.`,
        howToProve: 'Include verifiable proof (code repo, simulation file, or calculation report) in your public portfolio.',
      };
  }
}

/**
 * What-If Simulation Helper
 */
export function simulateWhatIf(
  originalProfile: StudentProfile,
  overrides: {
    skills?: Record<string, SkillLevel>;
    competencyScores?: Record<string, number>;
    projectExperience?: string;
    internshipExperience?: string;
  }
) {
  const newCompetencyAnswers = { ...originalProfile.competencyAnswers };

  if (overrides.competencyScores) {
    Object.assign(newCompetencyAnswers, overrides.competencyScores);
  }

  if (overrides.skills) {
    for (const [k, v] of Object.entries(overrides.skills)) {
      newCompetencyAnswers[k] = LEVEL[v];
    }
  }

  const simulatedProfile: StudentProfile = {
    ...originalProfile,
    competencyAnswers: newCompetencyAnswers,
    personalAnswers: {
      ...originalProfile.personalAnswers,
      project_experience: overrides.projectExperience ?? originalProfile.personalAnswers?.project_experience,
      internship_experience: overrides.internshipExperience ?? originalProfile.personalAnswers?.internship_experience,
    },
  };

  const before = calculateCareerGap(originalProfile);
  const after = calculateCareerGap(simulatedProfile);

  return {
    originalScore: before.matchScore,
    simulatedScore: after.matchScore,
    scoreDelta: after.matchScore - before.matchScore,
    resolvedGaps: before.majorGaps
      .filter((g) => !after.majorGaps.some((a) => a.title === g.title))
      .map((g) => g.title),
    newStrengthsCount: after.strengths.length - before.strengths.length,
    beforeStatus: before.readinessSnapshot.statusLabel,
    afterStatus: after.readinessSnapshot.statusLabel,
  };
}

export const EXPO_DEMO_PROFILE: StudentProfile = {
  branch: 'cse',
  academicStage: '1st Year – Sem 2',
  targetCareerId: 'software-engineer',
  personalAnswers: {
    confidence: 'confident',
    time_weekly: 'balanced',
    project_experience: 'tutorials',
    internship_experience: 'none',
    independent_learning: 'courses',
    explaining_work: 'prompted',
  },
  competencyAnswers: {
    programming: 2,
    dsa: 1,
    oop: 1,
    git: 2,
    dbms: 1,
    apis: 1,
    cs_fundamentals: 1,
    debugging: 1,
    projects: 1,
    interview_readiness: 1,
  },
};
