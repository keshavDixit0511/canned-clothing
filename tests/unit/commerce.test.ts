import { describe, expect, it } from "vitest"
import {
  getLeadStatusMeta,
  getLeadWillingToPayRangeLabel,
  getProductAvailabilityMeta,
} from "@/lib/commerce"

describe("commerce helpers", () => {
  it("marks coming soon products as non-purchasable", () => {
    expect(getProductAvailabilityMeta("COMING_SOON")).toEqual({
      label: "Coming Soon",
      badge: "amber",
      purchasable: false,
    })
  })

  it("labels lead follow-up statuses and price ranges", () => {
    expect(getLeadStatusMeta("WAITLISTED")).toEqual({
      label: "Waitlisted",
      badge: "violet",
    })
    expect(getLeadWillingToPayRangeLabel("PRICE_1299_1599")).toBe("₹1,299 - ₹1,599")
  })
})
