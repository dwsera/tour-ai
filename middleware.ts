import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // 尝试使用 getToken 获取会话
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Middleware - Path:", req.nextUrl.pathname, "Token:", token);

  // 如果 getToken 失败，检查原始 Cookie
  const rawToken = req.cookies.get("next-auth.session-token")?.value;
  console.log("Middleware - Raw Token:", rawToken);

  const protectedRoutes = ["/create", "/", "/cc", "/reply", "/dashboard/:path*", "/jg", "/xhs"];

  if (protectedRoutes.includes(req.nextUrl.pathname) && !token && !rawToken) {
    console.log("Middleware - Redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create", "/", "/cc", "/reply", "/dashboard/:path*", "/jg", "/xhs"],
};