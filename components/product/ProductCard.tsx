// components/product/ProductCard.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Matches schema: ProductImage { url, order }
interface ProductImage {
  url:   string
  order: number
}

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

interface ProductCardProps {
  product: Product
  index?:  number
}

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const inStock       = product.stock > 0
  const primaryImage  = product.images
    .sort((a, b) => a.order - b.order)[0]?.url ?? null

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3",
        "hover:border-white/18 hover:-translate-y-1 transition-all duration-300",
      )}
      style={{
        opacity:    1,
        animation: `fadeUp 0.5s ease ${index * 60}ms both`,
      }}
    >
      {/* Image */}
      <div className="relative h-56 bg-gradient-to-br from-white/5 to-white/2 overflow-hidden flex items-center justify-center">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-6xl">🥫</span>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {!inStock && (
            <span className="rounded-full bg-black/70 border border-red-400/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
              Sold Out
            </span>
          )}
          {product.seedType && (
            <span className="rounded-full bg-black/70 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              🌱 {product.seedType}
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

export default ProductCard
