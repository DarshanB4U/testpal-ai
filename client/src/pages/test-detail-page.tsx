import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Test, Question, TestResult } from "@/types";
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TestDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const testId = parseInt(id);
  
  // State for test taking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [testScore, setTestScore] = useState<{ score: number; maxScore: number } | null>(null);
  
  // Fetch test or test result based on the ID
  const { data: testData, isLoading } = useQuery<Test | TestResult>({
    queryKey: ["/api/tests", testId],
    queryFn: async () => {
      try {
        // First try to fetch as a test
        const response = await fetch(`/api/tests/${testId}`, {
          credentials: "include",
        });
        
        if (response.ok) {
          return await response.json();
        }
        
        // If that fails, try to fetch as a test result
        const resultResponse = await fetch(`/api/test-results/${testId}`, {
          credentials: "include",
        });
        
        if (resultResponse.ok) {
          const result = await resultResponse.json();
          setIsTestCompleted(true);
          setTestScore({
            score: result.score,
            maxScore: result.maxScore,
          });
          return result;
        }
        
        throw new Error("Test not found");
      } catch (error) {
        throw new Error("Failed to fetch test data");
      }
    },
  });
  
  // Set up timer
  useEffect(() => {
    if (isTestActive && testData && 'duration' in testData && timeRemaining === null) {
      setTimeRemaining(testData.duration * 60); // Convert minutes to seconds
      setStartTime(new Date());
    }
    
    if (!isTestActive || timeRemaining === null) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTestActive, testData, timeRemaining]);
  
  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmitTest();
    }
  }, [timeRemaining]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start the test
  const handleStartTest = () => {
    setIsTestActive(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (!testData || !('questions' in testData) || !testData.questions) return;
    
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Handle answer selection
  const handleSelectAnswer = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };
  
  // Calculate test score
  const calculateScore = () => {
    if (!testData || !('questions' in testData) || !testData.questions) return { score: 0, maxScore: 0 };
    
    let score = 0;
    const questions = testData.questions;
    
    for (const question of questions) {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        score += 1;
      }
    }
    
    return {
      score,
      maxScore: questions.length,
    };
  };
  
  // Submit the test
  const handleSubmitTest = async () => {
    if (!testData || !('questions' in testData) || !testData.questions || !startTime) return;
    
    const scoreResult = calculateScore();
    const endTime = new Date();
    const timeTakenSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    try {
      // Send test result to the server
      await apiRequest("POST", "/api/test-results", {
        testId: testData.id,
        score: scoreResult.score,
        maxScore: scoreResult.maxScore,
        timeTaken: timeTakenSeconds,
        answers: selectedAnswers,
      });
      
      setIsTestCompleted(true);
      setTestScore(scoreResult);
      setIsTestActive(false);
      
      toast({
        title: "Test completed!",
        description: `You scored ${scoreResult.score} out of ${scoreResult.maxScore} points.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/test-results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/performance-by-subject"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/progress-over-time"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/weak-topics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    } catch (error) {
      toast({
        title: "Error submitting test",
        description: "There was an error submitting your test. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Compute progress percentage
  const getProgressPercentage = () => {
    if (!testData || !('questions' in testData) || !testData.questions) return 0;
    
    const answeredCount = Object.keys(selectedAnswers).length;
    return Math.round((answeredCount / testData.questions.length) * 100);
  };
  
  // Get current question
  const getCurrentQuestion = (): Question | null => {
    if (!testData || !('questions' in testData) || !testData.questions || testData.questions.length === 0) return null;
    
    return testData.questions[currentQuestionIndex];
  };
  
  const currentQuestion = getCurrentQuestion();
  
  if (isLoading) {
    return (
      <MainLayout title="Loading Test...">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Clock className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
            <p>Loading test data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!testData) {
    return (
      <MainLayout title="Test Not Found">
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Test Not Found</h2>
          <p className="mb-4">The test you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate("/practice")}>Return to Practice Tests</Button>
        </div>
      </MainLayout>
    );
  }
  
  // Test Results View
  if (isTestCompleted || 'score' in testData) {
    const result = 'score' in testData ? testData : { ...testData, score: testScore?.score || 0, maxScore: testScore?.maxScore || 0 };
    const scorePercentage = Math.round((result.score / result.maxScore) * 100);
    
    return (
      <MainLayout title="Test Results">
        <div className="py-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex justify-between items-center">
                <span>Test Results: {('test' in result && result.test) ? result.test.title : 'Custom Test'}</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  scorePercentage >= 80 ? "bg-green-100 text-green-800" :
                  scorePercentage >= 70 ? "bg-green-100 text-green-800" :
                  scorePercentage >= 60 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {scorePercentage}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <div className="text-3xl font-bold mb-2">
                  {result.score} / {result.maxScore} points
                </div>
                <p className="text-gray-600">
                  {scorePercentage >= 80 ? "Excellent job! You've mastered this material." :
                   scorePercentage >= 70 ? "Good work! You have a solid understanding of the material." :
                   scorePercentage >= 60 ? "Nice effort! With a bit more practice, you'll improve." :
                   "Keep practicing! Focus on the topics you struggled with."}
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Performance Summary</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Correct Answers</div>
                    <div className="text-2xl font-bold text-green-600">{result.score}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Incorrect Answers</div>
                    <div className="text-2xl font-bold text-red-600">{result.maxScore - result.score}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Time Taken</div>
                    <div className="text-2xl font-bold">
                      {result.timeTaken ? 
                        `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 
                        "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 gap-2">
              <Button variant="outline" onClick={() => navigate("/practice")}>
                Back to Practice Tests
              </Button>
              <Button onClick={() => navigate("/analytics")}>
                View Detailed Analytics
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  // Test info or active test view
  return (
    <MainLayout title={isTestActive ? "Taking Test" : "Test Information"}>
      <div className="py-4">
        {!isTestActive ? (
          // Test Information View
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="bg-gray-50">
              <CardTitle>{testData.title}</CardTitle>
              {'difficulty' in testData && (
                <div className="flex space-x-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {testData.difficulty}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {testData.duration} min
                  </span>
                  {'questions' in testData && testData.questions && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {testData.questions.length} questions
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">About this Test</h3>
                <p className="text-gray-600">{testData.description || "No description available for this test."}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-2 text-blue-800">Test Instructions</h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700">
                  <li>Read each question carefully before answering.</li>
                  <li>You have {testData.duration} minutes to complete the test.</li>
                  <li>You can navigate between questions using the Next and Previous buttons.</li>
                  <li>Click Submit Test when you're done to see your results.</li>
                </ul>
              </div>
              
              {'questions' in testData && testData.questions && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {/* This would ideally be populated from the test data */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Various topics
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50">
              <Button onClick={handleStartTest}>Start Test</Button>
            </CardFooter>
          </Card>
        ) : (
          // Active Test View
          <div className="max-w-4xl mx-auto">
            {/* Test progress header */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Progress:</span>
                    <span>{Object.keys(selectedAnswers).length} of {('questions' in testData && testData.questions) ? testData.questions.length : 0} answered</span>
                  </div>
                  {timeRemaining !== null && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-orange-500" />
                      <span className={`font-medium ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </CardContent>
            </Card>
            
            {/* Question card */}
            {currentQuestion && (
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1} of {('questions' in testData && testData.questions) ? testData.questions.length : 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">{currentQuestion.content}</h3>
                    
                    {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                      <RadioGroup
                        value={selectedAnswers[currentQuestion.id] || ""}
                        onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
                        className="space-y-3"
                      >
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="text-base">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {currentQuestion.type === 'true_false' && (
                      <RadioGroup
                        value={selectedAnswers[currentQuestion.id] || ""}
                        onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="True" id="true" />
                          <Label htmlFor="true" className="text-base">True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="False" id="false" />
                          <Label htmlFor="false" className="text-base">False</Label>
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 gap-2 justify-between">
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {currentQuestionIndex === (('questions' in testData && testData.questions) ? testData.questions.length - 1 : 0) ? (
                      <Button onClick={handleSubmitTest}>
                        Submit Test
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion}>
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
