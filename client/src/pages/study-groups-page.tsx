import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Mock data for study groups (in a real app, these would come from API)
const mockStudyGroups = [
  {
    id: 1,
    name: "AP Chemistry Study Group",
    topic: "Chemistry",
    memberCount: 8,
    description: "A group for students preparing for AP Chemistry exams. We meet twice a week and go over practice problems together.",
    nextMeeting: "Friday, May 15, 5:00 PM",
  },
  {
    id: 2,
    name: "Calculus Masters",
    topic: "Mathematics",
    memberCount: 12,
    description: "Advanced calculus study group focusing on derivatives, integrals, and their applications.",
    nextMeeting: "Wednesday, May 13, 6:30 PM",
  },
  {
    id: 3,
    name: "Physics Problem Solvers",
    topic: "Physics",
    memberCount: 6,
    description: "We tackle challenging physics problems together, focusing on mechanics and electromagnetism.",
    nextMeeting: "Monday, May 11, 4:00 PM",
  },
  {
    id: 4,
    name: "Biology Exam Prep",
    topic: "Biology",
    memberCount: 10,
    description: "Preparing for upcoming biology exams by reviewing key concepts and sharing study materials.",
    nextMeeting: "Thursday, May 14, 7:00 PM",
  },
];

// Mock data for discussion posts
const mockDiscussionPosts = [
  {
    id: 1,
    groupId: 1,
    user: {
      name: "Sarah Johnson",
      initials: "SJ",
    },
    content: "Can someone help me understand balancing redox reactions in acidic solutions? I'm struggling with the concept.",
    timestamp: "2 hours ago",
    replies: [
      {
        id: 101,
        user: {
          name: "Michael Chen",
          initials: "MC",
        },
        content: "I found this helpful method: first separate the reaction into half-reactions, then balance each one, and finally combine them. If you want, I can share my notes from last week's study session.",
        timestamp: "1 hour ago",
      },
    ],
  },
  {
    id: 2,
    groupId: 1,
    user: {
      name: "Alex Thompson",
      initials: "AT",
    },
    content: "Just wanted to share this great resource I found for understanding periodic trends: https://www.chemguide.co.uk/atoms/properties/periodic.html",
    timestamp: "Yesterday",
    replies: [],
  },
];

// Form schema for creating a new group
const createGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  topic: z.string().min(1, "Topic is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  meetingTime: z.string().min(1, "Meeting time is required"),
});

// Form schema for posting a discussion
const postDiscussionSchema = z.object({
  content: z.string().min(5, "Post must be at least 5 characters"),
});

export default function StudyGroupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [myGroups, setMyGroups] = useState<number[]>([1]); // Mock joined groups (in a real app, this would come from API)
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  
  // Create group form
  const createGroupForm = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      topic: "",
      description: "",
      meetingTime: "",
    },
  });
  
  // Post discussion form
  const postDiscussionForm = useForm<z.infer<typeof postDiscussionSchema>>({
    resolver: zodResolver(postDiscussionSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Handle creating a new group
  const handleCreateGroup = (values: z.infer<typeof createGroupSchema>) => {
    // In a real app, this would make an API call to create the group
    console.log("Creating group:", values);
    toast({
      title: "Group created!",
      description: `Your study group "${values.name}" has been created successfully.`,
    });
    setCreateDialogOpen(false);
    createGroupForm.reset();
  };
  
  // Handle joining a group
  const handleJoinGroup = (groupId: number) => {
    // In a real app, this would make an API call to join the group
    if (!myGroups.includes(groupId)) {
      setMyGroups([...myGroups, groupId]);
      toast({
        title: "Group joined!",
        description: "You have successfully joined the study group.",
      });
    }
    setJoinDialogOpen(false);
  };
  
  // Handle posting a discussion
  const handlePostDiscussion = (values: z.infer<typeof postDiscussionSchema>) => {
    // In a real app, this would make an API call to post the discussion
    console.log("Posting discussion:", values);
    toast({
      title: "Post submitted!",
      description: "Your question has been posted to the group.",
    });
    postDiscussionForm.reset();
  };
  
  return (
    <MainLayout title="Study Groups">
      <div className="py-4">
        <Tabs defaultValue="my-groups">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-2 w-80">
              <TabsTrigger value="my-groups">My Groups</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create New Group</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create a New Study Group</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new study group. Others will be able to join your group and collaborate.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createGroupForm}>
                  <form onSubmit={createGroupForm.handleSubmit(handleCreateGroup)} className="space-y-4">
                    <FormField
                      control={createGroupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., AP Chemistry Study Buddies" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createGroupForm.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Topic</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a topic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Chemistry">Chemistry</SelectItem>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Physics">Physics</SelectItem>
                              <SelectItem value="Biology">Biology</SelectItem>
                              <SelectItem value="Computer Science">Computer Science</SelectItem>
                              <SelectItem value="Literature">Literature</SelectItem>
                              <SelectItem value="History">History</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createGroupForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what your group will focus on and how you'll collaborate" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createGroupForm.control}
                      name="meetingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regular Meeting Time</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Fridays at 5:00 PM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Create Group</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <TabsContent value="my-groups">
            {myGroups.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {mockStudyGroups
                  .filter(group => myGroups.includes(group.id))
                  .map(group => (
                    <Card key={group.id} className={`overflow-hidden ${selectedGroup === group.id ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader className="bg-gray-50">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {group.topic}
                          </span>
                        </div>
                        <CardDescription>
                          {group.memberCount} members • Next meeting: {group.nextMeeting}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 bg-gray-50 border-t">
                        <Button 
                          className="w-full" 
                          variant={selectedGroup === group.id ? "secondary" : "default"}
                          onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                        >
                          {selectedGroup === group.id ? "Hide Discussions" : "View Discussions"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No study groups joined</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't joined any study groups yet. Discover groups or create your own!
                </p>
                <div className="mt-6">
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    Create a Study Group
                  </Button>
                </div>
              </div>
            )}
            
            {selectedGroup && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Group Discussions</CardTitle>
                    <CardDescription>
                      Ask questions and discuss study materials with your group members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...postDiscussionForm}>
                      <form onSubmit={postDiscussionForm.handleSubmit(handlePostDiscussion)} className="space-y-4">
                        <FormField
                          control={postDiscussionForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Ask a question or share something with the group..." 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button type="submit">Post to Group</Button>
                        </div>
                      </form>
                    </Form>
                    
                    <div className="space-y-6">
                      {mockDiscussionPosts
                        .filter(post => post.groupId === selectedGroup)
                        .map(post => (
                          <div key={post.id} className="space-y-4">
                            <div className="flex space-x-3">
                              <Avatar>
                                <AvatarFallback>{post.user.initials}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium">{post.user.name}</h3>
                                  <p className="text-xs text-gray-500">{post.timestamp}</p>
                                </div>
                                <p className="text-sm text-gray-600">{post.content}</p>
                                <div className="pt-2">
                                  <Button variant="ghost" size="sm">Reply</Button>
                                </div>
                              </div>
                            </div>
                            
                            {post.replies.length > 0 && (
                              <div className="pl-10 border-l-2 border-gray-100 space-y-4">
                                {post.replies.map(reply => (
                                  <div key={reply.id} className="flex space-x-3">
                                    <Avatar>
                                      <AvatarFallback>{reply.user.initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium">{reply.user.name}</h3>
                                        <p className="text-xs text-gray-500">{reply.timestamp}</p>
                                      </div>
                                      <p className="text-sm text-gray-600">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="discover">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockStudyGroups
                .filter(group => !myGroups.includes(group.id))
                .map(group => (
                  <Card key={group.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {group.topic}
                        </span>
                      </div>
                      <CardDescription>
                        {group.memberCount} members • Next meeting: {group.nextMeeting}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 bg-gray-50 border-t">
                      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">Join Group</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Join "{group.name}"</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to join this study group? You'll be able to participate in discussions and attend meetings.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <Button onClick={() => handleJoinGroup(group.id)}>Join Group</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
