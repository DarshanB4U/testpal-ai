import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { Difficulty, QuestionType } from "@prisma/client";

type Question = {
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
};

class GeminiService {
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(apiKey);
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateQuestions(params: {
    subject: string;
    topics: string[];
    difficulty: "easy" | "medium" | "hard";
    count: number;
    questionType: "multiple_choice" | "true_false" | "essay";
  }): Promise<Question[]> {
    return this.generateQuestionsWithContext({
      ...params,
      additionalContext: ""
    });
  }

  async generateQuestionsWithContext(params: {
    subject: string;
    topics: string[];
    difficulty: "easy" | "medium" | "hard";
    count: number;
    questionType: "multiple_choice" | "true_false" | "essay";
    additionalContext?: string;
  }): Promise<Question[]> {
    const { subject, topics, difficulty, count, questionType, additionalContext } = params;

    const prompt = this.buildPromptWithContext(subject, topics, difficulty, count, questionType, additionalContext || "");
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.parseGeminiResponse(text, questionType);
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  }

  private buildPrompt(
    subject: string, 
    topics: string[], 
    difficulty: string, 
    count: number, 
    questionType: string
  ): string {
    return this.buildPromptWithContext(subject, topics, difficulty, count, questionType, "");
  }

  private buildPromptWithContext(
    subject: string, 
    topics: string[], 
    difficulty: string, 
    count: number, 
    questionType: string,
    additionalContext: string
  ): string {
    let format = "";
    
    if (questionType === "multiple_choice") {
      format = `
Format each question as follows:
{
  "content": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct option letter (e.g., A, B, C, or D)",
  "explanation": "Explanation of why this answer is correct"
}
`;
    } else if (questionType === "true_false") {
      format = `
Format each question as follows:
{
  "content": "The question text (which must be answerable with True or False)",
  "options": ["True", "False"],
  "correctAnswer": "True or False",
  "explanation": "Explanation of why this answer is correct"
}
`;
    } else if (questionType === "essay") {
      format = `
Format each question as follows:
{
  "content": "The essay question text",
  "correctAnswer": "Key points that should be included in the answer",
  "explanation": "More detailed explanation of what constitutes a good answer"
}
`;
    }

    let contextPrompt = "";
    if (additionalContext && additionalContext.trim() !== "") {
      contextPrompt = `
Additional context to consider while generating questions:
${additionalContext}
`;
    }

    return `
You are an expert educational content creator specializing in creating high-quality assessment questions.

Generate ${count} ${difficulty} level ${questionType} questions about ${subject}, specifically focusing on these topics: ${topics.join(", ")}.

${contextPrompt}

For ${difficulty} difficulty:
- Easy: Basic recall and understanding of fundamental concepts.
- Medium: Application of concepts and analysis of information.
- Hard: Complex problem-solving, evaluation, and synthesis of information.

${format}

Educational guidelines:
1. Each question should be clear, unambiguous, and directly relevant to the topics.
2. Multiple-choice options should be plausible and not contain obvious incorrect answers.
3. Correct answers should be distributed evenly (if generating multiple questions).
4. Explanations should be thorough and educational, helping the student understand why an answer is correct.
5. Questions should progress from simpler to more complex concepts within each topic.

Provide the output as a JSON array of question objects. Each question should be challenging but fair for the ${difficulty} difficulty level.
`;
  }

  private parseGeminiResponse(text: string, questionType: string): Question[] {
    try {
      // Find the JSON array in the response text (it may be surrounded by additional text)
      const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      
      if (!jsonMatch) {
        throw new Error("Failed to parse questions from Gemini response");
      }
      
      // Parse the JSON array
      const questions = JSON.parse(jsonMatch[0]);
      
      // Validate and format the questions
      return questions.map((q: any) => {
        if (!q.content || !q.correctAnswer || !q.explanation) {
          throw new Error("Question is missing required fields");
        }
        
        return {
          content: q.content,
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        };
      });
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // If parsing fails, try a more lenient approach by extracting individual JSON objects
      const fallbackQuestions = this.extractQuestionsFromText(text);
      if (fallbackQuestions.length > 0) {
        return fallbackQuestions;
      }
      throw new Error("Failed to parse questions from Gemini response");
    }
  }

  private extractQuestionsFromText(text: string): Question[] {
    const questions: Question[] = [];
    
    // Try to find individual JSON objects
    const regex = /\{[\s\S]*?\}/g;
    const matches = text.match(regex);
    
    if (matches) {
      for (const match of matches) {
        try {
          const questionObj = JSON.parse(match);
          if (questionObj.content && questionObj.correctAnswer) {
            questions.push({
              content: questionObj.content,
              options: questionObj.options || null,
              correctAnswer: questionObj.correctAnswer,
              explanation: questionObj.explanation || "No explanation provided"
            });
          }
        } catch (e) {
          // Skip this match if it's not valid JSON
          continue;
        }
      }
    }
    
    return questions;
  }
}

export const geminiService = new GeminiService();
