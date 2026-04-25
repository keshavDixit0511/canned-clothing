// app/api/auth/login/route.ts

import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/server/db/prisma"
import { comparePassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { loginSchema } from "@/lib/validators"
import { getErrorMessage } from "@/lib/error-message"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const valid = await comparePassword(data.password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      authProvider: "local",
    })

    let clerkSignInToken: string | null = null
    try {
      const clerk = await clerkClient()
      const clerkUsers = await clerk.users.getUserList({
        emailAddress: [user.email],
      })
      const nameParts = (user.name ?? "").trim().split(/\s+/).filter(Boolean)
      const firstName = nameParts[0] || undefined
      const lastName = nameParts.slice(1).join(" ") || undefined

      const clerkUser = clerkUsers.data[0]
        ? await clerk.users.updateUser(clerkUsers.data[0].id, {
            firstName,
            lastName,
            password: data.password,
            skipPasswordChecks: true,
          })
        : await clerk.users.createUser({
            emailAddress: [user.email],
            password: data.password,
            firstName,
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
      console.warn("CLERK_LOGIN_BRIDGE_FAILED", clerkError)
    }

    const res = NextResponse.json({
      message: "Login successful",
      token,
      clerkSignInToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    })

    // NOTE: cookie name is "token" — consistent with all other routes
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (error: unknown) {
    console.error("LOGIN_ERROR", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Invalid request") },
      { status: 400 }
    )
  }
}
