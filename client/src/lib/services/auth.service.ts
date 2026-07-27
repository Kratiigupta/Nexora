import { createClient } from "@/lib/supabase/client";
import api from "@/lib/api";
import type { Profile } from "@/types/user";

/**
 * Centralized authentication service.
 * Encapsulates all Supabase auth + backend API calls.
 */

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  department: string;
  year: number;
  college?: string;
}

interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Sign up with email/password → create Supabase user → create backend profile.
   */
  async signUp(data: SignUpData) {
    const supabase = createClient();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          department: data.department,
          year: data.year,
          college: data.college || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error("Failed to create user account");
    }

    // 2. Create profile in PostgreSQL via backend
    try {
      await api.post("/auth/register", {
        supabaseId: authData.user.id,
        email: data.email,
        fullName: data.fullName,
        department: data.department,
        year: data.year,
        college: data.college || undefined,
      });
    } catch (profileError: unknown) {
      // Profile creation failure is non-fatal — getMe will auto-create it
      console.warn("Profile pre-creation failed, will auto-create on login:", profileError);
    }

    return authData;
  },

  /**
   * Sign in with email/password.
   */
  async signIn(data: SignInData) {
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return authData;
  },

  /**
   * Sign in with Google OAuth.
   */
  async signInWithGoogle() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out — Supabase handles session termination.
   */
  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send password reset email.
   */
  async forgotPassword(email: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) throw error;
  },

  /**
   * Reset password (user must have a valid session from reset email link).
   */
  async resetPassword(newPassword: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  /**
   * Resend email verification.
   */
  async resendVerificationEmail(email: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  },

  /**
   * Fetch the authenticated user's profile from the backend.
   * Auto-creates a profile if one doesn't exist.
   */
  async fetchProfile(): Promise<Profile> {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  /**
   * Complete onboarding — add bio, skills, links.
   */
  async completeOnboarding(data: {
    bio?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
    linkedinUrl?: string | null;
    avatarUrl?: string | null;
    isAvailable?: boolean;
    skills?: { skillId: string; proficiency: string }[];
  }): Promise<Profile> {
    const response = await api.post("/auth/onboarding", data);
    return response.data.data;
  },

  /**
   * Upload avatar to Supabase Storage with strict MIME, extension & size validation (max 5MB).
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    // 1. Validate file size (Maximum 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("Avatar image must not exceed 5 MB in size.");
    }

    // 2. Validate MIME type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP images are permitted.");
    }

    // 3. Validate File Extension
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    if (!allowedExtensions.includes(fileExt)) {
      throw new Error("Invalid file extension. Only jpg, jpeg, png, and webp are allowed.");
    }

    const supabase = createClient();
    const filePath = `avatars/${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Update profile on the backend.
   */
  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = await api.put("/auth/me", data);
    return response.data.data;
  },
};
