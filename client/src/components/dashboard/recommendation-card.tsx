import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Recommendation } from "@/types";
import { Link } from "wouter";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  // Function to get the appropriate icon based on recommendation type
  const getIcon = (type: string) => {
    switch (type) {
      case 'focus_area':
        return (
          <svg className="w-5 h-5 mr-2 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'progress':
        return (
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        );
      case 'test_strategy':
        return (
          <svg className="w-5 h-5 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 mr-2 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  // Get background color based on type
  const getBgColor = (type: string) => {
    switch (type) {
      case 'focus_area':
        return 'bg-warning bg-opacity-10';
      case 'progress':
        return 'bg-primary bg-opacity-10';
      case 'test_strategy':
        return 'bg-secondary bg-opacity-10';
      default:
        return 'bg-info bg-opacity-10';
    }
  };

  return (
    <Card className="overflow-hidden shadow">
      <CardHeader className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center">
        <div className="flex items-center">
          {getIcon(recommendation.type)}
          <h3 className="text-base font-medium text-gray-900">{recommendation.title}</h3>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <p className="text-sm text-gray-600">{recommendation.description}</p>
        <div className="flex mt-4">
          <Link href="/practice" className="text-sm font-medium text-primary hover:text-primary-dark">
            View practice resources →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
