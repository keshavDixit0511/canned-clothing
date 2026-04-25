"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth, useSignIn } from "@clerk/nextjs"
import { Mail, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Input, PasswordInput } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const OAUTH_CALLBACK_PATH = "/callback"

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

function buildRedirectUrl(path: string, nextPath: string) {
  return `${window.location.origin}${path}?next=${encodeURIComponent(nextPath)}`
}

function AuthHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>

      <div className="space-y-2">
        <h1
          className="text-4xl sm:text-5xl text-white leading-none"
          style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
        >
          {title}
        </h1>
        <p className="max-w-lg text-sm text-white/50 sm:text-[15px]">
          {description}
        </p>
      </div>
    </div>
  )
}

function SocialButton({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all duration-200",
        "hover:border-white/20 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white/80">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-white">{label}</span>
      </span>
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoaded, isSignedIn } = useAuth()
  const { signIn, setActive } = useSignIn()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const redirectingRef = useRef(false)

  const nextPath = safeNextPath(searchParams.get("next") ?? searchParams.get("redirect"))

  useEffect(() => {
    if (!isLoaded || !isSignedIn || redirectingRef.current) {
      return
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!signIn || !setActive) {
      return
    }

    if (!email || !password) {
      setError("Please fill in both fields.")
      return
    }

    setLoading(true)

    try {
      await signIn.password({
        identifier: email.trim(),
        password,
      })

      if (signIn.status === "complete" && signIn.createdSessionId) {
        await setActive({ session: signIn.createdSessionId })
        const syncResult = await syncClerkSession().catch(() => null)
        router.replace(
          syncResult?.needsOnboarding
            ? `/onboarding?next=${encodeURIComponent(nextPath)}`
            : nextPath
        )
        return
      }

      const fallbackResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const fallbackData = await fallbackResponse.json()
      if (!fallbackResponse.ok) {
        throw new Error(fallbackData.error ?? "Sign in failed")
      }

      const clerkTicket = fallbackData.clerkSignInToken
      if (typeof clerkTicket === "string" && clerkTicket) {
        try {
          await signIn.ticket({ ticket: clerkTicket })
          if (signIn.createdSessionId) {
            await setActive({ session: signIn.createdSessionId })
          }
          const syncResult = await syncClerkSession().catch(() => null)
          router.replace(
            syncResult?.needsOnboarding
              ? `/onboarding?next=${encodeURIComponent(nextPath)}`
              : nextPath
          )
        } catch {
          // Clerk handoff is best-effort here. The local token still works.
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  const handleOauth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!signIn) return

    setError("")
    setLoading(true)

    try {
      await signIn.sso({
        strategy,
        redirectUrl: nextPath,
        redirectCallbackUrl: buildRedirectUrl(OAUTH_CALLBACK_PATH, nextPath),
      })
    } catch (cause) {
      setLoading(false)
      setError(cause instanceof Error ? cause.message : "Social sign-in failed")
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/25 border-t-emerald-400" />
      </div>
    )
  }

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/25 border-t-emerald-400" />
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card variant="glow" accent="emerald" noPadding className="overflow-hidden">
          <div className="relative h-full p-6 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.12),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_45%)]" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <AuthHeader
                eyebrow="Welcome back"
                title="Grow with one clean account."
                description="Sign in to track your orders, style profile, plants, and eco impact in the ESTHETIQUE experience."
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Order history in one place",
                  "Plant growth and reminders",
                  "Sustainable profile access",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/65"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/8 bg-black/20 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300/80">
                      Built for growers
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      Premium bamboo-spandex, a brushed tin, and a living dashboard.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="border-white/12 bg-[#07110b]/90 p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/35">
                Sign In
              </p>
              <h2 className="font-['Syne'] text-2xl font-bold text-white">
                Re-enter your account
              </h2>
              <p className="text-sm text-white/45">
                Use email or continue with Google or Apple.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SocialButton
                label="Continue with Google"
                icon={<span className="text-sm font-black text-emerald-300">G</span>}
                disabled={loading}
                onClick={() => void handleOauth("oauth_google")}
              />
              <SocialButton
                label="Continue with Apple"
                icon={<span className="text-sm font-black text-white">A</span>}
                disabled={loading}
                onClick={() => void handleOauth("oauth_apple")}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/30">
                Or use email
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="eco"
                size="lg"
                fullWidth
                loading={loading}
                className="mt-2"
              >
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm text-white/50">
              New here?{" "}
              <Link
                href="/register"
                className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Create an account
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
