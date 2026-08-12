"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/lib/services/profile.service";
import { DashboardSkeleton } from "@/components/profile/ProfileSkeleton";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { RecommendedTeammates } from "@/components/dashboard/RecommendedTeammates";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { NotificationsPreview } from "@/components/dashboard/NotificationsPreview";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import type { DashboardData } from "@/types/dashboard";
import {
  Users,
  FolderKanban,
  Zap,
  Handshake,
  Search,
  Plus,
  UserPen,
  Activity,
  Sparkles,
  Bell,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isProfileLoading } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await profileService.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (profile) {
      fetchDashboard();
    }
  }, [profile]);

  if (isProfileLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Could not load your profile.</p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    teams: 0,
    projects: 0,
    skills: profile.skills?.length || 0,
    connections: 0,
  };
  const completion = dashboardData?.profileCompletion ?? profile.profileCompletion ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner profile={profile} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Teams"
          value={stats.teams}
          icon={<Users className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard
          label="Projects"
          value={stats.projects}
          icon={<FolderKanban className="h-5 w-5" />}
          delay={0.15}
        />
        <StatsCard
          label="Skills"
          value={stats.skills}
          icon={<Zap className="h-5 w-5" />}
          delay={0.2}
        />
        <StatsCard
          label="Connections"
          value={stats.connections}
          icon={<Handshake className="h-5 w-5" />}
          delay={0.25}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickActionCard
          label="Find Team"
          description="Browse and join teams"
          icon={<Search className="h-5 w-5" />}
          href="/teams"
          gradient="from-violet-500/10 to-indigo-500/10"
          delay={0.3}
        />
        <QuickActionCard
          label="Create Project"
          description="Start a new project"
          icon={<Plus className="h-5 w-5" />}
          href="/projects"
          gradient="from-blue-500/10 to-cyan-500/10"
          delay={0.35}
        />
        <QuickActionCard
          label="Update Profile"
          description="Complete your profile"
          icon={<UserPen className="h-5 w-5" />}
          href="/profile/edit"
          gradient="from-amber-500/10 to-orange-500/10"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Heatmap */}
          <DashboardCard
            title="Activity"
            icon={<BarChart3 className="h-4 w-4" />}
            delay={0.45}
          >
            <Heatmap data={dashboardData?.activityHeatmap || {}} />
          </DashboardCard>

          {/* Recent Projects */}
          <DashboardCard
            title="Recent Projects"
            icon={<FolderKanban className="h-4 w-4" />}
            action={
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  View all
                </Button>
              </Link>
            }
            delay={0.5}
          >
            <RecentProjects projects={dashboardData?.recentProjects || []} />
          </DashboardCard>

          {/* Activity Timeline */}
          <DashboardCard
            title="Recent Activity"
            icon={<Activity className="h-4 w-4" />}
            delay={0.55}
          >
            <ActivityTimeline
              activities={dashboardData?.recentActivity || []}
            />
          </DashboardCard>
        </div>

        {/* Right Column — 1/3 */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <DashboardCard title="Profile" delay={0.45}>
            <div className="flex flex-col items-center gap-4">
              <ProfileCompletion percentage={completion} size={90} />
              {completion < 100 && (
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="text-xs">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          </DashboardCard>

          {/* Recommended Teammates */}
          <DashboardCard
            title="Recommended"
            description="People you might work with"
            icon={<Sparkles className="h-4 w-4" />}
            delay={0.5}
          >
            <RecommendedTeammates />
          </DashboardCard>

          {/* Notifications */}
          <DashboardCard
            title="Notifications"
            icon={<Bell className="h-4 w-4" />}
            action={
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  View all
                </Button>
              </Link>
            }
            delay={0.55}
          >
            <NotificationsPreview
              notifications={dashboardData?.notifications || []}
            />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
