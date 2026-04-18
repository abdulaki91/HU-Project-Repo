import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Outlet, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../components/Avatar";
import {
  Mail,
  Calendar,
  Download,
  Settings,
  User,
  Star,
  Sparkles,
  MapPin,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import useFetchResource from "../hooks/useFetchResource";

export function Profile() {
  const { data: userData, isLoading: userLoading } = useFetchResource(
    "user/me",
    "user-me",
  );
  const { data: userStats, isLoading: statsLoading } = useFetchResource(
    "project/user/stats",
    "user-stats",
  );
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleEditProfile = () => {
    navigate("/profile/settings");
  };

  // Use real data from API or fallback to defaults
  const stats = [
    {
      label: "Projects",
      value: userStats?.projectsFormatted || "0",
      icon: BookOpen,
    },
    {
      label: "Downloads",
      value: userStats?.downloadsFormatted || "0",
      icon: Download,
    },
    {
      label: "Rating",
      value: userStats?.rating || "0.0",
      icon: Star,
    },
  ];

  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div
        className={`relative z-10 space-y-8 p-6 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Header Section */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full border border-purple-200/50 dark:border-purple-800/50 mb-4">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Your Profile Dashboard
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent mb-4">
            Profile
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Manage your account information and view your contributions to the
            community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-8 glass-morphism border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <Avatar className="w-32 h-32 ring-4 ring-white/20 shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                      {userData && userData.firstName && userData.lastName
                        ? `${userData.firstName[0] || ""}${
                            userData.lastName[0] || ""
                          }`.toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {userData
                    ? `${userData.firstName || ""} ${userData.lastName || ""}`
                    : "Loading..."}
                </h2>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">
                    {userData?.department || "Student"}
                  </span>
                </div>

                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 px-4 py-1 text-sm font-medium">
                  Batch {userData?.batch || "TBD"}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Contact Info */}
              <div className="mt-8 space-y-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {userData?.email || "Loading..."}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Joined{" "}
                    {userData?.created_at
                      ? new Date(userData.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "Recently"}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleEditProfile}
                className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border-0 backdrop-blur-xl shadow-xl min-h-[600px]">
              <Outlet context={{ userData }} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
