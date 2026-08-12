"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/services/auth.service";

/**
 * AuthProvider — syncs Supabase auth state with the Zustand store.
 * Fetches the user's Nexora profile (auto-creates if missing) with deduplication.
 * Handles PASSWORD_RECOVERY events for password reset flow.
 * Redirects to onboarding if profile is incomplete on first login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setProfile, setProfileLoading, clearAuth, needsOnboarding } =
    useAuthStore();

  // Ref to track component mount state and prevent state updates after unmount (memory leaks)
  const isMountedRef = useRef(true);
  // Ref to track the last fetched user ID to prevent duplicate simultaneous API calls to /auth/me
  const lastFetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    const supabase = createClient();

    const fetchUserProfile = async (userId: string, force = false) => {
      // Deduplicate simultaneous API calls (e.g., initial getSession + immediate onAuthStateChange)
      if (!force && lastFetchedUserIdRef.current === userId) {
        return;
      }
      lastFetchedUserIdRef.current = userId;

      try {
        const profile = await authService.fetchProfile();
        if (isMountedRef.current) {
          setProfile(profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (isMountedRef.current) {
          setProfile(null);
          // Allow re-fetching on subsequent attempts if network temporarily failed
          lastFetchedUserIdRef.current = null;
        }
      }
    };

    // Get initial session
    const initializeAuth = async () => {
      try {
        setProfileLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          clearAuth();
          lastFetchedUserIdRef.current = null;
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (isMountedRef.current) {
          clearAuth();
          lastFetchedUserIdRef.current = null;
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMountedRef.current) return;

      if (event === "PASSWORD_RECOVERY") {
        // User clicked a password reset link — redirect to reset page
        router.push("/reset-password");
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }

      if (event === "SIGNED_OUT") {
        clearAuth();
        lastFetchedUserIdRef.current = null;
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setProfileLoading, clearAuth, router]);

  // Redirect to onboarding if needed (only on protected pages, not during auth flows)
  useEffect(() => {
    const authPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/onboarding",
    ];
    const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

    if (needsOnboarding && !isAuthPage && pathname !== "/") {
      router.push("/onboarding");
    }
  }, [needsOnboarding, pathname, router]);

  return <>{children}</>;
}
