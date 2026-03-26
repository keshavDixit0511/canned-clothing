import { beforeEach, describe, expect, it, vi } from "vitest"

const requireSession = vi.fn()
const plantFindFirst = vi.fn()
const growthCreate = vi.fn()
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
      findFirst: plantFindFirst,
    },
    growthLog: {
      create: growthCreate,
    },
    leaderboard: {
      upsert: leaderboardUpsert,
    },
    $transaction: transaction,
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/plant/log/route")
}

describe("POST /api/plant/log", () => {
  beforeEach(() => {
    requireSession.mockReset()
    plantFindFirst.mockReset()
    growthCreate.mockReset()
    leaderboardUpsert.mockReset()
    transaction.mockReset()
    transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
      return cb({
        growthLog: {
          create: growthCreate,
        },
        leaderboard: {
          upsert: leaderboardUpsert,
        },
      })
    })
  })

  it("requires authentication before logging growth", async () => {
    const { POST } = await loadRoute()

    requireSession.mockRejectedValue({ message: "Unauthorized", status: 401 })

    const response = await POST(
      new Request("http://localhost/api/plant/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "plant_1",
          note: "New leaf today",
        }),
      }) as never
    )

    expect(response.status).toBe(401)
    expect(plantFindFirst).not.toHaveBeenCalled()
    expect(growthCreate).not.toHaveBeenCalled()
  })

  it("rejects empty growth logs and only awards points for valid content", async () => {
    const { POST } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "owner_1",
      email: "grower@example.com",
      role: "USER",
    })

    const response = await POST(
      new Request("http://localhost/api/plant/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "plant_1",
        }),
      }) as never
    )

    expect(response.status).toBe(400)
    expect(plantFindFirst).not.toHaveBeenCalled()
    expect(growthCreate).not.toHaveBeenCalled()
    expect(leaderboardUpsert).not.toHaveBeenCalled()
  })

  it("logs valid growth entries and awards points once", async () => {
    const { POST } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "owner_1",
      email: "grower@example.com",
      role: "USER",
    })
    plantFindFirst.mockResolvedValue({
      id: "plant_1",
      userId: "owner_1",
    })
    growthCreate.mockResolvedValue({
      id: "log_1",
      plantId: "plant_1",
      userId: "owner_1",
      note: "New leaves",
      image: null,
      createdAt: "2026-03-26T00:00:00.000Z",
    })
    leaderboardUpsert.mockResolvedValue({})

    const response = await POST(
      new Request("http://localhost/api/plant/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "plant_1",
          note: "New leaves",
        }),
      }) as never
    )

    expect(response.status).toBe(201)
    expect(growthCreate).toHaveBeenCalledTimes(1)
    expect(leaderboardUpsert).toHaveBeenCalledWith({
      where: { userId: "owner_1" },
      update: { points: { increment: 25 } },
      create: { userId: "owner_1", points: 25 },
    })
  })
})
