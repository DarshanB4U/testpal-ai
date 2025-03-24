import { type PrismaClient } from '@prisma/client';

// Define types based on Prisma's models
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
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
  createdAt: Date;
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
  createdAt: Date;
}

export interface TestQuestion {
  id: number;
  testId: number;
  questionId: number;
  order: number;
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
  completedAt: Date;
}

export interface Recommendation {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: string;
  topicIds: number[] | null;
  createdAt: Date;
}

// Input types (for creating new records)
export type UserInput = Omit<User, 'id' | 'createdAt'>;
export type SubjectInput = Omit<Subject, 'id'>;
export type TopicInput = Omit<Topic, 'id'>;
export type TestInput = Omit<Test, 'id' | 'createdAt'>;
export type QuestionInput = Omit<Question, 'id' | 'createdAt'>;
export type TestQuestionInput = Omit<TestQuestion, 'id'>;
export type TestResultInput = Omit<TestResult, 'id' | 'completedAt'>;
export type RecommendationInput = Omit<Recommendation, 'id' | 'createdAt'>;

// Enums
export enum Difficulty {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard'
}

export enum QuestionType {
  multiple_choice = 'multiple_choice',
  true_false = 'true_false',
  essay = 'essay'
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