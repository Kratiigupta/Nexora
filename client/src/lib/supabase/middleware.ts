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
  const pathname = request.nextUrl.pathname;

  // Protected routes — require authentication
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/discover",
    "/connections",
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

  // Auth pages — redirect authenticated users to dashboard
  const authPaths = ["/login", "/register", "/forgot-password", "/verify-email"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // 1. Skip auth checks entirely for public / marketing pages
  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request });
  }

  // Check if any Supabase auth cookies are present
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) =>
    c.name.startsWith("sb-") && (c.name.endsWith("-auth-token") || c.name.includes("auth"))
  );

  // 2. Unauthenticated user hitting protected path without any auth cookie
  // Redirect immediately without an expensive network roundtrip to Supabase
  if (isProtected && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 3. Next.js Link prefetch requests
  // Bypass getUser() network call so prefetching 10+ sidebar links is instantaneous
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";

  if (isPrefetch && isProtected && hasAuthCookie) {
    return NextResponse.next({ request });
  }

  // 4. Real navigations — verify session exists using getSession() (reads from cookie, NO network call).
  //    getUser() was causing a 300-800ms network roundtrip to Supabase on every single page navigation.
  //    The client-side AuthProvider handles token refresh, so middleware only needs to check session existence.
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

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};
