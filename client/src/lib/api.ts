import axios from "axios";
import { createClient } from "@/lib/supabase/client";

/**
 * Pre-configured Axios instance for the Nexora API.
 * Automatically attaches the Supabase JWT to every request.
 *
 * Performance: Caches the session token to avoid calling getSession()
 * on every request (which was adding ~500ms per API call).
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

// ── Token caching ────────────────────────────────────
// Avoids calling supabase.auth.getSession() on every single API request.
// The token is cached for 4 minutes; Supabase JWTs last ~60 minutes.
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const TOKEN_CACHE_MS = 4 * 60 * 1000; // 4 minutes

const getToken = async (): Promise<string | null> => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    cachedToken = session.access_token;
    tokenExpiresAt = now + TOKEN_CACHE_MS;
    return cachedToken;
  }

  cachedToken = null;
  tokenExpiresAt = 0;
  return null;
};

/**
 * Clear the cached token (call on logout or 401).
 */
export const clearApiTokenCache = () => {
  cachedToken = null;
  tokenExpiresAt = 0;
};

// Request interceptor — attach cached auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 — session expired
    if (error.response?.status === 401) {
      // Clear cached token so the next request fetches a fresh one
      clearApiTokenCache();

      const supabase = createClient();
      const { error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        // Session truly expired — redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } else {
        // Retry the original request with new token
        return api.request(error.config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
