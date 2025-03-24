import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { Recommendation, WeakTopic } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { BookOpen, Video, FileText, ExternalLink } from "lucide-react";

export default function RecommendationsPage() {
  // Fetch recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  // Fetch weak topics
  const { data: weakTopics, isLoading: isLoadingWeakTopics } = useQuery<WeakTopic[]>({
    queryKey: ["/api/analytics/weak-topics"],
  });

  // Sample learning resources (in a real app, these would be fetched from an API)
  const learningResources = [
    {
      id: 1,
      type: "video",
      title: "Understanding Chemical Equations",
      provider: "Khan Academy",
      duration: "15 minutes",
      link: "https://www.khanacademy.org/science/chemistry",
      topic: "Chemistry",
    },
    {
      id: 2,
      type: "article",
      title: "Mastering Algebra: A Comprehensive Guide",
      provider: "Math is Fun",
      duration: "10 minute read",
      link: "https://www.mathsisfun.com/algebra/",
      topic: "Mathematics",
    },
    {
      id: 3,
      type: "practice",
      title: "Physics Problems: Forces and Motion",
      provider: "TestPal",
      duration: "20 questions",
      link: "/practice",
      topic: "Physics",
    },
    {
      id: 4,
      type: "video",
      title: "Biology Cell Structure and Function",
      provider: "Crash Course",
      duration: "12 minutes",
      link: "https://www.youtube.com/c/crashcourse",
      topic: "Biology",
    },
  ];

  // Group recommendations by type
  const groupedRecommendations = recommendations?.reduce((acc: Record<string, Recommendation[]>, recommendation) => {
    const { type } = recommendation;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(recommendation);
    return acc;
  }, {}) || {};

  // Resource type icon mapping
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "article":
        return <FileText className="h-5 w-5" />;
      case "practice":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  return (
    <MainLayout title="Learning Recommendations">
      <div className="py-4">
        <Tabs defaultValue="ai-recommendations">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="ai-recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            <TabsTrigger value="focus-areas">Focus Areas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-recommendations">
            <div className="mb-6">
              <Card className="bg-white p-6 rounded-lg shadow">
                <CardTitle className="text-xl mb-4">Personalized Recommendations</CardTitle>
                <CardDescription className="mb-6">
                  Based on your test performance, TestPal's AI has generated these personalized recommendations to help you improve.
                </CardDescription>
                
                {isLoadingRecommendations ? (
                  <div className="text-center py-8">
                    <p>Loading your personalized recommendations...</p>
                  </div>
                ) : recommendations && recommendations.length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedRecommendations).map(([type, recs]) => (
                      <div key={type}>
                        <h3 className="text-lg font-medium mb-3 capitalize">
                          {type.replace('_', ' ')} Recommendations
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {recs.map((recommendation) => (
                            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Complete more tests to receive personalized AI recommendations.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => window.location.href = "/practice"}>
                        Take Practice Tests
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="mb-6">
              <Card className="bg-white p-6 rounded-lg shadow">
                <CardTitle className="text-xl mb-4">Learning Resources</CardTitle>
                <CardDescription className="mb-6">
                  Browse these curated learning materials to improve your understanding of difficult topics.
                </CardDescription>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {learningResources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 p-4">
                        <div className="flex items-center space-x-2">
                          {getResourceIcon(resource.type)}
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Provider:</span>
                            <span className="font-medium">{resource.provider}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-medium">{resource.duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Topic:</span>
                            <span className="font-medium">{resource.topic}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 bg-gray-50 border-t">
                        <Link href={resource.link.startsWith("http") ? resource.link : resource.link}>
                          <Button className="w-full" variant="secondary">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Access Resource
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="focus-areas">
            <div className="mb-6">
              <Card className="bg-white p-6 rounded-lg shadow">
                <CardTitle className="text-xl mb-4">Focus Areas</CardTitle>
                <CardDescription className="mb-6">
                  These are your weakest areas that need the most attention. Focus your study efforts on these topics to see the biggest improvements.
                </CardDescription>
                
                {isLoadingWeakTopics ? (
                  <div className="text-center py-8">
                    <p>Analyzing your weak areas...</p>
                  </div>
                ) : weakTopics && weakTopics.length > 0 ? (
                  <div className="space-y-4">
                    {weakTopics.map((topic) => (
                      <Card key={topic.topicId} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{topic.topicName}</CardTitle>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {topic.averageScore}% mastery
                            </span>
                          </div>
                          <CardDescription>
                            Subject: {topic.subjectName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Current mastery:</span>
                                <span className="font-medium">{topic.averageScore}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-primary h-2.5 rounded-full" 
                                  style={{ width: `${topic.averageScore}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                              {topic.averageScore < 60
                                ? "This is a critical area for improvement. Focus on mastering the fundamentals."
                                : "You're making progress, but need more practice to fully master this topic."}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 bg-gray-50 border-t flex justify-between">
                          <Button variant="outline">View Study Materials</Button>
                          <Link href="/practice">
                            <Button>Practice Now</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg 
                      className="mx-auto h-12 w-12 text-green-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No weak areas detected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Great job! You're performing well across all topics. Keep practicing to maintain your knowledge.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => window.location.href = "/practice"}>
                        Continue Practice
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
