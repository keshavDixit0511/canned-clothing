import { NextRequest, NextResponse } from "next/server"
import { registerUser, loginUser } from "./auth.service"
import { registerSchema, loginSchema } from "./auth.validation"
import { cookies } from "next/headers"

export async function registerController(req: NextRequest) {
  try {

    const body = await req.json()
    const data = registerSchema.parse(body)

    const user = await registerUser(data)

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error: any) {

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )

  }
}

export async function loginController(req: NextRequest) {

  try {

    const body = await req.json()
    const data = loginSchema.parse(body)

    const { user, token } = await loginUser(data)
    const cookieStore = await cookies()
    cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
    })

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error: any) {

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )

  }
}