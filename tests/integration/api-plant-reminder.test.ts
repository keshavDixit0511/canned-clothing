import { beforeEach, describe, expect, it, vi } from "vitest"

const requireSession = vi.fn()
const plantFindFirst = vi.fn()
const reminderFindFirst = vi.fn()
const reminderCreate = vi.fn()

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
    reminder: {
      findFirst: reminderFindFirst,
      create: reminderCreate,
    },
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/plant/reminder/route")
}

describe("POST /api/plant/reminder", () => {
  beforeEach(() => {
    requireSession.mockReset()
    plantFindFirst.mockReset()
    reminderFindFirst.mockReset()
    reminderCreate.mockReset()
  })

  it("rejects reminder writes from users who do not own the plant", async () => {
    const { POST } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "other_user",
      email: "other@example.com",
      role: "USER",
    })
    plantFindFirst.mockResolvedValue(null)

    const response = await POST(
      new Request("http://localhost/api/plant/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "plant_1",
          time: "2026-03-27T08:00:00.000Z",
        }),
      }) as never
    )

    expect(response.status).toBe(404)
    expect(reminderCreate).not.toHaveBeenCalled()
  })
})
