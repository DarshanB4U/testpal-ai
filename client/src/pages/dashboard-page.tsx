import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SubjectPerformanceChart } from "@/components/dashboard/subject-performance-chart";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { RecentTestCard } from "@/components/dashboard/recent-test-card";
import { UpcomingTestCard } from "@/components/dashboard/upcoming-test-card";
import { TestForm } from "@/components/practice/test-form";
import { TestResult, SubjectPerformance, ProgressData, Recommendation, WeakTopic } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch test results
  const { data: testResults, isLoading: isLoadingTestResults } = useQuery<TestResult[]>({
    queryKey: ["/api/test-results"],
  });

  // Fetch performance by subject
  const { data: performanceBySubject, isLoading: isLoadingPerformance } = useQuery<SubjectPerformance[]>({
    queryKey: ["/api/analytics/performance-by-subject"],
  });

  // Fetch progress over time
  const { data: progressOverTime, isLoading: isLoadingProgress } = useQuery<ProgressData[]>({
    queryKey: ["/api/analytics/progress-over-time"],
  });

  // Fetch recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  // Fetch weak topics
  const { data: weakTopics, isLoading: isLoadingWeakTopics } = useQuery<WeakTopic[]>({
    queryKey: ["/api/analytics/weak-topics"],
  });

  // Calculate stats
  const calculateStats = () => {
    if (!testResults || testResults.length === 0) {
      return {
        averageScore: "N/A",
        scoreChange: "No previous tests",
        testsCompleted: "0",
        testsTrend: "No tests this week",
        focusAreas: "0",
        focusAreasList: "No focus areas yet",
      };
    }

    // Calculate average score
    const totalScore = testResults.reduce((sum, result) => {
      return sum + (result.score / result.maxScore) * 100;
    }, 0);
    const averageScore = (totalScore / testResults.length).toFixed(1) + "%";

    // Calculate score change (mock data for now)
    const scoreChange = testResults.length > 1 ? "↑ 5.2% from last month" : "No previous data";

    // Count tests completed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const testsThisWeek = testResults.filter(
      (result) => new Date(result.completedAt) >= oneWeekAgo
    ).length;
    const testsTrend = `${testsThisWeek} ${testsThisWeek === 1 ? "test" : "tests"} this week`;

    // Focus areas
    const focusAreasCount = weakTopics?.length || 0;
    const focusAreasList = weakTopics?.map((topic) => topic.topicName).join(", ") || "No weak areas detected";

    return {
      averageScore,
      scoreChange,
      testsCompleted: testResults.length.toString(),
      testsTrend,
      focusAreas: focusAreasCount.toString(),
      focusAreasList: focusAreasCount > 0 ? focusAreasList : "No focus areas yet",
    };
  };

  const stats = calculateStats();

  // Sample upcoming tests (in a real app, these would come from API)
  const upcomingTests = [
    {
      id: 1,
      title: "Biology Final Exam",
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      topics: "Ecology, Cell Biology, Genetics",
      daysRemaining: 7,
    },
    {
      id: 2,
      title: "Computer Science Quiz",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      topics: "Data Structures, Algorithms",
      daysRemaining: 2,
    },
  ];

  return (
    <MainLayout title="Student Dashboard">
      <div className="py-4">
        {/* Student Overview Section */}
        <div className="mb-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <StatsCard
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                }
                iconBgColor="bg-primary bg-opacity-10"
                iconColor="text-primary"
                title="Average Score"
                value={stats.averageScore}
                change={stats.scoreChange}
                changeColor="text-green-600"
              />
              <StatsCard
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                iconBgColor="bg-secondary bg-opacity-10"
                iconColor="text-secondary"
                title="Tests Completed"
                value={stats.testsCompleted}
                change={stats.testsTrend}
                changeColor="text-primary"
              />
              <StatsCard
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                }
                iconBgColor="bg-warning bg-opacity-10"
                iconColor="text-warning"
                title="Focus Areas"
                value={stats.focusAreas}
                change={stats.focusAreasList}
                changeColor="text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Progress Charts Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Performance Analysis</h2>
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
        </div>

        {/* Recommendations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">AI Recommendations</h2>
            <span className="inline-flex px-3 py-1 text-xs font-medium text-primary bg-primary bg-opacity-10 rounded-full">Powered by Gemini</span>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {isLoadingRecommendations ? (
              <p>Loading recommendations...</p>
            ) : recommendations && recommendations.length > 0 ? (
              recommendations.slice(0, 3).map((recommendation) => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))
            ) : (
              <div className="lg:col-span-3 p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No recommendations available yet. Complete more tests to get personalized recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tests Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Tests</h2>
            <Link href="/analytics" className="text-sm font-medium text-primary hover:text-primary-dark">View all tests</Link>
          </div>
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            {isLoadingTestResults ? (
              <div className="p-4">Loading test results...</div>
            ) : testResults && testResults.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {testResults.slice(0, 3).map((testResult) => (
                  <RecentTestCard key={testResult.id} testResult={testResult} />
                ))}
              </ul>
            ) : (
              <div className="p-4">
                <p className="text-gray-600">No test results available yet. Start practicing to see your results here.</p>
                <Link href="/practice" className="text-sm font-medium text-primary hover:text-primary-dark mt-2 inline-block">
                  Go to Practice Tests →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Create Practice Test Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Create Custom Practice Test</h2>
          <TestForm />
        </div>

        {/* Upcoming Tests Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Tests</h2>
            <Link href="/practice" className="text-sm font-medium text-primary hover:text-primary-dark">Add test reminder</Link>
          </div>
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            {upcomingTests.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingTests.map((test) => (
                  <UpcomingTestCard key={test.id} test={test} />
                ))}
              </ul>
            ) : (
              <div className="p-4">
                <p className="text-gray-600">No upcoming tests scheduled. Add a test reminder to plan your studies.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
