// types/api.ts

// ─── Generic API response wrappers ────────────────────────────────────────────

export interface ApiSuccess<T> {
  data:    T
  message?: string
}

export interface ApiError {
  error:   string
  code?:   string
  details?: Record<string, string>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total:   number
  page:    number
  limit:   number
  pages:   number
}

export interface PaginatedResponse<T> {
  data:       T[]
  pagination: PaginationMeta
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface FetchOptions {
  method?:  HttpMethod
  body?:    unknown
  headers?: Record<string, string>
}

// ─── Route params ─────────────────────────────────────────────────────────────

export interface SlugParams {
  params: { slug: string }
}

export interface IdParams {
  params: { id: string }
}

export interface CodeParams {
  params: { code: string }
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string
}

// ─── Common query params ──────────────────────────────────────────────────────

export interface SearchParams {
  search?: string
  page?:   number
  limit?:  number
}