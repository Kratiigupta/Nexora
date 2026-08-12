"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useProfileEditStore } from "@/stores/profileStore";
import { profileService } from "@/lib/services/profile.service";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { SkillsEditor } from "@/components/profile/SkillsEditor";
import { InterestsEditor } from "@/components/profile/InterestsEditor";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { AvailabilityBadge } from "@/components/profile/AvailabilityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { getInitials } from "@/lib/utils";
import type { Profile, AvailabilityStatus } from "@/types/user";
import {
  Camera,
  Upload,
  Save,
  X,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Link2,
  Code2,
  Lightbulb,
  Shield,
} from "lucide-react";

const availabilityOptions: { value: AvailabilityStatus; label: string }[] = [
  { value: "available_for_team", label: "Available for Team" },
  { value: "looking_for_project", label: "Looking for Project" },
  { value: "hiring", label: "Hiring" },
  { value: "not_available", label: "Not Available" },
];

/**
 * Edit Profile page — form with all profile fields.
 */
export default function EditProfilePage() {
  const router = useRouter();
  const { profile: authProfile, isProfileLoading, setProfile: setAuthProfile } =
    useAuthStore();
  const { draft, isDirty, isSaving, initDraft, updateField, setSaving } =
    useProfileEditStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await profileService.getMyProfile();
        setProfile(profileData);
        initDraft(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (authProfile) {
          setProfile(authProfile);
          initDraft(authProfile);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (authProfile) {
      fetchData();
    }
  }, [authProfile, initDraft]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const avatarUrl = await profileService.uploadAvatar(profile.id, file);
      updateField("avatarUrl", avatarUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to upload avatar", {
        description: err?.message || "Please try again.",
      });
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const resumeUrl = await profileService.uploadResume(profile.id, file);
      updateField("resumeUrl", resumeUrl);
      toast.success("Resume uploaded successfully");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to upload resume", {
        description: err?.message || "Please try again.",
      });
    }
  };

  const handleSave = async () => {
    if (!profile || isSaving) return;

    setSaving(true);
    try {
      const updatedProfile = await profileService.updateProfile({
        ...draft,
      });
      setProfile(updatedProfile);
      setAuthProfile(updatedProfile);
      initDraft(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error("Failed to update profile", {
        description: err?.response?.data?.error?.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      initDraft(profile);
    }
    router.push("/profile");
  };

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

  const usernameAlreadyChanged = !!profile.usernameChangedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your profile information and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar & Basic Info */}
          <DashboardCard
            title="Basic Information"
            icon={<User className="h-4 w-4" />}
            delay={0.1}
          >
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage
                      src={draft.avatarUrl || profile.avatarUrl || undefined}
                      alt={draft.fullName || profile.fullName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {getInitials(draft.fullName || profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    type="button"
                    aria-label="Upload avatar"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, or WEBP. Max 5 MB.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs gap-1.5"
                    onClick={() => avatarInputRef.current?.click()}
                    type="button"
                  >
                    <Upload className="h-3 w-3" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={draft.fullName || ""}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username
                    {usernameAlreadyChanged && (
                      <span className="ml-2 text-xs text-amber-500 inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Already changed
                      </span>
                    )}
                  </Label>
                  <Input
                    id="username"
                    value={draft.username || ""}
                    onChange={(e) => updateField("username", e.target.value)}
                    placeholder="johndoe"
                    disabled={usernameAlreadyChanged}
                  />
                  {!usernameAlreadyChanged && (
                    <p className="text-xs text-muted-foreground">
                      Username can only be changed once.
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={draft.bio || ""}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {(draft.bio || "").length}/500
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* Academic Info */}
          <DashboardCard
            title="Academic Information"
            icon={<Building2 className="h-4 w-4" />}
            delay={0.15}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={draft.college || ""}
                  onChange={(e) => updateField("college", e.target.value)}
                  placeholder="Your college name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={draft.department || ""}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select
                  value={String(draft.year || "")}
                  onValueChange={(val) => updateField("year", Number(val))}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DashboardCard>

          {/* Skills */}
          <DashboardCard
            title="Skills"
            icon={<Code2 className="h-4 w-4" />}
            delay={0.2}
          >
            <SkillsEditor
              skills={
                (draft.skills || []).map((s) => ({
                  ...s,
                  skill: profile.skills?.find((ps) => ps.skillId === s.skillId)?.skill,
                }))
              }
              availableSkills={
                // Use skills from the profile as available catalog
                profile.skills?.map((s) => s.skill) || []
              }
              onChange={(skills) =>
                updateField(
                  "skills",
                  skills.map((s) => ({
                    skillId: s.skillId,
                    proficiency: s.proficiency,
                  }))
                )
              }
            />
          </DashboardCard>

          {/* Interests */}
          <DashboardCard
            title="Interests"
            icon={<Lightbulb className="h-4 w-4" />}
            delay={0.25}
          >
            <InterestsEditor
              interests={draft.interests || []}
              onChange={(interests) => updateField("interests", interests)}
            />
          </DashboardCard>

          {/* Portfolio Links */}
          <DashboardCard
            title="Portfolio Links"
            icon={<Link2 className="h-4 w-4" />}
            delay={0.3}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <Input
                  id="githubUrl"
                  value={draft.githubUrl || ""}
                  onChange={(e) => updateField("githubUrl", e.target.value)}
                  placeholder="https://github.com/username"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  value={draft.linkedinUrl || ""}
                  onChange={(e) => updateField("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio Website</Label>
                <Input
                  id="portfolioUrl"
                  value={draft.portfolioUrl || ""}
                  onChange={(e) => updateField("portfolioUrl", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  type="url"
                />
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Column — Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <DashboardCard title="Completion" delay={0.1}>
            <div className="flex flex-col items-center gap-3">
              <ProfileCompletion
                percentage={profile.profileCompletion || 0}
                size={90}
              />
            </div>
          </DashboardCard>

          {/* Availability Status */}
          <DashboardCard
            title="Availability"
            icon={<Shield className="h-4 w-4" />}
            delay={0.15}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <AvailabilityBadge
                  status={draft.availabilityStatus || profile.availabilityStatus}
                  size="md"
                />
              </div>
              <Select
                value={draft.availabilityStatus || profile.availabilityStatus}
                onValueChange={(val) =>
                  updateField("availabilityStatus", val as AvailabilityStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DashboardCard>

          {/* Resume Upload */}
          <DashboardCard
            title="Resume"
            icon={<FileText className="h-4 w-4" />}
            delay={0.2}
          >
            <div className="space-y-4">
              {(draft.resumeUrl || profile.resumeUrl) ? (
                <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Resume.pdf</p>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                  </div>
                  <a
                    href={draft.resumeUrl || profile.resumeUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No resume uploaded</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => resumeInputRef.current?.click()}
                type="button"
              >
                <Upload className="h-3 w-3" />
                {(draft.resumeUrl || profile.resumeUrl) ? "Replace Resume" : "Upload Resume"}
              </Button>
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleResumeUpload}
              />
              <p className="text-xs text-muted-foreground text-center">
                PDF only. Max 10 MB.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
