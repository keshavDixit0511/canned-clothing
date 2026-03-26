import { beforeEach, describe, expect, it, vi } from "vitest"

const requireSession = vi.fn()
const comparePassword = vi.fn()
const hashPassword = vi.fn()
const findUnique = vi.fn()
const update = vi.fn()

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

vi.mock("@/lib/auth/password", () => ({
  comparePassword,
  hashPassword,
}))

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      findUnique,
      update,
    },
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/profile/password/route")
}

describe("PATCH /api/profile/password", () => {
  beforeEach(() => {
    requireSession.mockReset()
    comparePassword.mockReset()
    hashPassword.mockReset()
    findUnique.mockReset()
    update.mockReset()
  })

  it("updates the password after verifying the current password", async () => {
    const { PATCH } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "user_123",
      email: "grower@example.com",
      role: "USER",
    })
    findUnique.mockResolvedValue({
      id: "user_123",
      password: "stored-hash",
    })
    comparePassword.mockResolvedValue(true)
    hashPassword.mockResolvedValue("new-hash")
    update.mockResolvedValue({ id: "user_123" })

    const response = await PATCH(
      new Request("http://localhost/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: "old-password",
          newPassword: "new-password-123",
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(comparePassword).toHaveBeenCalledWith("old-password", "stored-hash")
    expect(hashPassword).toHaveBeenCalledWith("new-password-123")
    expect(update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { password: "new-hash" },
    })
    await expect(response.json()).resolves.toEqual({
      message: "Password updated successfully",
    })
  })

  it("rejects an incorrect current password without updating the user", async () => {
    const { PATCH } = await loadRoute()

    requireSession.mockResolvedValue({
      userId: "user_123",
      email: "grower@example.com",
      role: "USER",
    })
    findUnique.mockResolvedValue({
      id: "user_123",
      password: "stored-hash",
    })
    comparePassword.mockResolvedValue(false)

    const response = await PATCH(
      new Request("http://localhost/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: "wrong-password",
          newPassword: "new-password-123",
        }),
      })
    )

    expect(response.status).toBe(400)
    expect(hashPassword).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      error: "Current password is incorrect",
      code: "INVALID_CURRENT_PASSWORD",
    })
  })
})
