import { NextResponse } from "next/server"
import { clerkMiddleware } from "@clerk/nextjs/server"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/cart",
  "/checkout",
  "/orders",
  "/scan",
  "/api/upload",
  "/api/profile",
  "/api/cart",
  "/api/payment",
  "/api/orders",
  "/api/plant",
  "/api/eco",
  "/api/leaderboard/me",
]

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/callback",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
]

export default clerkMiddleware(
  async (auth, request) => {
    const { pathname } = request.nextUrl

    if (PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) {
      return NextResponse.next()
    }

    const token = request.cookies.get("token")?.value
    if (token) {
      return NextResponse.next()
    }

    const isProtected = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    )

    if (!isProtected) {
      return NextResponse.next()
    }

    await auth.protect()
    return NextResponse.next()
  },
  {
    signInUrl: "/login",
    signUpUrl: "/register",
  }
)

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
