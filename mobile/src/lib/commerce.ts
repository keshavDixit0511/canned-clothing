export const PRODUCT_AVAILABILITY_STATUSES = [
  "COMING_SOON",
  "IN_STOCK",
  "OUT_OF_STOCK",
] as const

export type ProductAvailabilityStatus =
  (typeof PRODUCT_AVAILABILITY_STATUSES)[number]

export const PRODUCT_AVAILABILITY_META: Record<
  ProductAvailabilityStatus,
  { label: string; badge: string; purchasable: boolean }
> = {
  COMING_SOON: { label: "Coming Soon", badge: "amber", purchasable: false },
  IN_STOCK: { label: "In Stock", badge: "emerald", purchasable: true },
  OUT_OF_STOCK: { label: "Out of Stock", badge: "red", purchasable: false },
}

export function getProductAvailabilityMeta(
  status?: string | null,
  stock?: number | null
) {
  const meta = PRODUCT_AVAILABILITY_META[status as ProductAvailabilityStatus] ?? {
    label: "In Stock",
    badge: "emerald",
    purchasable: true,
  }

  if (meta.purchasable && typeof stock === "number" && stock <= 0) {
    return PRODUCT_AVAILABILITY_META.OUT_OF_STOCK
  }

  return meta
}

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "NOT_INTERESTED",
  "WAITLISTED",
  "CONVERTED",
] as const

export const LEAD_LIKED_CONCEPT_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "No" },
] as const

export const LEAD_WILLING_TO_PAY_RANGE_OPTIONS = [
  { value: "PRICE_999_1299", label: "₹999 - ₹1,299" },
  { value: "PRICE_1299_1599", label: "₹1,299 - ₹1,599" },
  { value: "PRICE_1599_1999", label: "₹1,599 - ₹1,999" },
  { value: "PRICE_1999_PLUS", label: "₹1,999+" },
] as const

export const LEAD_WOULD_RECOMMEND_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "No" },
] as const

export function getLeadStatusMeta(status?: string | null) {
  const meta: Record<string, { label: string; badge: string }> = {
    NEW: { label: "New", badge: "amber" },
    CONTACTED: { label: "Contacted", badge: "sky" },
    INTERESTED: { label: "Interested", badge: "emerald" },
    NOT_INTERESTED: { label: "Not Interested", badge: "red" },
    WAITLISTED: { label: "Waitlisted", badge: "violet" },
    CONVERTED: { label: "Converted", badge: "emerald" },
  }

  return meta[status ?? ""] ?? { label: "New", badge: "amber" }
}
