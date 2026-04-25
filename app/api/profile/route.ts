import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/server/db/prisma"
import { getSession, requireSession, isAuthError } from "@/lib/auth"
import { getDisplayName, splitFullName } from "@/lib/profile"
import { profileUpdateSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  response.headers.set("Vary", "Cookie")
  return response
}

function normalizeUserRow(user: {
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string
  image: string | null
  role: string
  gender: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  country: string | null
  pincode: string | null
  onboardingCompleted: boolean
  clerkUserId?: string | null
}, authProvider: "local" | "clerk") {
  return {
    ...user,
    name: getDisplayName({
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }),
    authProvider,
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession(req)
    if (!session) {
      return noStoreJson({
        name: null,
        firstName: null,
        lastName: null,
        email: null,
        image: null,
        role: null,
        gender: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        country: null,
        pincode: null,
        onboardingCompleted: false,
        authProvider: null,
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        gender: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        onboardingCompleted: true,
      },
    })

    if (user) {
      return noStoreJson(normalizeUserRow(user, session.authProvider ?? "local"))
    }

    if (session.authProvider === "clerk") {
      const clerkUser = await currentUser()
      if (clerkUser) {
        const email =
          clerkUser.primaryEmailAddress?.emailAddress ??
          clerkUser.emailAddresses[0]?.emailAddress ??
          null
        const displayName = getDisplayName({
          firstName: clerkUser.firstName ?? "",
          lastName: clerkUser.lastName ?? "",
          email,
        })
        const clerkNameParts = splitFullName(displayName)

        return noStoreJson({
          name: displayName,
          firstName: clerkUser.firstName ?? clerkNameParts.firstName ?? null,
          lastName: clerkUser.lastName ?? clerkNameParts.lastName ?? null,
          email,
          image: clerkUser.imageUrl ?? null,
          role: "USER",
          gender: null,
          addressLine1: null,
          addressLine2: null,
          city: null,
          state: null,
          country: null,
          pincode: null,
          onboardingCompleted: false,
          authProvider: "clerk",
        })
      }
    }

    return noStoreJson({
      name: null,
      firstName: null,
      lastName: null,
      email: null,
      image: null,
      role: null,
      gender: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      state: null,
      country: null,
      pincode: null,
      onboardingCompleted: false,
      authProvider: session.authProvider ?? null,
    })
  } catch {
    return noStoreJson({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = await requireSession(req)
    const body = await req.json()
    const data = profileUpdateSchema.parse(body)

    const current = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        gender: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        onboardingCompleted: true,
      },
    })

    if (!current) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const derivedName = data.name?.trim()
      || getDisplayName({
        firstName: data.firstName ?? current.firstName,
        lastName: data.lastName ?? current.lastName,
        email: current.email,
        fallback: current.name ?? "ESTHETIQUE User",
      })

    const hasOnboardingPayload =
      "onboardingCompleted" in data && data.onboardingCompleted === true

    if (hasOnboardingPayload) {
      const requiredFields = [
        data.firstName ?? current.firstName,
        data.lastName ?? current.lastName,
        data.gender ?? current.gender,
        data.addressLine1 ?? current.addressLine1,
        data.city ?? current.city,
        data.state ?? current.state,
        data.country ?? current.country,
        data.pincode ?? current.pincode,
      ]

      if (requiredFields.some((value) => !value || !String(value).trim())) {
        return NextResponse.json(
          { error: "Please complete all profile details before continuing" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: derivedName,
        firstName: data.firstName ?? current.firstName ?? splitFullName(derivedName).firstName,
        lastName: data.lastName ?? current.lastName ?? splitFullName(derivedName).lastName,
        gender: data.gender ?? current.gender,
        addressLine1: data.addressLine1 ?? current.addressLine1,
        addressLine2: data.addressLine2 ?? current.addressLine2,
        city: data.city ?? current.city,
        state: data.state ?? current.state,
        country: data.country ?? current.country,
        pincode: data.pincode ?? current.pincode,
        onboardingCompleted: hasOnboardingPayload
          ? true
          : current.onboardingCompleted,
      },
      select: {
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        gender: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        onboardingCompleted: true,
      },
    })

    return NextResponse.json({
      ...updated,
      authProvider: payload.authProvider ?? "local",
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
