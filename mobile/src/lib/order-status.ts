export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export type RuntimeOrderStatus = (typeof ORDER_STATUSES)[number]

const DEFAULT_STATUS: RuntimeOrderStatus = "PENDING"

export function isRuntimeOrderStatus(status: string): status is RuntimeOrderStatus {
  return ORDER_STATUSES.includes(status as RuntimeOrderStatus)
}

export function getOrderStatusMeta(status: string) {
  const resolved = isRuntimeOrderStatus(status) ? status : DEFAULT_STATUS

  const labels: Record<RuntimeOrderStatus, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  }

  const colors: Record<RuntimeOrderStatus, string> = {
    PENDING: "amber",
    PAID: "sky",
    SHIPPED: "violet",
    DELIVERED: "emerald",
    CANCELLED: "red",
  }

  return {
    key: resolved,
    label: labels[resolved],
    color: colors[resolved],
  }
}
