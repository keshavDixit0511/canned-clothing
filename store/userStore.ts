// store/userStore.ts

import { create } from "zustand"
import { persist } from "zustand/middleware"

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id:    string
  name:  string | null
  email: string
  image: string | null
  role:  "USER" | "ADMIN"
}

interface UserState {
  user:        UserProfile | null
  isLoading:   boolean
  isHydrated:  boolean

  // Actions
  setUser:     (user: UserProfile | null) => void
  setLoading:  (loading: boolean) => void
  clearUser:   () => void
  fetchUser:   () => Promise<void>
  updateName:  (name: string) => void
  updateImage: (image: string) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user:       null,
      isLoading:  false,
      isHydrated: false,

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      clearUser: () => set({ user: null }),

      /**
       * Fetch the current user from /api/profile.
       * Call on app mount to restore session.
       */
      fetchUser: async () => {
        if (get().isLoading) return
        set({ isLoading: true })
        try {
          const res = await fetch("/api/profile")
          if (!res.ok) {
            set({ user: null })
            return
          }
          const data = await res.json()
          if (data?.id) {
            set({ user: data })
          } else {
            set({ user: null })
          }
        } catch {
          set({ user: null })
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Optimistically update name in store.
       */
      updateName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, name } : null,
        })),

      /**
       * Optimistically update image in store.
       */
      updateImage: (image) =>
        set((state) => ({
          user: state.user ? { ...state.user, image } : null,
        })),
    }),
    {
      name:    "dk-user",
      // Only persist user data, not loading states
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true
      },
    }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser      = (s: UserState) => s.user
export const selectIsAdmin   = (s: UserState) => s.user?.role === "ADMIN"
export const selectIsLoggedIn = (s: UserState) => !!s.user