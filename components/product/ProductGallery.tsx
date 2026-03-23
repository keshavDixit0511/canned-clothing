"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Matches schema: ProductImage { url, order }
interface ProductImage {
  url: string
  order: number
}

interface ProductGalleryProps {
  images: ProductImage[]
  productName?: string
}

export function ProductGallery({ images, productName = "Product" }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.order - b.order)
  const [activeIdx, setActiveIdx] = useState(0)
  const active = sorted[activeIdx]

  if (sorted.length === 0) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-white/5 to-white/2">
        <span className="text-8xl">ðŸ¥«</span>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 80% 80%, rgba(52,211,153,0.08), transparent 60%)" }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Keep the wrapper relative so next/image can preserve the gallery layout without shifting. */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-white/5 to-white/2">
        <Image
          key={active.url}
          src={active.url}
          alt={`${productName} image ${activeIdx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 80% 80%, rgba(52,211,153,0.08), transparent 60%)" }}
        />

        {sorted.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white/60 backdrop-blur-sm">
            {activeIdx + 1} / {sorted.length}
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all duration-200",
                i === activeIdx
                  ? "scale-105 border-emerald-400/60 ring-1 ring-emerald-400/30"
                  : "border-white/10 opacity-60 hover:border-white/25 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
