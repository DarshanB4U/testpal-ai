import { Link } from "wouter";

interface UpcomingTest {
  id: number;
  title: string;
  date: Date;
  topics: string;
  daysRemaining: number;
}

interface UpcomingTestCardProps {
  test: UpcomingTest;
}

export function UpcomingTestCard({ test }: UpcomingTestCardProps) {
  // Format the date
  const formattedDate = test.date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = test.date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  // Determine urgency level based on days remaining
  const getUrgencyClass = (days: number) => {
    if (days <= 2) return "text-warning bg-warning bg-opacity-10";
    if (days <= 7) return "text-primary bg-primary bg-opacity-10";
    return "text-green-600 bg-green-100";
  };
  
  const urgencyClass = getUrgencyClass(test.daysRemaining);
  
  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {test.title}
          </p>
          <div className="flex flex-shrink-0 ml-2">
            <p className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${urgencyClass}`}>
              In {test.daysRemaining} {test.daysRemaining === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {test.topics}
            </p>
          </div>
          <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p>
              {formattedDate} • {formattedTime}
            </p>
          </div>
        </div>
        <div className="flex mt-4">
          <Link href="/practice" className="text-sm font-medium text-primary hover:text-primary-dark">
            Create study plan →
          </Link>
        </div>
      </div>
    </li>
  );
}
