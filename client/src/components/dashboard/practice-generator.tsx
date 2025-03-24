import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Subject, Topic } from "@shared/types";
import { useQuery } from "@tanstack/react-query";

interface PracticeGeneratorProps {
  subjects: Subject[];
}

const PracticeGenerator = ({ subjects }: PracticeGeneratorProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [questionCount, setQuestionCount] = useState<number>(15);
  
  // Get topics for selected subject
  const { data: topics } = useQuery<Topic[]>({
    queryKey: ["/api/subjects", selectedSubject, "topics"],
    enabled: !!selectedSubject,
  });
  
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedTopic("");
  };
  
  const handleGeneratePractice = () => {
    if (!selectedSubject || !selectedTopic) {
      toast({
        title: "Selection Required",
        description: "Please select both a subject and topic to generate practice questions.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to practice page with query parameters
    navigate(`/practice?subject=${selectedSubject}&topic=${selectedTopic}&difficulty=${difficulty}&count=${questionCount}`);
  };
  
  return (
    <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <CardHeader>
        <CardTitle>Generate Practice Test</CardTitle>
        <CardDescription className="text-primary-100">
          AI will create custom practice questions based on your weak areas.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-primary-100 mb-1">Subject</Label>
            <Select
              value={selectedSubject}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger className="block w-full bg-primary-600 border border-primary-400 rounded-md px-3 py-2 text-sm text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300">
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
          
          <div>
            <Label className="block text-sm font-medium text-primary-100 mb-1">Topic Focus</Label>
            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
              disabled={!selectedSubject}
            >
              <SelectTrigger className="block w-full bg-primary-600 border border-primary-400 rounded-md px-3 py-2 text-sm text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300">
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
          
          <div>
            <Label className="block text-sm font-medium text-primary-100 mb-1">Difficulty</Label>
            <ToggleGroup
              type="single"
              value={difficulty}
              onValueChange={(value) => value && setDifficulty(value)}
              className="flex w-full"
            >
              <ToggleGroupItem 
                value="easy" 
                className={`flex-1 flex justify-center py-2 ${
                  difficulty === 'easy' 
                    ? 'bg-white text-primary-700' 
                    : 'bg-primary-600 hover:bg-primary-700 border border-primary-400'
                } rounded-l-md`}
              >
                Easy
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="medium" 
                className={`flex-1 flex justify-center py-2 ${
                  difficulty === 'medium' 
                    ? 'bg-white text-primary-700' 
                    : 'bg-primary-600 hover:bg-primary-700 border-t border-b border-primary-400'
                }`}
              >
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="hard" 
                className={`flex-1 flex justify-center py-2 ${
                  difficulty === 'hard' 
                    ? 'bg-white text-primary-700' 
                    : 'bg-primary-600 hover:bg-primary-700 border border-primary-400'
                } rounded-r-md`}
              >
                Hard
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-primary-100 mb-1">Number of Questions</Label>
            <Slider
              min={5}
              max={30}
              step={1}
              value={[questionCount]}
              onValueChange={(value) => setQuestionCount(value[0])}
              className="w-full h-2 bg-primary-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-primary-200 mt-1">
              <span>5</span>
              <span>{questionCount}</span>
              <span>30</span>
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleGeneratePractice}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Generate Practice Test
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PracticeGenerator;
