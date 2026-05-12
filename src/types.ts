export type Screen = 'home' | 'speed' | 'multipleChoice' | 'fill' | 'typing' | 'listening' | 'pattern' | 'result' | 'list' | 'table_random' | 'table_weak' | 'table_choice' | 'table_test_custom';

export interface VerbStat {
  correct: number;
  total: number;
  isManualWeak?: boolean;
  manualCorrectCount?: number;
}

export interface Progress {
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  verbStats: Record<string, VerbStat>;
}
