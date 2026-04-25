"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs"

export const dynamic = "force-dynamic"

async function syncClerkSession() {
  const response = await fetch("/api/auth/clerk-sync", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to sync Clerk session")
  }

  return response.json() as Promise<{ needsOnboarding?: boolean }>
}

function safeNextPath(value: string | null) {
  if (!value) return "/dashboard"
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith("//") || !trimmed.startsWith("/")) {
    return "/dashboard"
  }
  if (trimmed === "/onboarding") {
    return "/dashboard"
  }
  return trimmed
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoaded, isSignedIn } = useAuth()
  const redirectingRef = useRef(false)

  const nextPath = safeNextPath(searchParams.get("next") ?? searchParams.get("redirect"))

  useEffect(() => {
    if (!isLoaded || !isSignedIn || redirectingRef.current) return

    redirectingRef.current = true

    void syncClerkSession()
      .then((result) => {
        router.replace(
          result?.needsOnboarding
            ? `/onboarding?next=${encodeURIComponent(nextPath)}`
            : nextPath
        )
      })
      .catch(() => {
        router.replace(`/onboarding?next=${encodeURIComponent(nextPath)}`)
      })
  }, [isLoaded, isSignedIn, nextPath, router])

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/25 border-t-emerald-400" />
          <h1 className="mt-4 font-['Syne'] text-xl font-bold text-white">
            Completing sign in
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Please wait while we finish your session.
          </p>
        </div>
      </div>

      <div className="sr-only">
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  )
}
