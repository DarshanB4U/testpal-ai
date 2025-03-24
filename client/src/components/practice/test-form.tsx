import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Subject, Topic, GenerateTestPayload } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusIcon, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const testFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.string().min(1, "Question count is required"),
  focusOnWeakAreas: z.enum(["yes", "no"]),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export function TestForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

  // Fetch subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  // Fetch topics based on selected subject
  const { data: topics, isLoading: isLoadingTopics } = useQuery<Topic[]>({
    queryKey: ["/api/topics", selectedSubject ? parseInt(selectedSubject) : null],
    queryFn: async ({ queryKey }) => {
      const subjectId = queryKey[1];
      if (!subjectId) return [];
      const response = await fetch(`/api/topics?subjectId=${subjectId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch topics");
      return response.json();
    },
    enabled: !!selectedSubject,
  });

  const generateTestMutation = useMutation({
    mutationFn: async (data: GenerateTestPayload) => {
      const res = await apiRequest("POST", "/api/generate-test", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test generated successfully",
        description: "Your custom practice test has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      navigate(`/tests/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate test",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subjectId: "",
      difficulty: "medium",
      questionCount: "10",
      focusOnWeakAreas: "yes",
    },
  });

  function onSubmit(values: TestFormValues) {
    const topicIds = topics?.map(topic => topic.id) || [];
    
    if (topicIds.length === 0) {
      toast({
        title: "No topics available",
        description: "Please select a subject with available topics",
        variant: "destructive",
      });
      return;
    }

    const payload: GenerateTestPayload = {
      title: values.title,
      description: values.description,
      subjectId: parseInt(values.subjectId),
      difficulty: values.difficulty as 'easy' | 'medium' | 'hard',
      topicIds: topicIds,
      questionCount: parseInt(values.questionCount),
      focusOnWeakAreas: values.focusOnWeakAreas === "yes",
    };

    generateTestMutation.mutate(payload);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Custom Practice Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Title</FormLabel>
                    <FormControl>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Chemistry Review Test"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="A test covering periodic table and chemical reactions"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedSubject(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingSubjects ? (
                          <SelectItem value="loading" disabled>
                            Loading subjects...
                          </SelectItem>
                        ) : subjects?.length ? (
                          subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No subjects available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question count" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="focusOnWeakAreas"
                render={({ field }) => (
                  <FormItem className="space-y-3 md:col-span-2">
                    <FormLabel>Focus on Weak Areas</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="focus-yes" />
                          <Label htmlFor="focus-yes">Yes, prioritize my weak areas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="focus-no" />
                          <Label htmlFor="focus-no">No, cover all topics equally</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={generateTestMutation.isPending}
                className="inline-flex items-center"
              >
                {generateTestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Test...
                  </>
                ) : (
                  <>
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Generate Practice Test
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
