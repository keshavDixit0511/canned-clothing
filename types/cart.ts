// types/cart.ts

import type { ProductSummary } from "./product"

export interface CartItem {
  id:        string
  cartId:    string
  productId: string
  quantity:  number
  product:   ProductSummary
}

export interface Cart {
  id:        string
  userId:    string
  items:     CartItem[]
  createdAt: string
  updatedAt: string
}

// Client-side Zustand store item (no DB IDs needed)
export interface CartStoreItem {
  productId: string
  name:      string
  price:     number
  image:     string | null
  quantity:  number
}

export interface AddToCartInput {
  productId: string
  quantity:  number
}

export interface UpdateCartItemInput {
  cartItemId: string
  quantity:   number
}

// Derived cart totals
export interface CartTotals {
  subtotal: number
  tax:      number
  shipping: number
  total:    number
}