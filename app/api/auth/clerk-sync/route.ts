import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/server/db/prisma"
import { hashPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { getDisplayName, splitFullName } from "@/lib/profile"

type ExistingUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string
  image: string | null
}

function getClerkEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    ""
  )
}

function buildUpdateData(
  user: Awaited<ReturnType<typeof currentUser>>,
  existing: ExistingUser | null
) {
  const nameFromClerk = getDisplayName({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: getClerkEmail(user),
  })
  const clerkNameParts = splitFullName(nameFromClerk)

  return {
    clerkUserId: user?.id,
    email: getClerkEmail(user),
    name: existing?.name?.trim() ? existing.name : nameFromClerk,
    firstName: existing?.firstName?.trim()
      ? existing.firstName
      : user?.firstName?.trim() || clerkNameParts.firstName || null,
    lastName: existing?.lastName?.trim()
      ? existing.lastName
      : user?.lastName?.trim() || clerkNameParts.lastName || null,
    image: user?.imageUrl ?? existing?.image ?? null,
  }
}

export async function POST() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const email = getClerkEmail(clerkUser)

    if (!email) {
      return NextResponse.json(
        { error: "Clerk user does not have an email address" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ clerkUserId: userId }, { email }],
      },
    })

    const identity = buildUpdateData(clerkUser, existing)

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            clerkUserId: identity.clerkUserId,
            email: identity.email,
            name: identity.name,
            firstName: identity.firstName,
            lastName: identity.lastName,
            image: identity.image,
          },
          select: {
            id: true,
            clerkUserId: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            role: true,
            onboardingCompleted: true,
          },
        })
      : await prisma.user.create({
          data: {
            clerkUserId: userId,
            name: identity.name,
            firstName: identity.firstName,
            lastName: identity.lastName,
            email: identity.email,
            image: identity.image,
            password: await hashPassword(`clerk:${userId}:${crypto.randomUUID()}`),
          },
          select: {
            id: true,
            clerkUserId: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            role: true,
            onboardingCompleted: true,
          },
        })

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      authProvider: "clerk",
      clerkUserId: userId,
    })

    const response = NextResponse.json({
      message: "Clerk session synced",
      user,
      needsOnboarding: !user.onboardingCompleted,
    })

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("CLERK_SYNC_ERROR", error)
    return NextResponse.json(
      { error: "Failed to sync Clerk session" },
      { status: 500 }
    )
  }
}
