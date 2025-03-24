import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectPerformanceChart } from "@/components/dashboard/subject-performance-chart";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectPerformance, ProgressData, WeakTopic, TestResult } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Fetch performance by subject
  const { data: performanceBySubject, isLoading: isLoadingPerformance } = useQuery<SubjectPerformance[]>({
    queryKey: ["/api/analytics/performance-by-subject"],
  });

  // Fetch progress over time
  const { data: progressOverTime, isLoading: isLoadingProgress } = useQuery<ProgressData[]>({
    queryKey: ["/api/analytics/progress-over-time"],
  });

  // Fetch weak topics
  const { data: weakTopics, isLoading: isLoadingWeakTopics } = useQuery<WeakTopic[]>({
    queryKey: ["/api/analytics/weak-topics"],
  });

  // Fetch test results
  const { data: testResults, isLoading: isLoadingTestResults } = useQuery<TestResult[]>({
    queryKey: ["/api/test-results"],
  });

  // Colors for charts
  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6"];

  // Format weak topics data for pie chart
  const formatWeakTopicsData = (topics: WeakTopic[] | undefined) => {
    if (!topics || topics.length === 0) return [];
    
    return topics.map((topic, index) => ({
      name: topic.topicName,
      value: 100 - topic.averageScore, // Invert score to show weakness
      subject: topic.subjectName,
    }));
  };

  // Format test time data for bar chart
  const formatTestTimeData = (results: TestResult[] | undefined) => {
    if (!results || results.length === 0) return [];
    
    return results
      .filter(result => result.timeTaken && result.test) // Only include results with time taken
      .slice(0, 10) // Get recent 10 tests
      .map(result => ({
        name: result.test?.title || 'Unknown Test',
        minutes: Math.floor((result.timeTaken || 0) / 60),
        date: format(new Date(result.completedAt), "MMM d"),
      }))
      .reverse(); // Show oldest to newest
  };

  return (
    <MainLayout title="Performance Analytics">
      <div className="py-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weak-areas">Weak Areas</TabsTrigger>
            <TabsTrigger value="time-analysis">Time Analysis</TabsTrigger>
            <TabsTrigger value="detailed-results">Detailed Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Performance Summary Card */}
              <Card className="bg-white p-6 rounded-lg shadow">
                <CardTitle className="text-xl mb-4">Performance Summary</CardTitle>
                <CardContent className="p-0">
                  <p className="text-gray-600 mb-6">
                    This overview shows your performance across all subjects and your progress over time.
                    Use these insights to understand your strengths and areas for improvement.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Subject Performance Chart */}
                    <SubjectPerformanceChart 
                      data={performanceBySubject || []} 
                      isLoading={isLoadingPerformance} 
                    />
                    
                    {/* Progress Over Time Chart */}
                    <ProgressChart 
                      data={progressOverTime || []} 
                      isLoading={isLoadingProgress} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Stats Summary */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tests Taken
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingTestResults ? "Loading..." : testResults?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {testResults && testResults.length > 0 
                        ? `Last test on ${format(new Date(testResults[0].completedAt), "MMM d, yyyy")}`
                        : "No tests taken yet"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Score
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingTestResults || !testResults || testResults.length === 0
                        ? "N/A"
                        : `${Math.round(
                            testResults.reduce(
                              (acc, test) => acc + (test.score / test.maxScore) * 100,
                              0
                            ) / testResults.length
                          )}%`
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {testResults && testResults.length > 1
                        ? "+5.2% from last month"
                        : "Not enough data for comparison"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Weak Areas Count
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingWeakTopics ? "Loading..." : weakTopics?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {weakTopics && weakTopics.length > 0
                        ? "Topics scoring below 70%"
                        : "No weak areas detected"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Time per Test
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingTestResults || !testResults || !testResults.some(t => t.timeTaken)
                        ? "N/A"
                        : `${Math.round(
                            testResults
                              .filter(t => t.timeTaken)
                              .reduce((acc, test) => acc + (test.timeTaken || 0), 0) /
                              testResults.filter(t => t.timeTaken).length / 60
                          )} min`
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {testResults && testResults.some(t => t.timeTaken)
                        ? "Average completion time"
                        : "No time data available"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="weak-areas">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weak Areas Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600 mb-6">
                    This chart shows your weakest topics. The longer the bar, the more attention that topic needs. 
                    Focus your study efforts on these areas to improve your overall performance.
                  </div>
                  
                  {isLoadingWeakTopics ? (
                    <div className="h-80 flex items-center justify-center">
                      <p>Loading weak topics data...</p>
                    </div>
                  ) : weakTopics && weakTopics.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={formatWeakTopicsData(weakTopics)}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {formatWeakTopicsData(weakTopics).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [`Weakness Score: ${value}%`, props.payload.subject]}
                            contentStyle={{ borderRadius: '8px' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No weak areas detected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Great job! You're performing well across all topics. Keep it up!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {weakTopics && weakTopics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Focus Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {weakTopics.map((topic) => (
                        <li key={topic.topicId} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{topic.topicName}</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {topic.averageScore}% mastery
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Subject: {topic.subjectName}</p>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${topic.averageScore}%` }}
                            ></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="time-analysis">
            <Card>
              <CardHeader>
                <CardTitle>Test Completion Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600 mb-6">
                  This chart shows how long it took you to complete each test. Analyze these times to improve your test-taking efficiency.
                </div>
                
                {isLoadingTestResults ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading test time data...</p>
                  </div>
                ) : testResults && testResults.some(r => r.timeTaken) ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={formatTestTimeData(testResults)}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis
                          label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [`${value} minutes`, 'Time Taken']}
                          labelFormatter={(label, payload) => payload[0]?.payload.name || label}
                          contentStyle={{ borderRadius: '8px' }}
                        />
                        <Bar 
                          dataKey="minutes" 
                          fill="hsl(var(--chart-2))" 
                          radius={[4, 4, 0, 0]} 
                          barSize={30}
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No time data available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Complete more tests to see your time performance analysis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detailed-results">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600 mb-6">
                  This table shows all your test results in detail. Review your performance on each test to track your progress.
                </div>
                
                {isLoadingTestResults ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading test results...</p>
                  </div>
                ) : testResults && testResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Taken
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {testResults.map((result) => {
                          const scorePercentage = Math.round((result.score / result.maxScore) * 100);
                          let statusClass = "";
                          let statusText = "";
                          
                          if (scorePercentage >= 80) {
                            statusClass = "bg-green-100 text-green-800";
                            statusText = "Excellent";
                          } else if (scorePercentage >= 70) {
                            statusClass = "bg-green-100 text-green-800";
                            statusText = "Good";
                          } else if (scorePercentage >= 60) {
                            statusClass = "bg-yellow-100 text-yellow-800";
                            statusText = "Average";
                          } else {
                            statusClass = "bg-red-100 text-red-800";
                            statusText = "Needs Improvement";
                          }
                          
                          return (
                            <tr key={result.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {result.test?.title || "Unknown Test"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {format(new Date(result.completedAt), "MMM d, yyyy")}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {result.score}/{result.maxScore} ({scorePercentage}%)
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {result.timeTaken 
                                    ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`
                                    : "N/A"
                                  }
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                  {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No test results</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't completed any tests yet. Start taking tests to see your results here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
