"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useOrders } from "@/hooks/useOrders"
import { useCartStore } from "@/store/cartStore"

export const dynamic = "force-dynamic"

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string
      amount: number
      currency: string
      name: string
      description: string
      order_id: string
      handler: (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => void
      prefill?: {
        name?: string
        contact?: string
      }
      theme?: {
        color?: string
      }
      modal?: {
        ondismiss?: () => void
      }
    }) => { open: () => void }
  }
}

type CheckoutForm = {
  shippingName: string
  shippingPhone: string
  shippingAddr: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
}

type CheckoutCartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: { url: string; order: number }[]
  }
}

const INITIAL_FORM: CheckoutForm = {
  shippingName: "",
  shippingPhone: "",
  shippingAddr: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  shippingCountry: "India",
}

const inputClassName =
  "mt-2 w-full rounded-2xl border border-white/10 bg-[#07110b] px-4 py-3 text-sm text-white/90 outline-none backdrop-blur-sm transition [color-scheme:dark] placeholder:text-white/28 focus:border-emerald-400/45 focus:bg-[#0b1710] focus:ring-4 focus:ring-emerald-400/10"

const labelClassName = "block text-sm font-semibold text-white/70"

const panelShell =
  "overflow-hidden rounded-[30px] border border-white/8 bg-[#08120d]/95 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl"

const chipClassName =
  "inline-flex items-center gap-2.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-4 py-1.5"

const checkoutSurfaceStyle = {
  backgroundColor: "rgba(8, 18, 13, 0.95)",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.38)",
  colorScheme: "dark",
} as const

const checkoutControlStyle = {
  backgroundColor: "#07110b",
  borderColor: "rgba(255, 255, 255, 0.12)",
  color: "rgba(255, 255, 255, 0.94)",
  caretColor: "#ffffff",
  colorScheme: "dark",
} as const

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false
  if (window.Razorpay) return true

  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const { createOrder, initiatePayment, verifyPayment } = useOrders()
  const clearCart = useCartStore((state) => state.clearCart)

  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([])
  const [loadingCart, setLoadingCart] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM)

  useEffect(() => {
    let mounted = true

    async function fetchCart() {
      try {
        const res = await fetch("/api/cart", { credentials: "include" })

        if (res.status === 401) {
          router.push("/login?redirect=/checkout")
          return
        }

        const data = await res.json()
        if (!mounted) return

        setCartItems(Array.isArray(data.items) ? data.items : [])
      } catch {
        if (!mounted) return
        setError("We couldn't load your cart. Please refresh and try again.")
      } finally {
        if (mounted) setLoadingCart(false)
      }
    }

    fetchCart()

    return () => {
      mounted = false
    }
  }, [router])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  )
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax

  function updateField<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    // A tiny helper keeps all form updates consistent and readable.
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleCheckout() {
    setSubmitting(true)
    setError("")
    setSuccessMessage("")

    try {
      const orderResult = await createOrder({
        ...form,
        paymentProvider: "RAZORPAY",
      })

      if (!orderResult.success || !orderResult.order) {
        setError(orderResult.error ?? "We couldn't create your order.")
        setSubmitting(false)
        return
      }

      const paymentResult = await initiatePayment(orderResult.order.id)
      if (!paymentResult.success || !paymentResult.rzpOrderId || !paymentResult.key) {
        setError(paymentResult.error ?? "We couldn't start payment.")
        setSubmitting(false)
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded || !window.Razorpay) {
        setError("Razorpay checkout failed to load. Please try again.")
        setSubmitting(false)
        return
      }

      const razorpay = new window.Razorpay({
        key: paymentResult.key,
        amount: paymentResult.amount ?? 0,
        currency: paymentResult.currency ?? "INR",
        name: "Canned Clothing",
        description: `Order ${orderResult.order.id.slice(-6).toUpperCase()}`,
        order_id: paymentResult.rzpOrderId,
        prefill: {
          name: form.shippingName,
          contact: form.shippingPhone,
        },
        theme: {
          color: "#10b981",
        },
        handler: async (response) => {
          const verification = await verifyPayment({
            orderId: orderResult.order!.id,
            rzpOrderId: response.razorpay_order_id,
            rzpPaymentId: response.razorpay_payment_id,
            rzpSignature: response.razorpay_signature,
          })

          if (!verification.success) {
            setError(verification.error ?? "Payment verification failed.")
            setSubmitting(false)
            return
          }

          clearCart()
          setCartItems([])
          setSuccessMessage("Payment verified. Your order has been placed successfully.")
          setSubmitting(false)
          router.push("/orders")
          router.refresh()
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
          },
        },
      })

      razorpay.open()
    } catch {
      setError("Checkout failed. Please try again.")
      setSubmitting(false)
    }
  }

  if (loadingCart) {
    return (
      <div className="checkout-dark relative min-h-screen overflow-hidden bg-[#060a06]" style={{ colorScheme: "dark", backgroundColor: "#060a06" }}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className={`${panelShell} p-8 text-center text-white/60`} style={checkoutSurfaceStyle}>
            Loading your checkout...
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-dark relative min-h-screen overflow-hidden bg-[#060a06]" style={{ colorScheme: "dark", backgroundColor: "#060a06" }}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className={`${panelShell} space-y-4 p-8 text-center`} style={checkoutSurfaceStyle}>
            <h1 className="text-3xl font-bold text-white">Your cart is empty</h1>
            <p className="text-white/60">
              Add a product before starting checkout.
            </p>
            <Link
              href="/products"
              className="inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-dark relative min-h-screen overflow-hidden bg-[#060a06]" style={{ colorScheme: "dark", backgroundColor: "#060a06" }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
        }}
      />
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-0 h-[340px] w-[720px] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(52,211,153,0.1), transparent 70%)" }}
        />
        <div
          className="absolute right-[-120px] top-40 h-[360px] w-[360px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 68%)" }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 60px)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-4">
          <span className={chipClassName}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Secure checkout
            </span>
          </span>
          <div className="space-y-2">
            <h1
              className="text-white leading-[0.9]"
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                fontSize: "clamp(44px, 7vw, 84px)",
              }}
            >
              READY TO
              <br />
              PLANT YOUR ORDER?
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
              Review your shipping details and complete payment in a checkout that matches the rest of the brand experience.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.18fr,0.82fr] lg:items-start">
          <div className={panelShell} style={checkoutSurfaceStyle}>
            <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.12),transparent_42%)] px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="py-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/90">
                    Shipping details
                  </p>
                  <h2
                    className="mt-2 text-white"
                    style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "clamp(28px, 4vw, 42px)" }}
                  >
                    DELIVERY INFORMATION
                  </h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Payment mode</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">Razorpay</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClassName}>
                  Full name
                  <input
                    value={form.shippingName}
                    onChange={(e) => updateField("shippingName", e.target.value)}
                    className={inputClassName}
                    style={checkoutControlStyle}
                    placeholder="Aman Verma"
                    autoComplete="name"
                  />
                </label>

                <label className={labelClassName}>
                  Phone number
                  <input
                    value={form.shippingPhone}
                    onChange={(e) => updateField("shippingPhone", e.target.value)}
                    className={inputClassName}
                    style={checkoutControlStyle}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </label>

                <label className={`${labelClassName} sm:col-span-2`}>
                  Address
                  <textarea
                    value={form.shippingAddr}
                    onChange={(e) => updateField("shippingAddr", e.target.value)}
                    className={`${inputClassName} min-h-32 resize-y`}
                    style={checkoutControlStyle}
                    placeholder="Apartment, street, area, landmark"
                    autoComplete="street-address"
                    rows={4}
                  />
                </label>

                <label className={labelClassName}>
                  City
                  <input
                    value={form.shippingCity}
                    onChange={(e) => updateField("shippingCity", e.target.value)}
                    className={inputClassName}
                    style={checkoutControlStyle}
                    placeholder="New Delhi"
                    autoComplete="address-level2"
                  />
                </label>

                <label className={labelClassName}>
                  State
                  <input
                    value={form.shippingState}
                    onChange={(e) => updateField("shippingState", e.target.value)}
                    className={inputClassName}
                    style={checkoutControlStyle}
                    placeholder="Delhi"
                    autoComplete="address-level1"
                  />
                </label>

                <label className={labelClassName}>
                  Pincode
                  <input
                    value={form.shippingZip}
                    onChange={(e) => updateField("shippingZip", e.target.value)}
                    className={inputClassName}
                    style={checkoutControlStyle}
                    placeholder="110001"
                    autoComplete="postal-code"
                  />
                </label>

                <label className={labelClassName}>
                  Country
                  <input
                    value={form.shippingCountry}
                    onChange={(e) => updateField("shippingCountry", e.target.value)}
                    className={inputClassName}
                    style={checkoutControlStyle}
                    placeholder="India"
                    autoComplete="country-name"
                  />
                </label>
              </div>

              {error && (
                <p className="rounded-[22px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {successMessage}
                </p>
              )}

              <button
                onClick={handleCheckout}
                className="group relative w-full overflow-hidden rounded-2xl px-5 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, #059669, #34d399)",
                  boxShadow: "0 10px 30px rgba(52,211,153,0.22)",
                }}
                disabled={submitting}
              >
                <span className="relative z-10">
                  {submitting ? "Processing..." : "Place Order And Pay"}
                </span>
                <span
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, #10b981, #6ee7b7)" }}
                />
              </button>
            </div>
          </div>

          <aside className={`${panelShell} p-6 sm:p-7 lg:sticky lg:top-24`} style={checkoutSurfaceStyle}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/90">
                Order summary
              </p>
              <h2
                className="mt-2 text-white"
                style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "clamp(28px, 4vw, 40px)" }}
              >
                FINAL REVIEW
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Review your items and final amount before continuing to Razorpay.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-black/20 px-4 py-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-white/90">{item.product.name}</p>
                    <p className="text-sm text-white/38">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-white">
                    {formatINR(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 rounded-[24px] border border-white/8 bg-black/20 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Subtotal</span>
                <span className="font-medium text-white/90">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">GST (18%)</span>
                <span className="font-medium text-white/90">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-3 text-base font-semibold text-white">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-emerald-400/12 bg-emerald-400/8 px-4 py-4 text-sm text-white/78">
              <p className="font-medium text-emerald-300">Secure payment flow</p>
              <p className="mt-1 text-white/48">
                Razorpay opens after order validation, which helps prevent mismatched totals or skipped checks.
              </p>
            </div>

            <p className="mt-5 text-xs leading-5 text-white/34">
              Need to change something first? You can still go back to your cart and update quantities before placing the order.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
