import axios from "axios";
import { createClient } from "@/lib/supabase/client";

/**
 * Pre-configured Axios instance for the Nexora API.
 * Automatically attaches the Supabase JWT to every request.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  async (config) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
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
