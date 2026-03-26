import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { middleware } from "@/middleware"

describe("middleware QR routing", () => {
  it("allows public scan pages without a token", () => {
    const response = middleware(new NextRequest("http://localhost/scan/abc123"))
    expect(response.headers.get("location")).toBeNull()
    expect(response.status).toBe(200)
  })

  it("still protects dashboard pages without a token", () => {
    const response = middleware(new NextRequest("http://localhost/dashboard/plants"))
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/login?redirect=%2Fdashboard%2Fplants")
  })
})
