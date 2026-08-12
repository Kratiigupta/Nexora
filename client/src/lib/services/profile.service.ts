import api from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Profile, PublicProfile } from "@/types/user";
import type { DashboardData } from "@/types/dashboard";

/**
 * Profile & Dashboard API service.
 * Handles all profile CRUD and dashboard data fetching.
 *
 * NOTE: Avatar and resume uploads go directly to Supabase Storage (client-side),
 * then the resulting URL is sent to the backend via POST /profile/avatar or /profile/resume.
 * This reuses the same Supabase Storage upload pattern from authService.uploadAvatar().
 */
export const profileService = {
  /**
   * GET /api/v1/profile — Fetch authenticated user's profile.
   */
  async getMyProfile(): Promise<Profile> {
    const response = await api.get("/profile");
    return response.data.data;
  },

  /**
   * PUT /api/v1/profile — Update authenticated user's profile.
   */
  async updateProfile(data: Omit<Partial<Profile>, "skills"> & {
    skills?: { skillId: string; proficiency: string }[];
    interests?: string[];
    availabilityStatus?: string;
  }): Promise<Profile> {
    const response = await api.put("/profile", data);
    return response.data.data;
  },

  /**
   * GET /api/v1/profile/:username — Fetch public profile.
   */
  async getPublicProfile(username: string): Promise<PublicProfile> {
    const response = await api.get(`/profile/${username}`);
    return response.data.data;
  },

  /**
   * Upload avatar to Supabase Storage, then update backend.
   * Validates MIME type, extension, and file size (max 5 MB).
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("Avatar image must not exceed 5 MB in size.");
    }

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP images are permitted.");
    }

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
    const publicUrl = data.publicUrl;

    // Update backend with new URL
    await api.post("/profile/avatar", { fileUrl: publicUrl });

    return publicUrl;
  },

  /**
   * Upload resume PDF to Supabase Storage, then update backend.
   * Validates MIME type and file size (max 10 MB).
   */
  async uploadResume(userId: string, file: File): Promise<string> {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("Resume must not exceed 10 MB in size.");
    }

    if (file.type !== "application/pdf") {
      throw new Error("Invalid file type. Only PDF files are permitted.");
    }

    const supabase = createClient();
    const filePath = `resumes/${userId}/resume.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    // Update backend with new URL
    await api.post("/profile/resume", { fileUrl: publicUrl });

    return publicUrl;
  },

  /**
   * GET /api/v1/dashboard — Fetch dashboard data.
   */
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get("/dashboard");
    return response.data.data;
  },
};
