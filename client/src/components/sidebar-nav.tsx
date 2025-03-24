import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  Home,
  BarChart2,
  FileEdit,
  Book,
  Users,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

const SidebarNav = () => {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isMobile } = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      }
    });
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      path: "/"
    },
    {
      label: "Performance",
      icon: <BarChart2 className="w-5 h-5" />,
      path: "/performance"
    },
    {
      label: "Practice Tests",
      icon: <FileEdit className="w-5 h-5" />,
      path: "/practice"
    },
    {
      label: "Study Resources",
      icon: <Book className="w-5 h-5" />,
      path: "/resources"
    },
    {
      label: "Study Groups",
      icon: <Users className="w-5 h-5" />,
      path: "/study-groups"
    },
    {
      label: "Achievements",
      icon: <Trophy className="w-5 h-5" />,
      path: "/achievements"
    },
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/settings"
    }
  ];

  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">TestPal</h1>
      </div>
      
      <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
        <div className="mb-6 mt-2">
          <div className="flex items-center px-3 py-2 space-x-3">
            <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium">
                {user?.fullName?.charAt(0) || "U"}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.fullName || "User"}</p>
              <p className="text-xs text-gray-500">{user?.grade || "Student"}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
            >
              <a
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium ${
                  location === item.path
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={location === item.path ? "page" : undefined}
              >
                <span className={`w-6 ${location === item.path ? "text-primary-500" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="flex items-center w-full justify-start px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 mr-2 text-gray-500" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </>
  );

  // Mobile sidebar with backdrop
  const renderMobileSidebar = () => (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
        <h1 className="text-xl font-bold text-primary-600">TestPal</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 hover:text-gray-600"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </Button>
            </div>
            
            {renderSidebarContent()}
          </div>
          
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        {renderSidebarContent()}
      </div>

      {/* Mobile header and sidebar */}
      {isMobile && renderMobileSidebar()}
    </>
  );
};

export default SidebarNav;
