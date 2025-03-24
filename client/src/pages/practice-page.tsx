import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Subject, Topic, PracticeQuestion } from "@shared/schema";
import SidebarNav from "@/components/sidebar-nav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, BookOpen, CheckCircle, HelpCircle, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PracticePage = () => {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  
  // Get all subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  // Get topics for selected subject
  const { data: topics, isLoading: isLoadingTopics } = useQuery<Topic[]>({
    queryKey: ["/api/subjects", selectedSubject, "topics"],
    enabled: !!selectedSubject,
  });
  
  // Get practice questions for selected topic
  const { data: practiceQuestions, isLoading: isLoadingQuestions } = useQuery<PracticeQuestion[]>({
    queryKey: ["/api/practice/questions", selectedTopic],
    enabled: !!selectedTopic,
  });
  
  // Generate practice questions mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { topicId: number; difficulty: string; count: number }) => {
      const res = await apiRequest("POST", "/api/practice/generate", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice/questions", selectedTopic] });
      toast({
        title: "Practice Questions Generated",
        description: `${data.length} questions have been created for you.`,
      });
      
      // Reset the active question and selected answers
      setActiveQuestion(0);
      setSelectedAnswers({});
      setShowExplanation(false);
    },
    onError: () => {
      toast({
        title: "Failed to Generate Questions",
        description: "There was an error generating practice questions. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Submit answer mutation
  const answerMutation = useMutation({
    mutationFn: async ({ id, answer, isCorrect }: { id: number; answer: string; isCorrect: boolean }) => {
      const res = await apiRequest("PUT", `/api/practice/questions/${id}`, {
        status: "completed",
        userAnswer: answer,
        isCorrect,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice/questions", selectedTopic] });
    },
  });
  
  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
    setActiveQuestion(0);
    setSelectedAnswers({});
    setShowExplanation(false);
  };
  
  const handleGenerateQuestions = () => {
    if (!selectedTopic) {
      toast({
        title: "Topic Required",
        description: "Please select a topic to generate practice questions.",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate({
      topicId: parseInt(selectedTopic),
      difficulty,
      count: questionCount,
    });
  };
  
  const handleAnswerSubmit = () => {
    const currentQuestion = practiceQuestions?.[activeQuestion];
    if (!currentQuestion || currentQuestion.status === "completed") return;
    
    const userAnswer = selectedAnswers[currentQuestion.id];
    if (!userAnswer) {
      toast({
        title: "Answer Required",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    const isCorrect = userAnswer === currentQuestion.correctAnswer;
    
    answerMutation.mutate({
      id: currentQuestion.id,
      answer: userAnswer,
      isCorrect,
    });
    
    setShowExplanation(true);
    
    toast({
      title: isCorrect ? "Correct Answer!" : "Incorrect Answer",
      description: isCorrect 
        ? "Great job! You got it right." 
        : `The correct answer was: ${currentQuestion.correctAnswer}`,
      variant: isCorrect ? "default" : "destructive",
    });
  };
  
  const handleNextQuestion = () => {
    if (activeQuestion < (practiceQuestions?.length || 0) - 1) {
      setActiveQuestion(activeQuestion + 1);
      setShowExplanation(false);
    }
  };
  
  const handlePrevQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
      setShowExplanation(false);
    }
  };
  
  const renderQuestionStatus = (question: PracticeQuestion) => {
    if (question.status === "completed") {
      return question.isCorrect ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Correct
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" /> Incorrect
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        <HelpCircle className="h-3 w-3 mr-1" /> Pending
      </Badge>
    );
  };
  
  const calculateProgress = () => {
    if (!practiceQuestions || practiceQuestions.length === 0) return 0;
    const completed = practiceQuestions.filter(q => q.status === "completed").length;
    return (completed / practiceQuestions.length) * 100;
  };
  
  const calculateScore = () => {
    if (!practiceQuestions || practiceQuestions.length === 0) return 0;
    const completed = practiceQuestions.filter(q => q.status === "completed");
    if (completed.length === 0) return 0;
    
    const correct = completed.filter(q => q.isCorrect).length;
    return (correct / completed.length) * 100;
  };
  
  const isLoading = isLoadingSubjects || isLoadingTopics || isLoadingQuestions;
  const isPracticeReady = !isLoading && practiceQuestions && practiceQuestions.length > 0;
  const currentQuestion = isPracticeReady ? practiceQuestions[activeQuestion] : null;
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <SidebarNav />
      
      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white md:flex md:items-center md:justify-between px-6 py-3 border-b border-gray-200 hidden">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">Practice Tests</h2>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Practice Questions</h1>
            <p className="mt-1 text-gray-600">Generate and practice questions tailored to your needs.</p>
          </div>
          
          <Tabs defaultValue="practice" className="space-y-6">
            <TabsList>
              <TabsTrigger value="practice">Practice Questions</TabsTrigger>
              <TabsTrigger value="generator">Question Generator</TabsTrigger>
            </TabsList>
            
            {/* Practice Questions Tab */}
            <TabsContent value="practice">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar with topic selection and question list */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Topic Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={selectedSubject}
                        onValueChange={(value) => {
                          setSelectedSubject(value);
                          setSelectedTopic("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects?.map(subject => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <Select
                        value={selectedTopic}
                        onValueChange={handleTopicChange}
                        disabled={!selectedSubject || isLoadingTopics}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics?.map(topic => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {isLoadingQuestions ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : practiceQuestions && practiceQuestions.length > 0 ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(calculateProgress())}%</span>
                          </div>
                          <Progress value={calculateProgress()} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Score</span>
                            <span>{Math.round(calculateScore())}%</span>
                          </div>
                          <Progress value={calculateScore()} className="h-2 bg-gray-200">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${calculateScore()}%` }}
                            ></div>
                          </Progress>
                        </div>
                        
                        <div className="border rounded-md mt-4">
                          <div className="p-3 border-b bg-gray-50">
                            <h3 className="font-medium">Question List</h3>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {practiceQuestions.map((question, index) => (
                              <button
                                key={question.id}
                                className={`w-full text-left p-3 border-b last:border-0 flex justify-between items-center hover:bg-gray-50 transition-colors ${
                                  activeQuestion === index ? "bg-primary-50" : ""
                                }`}
                                onClick={() => {
                                  setActiveQuestion(index);
                                  setShowExplanation(question.status === "completed");
                                }}
                              >
                                <span className="flex items-center">
                                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs mr-2">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm truncate">
                                    {question.question.length > 30
                                      ? `${question.question.substring(0, 30)}...`
                                      : question.question}
                                  </span>
                                </span>
                                <span>{renderQuestionStatus(question)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No questions available</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by generating questions in the Question Generator tab.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Main question area */}
                <Card className="lg:col-span-3">
                  {!isPracticeReady ? (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                      <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-700">No Questions Available</h3>
                      <p className="text-gray-500 mt-2 text-center max-w-md">
                        Select a subject and topic, then generate practice questions to get started.
                      </p>
                    </div>
                  ) : (
                    <>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Question {activeQuestion + 1} of {practiceQuestions.length}</CardTitle>
                          <Badge variant="outline" className="text-primary">
                            {currentQuestion?.difficulty.charAt(0).toUpperCase() + currentQuestion?.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>
                          Topic: {topics?.find(t => t.id === currentQuestion?.topicId)?.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-lg font-medium">
                          {currentQuestion?.question}
                        </div>
                        
                        <RadioGroup
                          value={selectedAnswers[currentQuestion?.id || 0] || ""}
                          onValueChange={(value) => {
                            if (currentQuestion?.status !== "completed") {
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [currentQuestion?.id || 0]: value
                              });
                            }
                          }}
                          className="space-y-3"
                          disabled={currentQuestion?.status === "completed"}
                        >
                          {currentQuestion?.options.map((option, index) => (
                            <div
                              key={index}
                              className={`flex items-center space-x-2 border rounded-md p-3 ${
                                currentQuestion.status === "completed" && showExplanation
                                  ? option === currentQuestion.correctAnswer
                                    ? "bg-green-50 border-green-200"
                                    : option === selectedAnswers[currentQuestion.id]
                                    ? "bg-red-50 border-red-200"
                                    : ""
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <RadioGroupItem
                                value={option}
                                id={`option-${index}`}
                                className="focus:ring-primary"
                              />
                              <Label
                                htmlFor={`option-${index}`}
                                className={`w-full cursor-pointer ${
                                  currentQuestion.status === "completed" && showExplanation
                                    ? option === currentQuestion.correctAnswer
                                      ? "text-green-700 font-medium"
                                      : option === selectedAnswers[currentQuestion.id]
                                      ? "text-red-700"
                                      : ""
                                    : ""
                                }`}
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        
                        {showExplanation && currentQuestion?.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800">
                            <h4 className="font-medium mb-1">Explanation</h4>
                            <p>{currentQuestion.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={handlePrevQuestion}
                          disabled={activeQuestion === 0}
                        >
                          Previous
                        </Button>
                        
                        <div className="space-x-2">
                          {currentQuestion?.status !== "completed" && (
                            <Button
                              onClick={handleAnswerSubmit}
                              disabled={!selectedAnswers[currentQuestion?.id || 0] || answerMutation.isPending}
                            >
                              {answerMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Submit Answer
                            </Button>
                          )}
                          
                          <Button
                            variant={currentQuestion?.status === "completed" ? "default" : "outline"}
                            onClick={handleNextQuestion}
                            disabled={activeQuestion === (practiceQuestions?.length || 0) - 1}
                          >
                            Next
                          </Button>
                        </div>
                      </CardFooter>
                    </>
                  )}
                </Card>
              </div>
            </TabsContent>
            
            {/* Question Generator Tab */}
            <TabsContent value="generator">
              <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">AI-Powered Question Generator</CardTitle>
                  <CardDescription className="text-primary-100">
                    Generate custom practice questions tailored to your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="generator-subject" className="text-primary-100">Subject</Label>
                        <Select
                          value={selectedSubject}
                          onValueChange={(value) => {
                            setSelectedSubject(value);
                            setSelectedTopic("");
                          }}
                        >
                          <SelectTrigger className="bg-primary-600 border-primary-400 text-white">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects?.map(subject => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="generator-topic" className="text-primary-100">Topic Focus</Label>
                        <Select
                          value={selectedTopic}
                          onValueChange={setSelectedTopic}
                          disabled={!selectedSubject || isLoadingTopics}
                        >
                          <SelectTrigger className="bg-primary-600 border-primary-400 text-white">
                            <SelectValue placeholder="Select topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics?.map(topic => (
                              <SelectItem key={topic.id} value={topic.id.toString()}>
                                {topic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="difficulty" className="text-primary-100">Difficulty</Label>
                        <ToggleGroup
                          type="single"
                          value={difficulty}
                          onValueChange={(value) => {
                            if (value) setDifficulty(value);
                          }}
                          className="justify-start"
                        >
                          <ToggleGroupItem
                            value="easy"
                            aria-label="Easy difficulty"
                            className={`data-[state=on]:bg-white data-[state=on]:text-primary-700 ${
                              difficulty !== "easy" ? "bg-primary-600 text-white" : ""
                            }`}
                          >
                            Easy
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="medium"
                            aria-label="Medium difficulty"
                            className={`data-[state=on]:bg-white data-[state=on]:text-primary-700 ${
                              difficulty !== "medium" ? "bg-primary-600 text-white" : ""
                            }`}
                          >
                            Medium
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="hard"
                            aria-label="Hard difficulty"
                            className={`data-[state=on]:bg-white data-[state=on]:text-primary-700 ${
                              difficulty !== "hard" ? "bg-primary-600 text-white" : ""
                            }`}
                          >
                            Hard
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="question-count" className="text-primary-100">Number of Questions</Label>
                          <span className="text-primary-100">{questionCount}</span>
                        </div>
                        <Slider
                          id="question-count"
                          min={5}
                          max={20}
                          step={1}
                          defaultValue={[10]}
                          value={[questionCount]}
                          onValueChange={([value]) => setQuestionCount(value)}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-primary-200">
                          <span>5</span>
                          <span>10</span>
                          <span>15</span>
                          <span>20</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={!selectedTopic || generateMutation.isPending}
                    variant="secondary"
                    className="w-full"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="m15.5 9-3.5 3-2-2" />
                        </svg>
                        Generate Practice Questions
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default PracticePage;
