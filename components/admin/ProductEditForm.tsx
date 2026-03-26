"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input, Textarea, Select } from "@/components/ui/Input"
import {
  PRODUCT_AVAILABILITY_STATUSES,
  getProductAvailabilityMeta,
} from "@/lib/commerce"

type ProductImage = { url: string; order: number }

type ProductFormProps = {
  product: {
    slug: string
    name: string
    description: string
    price: number
    stock: number
    activity: string
    seedType: string
    availabilityStatus: string
    images: ProductImage[]
  }
}

type FormState = {
  name: string
  description: string
  price: string
  stock: string
  activity: string
  seedType: string
  availabilityStatus: string
  imagesText: string
}

function toImages(text: string) {
  return text
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((url, index) => ({ url, order: index }))
}

export function ProductEditForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [form, setForm] = useState<FormState>({
    name: product.name,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    activity: product.activity,
    seedType: product.seedType,
    availabilityStatus: product.availabilityStatus,
    imagesText: product.images.map((image) => image.url).join("\n"),
  })

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          activity: form.activity,
          seedType: form.seedType,
          availabilityStatus: form.availabilityStatus,
          images: toImages(form.imagesText),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update product")
      }

      setSuccess(`${data.name ?? product.name} updated.`)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  const availability = getProductAvailabilityMeta(form.availabilityStatus)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[28px] border border-white/8 bg-white/4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">Editing</p>
            <h2 className="mt-1 text-2xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
              {product.name}
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-white/70">
            {availability.label}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
        <Input label="Price" type="number" min="0" step="1" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
        <Input label="Stock" type="number" min="0" step="1" value={form.stock} onChange={(e) => setField("stock", e.target.value)} required />
        <Select
          label="Availability"
          value={form.availabilityStatus}
          onChange={(e) => setField("availabilityStatus", e.target.value)}
          options={PRODUCT_AVAILABILITY_STATUSES.map((status) => ({
            value: status,
            label: getProductAvailabilityMeta(status).label,
          }))}
        />
        <Input label="Activity" value={form.activity} onChange={(e) => setField("activity", e.target.value)} required />
        <Input label="Seed type" value={form.seedType} onChange={(e) => setField("seedType", e.target.value)} required />
        <div className="md:col-span-2">
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={6}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label="Image URLs"
            value={form.imagesText}
            onChange={(e) => setField("imagesText", e.target.value)}
            rows={6}
            hint="One image URL per line"
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

      <Button type="submit" variant="eco" loading={loading}>
        Save changes
      </Button>
    </form>
  )
}

export default ProductEditForm
