"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  Building2,
  GraduationCap,
  School,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/BrandIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/services/auth.service";
import { getInitials } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isProfileLoading, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      clearAuth();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to sign out", {
        description: err?.message || "Please try again.",
      });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
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

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-purple-500/5 p-8">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-[60px]" />
        <div className="relative flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-xl">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {profile.fullName.split(" ")[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              @{profile.username} · {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </p>
            {profile.isAvailable && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Available for collaboration
              </span>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Profile details card */}
      <Card className="border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">Your Profile</h2>
          <p className="text-sm text-muted-foreground">
            Your account details and information
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={Building2}
              label="Department"
              value={profile.department}
            />
            <InfoItem
              icon={GraduationCap}
              label="Year"
              value={`Year ${profile.year}`}
            />
            {profile.college && (
              <InfoItem
                icon={School}
                label="College"
                value={profile.college}
              />
            )}
          </div>

          {profile.bio && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                <p className="text-sm">{profile.bio}</p>
              </div>
            </>
          )}

          {(profile.githubUrl || profile.portfolioUrl || profile.linkedinUrl) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-3">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <GitHubIcon className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Portfolio
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LinkedInIcon className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((us) => (
                    <span
                      key={us.skillId}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {us.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Auth verification badge */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          ✅ Authentication verified · Profile loaded from PostgreSQL · Session active
        </p>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
