import { beforeEach, describe, expect, it, vi } from "vitest"

const productFindUnique = vi.fn()
const leadCreate = vi.fn()
const leadFindUnique = vi.fn()
const leadUpdate = vi.fn()
const requireAdminSession = vi.fn()

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    product: {
      findUnique: productFindUnique,
    },
    productInterestLead: {
      create: leadCreate,
      findUnique: leadFindUnique,
      update: leadUpdate,
    },
  },
}))

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

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/leads/route")
}

async function loadDetailRoute() {
  vi.resetModules()
  return import("@/app/api/leads/[id]/route")
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    productFindUnique.mockReset()
    leadCreate.mockReset()
    leadFindUnique.mockReset()
    leadUpdate.mockReset()
    requireAdminSession.mockReset()
  })

  it("creates a product interest lead", async () => {
    const { POST } = await loadRoute()

    productFindUnique.mockResolvedValue({ id: "product_1" })
    leadCreate.mockResolvedValue({ id: "lead_1" })

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "product_1",
          name: "Aman Verma",
          email: "aman@example.com",
          phone: "9876543210",
          city: "Mumbai",
          likedConcept: "YES",
          willingToPayRange: "PRICE_1299_1599",
          wouldRecommend: "YES",
          comment: "Looks great",
        }),
      }) as never
    )

    expect(response.status).toBe(201)
    expect(leadCreate).toHaveBeenCalledWith({
      data: {
        productId: "product_1",
        name: "Aman Verma",
        email: "aman@example.com",
        phone: "9876543210",
        city: "Mumbai",
        likedConcept: "YES",
        willingToPayRange: "PRICE_1299_1599",
        wouldRecommend: "YES",
        comment: "Looks great",
      },
    })
  })
})

describe("PATCH /api/leads/[id]", () => {
  beforeEach(() => {
    productFindUnique.mockReset()
    leadCreate.mockReset()
    leadFindUnique.mockReset()
    leadUpdate.mockReset()
    requireAdminSession.mockReset()
  })

  it("updates lead follow-up status and notes for admins", async () => {
    const { PATCH } = await loadDetailRoute()

    requireAdminSession.mockResolvedValue({
      userId: "admin_1",
      email: "admin@example.com",
      role: "ADMIN",
    })
    leadFindUnique.mockResolvedValue({ id: "lead_1" })
    leadUpdate.mockResolvedValue({ id: "lead_1", status: "CONTACTED" })

    const response = await PATCH(
      new Request("http://localhost/api/leads/lead_1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONTACTED",
          adminNotes: "Called and left a message",
        }),
      }) as never,
      { params: Promise.resolve({ id: "lead_1" }) } as never
    )

    expect(response.status).toBe(200)
    expect(leadUpdate).toHaveBeenCalledWith({
      where: { id: "lead_1" },
      data: {
        status: "CONTACTED",
        adminNotes: "Called and left a message",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            availabilityStatus: true,
          },
        },
      },
    })
  })
})
