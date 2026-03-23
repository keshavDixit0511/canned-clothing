import { ZodError } from "zod"

// Normalizes unknown thrown values into one readable message for routes and hooks.
export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
