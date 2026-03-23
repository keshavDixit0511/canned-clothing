import { prisma } from "@/server/db/prisma"
import { hashPassword, comparePassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { RegisterInput, LoginInput } from "./auth.types"

export async function registerUser(data: RegisterInput) {

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword
    }
  })

  return user
}

export async function loginUser(data: LoginInput) {

  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const validPassword = await comparePassword(
    data.password,
    user.password
  )

  if (!validPassword) {
    throw new Error("Invalid credentials")
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  return { user, token }
}