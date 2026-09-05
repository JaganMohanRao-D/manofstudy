export type WorkspaceView =
  | 'hub'
  | 'eapcet'
  | 'roadmaps'
  | 'scholarships'
  | 'utilities'
  | 'compiler'
  | 'dsa'
  | 'academics'
  | 'attendance'
  | 'gpa'
  | 'essentials'
  | 'store'
  | 'guides'
  | 'projects'
  | 'internships';

export type ToolTab = 
  | 'eapcet-radar'
  | 'roadmaps'
  | 'scholarships'
  | 'pdf-tools'
  | 'compiler'
  | 'resume-checker'
  | 'attendance' 
  | 'gpa' 
  | 'internal-calc'
  | 'resizer' 
  | 'humanizer'
  | 'essentials'
  | 'store'
  | 'projects'
  | 'internships';

export type ToolCategory = 'academic' | 'document' | 'writing' | 'counselling' | 'scholarship';

export interface SemesterPlan {
  semNumber: number;
  title: string;
  coreSubjects: string[];
  industrySkills: string[];
  toolsAndPlatforms: string[];
  keyProjects: string[];
  internshipOrMilestone: string;
  examOrPlacementPrep: string;
}

export interface YearPlan {
  yearNumber: number;
  yearTitle: string;
  theme: string;
  semesters: [SemesterPlan, SemesterPlan];
}

export type DegreeStream = 'all' | 'engineering' | 'science' | 'commerce' | 'humanities' | 'bipc' | 'healthcare';

export interface BranchRoadmap {
  id: string;
  code: string;
  name: string;
  category: 'computing' | 'electronics' | 'mechanical' | 'civil' | 'biotech' | 'science' | 'commerce' | 'humanities' | 'pharma' | 'agri' | 'nursing' | 'healthcare' | string;
  categoryLabel: string;
  badge: string;
  tagline: string;
  acronym?: string;
  topicsCount?: string;
  degreeType?: string; // e.g. 'B.Tech' | 'B.Sc' | 'B.Com' | 'B.A.' | 'B.Pharm' | 'Pharm.D'
  stream?: 'engineering' | 'science' | 'commerce' | 'humanities' | 'bipc' | 'healthcare';
  bannerCategory?: 'computing' | 'security' | 'electronics' | 'mechanical' | 'civil' | 'biotech' | 'science' | 'commerce' | 'humanities' | 'healthcare' | string;
  strategicOverview: {
    corporateViability: string;
    corporateSummary: string;
    govtPsuViability: string;
    govtPsuSummary: string;
    targetRoles: string[];
    salaryBrackets: {
      entryTier: string;
      midTier: string;
      peakTier: string;
    };
    tierReality?: {
      tier1Label?: string;
      tier3Label?: string;
      tier1Salary: string;
      tier1Reality: string;
      tier3Salary: string;
      tier3Reality: string;
      offCampusTactics: string[];
    };
    standardTechStack?: string[];
    higherStudiesGate?: {
      exam: string;
      topInstitutes: string[];
      mtechSpecializations: string[];
      msAbroadScope: string;
    };
    keyCompetitiveExams: string[];
  };
  skillsMatrix: {
    foundational: string[];
    advanced: string[];
    industryTools: string[];
  };
  years: YearPlan[];
  proTips: string[];
}

export interface IndianScholarship {
  id: string;
  title: string;
  provider: string;
  category: string;
  target: string;
  eligibility: string;
  amount: string;
  deadline: string;
  apply_link: string;
}

export interface ScholarshipItem {
  id: string;
  title: string;
  provider: string;
  category: 'engineering' | 'class10-12' | 'national' | 'merit' | 'women';
  categoryLabel: string;
  amount: string;
  deadline: string;
  status: 'Open' | 'Closing Soon' | 'Announced' | 'Upcoming';
  eligibility: string;
  applicableCourses: string;
  officialUrl: string;
  keyBenefits: string[];
}

export interface ToolMeta {
  id: ToolTab;
  name: string;
  shortName: string;
  category: ToolCategory;
  description: string;
  badge: string;
}

export interface VacancyBranch {
  branch_code: string;
  branch_name: string;
  total_seats: number;
  left_over_seats: number;
  fee: number;
}

export interface VacancyCollege {
  inst_code: string;
  inst_name: string;
  district: string;
  place: string;
  region?: string;
  affiliated_to: string;
  branches: VacancyBranch[];
}

export type EapcetBranchVacancy = VacancyBranch;
export type EapcetCollege = VacancyCollege;

export interface AttendanceState {
  totalClasses: number;
  attendedClasses: number;
  minRequiredPercent: number;
}

export interface AttendanceResult {
  currentPercent: number;
  isSafe: boolean;
  status: 'safe' | 'warning' | 'danger';
  classesMissable: number;
  classesRequired: number;
  totalConducted: number;
  totalAttended: number;
  bunkImpacts: Array<{
    scenario: string;
    classes: number;
    resultingPercent: number;
    status: 'safe' | 'warning' | 'danger';
  }>;
  attendanceImpacts: Array<{
    scenario: string;
    classes: number;
    resultingPercent: number;
    status: 'safe' | 'warning' | 'danger';
  }>;
}

export type GpaFormulaId = 
  | 'jntu'
  | 'anna_univ'
  | 'vtu_karnataka'
  | 'osmania_ou'
  | 'andhra_univ'
  | 'vit'
  | 'srm'
  | 'amrita'
  | 'cbse_standard'
  | 'aicte_standard'
  | 'custom';

export interface GpaFormula {
  id: GpaFormulaId;
  name: string;
  expression: string;
  description: string;
  regionTag?: string;
  calculate: (score: number, customMultiplier?: number, customOffset?: number) => number;
}

export interface GpaConversionResult {
  score: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  classification: string;
  usGpaEquivalent: number;
  statusColor: string;
}

export interface FutureGpaState {
  currentCgpa: number;
  completedSemesters: number;
  totalSemesters: number;
  targetCgpa: number;
}

export interface FutureGpaResult {
  requiredSgpa: number;
  remainingSemesters: number;
  isFeasible: boolean;
  maxPossibleCgpa: number;
  status: 'easy' | 'moderate' | 'challenging' | 'impossible' | 'already_achieved';
  message: string;
}

export type ImageSizePreset = '20kb' | '50kb' | '100kb' | '200kb' | '500kb' | 'custom';

export type DimensionPreset = 'original' | 'passport_in' | 'signature_in' | 'ssc_gate' | 'custom';

export interface ImageResizerConfig {
  targetSizeKb: number;
  sizePreset: ImageSizePreset;
  dimensionPreset: DimensionPreset;
  customWidth: number;
  customHeight: number;
  maintainAspectRatio: boolean;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  targetDpi: number;
}

export interface CompressedImageResult {
  originalFile: File;
  originalUrl: string;
  originalSizeKb: number;
  originalWidth: number;
  originalHeight: number;
  compressedBlob: Blob;
  compressedUrl: string;
  compressedSizeKb: number;
  compressedWidth: number;
  compressedHeight: number;
  compressionRatio: number;
  timeTakenMs: number;
  format: string;
}

// ----------------------------------------------------
// Tool: ATS Resume Keyword Matcher & Diagnostics Types
// ----------------------------------------------------
export interface KeywordItem {
  word: string;
  frequencyInJd: number;
  frequencyInResume: number;
  isMatched: boolean;
  importance: 'critical' | 'recommended' | 'optional';
  category: 'technical' | 'tools' | 'soft_skills' | 'general';
}

export interface AtsDiagnosticFinding {
  type: 'grammar' | 'skill' | 'structure' | 'metric';
  severity: 'critical' | 'warning' | 'good';
  title: string;
  message: string;
  snippet?: string;
  suggestion: string;
}

export interface AtsScoreResult {
  matchPercentage: number;
  totalJdKeywords: number;
  matchedCount: number;
  missingCount: number;
  matchedKeywords: KeywordItem[];
  missingKeywords: KeywordItem[];
  resumeWordCount: number;
  jdWordCount: number;
  criticalMissingCount: number;
  weakVerbsCount: number;
  quantifiableMetricsCount: number;
  formattingFlags: string[];
  findings: AtsDiagnosticFinding[];
  categoryScores: {
    technical: { matched: number; total: number; percent: number };
    tools: { matched: number; total: number; percent: number };
    soft_skills: { matched: number; total: number; percent: number };
    general: { matched: number; total: number; percent: number };
  };
}

export interface AtsResumeStructured {
  fullName: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    concepts: string[];
  };
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    location: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    technologies: string[];
    link?: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    duration: string;
    scoreOrGpa: string;
  }>;
  certifications?: string[];
}

// ----------------------------------------------------
// Tool: AI Text Humanizer & Pattern Scanner Types
// ----------------------------------------------------
export type HumanizeMode = 'academic' | 'casual' | 'professional';

export interface AiPatternMetric {
  name: string;
  score: number; // 0-100%
  status: 'low' | 'moderate' | 'high';
  description: string;
}

export interface AiScanAnalysis {
  aiLikelihoodScore: number; // 0 to 100
  verdict: 'Highly AI Generated' | 'Likely AI with Mixed Patterns' | 'Human-Written Flow';
  metrics: AiPatternMetric[];
  roboticPhrasesDetected: string[];
  sentenceCount: number;
  wordCount: number;
  charCount: number;
  averageSentenceLength: number;
  burstinessScore: number; // Variance in sentence lengths
  perplexityScore: number; // Estimate of vocabulary predictability
  passiveVoiceRatio: number; // % of sentences with passive markers
}

export interface HumanizerResult {
  originalText: string;
  humanizedText: string;
  mode: HumanizeMode;
  statsOriginal: { words: number; chars: number; readingTimeSec: number; gradeLevel: string };
  statsHumanized: { words: number; chars: number; readingTimeSec: number; gradeLevel: string };
  improvementsApplied: string[];
}

// ----------------------------------------------------
// Tool: Client-Side PDF Power Tools Types (30 Tools)
// ----------------------------------------------------
export type PdfToolCategory = 'all' | 'convert' | 'edit' | 'secure' | 'optimize';

export type PdfToolId =
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'pdf-to-word'
  | 'pdf-to-powerpoint'
  | 'pdf-to-excel'
  | 'word-to-pdf'
  | 'powerpoint-to-pdf'
  | 'excel-to-pdf'
  | 'edit-pdf'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf'
  | 'sign-pdf'
  | 'watermark-pdf'
  | 'rotate-pdf'
  | 'html-to-pdf'
  | 'unlock-pdf'
  | 'protect-pdf'
  | 'organize-pdf'
  | 'pdf-to-pdfa'
  | 'repair-pdf'
  | 'page-numbers'
  | 'scan-to-pdf'
  | 'ocr-pdf'
  | 'compare-pdf'
  | 'redact-pdf'
  | 'crop-pdf'
  | 'pdf-forms'
  | 'ai-summarizer'
  | 'translate-markdown';

export interface PdfToolDefinition {
  id: PdfToolId;
  name: string;
  tagline: string;
  category: 'convert' | 'edit' | 'secure' | 'optimize';
  badge?: string;
  acceptedFileTypes: string; // e.g., '.pdf' or '.jpg,.png,.jpeg' or '.docx,.txt' or '.xlsx,.csv'
  multipleFiles?: boolean;
  description: string;
}

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount?: number;
  arrayBuffer?: ArrayBuffer;
  previewUrl?: string;
}

export type PdfToolMode = 'merge' | 'split' | 'info';

export interface PdfProcessProgress {
  isProcessing: boolean;
  progressPercent: number;
  statusMessage: string;
  error?: string;
  downloadUrl?: string;
  downloadFilename?: string;
  secondaryDownloadUrl?: string;
  secondaryFilename?: string;
  resultStats?: {
    originalSize?: string;
    newSize?: string;
    reductionPercent?: string;
    pageCount?: number;
    extraNote?: string;
  };
}

// ----------------------------------------------------
// Tool: Internal Exam Cutoff & Target Estimator Types
// ----------------------------------------------------
export type MidCalcMethod = 'best_of_2' | 'weighted_80_20' | 'weighted_70_30' | 'average_50_50';

export interface InternalCalcState {
  mid1Scored: number;
  mid1Max: number;
  mid2Scored: number;
  mid2Max: number;
  calcMethod: MidCalcMethod;
  assignmentScored: number;
  assignmentMax: number;
  attendanceScored: number;
  attendanceMax: number;
  internalMaxScale: number; // e.g. 30, 40, 50
  externalMaxMarks: number; // e.g. 60, 70, 75, 100
  targetGradePercent: number; // e.g. 40 (Pass), 60, 75, 85, 90
  minPassingExternalPercent: number; // usually 35% or 40%
}

export interface GradeCutoffRow {
  gradeName: string;
  minPercent: number;
  targetTotalMarks: number;
  requiredExternalMarks: number;
  requiredExternalPercent: number;
  isAchievable: boolean;
  status: 'safe' | 'warning' | 'impossible';
}

export interface InternalCalcResult {
  calculatedMidMarks: number;
  consolidatedInternalScored: number;
  consolidatedInternalMax: number;
  consolidatedInternalPercent: number;
  totalCourseMax: number;
  targetTotalMarksRequired: number;
  requiredExternalScore: number;
  requiredExternalPercent: number;
  minPassingExternalMarks: number;
  isAchievable: boolean;
  isAlreadyPassed: boolean;
  maxAchievableTotalPercent: number;
  shortfallMarks: number;
  cutoffBreakdown: GradeCutoffRow[];
}


