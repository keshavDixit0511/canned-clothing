"use client"

import { useCallback, useEffect, useState } from "react"
import { useCartStore } from "@/store/cartStore"
import { getErrorMessage } from "@/lib/error-message"

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  images: { url: string; order: number }[]
}

export interface CartItemData {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: CartProduct
}

interface CartState {
  items: CartItemData[]
  cartId: string | null
  loading: boolean
  error: string | null
}

export function useCart() {
  const store = useCartStore()
  const setStoreItems = useCartStore((state) => state.setItems)
  const clearStoreCart = useCartStore((state) => state.clearCart)

  const [state, setState] = useState<CartState>({
    items: [],
    cartId: null,
    loading: true,
    error: null,
  })

  const fetchCart = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))

    try {
      const res = await fetch("/api/cart", { credentials: "include" })
      if (!res.ok) {
        if (res.status === 401) {
          clearStoreCart()
          setState({ items: [], cartId: null, loading: false, error: null })
          return
        }

        throw new Error("Failed to fetch cart")
      }

      const data = await res.json()
      const normalizedItems = Array.isArray(data.items)
        ? data.items.map((item: CartItemData) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0]?.url ?? null,
            quantity: item.quantity,
          }))
        : []

      // Keep the shared cart store aligned with the persisted API response so
      // badges, drawers, and checkout all read from the same source of truth.
      setStoreItems(normalizedItems)
      setState({
        items: data.items ?? [],
        cartId: data.cartId,
        loading: false,
        error: null,
      })
    } catch (error: unknown) {
      setState((current) => ({
        ...current,
        loading: false,
        error: getErrorMessage(error, "Failed to load cart"),
      }))
    }
  }, [clearStoreCart, setStoreItems])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = useCallback(
    async (productId: string, quantity = 1): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId, quantity }),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error ?? "Failed to add item" }

        store.addItem({
          productId,
          name: data.product?.name ?? "",
          price: data.product?.price ?? 0,
          image: data.product?.images?.[0]?.url ?? null,
          quantity,
        })
        await fetchCart()
        return { success: true }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    [fetchCart, store]
  )

  const removeItem = useCallback(
    async (productId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId }),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error ?? "Failed to remove" }

        store.removeItem(productId)
        await fetchCart()
        return { success: true }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    [fetchCart, store]
  )

  // Quantity updates intentionally depend on removeItem because decrementing
  // below 1 should follow the same server-backed removal path.
  const updateQuantity = useCallback(
    async (productId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
      if (quantity < 1) return removeItem(productId)

      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId, quantity }),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error ?? "Failed to update" }

        store.updateQuantity(productId, quantity)
        await fetchCart()
        return { success: true }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    [fetchCart, removeItem, store]
  )

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  return {
    items: state.items,
    cartId: state.cartId,
    loading: state.loading,
    error: state.error,
    itemCount,
    subtotal,
    tax,
    total,
    isEmpty: state.items.length === 0,
    isOpen: store.isOpen,
    openCart: store.openCart,
    closeCart: store.closeCart,
    addItem,
    updateQuantity,
    removeItem,
    refetch: fetchCart,
  }
}
