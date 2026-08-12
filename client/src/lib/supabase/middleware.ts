import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase middleware client.
 * Used in Next.js middleware to refresh auth sessions on every request.
 * Handles route protection and auth page redirects.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseUrl.startsWith("https://") ||
  supabaseUrl.includes("example.supabase.co")
) {
  console.error(
    "⚠️  [Middleware] NEXT_PUBLIC_SUPABASE_URL is missing or set to a placeholder. Auth will not work."
  );
}

if (!supabaseKey || supabaseKey.includes("dummy")) {
  console.error(
    "⚠️  [Middleware] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or set to a placeholder. Auth will not work."
  );
}

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseKey || "placeholder-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — IMPORTANT: do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — require authentication
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/discover",
    "/teams",
    "/projects",
    "/messages",
    "/skill-exchange",
    "/events",
    "/notifications",
    "/settings",
    "/admin",
    "/onboarding",
  ];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Auth pages — redirect authenticated users to dashboard
  // Exception: reset-password is accessible for authenticated users (coming from email link)
  const authPaths = ["/login", "/register", "/forgot-password", "/verify-email"];
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};
