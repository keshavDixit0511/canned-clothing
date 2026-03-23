//lib/auth.ts
import { cookies } from "next/headers"
import { verifyToken, type TokenPayload } from "@/lib/auth/jwt"

/**
 * Lightweight auth error used by route handlers to distinguish
 * authentication/authorization failures from unexpected server errors.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public status = 401
  ) {
    super(message)
    this.name = "AuthError"
  }
}

/**
 * Reads and verifies the auth_token cookie on the server.
 * Use inside Server Components, Route Handlers, and Server Actions.
 *
 * @returns TokenPayload if valid, null otherwise
 *
 * @example
 * const session = await getSession()
 * if (!session) redirect("/login")
 */
export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

/**
 * Same as getSession() but throws a 401-style error if unauthenticated.
 * Use in Route Handlers where you want to fail fast.
 *
 * @example
 * const session = await requireSession()
 * // guaranteed: session.userId, session.email, session.role
 */
export async function requireSession(): Promise<TokenPayload> {
  const session = await getSession()
  if (!session) {
    throw new AuthError("Unauthorized", 401)
  }
  return session
}

/**
 * Enforces an authenticated ADMIN session for mutation routes.
 * Keeping this in one place prevents admin checks from drifting across files.
 */
export async function requireAdminSession(): Promise<TokenPayload> {
  const session = await requireSession()
  if (session.role !== "ADMIN") {
    throw new AuthError("Forbidden", 403)
  }
  return session
}

/**
 * Returns true if the current request has a valid session.
 * Useful for conditional rendering in Server Components.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Returns true if the session belongs to an ADMIN role.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.role === "ADMIN"
}

/**
 * Extracts just the userId from the session.
 * Convenient shorthand for database queries.
 *
 * @example
 * const userId = await getSessionUserId()
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.userId ?? null
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}
