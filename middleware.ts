import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: whitelist known public/static paths so that auth logic
 * does not run for manifest, favicon, _next/static and similar assets.
 *
 * If your project already had a middleware.ts, merge the `PUBLIC_PATHS`
 * and `matcher` logic into the existing file rather than replacing it blindly.
 */
const PUBLIC_PATHS = [
  "/manifest.webmanifest",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow Next internals and static assets to pass through
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/public/") ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // ---------- existing auth logic should run below ----------
  // NOTE: adapt the token cookie name / auth check to your project.
  const token = req.cookies.get("auth")?.value || req.cookies.get("session")?.value;
  if (!token) {
    // Default behavior: redirect to login or return 401. Preserve existing project behavior.
    // If your project previously redirected to a custom auth page, keep that redirect URL.
    return NextResponse.redirect(new URL("/api/auth/login", req.url));
  }

  return NextResponse.next();
}

// Prevent middleware from running for static files using matcher
export const config = {
  matcher: ["/((?!_next/static|_next/image|manifest.webmanifest|favicon.ico|robots.txt).*)"],
};

*** End Patch

