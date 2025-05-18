import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/auth/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("user-token")?.value
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/feedback",
    "/auth/customer-login",
    "/auth/provider-login",
    "/auth/admin-login",
    "/auth/customer-signup",
    "/auth/provider-signup",
    "/auth/forgot-password",
  ]

  // Check if the path is public
  if (publicPaths.some((publicPath) => path === publicPath || path.startsWith("/api/"))) {
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/customer-login", request.url))
  }

  // Verify the token
  const payload = await decrypt(token)
  if (!payload) {
    return NextResponse.redirect(new URL("/auth/customer-login", request.url))
  }

  // Role-based access control
  const role = payload.role as string

  // Admin routes
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Customer routes
  if (path.startsWith("/customer") && role !== "customer") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Provider routes
  if (path.startsWith("/provider") && role !== "provider") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
