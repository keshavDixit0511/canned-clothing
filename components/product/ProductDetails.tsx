// components/product/ProductDetails.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCartStore } from "@/store/cartStore"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/error-message"

interface ProductImage {
  url:   string
  order: number
}

// Matches schema Product model exactly
interface Product {
  id:          string
  name:        string
  slug:        string
  price:       number
  description: string
  stock:       number
  seedType:    string
  activity:    string
  images:      ProductImage[]
}

interface ProductDetailsProps {
  product: Product
}

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

const LIFE_CYCLE = [
  { emoji: "📦", label: "Unbox",  desc: "Pull the tab on your brushed aluminum tin" },
  { emoji: "👕", label: "Wear",   desc: "Bamboo-spandex — zero wrinkle, all day comfort" },
  { emoji: "🌱", label: "Plant",  desc: "Fill tin with soil pod, drop seeds, grow" },
  { emoji: "📱", label: "Track",  desc: "Scan QR to earn Green Points on your plant" },
]

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const { addItem, openCart } = useCartStore()

  const [qty,     setQty]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [added,   setAdded]   = useState(false)
  const [error,   setError]   = useState("")

  const inStock  = product.stock > 0
  const maxQty   = Math.min(product.stock, 10)
  const primaryImage = product.images.sort((a, b) => a.order - b.order)[0]?.url ?? null

  const handleAddToCart = async () => {
    if (!inStock) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId: product.id, quantity: qty }),
      })

      if (res.status === 401) {
        router.push(`/login?redirect=/products/${product.slug}`)
        return
      }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to add to cart")
      }

      // Update Zustand store for instant UI feedback
      addItem({
        productId: product.id,
        name:      product.name,
        price:     product.price,
        image:     primaryImage,
        quantity:  qty,
      })

      setAdded(true)
      openCart()
      setTimeout(() => setAdded(false), 2500)
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to add to cart"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Seed badge */}
      {product.seedType && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
          🌱 Includes {product.seedType} Seeds
        </span>
      )}

      {/* Title */}
      <div>
        <h1
          className="text-4xl sm:text-5xl text-white leading-none mb-2"
          style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
        >
          {product.name}
        </h1>
        <p className="text-sm text-white/45 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Price + stock */}
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

      {/* Quantity selector */}
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

      {/* CTA buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || loading}
          className={cn(
            "flex-1 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-300",
            "hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0",
            "shadow-lg shadow-emerald-900/30",
            added
              ? "bg-emerald-600"
              : "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400"
          )}
        >
          {loading ? "Adding..." : added ? "✓ Added to Cart!" : inStock ? "Add to Cart" : "Out of Stock"}
        </button>

        {inStock && (
          <Link
            href="/checkout"
            className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            Buy Now
          </Link>
        )}
      </div>

      {/* Fabric details */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">The Fabric</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "💧", label: "Moisture Wicking" },
            { icon: "🌬️", label: "Anti-Odor"        },
            { icon: "✨", label: "Zero Wrinkle"     },
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

      {/* Life cycle steps */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">The Experience</p>
        <div className="grid grid-cols-2 gap-2">
          {LIFE_CYCLE.map((step) => (
            <div key={step.label} className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/3 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm">
                {step.emoji}
              </div>
              <div>
                <p className="text-xs font-bold text-white/80">{step.label}</p>
                <p className="text-[10px] text-white/35 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default ProductDetails
