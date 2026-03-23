// server/utils/response.ts

import { NextResponse } from "next/server"

// ─── Success responses ────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ─── Error responses ──────────────────────────────────────────────────────────

export function badRequest(message: string, code = "BAD_REQUEST"): NextResponse {
  return NextResponse.json({ error: message, code }, { status: 400 })
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message, code: "UNAUTHORIZED" }, { status: 401 })
}

export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message, code: "FORBIDDEN" }, { status: 403 })
}

export function notFound(resource = "Resource"): NextResponse {
  return NextResponse.json(
    { error: `${resource} not found`, code: "NOT_FOUND" },
    { status: 404 }
  )
}

export function conflict(message: string): NextResponse {
  return NextResponse.json({ error: message, code: "CONFLICT" }, { status: 409 })
}

export function tooManyRequests(retryAfter?: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests — please try again later", code: "RATE_LIMITED" },
    {
      status: 429,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    }
  )
}

export function serverError(message = "Internal server error"): NextResponse {
  return NextResponse.json({ error: message, code: "INTERNAL_ERROR" }, { status: 500 })
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginationMeta {
  total:  number
  page:   number
  limit:  number
  pages:  number
}

export function paginated<T>(
  data:       T[],
  meta:       PaginationMeta,
  status = 200
): NextResponse {
  return NextResponse.json({ data, pagination: meta }, { status })
}

// ─── Redirect helpers ─────────────────────────────────────────────────────────

export function redirectTo(url: string, permanent = false): NextResponse {
  return NextResponse.redirect(url, { status: permanent ? 301 : 302 })
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export function withCookie(
  response:   NextResponse,
  name:       string,
  value:      string,
  options: {
    httpOnly?: boolean
    secure?:   boolean
    sameSite?: "lax" | "strict" | "none"
    maxAge?:   number
    path?:     string
  } = {}
): NextResponse {
  response.cookies.set({
    name,
    value,
    httpOnly: options.httpOnly ?? true,
    secure:   options.secure   ?? process.env.NODE_ENV === "production",
    sameSite: options.sameSite ?? "lax",
    maxAge:   options.maxAge   ?? 60 * 60 * 24 * 7,
    path:     options.path     ?? "/",
  })
  return response
}

export function clearCookie(response: NextResponse, name: string): NextResponse {
  response.cookies.set({ name, value: "", maxAge: 0, path: "/" })
  return response
}