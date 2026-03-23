// services/shipping/shiprocket.ts

/**
 * Shiprocket shipping service.
 * Env: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD
 * Docs: https://apidocs.shiprocket.in
 */

const BASE_URL = "https://apiv2.shiprocket.in/v1/external"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShiprocketOrderInput {
  orderId:         string
  orderDate:       string  // ISO date
  channelId?:      string
  billingName:     string
  billingAddress:  string
  billingCity:     string
  billingState:    string
  billingPincode:  string
  billingCountry:  string
  billingPhone:    string
  billingEmail:    string
  shippingName:    string
  shippingAddress: string
  shippingCity:    string
  shippingState:   string
  shippingPincode: string
  shippingCountry: string
  shippingPhone:   string
  orderItems: {
    name:     string
    sku:      string
    units:    number
    sellingPrice: number
  }[]
  paymentMethod: "Prepaid" | "COD"
  subTotal:      number
  weight:        number  // kg
}

export interface ShiprocketTrackingResponse {
  trackingData: {
    shipmentId:   string
    status:       string
    statusCode:   string
    deliveryDate: string | null
    scans: {
      date:     string
      activity: string
      location: string
    }[]
  }
}

// ─── Auth token cache ─────────────────────────────────────────────────────────

let cachedToken: string | null       = null
let tokenExpiry: number              = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const email    = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (!email || !password) {
    throw new Error("SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set")
  }

  const res  = await fetch(`${BASE_URL}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error("Shiprocket authentication failed")

  const data    = await res.json()
  cachedToken   = data.token
  tokenExpiry   = Date.now() + (9 * 60 * 60 * 1000) // Tokens last 10h, refresh after 9h

  return cachedToken!
}

async function shiprocketFetch(
  endpoint: string,
  options:  RequestInit = {}
): Promise<any> {
  const token = await getToken()

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? `Shiprocket API error: ${res.status}`)
  }

  return res.json()
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Create a shipment order on Shiprocket.
 */
export async function createShipment(input: ShiprocketOrderInput) {
  return shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body:   JSON.stringify({
      order_id:          input.orderId,
      order_date:        input.orderDate,
      billing_customer_name:    input.billingName,
      billing_address:          input.billingAddress,
      billing_city:             input.billingCity,
      billing_state:            input.billingState,
      billing_pincode:          input.billingPincode,
      billing_country:          input.billingCountry,
      billing_phone:            input.billingPhone,
      billing_email:            input.billingEmail,
      shipping_is_billing:      false,
      shipping_customer_name:   input.shippingName,
      shipping_address:         input.shippingAddress,
      shipping_city:            input.shippingCity,
      shipping_state:           input.shippingState,
      shipping_pincode:         input.shippingPincode,
      shipping_country:         input.shippingCountry,
      shipping_phone:           input.shippingPhone,
      order_items:              input.orderItems.map((i) => ({
        name:          i.name,
        sku:           i.sku,
        units:         i.units,
        selling_price: i.sellingPrice,
      })),
      payment_method: input.paymentMethod,
      sub_total:      input.subTotal,
      weight:         input.weight,
    }),
  })
}

/**
 * Track a shipment by Shiprocket shipment ID or AWB.
 */
export async function trackShipment(
  shipmentId: string
): Promise<ShiprocketTrackingResponse> {
  return shiprocketFetch(`/courier/track/shipment/${shipmentId}`)
}

/**
 * Get serviceable pincodes for a courier partner.
 */
export async function checkServiceability(
  pickupPincode:    string,
  deliveryPincode:  string,
  weightKg:         number,
  codAmount?:       number
) {
  const params = new URLSearchParams({
    pickup_postcode:   pickupPincode,
    delivery_postcode: deliveryPincode,
    weight:            String(weightKg),
    cod:               codAmount ? "1" : "0",
  })

  return shiprocketFetch(`/courier/serviceability/?${params}`)
}

/**
 * Cancel a shipment.
 */
export async function cancelShipment(shipmentIds: string[]) {
  return shiprocketFetch("/orders/cancel", {
    method: "POST",
    body:   JSON.stringify({ ids: shipmentIds }),
  })
}

/**
 * Generate AWB (Airway Bill) for a shipment.
 */
export async function generateAWB(shipmentId: string, courierId: string) {
  return shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body:   JSON.stringify({ shipment_id: shipmentId, courier_id: courierId }),
  })
}