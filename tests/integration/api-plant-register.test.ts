import { beforeEach, describe, expect, it, vi } from "vitest"

const requireSession = vi.fn()
const plantFindUnique = vi.fn()
const plantCreate = vi.fn()
const leaderboardUpsert = vi.fn()
const transaction = vi.fn()

vi.mock("@/lib/auth", () => ({
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
      findUnique: plantFindUnique,
    },
    leaderboard: {
      upsert: leaderboardUpsert,
    },
    $transaction: transaction,
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/plant/register/route")
}

describe("POST /api/plant/register", () => {
  beforeEach(() => {
    requireSession.mockReset()
    plantFindUnique.mockReset()
    plantCreate.mockReset()
    leaderboardUpsert.mockReset()
    transaction.mockReset()
    transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
      return cb({
        plant: {
          create: plantCreate,
        },
        leaderboard: {
          upsert: leaderboardUpsert,
        },
      })
    })
  })

  it("creates a plant claim once and awards the registration points", async () => {
    const { POST } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "owner_1",
      email: "grower@example.com",
      role: "USER",
    })
    plantFindUnique.mockResolvedValue(null)
    plantCreate.mockResolvedValue({
      id: "plant_1",
      userId: "owner_1",
      seedType: "Basil",
      qrCode: "QR-123",
      stage: "SEEDED",
      product: null,
      growthLogs: [],
      reminders: [],
    })
    leaderboardUpsert.mockResolvedValue({})

    const response = await POST(
      new Request("http://localhost/api/plant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: "QR-123",
          seedType: "Basil",
        }),
      }) as never
    )

    expect(response.status).toBe(201)
    expect(plantCreate).toHaveBeenCalledTimes(1)
    expect(leaderboardUpsert).toHaveBeenCalledWith({
      where: { userId: "owner_1" },
      update: { points: { increment: 100 } },
      create: { userId: "owner_1", points: 100 },
    })
  })

  it("rejects a duplicate QR claim", async () => {
    const { POST } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "owner_1",
      email: "grower@example.com",
      role: "USER",
    })
    plantFindUnique.mockResolvedValue({
      id: "plant_1",
      userId: "owner_1",
      seedType: "Basil",
      qrCode: "QR-123",
      stage: "SEEDED",
    })

    const response = await POST(
      new Request("http://localhost/api/plant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: "QR-123",
          seedType: "Basil",
        }),
      }) as never
    )

    expect(response.status).toBe(409)
    expect(plantCreate).not.toHaveBeenCalled()
    expect(leaderboardUpsert).not.toHaveBeenCalled()
  })
})
