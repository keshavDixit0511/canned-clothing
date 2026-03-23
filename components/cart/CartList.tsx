// components/cart/CartList.tsx
"use client"

import Link from "next/link"
import { useCartStore } from "@/store/cartStore"
import { CartItem } from "./CartItem"

interface CartListProps {
  onItemClick?: () => void
}

export function CartList({ onItemClick }: CartListProps) {
  const { items } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-5xl mb-4">🛒</span>
        <p
          className="text-2xl text-white mb-2"
          style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
        >
          Cart is Empty
        </p>
        <p className="text-sm text-white/35 mb-6">
          Add a DK tin to get started.
        </p>
        <Link
          href="/products"
          onClick={onItemClick}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-bold text-white transition-colors"
        >
          Shop Now →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartItem key={item.productId} item={item} />
      ))}
    </div>
  )
}

export default CartList