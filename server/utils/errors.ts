// server/utils/errors.ts

/**
 * Centralised error class definitions.
 * Import from here anywhere in the codebase.
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code:       string
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 400, code = "APP_ERROR") {
    super(message)
    this.name          = "AppError"
    this.statusCode    = statusCode
    this.code          = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized — please log in") {
    super(message, 401, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to perform this action") {
    super(message, 403, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR")
    this.name   = "ValidationError"
    this.fields = fields
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT")
    this.name = "ConflictError"
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 402, "PAYMENT_ERROR")
    this.name = "PaymentError"
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests — please try again later") {
    super(message, 429, "RATE_LIMITED")
    this.name = "RateLimitError"
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(`${service} is currently unavailable`, 503, "SERVICE_UNAVAILABLE")
    this.name = "ServiceUnavailableError"
  }
}

// ─── Type guard ───────────────────────────────────────────────────────────────

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}

// ─── Prisma error helpers ─────────────────────────────────────────────────────

export function isPrismaUniqueConstraint(err: unknown): boolean {
  return (err as any)?.code === "P2002"
}

export function isPrismaNotFound(err: unknown): boolean {
  return (err as any)?.code === "P2025"
}

// ─── Error message extractor ──────────────────────────────────────────────────

export function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err
  if (err instanceof Error)   return err.message
  return "An unexpected error occurred"
}