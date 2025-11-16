"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, FileText, CheckCircle, TrendingUp } from "lucide-react";
import { CarbonFootprintCard } from "@/components/CarbonFootprintCard";

interface UserStatsProps {
  userId: number;
  refreshTrigger?: number;
}

export function UserStats({ userId, refreshTrigger }: UserStatsProps) {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    totalPoints: 0,
    rank: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [userId, refreshTrigger]);

  const fetchStats = async () => {
    console.log("📊 Fetching stats for user:", userId);
    setIsLoading(true);
    setError(null);
    
    try {
      // Add cache-busting timestamp to prevent stale data
      const timestamp = Date.now();
      
      // Fetch user reports
      console.log("📋 Fetching reports...");
      const reportsRes = await fetch(`/api/reports?userId=${userId}&_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!reportsRes.ok) {
        throw new Error(`Reports API failed: ${reportsRes.status}`);
      }
      
      const reports = await reportsRes.json();
      console.log("✅ Reports fetched:", reports.length, "reports");
      
      const totalReports = reports.length;
      const resolvedReports = reports.filter((r: any) => r.status === 'resolved').length;
      console.log("📈 Resolved reports:", resolvedReports);
      
      // Fetch user data for points
      console.log("👤 Fetching user data...");
      const userRes = await fetch(`/api/auth/me?id=${userId}&_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!userRes.ok) {
        throw new Error(`User API failed: ${userRes.status}`);
      }
      
      const userData = await userRes.json();
      console.log("✅ User data fetched. Points:", userData.points);
      
      // Fetch leaderboard to get rank (limit=50 is the API max)
      console.log("🏆 Fetching leaderboard...");
      const leaderboardRes = await fetch(`/api/leaderboard?limit=50&role=citizen&_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!leaderboardRes.ok) {
        throw new Error(`Leaderboard API failed: ${leaderboardRes.status}`);
      }
      
      const leaderboard = await leaderboardRes.json();
      const userRank = leaderboard.findIndex((u: any) => u.id === userId) + 1;
      console.log("✅ Leaderboard fetched. User rank:", userRank);
      
      const newStats = {
        totalReports,
        resolvedReports,
        totalPoints: userData.points || 0,
        rank: userRank > 0 ? userRank : 0,
      };
      
      console.log("🎯 Final stats:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("❌ Failed to fetch stats:", error);
      setError(error instanceof Error ? error.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        <p className="font-semibold">Error loading stats</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-12 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.totalReports}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{stats.resolvedReports}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">{stats.totalPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">#{stats.rank || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carbon Footprint Card - Full Width on Mobile, Spans 1 Col on Desktop */}
      <div className="md:col-span-2 lg:col-span-1">
        <CarbonFootprintCard userId={userId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}