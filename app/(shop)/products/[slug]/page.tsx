// app/products/[slug]/page.tsx
"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cartStore"
import { getErrorMessage } from "@/lib/error-message"

interface Product {
  id:          string
  name:        string
  slug:        string
  price:       number
  description: string
  stock:       number
  seedType:    string | null
  activity:    string | null
  images:      { url: string; order: number }[]
}

const STAGE_STEPS = [
  { label: "Unbox",  emoji: "📦", desc: "Open the brushed aluminum tin. Your shirt is rolled inside, wrinkle-free." },
  { label: "Wear",   emoji: "👕", desc: "Bamboo-spandex fabric — moisture-wicking, anti-odor, zero wrinkle." },
  { label: "Plant",  emoji: "🌱", desc: "Fill the tin with the soil pod. Add seeds. Place on your desk." },
  { label: "Track",  emoji: "📱", desc: "Scan the QR code to register your plant and earn Green Points." },
]

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

export default function ProductDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const slug     = params.slug as string
  const { addItem, openCart } = useCartStore()

  const [product, setProduct]   = useState<Product | null>(null)
  const [loading, setLoading]   = useState(true)
  const [imgIdx, setImgIdx]     = useState(0)
  const [qty, setQty]           = useState(1)
  const [adding, setAdding]     = useState(false)
  const [added, setAdded]       = useState(false)
  const [error, setError]       = useState("")

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (r.status === 404) { router.push("/products"); return null }
        return r.ok ? r.json() : null
      })
      .then((data) => { if (data) setProduct(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug, router])

  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    setError("")
    try {
      const res = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId: product.id, quantity: qty }),
      })

      if (res.status === 401) {
        router.push("/login?redirect=/products/" + slug)
        return
      }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to add to cart")
      }

      // Also update client-side Zustand store
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url ?? "",
        quantity: qty
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
      openCart()
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to add to cart"))
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#060a06] flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
    </div>
  )

  if (!product) return null

  const inStock  = product.stock > 0
  const maxQty   = Math.min(product.stock, 10)
  const images   = product.images.sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-[#060a06] pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
          <Link href="/products" className="hover:text-white/60 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white/60">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Images ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-white/5 to-white/2 aspect-square flex items-center justify-center">
              {images[imgIdx] ? (
                <Image
                  src={images[imgIdx].url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span className="text-8xl">🥫</span>
              )}
              {/* Ambient glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 80% 80%, rgba(52,211,153,0.08), transparent 60%)" }} />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      "relative h-16 w-16 rounded-xl border overflow-hidden transition-all duration-200",
                      i === imgIdx ? "border-emerald-400/60 ring-1 ring-emerald-400/30" : "border-white/10 hover:border-white/25"
                    )}
                  >
                    <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="space-y-6 lg:sticky lg:top-24">

            {/* Title */}
            <div>
              {product.seedType && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">
                  🌱 Includes {product.seedType} Seeds
                </span>
              )}
              <h1
                className="text-4xl sm:text-5xl text-white leading-none mb-2"
                style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
              >
                {product.name}
              </h1>
              <p className="text-sm text-white/45 leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span
                className="text-4xl text-white"
                style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
              >
                {formatINR(product.price)}
              </span>
              <span className={cn(
                "text-xs font-bold border rounded-full px-2.5 py-1",
                inStock
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-400"
                  : "border-red-400/25 bg-red-400/10 text-red-400"
              )}>
                {inStock ? `${product.stock} in stock` : "Sold Out"}
              </span>
            </div>

            {/* Quantity */}
            {inStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white/30">Qty</span>
                <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Add to cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className={cn(
                  "flex-1 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-300",
                  "hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0",
                  added
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400",
                  "shadow-lg shadow-emerald-900/30"
                )}
              >
                {adding ? "Adding..." : added ? "✓ Added to Cart!" : inStock ? "Add to Cart" : "Out of Stock"}
              </button>

              <Link
                href="/checkout"
                className={cn(
                  "rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-white/70",
                  "hover:bg-white/10 hover:text-white transition-all duration-200",
                  !inStock && "pointer-events-none opacity-30"
                )}
              >
                Buy Now
              </Link>
            </div>

            {/* Fabric details */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">The Fabric</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "💧", label: "Moisture Wicking" },
                  { icon: "🌬️", label: "Anti-Odor" },
                  { icon: "✨", label: "Zero Wrinkle" },
                ].map((f) => (
                  <div key={f.label} className="text-center rounded-xl border border-white/8 bg-white/3 p-3">
                    <span className="text-xl block mb-1">{f.icon}</span>
                    <p className="text-[10px] font-semibold text-white/50">{f.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                70% bamboo viscose, 30% spandex · 145 GSM · Delivered in brushed aluminum tin
              </p>
            </div>
          </div>
        </div>

        {/* ── Life Cycle steps ── */}
        <div className="mt-20 space-y-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-2">
              The Experience
            </p>
            <h2
              className="text-3xl sm:text-4xl text-white"
              style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
            >
              Unbox. Wear. Plant. Track.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGE_STEPS.map((step, i) => (
              <div key={step.label}
                className="rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-white/15 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                    {step.emoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Step {i + 1}</span>
                    <p className="text-sm font-bold text-white">{step.label}</p>
                  </div>
                </div>
                <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
