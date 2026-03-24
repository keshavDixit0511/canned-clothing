// app/dashboard/profile/page.tsx
"use client"

export const dynamic = "force-dynamic" 

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/error-message"

interface ProfileData {
  name:  string
  email: string
  image: string | null
  role:  string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit state
  const [name, setName]       = useState("")
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState("")

  // Password state
  const [currPw, setCurrPw]   = useState("")
  const [newPw, setNewPw]     = useState("")
  const [confPw, setConfPw]   = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError]   = useState("")

  useEffect(() => {
    fetch("/api/profile", { credentials: "include", cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile(data)
          setName(data.name ?? "")
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSaveName = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Could not update name. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currPw || !newPw || !confPw) return
    if (newPw !== confPw) { setPwError("Passwords don't match"); return }
    if (newPw.length < 8) { setPwError("Must be at least 8 characters"); return }
    setPwSaving(true)
    setPwError("")
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currPw, newPassword: newPw }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed")
      }
      setPwSuccess(true)
      setCurrPw(""); setNewPw(""); setConfPw("")
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (error: unknown) {
      setPwError(getErrorMessage(error, "Failed to update password"))
    } finally {
      setPwSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const initials = profile?.name
    .split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") ?? "?"

  if (loading) return (
    <div className="min-h-screen bg-[#060a06] flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#060a06] pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-24 space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/30 mb-1">Account</p>
          <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl text-white leading-none">
            Profile
          </h1>
        </div>

        {/* Avatar + basic info */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 text-xl font-black text-white/70"
              style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: 24 }}>
              {profile?.image
                ? <Image src={profile.image} alt={profile.name} fill sizes="64px" className="object-cover" />
                : initials
              }
            </div>
            <div>
              <p className="font-['Bebas_Neue',_sans-serif] text-2xl text-white leading-none">
                {profile?.name}
              </p>
              <p className="text-sm text-white/40 mt-0.5">{profile?.email}</p>
              <span className={cn(
                "mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5",
                profile?.role === "ADMIN"
                  ? "border-purple-400/30 bg-purple-400/10 text-purple-400"
                  : "border-emerald-400/20 bg-emerald-400/8 text-emerald-400"
              )}>
                {profile?.role === "ADMIN" ? "⚡ Admin" : "🌱 Grower"}
              </span>
            </div>
          </div>
        </div>

        {/* Edit name */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Display Name</p>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-emerald-400/40 transition-colors"
              placeholder="Your name"
            />
            <button
              onClick={handleSaveName}
              disabled={saving || !name.trim() || name === profile?.name}
              className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200",
                "bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {success && <p className="text-xs text-emerald-400">✓ Name updated</p>}
          {error   && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Email — read only */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Email Address</p>
          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-2.5">
            <p className="text-sm text-white/50">{profile?.email}</p>
          </div>
          <p className="text-xs text-white/20">Email cannot be changed after registration.</p>
        </div>

        {/* Change password */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Change Password</p>

          {[
            { label: "Current Password",  value: currPw, set: setCurrPw },
            { label: "New Password",       value: newPw,  set: setNewPw  },
            { label: "Confirm New",        value: confPw, set: setConfPw },
          ].map((f) => (
            <input
              key={f.label}
              type="password"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.label}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-emerald-400/40 transition-colors"
            />
          ))}

          {pwError   && <p className="text-xs text-red-400">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-emerald-400">✓ Password updated</p>}

          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !currPw || !newPw || !confPw}
            className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-400/15 bg-red-400/5 p-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400/70">Account</p>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-red-400/20 bg-red-400/8 py-2.5 text-sm font-bold text-red-400 hover:bg-red-400/15 transition-all duration-200"
          >
            🚪 Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}
