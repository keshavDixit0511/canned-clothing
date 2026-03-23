// features/cart/cart.types.ts

export interface CartItemInput {
  productId: string
  quantity:  number
}

export interface CartItemUpdateInput {
  cartItemId: string
  quantity:   number
}

export interface CartProductInfo {
  id:     string
  name:   string
  slug:   string
  price:  number
  stock:  number
  images: { url: string; order: number }[]
}

export interface CartItemResponse {
  id:        string
  cartId:    string
  productId: string
  quantity:  number
  product:   CartProductInfo
}

export interface CartResponse {
  id:        string
  userId:    string
  items:     CartItemResponse[]
  createdAt: string
  updatedAt: string
}