import { MockQuestionItem, EAPCET_MATH_QUESTIONS } from './eapcetQuestionsMath';
import { EAPCET_PHYSICS_QUESTIONS } from './eapcetQuestionsPhysics';
import { EAPCET_CHEMISTRY_QUESTIONS } from './eapcetQuestionsChemistry';

export interface EapcetFullQuestion extends MockQuestionItem {}

export interface EapcetFullExamConfig {
  id: 'ap-eapcet' | 'tg-eapcet';
  title: string;
  shortTitle: string;
  conductingBody: string;
  state: string;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  markingScheme: string;
  sections: {
    math: { count: number; startIdx: number; endIdx: number };
    physics: { count: number; startIdx: number; endIdx: number };
    chemistry: { count: number; startIdx: number; endIdx: number };
  };
}

export const FULL_EAPCET_EXAMS_CONFIG: Record<string, EapcetFullExamConfig> = {
  'ap-eapcet': {
    id: 'ap-eapcet',
    title: 'AP EAPCET 2026 Full-Length Grand Mock Test',
    shortTitle: 'AP EAPCET 160 Qs Grand Test',
    conductingBody: 'JNTU Kakinada on behalf of APSCHE',
    state: 'Andhra Pradesh',
    totalQuestions: 160,
    durationMinutes: 180, // 3 Hours
    totalMarks: 160,
    markingScheme: '+1 mark for correct response | 0 for incorrect or unattempted (NO Negative Marking)',
    sections: {
      math: { count: 80, startIdx: 0, endIdx: 79 },
      physics: { count: 40, startIdx: 80, endIdx: 119 },
      chemistry: { count: 40, startIdx: 120, endIdx: 159 },
    },
  },
  'tg-eapcet': {
    id: 'tg-eapcet',
    title: 'TG EAPCET 2026 Full-Length Grand Mock Test',
    shortTitle: 'TG EAPCET 160 Qs Grand Test',
    conductingBody: 'JNTU Hyderabad on behalf of TGCHE',
    state: 'Telangana',
    totalQuestions: 160,
    durationMinutes: 180, // 3 Hours
    totalMarks: 160,
    markingScheme: '+1 mark for correct response | 0 for incorrect or unattempted (NO Negative Marking)',
    sections: {
      math: { count: 80, startIdx: 0, endIdx: 79 },
      physics: { count: 40, startIdx: 80, endIdx: 119 },
      chemistry: { count: 40, startIdx: 120, endIdx: 159 },
    },
  },
};

/**
 * Complete 160-Question Standard Examination Bank:
 * - Mathematics: Exactly 80 Questions (Q1 to Q80)
 * - Physics: Exactly 40 Questions (Q81 to Q120)
 * - Chemistry: Exactly 40 Questions (Q121 to Q160)
 */
export const FULL_EAPCET_MOCK_QUESTIONS: EapcetFullQuestion[] = [
  ...EAPCET_MATH_QUESTIONS,
  ...EAPCET_PHYSICS_QUESTIONS,
  ...EAPCET_CHEMISTRY_QUESTIONS,
];
