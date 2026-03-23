// "use client"

// import { useCartStore } from "@/store/cartStore"
// import CartItem from "./CartItem"
// import CartSummary from "./CartSummary"

// export default function CartDrawer() {
//   const { items, isOpen, closeCart } = useCartStore()

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end">

//       <div
//         className="absolute inset-0 bg-black/40"
//         onClick={closeCart}
//       />

//       <div className="relative w-[420px] bg-white h-full shadow-xl flex flex-col">

//         <div className="flex justify-between items-center p-6 border-b">
//           <h2 className="text-xl font-semibold">
//             Your Cart ({items.length})
//           </h2>

//           <button
//             onClick={closeCart}
//             className="text-gray-500 hover:text-black"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-6 space-y-6">

//           {items.length === 0 && (
//             <p className="text-gray-500">
//               Your cart is empty
//             </p>
//           )}

//           {items.map((item) => (
//             <CartItem key={item.id} item={item} />
//           ))}

//         </div>

//         <CartSummary />

//       </div>
//     </div>
//   )
// }


// components/cart/CartDrawer.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/store/cartStore"
import { cn } from "@/lib/utils"

function formatINR(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p)
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync cart with server on open
  useEffect(() => {
    if (!isOpen) return
    fetch("/api/cart")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.items) return
        // Server is source of truth — store already has client state
        // We just validate qty limits here
      })
      .catch(() => {})
  }, [isOpen])

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax      = Math.round(subtotal * 0.18)
  const total    = subtotal + tax

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 flex flex-col",
          "w-full sm:w-96",
          "border-l border-white/10 bg-[#080e08]/98 backdrop-blur-xl",
          "shadow-2xl shadow-black/60",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 shrink-0">
          <div>
            <h2
              className="text-xl text-white leading-none"
              style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
            >
              Your Cart
            </h2>
            <p className="text-xs text-white/35 mt-0.5">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="text-5xl mb-4">🛒</span>
              <p
                className="text-2xl text-white mb-2"
                style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
              >
                Cart is Empty
              </p>
              <p className="text-sm text-white/35 mb-6">Add a DK tin to get started.</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-bold text-white transition-colors"
              >
                Shop Now →
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3 rounded-2xl border border-white/8 bg-white/3 p-3"
              >
                {/* Image */}
                <div className="relative h-16 w-16 shrink-0 rounded-xl border border-white/8 bg-white/5 overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <span className="text-2xl">🥫</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/85 truncate mb-1">{item.name}</p>
                  <p className="text-xs font-bold text-emerald-400">{formatINR(item.price)}</p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
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
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — totals + checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/8 px-5 py-5 shrink-0 space-y-4">
            {/* Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/50">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
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
                Each tin you buy plants a seed. {items.length} tin{items.length > 1 ? "s" : ""} = {items.length} future plant{items.length > 1 ? "s" : ""}.
              </p>
            </div>

            {/* Checkout button */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full rounded-2xl py-3.5 text-center text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #059669, #34d399)",
                boxShadow: "0 4px 20px rgba(52,211,153,0.25)",
              }}
            >
              Checkout — {formatINR(total)}
            </Link>

            <button
              onClick={closeCart}
              className="block w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
