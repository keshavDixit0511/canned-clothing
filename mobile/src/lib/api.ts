import Constants from "expo-constants"
import { useAuthStore } from "@/store/auth.store"

const DEFAULT_BASE_URL = "http://localhost:3000"

export function getApiBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
    DEFAULT_BASE_URL
  )
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token
  const headers = new Headers(init.headers)

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed")
  }

  return payload as T
}
