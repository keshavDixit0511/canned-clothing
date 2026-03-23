// import { NextRequest, NextResponse } from "next/server"
// import { verifyToken } from "@/lib/auth/jwt"

// export function authMiddleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value

//   // If token missing → redirect to login
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }

//   try {
//     verifyToken(token)

//     return NextResponse.next()
//   } catch (error) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }
// }



// server/middleware/auth.ts
// This file is NO LONGER called from middleware.ts.
// Middleware runs on Edge runtime which can't use Node.js crypto.
//
// This file is kept for potential future use in server actions or
// custom Node.js route handlers, but is not used by Next.js middleware.
//
// For protecting API routes use: import { requireSession } from "@/lib/auth"
// For protecting pages use:      import { getSession } from "@/lib/auth"

export {}