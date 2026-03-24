// // app/api/profile/route.ts
// import { NextResponse } from "next/server"
// import { prisma } from "@/server/db/prisma"
// import { getSession } from "@/lib/auth"

// export async function GET() {
//   try {
//     const session = await getSession()
//     if (!session) {
//       return NextResponse.json({ name: null, image: null })
//     }

//     const user = await prisma.user.findUnique({
//       where:  { id: session.userId },
//       select: { name: true, image: true },
//     })

//     if (!user) {
//       return NextResponse.json({ name: null, image: null })
//     }

//     return NextResponse.json({ name: user.name, image: user.image })
//   } catch (err) {
//     console.error("[profile GET]", err)
//     return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
//   }
// }




// app/api/profile/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireSession, getSession, isAuthError } from "@/lib/auth"

export const dynamic = "force-dynamic"

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  response.headers.set("Vary", "Cookie")
  return response
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return noStoreJson({ name: null, image: null })
    }

    const user = await prisma.user.findUnique({
      where:  { id: session.userId },
      select: { name: true, email: true, image: true, role: true },
    })

    if (!user) return noStoreJson({ name: null, image: null })

    return noStoreJson(user)
  } catch {
    return noStoreJson({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = await requireSession()
    const body    = await req.json()
    const { name } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where:  { id: payload.userId },
      data:   { name: name.trim() },
      select: { name: true, email: true, image: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
