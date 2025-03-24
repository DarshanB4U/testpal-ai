import { geminiService } from "./gemini";
import { storage } from "./storage";
import { Difficulty, QuestionType } from "@prisma/client";
import * as types from "@shared/types";

/**
 * Retrieval Augmented Generation (RAG) Service for TestPal
 * Enhances AI-generated question papers with contextual data from the database
 */
export class RAGService {
  /**
   * Generates a complete test with questions based on the provided parameters
   */
  async generateTest(params: types.GenerateTestPayload, userId: number): Promise<types.Test> {
    // 1. Retrieve context information from the database
    const subject = await storage.getSubject(params.subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }
    
    // Get topics for the test
    const topics = await Promise.all(
      params.topicIds.map(id => storage.getTopic(id))
    );
    const validTopics = topics.filter((t): t is types.Topic => t !== undefined);
    
    if (validTopics.length === 0) {
      throw new Error("No valid topics found");
    }
    
    // 2. Context augmentation - retrieve user's weak areas if requested
    let selectedTopics = validTopics;
    let weakAreasContext = "";
    
    if (params.focusOnWeakAreas) {
      const weakTopics = await storage.getWeakTopics(userId);
      const weakTopicIds = new Set(weakTopics.map(t => t.topicId));
      
      // Sort topics to prioritize weak areas
      selectedTopics = validTopics.sort((a, b) => {
        if (weakTopicIds.has(a.id) && !weakTopicIds.has(b.id)) return -1;
        if (!weakTopicIds.has(a.id) && weakTopicIds.has(b.id)) return 1;
        return 0;
      });
      
      // Add context about weak areas to improve generation quality
      if (weakTopics.length > 0) {
        weakAreasContext = `The student has shown weakness in the following topics: ${
          weakTopics.map(t => t.topicName).join(", ")
        }. Please ensure the questions for these topics are particularly thorough and educational.`;
      }
    }
    
    // 3. Create the base test
    const test = await storage.createTest({
      title: params.title,
      description: params.description || null,
      subjectId: params.subjectId,
      difficulty: params.difficulty as Difficulty,
      duration: 60, // Default duration in minutes
    });
    
    // 4. Generate questions using AI with enhanced context
    const topicNames = selectedTopics.map(t => t.name);
    const questions = await geminiService.generateQuestionsWithContext({
      subject: subject.name,
      topics: topicNames,
      difficulty: params.difficulty,
      count: params.questionCount,
      questionType: "multiple_choice",
      additionalContext: weakAreasContext,
    });
    
    // 5. Save generated questions and add them to the test
    await this.saveQuestionsToTest(questions, selectedTopics, test.id, params.difficulty as Difficulty);
    
    // Return the created test with question count
    return {
      ...test,
      questionCount: questions.length,
    } as unknown as types.Test;
  }
  
  /**
   * Saves generated questions to the database and associates them with a test
   */
  private async saveQuestionsToTest(
    questions: Array<{ content: string; options?: string[]; correctAnswer: string; explanation: string }>,
    topics: types.Topic[],
    testId: number,
    difficulty: Difficulty
  ): Promise<void> {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      // Distribute questions across topics in a round-robin fashion
      const topicId = topics[i % topics.length].id;
      
      // Save the question
      const savedQuestion = await storage.createQuestion({
        topicId,
        content: q.content,
        type: "multiple_choice" as QuestionType,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty,
      });
      
      // Add to test with proper ordering
      await storage.addQuestionToTest({
        testId,
        questionId: savedQuestion.id,
        order: i,
      });
    }
  }
  
  /**
   * Analyzes a student's performance to provide personalized recommendations
   */
  async generateRecommendations(userId: number): Promise<types.Recommendation[]> {
    // Get student's weak topics
    const weakTopics = await storage.getWeakTopics(userId);
    
    if (weakTopics.length === 0) {
      // Not enough performance data yet
      return [];
    }
    
    // Create personalized recommendations
    const recommendations: types.RecommendationInput[] = [];
    
    // Group weak topics by subject
    const subjectToTopics = new Map<number, any[]>();
    
    weakTopics.forEach(topic => {
      if (!subjectToTopics.has(topic.subjectId)) {
        subjectToTopics.set(topic.subjectId, []);
      }
      const topics = subjectToTopics.get(topic.subjectId);
      if (topics) {
        topics.push(topic);
      }
    });
    
    // Create subject-specific recommendations
    for (const [subjectId, topics] of Array.from(subjectToTopics.entries())) {
      const topicIds = topics.map(t => t.topicId);
      const topicNames = topics.map(t => t.topicName).join(", ");
      const subjectName = topics[0].subjectName;
      
      recommendations.push({
        userId,
        title: `Focus on ${subjectName} weak areas`,
        description: `Your test results show that you need to improve in the following topics: ${topicNames}. We recommend focusing on these areas.`,
        type: "weak_areas",
        topicIds,
      });
    }
    
    // Save and return the recommendations
    const savedRecommendations = await Promise.all(
      recommendations.map(rec => storage.createRecommendation(rec))
    );
    
    return savedRecommendations;
  }
}

export const ragService = new RAGService();