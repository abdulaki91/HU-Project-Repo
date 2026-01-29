import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Badge } from "../components/Badge";
import { Outlet } from "react-router-dom";
import { Avatar, AvatarFallback } from "../components/Avatar";
import { Mail, Calendar, Award, Download, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import useEditResource from "../hooks/useEditResource";
import useFetchResource from "../hooks/useFetchResource";
import api from "../api/api";
import { useQueryClient } from "@tanstack/react-query";
import EditProjectModal from "../components/EditProjectModal";
const achievements = [
  {
    title: "Top Contributor",
    description: "Uploaded 5+ projects",
    icon: Award,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Popular Project",
    description: "200+ downloads on a project",
    icon: Download,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Early Adopter",
    description: "Member since 2023",
    icon: Calendar,
    color: "bg-green-50 text-green-600",
  },
];

export function Profile() {
  const { data: userData, isLoading: userLoading } = useFetchResource(
    "user/me",
    "user-me",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account information and view your contributions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-2xl">
                  {userData && userData.firstName && userData.lastName
                    ? `${userData.firstName[0] || ""}${
                        userData.lastName[0] || ""
                      }`.toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-slate-900 dark:text-white mb-1">
                {userData
                  ? `${userData.firstName || ""} ${userData.lastName || ""}`
                  : ""}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {userData?.department || "Student"}
              </p>
              <Badge
                variant="secondary"
                className="dark:bg-slate-700 dark:text-slate-300"
              >
                {userData?.batch || "Batch TBD"}
              </Badge>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4" />{" "}
                <span>{userData?.email || "-"}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {userData?.created_at
                    ? new Date(userData.created_at).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>

            <Button
              className="w-full mt-6 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              variant="outline"
              as="a"
              href="/profile/settings"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Card>

          {/* Achievements */}
          <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-slate-900 dark:text-white mb-4">
              Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${achievement.color} dark:bg-opacity-20`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Outlet context={{ userData }} />
        </div>
      </div>
    </div>
  );
}
