import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  trends: any[];
}

const PerformanceChart = ({ trends }: PerformanceChartProps) => {
  const [timeRange, setTimeRange] = useState("3");
  
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    
    // Group by month and calculate average scores for each subject
    const groupedByMonth: { [key: string]: any } = {};
    
    trends.forEach(item => {
      if (!groupedByMonth[item.month_name]) {
        groupedByMonth[item.month_name] = { name: item.month_name };
      }
      
      if (item.avg_score !== null) {
        groupedByMonth[item.month_name][item.subject_name] = Math.round(item.avg_score);
      }
    });
    
    // Convert the object to an array and limit to the selected time range
    const result = Object.values(groupedByMonth);
    return result.slice(-parseInt(timeRange));
  }, [trends, timeRange]);
  
  // Extract unique subject names from the trends data
  const subjects = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    const subjectNames = new Set<string>();
    trends.forEach(item => {
      if (item.subject_name) {
        subjectNames.add(item.subject_name);
      }
    });
    return Array.from(subjectNames);
  }, [trends]);
  
  // Define colors for each subject line
  const subjectColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Performance Trends</CardTitle>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent>
        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value) => [`${value}%`, ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                {subjects.map((subject, index) => (
                  <Line
                    key={subject}
                    type="monotone"
                    dataKey={subject}
                    stroke={subjectColors[index % subjectColors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No performance data available
            </div>
          )}
        </div>
        
        {/* Legend */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap justify-center space-x-6 mt-4">
            {subjects.map((subject, index) => (
              <div key={subject} className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: subjectColors[index % subjectColors.length] }}
                ></span>
                <span className="text-sm text-gray-600">{subject}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
