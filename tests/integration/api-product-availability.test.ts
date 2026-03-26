import { beforeEach, describe, expect, it, vi } from "vitest"

const requireAdminSession = vi.fn()
const productUpdate = vi.fn()

vi.mock("@/lib/auth", () => ({
  requireAdminSession,
  isAuthError: (error: unknown) =>
    Boolean(
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
    ),
}))

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    product: {
      update: productUpdate,
    },
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/products/[slug]/route")
}

describe("PATCH /api/products/[slug]", () => {
  beforeEach(() => {
    requireAdminSession.mockReset()
    productUpdate.mockReset()
  })

  it("persists product availability status", async () => {
    const { PATCH } = await loadRoute()

    requireAdminSession.mockResolvedValue({
      userId: "admin_1",
      email: "admin@example.com",
      role: "ADMIN",
    })
    productUpdate.mockResolvedValue({
      id: "product_1",
      availabilityStatus: "COMING_SOON",
    })

    const response = await PATCH(
      new Request("http://localhost/api/products/dk-essential", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityStatus: "COMING_SOON",
        }),
      }) as never,
      { params: Promise.resolve({ slug: "dk-essential" }) } as never
    )

    expect(response.status).toBe(200)
    expect(productUpdate).toHaveBeenCalledWith({
      where: { slug: "dk-essential" },
      data: {
        availabilityStatus: "COMING_SOON",
      },
      include: { images: { orderBy: { order: "asc" } } },
    })
  })
})
