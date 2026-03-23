// components/cart/CartSummary.tsx
"use client"

import Link from "next/link"
import { useCartStore } from "@/store/cartStore"

interface CartSummaryProps {
  onCheckout?: () => void
}

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const { items } = useCartStore()

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax      = Math.round(subtotal * 0.18)
  const total    = subtotal + tax

  if (items.length === 0) return null

  return (
    <div className="border-t border-white/8 px-5 py-5 shrink-0 space-y-4">

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-white/50">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/50">
          <span>Shipping</span>
          <span className="text-emerald-400">Free</span>
        </div>
        <div className="flex justify-between text-sm text-white/50">
          <span>GST (18%)</span>
          <span>{formatINR(tax)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-white border-t border-white/8 pt-2">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>
      </div>

      {/* Eco nudge */}
      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-3.5 py-2.5 flex items-center gap-2">
        <span className="text-base">🌱</span>
        <p className="text-xs text-emerald-400/80">
          {items.length} tin{items.length > 1 ? "s" : ""} = {items.length} future plant{items.length > 1 ? "s" : ""}.
        </p>
      </div>

      {/* Checkout */}
      <Link
        href="/checkout"
        onClick={onCheckout}
        className="block w-full rounded-2xl py-3.5 text-center text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #059669, #34d399)",
          boxShadow:  "0 4px 20px rgba(52,211,153,0.25)",
        }}
      >
        Checkout — {formatINR(total)}
      </Link>

    </div>
  )
}

export default CartSummary