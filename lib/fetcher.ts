// ─── Types ─────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface FetcherOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>
}

type ErrorBody = {
  error?: string
  message?: string
}

// ─── Core Fetcher ─────────────────────────────────────────────────────────────

/**
 * Base typed fetch wrapper. Throws ApiError on non-2xx responses.
 * Used as the default SWR fetcher and for manual API calls.
 *
 * @example
 * const data = await fetcher<Product[]>("/api/products")
 * const product = await fetcher<Product>(`/api/products/${slug}`)
 */
export async function fetcher<T = unknown>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { params, ...init } = options

  // Append query params if provided
  let resolvedUrl = url
  if (params) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== "") {
        sp.set(key, String(val))
      }
    })
    const qs = sp.toString()
    if (qs) resolvedUrl = `${url}?${qs}`
  }

  const res = await fetch(resolvedUrl, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  // Parse body regardless — we need it for error messages
  let body: unknown
  const contentType = res.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    body = await res.json()
  } else {
    body = await res.text()
  }

  if (!res.ok) {
    const errorBody =
      typeof body === "object" && body !== null ? (body as ErrorBody) : null
    const message =
      errorBody?.error ??
      errorBody?.message ??
      `Request failed with status ${res.status}`
    throw new ApiError(res.status, message, body)
  }

  return body as T
}

// ─── Method Shorthands ────────────────────────────────────────────────────────

/**
 * GET — default SWR fetcher signature (takes only url string).
 *
 * @example
 * const { data } = useSWR<Plant[]>("/api/plant", get)
 */
export const get = <T = unknown>(url: string) => fetcher<T>(url)

/**
 * POST with JSON body.
 *
 * @example
 * const user = await post<User>("/api/auth/register", { name, email, password })
 */
export async function post<T = unknown>(
  url: string,
  body: unknown,
  options?: FetcherOptions
): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  })
}

/**
 * PUT with JSON body.
 */
export async function put<T = unknown>(
  url: string,
  body: unknown,
  options?: FetcherOptions
): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  })
}

/**
 * PATCH with JSON body.
 */
export async function patch<T = unknown>(
  url: string,
  body: unknown,
  options?: FetcherOptions
): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

/**
 * DELETE request.
 */
export async function del<T = unknown>(
  url: string,
  options?: FetcherOptions
): Promise<T> {
  return fetcher<T>(url, { ...options, method: "DELETE" })
}

// ─── SWR Config Helper ────────────────────────────────────────────────────────

/**
 * Default SWR options to use across your hooks.
 * Import and spread into useSWR calls.
 *
 * @example
 * const { data } = useSWR("/api/eco", get, swrConfig)
 */
export const swrConfig = {
  fetcher: get,
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  dedupingInterval: 5000,
} as const

// ─── Error helpers ────────────────────────────────────────────────────────────

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

export function isUnauthorized(err: unknown): boolean {
  return isApiError(err) && err.status === 401
}

export function isNotFound(err: unknown): boolean {
  return isApiError(err) && err.status === 404
}
