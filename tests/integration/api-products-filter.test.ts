import { beforeEach, describe, expect, it, vi } from "vitest"

const findMany = vi.fn()

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    product: {
      findMany,
    },
  },
}))

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/products/route")
}

describe("GET /api/products", () => {
  beforeEach(() => {
    findMany.mockReset()
  })

  it("composes search, activity, seedType, sort, and pagination into one Prisma query", async () => {
    const { GET } = await loadRoute()
    findMany.mockResolvedValue([])

    const request = new Request(
      "http://localhost/api/products?search=tee&activity=daily&seedType=Basil&sort=name_asc&page=2&limit=5"
    )

    const response = await GET(request as never)

    expect(response.status).toBe(200)
    expect(findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "tee", mode: "insensitive" } },
          { description: { contains: "tee", mode: "insensitive" } },
        ],
        activity: { equals: "daily", mode: "insensitive" },
        seedType: { equals: "Basil", mode: "insensitive" },
      },
      orderBy: { name: "asc" },
      skip: 5,
      take: 5,
      include: {
        images: { orderBy: { order: "asc" } },
      },
    })
  })
})
