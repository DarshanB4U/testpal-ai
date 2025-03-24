import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LightbulbIcon, TrendingUp, CalendarClock } from "lucide-react";

interface AIRecommendationsProps {
  subjects: any[];
}

const AIRecommendations = ({ subjects }: AIRecommendationsProps) => {
  // Function to find the lowest scoring subject
  const findLowestScoringSubject = () => {
    if (!subjects || subjects.length === 0) return null;
    
    return subjects.reduce((lowest, current) => {
      if (!lowest || (current.avg_score < lowest.avg_score)) {
        return current;
      }
      return lowest;
    }, null);
  };
  
  // Function to find the most improved subject
  const findMostImprovedSubject = () => {
    // This would normally compare historical data, but for the demo, we'll return a random subject
    if (!subjects || subjects.length === 0) return null;
    
    // Just pick the first subject as an example
    return subjects[0];
  };
  
  const lowestSubject = findLowestScoringSubject();
  const improvedSubject = findMostImprovedSubject();
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle>AI Recommendations</CardTitle>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          AI Powered
        </span>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {subjects && subjects.length > 0 ? (
          <>
            {lowestSubject && (
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                <div className="flex items-start">
                  <LightbulbIcon className="text-yellow-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Focus on {lowestSubject.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Your scores in {lowestSubject.name} are consistently lower compared to other subjects. 
                      We recommend focusing on this area.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {improvedSubject && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                <div className="flex items-start">
                  <TrendingUp className="text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {improvedSubject.name} Progress
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      You've improved by 15% in {improvedSubject.name} over the last month. Keep up the good work!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 bg-primary-50 border border-primary-100 rounded-md">
              <div className="flex items-start">
                <CalendarClock className="text-primary-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Exam Readiness</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Based on your current progress, you're on track for your upcoming exams. 
                    Continue practicing regularly to maintain your performance.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>Take some tests to get personalized AI recommendations</p>
          </div>
        )}
        
        <Button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6" />
            <path d="M20.49 9a9 9 0 1 1-2.12-3.5L23 10" />
          </svg>
          Get Updated Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
