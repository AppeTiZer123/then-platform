import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  // Admin routes protection
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    
    // Check role - เฉพาะ admin เท่านั้น
    if (user?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // Report page protection (must be logged in)
  if (nextUrl.pathname.startsWith("/report") && !nextUrl.pathname.includes("/track")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Complete profile redirect for new users
  if (isLoggedIn && !nextUrl.pathname.startsWith("/complete-profile") && !nextUrl.pathname.startsWith("/api")) {
    // Check if user needs to complete profile
    if (!user?.name && nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/complete-profile", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match admin routes
    "/admin/:path*",
    // Match report routes
    "/report/:path*",
    // Match complete-profile
    "/complete-profile",
    // Skip static files and API
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
