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

const getClientTimezone = (): string => {
  if (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {}
  }
  return "UTC";
};

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

    // 2. Create profile in PostgreSQL via backend (with 5s timeout to prevent UI hang on cold starts)
    try {
      const registerPromise = api.post("/auth/register", {
        supabaseId: authData.user.id,
        email: data.email,
        fullName: data.fullName,
        department: data.department,
        year: data.year,
        college: data.college || undefined,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile registration timed out")), 5000)
      );
      await Promise.race([registerPromise, timeoutPromise]);
    } catch (profileError: unknown) {
      // Profile creation failure is non-fatal — getMe will auto-create it
      console.warn("Profile pre-creation timed out or failed, will auto-create on login:", profileError);
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
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await api.get("/auth/me", {
          params: { timezone: getClientTimezone() },
        });
        return response.data.data;
      } catch (error: unknown) {
        const isLastAttempt = attempt === maxRetries - 1;
        const isRetryable =
          error instanceof Error &&
          (("code" in error &&
            ((error as { code: string }).code === "ECONNABORTED" ||
              (error as { code: string }).code === "ERR_NETWORK")) ||
            error.message?.includes("timeout") ||
            error.message?.includes("Network Error"));

        if (isLastAttempt || !isRetryable) {
          throw error;
        }
        // Exponential backoff: 2s, 4s
        const delay = Math.pow(2, attempt + 1) * 1000;
        console.warn(`fetchProfile attempt ${attempt + 1} failed (timeout/network), retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    // TypeScript: unreachable, but satisfies the compiler
    throw new Error("fetchProfile failed after retries");
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

    const uploadPromise = supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error("Avatar upload timed out")), 10000)
    );

    const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

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

  /**
   * Change password for the currently authenticated user.
   * Uses Supabase client-side updateUser (same pattern as resetPassword).
   */
  async changePassword(newPassword: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  /**
   * Delete the current user's account.
   * Calls the backend which handles Prisma data cleanup + Supabase Auth deletion.
   */
  async deleteAccount(): Promise<void> {
    await api.delete("/auth/me");
  },
};
