// app/api/auth/register/route.ts

import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/server/db/prisma"
import { hashPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { registerSchema } from "@/lib/validators"
import { getErrorMessage } from "@/lib/error-message"
import { splitFullName } from "@/lib/profile"

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

    const nameParts = splitFullName(data.name)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        firstName: nameParts.firstName || null,
        lastName: nameParts.lastName || null,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    let clerkSignInToken: string | null = null
    try {
      const clerk = await clerkClient()
      const clerkUsers = await clerk.users.getUserList({
        emailAddress: [user.email],
      })

      const [firstName, ...rest] = (user.name ?? "").trim().split(/\s+/)
      const lastName = rest.join(" ") || undefined

      const clerkUser = clerkUsers.data[0]
        ? await clerk.users.updateUser(clerkUsers.data[0].id, {
            firstName: firstName || undefined,
            lastName,
            password: data.password,
            skipPasswordChecks: true,
          })
        : await clerk.users.createUser({
            emailAddress: [user.email],
            password: data.password,
            firstName: firstName || undefined,
            lastName,
            skipPasswordChecks: true,
          })

      await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkUserId: clerkUser.id,
          firstName: firstName || null,
          lastName: lastName || null,
        },
      })

      const signInToken = await clerk.signInTokens.createSignInToken({
        userId: clerkUser.id,
        expiresInSeconds: 600,
      })

      clerkSignInToken = signInToken.token
    } catch (clerkError) {
      console.warn("CLERK_REGISTER_BRIDGE_FAILED", clerkError)
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        token: signToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          authProvider: "local",
        }),
        clerkSignInToken,
        user,
      },
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
