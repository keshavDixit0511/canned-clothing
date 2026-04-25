"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input, Select, Textarea } from "@/components/ui/Input"
import { splitFullName, getDisplayName } from "@/lib/profile"

export const dynamic = "force-dynamic"

type ProfilePayload = {
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  gender: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  country: string | null
  pincode: string | null
  onboardingCompleted: boolean
}

type OnboardingFormState = {
  firstName: string
  lastName: string
  gender: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  pincode: string
}

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Non-binary", value: "NON_BINARY" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
  { label: "Other", value: "OTHER" },
]

const INITIAL_FORM: OnboardingFormState = {
  firstName: "",
  lastName: "",
  gender: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
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

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectingRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [profile, setProfile] = useState<ProfilePayload | null>(null)
  const [form, setForm] = useState<OnboardingFormState>(INITIAL_FORM)

  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next") ?? searchParams.get("redirect")),
    [searchParams]
  )

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
          cache: "no-store",
        })

        if (response.status === 401) {
          router.replace(`/login?redirect=${encodeURIComponent("/onboarding")}`)
          return
        }

        const data = (await response.json()) as ProfilePayload | { error?: string }
        if (!mounted) return

        if ("error" in data) {
          throw new Error(data.error || "Failed to load profile")
        }

        if (data.onboardingCompleted) {
          if (!redirectingRef.current) {
            redirectingRef.current = true
            router.replace(nextPath)
          }
          return
        }

        const fullName = getDisplayName({
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          fallback: "",
        })
        const nameParts = splitFullName(fullName)

        setProfile(data)
        setForm({
          firstName: data.firstName ?? nameParts.firstName,
          lastName: data.lastName ?? nameParts.lastName,
          gender: data.gender ?? "",
          addressLine1: data.addressLine1 ?? "",
          addressLine2: data.addressLine2 ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          country: data.country ?? "India",
          pincode: data.pincode ?? "",
        })
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Failed to load profile")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadProfile()

    return () => {
      mounted = false
    }
  }, [nextPath, router])

  const displayName = getDisplayName({
    name: profile?.name,
    firstName: form.firstName,
    lastName: form.lastName,
    email: profile?.email,
    fallback: "ESTHETIQUE User",
  })

  function updateField<K extends keyof OnboardingFormState>(key: K, value: OnboardingFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setSaving(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          onboardingCompleted: true,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save onboarding profile")
      }

      router.replace(nextPath)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save onboarding profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card variant="glow" accent="emerald" noPadding className="overflow-hidden">
          <div className="relative h-full p-6 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.12),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_45%)]" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                  Complete setup
                </div>

                <div className="space-y-2">
                  <h1
                    className="text-4xl sm:text-5xl text-white leading-none"
                    style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
                  >
                    Finish your profile.
                  </h1>
                  <p className="max-w-lg text-sm text-white/50 sm:text-[15px]">
                    We use these details to personalize your account, prefill delivery information, and keep your record complete in ESTHETIQUE.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Used for delivery and receipts",
                  "Saved locally in Prisma",
                  "Only asked once after sign-in",
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
                <CardHeader
                  title="Your delivery identity"
                  subtitle="This is the name and address we will use for profile previews and checkout."
                />
                <div className="space-y-2 text-sm text-white/50">
                  <p className="text-white/80">{displayName}</p>
                  <p>{profile?.email ?? "Email linked through Clerk"}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="border-white/12 bg-[#07110b]/90 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/35">
                Personal details
              </p>
              <h2 className="font-['Syne'] text-2xl font-bold text-white">
                Tell us where to send it
              </h2>
              <p className="text-sm text-white/45">
                All fields below are stored in your local Prisma profile.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                type="text"
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                disabled={saving}
                autoComplete="given-name"
                required
              />
              <Input
                label="Last name"
                type="text"
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                disabled={saving}
                autoComplete="family-name"
                required
              />
            </div>

            <Select
              label="Gender"
              value={form.gender}
              onChange={(event) => updateField("gender", event.target.value)}
              disabled={saving}
              options={GENDER_OPTIONS}
              placeholder="Select gender"
            />

            <Textarea
              label="Address line 1"
              value={form.addressLine1}
              onChange={(event) => updateField("addressLine1", event.target.value)}
              disabled={saving}
              autoComplete="street-address"
              rows={3}
              placeholder="Apartment, street, area, landmark"
              required
            />

            <Input
              label="Address line 2"
              type="text"
              value={form.addressLine2}
              onChange={(event) => updateField("addressLine2", event.target.value)}
              disabled={saving}
              autoComplete="address-line2"
              placeholder="Optional"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="City"
                type="text"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                disabled={saving}
                autoComplete="address-level2"
                required
              />
              <Input
                label="State"
                type="text"
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                disabled={saving}
                autoComplete="address-level1"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Country"
                type="text"
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
                disabled={saving}
                autoComplete="country-name"
                required
              />
              <Input
                label="Pincode"
                type="text"
                inputMode="numeric"
                value={form.pincode}
                onChange={(event) => updateField("pincode", event.target.value)}
                disabled={saving}
                autoComplete="postal-code"
                required
              />
            </div>

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
              loading={saving}
            >
              Save and continue
            </Button>

            <div className="text-center text-sm text-white/50">
              Need to adjust your account first?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Sign out and switch user
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
