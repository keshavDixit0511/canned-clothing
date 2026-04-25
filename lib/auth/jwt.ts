//lib/auth/jwt.ts
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export interface TokenPayload {
  userId: string
  email: string
  role: string
  authProvider?: "local" | "clerk"
  clerkUserId?: string
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}
