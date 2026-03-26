import { describe, expect, it } from "vitest"
import { createProductSchema, updateProductSchema } from "@/lib/validators"

describe("product validation", () => {
  it("accepts site-relative image paths for product images", () => {
    const payload = {
      name: "Test Tee",
      slug: "test-tee",
      description: "A short description that is long enough.",
      price: 1999,
      stock: 5,
      availabilityStatus: "COMING_SOON",
      activity: "daily",
      seedType: "Basil",
      images: [
        { url: "/products/tee.svg", order: 0 },
        { url: "https://example.com/hero.jpg", order: 1 },
      ],
    }

    expect(createProductSchema.parse(payload).images).toHaveLength(2)
    expect(updateProductSchema.parse({ images: payload.images }).images).toHaveLength(2)
  })
})
