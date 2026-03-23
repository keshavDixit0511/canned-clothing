"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useOrders } from "@/hooks/useOrders"
import { useCartStore } from "@/store/cartStore"

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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
          Loading your checkout...
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Your cart is empty</h1>
          <p className="text-white/60">
            Add a product before starting checkout.
          </p>
          <Link
            href="/products"
            className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1.3fr,0.9fr]">
        <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Shipping details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Full name
                <input
                  value={form.shippingName}
                  onChange={(e) => updateField("shippingName", e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3"
                />
              </label>

              <label className="block text-sm font-medium">
                Phone number
                <input
                  value={form.shippingPhone}
                  onChange={(e) => updateField("shippingPhone", e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3"
                />
              </label>

              <label className="block text-sm font-medium sm:col-span-2">
                Address
                <textarea
                  value={form.shippingAddr}
                  onChange={(e) => updateField("shippingAddr", e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3"
                  rows={4}
                />
              </label>

              <label className="block text-sm font-medium">
                City
                <input
                  value={form.shippingCity}
                  onChange={(e) => updateField("shippingCity", e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3"
                />
              </label>

              <label className="block text-sm font-medium">
                State
                <input
                  value={form.shippingState}
                  onChange={(e) => updateField("shippingState", e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3"
                />
              </label>

              <label className="block text-sm font-medium">
                Pincode
                <input
                  value={form.shippingZip}
                  onChange={(e) => updateField("shippingZip", e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3"
                />
              </label>

              <label className="block text-sm font-medium">
                Country
                <input
                  value={form.shippingCountry}
                  onChange={(e) => updateField("shippingCountry", e.target.value)}
                  className="mt-2 w-full rounded-lg border p-3"
                />
              </label>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          )}

          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white py-3 rounded-lg"
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Place Order And Pay"}
          </button>
        </div>

        <aside className="rounded-xl bg-white shadow-md p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Order summary</h2>
            <p className="text-sm text-black/60">
              Review your items before payment.
            </p>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-black/60">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatINR(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/60">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">GST (18%)</span>
              <span>{formatINR(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <p className="text-xs text-black/50">
            Payment is opened only after the server creates a valid order, so
            retries won&apos;t skip inventory or shipping validation.
          </p>
        </aside>
      </div>
    </div>
  )
}
