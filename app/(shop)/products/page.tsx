// app/(shop)/products/page.tsx
"use client"

export const dynamic = "force-dynamic"

import { Suspense, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Product {
  id:          string
  name:        string
  slug:        string
  price:       number
  description: string
  stock:       number
  seedType:    string
  activity:    string
  images:      { url: string; order: number }[]
}

// ── Filters based on Product.activity field ───────────────────────────────────
const ACTIVITY_FILTERS = [
  { label: "All Styles",   value: "all",     emoji: "✨" },
  { label: "Daily Wear",   value: "daily",   emoji: "🌿" },
  { label: "Gym",          value: "gym",     emoji: "💪" },
  { label: "Work",         value: "work",    emoji: "💼" },
  { label: "Outdoor",      value: "outdoor", emoji: "🏕️" },
  { label: "Yoga",         value: "yoga",    emoji: "🧘" },
]

const SORT_OPTIONS = [
  { label: "Newest",      value: "newest"     },
  { label: "Price: Low",  value: "price_asc"  },
  { label: "Price: High", value: "price_desc" },
  { label: "Name A–Z",    value: "name_asc"   },
]

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60)
    return () => clearTimeout(t)
  }, [index])

  const inStock      = product.stock > 0
  const primaryImage = product.images.sort((a, b) => a.order - b.order)[0]?.url ?? null

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3",
        "hover:border-white/18 hover:-translate-y-1 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    > 
      {/* Image */}
      <div className="relative h-64 bg-gradient-to-br from-white/5 to-white/2 overflow-hidden flex items-center justify-center">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-6xl">🥫</span>
            <span className="text-xs text-white/30 font-medium tracking-wider uppercase">
              DK Tin
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {!inStock && (
            <span className="rounded-full bg-black/80 border border-red-400/40 px-2.5 py-0.5 text-[10px] font-bold text-red-400 backdrop-blur-sm">
              Sold Out
            </span>
          )}
          {product.activity && (
            <span className="rounded-full bg-black/80 border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white/70 backdrop-blur-sm capitalize">
              {product.activity}
            </span>
          )}
        </div>

        {/* Seed surprise tag — top right */}
        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
            🌱 Seed Surprise
          </span>
        </div>
 
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick view on hover */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-bold text-white">
            View Details →
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white/85 mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-xs text-white/35 mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span
            className="text-xl font-black text-white"
            style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
          >
            {formatINR(product.price)}
          </span>
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-xl border transition-all duration-200",
            inStock
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 group-hover:bg-emerald-400/20"
              : "border-white/10 bg-white/5 text-white/25"
          )}>
            {inStock ? "Shop Now →" : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 overflow-hidden animate-pulse">
      <div className="h-64 bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/8 rounded-lg w-3/4" />
        <div className="h-3 bg-white/5 rounded-lg w-full" />
        <div className="h-3 bg-white/5 rounded-lg w-2/3" />
        <div className="flex justify-between mt-3">
          <div className="h-6 bg-white/8 rounded-lg w-20" />
          <div className="h-6 bg-white/8 rounded-lg w-24" />
        </div>
      </div>
    </div>
  )
}

function ProductsPageContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState(searchParams.get("search")   ?? "")
  const [activity, setActivity] = useState(searchParams.get("activity") ?? "all")
  const [sort, setSort]         = useState(searchParams.get("sort")     ?? "newest")

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search)                params.set("search",   search)
      if (activity !== "all")    params.set("activity", activity)
      if (sort !== "newest")     params.set("sort",     sort)

      const res  = await fetch(`/api/products?${params.toString()}`)
      const data = res.ok ? await res.json() : []
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [search, activity, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (search)             params.set("search",   search)
    if (activity !== "all") params.set("activity", activity)
    if (sort !== "newest")  params.set("sort",     sort)
    router.replace(`/products?${params.toString()}`, { scroll: false })
  }, [search, activity, sort, router])

  const clearFilters = () => {
    setSearch("")
    setActivity("all")
    setSort("newest")
  }

  const hasFilters = search || activity !== "all" || sort !== "newest"

  return (
    <div className="min-h-screen bg-[#060a06] pb-20">
      {/* Ambient */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-5"
        style={{ background: "radial-gradient(ellipse, #34d399, transparent)" }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 space-y-8">

        {/* ── Header ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-1">
            DK Collection
          </p>
          <h1
            className="text-4xl sm:text-6xl text-white leading-none"
            style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
          >
            The Seeded Shirts
          </h1>
          <p className="mt-2 text-sm text-white/40 max-w-lg">
            Every shirt arrives in a brushed aluminum tin — with a seed surprise inside.
            Wear it. Plant it. Watch it grow.
          </p>
        </div>

        {/* ── Search + Sort ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shirts..."
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-emerald-400/40 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/70 [color-scheme:dark] focus:outline-none focus:border-emerald-400/40 transition-colors"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* ── Activity filter pills ── */}
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActivity(f.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-bold transition-all duration-200",
                activity === f.value
                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                  : "border-white/10 bg-white/4 text-white/40 hover:text-white/70 hover:border-white/20"
              )}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        {/* ── Seed surprise info strip ── */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-3">
          <span className="text-xl">🌱</span>
          <p className="text-sm text-emerald-400/80">
            <span className="font-bold text-emerald-400">Every tin includes a seed surprise.</span>
            {" "}We curate the perfect seed for each shirt — scan the QR on delivery to find out what&apos;s growing inside yours.
          </p>
        </div>

        {/* ── Results count + clear ── */}
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">
              {products.length} shirt{products.length !== 1 ? "s" : ""} found
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-white/40 hover:text-white/70 underline transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <p className="text-5xl mb-4">🥫</p>
            <h2
              className="text-3xl text-white mb-2"
              style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
            >
              No Shirts Found
            </h2>
            <p className="text-sm text-white/40 mb-6 max-w-xs">
              {hasFilters
                ? "Try adjusting your filters or search term."
                : "Products are coming soon. Check back shortly."
              }
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-xl border border-white/15 bg-white/6 px-5 py-2.5 text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function ProductsPage() {
  // Next 16 requires search-param consumers to sit behind Suspense during prerender.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060a06]" />}>
      <ProductsPageContent />
    </Suspense>
  )
}
