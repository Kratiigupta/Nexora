"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/lib/services/profile.service";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { SkillChip } from "@/components/profile/SkillChip";
import { PortfolioCard, buildPortfolioLinks } from "@/components/profile/PortfolioCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/user";
import {
  Edit,
  Lightbulb,
  Code2,
  Link2,
} from "lucide-react";
import Link from "next/link";

/**
 * Own profile page — shows full profile with edit button.
 * Fetches fresh data from the profile API.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { profile: authProfile, isProfileLoading } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getMyProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fallback to auth store profile
        if (authProfile) setProfile(authProfile);
      } finally {
        setIsLoading(false);
      }
    };

    if (authProfile) {
      fetchProfile();
    }
  }, [authProfile]);

  if (isProfileLoading || isLoading) {
    return <ProfileSkeleton />;
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

  const portfolioLinks = buildPortfolioLinks(profile);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        stats={{
          projects: profile.stats?.projects || 0,
          teams: profile.stats?.teams || 0,
          connections: profile.stats?.connections || 0,
        }}
        actions={
          <Link href="/profile/edit">
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
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
                <p className="text-sm text-muted-foreground">No skills added yet</p>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    Add Skills
                  </Button>
                </Link>
              </div>
            )}
          </DashboardCard>

          {/* Interests */}
          <DashboardCard
            title="Interests"
            icon={<Lightbulb className="h-4 w-4" />}
            delay={0.15}
          >
            {profile.interests && profile.interests.length > 0 ? (
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
            ) : (
              <div className="text-center py-6">
                <Lightbulb className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No interests added yet</p>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    Add Interests
                  </Button>
                </Link>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <DashboardCard title="Completion" delay={0.1}>
            <div className="flex flex-col items-center gap-3">
              <ProfileCompletion percentage={profile.profileCompletion || 0} size={90} />
              {(profile.profileCompletion || 0) < 100 && (
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="text-xs">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          </DashboardCard>

          {/* Portfolio Links */}
          <DashboardCard
            title="Portfolio"
            icon={<Link2 className="h-4 w-4" />}
            delay={0.15}
          >
            {portfolioLinks.length > 0 ? (
              <PortfolioCard links={portfolioLinks} className="flex-col" />
            ) : (
              <div className="text-center py-6">
                <Link2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No links added</p>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    Add Links
                  </Button>
                </Link>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
