import prisma from "./prisma";
import * as types from "../shared/types";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<types.User | undefined>;
  getUserByUsername(username: string): Promise<types.User | undefined>;
  createUser(user: types.UserInput): Promise<types.User>;
  
  // Subject operations
  getSubjects(): Promise<types.Subject[]>;
  getSubject(id: number): Promise<types.Subject | undefined>;
  createSubject(subject: types.SubjectInput): Promise<types.Subject>;
  
  // Topic operations
  getTopics(subjectId?: number): Promise<types.Topic[]>;
  getTopic(id: number): Promise<types.Topic | undefined>;
  createTopic(topic: types.TopicInput): Promise<types.Topic>;
  
  // Test operations
  getTests(subjectId?: number): Promise<types.Test[]>;
  getTest(id: number): Promise<types.Test | undefined>;
  createTest(test: types.TestInput): Promise<types.Test>;
  
  // Question operations
  getQuestions(topicId?: number): Promise<types.Question[]>;
  getQuestion(id: number): Promise<types.Question | undefined>;
  createQuestion(question: types.QuestionInput): Promise<types.Question>;
  
  // Test questions operations
  addQuestionToTest(testQuestion: types.TestQuestionInput): Promise<types.TestQuestion>;
  getTestQuestions(testId: number): Promise<types.TestQuestion[]>;
  
  // Test results operations
  createTestResult(testResult: types.TestResultInput): Promise<types.TestResult>;
  getUserTestResults(userId: number): Promise<types.TestResult[]>;
  getTestResult(id: number): Promise<types.TestResult | undefined>;
  
  // Recommendation operations
  createRecommendation(recommendation: types.RecommendationInput): Promise<types.Recommendation>;
  getUserRecommendations(userId: number): Promise<types.Recommendation[]>;
  
  // Analytics
  getUserPerformanceBySubject(userId: number): Promise<any[]>;
  getUserProgressOverTime(userId: number): Promise<any[]>;
  getWeakTopics(userId: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<types.User | undefined> {
    return (await prisma.user.findUnique({
      where: { id }
    })) ?? undefined;
  }

  async getUserByUsername(username: string): Promise<types.User | undefined> {
    return (await prisma.user.findUnique({
      where: { username }
    })) ?? undefined;
  }

  async createUser(user: types.UserInput): Promise<types.User> {
    return await prisma.user.create({
      data: user
    });
  }

  // Subject operations
  async getSubjects(): Promise<types.Subject[]> {
    return await prisma.subject.findMany();
  }

  async getSubject(id: number): Promise<types.Subject | undefined> {
    return (await prisma.subject.findUnique({
      where: { id }
    })) ?? undefined;
  }

  async createSubject(subject: types.SubjectInput): Promise<types.Subject> {
    return await prisma.subject.create({
      data: subject
    });
  }

  // Topic operations
  async getTopics(subjectId?: number): Promise<types.Topic[]> {
    if (subjectId) {
      return await prisma.topic.findMany({
        where: { subjectId }
      });
    }
    return await prisma.topic.findMany();
  }

  async getTopic(id: number): Promise<types.Topic | undefined> {
    return (await prisma.topic.findUnique({
      where: { id }
    })) ?? undefined;
  }

  async createTopic(topic: types.TopicInput): Promise<types.Topic> {
    return await prisma.topic.create({
      data: topic
    });
  }

  // Test operations
  async getTests(subjectId?: number): Promise<types.Test[]> {
    if (subjectId) {
      return await prisma.test.findMany({
        where: { subjectId }
      });
    }
    return await prisma.test.findMany();
  }

  async getTest(id: number): Promise<types.Test | undefined> {
    return (await prisma.test.findUnique({
      where: { id }
    })) ?? undefined;
  }

  async createTest(test: types.TestInput): Promise<types.Test> {
    return await prisma.test.create({
      data: test
    });
  }

  // Question operations
  async getQuestions(topicId?: number): Promise<types.Question[]> {
    if (topicId) {
      return await prisma.question.findMany({
        where: { topicId }
      });
    }
    return await prisma.question.findMany();
  }

  async getQuestion(id: number): Promise<types.Question | undefined> {
    return (await prisma.question.findUnique({
      where: { id }
    })) ?? undefined;
  }

  async createQuestion(question: types.QuestionInput): Promise<types.Question> {
    return await prisma.question.create({
      data: {
        ...question,
        options: question.options ?? []
      }
    });
  }

  // Test questions operations
  async addQuestionToTest(testQuestion: types.TestQuestionInput): Promise<types.TestQuestion> {
    return await prisma.testQuestion.create({
      data: testQuestion
    });
  }

  async getTestQuestions(testId: number): Promise<types.TestQuestion[]> {
    return await prisma.testQuestion.findMany({
      where: { testId },
      orderBy: { order: 'asc' }
    });
  }

  // Test results operations
  async createTestResult(testResult: types.TestResultInput): Promise<types.TestResult> {
    return await prisma.testResult.create({
      data: testResult
    });
  }

  async getUserTestResults(userId: number): Promise<types.TestResult[]> {
    return await prisma.testResult.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    });
  }

  async getTestResult(id: number): Promise<types.TestResult | undefined> {
    return (await prisma.testResult.findUnique({
      where: { id }
    })) ?? undefined;
  }

  // Recommendation operations
  async createRecommendation(recommendation: types.RecommendationInput): Promise<types.Recommendation> {
    return await prisma.recommendation.create({
      data: {
        ...recommendation,
        topicIds: recommendation.topicIds ?? []
      }
    });
  }

  async getUserRecommendations(userId: number): Promise<types.Recommendation[]> {
    return await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Analytics
  async getUserPerformanceBySubject(userId: number): Promise<any[]> {
    const results = await prisma.testResult.findMany({
      where: {
        userId: userId
      },
      include: {
        test: {
          include: {
            subject: true
          }
        }
      }
    });

    const groupedResults = results.reduce((acc, result) => {
      if (!result.test?.subject) return acc;
      
      const subjectId = result.test.subject.id;
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subjectId,
          subjectName: result.test.subject.name,
          totalScore: 0,
          totalMaxScore: 0,
          count: 0
        };
      }
      
      acc[subjectId].totalScore += result.score;
      acc[subjectId].totalMaxScore += result.maxScore;
      acc[subjectId].count += 1;
      return acc;
    }, {} as Record<number, { subjectId: number; subjectName: string; totalScore: number; totalMaxScore: number; count: number }>);

    return Object.values(groupedResults).map(result => ({
      subjectId: result.subjectId,
      subjectName: result.subjectName,
      averageScore: Math.round((result.totalScore / result.totalMaxScore) * 100)
    }));
  }

  async getUserProgressOverTime(userId: number): Promise<any[]> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const results = await prisma.testResult.findMany({
      where: {
        userId: userId,
        completedAt: {
          gte: threeMonthsAgo
        }
      },
      include: {
        test: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        completedAt: 'asc'
      }
    });

    const groupedResults = results.reduce((acc, result) => {
      if (!result.test?.subject) return acc;
      
      const month = result.completedAt.toLocaleString('default', { month: 'long' });
      const key = `${month}-${result.test.subject.id}`;
      
      if (!acc[key]) {
        acc[key] = {
          month,
          subjectId: result.test.subject.id,
          subjectName: result.test.subject.name,
          scores: []
        };
      }
      
      acc[key].scores.push((result.score / result.maxScore) * 100);
      return acc;
    }, {} as Record<string, { month: string; subjectId: number; subjectName: string; scores: number[] }>);

    return Object.values(groupedResults).map(group => ({
      month: group.month,
      subjectId: group.subjectId,
      subjectName: group.subjectName,
      averageScore: Math.round(group.scores.reduce((a, b) => a + b, 0) / group.scores.length)
    }));
  }

  async getWeakTopics(userId: number): Promise<any[]> {
    const results = await prisma.testResult.findMany({
      where: {
        userId: userId
      },
      include: {
        test: {
          include: {
            testQuestions: {
              include: {
                question: {
                  include: {
                    topic: {
                      include: {
                        subject: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const topicPerformance = results.reduce((acc, result) => {
      result.test.testQuestions.forEach(tq => {
        const topic = tq.question.topic;
        const key = `${topic.id}`;
        
        if (!acc[key]) {
          acc[key] = {
            topicId: topic.id,
            topicName: topic.name,
            subjectId: topic.subject.id,
            subjectName: topic.subject.name,
            scores: []
          };
        }
        
        acc[key].scores.push((result.score / result.maxScore) * 100);
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(topicPerformance)
      .map(topic => ({
        topicId: topic.topicId,
        topicName: topic.topicName,
        subjectId: topic.subjectId,
        subjectName: topic.subjectName,
        averageScore: Math.round(topic.scores.reduce((a: number, b: number) => a + b, 0) / topic.scores.length)
      }))
      .sort((a, b) => a.averageScore - b.averageScore);
  }
}

export const storage = new DatabaseStorage();
