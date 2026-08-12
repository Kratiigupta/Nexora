"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SkillChip } from "@/components/profile/SkillChip";
import { PortfolioCard, buildPortfolioLinks } from "@/components/profile/PortfolioCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import type { PublicProfile } from "@/types/user";
import { useAuthStore } from "@/stores/authStore";
import {
  Code2,
  Lightbulb,
  Link2,
  UserPlus,
  MessageSquare,
} from "lucide-react";

/**
 * Public profile page — view another user's profile by username.
 * Route: /profile/:username
 */
export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { profile: myProfile } = useAuthStore();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If viewing own profile, redirect to /profile
  useEffect(() => {
    if (myProfile && myProfile.username === username) {
      router.replace("/profile");
    }
  }, [myProfile, username, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getPublicProfile(username);
        setProfile(data);
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">
            {error || "User not found"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            The user you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const portfolioLinks = buildPortfolioLinks(profile);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Connect
            </Button>
          </div>
        }
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <DashboardCard
            title="Skills"
            icon={<Code2 className="h-4 w-4" />}
            delay={0.1}
          >
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((us) => (
                  <SkillChip
                    key={us.skillId}
                    name={us.skill.name}
                    proficiency={us.proficiency}
                    size="md"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Code2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No skills listed</p>
              </div>
            )}
          </DashboardCard>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <DashboardCard
              title="Interests"
              icon={<Lightbulb className="h-4 w-4" />}
              delay={0.15}
            >
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </DashboardCard>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Portfolio Links */}
          {portfolioLinks.length > 0 && (
            <DashboardCard
              title="Portfolio"
              icon={<Link2 className="h-4 w-4" />}
              delay={0.1}
            >
              <PortfolioCard links={portfolioLinks} className="flex-col" />
            </DashboardCard>
          )}
        </div>
      </div>
    </div>
  );
}
