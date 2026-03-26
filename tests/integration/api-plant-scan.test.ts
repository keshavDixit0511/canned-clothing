import { beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
const requireSession = vi.fn()
const findUnique = vi.fn()

vi.mock("@/lib/auth", () => ({
  getSession,
  requireSession,
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
    plant: {
      findUnique,
      findMany: vi.fn(),
    },
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/plant/route")
}

describe("GET /api/plant?qrCode=", () => {
  beforeEach(() => {
    getSession.mockReset()
    requireSession.mockReset()
    findUnique.mockReset()
  })

  it("returns a public scan view for anonymous users", async () => {
    const { GET } = await loadRoute()

    getSession.mockResolvedValue(null)
    findUnique.mockResolvedValue({
      id: "plant_1",
      userId: "owner_1",
      seedType: "Basil",
      stage: "SPROUT",
      createdAt: "2026-03-26T00:00:00.000Z",
      product: {
        id: "product_1",
        name: "Basil Tee",
        slug: "basil-tee",
        seedType: "Basil",
      },
    })

    const response = await GET(
      new Request("http://localhost/api/plant?qrCode=QR-123") as never
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      isOwner: false,
      plant: {
        id: "plant_1",
        seedType: "Basil",
        stage: "SPROUT",
        createdAt: "2026-03-26T00:00:00.000Z",
        product: {
          id: "product_1",
          name: "Basil Tee",
          slug: "basil-tee",
          seedType: "Basil",
        },
      },
    })
  })

  it("still returns the owner dashboard payload when the session belongs to the plant owner", async () => {
    const { GET } = await loadRoute()

    getSession.mockResolvedValue({
      userId: "owner_1",
      email: "grower@example.com",
      role: "USER",
    })
    findUnique
      .mockResolvedValueOnce({
        id: "plant_1",
        userId: "owner_1",
        seedType: "Basil",
        stage: "SPROUT",
        createdAt: "2026-03-26T00:00:00.000Z",
        product: {
          id: "product_1",
          name: "Basil Tee",
          slug: "basil-tee",
          seedType: "Basil",
        },
      })
      .mockResolvedValueOnce({
        id: "plant_1",
        userId: "owner_1",
        seedType: "Basil",
        stage: "SPROUT",
        createdAt: "2026-03-26T00:00:00.000Z",
        product: {
          id: "product_1",
          name: "Basil Tee",
          slug: "basil-tee",
          seedType: "Basil",
        },
        growthLogs: [{ id: "log_1" }],
        reminders: [{ id: "rem_1" }],
      })

    const response = await GET(
      new Request("http://localhost/api/plant?qrCode=QR-123") as never
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      isOwner: true,
      plant: {
        growthLogs: [{ id: "log_1" }],
        reminders: [{ id: "rem_1" }],
      },
    })
  })
})
