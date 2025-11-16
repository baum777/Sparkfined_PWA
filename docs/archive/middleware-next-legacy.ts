import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Legacy Next.js middleware originally used before the Vite migration.
 * Archived here to preserve the whitelist/auth logic for reference.
 */
const PUBLIC_PATHS = [
  "/manifest.webmanifest",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/public/") ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth")?.value || req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/api/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|manifest.webmanifest|favicon.ico|robots.txt).*)"],
};

