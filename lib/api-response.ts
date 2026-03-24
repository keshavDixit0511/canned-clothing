import { NextResponse } from "next/server"
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api"

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccessResponse<T>>({ data }, init)
}

export function apiError(
  error: string,
  status: number,
  code?: string
) {
  return NextResponse.json<ApiErrorResponse>(
    { error, ...(code ? { code } : {}) },
    { status }
  )
}
