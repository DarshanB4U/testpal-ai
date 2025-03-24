import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Define StudyGroup type locally as it's not part of the shared schema yet
interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  memberCount?: number;
  lastActiveAt: string;
}
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

interface StudyGroupsProps {
  groups: StudyGroup[];
}

const StudyGroups = ({ groups }: StudyGroupsProps) => {
  const [, navigate] = useLocation();
  
  const formatLastActive = (lastActiveAt: string) => {
    const date = new Date(lastActiveAt);
    const now = new Date();
    
    // Calculate the difference in hours
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Active now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const getGroupIcon = (groupName: string) => {
    // This function assigns an appropriate icon based on the group name
    if (groupName.toLowerCase().includes("chemistry")) {
      return "flask";
    } else if (groupName.toLowerCase().includes("math") || groupName.toLowerCase().includes("calculus")) {
      return "square-root-alt";
    } else if (groupName.toLowerCase().includes("physics")) {
      return "atom";
    } else {
      return "book";
    }
  };
  
  const navigateToStudyGroups = () => {
    navigate("/study-groups");
  };
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle>Your Study Groups</CardTitle>
        <Button 
          variant="link" 
          className="text-primary-600 text-sm hover:text-primary-700 font-medium" 
          onClick={navigateToStudyGroups}
        >
          View all
        </Button>
      </CardHeader>
      
      <CardContent>
        {groups && groups.length > 0 ? (
          <div className="space-y-3">
            {groups.slice(0, 3).map((group, index) => {
              // Determine the background and text color based on the index
              const bgColors = ["bg-primary-100", "bg-secondary-100", "bg-accent-100"];
              const textColors = ["text-primary-600", "text-secondary-600", "text-accent-600"];
              
              return (
                <div key={group.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className={`flex-shrink-0 w-10 h-10 ${bgColors[index % 3]} rounded-full flex items-center justify-center ${textColors[index % 3]}`}>
                    <i className={`fas fa-${getGroupIcon(group.name)}`}></i>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium">{group.name}</h4>
                    <p className="text-xs text-gray-500">15 members · {formatLastActive(group.lastActiveAt)}</p>
                  </div>
                  <button className="ml-2 p-1 text-gray-400 hover:text-gray-500">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>You're not in any study groups yet</p>
          </div>
        )}
        
        <Button 
          onClick={navigateToStudyGroups}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Join New Study Group
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudyGroups;
