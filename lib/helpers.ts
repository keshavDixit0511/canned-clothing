import { CO2_KG_PER_PLANT, ECO_SCORE_PER_PLANT, PLANT_STAGE_POINTS } from "@/lib/constants"

// ─── Types (inline — mirrors your Prisma models) ───────────────────────────────

interface CartItemLike {
  quantity: number
  product: { price: number }
}

interface OrderItemLike {
  quantity: number
  price: number
}

type PlantStage = "SEEDED" | "SPROUT" | "GROWING" | "MATURE"

interface PlantLike {
  stage: PlantStage
}

// ─── Cart Helpers ─────────────────────────────────────────────────────────────

/**
 * Total item count across all cart items.
 */
export function getCartItemCount(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Subtotal before tax/shipping.
 */
export function getCartSubtotal(items: CartItemLike[]): number {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
}

/**
 * Calculate GST (default 18%).
 */
export function getCartTax(subtotal: number, rate = 0.18): number {
  return parseFloat((subtotal * rate).toFixed(2))
}

/**
 * Full cart total including tax and optional shipping.
 */
export function getCartTotal(
  items: CartItemLike[],
  shippingCost = 0,
  taxRate = 0.18
): number {
  const subtotal = getCartSubtotal(items)
  const tax = getCartTax(subtotal, taxRate)
  return parseFloat((subtotal + tax + shippingCost).toFixed(2))
}

/**
 * Free shipping threshold check.
 */
export function isFreeShipping(subtotal: number, threshold = 999): boolean {
  return subtotal >= threshold
}

// ─── Order Helpers ────────────────────────────────────────────────────────────

/**
 * Recalculate order total from its items (useful for display).
 */
export function getOrderTotal(items: OrderItemLike[]): number {
  return parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  )
}

/**
 * Returns true if an order can be cancelled by the user.
 * Only PENDING orders are cancellable.
 */
export function isOrderCancellable(
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
): boolean {
  return status === "PENDING"
}

/**
 * Returns a numeric step (1–5) for order status progress tracking.
 */
export function getOrderStep(
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
): number {
  const steps: Record<string, number> = {
    PENDING:   1,
    PAID:      2,
    SHIPPED:   3,
    DELIVERED: 4,
    CANCELLED: 0,
  }
  return steps[status] ?? 0
}

// ─── Plant / Eco Helpers ──────────────────────────────────────────────────────

/**
 * Estimated CO2 saved in kg based on number of mature plants.
 * Only mature plants are counted — they've completed the full cycle.
 */
export function calcCO2Saved(plants: PlantLike[]): number {
  const matureCount = plants.filter((p) => p.stage === "MATURE").length
  return parseFloat((matureCount * CO2_KG_PER_PLANT).toFixed(1))
}

/**
 * Total eco score from all plants based on their current stage.
 */
export function calcEcoScore(plants: PlantLike[]): number {
  return plants.reduce(
    (sum, plant) => sum + (PLANT_STAGE_POINTS[plant.stage] ?? 0),
    0
  )
}

/**
 * Eco score from registration count (matches your /api/eco logic).
 */
export function calcEcoScoreFromCount(plantCount: number): number {
  return plantCount * ECO_SCORE_PER_PLANT
}

/**
 * Returns the next stage for a plant, or null if already mature.
 */
export function getNextPlantStage(current: PlantStage): PlantStage | null {
  const order: PlantStage[] = ["SEEDED", "SPROUT", "GROWING", "MATURE"]
  const idx = order.indexOf(current)
  return idx < order.length - 1 ? order[idx + 1] : null
}

/**
 * Returns stage progress as a 0–1 ratio for progress bars.
 */
export function getPlantStageProgress(stage: PlantStage): number {
  const map: Record<PlantStage, number> = {
    SEEDED:  0.25,
    SPROUT:  0.5,
    GROWING: 0.75,
    MATURE:  1,
  }
  return map[stage]
}

/**
 * Groups a plant array by stage and returns counts.
 */
export function getPlantStageCounts(
  plants: PlantLike[]
): Record<PlantStage, number> {
  return {
    SEEDED:  plants.filter((p) => p.stage === "SEEDED").length,
    SPROUT:  plants.filter((p) => p.stage === "SPROUT").length,
    GROWING: plants.filter((p) => p.stage === "GROWING").length,
    MATURE:  plants.filter((p) => p.stage === "MATURE").length,
  }
}

// ─── QR Code Helper ───────────────────────────────────────────────────────────

/**
 * Builds the full scan URL for a plant's QR code.
 * Used when generating QR codes at checkout / plant registration.
 */
export function buildScanUrl(qrCode: string, baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "")
  return `${base}/scan/${qrCode}`
}

// ─── Image Helpers ────────────────────────────────────────────────────────────

/**
 * Returns the primary (lowest order) image URL for a product,
 * or a placeholder if no images exist.
 */
export function getPrimaryImage(
  images: { url: string; order: number }[],
  placeholder = "/images/placeholder.png"
): string {
  if (!images || images.length === 0) return placeholder
  return [...images].sort((a, b) => a.order - b.order)[0].url
}

// ─── Shipping Address Helper ──────────────────────────────────────────────────

interface ShippingAddress {
  shippingName: string
  shippingAddr: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
}

/**
 * Formats an order's shipping fields into a single readable string.
 */
export function formatShippingAddress(order: ShippingAddress): string {
  return [
    order.shippingName,
    order.shippingAddr,
    `${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ")
}