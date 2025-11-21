"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Recycle, LogOut, Map, List, BarChart3, MapPin, Clock, AlertTriangle, CheckCircle2, Play } from "lucide-react";
import { MunicipalityReportsList } from "@/components/MunicipalityReportsList";
import { MunicipalityStats } from "@/components/MunicipalityStats";
import { ReportsMap } from "@/components/ReportsMap";
import { toast } from "sonner";

interface WorkerTask {
  id: number;
  reportId: number;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  wardNumber: string;
  photoUrl: string;
  wasteType: string;
  severity: string;
  status: string;
  assignedAt: string;
  updatedAt: string;
  teamName: string;
}

export default function MunicipalityDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [isWorker, setIsWorker] = useState(false);
  
  // Worker-specific states
  const [workerTasks, setWorkerTasks] = useState<WorkerTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push("/");
      return;
    }
    
    // Redirect super-admin to admin dashboard
    if (currentUser.role === "super-admin") {
      router.push("/admin/dashboard");
      return;
    }
    
    if (currentUser.role !== "municipality") {
      router.push("/citizen");
      return;
    }
    setUser(currentUser);
    
    // Check if user is a worker (assigned to a team)
    checkWorkerStatus(currentUser.id);
  }, [router]);

  const checkWorkerStatus = async (userId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/worker/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        // User has worker tasks, so they're a worker
        setIsWorker(true);
        fetchWorkerTasks();
      } else {
        setIsWorker(false);
      }
    } catch (error) {
      console.error("Failed to check worker status:", error);
      setIsWorker(false);
    }
  };

  const fetchWorkerTasks = async () => {
    try {
      setLoadingTasks(true);
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/worker/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const tasks = await res.json();
        setWorkerTasks(tasks);
      } else {
        toast.error("Failed to load tasks");
      }
    } catch (error) {
      console.error("Failed to fetch worker tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleUpdateStatus = (task: WorkerTask) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedTask || !newStatus) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/worker/tasks/${selectedTask.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success("Task status updated successfully");
        setStatusDialogOpen(false);
        fetchWorkerTasks();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
      case "in_progress": return "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400";
      case "assigned": return "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress": return <Play className="h-4 w-4" />;
      case "assigned": return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredTasks = statusFilter === "all" 
    ? workerTasks 
    : workerTasks.filter(task => task.status === statusFilter);

  const workerStats = {
    total: workerTasks.length,
    assigned: workerTasks.filter(t => t.status === "assigned").length,
    inProgress: workerTasks.filter(t => t.status === "in_progress").length,
    resolved: workerTasks.filter(t => t.status === "resolved").length
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  // Worker View
  if (isWorker) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Video Background */}
        <div className="fixed inset-0 opacity-10 dark:opacity-15 pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_videos/diverse-group-of-happy-young-volunteers--c3c5cf28-20251120131108.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Worker Portal
                </h1>
                <p className="text-xs text-muted-foreground font-medium">My Assigned Tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <p className="font-bold text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.municipalityName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 border-gray-200/50 dark:border-gray-700/50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{workerStats.total}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Assigned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{workerStats.assigned}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{workerStats.inProgress}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{workerStats.resolved}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Filter by Status:</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {loadingTasks ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your tasks...</p>
                </CardContent>
              </Card>
            ) : filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {statusFilter === "all" ? "No tasks assigned to you yet" : `No ${statusFilter.replace("_", " ")} tasks`}
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map(task => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Photo */}
                      <img
                        src={task.photoUrl}
                        alt="Task"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(task.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(task.status)}
                                  {task.status.replace("_", " ").toUpperCase()}
                                </span>
                              </Badge>
                              <Badge variant="outline">{task.wasteType}</Badge>
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getSeverityColor(task.severity)}`} />
                                <span className="text-sm text-muted-foreground capitalize">
                                  {task.severity} severity
                                </span>
                              </div>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{task.description}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {task.location}
                              </div>
                              <div>Ward {task.wardNumber}</div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Assigned {new Date(task.assignedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleUpdateStatus(task)}
                            size="sm"
                            disabled={task.status === "resolved"}
                          >
                            Update Status
                          </Button>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Coordinates: {task.latitude.toFixed(6)}, {task.longitude.toFixed(6)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Team: {task.teamName}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Task Status</DialogTitle>
              <DialogDescription>
                Change the status of this task to track your progress
              </DialogDescription>
            </DialogHeader>
            
            {selectedTask && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-semibold mb-2">{selectedTask.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTask.location} • Ward {selectedTask.wardNumber}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Status progression: Assigned → In Progress → Resolved
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmStatusUpdate}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Regular Municipality View (for non-workers)
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Video Background */}
      <div className="fixed inset-0 opacity-10 dark:opacity-15 pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_videos/modern-high-tech-municipality-control-ce-551d8368-20251120131111.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                CleanUp Connect
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Municipality Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="font-bold text-sm">{user.municipalityName}</p>
              <p className="text-xs text-muted-foreground">{user.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 border-gray-200/50 dark:border-gray-700/50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_videos/modern-high-tech-municipality-control-ce-551d8368-20251120131111.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background z-[1]" />
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="mb-8">
            <Badge className="mb-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 px-4 py-2 text-sm font-semibold shadow-lg">
              🏛️ Municipal Control Center
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              Welcome, <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">{user.municipalityName}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage waste reports and keep your community clean and sustainable
            </p>
          </div>

          {/* Stats Cards */}
          <MunicipalityStats municipalityName={user.municipalityName} />
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12 max-w-7xl relative z-10">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <TabsTrigger 
              value="list" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <List className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="map"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <MunicipalityReportsList 
              municipalityName={user.municipalityName}
              municipalityUserId={user.id}
            />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <ReportsMap municipalityName={user.municipalityName} />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive analytics and insights for waste management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                      Waste Type Distribution
                    </h4>
                    <div className="space-y-3">
                      {[
                        { type: "Plastic", percent: "35%", color: "from-blue-500 to-cyan-500" },
                        { type: "Organic", percent: "25%", color: "from-green-500 to-emerald-500" },
                        { type: "Metal", percent: "15%", color: "from-gray-500 to-slate-500" },
                        { type: "Electronic", percent: "12%", color: "from-purple-500 to-pink-500" },
                        { type: "Other", percent: "13%", color: "from-orange-500 to-red-500" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 p-3 rounded-xl">
                          <span className="text-sm font-medium">{item.type}</span>
                          <Badge className={`bg-gradient-to-r ${item.color} text-white border-0`}>
                            {item.percent}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                      Response Performance
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: "Average Response", value: "2.3 days", color: "from-blue-500 to-cyan-500" },
                        { label: "Fastest Response", value: "4 hours", color: "from-purple-500 to-pink-500" },
                        { label: "Resolution Rate", value: "85%", color: "from-green-500 to-emerald-500" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 p-3 rounded-xl">
                          <span className="text-sm font-medium">{item.label}</span>
                          <Badge className={`bg-gradient-to-r ${item.color} text-white border-0`}>
                            {item.value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}