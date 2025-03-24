import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Subject } from "@shared/schema";
import SidebarNav from "@/components/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2 } from "lucide-react";

const PerformancePage = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("6");
  
  // Get all subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  // Get subject performance data
  const { data: subjectPerformance, isLoading: isLoadingSubjectPerf } = useQuery<any[]>({
    queryKey: ["/api/performance/subjects"],
  });
  
  // Get performance trends
  const { data: performanceTrends, isLoading: isLoadingTrends } = useQuery<any[]>({
    queryKey: ["/api/performance/trends", { months: parseInt(timeRange) }],
  });
  
  // Get topic performance for selected subject
  const { data: topicPerformance, isLoading: isLoadingTopics } = useQuery<any[]>({
    queryKey: ["/api/performance/topics", selectedSubject],
    enabled: !!selectedSubject,
  });
  
  const isLoading = isLoadingSubjects || isLoadingSubjectPerf || isLoadingTrends || isLoadingTopics;
  
  // Prepare data for charts
  const prepareSubjectData = () => {
    if (!subjectPerformance) return [];
    return subjectPerformance.map(subject => ({
      name: subject.name,
      score: Math.round(subject.avg_score || 0),
      tests: subject.test_count || 0
    }));
  };
  
  const prepareTopicData = () => {
    if (!topicPerformance) return [];
    return topicPerformance.map(topic => ({
      name: topic.name,
      score: Math.round(topic.avg_score || 0),
      questions: topic.total_questions || 0
    }));
  };
  
  const prepareTrendData = () => {
    if (!performanceTrends) return [];
    
    // Group by month and calculate average scores for each subject
    const groupedByMonth: { [key: string]: any } = {};
    
    performanceTrends.forEach(item => {
      if (!groupedByMonth[item.month_name]) {
        groupedByMonth[item.month_name] = { name: item.month_name };
      }
      
      if (item.avg_score !== null) {
        groupedByMonth[item.month_name][item.subject_name] = Math.round(item.avg_score);
      }
    });
    
    return Object.values(groupedByMonth);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <SidebarNav />
      
      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white md:flex md:items-center md:justify-between px-6 py-3 border-b border-gray-200 hidden">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">Performance Analytics</h2>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="mt-1 text-gray-600">Analyze your progress and identify areas for improvement.</p>
              </div>
              
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trends">Performance Trends</TabsTrigger>
                  <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
                  <TabsTrigger value="topics">Topic Breakdown</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Subject Performance Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareSubjectData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="score" name="Score (%)" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Test Count by Subject</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareSubjectData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="tests" name="Number of Tests" fill="hsl(var(--secondary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Trends Tab */}
                <TabsContent value="trends">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Performance Trends Over Time</CardTitle>
                      <Select
                        value={timeRange}
                        onValueChange={setTimeRange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">Last 3 months</SelectItem>
                          <SelectItem value="6">Last 6 months</SelectItem>
                          <SelectItem value="12">Last 12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={prepareTrendData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {subjects?.map((subject, index) => (
                            <Line 
                              key={subject.id}
                              type="monotone" 
                              dataKey={subject.name} 
                              stroke={`hsl(var(--chart-${(index % 5) + 1}))`} 
                              strokeWidth={2}
                              connectNulls
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Subjects Tab */}
                <TabsContent value="subjects">
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject-wise Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {subjectPerformance?.map(subject => (
                          <div key={subject.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">{subject.name}</h3>
                              <span className="font-bold text-xl">{Math.round(subject.avg_score || 0)}%</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full" 
                                style={{ width: `${Math.round(subject.avg_score || 0)}%` }}
                              ></div>
                            </div>
                            
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Tests taken: {subject.test_count || 0}</span>
                              <span>Last test: {subject.latest_test_date ? new Date(subject.latest_test_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Topics Tab */}
                <TabsContent value="topics">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Topic-wise Performance Breakdown</CardTitle>
                      <Select
                        value={selectedSubject || ""}
                        onValueChange={setSelectedSubject}
                      >
                        <SelectTrigger className="w-[180px]">
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
                    </CardHeader>
                    <CardContent>
                      {!selectedSubject ? (
                        <div className="flex justify-center items-center h-40 text-gray-500">
                          Please select a subject to view topic performance
                        </div>
                      ) : topicPerformance && topicPerformance.length === 0 ? (
                        <div className="flex justify-center items-center h-40 text-gray-500">
                          No topic data available for this subject
                        </div>
                      ) : (
                        <>
                          <div className="h-80 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareTopicData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="score" name="Score (%)" fill="hsl(var(--accent))" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="space-y-4">
                            {topicPerformance?.map(topic => (
                              <div key={topic.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-medium">{topic.name}</h3>
                                  <span className="font-medium">{Math.round(topic.avg_score || 0)}%</span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-accent h-2 rounded-full" 
                                    style={{ width: `${Math.round(topic.avg_score || 0)}%` }}
                                  ></div>
                                </div>
                                
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Total questions: {topic.total_questions || 0}</span>
                                  <span>Correct answers: {topic.total_correct || 0}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PerformancePage;
