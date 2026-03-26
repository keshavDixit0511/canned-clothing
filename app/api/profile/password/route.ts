import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireSession, isAuthError } from "@/lib/auth"
import { comparePassword, hashPassword } from "@/lib/auth/password"
import { changePasswordSchema } from "@/lib/validators"
import { apiError } from "@/lib/api-response"
import { getErrorMessage } from "@/lib/error-message"
import { ZodError } from "zod"

type PasswordUpdateResponse = {
  message: string
}

async function handlePasswordUpdate(req: Request) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = changePasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, password: true },
    })

    if (!user) {
      return apiError("User not found", 404, "USER_NOT_FOUND")
    }

    const isCurrentPasswordValid = await comparePassword(
      data.currentPassword,
      user.password
    )

    if (!isCurrentPasswordValid) {
      return apiError(
        "Current password is incorrect",
        400,
        "INVALID_CURRENT_PASSWORD"
      )
    }

    const nextPasswordHash = await hashPassword(data.newPassword)

    await prisma.user.update({
      where: { id: session.userId },
      data: { password: nextPasswordHash },
    })

    return NextResponse.json<PasswordUpdateResponse>({
      message: "Password updated successfully",
    })
  } catch (error) {
    if (isAuthError(error)) {
      return apiError(error.message, error.status, "UNAUTHORIZED")
    }

    if (error instanceof ZodError || error instanceof SyntaxError) {
      return apiError(
        getErrorMessage(error, "Invalid request"),
        400,
        "INVALID_REQUEST"
      )
    }

    console.error("PROFILE_PASSWORD_UPDATE_ERROR", error)
    return apiError(
      "Failed to update password",
      500,
      "PASSWORD_UPDATE_FAILED"
    )
  }
}

export { handlePasswordUpdate as PATCH }
