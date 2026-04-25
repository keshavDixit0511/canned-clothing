export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentProvider = "RAZORPAY" | "STRIPE"
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED"

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product: {
    name: string
    slug: string
    images: { url: string; order: number }[]
  }
}

export interface Payment {
  id: string
  orderId: string
  provider: PaymentProvider
  providerRef: string | null
  amount: number
  status: PaymentStatus
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  shippingName: string
  shippingPhone: string
  shippingAddr: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
  items: OrderItem[]
  payment: Pick<Payment, "status" | "provider"> | null
  createdAt: string
  updatedAt: string
}
