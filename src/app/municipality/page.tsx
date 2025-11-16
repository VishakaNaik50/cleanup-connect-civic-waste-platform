"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Recycle, LogOut, Map, List, BarChart3 } from "lucide-react";
import { MunicipalityReportsList } from "@/components/MunicipalityReportsList";
import { MunicipalityStats } from "@/components/MunicipalityStats";
import { ReportsMap } from "@/components/ReportsMap";

export default function MunicipalityDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push("/");
      return;
    }
    if (currentUser.role !== "municipality") {
      router.push("/citizen");
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/abstract-environmental-pattern-backgroun-4174ad59-20251116034817.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
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

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/modern-municipality-control-room-with-la-ea230129-20251116034818.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background z-[1]" />
        
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