// app/api/auth/register/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { hashPassword } from "@/lib/auth/password"
import { registerSchema } from "@/lib/validators"
import { getErrorMessage } from "@/lib/error-message"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("REGISTER_ERROR", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Invalid request") },
      { status: 400 }
    )
  }
}
