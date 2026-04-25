"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"

export function ClerkSessionSync() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const lastSyncedUserId = useRef<string | null>(null)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn || !userId) {
      lastSyncedUserId.current = null
      return
    }

    if (lastSyncedUserId.current === userId || inFlight.current) {
      return
    }

    inFlight.current = true

    void (async () => {
      const retryDelays = [0, 150, 400]

      for (const delayMs of retryDelays) {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }

        try {
          const response = await fetch("/api/auth/clerk-sync", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          })

          if (response.ok) {
            lastSyncedUserId.current = userId
            return
          }
        } catch {
          // Retry a few times in case the Clerk session cookie is still settling.
        }
      }
    })().finally(() => {
      inFlight.current = false
    })
  }, [isLoaded, isSignedIn, userId])

  return null
}
