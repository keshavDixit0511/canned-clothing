// import { NextRequest } from "next/server"
// import { authMiddleware } from "./server/middleware/auth"

// export function middleware(req: NextRequest) {
//   return authMiddleware(req)
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/cart",
//     "/checkout",
//     "/orders",
//     "/scan/:path*"
//   ]
// }

// middleware.ts
// Edge runtime — CANNOT use Node.js crypto or jsonwebtoken here.
// Strategy: check cookie EXISTS in middleware (fast, edge-safe).
// Full JWT verification happens inside each API route / server component
// via lib/auth.ts → verifyToken (which runs in Node.js runtime).

import { NextRequest, NextResponse } from "next/server"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/cart",
  "/checkout",
  "/orders",
  "/scan",
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  )

  if (!isProtected) return NextResponse.next()

  // Edge-safe: just check if the cookie exists
  const token = req.cookies.get("token")?.value

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Token exists → let through. API routes / pages do full verification.
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cart",
    "/checkout",
    "/orders",
    "/scan/:path*",
  ],
}