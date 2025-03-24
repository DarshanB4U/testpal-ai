import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subject, Test } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentTestsProps {
  tests: Test[];
}

const RecentTests = ({ tests }: RecentTestsProps) => {
  // Get subjects to display subject names
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  const getSubjectName = (subjectId: number) => {
    return subjects?.find(s => s.id === subjectId)?.name || "Unknown Subject";
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getScoreStatus = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (score >= 80) {
      return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle>Recent Tests</CardTitle>
        <Button variant="link" size="sm" className="text-primary-600 text-sm hover:text-primary-700 font-medium">
          View all tests
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tests && tests.length > 0 ? (
                tests.map(test => (
                  <tr key={test.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.title}</div>
                      <div className="text-xs text-gray-500">{getSubjectName(test.subjectId)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(test.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.score}%</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getScoreStatus(test.score)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="link" className="text-primary-600 hover:text-primary-900" size="sm">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No recent tests found. Take some tests to see your results here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTests;
