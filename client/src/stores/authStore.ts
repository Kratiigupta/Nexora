import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/user";

/**
 * Auth store — holds both Supabase user and Nexora profile state.
 * Supabase auth events are synced via AuthProvider.
 */
interface AuthState {
  // Supabase user
  user: User | null;
  isAuthenticated: boolean;

  // Nexora profile from PostgreSQL
  profile: Profile | null;
  isProfileLoading: boolean;

  // Whether this is the user's first login (no bio/skills yet → needs onboarding)
  needsOnboarding: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setProfileLoading: (loading: boolean) => void;
  setNeedsOnboarding: (needs: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  profile: null,
  isProfileLoading: true,
  needsOnboarding: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setProfile: (profile) =>
    set({
      profile,
      isProfileLoading: false,
      // User needs onboarding if they have no bio and no skills
      needsOnboarding: profile
        ? !profile.bio && (!profile.skills || profile.skills.length === 0)
        : false,
    }),

  setProfileLoading: (isProfileLoading) => set({ isProfileLoading }),

  setNeedsOnboarding: (needsOnboarding) => set({ needsOnboarding }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      profile: null,
      isProfileLoading: false,
      needsOnboarding: false,
    }),
}));
