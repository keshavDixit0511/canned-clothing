import { requestJson } from "@/lib/api"
import type { AuthSessionResponse } from "@/types/api"
import type { LoginInput, RegisterInput } from "@/lib/validators"
import type { AuthUser } from "@/types/user"
import { API } from "@/config/routes"

export async function login(payload: LoginInput) {
  return requestJson<AuthSessionResponse>(API.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function register(payload: RegisterInput) {
  return requestJson<AuthSessionResponse>(API.auth.register, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function logout() {
  await requestJson<{ message: string }>(API.auth.logout, {
    method: "POST",
  })
}

export async function fetchProfile() {
  return requestJson<AuthUser>(API.profile, {
    method: "GET",
  })
}
