import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Subject } from "@shared/schema";

interface UpcomingExamsProps {
  exams: any[];
}

const UpcomingExams = ({ exams }: UpcomingExamsProps) => {
  // Get subjects to display subject names
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  const getSubjectName = (subjectId: number) => {
    return subjects?.find(s => s.id === subjectId)?.name || "Unknown Subject";
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      day: date.getDate(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };
  
  const getDaysLeft = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to compare just the dates
    now.setHours(0, 0, 0, 0);
    const examDate = new Date(date);
    examDate.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    const diffInTime = examDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    
    return diffInDays;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Exams</CardTitle>
      </CardHeader>
      
      <CardContent>
        {exams && exams.length > 0 ? (
          <div className="space-y-3">
            {exams.map((exam) => {
              const formattedDate = formatDate(exam.date);
              const daysLeft = getDaysLeft(exam.date);
              
              // Determine color based on how soon the exam is
              let colorClass = "text-green-600";
              if (daysLeft <= 5) {
                colorClass = "text-red-600";
              } else if (daysLeft <= 14) {
                colorClass = "text-yellow-600";
              }
              
              return (
                <div key={exam.id} className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex flex-col items-center justify-center text-red-700">
                    <span className="text-xs font-semibold">{formattedDate.month.toUpperCase()}</span>
                    <span className="text-lg font-bold leading-none">{formattedDate.day}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium">{exam.title}</h4>
                    <p className="text-xs text-gray-500">{formattedDate.time} - {exam.location || "Not specified"}</p>
                  </div>
                  <div className={`ml-2 text-xs font-medium ${colorClass}`}>
                    <span>{daysLeft} {daysLeft === 1 ? "day" : "days"} left</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No upcoming exams</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingExams;
