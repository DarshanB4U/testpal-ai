import { useQuery } from "@tanstack/react-query";
import SidebarNav from "@/components/sidebar-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Award, Star, Target, Clock, BookOpen } from "lucide-react";

const AchievementsPage = () => {
  // Get user achievements
  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery<any[]>({
    queryKey: ["/api/achievements/user"],
  });
  
  // Get all achievements
  const { data: allAchievements, isLoading: isLoadingAllAchievements } = useQuery<any[]>({
    queryKey: ["/api/achievements"],
  });
  
  const isLoading = isLoadingUserAchievements || isLoadingAllAchievements;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!userAchievements || !allAchievements || allAchievements.length === 0) return 0;
    return (userAchievements.length / allAchievements.length) * 100;
  };
  
  // Map achievement icons
  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <Trophy className="h-5 w-5" />;
      case 'award':
        return <Award className="h-5 w-5" />;
      case 'star':
        return <Star className="h-5 w-5" />;
      case 'target':
        return <Target className="h-5 w-5" />;
      case 'clock':
        return <Clock className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };
  
  const isAchievementEarned = (achievementId: number) => {
    return userAchievements?.some(a => a.id === achievementId);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <SidebarNav />
      
      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white md:flex md:items-center md:justify-between px-6 py-3 border-b border-gray-200 hidden">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">Achievements</h2>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Achievements</h1>
            <p className="mt-1 text-gray-600">Track your progress and unlock achievements as you improve.</p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Achievement Progress */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle>Achievement Progress</CardTitle>
                  <CardDescription>You've earned {userAchievements?.length || 0} out of {allAchievements?.length || 0} achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(calculateCompletion())}%</span>
                    </div>
                    <Progress value={calculateCompletion()} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="earned">
                <TabsList className="mb-6">
                  <TabsTrigger value="earned">Earned Achievements</TabsTrigger>
                  <TabsTrigger value="available">Available Achievements</TabsTrigger>
                </TabsList>
                
                {/* Earned Achievements */}
                <TabsContent value="earned">
                  {userAchievements && userAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userAchievements.map(achievement => (
                        <Card key={achievement.id} className="overflow-hidden">
                          <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-700">
                              {getAchievementIcon(achievement.icon)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{achievement.name}</CardTitle>
                              <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                                Earned
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                            <p className="text-xs text-gray-400">Earned on {formatDate(achievement.earnedAt)}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
                      <Trophy className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No achievements earned yet</h3>
                      <p className="text-gray-500 mt-2 max-w-sm text-center">
                        Keep practicing and improving your test scores to earn achievements.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Available Achievements */}
                <TabsContent value="available">
                  {allAchievements && allAchievements.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">All Achievements</h3>
                      
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                          <div className="col-span-1"></div>
                          <div className="col-span-3">Achievement</div>
                          <div className="col-span-6">Description</div>
                          <div className="col-span-2">Status</div>
                        </div>
                        
                        {allAchievements.map(achievement => (
                          <div 
                            key={achievement.id} 
                            className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-200 last:border-0 ${
                              isAchievementEarned(achievement.id) ? "bg-green-50" : ""
                            }`}
                          >
                            <div className="col-span-1">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                isAchievementEarned(achievement.id) 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {getAchievementIcon(achievement.icon)}
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="font-medium text-gray-900">{achievement.name}</div>
                            </div>
                            <div className="col-span-6 text-gray-500">
                              {achievement.description}
                            </div>
                            <div className="col-span-2">
                              {isAchievementEarned(achievement.id) ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Earned
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
                      <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No achievements available</h3>
                      <p className="text-gray-500 mt-2">
                        Check back later for available achievements.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AchievementsPage;
