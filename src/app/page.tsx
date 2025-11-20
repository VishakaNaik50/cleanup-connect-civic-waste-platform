"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthDialog } from "@/components/AuthDialog";
import { MapPin, Users, Award, TrendingUp, Recycle, Shield, BarChart3, Camera, Leaf, Sparkles, Heart, Target } from "lucide-react";
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
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300">
              <Recycle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
              CleanUp Connect
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push("/admin/login")}
              className="text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Admin
            </Button>
            <Button 
              onClick={() => setAuthOpen(true)} 
              className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Stunning Video Background */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 overflow-hidden">
        {/* Video Background - More Visible */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_videos/stunning-aerial-view-of-a-modern-sustain-5a938903-20251120131055.mp4" type="video/mp4" />
          </video>
          {/* Lighter overlay for better video visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white/85 dark:from-gray-950/85 dark:via-gray-950/70 dark:to-gray-950/85" />
          {/* Vignette effect for depth */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/40 dark:to-gray-950/40" />
        </div>
        
        <div className="container mx-auto max-w-7xl text-center relative z-10">
          <Badge className="mb-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl text-green-700 dark:text-green-400 border-2 border-green-200/80 dark:border-green-800/80 px-5 py-2 text-sm font-bold shadow-2xl shadow-green-500/20 hover:scale-105 transition-transform duration-300" variant="secondary">
            <Sparkles className="h-4 w-4 mr-2 inline" />
            🌍 Civic Engagement Platform
          </Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight drop-shadow-2xl">
            Make Your City{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-lg">
              Stunning
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-800 dark:text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed font-semibold drop-shadow-lg">
            Report waste with a photo, let AI classify it, and connect with your municipality for faster action.
            <br />
            <span className="text-green-600 dark:text-green-400 font-bold">Join a community committed to sustainability.</span>
          </p>
          <div className="flex gap-4 sm:gap-5 justify-center flex-wrap mb-16">
            <Button 
              size="lg" 
              onClick={() => setAuthOpen(true)} 
              className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-2xl shadow-green-500/40 hover:shadow-3xl hover:shadow-green-500/60 transition-all duration-300 hover:scale-105 font-bold rounded-2xl"
            >
              <Camera className="h-5 w-5 mr-2" />
              Report Waste Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} 
              className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-2 border-green-200 dark:border-green-800 hover:bg-white dark:hover:bg-gray-900 shadow-2xl hover:scale-105 transition-all duration-300 font-bold rounded-2xl"
            >
              Learn More
            </Button>
          </div>
          
          {/* Floating Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5 max-w-6xl mx-auto">
            {[
              { value: "25+", label: "Active Reports", gradient: "from-blue-500 via-cyan-500 to-blue-600", icon: <BarChart3 className="h-5 w-5" /> },
              { value: "8", label: "Community Members", gradient: "from-green-500 via-emerald-500 to-green-600", icon: <Users className="h-5 w-5" /> },
              { value: "5", label: "Reports Resolved", gradient: "from-purple-500 via-pink-500 to-purple-600", icon: <Award className="h-5 w-5" /> },
              { value: "3", label: "Municipalities", gradient: "from-orange-500 via-red-500 to-orange-600", icon: <MapPin className="h-5 w-5" /> },
              { 
                value: platformStats.totalCarbonKg > 0 ? `${platformStats.totalCarbonKg.toFixed(0)}kg` : "0kg", 
                label: "CO₂e Avoided", 
                gradient: "from-emerald-500 via-teal-500 to-emerald-600", 
                icon: <Leaf className="h-5 w-5" /> 
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-gray-200/80 dark:border-gray-700/80 hover:scale-110 hover:shadow-3xl transition-all duration-300 group">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className={`text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 relative bg-gradient-to-b from-white via-green-50/30 to-white dark:from-gray-950 dark:via-green-950/20 dark:to-gray-950">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-800 px-4 py-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Features
            </Badge>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">Powerful Features</h3>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto font-medium">
              Everything you need to report, track, and resolve waste issues in your community
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: <Camera className="h-12 w-12" />,
                title: "Photo Reporting",
                description: "Upload photos of waste with location data. AI automatically classifies waste type and severity.",
                gradient: "from-green-500 via-emerald-500 to-green-600",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/modern-smartphone-taking-photo-of-waste--47c53fec-20251120130556.jpg"
              },
              {
                icon: <MapPin className="h-12 w-12" />,
                title: "Geolocation Integration",
                description: "Reports are automatically routed to the nearest municipality based on GPS coordinates.",
                gradient: "from-blue-500 via-cyan-500 to-blue-600",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/interactive-digital-map-interface-on-tab-64157bc1-20251120130555.jpg"
              },
              {
                icon: <Shield className="h-12 w-12" />,
                title: "Real-time Status Tracking",
                description: "Track your report from submission to resolution with live status updates.",
                gradient: "from-purple-500 via-pink-500 to-purple-600"
              },
              {
                icon: <Users className="h-12 w-12" />,
                title: "Community Engagement",
                description: "Join a community of eco-warriors working together for a cleaner environment.",
                gradient: "from-orange-500 via-red-500 to-orange-600"
              },
              {
                icon: <Award className="h-12 w-12" />,
                title: "Gamification & Rewards",
                description: "Earn points and badges for your contributions. Compete on the leaderboard.",
                gradient: "from-yellow-500 via-orange-500 to-yellow-600",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/award-badge-and-trophy-with-green-leaves-fecacb5b-20251120130555.jpg"
              },
              {
                icon: <BarChart3 className="h-12 w-12" />,
                title: "Municipality Dashboard",
                description: "Municipal teams get map-based visualization, task assignment, and priority filtering.",
                gradient: "from-red-500 via-pink-500 to-red-600"
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 border-gray-200/80 dark:border-gray-700/80 hover:shadow-3xl hover:scale-105 transition-all duration-300 group overflow-hidden rounded-3xl">
                {feature.image && (
                  <div className="h-40 overflow-hidden">
                    <div 
                      className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url('${feature.image}')` }}
                    />
                  </div>
                )}
                <CardHeader className="pb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} w-fit mb-4 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl font-black mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed font-medium">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
        {/* Beautiful Static Background */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/stunning-close-up-photograph-of-diverse--242ddd09-20251120131033.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-green-50/85 to-white/90 dark:from-gray-950/90 dark:via-green-950/85 dark:to-gray-950/90" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-800 px-4 py-2 text-sm font-bold shadow-2xl">
              <Target className="h-4 w-4 mr-2 inline" />
              How It Works
            </Badge>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight drop-shadow-xl">Simple Steps to Make a Difference</h3>
            <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg font-semibold drop-shadow-lg">Transform your community in four easy steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: "1", title: "Spot Waste", desc: "See garbage or waste in your area that needs attention", icon: <MapPin className="h-5 w-5" /> },
              { step: "2", title: "Take a Photo", desc: "Upload a photo with location. AI classifies waste type automatically", icon: <Camera className="h-5 w-5" /> },
              { step: "3", title: "Municipality Action", desc: "Report is sent to the nearest municipality for assignment and action", icon: <Shield className="h-5 w-5" /> },
              { step: "4", title: "Track & Earn", desc: "Monitor progress and earn points for your civic contribution", icon: <Award className="h-5 w-5" /> }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white flex items-center justify-center text-3xl sm:text-4xl font-black mx-auto shadow-2xl shadow-green-500/50 group-hover:scale-110 group-hover:shadow-3xl group-hover:shadow-green-500/70 transition-all duration-300 backdrop-blur-xl">
                    {item.step}
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-4 border-green-500 flex items-center justify-center shadow-2xl">
                    <div className="text-green-600">{item.icon}</div>
                  </div>
                </div>
                <h4 className="font-black text-lg sm:text-xl mb-3 mt-5 drop-shadow-lg">{item.title}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold drop-shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 px-4 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e4b94f1a-1738-4307-8356-aab0db62dbd2/generated_images/stunning-close-up-photograph-of-diverse--242ddd09-20251120131033.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/98 via-white/95 to-white/98 dark:from-gray-950/98 dark:via-gray-950/95 dark:to-gray-950/98 z-[1]" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-800 px-4 py-2 text-sm font-bold shadow-xl">
              <Heart className="h-4 w-4 mr-2 inline" />
              Our Mission
            </Badge>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">Building a Sustainable Future</h3>
          </div>
          <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-2 border-gray-200/80 dark:border-gray-700/80 shadow-3xl rounded-3xl overflow-hidden">
            <CardContent className="pt-8 pb-8 px-6 sm:px-10">
              <p className="text-base sm:text-lg mb-6 leading-relaxed font-medium">
                CleanUp Connect bridges the gap between citizens and municipalities to create cleaner, more sustainable cities. 
                We believe that every citizen has the power to make a difference, and every municipality deserves efficient tools 
                to manage waste effectively.
              </p>
              <p className="text-base sm:text-lg mb-6 leading-relaxed font-medium">
                Our AI-powered platform automatically classifies waste types and severity levels, helping municipalities prioritize 
                and respond faster. By gamifying civic engagement, we encourage continuous participation and build stronger communities.
              </p>
              <p className="text-base sm:text-lg leading-relaxed font-medium">
                Together, we're not just reporting waste—we're building a culture of sustainability, accountability, and community action. 
                <span className="text-green-600 dark:text-green-400 font-bold"> Join us in making your city cleaner, one report at a time.</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 z-0" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)"
        }} />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10 text-white">
          <Badge className="mb-6 bg-white/20 backdrop-blur-xl text-white border-2 border-white/40 px-5 py-2 text-sm font-bold shadow-2xl">
            <Sparkles className="h-4 w-4 mr-2 inline" />
            Join the Movement
          </Badge>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-xl">Ready to Make a Difference?</h3>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 opacity-95 leading-relaxed font-semibold drop-shadow-lg">
            Join thousands of citizens and municipalities working together for cleaner cities
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => setAuthOpen(true)} 
            className="text-base sm:text-lg px-10 sm:px-14 py-6 sm:py-8 bg-white text-green-700 hover:bg-gray-100 shadow-3xl hover:scale-110 transition-all duration-300 font-black rounded-2xl"
          >
            <Camera className="h-5 w-5 mr-2" />
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t-2 bg-gradient-to-b from-white to-green-50/50 dark:from-gray-950 dark:to-green-950/20">
        <div className="container mx-auto max-w-7xl text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 shadow-xl shadow-green-500/30">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              CleanUp Connect
            </span>
          </div>
          <p className="text-sm sm:text-base mb-3 font-semibold">
            Building sustainable communities through civic engagement and technology
          </p>
          <p className="text-xs sm:text-sm font-medium">© 2024 CleanUp Connect. All rights reserved.</p>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}