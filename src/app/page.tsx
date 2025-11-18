"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthDialog } from "@/components/AuthDialog";
import { MapPin, Users, Award, TrendingUp, Shield, BarChart3, Camera, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    totalReports: 25,
    activeMembers: 8,
    resolvedReports: 5,
    municipalities: 3,
    totalCarbonKg: 0,
  });

  useEffect(() => {
    // Fetch platform-wide carbon stats
    const fetchPlatformCarbonStats = async () => {
      try {
        // Get all users
        const usersRes = await fetch("/api/users");
        if (!usersRes.ok) return;
        const users = await usersRes.json();
        
        // Calculate total carbon footprint from all citizens
        let totalCarbon = 0;
        for (const user of users) {
          if (user.role === "citizen") {
            const carbonRes = await fetch(`/api/users/${user.id}/carbon-stats?userId=${user.id}`);
            if (carbonRes.ok) {
              const carbonData = await carbonRes.json();
              totalCarbon += carbonData.totalCarbonFootprintKg || 0;
            }
          }
        }
        
        setPlatformStats(prev => ({ ...prev, totalCarbonKg: totalCarbon }));
      } catch (error) {
        console.error("Failed to fetch platform carbon stats:", error);
      }
    };

    fetchPlatformCarbonStats();
  }, []);

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
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <img src="/logo.png" alt="Logo" className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              CleanUp Connect
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push("/admin/login")}
              className="text-xs"
            >
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Button>
            <Button onClick={() => setAuthOpen(true)} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/wide-panoramic-view-of-a-clean-modern-su-d8e08e11-20251116034816.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background z-[1]" />
        
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <Badge className="mb-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 px-4 py-2 text-sm font-semibold shadow-lg" variant="secondary">
            🌍 Civic Engagement Platform
          </Badge>
          <h2 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            Make Your City{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Cleaner
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Report waste with a photo, let AI classify it, and connect with your municipality for faster action.
            Join a community committed to sustainability.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => setAuthOpen(true)} className="text-lg px-10 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl hover:shadow-green-500/50 transition-all duration-300">
              Report Waste Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-lg px-10 py-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:bg-white/80 dark:hover:bg-gray-900/80 shadow-xl">
              Learn More
            </Button>
          </div>
          
          {/* Floating Stats Cards */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {[
              { value: "25+", label: "Active Reports", gradient: "from-blue-500 to-cyan-500", icon: <BarChart3 className="h-5 w-5" /> },
              { value: "8", label: "Community Members", gradient: "from-green-500 to-emerald-500", icon: <Users className="h-5 w-5" /> },
              { value: "5", label: "Reports Resolved", gradient: "from-purple-500 to-pink-500", icon: <Award className="h-5 w-5" /> },
              { value: "3", label: "Municipalities", gradient: "from-orange-500 to-red-500", icon: <MapPin className="h-5 w-5" /> },
              { 
                value: platformStats.totalCarbonKg > 0 ? `${platformStats.totalCarbonKg.toFixed(0)}kg` : "0kg", 
                label: "CO₂e Avoided", 
                gradient: "from-emerald-500 to-teal-500", 
                icon: <Leaf className="h-5 w-5" /> 
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-transform duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center mb-3 mx-auto shadow-lg`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* ...(remains unchanged)... */}

      {/* How It Works */}
      {/* ...(remains unchanged)... */}

      {/* About Section */}
      {/* ...(remains unchanged)... */}

      {/* CTA Section */}
      {/* ...(remains unchanged)... */}

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <img src="/logo.png" alt="Logo" className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              CleanUp Connect
            </span>
          </div>
          <p className="text-base mb-3">
            Building sustainable communities through civic engagement and technology
          </p>
          <p className="text-sm">© 2024 CleanUp Connect. All rights reserved.</p>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}