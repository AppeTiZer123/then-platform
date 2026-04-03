import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const normalizedRole = (user?.role || "").toLowerCase().trim();

  // Admin routes protection
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Check role - admin และ officer เข้าถึงได้
    if (normalizedRole !== "admin" && normalizedRole !== "officer") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // Report page protection (must be logged in)
  // Exception: /report/manual สำหรับ testing PDF generation
  if (
    nextUrl.pathname.startsWith("/report") &&
    !nextUrl.pathname.includes("/track") &&
    !nextUrl.pathname.includes("/manual")
  ) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // บังคับ user ใหม่กรอกข้อมูลโปรไฟล์ก่อนเข้าใช้งาน (ยกเว้น API และหน้า complete-profile เอง)
  if (
    isLoggedIn &&
    !nextUrl.pathname.startsWith("/complete-profile") &&
    !nextUrl.pathname.startsWith("/api")
  ) {
    // Check if user needs to complete profile
    if (!user?.name && nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/complete-profile", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // กำหนดว่า middleware จะทำงานกับ path ไหนบ้าง
  matcher: [
    "/admin/:path*",
    "/report/:path*",
    "/complete-profile",
    // Negative lookahead: ข้าม static files และ NextAuth API เพื่อไม่ให้ middleware ไปกั่น request พวกนี้
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
