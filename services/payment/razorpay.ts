// services/payment/razorpay.ts

/**
 * Razorpay payment service.
 * Install: bun add razorpay
 * Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 */

import crypto from "crypto"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateRazorpayOrderInput {
  amount:   number  // INR (not paise — converted internally)
  currency?: string
  receipt:  string  // Order ID from DB
  notes?:   Record<string, string>
}

export interface RazorpayOrderResponse {
  id:       string
  amount:   number  // paise
  currency: string
  receipt:  string
  status:   string
}

export interface VerifySignatureInput {
  razorpayOrderId:   string
  razorpayPaymentId: string
  razorpaySignature: string
}

// ─── Client factory ───────────────────────────────────────────────────────────

function getClient() {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set")
  }

  // Dynamic import to avoid issues in environments without the package
  return {
    keyId,
    keySecret,
    async getInstance() {
      const Razorpay = (await import("razorpay")).default
      return new Razorpay({ key_id: keyId, key_secret: keySecret })
    },
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Create a Razorpay order.
 * Amount is in INR — converted to paise internally.
 */
export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrderResponse> {
  const client   = getClient()
  const instance = await client.getInstance()

  const order = await instance.orders.create({
    amount:   Math.round(input.amount * 100), // Convert to paise
    currency: input.currency ?? "INR",
    receipt:  input.receipt,
    notes:    input.notes,
  })

  return {
    id:       order.id,
    amount:   order.amount as number,
    currency: order.currency,
    receipt:  order.receipt ?? input.receipt,
    status:   order.status,
  }
}

/**
 * Verify Razorpay payment signature using HMAC-SHA256.
 * Returns true if signature is valid.
 */
export function verifyRazorpaySignature(input: VerifySignatureInput): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET not set")

  const body     = `${input.razorpayOrderId}|${input.razorpayPaymentId}`
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex")

  return expected === input.razorpaySignature
}

/**
 * Fetch payment details by Razorpay payment ID.
 */
export async function fetchPaymentDetails(razorpayPaymentId: string) {
  const client   = getClient()
  const instance = await client.getInstance()
  return instance.payments.fetch(razorpayPaymentId)
}

/**
 * Issue a full or partial refund.
 */
export async function refundPayment(
  razorpayPaymentId: string,
  amountINR?:        number  // If not provided, full refund
) {
  const client   = getClient()
  const instance = await client.getInstance()

  return instance.payments.refund(razorpayPaymentId, {
    amount: amountINR ? Math.round(amountINR * 100) : undefined,
  })
}

/**
 * Get the Razorpay public key ID (safe to expose to client).
 */
export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID
  if (!keyId) throw new Error("RAZORPAY_KEY_ID not set")
  return keyId
}