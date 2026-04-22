export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuizOption[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  timeLimitSeconds: number;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  description: string;
  questions: QuizQuestion[];
  totalTimeSeconds: number;
  difficulty: Difficulty;
  createdAt: string;
}

export interface QuizConfig {
  topic: string;
  materials?: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  timeLimitSeconds: number;
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
}

export interface QuizSessionResult {
  quizId: string;
  results: QuestionResult[];
  score: number;
  totalTimeTakenSeconds: number;
  completedAt: string;
}
