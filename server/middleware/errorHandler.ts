// server/middleware/errorHandler.ts

import { NextResponse } from "next/server"
import { ZodError }     from "zod"

// ─── Custom error classes ──────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message:          string,
    public statusCode: number = 400,
    public code?:      string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT")
    this.name = "ConflictError"
  }
}

// ─── Error handler ────────────────────────────────────────────────────────────

/**
 * Wraps an async route handler and catches all errors.
 * Returns consistent JSON error responses.
 *
 * Usage:
 *   export const POST = handleErrors(async (req) => { ... })
 */
export function handleErrors(
  handler: (req: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: Request, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args)
    } catch (err: any) {
      return errorResponse(err)
    }
  }
}

/**
 * Convert any error to a structured NextResponse.
 */
export function errorResponse(err: unknown): NextResponse {
  // Zod validation error
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error:   err.issues[0].message,
        code:    "VALIDATION_ERROR",
        details: Object.fromEntries(
          err.issues.map((i) => [i.path.join("."), i.message])
        ),
      },
      { status: 400 }
    )
  }

  // Custom app errors
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.statusCode }
    )
  }

  // Prisma unique constraint
  if ((err as any)?.code === "P2002") {
    return NextResponse.json(
      { error: "A record with this value already exists", code: "CONFLICT" },
      { status: 409 }
    )
  }

  // Prisma not found
  if ((err as any)?.code === "P2025") {
    return NextResponse.json(
      { error: "Record not found", code: "NOT_FOUND" },
      { status: 404 }
    )
  }

  // JWT errors
  if ((err as any)?.name === "JsonWebTokenError") {
    return NextResponse.json(
      { error: "Invalid token", code: "UNAUTHORIZED" },
      { status: 401 }
    )
  }
  if ((err as any)?.name === "TokenExpiredError") {
    return NextResponse.json(
      { error: "Token expired", code: "UNAUTHORIZED" },
      { status: 401 }
    )
  }

  // Unknown error — log and return 500
  console.error("[SERVER_ERROR]", err)
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 }
  )
}