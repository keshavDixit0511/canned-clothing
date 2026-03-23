// components/cart/CartItem.tsx
"use client"

import Image from "next/image"
import { useCartStore } from "@/store/cartStore"

interface CartItemProps {
  item: {
    productId: string
    name:      string
    price:     number
    quantity:  number
    image:     string | null
  }
}

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()

  return (
    <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/3 p-3">

      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 rounded-xl border border-white/8 bg-white/5 overflow-hidden flex items-center justify-center">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="text-2xl">🥫</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/85 truncate mb-1">
          {item.name}
        </p>
        <p className="text-xs font-bold text-emerald-400">
          {formatINR(item.price)}
        </p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
              className="h-6 w-6 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              −
            </button>
            <span className="w-6 text-center text-xs font-bold text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="h-6 w-6 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              +
            </button>
          </div>

          <span className="text-xs font-bold text-white/50 ml-auto">
            {formatINR(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.productId)}
        className="shrink-0 h-6 w-6 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors"
        aria-label="Remove item"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default CartItem
