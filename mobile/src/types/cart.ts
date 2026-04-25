import type { ProductSummary } from "./product"

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: ProductSummary
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface CartStoreItem {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
}
