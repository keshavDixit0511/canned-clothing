import { describe, expect, it } from "vitest"
import { ORDER_STATUSES } from "@/lib/constants"
import { getOrderStatusMeta } from "@/lib/order-status"

describe("order status metadata", () => {
  it("maps PAID using the live runtime lifecycle", () => {
    expect(getOrderStatusMeta("PAID")).toEqual({
      key: "PAID",
      label: "Paid",
      color: "text-sky-400 bg-sky-400/10 border-sky-400/30",
    })
  })

  it("does not expose PROCESSING as a runtime order status", () => {
    expect(ORDER_STATUSES).not.toContain("PROCESSING")
    expect(getOrderStatusMeta("PROCESSING")).toEqual({
      key: "PENDING",
      label: "Pending",
      color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    })
  })
})
