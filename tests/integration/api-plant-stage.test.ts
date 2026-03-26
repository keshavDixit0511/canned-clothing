import { beforeEach, describe, expect, it, vi } from "vitest"

const requireSession = vi.fn()
const findUnique = vi.fn()
const updateMany = vi.fn()
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
      findUnique,
    },
    leaderboard: {
      upsert: leaderboardUpsert,
    },
    $transaction: transaction,
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/plant/route")
}

describe("PATCH /api/plant", () => {
  beforeEach(() => {
    requireSession.mockReset()
    findUnique.mockReset()
    updateMany.mockReset()
    leaderboardUpsert.mockReset()
    transaction.mockReset()
    transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
      return cb({
        plant: {
          updateMany,
          findUnique,
        },
        leaderboard: {
          upsert: leaderboardUpsert,
        },
      })
    })
  })

  it("allows a valid one-step stage progression and awards the matching points once", async () => {
    const { PATCH } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "owner_1",
      email: "grower@example.com",
      role: "USER",
    })
    findUnique
      .mockResolvedValueOnce({
        id: "plant_1",
        userId: "owner_1",
        stage: "SEEDED",
      })
      .mockResolvedValueOnce({
        id: "plant_1",
        userId: "owner_1",
        stage: "SPROUT",
        product: null,
        growthLogs: [],
      })
    updateMany.mockResolvedValue({ count: 1 })
    leaderboardUpsert.mockResolvedValue({})

    const response = await PATCH(
      new Request("http://localhost/api/plant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "plant_1",
          stage: "SPROUT",
        }),
      }) as never
    )

    expect(response.status).toBe(200)
    expect(updateMany).toHaveBeenCalledTimes(1)
    expect(leaderboardUpsert).toHaveBeenCalledWith({
      where: { userId: "owner_1" },
      update: { points: { increment: 10 } },
      create: { userId: "owner_1", points: 10 },
    })
  })

  it("rejects replayed or skipped stage transitions", async () => {
    const { PATCH } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "owner_1",
      email: "grower@example.com",
      role: "USER",
    })
    findUnique.mockResolvedValue({
      id: "plant_1",
      userId: "owner_1",
      stage: "SPROUT",
    })

    const response = await PATCH(
      new Request("http://localhost/api/plant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "plant_1",
          stage: "SPROUT",
        }),
      }) as never
    )

    expect(response.status).toBe(409)
    expect(updateMany).not.toHaveBeenCalled()
    expect(leaderboardUpsert).not.toHaveBeenCalled()
  })

  it("blocks non-owners from changing a plant stage", async () => {
    const { PATCH } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "other_user",
      email: "other@example.com",
      role: "USER",
    })
    findUnique.mockResolvedValue({
      id: "plant_1",
      userId: "owner_1",
      stage: "SEEDED",
    })

    const response = await PATCH(
      new Request("http://localhost/api/plant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "plant_1",
          stage: "SPROUT",
        }),
      }) as never
    )

    expect(response.status).toBe(403)
    expect(updateMany).not.toHaveBeenCalled()
  })
})
