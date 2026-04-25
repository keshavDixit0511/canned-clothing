import * as SecureStore from "expo-secure-store"
import { create } from "zustand"
import type { AuthUser } from "@/types/user"
import { API } from "@/config/routes"

type AuthStatus = "loading" | "anonymous" | "authenticated"

type AuthState = {
  status: AuthStatus
  token: string | null
  user: AuthUser | null
  hydrate: () => Promise<void>
  setSession: (payload: { token: string; user: AuthUser }) => Promise<void>
  clearSession: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

const TOKEN_KEY = "canned.auth.token"

async function loadToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  token: null,
  user: null,
  hydrate: async () => {
    const token = await loadToken()
    if (!token) {
      set({ status: "anonymous", token: null, user: null })
      return
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"}${API.profile}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        await deleteToken()
        set({ status: "anonymous", token: null, user: null })
        return
      }

      const user = (await response.json()) as AuthUser
      set({ status: "authenticated", token, user })
    } catch {
      set({ status: "anonymous", token: null, user: null })
    }
  },
  setSession: async ({ token, user }) => {
    await saveToken(token)
    set({ status: "authenticated", token, user })
  },
  clearSession: async () => {
    await deleteToken()
    set({ status: "anonymous", token: null, user: null })
  },
  setUser: (user) => {
    set({
      user,
      status: user ? "authenticated" : get().status,
    })
  },
}))
