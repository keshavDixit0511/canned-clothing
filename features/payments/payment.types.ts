// features/payments/payment.types.ts

export interface InitiatePaymentInput {
  orderId: string
}

export interface InitiatePaymentResponse {
  razorpayOrderId: string
  amount:          number   // in paise
  currency:        string
  keyId:           string
}

export interface VerifyPaymentInput {
  orderId:           string
  razorpayOrderId:   string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface PaymentResponse {
  id:          string
  orderId:     string
  provider:    string
  providerRef: string | null
  amount:      number
  status:      string
  createdAt:   Date
}