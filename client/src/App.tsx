import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import PracticeTestPage from "@/pages/practice-test-page";
import AnalyticsPage from "@/pages/analytics-page";
import RecommendationsPage from "@/pages/recommendations-page";
import StudyGroupsPage from "@/pages/study-groups-page";
import TestDetailPage from "@/pages/test-detail-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/practice" component={PracticeTestPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/recommendations" component={RecommendationsPage} />
      <ProtectedRoute path="/study-groups" component={StudyGroupsPage} />
      <ProtectedRoute path="/tests/:id" component={TestDetailPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
