import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string | number;
  change?: string;
  changeColor?: string;
}

export function StatsCard({ 
  icon, 
  iconBgColor, 
  iconColor, 
  title, 
  value, 
  change, 
  changeColor = "text-green-600" 
}: StatsCardProps) {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <div className={`p-3 mr-4 ${iconBgColor} rounded-full`}>
        <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && <p className={`text-sm ${changeColor}`}>{change}</p>}
      </div>
    </div>
  );
}
