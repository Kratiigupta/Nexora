"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
import { connectionService, ConnectionStatusResponse } from "@/lib/services/connection.service";
import { chatService } from "@/lib/services/chat.service";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SkillChip } from "@/components/profile/SkillChip";
import { PortfolioCard, buildPortfolioLinks } from "@/components/profile/PortfolioCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import type { PublicProfile } from "@/types/user";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  Code2,
  Lightbulb,
  Link2,
  UserPlus,
  MessageSquare,
  ArrowLeftRight,
  Loader2,
  Check,
  UserMinus,
} from "lucide-react";
import { CreateSkillExchangeDialog } from "@/components/skill-exchange/CreateSkillExchangeDialog";

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
  const [requestMentor, setRequestMentor] = useState<string | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusResponse["status"]>("none");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

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

        // Also fetch connection status if not my own profile
        if (myProfile && myProfile.username !== username) {
          const connData = await connectionService.getConnectionStatus(data.id);
          setConnectionStatus(connData.status);
        }
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
  }, [username, myProfile]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const handleConnect = async () => {
    if (!profile) return;
    setIsConnecting(true);
    try {
      if (connectionStatus === "pending_received") {
        await connectionService.updateConnectionStatus(profile.id, "accepted");
        setConnectionStatus("connected");
        toast.success("Connection accepted");
      } else {
        await connectionService.sendConnectionRequest(profile.id);
        setConnectionStatus("pending_sent");
        toast.success("Connection request sent");
      }
    } catch {
      toast.error("Failed to update connection");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!profile) return;
    setIsConnecting(true);
    try {
      await connectionService.removeConnection(profile.id);
      setConnectionStatus("none");
      toast.success(connectionStatus === "connected" ? "Disconnected" : "Request cancelled");
    } catch {
      toast.error("Failed to remove connection");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (!profile) return;
    setIsMessaging(true);
    try {
      const conversation = await chatService.createConversation({
        type: "direct",
        participantId: profile.id,
      });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch {
      toast.error("Failed to open conversation");
      setIsMessaging(false);
    }
  };

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
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0" onClick={() => setRequestMentor(profile.username)}>
              <ArrowLeftRight className="h-4 w-4" />
              Request Mentorship
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleMessage}
              disabled={isMessaging}
            >
              {isMessaging ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              Message
            </Button>
            {connectionStatus === "connected" ? (
              <Button size="sm" variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={handleDisconnect} disabled={isConnecting}>
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                Disconnect
              </Button>
            ) : connectionStatus === "pending_sent" ? (
              <Button size="sm" variant="secondary" className="gap-2" onClick={handleDisconnect} disabled={isConnecting}>
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Request Sent
              </Button>
            ) : (
              <Button size="sm" className="gap-2" onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {connectionStatus === "pending_received" ? "Accept Request" : "Connect"}
              </Button>
            )}
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

      <CreateSkillExchangeDialog
        open={!!requestMentor}
        onOpenChange={(open) => !open && setRequestMentor(null)}
        mentorUsername={requestMentor}
        onSuccess={() => router.push("/skill-exchange")}
      />
    </div>
  );
}
