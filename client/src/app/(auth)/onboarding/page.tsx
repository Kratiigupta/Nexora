"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Globe, User, Sparkles } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/BrandIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/services/auth.service";
import { getInitials } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, setNeedsOnboarding } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatarUrl || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs to prevent memory leaks when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Form state
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type strictly (allow only jpg, jpeg, png, webp)
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!file.type || !allowedMimeTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file type", { description: "Please select a JPG, JPEG, PNG, or WEBP image." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Please select an image under 5MB." });
      return;
    }

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setIsSubmitting(true);

      let avatarUrl = profile.avatarUrl;

      // Upload avatar if user selected one
      if (avatarFile) {
        try {
          avatarUrl = await authService.uploadAvatar(profile.id, avatarFile);
        } catch (err) {
          console.warn("Avatar upload failed:", err);
          toast.error("Avatar upload failed", {
            description: "Your profile will be saved without the avatar.",
          });
        }
      }

      // Complete onboarding
      const updatedProfile = await authService.completeOnboarding({
        bio: bio || null,
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null,
        linkedinUrl: linkedinUrl || null,
        avatarUrl,
        isAvailable,
      });

      setProfile(updatedProfile);
      setNeedsOnboarding(false);

      toast.success("Profile complete! 🎉", {
        description: "Welcome to Nexora! Let's get started.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast.error("Failed to save profile", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setNeedsOnboarding(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      {/* Background (same as auth layout) */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--primary)_0%,transparent_50%)] opacity-[0.08]" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-[120px] animate-float-delayed" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            One more step
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Complete your profile
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Add a photo and tell others about yourself
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 opacity-75 blur-lg" />

          <div className="relative overflow-hidden border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative space-y-6">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Upload profile picture"
                >
                  <Avatar className="h-24 w-24 border-2 border-border/50 transition-all group-hover:border-primary/50">
                    <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {profile ? getInitials(profile.fullName) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Click to upload a profile picture
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="onboarding-bio" className="text-sm font-medium">
                  Bio
                </Label>
                <textarea
                  id="onboarding-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself, your interests, and what you're working on..."
                  maxLength={500}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/500
                </p>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Links</Label>

                <div className="relative">
                  <GitHubIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="pl-10 h-11 bg-background/50 border-border/60"
                  />
                </div>

                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="pl-10 h-11 bg-background/50 border-border/60"
                  />
                </div>

                <div className="relative">
                  <LinkedInIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10 h-11 bg-background/50 border-border/60"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                <Checkbox
                  id="onboarding-available"
                  checked={isAvailable}
                  onCheckedChange={(checked) => setIsAvailable(!!checked)}
                />
                <div>
                  <Label htmlFor="onboarding-available" className="text-sm font-medium cursor-pointer">
                    Available for collaboration
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Let others know you&apos;re open to joining teams and projects
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <SubmitButton
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for now
                </SubmitButton>
                <SubmitButton
                  isLoading={isSubmitting}
                  loadingText="Saving..."
                  className="flex-1"
                >
                  Complete profile
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
