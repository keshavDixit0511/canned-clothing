// hooks/useAuth.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:    string
  name:  string | null
  email: string
  role:  "USER" | "ADMIN"
  image: string | null
}

interface LoginPayload {
  email:    string
  password: string
}

interface RegisterPayload {
  name:     string
  email:    string
  password: string
}

interface AuthState {
  user:        AuthUser | null
  loading:     boolean
  error:        string | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const router = useRouter()

  const [state, setState] = useState<AuthState>({
    user:    null,
    loading: true,
    error:   null,
  })

  // ── Fetch current session user from /api/profile ──────────────────────────
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", {
        cache: "no-store",
        credentials: "include",
      })
      if (!res.ok) {
        setState({ user: null, loading: false, error: null })
        return
      }
      const data = await res.json()
      // /api/profile returns { name, image } — for full user we supplement
      // with what we have. If you want full user data, extend /api/profile.
      setState((prev) => ({
        user:    data.name ? { ...prev.user, ...data } as AuthUser : null,
        loading: false,
        error:   null,
      }))
    } catch {
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (payload: LoginPayload): Promise<{ success: boolean; error?: string }> => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const res = await fetch("/api/auth/login", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          const msg = data.error ?? "Login failed"
          setState((s) => ({ ...s, loading: false, error: msg }))
          return { success: false, error: msg }
        }

        setState({ user: data.user, loading: false, error: null })
        return { success: true }
      } catch {
        const msg = "Network error. Please try again."
        setState((s) => ({ ...s, loading: false, error: msg }))
        return { success: false, error: msg }
      }
    },
    []
  )

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (payload: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const res = await fetch("/api/auth/register", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          const msg = data.error ?? "Registration failed"
          setState((s) => ({ ...s, loading: false, error: msg }))
          return { success: false, error: msg }
        }

        setState({ user: data.user, loading: false, error: null })
        return { success: true }
      } catch {
        const msg = "Network error. Please try again."
        setState((s) => ({ ...s, loading: false, error: msg }))
        return { success: false, error: msg }
      }
    },
    []
  )

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method:      "POST",
        credentials: "include",
      })
    } catch {
      // Even if request fails, clear local state
    } finally {
      setState({ user: null, loading: false, error: null })
      router.push("/login")
      router.refresh()
    }
  }, [router])

  // ── Clear error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    user:         state.user,
    loading:      state.loading,
    error:        state.error,
    isLoggedIn:   !!state.user,
    isAdmin:      state.user?.role === "ADMIN",
    login,
    register,
    logout,
    clearError,
    refetch:      fetchUser,
  }
}
