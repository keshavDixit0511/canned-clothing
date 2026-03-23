"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Card } from "@/components/ui/Card"
import { Input, PasswordInput } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please fill all fields")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Something went wrong")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card variant="glow" accent="emerald" className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-['Syne'] text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-white/50">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm text-center">
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

          <div className="mt-8 text-center text-sm text-white/50">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Create one
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
