// features/orders/order.types.ts

export interface ShippingDetails {
  shippingName:    string
  shippingPhone:   string
  shippingAddr:    string
  shippingCity:    string
  shippingState:   string
  shippingZip:     string
  shippingCountry: string
}

export interface CreateOrderInput extends ShippingDetails {
  paymentProvider: "RAZORPAY" | "STRIPE"
}

export interface OrderItemResponse {
  id:        string
  productId: string
  quantity:  number
  price:     number
  product: {
    name:   string
    slug:   string
    images: { url: string; order: number }[]
  }
}

export interface OrderResponse {
  id:              string
  userId:          string
  status:          string
  totalAmount:     number
  createdAt:       string
  updatedAt:       string
  shippingName:    string
  shippingPhone:   string
  shippingAddr:    string
  shippingCity:    string
  shippingState:   string
  shippingZip:     string
  shippingCountry: string
  items:           OrderItemResponse[]
  payment:         { status: string; provider: string } | null
}