import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressData } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressChartProps {
  data: ProgressData[];
  isLoading: boolean;
}

export function ProgressChart({ data, isLoading }: ProgressChartProps) {
  const formatData = (data: ProgressData[]) => {
    // Group by month and create a data point for each month with subject scores
    const monthlyData: Record<string, any> = {};
    
    data.forEach(item => {
      const month = item.month.trim();
      if (!monthlyData[month]) {
        monthlyData[month] = { month };
      }
      
      // Add subject score to the month data
      monthlyData[month][item.subjectName] = item.averageScore;
    });
    
    // Convert to array for recharts
    return Object.values(monthlyData);
  };

  // Extract subject names for creating lines
  const getSubjects = (data: ProgressData[]) => {
    const subjectSet = new Set<string>();
    data.forEach(item => subjectSet.add(item.subjectName));
    return Array.from(subjectSet);
  };

  // Colors for different lines
  const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const subjects = getSubjects(data);
  const formattedData = formatData(data);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p>Loading progress data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Over Time</CardTitle>
        <p className="text-sm text-gray-500">Your score trends for the past 3 months</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickCount={6} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Score']}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend />
              {subjects.map((subject, index) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
