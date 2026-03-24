import { getErrorMessage } from "@/lib/error-message"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export async function readJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function parseApiResponse<T>(response: Response): Promise<
  | { ok: true; status: number; data: T; raw: unknown }
  | { ok: false; status: number; error: string; code?: string; raw: unknown }
> {
  const raw = await readJsonSafely(response)

  if (response.ok) {
    const data =
      isObject(raw) && "data" in raw
        ? (raw.data as T)
        : (raw as T)

    return { ok: true, status: response.status, data, raw }
  }

  const error =
    isObject(raw) && typeof raw.error === "string"
      ? raw.error
      : response.statusText || "Request failed"

  const code =
    isObject(raw) && typeof raw.code === "string"
      ? raw.code
      : undefined

  return { ok: false, status: response.status, error, code, raw }
}

export function errorFromUnknown(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback)
}
