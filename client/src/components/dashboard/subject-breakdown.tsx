import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubjectBreakdownProps {
  subjects: any[];
}

const SubjectBreakdown = ({ subjects }: SubjectBreakdownProps) => {
  // Sort subjects by average score in descending order
  const sortedSubjects = [...subjects].sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Performance</CardTitle>
      </CardHeader>
      
      <CardContent>
        {sortedSubjects.length > 0 ? (
          <div className="space-y-4">
            {sortedSubjects.map((subject, index) => {
              // Determine strong and weak areas
              // This is just a placeholder, in a real app this would be based on actual data
              const strongAreas = ["Calculus", "Algebra"];
              const weakAreas = ["Trigonometry"];
              
              if (index === 1) {
                strongAreas[0] = "Organic Chemistry";
                strongAreas[1] = "Periodic Table";
                weakAreas[0] = "Thermodynamics";
              } else if (index === 2) {
                strongAreas[0] = "Mechanics";
                strongAreas[1] = "Waves";
                weakAreas[0] = "Electromagnetism";
              } else if (index === 3) {
                strongAreas[0] = "Genetics";
                strongAreas[1] = "Cell Biology";
                weakAreas[0] = "Ecology";
              }
              
              // Determine the color of the progress bar based on the index
              const colorClasses = [
                "bg-primary-500", // Primary for first subject
                "bg-secondary-500", // Secondary for second subject
                "bg-accent-500", // Accent for third subject
                "bg-green-500", // Green for fourth subject
                "bg-yellow-500" // Yellow for fifth subject
              ];
              
              return (
                <div key={subject.id || index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{subject.name}</span>
                    <span className="text-sm font-medium">{Math.round(subject.avg_score || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${colorClasses[index % colorClasses.length]}`} 
                      style={{ width: `${Math.round(subject.avg_score || 0)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Strong: {strongAreas.join(", ")}</span>
                    <span>Weak: {weakAreas.join(", ")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No subject performance data available. Take some tests to see your performance breakdown.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectBreakdown;
