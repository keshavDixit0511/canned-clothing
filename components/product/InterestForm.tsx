"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Input"
import { Select } from "@/components/ui/Input"
import {
  LEAD_LIKED_CONCEPT_OPTIONS,
  LEAD_WILLING_TO_PAY_RANGE_OPTIONS,
  LEAD_WOULD_RECOMMEND_OPTIONS,
} from "@/lib/commerce"

type InterestFormProps = {
  productId: string
  productName: string
  title?: string
  subtitle?: string
}

type FormState = {
  name: string
  email: string
  phone: string
  city: string
  likedConcept: string
  willingToPayRange: string
  wouldRecommend: string
  comment: string
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  likedConcept: "YES",
  willingToPayRange: "PRICE_1299_1599",
  wouldRecommend: "YES",
  comment: "",
}

export function InterestForm({
  productId,
  productName,
  title = "Join the early access list",
  subtitle = "Tell us what you think so we can validate pricing and the concept before bringing this product into stock.",
}: InterestFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          likedConcept: form.likedConcept,
          willingToPayRange: form.willingToPayRange,
          wouldRecommend: form.wouldRecommend,
          comment: form.comment,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit interest")
      }

      setSuccess(`Thanks, we saved your interest in ${productName}.`)
      setForm(INITIAL_STATE)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to submit interest")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-emerald-400/15 bg-white/4 p-5 sm:p-6 space-y-4"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/80">
          Validation form
        </p>
        <h3 className="mt-2 text-2xl text-white leading-none" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/50">{subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Aman Verma"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="aman@email.com"
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          placeholder="+91 98765 43210"
          required
        />
        <Input
          label="City"
          value={form.city}
          onChange={(e) => setField("city", e.target.value)}
          placeholder="Mumbai"
        />
        <Select
          label="Liked concept"
          value={form.likedConcept}
          onChange={(e) => setField("likedConcept", e.target.value)}
          options={[...LEAD_LIKED_CONCEPT_OPTIONS]}
        />
        <Select
          label="Would recommend"
          value={form.wouldRecommend}
          onChange={(e) => setField("wouldRecommend", e.target.value)}
          options={[...LEAD_WOULD_RECOMMEND_OPTIONS]}
        />
        <div className="sm:col-span-2">
          <Select
            label="Willing to pay"
            value={form.willingToPayRange}
            onChange={(e) => setField("willingToPayRange", e.target.value)}
            options={[...LEAD_WILLING_TO_PAY_RANGE_OPTIONS]}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Comment"
            value={form.comment}
            onChange={(e) => setField("comment", e.target.value)}
            placeholder="What would make this a must-buy for you?"
            rows={4}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      )}

      <Button type="submit" variant="eco" loading={loading} fullWidth>
        Send interest
      </Button>
    </form>
  )
}

export default InterestForm
