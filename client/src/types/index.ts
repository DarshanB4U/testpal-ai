export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Subject {
  id: number;
  name: string;
  description: string | null;
}

export interface Topic {
  id: number;
  subjectId: number;
  name: string;
  description: string | null;
}

export interface Test {
  id: number;
  title: string;
  description: string | null;
  subjectId: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  createdAt: string;
  questions?: Question[];
}

export interface Question {
  id: number;
  topicId: number;
  content: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  order?: number;
}

export interface TestResult {
  id: number;
  userId: number;
  testId: number;
  score: number;
  maxScore: number;
  timeTaken: number | null;
  completed: boolean;
  answers: any | null;
  completedAt: string;
  test?: Test;
}

export interface Recommendation {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: string;
  topicIds: number[] | null;
  createdAt: string;
}

export interface SubjectPerformance {
  subjectId: number;
  subjectName: string;
  averageScore: number;
}

export interface ProgressData {
  month: string;
  subjectId: number;
  subjectName: string;
  averageScore: number;
}

export interface WeakTopic {
  topicId: number;
  topicName: string;
  subjectId: number;
  subjectName: string;
  averageScore: number;
}

export interface GenerateTestPayload {
  title: string;
  description?: string;
  subjectId: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topicIds: number[];
  questionCount: number;
  focusOnWeakAreas?: boolean;
}
