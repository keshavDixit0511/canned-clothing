// hooks/useOrders.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { getErrorMessage } from "@/lib/error-message"

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus   = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED"

export interface OrderProduct {
  id:     string
  name:   string
  slug:   string
  images: { url: string; order: number }[]
}

export interface OrderItem {
  id:        string
  productId: string
  quantity:  number
  price:     number
  product:   OrderProduct
}

export interface OrderPayment {
  id:          string
  provider:    "RAZORPAY" | "STRIPE"
  providerRef: string | null
  amount:      number
  status:      PaymentStatus
}

export interface Order {
  id:              string
  status:          OrderStatus
  totalAmount:     number
  shippingName:    string
  shippingPhone:   string
  shippingAddr:    string
  shippingCity:    string
  shippingState:   string
  shippingZip:     string
  shippingCountry: string
  items:           OrderItem[]
  payment:         OrderPayment | null
  createdAt:       string
  updatedAt:       string
}

export interface CreateOrderPayload {
  shippingName:    string
  shippingPhone:   string
  shippingAddr:    string
  shippingCity:    string
  shippingState:   string
  shippingZip:     string
  shippingCountry: string
  paymentProvider: "RAZORPAY" | "STRIPE"
}

interface OrdersState {
  orders:  Order[]
  loading: boolean
  error:   string | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrders() {
  const [state, setState] = useState<OrdersState>({
    orders:  [],
    loading: true,
    error:   null,
  })

  // ── Fetch all orders ──────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch("/api/orders", { credentials: "include" })
      if (!res.ok) {
        if (res.status === 401) {
          setState({ orders: [], loading: false, error: null })
          return
        }
        throw new Error("Failed to fetch orders")
      }
      const data = await res.json()
      setState({ orders: Array.isArray(data) ? data : [], loading: false, error: null })
    } catch (error: unknown) {
      setState((s) => ({ ...s, loading: false, error: getErrorMessage(error, "Failed to load orders") }))
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // ── Create order ──────────────────────────────────────────────────────────
  const createOrder = useCallback(
    async (payload: CreateOrderPayload): Promise<{ success: boolean; order?: Order; error?: string }> => {
      try {
        const res = await fetch("/api/orders", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error ?? "Failed to create order" }

        // Optimistically prepend to list
        setState((s) => ({ ...s, orders: [data, ...s.orders] }))
        return { success: true, order: data }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    []
  )

  // ── Initiate Razorpay payment ─────────────────────────────────────────────
  const initiatePayment = useCallback(
    async (orderId: string): Promise<{
      success: boolean
      rzpOrderId?: string
      amount?: number
      currency?: string
      key?: string
      error?: string
    }> => {
      try {
        const res = await fetch("/api/payment", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify({ orderId }),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error ?? "Payment initiation failed" }
        return {
          success:    true,
          rzpOrderId: data.rzpOrderId,
          amount:     data.amount,
          currency:   data.currency,
          key:        data.key,
        }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    []
  )

  // ── Verify Razorpay payment ───────────────────────────────────────────────
  const verifyPayment = useCallback(
    async (params: {
      orderId:      string
      rzpOrderId:   string
      rzpPaymentId: string
      rzpSignature: string
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/payment", {
          method:      "PATCH",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(params),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error ?? "Payment verification failed" }

        // Refresh orders so status updates to PAID
        await fetchOrders()
        return { success: true }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    [fetchOrders]
  )

  // ── Derived ───────────────────────────────────────────────────────────────
  const getOrderById = useCallback(
    (id: string) => state.orders.find((o) => o.id === id) ?? null,
    [state.orders]
  )

  const pendingOrders   = state.orders.filter((o) => o.status === "PENDING")
  const completedOrders = state.orders.filter((o) => o.status === "DELIVERED")

  return {
    orders:          state.orders,
    loading:         state.loading,
    error:           state.error,
    pendingOrders,
    completedOrders,
    getOrderById,
    createOrder,
    initiatePayment,
    verifyPayment,
    refetch:         fetchOrders,
  }
}
