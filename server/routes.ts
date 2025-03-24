import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { geminiService } from "./gemini";
import { z } from "zod";
import * as types from "@shared/types";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Subjects routes
  app.get("/api/subjects", isAuthenticated, async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", isAuthenticated, async (req, res) => {
    try {
      const subject = await storage.getSubject(parseInt(req.params.id));
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  // Topics routes
  app.get("/api/topics", isAuthenticated, async (req, res) => {
    try {
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      const topics = await storage.getTopics(subjectId);
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Tests routes
  app.get("/api/tests", isAuthenticated, async (req, res) => {
    try {
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      const tests = await storage.getTests(subjectId);
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  app.get("/api/tests/:id", isAuthenticated, async (req, res) => {
    try {
      const test = await storage.getTest(parseInt(req.params.id));
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      // Get test questions
      const testQuestions = await storage.getTestQuestions(test.id);
      
      // Get full question details for each test question
      const questions = await Promise.all(
        testQuestions.map(async (tq) => {
          const question = await storage.getQuestion(tq.questionId);
          return {
            ...question,
            order: tq.order,
          };
        })
      );
      
      res.json({
        ...test,
        questions,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  // Test results routes
  app.get("/api/test-results", isAuthenticated, async (req, res) => {
    try {
      const testResults = await storage.getUserTestResults(req.user!.id);
      
      // Enhance with test info
      const enhancedResults = await Promise.all(
        testResults.map(async (result) => {
          const test = await storage.getTest(result.testId);
          return {
            ...result,
            test,
          };
        })
      );
      
      res.json(enhancedResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  app.post("/api/test-results", isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        testId: z.number(),
        score: z.number(),
        maxScore: z.number(),
        timeTaken: z.number().optional(),
        answers: z.any().optional(),
      });
      
      const validated = schema.parse(req.body);
      
      const testResult = await storage.createTestResult({
        ...validated,
        userId: req.user!.id,
        completed: true,
        // Convert undefined to null for Prisma
        timeTaken: validated.timeTaken || null,
        answers: validated.answers || null
      });
      
      res.status(201).json(testResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to save test result" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/performance-by-subject", isAuthenticated, async (req, res) => {
    try {
      const performance = await storage.getUserPerformanceBySubject(req.user!.id);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance analytics" });
    }
  });

  app.get("/api/analytics/progress-over-time", isAuthenticated, async (req, res) => {
    try {
      const progress = await storage.getUserProgressOverTime(req.user!.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress analytics" });
    }
  });

  app.get("/api/analytics/weak-topics", isAuthenticated, async (req, res) => {
    try {
      const weakTopics = await storage.getWeakTopics(req.user!.id);
      // Return only topics with scores below 70%
      const filteredTopics = weakTopics.filter(topic => topic.averageScore < 70);
      res.json(filteredTopics.slice(0, 3)); // Return top 3 weak topics
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weak topics" });
    }
  });

  // Recommendations routes
  app.get("/api/recommendations", isAuthenticated, async (req, res) => {
    try {
      const recommendations = await storage.getUserRecommendations(req.user!.id);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });
  
  // Generate AI personalized recommendations
  app.post("/api/generate-recommendations", isAuthenticated, async (req, res) => {
    try {
      // Import the RAG service (dynamic import to avoid circular dependencies)
      const { ragService } = await import("./rag");
      
      // Generate personalized recommendations using RAG
      const recommendations = await ragService.generateRecommendations(req.user!.id);
      
      res.status(201).json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ 
        message: "Failed to generate recommendations", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // AI-powered test generation using RAG
  app.post("/api/generate-test", isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        title: z.string(),
        description: z.string().optional(),
        subjectId: z.number(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        topicIds: z.array(z.number()),
        questionCount: z.number().min(1).max(30),
        focusOnWeakAreas: z.boolean().optional(),
      });
      
      const validated = schema.parse(req.body);

      // Import the RAG service (dynamic import to avoid circular dependencies)
      const { ragService } = await import("./rag");
      
      // Use the RAG service to generate the test with enhanced context
      const test = await ragService.generateTest(validated, req.user!.id);
      console.log("test response ");
      console.log(test);
      
      
      res.status(201).json(test);
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ 
        message: "Failed to generate test", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
