import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (singleton).
 * Used in Client Components for auth operations and data fetching.
 *
 * Validates that real Supabase credentials are configured at startup
 * instead of silently falling back to unreachable placeholder URLs.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseUrl.startsWith("https://") ||
  supabaseUrl.includes("example.supabase.co")
) {
  console.error(
    "⚠️  NEXT_PUBLIC_SUPABASE_URL is missing or set to a placeholder.\n" +
      "   Auth will not work until you configure a real Supabase project URL in .env.local\n" +
      "   Current value: " + (supabaseUrl || "(not set)")
  );
}

if (!supabaseKey || supabaseKey.includes("dummy")) {
  console.error(
    "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or set to a placeholder.\n" +
      "   Auth will not work until you configure a real Supabase anon key in .env.local\n" +
      "   Current value: " + (supabaseKey ? supabaseKey.slice(0, 20) + "..." : "(not set)")
  );
}

let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (!client) {
    client = createBrowserClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseKey || "placeholder-key"
    );
  }
  return client;
};
