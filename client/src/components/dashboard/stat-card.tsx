import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart2, 
  ChartPie, 
  Vial, 
  Clock, 
  Trophy, 
  ArrowUp, 
  ArrowDown, 
  Plus
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  changePercent: number;
  icon: string;
  color: "primary" | "secondary" | "accent" | "yellow";
}

const StatCard = ({ title, value, changePercent, icon, color }: StatCardProps) => {
  // Define color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary-100 text-primary-500";
      case "secondary":
        return "bg-secondary-100 text-secondary-500";
      case "accent":
        return "bg-accent-100 text-accent-500";
      case "yellow":
        return "bg-yellow-100 text-yellow-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };
  
  // Render the appropriate icon
  const renderIcon = () => {
    switch (icon) {
      case "chart-pie":
        return <ChartPie />;
      case "chart-bar":
        return <BarChart2 />;
      case "vial":
        return <Vial />;
      case "clock":
        return <Clock />;
      case "trophy":
        return <Trophy />;
      default:
        return <BarChart2 />;
    }
  };
  
  const isPositiveChange = changePercent >= 0;
  
  return (
    <Card className="bg-white shadow-sm p-5 border border-gray-100">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {isPositiveChange ? (
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            {changePercent}
            {typeof changePercent === 'number' && !Number.isInteger(changePercent) ? '' : '%'}
          </span>
        </div>
        <div className="flex items-center">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`ml-auto p-3 rounded-full ${getColorClasses()}`}>
            {renderIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
