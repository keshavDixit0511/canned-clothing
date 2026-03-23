// components/home/ProductsSection.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useInView } from "@/hooks"

// Three.js must NOT run on the server
const TinScene = dynamic(
  () => import("./TinScene/TinScene").then((m) => ({ default: m.TinScene })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center bg-white/3 rounded-xl">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
      </div>
    ),
  }
)

interface Product {
  id:          string
  name:        string
  slug:        string
  price:       number
  description: string
  images:      { url: string; order: number }[]
}

const PLACEHOLDER_PRODUCTS = [
  { name: "DK Essential Tee — Forest",  price: 2499, seed: "Basil",    color: "#34d399" },
  { name: "DK Performance Tee — Stone", price: 2799, seed: "Mint",     color: "#9ca3af" },
  { name: "DK Zen Tee — Midnight",      price: 2999, seed: "Lavender", color: "#a78bfa" },
]

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

export function ProductsSection() {
  const { ref, inView }         = useInView(0.1)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setProducts(Array.isArray(data) ? data.slice(0, 3) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="relative py-28 bg-[#080c08] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div
        className="absolute -top-40 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(circle, #34d399, transparent)" }}
      />

      <div ref={ref} className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div
          className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          style={{
            opacity:    inView ? 1 : 0,
            transform:  inView ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s ease",
          }}
        >
          <div>
            <p
              className="mb-2 text-xs font-bold tracking-[0.35em] text-emerald-400 uppercase"
              style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
            >
              The Collection
            </p>
            <h2
              className="text-white"
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                fontSize:   "clamp(40px, 5vw, 72px)",
                lineHeight: 0.95,
              }}
            >
              The Seeded
              <br />
              <span className="text-emerald-400">Shirts</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="shrink-0 text-sm font-semibold text-white/40 hover:text-white/80 transition-colors border-b border-white/15 hover:border-white/40 pb-0.5"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            View all →
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-white/3 overflow-hidden animate-pulse">
                <div className="h-64 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded-lg bg-white/8" />
                  <div className="h-3 w-1/2 rounded-lg bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Placeholder cards */
          <div className="grid md:grid-cols-3 gap-5">
            {PLACEHOLDER_PRODUCTS.map((p, i) => (
              <div
                key={p.name}
                className="group rounded-2xl border border-white/8 bg-white/4 overflow-hidden hover:border-white/18 transition-all duration-300 hover:-translate-y-1"
                style={{
                  opacity:    inView ? 1 : 0,
                  transform:  inView ? "translateY(0)" : "translateY(32px)",
                  transition: `all 0.7s ease ${0.1 + i * 0.12}s`,
                }}
              >
                <div className="relative h-64 bg-gradient-to-br from-white/5 to-white/2 flex items-center justify-center overflow-hidden">
                  {/* Small non-interactive scene as thumbnail */}
                  <TinScene className="w-full h-full" />
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        borderColor: p.color + "40",
                        background:  p.color + "15",
                        color:       p.color,
                        fontFamily:  "var(--font-dm, 'DM Sans', sans-serif)",
                      }}
                    >
                      🌱 Includes {p.seed} Seeds
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3
                    className="mb-1 text-sm font-semibold text-white"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-xs text-white/35 mb-4"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    Bamboo-Spandex · Zero-Wrinkle · Aluminum Tin
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold text-white"
                      style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: 22 }}
                    >
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    <Link
                      href="/products"
                      className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-400/20 transition-all duration-200"
                      style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Real products */
          <div className="grid md:grid-cols-3 gap-5">
            {products.map((p, i) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group rounded-2xl border border-white/8 bg-white/4 overflow-hidden hover:border-white/18 transition-all duration-300 hover:-translate-y-1"
                style={{
                  opacity:    inView ? 1 : 0,
                  transform:  inView ? "translateY(0)" : "translateY(32px)",
                  transition: `all 0.7s ease ${0.1 + i * 0.12}s`,
                }}
              >
                <div className="relative h-64 bg-gradient-to-br from-white/5 to-white/2 overflow-hidden flex items-center justify-center">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0].url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <TinScene className="w-full h-full" />
                  )}
                </div>
                <div className="p-5">
                  <h3
                    className="mb-1 text-sm font-semibold text-white"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className="font-bold text-white"
                      style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: 22 }}
                    >
                      {formatINR(p.price)}
                    </span>
                    <span
                      className="text-xs font-semibold text-emerald-400"
                      style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                    >
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
