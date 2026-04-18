import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // 로그인했지만 닉네임 미설정 → /nickname 강제 이동
  const PUBLIC_PATHS = ["/nickname", "/api", "/terms", "/privacy", "/policy", "/login"];
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (session && !session.user.nickname && !isPublic) {
    return NextResponse.redirect(new URL("/nickname", req.url));
  }

  // 비로그인 보호
  if (!session && pathname.startsWith("/posts/new")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (session.user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", ],
};
