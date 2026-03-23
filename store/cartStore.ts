// store/cartStore.ts

import { create } from "zustand"

// Matches schema CartItem — no size field exists in Prisma schema
type CartItem = {
  productId: string
  name:      string
  price:     number
  image:     string | null  // nullable — not all products have images
  quantity:  number
}

type CartState = {
  items:          CartItem[]
  isOpen:         boolean
  openCart:       () => void
  closeCart:      () => void
  setItems:       (items: CartItem[]) => void
  addItem:        (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem:     (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart:      () => void
}

export const useCartStore = create<CartState>((set) => ({

  items:  [],
  isOpen: false,

  openCart:  () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setItems:  (items) => set({ items }),

  // If product already in cart — increment quantity instead of duplicating
  addItem: (item) =>
    set((state) => {
      const qty      = item.quantity ?? 1
      const existing = state.items.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        }
      }
      return {
        items: [...state.items, { ...item, quantity: qty }],
      }
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      ),
    })),

  clearCart: () => set({ items: [] }),

}))
