import {
  ORDER_STATUSES,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "@/lib/constants"

export type RuntimeOrderStatus = (typeof ORDER_STATUSES)[number]

const DEFAULT_STATUS: RuntimeOrderStatus = "PENDING"

export function isRuntimeOrderStatus(status: string): status is RuntimeOrderStatus {
  return ORDER_STATUSES.includes(status as RuntimeOrderStatus)
}

export function getOrderStatusMeta(status: string) {
  const resolved = isRuntimeOrderStatus(status) ? status : DEFAULT_STATUS

  return {
    key: resolved,
    label: ORDER_STATUS_LABELS[resolved],
    color: ORDER_STATUS_COLORS[resolved],
  }
}
