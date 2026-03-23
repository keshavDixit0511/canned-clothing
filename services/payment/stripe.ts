// services/payment/stripe.ts

/**
 * Stripe payment service (secondary provider).
 * Install: bun add stripe
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatePaymentIntentInput {
  amount:      number   // INR
  currency?:   string
  orderId:     string
  customerEmail?: string
  metadata?:   Record<string, string>
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount:       number
  currency:     string
  status:       string
}

// ─── Client factory ───────────────────────────────────────────────────────────

async function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY must be set")

  const { default: Stripe } = await import("stripe")
  return new Stripe(secretKey, { apiVersion: "2026-02-25.clover" })
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Create a Stripe PaymentIntent.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<PaymentIntentResponse> {
  const stripe = await getStripe()

  const intent = await stripe.paymentIntents.create({
    amount:   Math.round(input.amount * 100), // Convert to paise/cents
    currency: input.currency ?? "inr",
    metadata: {
      orderId: input.orderId,
      ...input.metadata,
    },
    receipt_email: input.customerEmail,
  })

  return {
    clientSecret:    intent.client_secret!,
    paymentIntentId: intent.id,
    amount:          intent.amount,
    currency:        intent.currency,
    status:          intent.status,
  }
}

/**
 * Retrieve a PaymentIntent by ID.
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = await getStripe()
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Verify a Stripe webhook event signature.
 * Use in your webhook handler route.
 */
export async function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string
) {
  const stripe        = await getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set")

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
}

/**
 * Issue a refund for a PaymentIntent.
 */
export async function refundPaymentIntent(
  paymentIntentId: string,
  amountINR?:      number
) {
  const stripe = await getStripe()

  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount:         amountINR ? Math.round(amountINR * 100) : undefined,
  })
}

/**
 * Get the Stripe publishable key (safe to expose to client).
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set")
  return key
}