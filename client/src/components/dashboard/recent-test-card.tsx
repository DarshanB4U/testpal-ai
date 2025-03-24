import { TestResult } from "@/types";
import { Link } from "wouter";
import { format } from "date-fns";

interface RecentTestCardProps {
  testResult: TestResult;
}

// Function to get the color class based on score percentage
const getScoreColorClass = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "bg-green-100 text-green-800";
  if (percentage >= 70) return "bg-green-100 text-green-800";
  if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

export function RecentTestCard({ testResult }: RecentTestCardProps) {
  if (!testResult.test) {
    return null;
  }

  const scorePercentage = Math.round((testResult.score / testResult.maxScore) * 100);
  const scoreColorClass = getScoreColorClass(testResult.score, testResult.maxScore);
  const completedDate = new Date(testResult.completedAt);
  const formattedDate = format(completedDate, "MMMM d, yyyy");

  // Extract topic names from the test description if available
  const topicNames = testResult.test.description || "Various topics";

  return (
    <li>
      <Link href={`/tests/${testResult.id}`} className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary truncate">
              {testResult.test.title}
            </p>
            <div className="flex flex-shrink-0 ml-2">
              <p className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${scoreColorClass}`}>
                {scorePercentage}%
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {topicNames}
              </p>
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p>Completed on {formattedDate}</p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
