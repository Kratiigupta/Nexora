import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback Route Handler.
 * Handles Supabase auth redirects (email confirmation, password reset, OAuth).
 * Exchanges the auth code for a session and redirects to the appropriate page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine where to redirect — protect against open redirects (e.g., //malicious-site.com or /\malicious)
      const isValidRedirect = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\");
      const redirectUrl = isValidRedirect ? `${origin}${next}` : `${origin}/dashboard`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  );
}
